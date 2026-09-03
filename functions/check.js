import { connect } from 'cloudflare:sockets';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  const url = new URL(context.request.url);
  const hdrs = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  };
  
  if (url.searchParams.get('ping') === '1') {
    return new Response(JSON.stringify({ pong: true }), { headers: hdrs });
  }
  
  const server = (url.searchParams.get('server') || '').replace(/\.+$/, '').trim();
  const port = parseInt(url.searchParams.get('port') || '0', 10);
  
  if (!server || port < 1 || port > 65535) {
    return new Response(JSON.stringify({ up: false, lat: 0 }), { headers: hdrs });
  }
  
  const t0 = Date.now();
  let sock = null;
  
  try {
    sock = connect({ hostname: server, port }, { secureTransport: 'off' });
    const writer = sock.writable.getWriter();
    const reader = sock.readable.getReader();
    
    // 1. انتظار فتح الاتصال (بحد أقصى 2.5 ثانية)
    await Promise.race([
      writer.ready,
      new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 2500))
    ]);
    const tcpLat = Date.now() - t0;
    
    // 2. إرسال بيانات عشوائية لاستفزاز البروكسي (MTProto proxy سيرفضها فوراً)
    const dummy = new Uint8Array([0xef, 0xef, 0xef, 0xef, 0xef, 0xef, 0xef, 0xef]);
    await writer.write(dummy);
    
    // 3. قراءة استجابة السيرفر (الخطوة الأهم)
    // السيرفر الميت/المحجوب سيظل صامتاً. البروكسي الحقيقي سيغلق الاتصال فوراً لأنه بروتوكول خاطئ.
    const readResult = await Promise.race([
      reader.read(),
      new Promise(res => setTimeout(() => res({ isHoneypot: true }), 1500))
    ]);
    
    writer.releaseLock();
    reader.releaseLock();
    
    // إذا لم يستجب السيرفر وابتلع البيانات، فهو سيرفر وهمي أو جدار حماية
    if (readResult.isHoneypot) {
      throw new Error('Dead Server');
    }
    
    // إذا استجاب أو أغلق الاتصال بنجاح، فهو بروكسي حيّ
    return new Response(JSON.stringify({ up: true, lat: tcpLat }), { headers: hdrs });
    
  } catch (e) {
    return new Response(JSON.stringify({ up: false, lat: 4500 }), { headers: hdrs });
  } finally {
    if (sock) sock.close().catch(() => {});
  }
}