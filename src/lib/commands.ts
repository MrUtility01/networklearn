export interface CommandResult {
  output: string;
  isError?: boolean;
}

const OSI_LAYERS: Record<number, { name: string; pdu: string; desc: string }> = {
  7: { name: 'Application', pdu: 'Data', desc: 'رابط کاربر و اپلیکیشن (HTTP, DNS, FTP, SMTP)' },
  6: { name: 'Presentation', pdu: 'Data', desc: 'رمزنگاری، فشرده‌سازی و ترجمه فرمت' },
  5: { name: 'Session', pdu: 'Data', desc: 'مدیریت نشست و دیالوگ بین سیستم‌ها' },
  4: { name: 'Transport', pdu: 'Segment/Datagram', desc: 'TCP (قابل‌اطمینان) و UDP (سریع) — پورت‌ها' },
  3: { name: 'Network', pdu: 'Packet', desc: 'آدرس‌دهی منطقی (IP) و مسیریابی' },
  2: { name: 'Data Link', pdu: 'Frame', desc: 'آدرس MAC، سوییچینگ، تشخیص خطا (FCS)' },
  1: { name: 'Physical', pdu: 'Bits', desc: 'سیگنال الکتریکی/نوری، کابل، کانکتور، سرعت' },
};

export function runCommand(raw: string): CommandResult {
  const input = raw.trim();
  if (!input) return { output: '' };

  const parts = input.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (cmd) {
    case 'help':
    case '?':
      return {
        output: `
دستورات موجود در NetworkLearn Lab:

  help                 — این راهنما
  clear                — پاک کردن صفحه
  about-network        — خلاصه مفاهیم پایه شبکه
  osi [شماره]          — مدل OSI (یا جزئیات یک لایه)
  packet-journey       — مسیر حرکت یک بسته
  show-mac             — جدول MAC نمونه
  switch-behavior      — رفتار سوییچ (Learn/Forward/Flood)
  domains              — Collision vs Broadcast Domain
  subnet <net> <hosts> — محاسبه ساب‌نت
  private-ranges       — محدوده‌های خصوصی RFC1918
  arp                  — جدول ARP نمونه
  arp-how              — توضیح فرآیند ARP
  tcp-handshake        — Three-way Handshake
  dns-records          — انواع رکورد DNS
  dig <domain>         — شبیه‌سازی dig
  dhcp-dora            — فرآیند DHCP (DORA)
  security-zones       — Zoneهای امنیتی سازمانی
  ping <host>          — شبیه‌سازی ping
  traceroute <host>    — شبیه‌سازی traceroute
  ip addr              — نمایش اینترفیس‌ها
  whoami               — هویت فعلی لاب
`.trim(),
      };

    case 'clear':
      return { output: '__CLEAR__' };

    case 'about-network':
      return {
        output: `
🌐 مفاهیم پایه شبکه
────────────────────
• LAN  : شبکه محلی (دفتر، خانه) — سرعت بالا، تأخیر کم
• WAN  : شبکه گسترده (بین شهرها/کشورها) — معمولاً از ISP
• MAN  : شبکه شهری
• Intranet : شبکه داخلی سازمان
• Extranet : دسترسی کنترل‌شده شرکا به بخشی از Intranet
• Internet : شبکه عمومی جهانی

مدل‌های مرجع:
• OSI   → ۷ لایه (مفهومی)
• TCP/IP → ۴ لایه (عملی و اینترنت)
`.trim(),
      };

    case 'osi': {
      if (args[0]) {
        const n = parseInt(args[0], 10);
        const layer = OSI_LAYERS[n];
        if (!layer) return { output: 'لایه باید بین ۱ تا ۷ باشد.', isError: true };
        return {
          output: `لایه ${n}: ${layer.name}\nPDU: ${layer.pdu}\n${layer.desc}`,
        };
      }
      let out = 'مدل OSI — هفت لایه (از بالا به پایین):\n\n';
      for (let i = 7; i >= 1; i--) {
        const l = OSI_LAYERS[i];
        out += `  ${i}. ${l.name.padEnd(14)}  [${l.pdu}]\n`;
      }
      out += '\nبرای جزئیات: osi <شماره لایه>  مثال: osi 3';
      return { output: out };
    }

    case 'packet-journey':
      return {
        output: `
مسیر یک بسته از App تا کابل (Encapsulation):

  7 Application   → داده کاربر (مثلاً HTTP GET)
  6 Presentation  → رمزنگاری / فشرده‌سازی
  5 Session       → شناسه نشست
  4 Transport     → + TCP/UDP Header (پورت مبدأ/مقصد)
  3 Network       → + IP Header (IP مبدأ/مقصد)
  2 Data Link     → + Ethernet Header (MAC) + FCS
  1 Physical      → بیت‌ها روی کابل / فیبر / بی‌سیم

در مقصد دقیقاً برعکس انجام می‌شود (Decapsulation).
`.trim(),
      };

    case 'show-mac':
      return {
        output: `
VLAN  MAC Address        Type       Ports
----  -----------------  ---------  -----
1     aa:bb:cc:11:22:33  DYNAMIC    Gi0/1
1     aa:bb:cc:44:55:66  DYNAMIC    Gi0/2
1     aa:bb:cc:77:88:99  STATIC     Gi0/24
10    00:1a:2b:3c:4d:5e  DYNAMIC    Gi0/10

Total entries: 4
`.trim(),
      };

    case 'switch-behavior':
      return {
        output: `
رفتار سوییچ با فریم ورودی:

1. Learning  : Source MAC + پورت ورودی → جدول CAM
2. اگر Destination MAC در جدول باشد → Forward فقط به آن پورت
3. اگر نباشد → Flood به همه پورت‌ها (به جز ورودی)
4. اگر Destination = Source port باشد → Filter (دور انداختن)

نکته: Broadcast و Unknown Unicast همیشه Flood می‌شوند.
`.trim(),
      };

    case 'domains':
      return {
        output: `
Collision Domain vs Broadcast Domain

• Collision Domain:
  - هر پورت سوییچ یک Collision Domain جدا است
  - در هاب همه پورت‌ها یک Collision Domain مشترک دارند

• Broadcast Domain:
  - کل یک VLAN یک Broadcast Domain است
  - روتر (لایه ۳) Broadcast Domain را جدا می‌کند

نتیجه: سوییچ Collision را جدا می‌کند، روتر/L3 Broadcast را.
`.trim(),
      };

    case 'subnet': {
      if (args.length < 2) {
        return { output: 'استفاده: subnet <network/mask> <hosts>\nمثال: subnet 192.168.10.0/24 50', isError: true };
      }
      const hosts = parseInt(args[1], 10);
      if (isNaN(hosts) || hosts < 1) return { output: 'تعداد هاست نامعتبر است.', isError: true };
      let hostBits = 1;
      while (Math.pow(2, hostBits) - 2 < hosts) hostBits++;
      const newMask = 32 - hostBits;
      const usable = Math.pow(2, hostBits) - 2;
      return {
        output: `
محاسبه ساب‌نت برای ${hosts} هاست:

  شبکه ورودی   : ${args[0]}
  بیت هاست لازم : ${hostBits}
  ماسک جدید    : /${newMask}
  هاست قابل‌استفاده : ${usable}
  (۲^${hostBits} - ۲ = ${usable})

نکته: همیشه ۲ آدرس برای Network و Broadcast رزرو می‌شود.
`.trim(),
      };
    }

    case 'private-ranges':
      return {
        output: `
آدرس‌های خصوصی (RFC 1918):

  10.0.0.0/8        → 10.0.0.0 – 10.255.255.255
  172.16.0.0/12     → 172.16.0.0 – 172.31.255.255
  192.168.0.0/16    → 192.168.0.0 – 192.168.255.255

APIPA (Link-Local):
  169.254.0.0/16    → وقتی DHCP در دسترس نباشد

Loopback:
  127.0.0.0/8
`.trim(),
      };

    case 'arp':
      return {
        output: `
Address                  HWtype  HWaddress           Flags Mask  Iface
192.168.1.1              ether   aa:bb:cc:dd:ee:01   C         eth0
192.168.1.10             ether   11:22:33:44:55:66   C         eth0
192.168.1.254            ether   ff:ee:dd:cc:bb:aa   C         eth0
`.trim(),
      };

    case 'arp-how':
      return {
        output: `
فرآیند ARP:

1. هاست A می‌خواهد به IPِ B در همان subnet برسد ولی MAC آن را ندارد.
2. A یک ARP Request به صورت Broadcast می‌فرستد:
   «چه کسی 192.168.1.10 است؟ به aa:bb:cc:... بگو»
3. فقط صاحب آن IP (B) با ARP Reply Unicast پاسخ می‌دهد.
4. A جدول ARP خود را به‌روز می‌کند و فریم را می‌فرستد.

خطر: ARP Spoofing / Poisoning — مهاجم Reply جعلی می‌فرستد.
`.trim(),
      };

    case 'tcp-handshake':
      return {
        output: `
TCP Three-way Handshake:

  Client                    Server
    |                         |
    |------- SYN ------------>|
    |                         |
    |<---- SYN + ACK ---------|
    |                         |
    |------- ACK ------------>|
    |                         |
    |   اتصال برقرار شد      |

• SYN : همگام‌سازی شماره توالی
• ACK : تأیید دریافت
• پس از این مرحله داده‌ها می‌توانند رد و بدل شوند.
`.trim(),
      };

    case 'dns-records':
      return {
        output: `
انواع رکورد DNS رایج:

  A      → IPv4 آدرس
  AAAA   → IPv6 آدرس
  CNAME  → نام مستعار (Alias)
  MX     → سرور ایمیل (اولویت + دامنه)
  NS     → Name Server مسئول Zone
  PTR    → Reverse DNS (IP → نام)
  TXT    → متن آزاد (SPF, DKIM, تأییدیه)
  SOA    → Start of Authority
  SRV    → سرویس (مثلاً SIP, LDAP)
`.trim(),
      };

    case 'dig': {
      const domain = args[0] || 'example.com';
      return {
        output: `
; <<>> DiG 9.18 <<>> ${domain}
;; QUESTION SECTION:
;${domain}.                    IN      A

;; ANSWER SECTION:
${domain}.             300     IN      A       93.184.216.34

;; Query time: 12 msec
;; SERVER: 8.8.8.8#53
;; MSG SIZE  rcvd: 56
`.trim(),
      };
    }

    case 'dhcp-dora':
      return {
        output: `
فرآیند DHCP — DORA:

  1. Discover  (Broadcast)  کلاینت: «کسی DHCP سرور هست؟»
  2. Offer     (Unicast/Broadcast) سرور: «این IP را پیشنهاد می‌دهم»
  3. Request   (Broadcast)  کلاینت: «همین IP را می‌خواهم»
  4. Acknowledge (Unicast) سرور: «تأیید شد — Lease فعال است»

گزینه‌های رایج: Gateway، DNS، Domain، NTP، Lease Time
`.trim(),
      };

    case 'security-zones':
      return {
        output: `
Zoneهای امنیتی پیشنهادی سازمانی:

  • Users        — کلاینت‌های کارکنان
  • Servers      — سرورهای داخلی (AD, File, App)
  • Voice        — تلفن IP و تماس
  • CCTV / IoT   — دوربین و دستگاه‌های IoT (جدا و محدود)
  • Management   — مدیریت سوییچ/روتر/فایروال (فقط از جامپ‌هاست)
  • Guest        — مهمان (فقط اینترنت، ایزوله)
  • DMZ          — سرویس‌های اینترنتی (Web, Mail)

اصل: Least Privilege + Defense in Depth
`.trim(),
      };

    case 'ping': {
      const host = args[0] || '192.168.1.1';
      return {
        output: `
PING ${host} (${host}) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.8 ms
64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.6 ms
64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.7 ms
64 bytes from ${host}: icmp_seq=4 ttl=64 time=0.5 ms

--- ${host} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss
rtt min/avg/max = 0.5/0.65/0.8 ms
`.trim(),
      };
    }

    case 'traceroute':
    case 'tracert': {
      const host = args[0] || '8.8.8.8';
      return {
        output: `
traceroute to ${host}, 30 hops max
 1  192.168.1.1          1.2 ms   0.9 ms   0.8 ms
 2  10.0.0.1             4.5 ms   4.1 ms   3.9 ms
 3  172.16.50.1         12.3 ms  11.8 ms  12.0 ms
 4  ${host}             18.7 ms  17.9 ms  18.2 ms
`.trim(),
      };
    }

    case 'ip': {
      if (args[0] === 'addr' || args[0] === 'a' || !args[0]) {
        return {
          output: `
1: lo: <LOOPBACK,UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500
    inet 192.168.1.50/24 brd 192.168.1.255 scope global eth0
    inet6 fe80::a00:27ff:fe4e:66a1/64 scope link
`.trim(),
        };
      }
      return { output: 'استفاده: ip addr', isError: true };
    }

    case 'whoami':
      return { output: 'networklearn-lab\nuser: student  |  role: trainee  |  zone: LAB' };

    case 'ls':
    case 'pwd':
    case 'cd':
      return { output: 'این لاب شبکه‌محور است. برای دستورات فایل‌سیستمی از LinuxQuest استفاده کنید.\nدستورات شبکه را با help ببینید.' };

    default:
      return {
        output: `دستور ناشناخته: ${cmd}\nبرای لیست دستورات «help» را تایپ کنید.`,
        isError: true,
      };
  }
}
