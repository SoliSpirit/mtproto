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

  const TIMEOUT = 4000;
  const t0 = Date.now();
  let sock = null;

  try {
    sock = connect({ hostname: server, port }, { secureTransport: 'off' });
    const writer = sock.writable.getWriter();
    
    // الانتظار حتى يتم فتح اتصال TCP بنجاح
    await writer.ready;
    const tcpLat = Date.now() - t0; // زمن الوصول الأولي

    // إرسال حمولة وهمية (Fake Payload) لإجبار البروكسي على كشف حالته
    // البروكسي الوهمي أو الميت لن يستطيع التعامل مع هذه البيانات
    const payload = new TextEncoder().encode("GET / HTTP/1.1\r\nHost: " + server + "\r\n\r\n");
    await writer.write(payload);

    // ننتظر قليلاً للتأكد من أن السيرفر لم يقطع الاتصال فوراً (RST)
    await new Promise(res => setTimeout(res, 50));
    writer.releaseLock();

    return new Response(JSON.stringify({ up: true, lat: tcpLat }), { headers: hdrs });
  } catch (e) {
    // إذا فشل الاتصال أو رفض السيرفر الحمولة، فهو بروكسي لا يعمل
    return new Response(JSON.stringify({ up: false, lat: 4500 }), { headers: hdrs });
  } finally {
    if (sock) sock.close().catch(() => {});
  }
}