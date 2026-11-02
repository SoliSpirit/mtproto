# 🌐 Fresh MTProto Proxies – Auto-updated Every 12 Hours

Looking for fresh, working Telegram MTProto proxies?  
This repository provides an always-up-to-date list of free MTProto proxies that you can use to bypass censorship and connect to Telegram with privacy and speed.

> **✅ File:** [`all_proxies.txt`](https://raw.githubusercontent.com/SoliSpirit/mtproto/master/all_proxies.txt)  
> **🕒 Updated:** Automatically every 12 hours

---

## 📄 What's Inside?

- A simple text file: `all_proxies.txt`
- Each line contains a working MTProto proxy in standard format
- No clutter, no ads – just clean proxy addresses ready to use

Example line:
tg://proxy?server=example.com&port=443&secret=ee00000000000000000000000000000000000000


---

## 🔄 Auto Update System

This proxy list is generated and pushed by a bot every **12 hours** using a custom script.  
The script scans for publicly available proxies and verifies them before publishing.

---

## 💡 How to Use MTProto Proxies?

1. Copy a line from `all_proxies.txt`
2. Open it on your phone or desktop browser
3. Telegram will automatically offer to connect using the proxy

You can also manually paste the proxy link into Telegram's "Data and Storage" settings under "Proxy".

---

## 🛠️ How to Double Check Available Proxies with `check_proxies.sh`

The `check_proxies.sh` script checks every proxy from `all_proxies.txt` and saves only the reachable ones to `available_proxies.txt`.

### Usage

1. Make the script executable:

```bash
chmod +x check_proxies.sh
```

2. Run it:

```bash
./check_proxies.sh
```

3. After it finishes, working proxies will be in `available_proxies.txt`:

```bash
cat available_proxies.txt
```

### Example output

```text
Available: 1.2.3.4:443
Unavailable: 5.6.7.8:8443
Done. Working proxies written to available_proxies.txt.
Proxy list:
...
```

---

## ☕ Support

If you find this useful, consider giving the repo a ⭐️  

- [English](README.md)
- [中文](README_CN.md)
- [Русский](README_RU.md)
- [فارسی](README_FA.md)
