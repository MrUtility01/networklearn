export interface CommandResult {
  output: string;
  isError?: boolean;
}

/** Sample lab host state (Windows-oriented) */
const LAB = {
  hostname: 'WIN-LAB-01',
  user: 'Student',
  domain: 'LAB.LOCAL',
  ipv4: '192.168.1.50',
  mask: '255.255.255.0',
  gateway: '192.168.1.1',
  dns1: '8.8.8.8',
  dns2: '1.1.1.1',
  mac: '00-15-5D-01-0A-2B',
  adapter: 'Ethernet0',
  dhcp: true,
};

const OSI_LAYERS: Record<number, { name: string; pdu: string; desc: string }> = {
  7: { name: 'Application', pdu: 'Data', desc: 'HTTP, DNS, FTP, SMTP, RDP' },
  6: { name: 'Presentation', pdu: 'Data', desc: 'Encryption, compression, encoding' },
  5: { name: 'Session', pdu: 'Data', desc: 'Session management' },
  4: { name: 'Transport', pdu: 'Segment/Datagram', desc: 'TCP / UDP — ports' },
  3: { name: 'Network', pdu: 'Packet', desc: 'IP addressing & routing' },
  2: { name: 'Data Link', pdu: 'Frame', desc: 'MAC, switching, FCS' },
  1: { name: 'Physical', pdu: 'Bits', desc: 'Cable, signal, NIC' },
};

function ok(output: string): CommandResult {
  return { output: output.trim() };
}
function err(output: string): CommandResult {
  return { output: output.trim(), isError: true };
}

function pingOut(host: string, count = 4): string {
  const lines = [];
  for (let i = 1; i <= count; i++) {
    const t = (0.4 + Math.random() * 2).toFixed(1);
    lines.push(`Reply from ${host}: bytes=32 time=${t}ms TTL=64`);
  }
  return `Pinging ${host} with 32 bytes of data:\n${lines.join('\n')}\n\nPing statistics for ${host}:\n    Packets: Sent = ${count}, Received = ${count}, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 0ms, Maximum = 3ms, Average = 1ms`;
}

function tracertOut(host: string): string {
  return `Tracing route to ${host} over a maximum of 30 hops:\n\n  1    <1 ms    <1 ms    <1 ms  ${LAB.gateway}\n  2     4 ms     3 ms     4 ms  10.0.0.1\n  3    12 ms    11 ms    12 ms  172.16.50.1\n  4    18 ms    17 ms    18 ms  ${host}\n\nTrace complete.`;
}

/** Full command catalog — used by help and handlers */
export const COMMAND_CATALOG: { cat: string; cmds: { name: string; desc: string }[] }[] = [
  {
    cat: 'عمومی / لاب',
    cmds: [
      { name: 'help', desc: 'راهنما و دسته‌بندی دستورات' },
      { name: 'help windows', desc: 'فقط دستورات ویندوز' },
      { name: 'help network', desc: 'دستورات شبکه' },
      { name: 'clear / cls', desc: 'پاک کردن صفحه' },
      { name: 'whoami', desc: 'کاربر فعلی' },
      { name: 'hostname', desc: 'نام کامپیوتر' },
      { name: 'ver', desc: 'نسخه ویندوز (شبیه‌سازی)' },
      { name: 'systeminfo', desc: 'اطلاعات سیستم' },
      { name: 'date / time', desc: 'تاریخ و ساعت' },
      { name: 'echo', desc: 'چاپ متن' },
      { name: 'about-network', desc: 'مفاهیم پایه شبکه' },
      { name: 'lab-info', desc: 'وضعیت لاب فعلی' },
    ],
  },
  {
    cat: 'ویندوز — IP و آداپتر (خیلی مهم)',
    cmds: [
      { name: 'ipconfig', desc: 'پیکربندی IP' },
      { name: 'ipconfig /all', desc: 'جزئیات کامل (MAC, DHCP, DNS)' },
      { name: 'ipconfig /release', desc: 'آزاد کردن lease DHCP' },
      { name: 'ipconfig /renew', desc: 'گرفتن IP جدید از DHCP' },
      { name: 'ipconfig /flushdns', desc: 'پاک کردن کش DNS' },
      { name: 'ipconfig /displaydns', desc: 'نمایش کش DNS' },
      { name: 'ipconfig /registerdns', desc: 'ثبت مجدد در DNS' },
      { name: 'getmac', desc: 'آدرس MAC' },
      { name: 'getmac /v', desc: 'MAC با جزئیات' },
    ],
  },
  {
    cat: 'ویندوز — netsh',
    cmds: [
      { name: 'netsh interface show interface', desc: 'لیست اینترفیس‌ها' },
      { name: 'netsh interface ip show config', desc: 'پیکربندی IP' },
      { name: 'netsh interface ip show address', desc: 'آدرس‌های IP' },
      { name: 'netsh interface ip show dns', desc: 'DNS اینترفیس' },
      { name: 'netsh wlan show profiles', desc: 'پروفایل‌های Wi-Fi' },
      { name: 'netsh wlan show interfaces', desc: 'وضعیت وای‌فای' },
      { name: 'netsh advfirewall show allprofiles', desc: 'وضعیت فایروال' },
      { name: 'netsh advfirewall firewall show rule name=all', desc: 'قوانین فایروال' },
      { name: 'netsh winhttp show proxy', desc: 'پروکسی WinHTTP' },
      { name: 'netsh interface ipv4 show route', desc: 'جدول روت IPv4' },
      { name: 'netsh interface ipv4 show neighbors', desc: 'جدول همسایه (ARP)' },
    ],
  },
  {
    cat: 'ویندوز — اتصال و عیب‌یابی',
    cmds: [
      { name: 'ping', desc: 'تست ICMP' },
      { name: 'ping -t', desc: 'ping مداوم' },
      { name: 'ping -n', desc: 'تعداد پکت' },
      { name: 'tracert', desc: 'مسیر تا مقصد' },
      { name: 'tracert -d', desc: 'بدون resolve نام' },
      { name: 'pathping', desc: 'ترکیب ping + tracert + loss' },
      { name: 'nslookup', desc: 'پرس‌وجوی DNS' },
      { name: 'nslookup -type=mx', desc: 'رکورد MX' },
      { name: 'nslookup -type=ns', desc: 'رکورد NS' },
      { name: 'telnet', desc: 'تست پورت (شبیه‌سازی)' },
      { name: 'Test-NetConnection', desc: 'PowerShell تست اتصال' },
      { name: 'tnc', desc: 'مخفف Test-NetConnection' },
    ],
  },
  {
    cat: 'ویندوز — ARP / Route / Netstat',
    cmds: [
      { name: 'arp -a', desc: 'جدول ARP' },
      { name: 'arp -d', desc: 'پاک کردن ARP' },
      { name: 'route print', desc: 'جدول مسیریابی' },
      { name: 'route print -4', desc: 'فقط IPv4' },
      { name: 'route print -6', desc: 'فقط IPv6' },
      { name: 'netstat -an', desc: 'اتصالات و پورت‌ها' },
      { name: 'netstat -ano', desc: 'با PID' },
      { name: 'netstat -b', desc: 'با نام برنامه' },
      { name: 'netstat -r', desc: 'جدول روت' },
      { name: 'netstat -e', desc: 'آمار اترنت' },
      { name: 'netstat -s', desc: 'آمار پروتکل‌ها' },
    ],
  },
  {
    cat: 'ویندوز — net / share / user',
    cmds: [
      { name: 'net view', desc: 'کامپیوترهای شبکه' },
      { name: 'net share', desc: 'شیرهای محلی' },
      { name: 'net use', desc: 'درایوهای map شده' },
      { name: 'net user', desc: 'کاربران محلی' },
      { name: 'net localgroup', desc: 'گروه‌های محلی' },
      { name: 'net localgroup administrators', desc: 'اعضای Administrators' },
      { name: 'net accounts', desc: 'سیاست حساب' },
      { name: 'net session', desc: 'نشست‌های ورودی' },
      { name: 'net statistics workstation', desc: 'آمار workstation' },
      { name: 'net statistics server', desc: 'آمار server' },
      { name: 'net config workstation', desc: 'پیکربندی workstation' },
      { name: 'net start', desc: 'سرویس‌های در حال اجرا' },
      { name: 'net stop', desc: 'توقف سرویس (شبیه‌سازی)' },
    ],
  },
  {
    cat: 'ویندوز — DNS Client / Name Resolution',
    cmds: [
      { name: 'Resolve-DnsName', desc: 'PowerShell DNS resolve' },
      { name: 'Get-DnsClient', desc: 'تنظیمات DNS کلاینت' },
      { name: 'Get-DnsClientServerAddress', desc: 'آدرس سرور DNS' },
      { name: 'Clear-DnsClientCache', desc: 'پاک کردن کش DNS' },
      { name: 'Get-DnsClientCache', desc: 'محتوای کش DNS' },
      { name: 'nbtstat -n', desc: 'نام‌های NetBIOS' },
      { name: 'nbtstat -c', desc: 'کش NetBIOS' },
      { name: 'nbtstat -a', desc: 'جدول نام ریموت' },
      { name: 'nbtstat -r', desc: 'آمار resolve' },
    ],
  },
  {
    cat: 'ویندوز — PowerShell Networking',
    cmds: [
      { name: 'Get-NetAdapter', desc: 'آداپترهای شبکه' },
      { name: 'Get-NetIPAddress', desc: 'آدرس‌های IP' },
      { name: 'Get-NetIPConfiguration', desc: 'پیکربندی کامل IP' },
      { name: 'Get-NetRoute', desc: 'جدول روت' },
      { name: 'Get-NetNeighbor', desc: 'همسایه‌ها (ARP)' },
      { name: 'Get-NetTCPConnection', desc: 'اتصالات TCP' },
      { name: 'Get-NetUDPEndpoint', desc: 'endpointهای UDP' },
      { name: 'Get-NetFirewallRule', desc: 'قوانین فایروال' },
      { name: 'Get-NetFirewallProfile', desc: 'پروفایل فایروال' },
      { name: 'Get-NetConnectionProfile', desc: 'پروفایل اتصال (Domain/Private/Public)' },
      { name: 'Get-NetAdapterStatistics', desc: 'آمار آداپتر' },
      { name: 'Get-NetAdapterBinding', desc: 'bindingهای آداپتر' },
      { name: 'Get-SmbShare', desc: 'شیرهای SMB' },
      { name: 'Get-SmbConnection', desc: 'اتصالات SMB' },
      { name: 'Get-SmbSession', desc: 'نشست‌های SMB' },
      { name: 'Test-Connection', desc: 'جایگزین ping در PS' },
      { name: 'Get-NetIPInterface', desc: 'اینترفیس‌های IP' },
      { name: 'Get-NetAdapterAdvancedProperty', desc: 'ویژگی‌های پیشرفته NIC' },
    ],
  },
  {
    cat: 'ویندوز — سرویس و فرآیند مرتبط شبکه',
    cmds: [
      { name: 'sc query', desc: 'وضعیت سرویس' },
      { name: 'sc query dnscache', desc: 'سرویس DNS Client' },
      { name: 'sc query dhcp', desc: 'سرویس DHCP Client' },
      { name: 'sc query nsi', desc: 'Network Store Interface' },
      { name: 'sc query netman', desc: 'Network Connections' },
      { name: 'sc query lanmanworkstation', desc: 'Workstation service' },
      { name: 'sc query lanmanserver', desc: 'Server service' },
      { name: 'tasklist', desc: 'لیست فرآیندها' },
      { name: 'tasklist /svc', desc: 'فرآیند + سرویس' },
      { name: 'Get-Service', desc: 'سرویس‌ها (PS)' },
      { name: 'Get-Process', desc: 'فرآیندها (PS)' },
    ],
  },
  {
    cat: 'ویندوز — رویداد و عیب‌یابی پیشرفته',
    cmds: [
      { name: 'eventvwr', desc: 'راهنمای Event Viewer' },
      { name: 'Get-WinEvent', desc: 'رویدادهای ویندوز (نمونه شبکه)' },
      { name: 'netsh wlan show wlanreport', desc: 'گزارش وای‌فای' },
      { name: 'msinfo32', desc: 'خلاصه System Information' },
      { name: 'winver', desc: 'نسخه ویندوز' },
      { name: 'gpresult /r', desc: 'نتیجه Group Policy' },
      { name: 'gpupdate /force', desc: 'اعمال مجدد GPO' },
      { name: 'nltest /dsgetdc:', desc: 'یافتن Domain Controller' },
      { name: 'set', desc: 'متغیرهای محیطی' },
      { name: 'echo %USERDOMAIN%', desc: 'دامنه کاربر' },
      { name: 'echo %LOGONSERVER%', desc: 'سرور لاگین' },
      { name: 'echo %COMPUTERNAME%', desc: 'نام کامپیوتر' },
    ],
  },
  {
    cat: 'آموزشی شبکه (مشترک)',
    cmds: [
      { name: 'osi', desc: 'مدل OSI' },
      { name: 'packet-journey', desc: 'مسیر بسته' },
      { name: 'show-mac', desc: 'جدول MAC سوییچ' },
      { name: 'switch-behavior', desc: 'رفتار سوییچ' },
      { name: 'domains', desc: 'Collision/Broadcast Domain' },
      { name: 'subnet', desc: 'محاسبه ساب‌نت' },
      { name: 'private-ranges', desc: 'RFC1918' },
      { name: 'arp-how', desc: 'فرآیند ARP' },
      { name: 'tcp-handshake', desc: 'Three-way Handshake' },
      { name: 'dns-records', desc: 'انواع رکورد DNS' },
      { name: 'dig', desc: 'شبیه‌سازی dig' },
      { name: 'dhcp-dora', desc: 'فرآیند DORA' },
      { name: 'security-zones', desc: 'Zoneهای امنیتی' },
      { name: 'ports', desc: 'پورت‌های رایج' },
      { name: 'vlan', desc: 'مفهوم VLAN' },
      { name: 'nat', desc: 'مفهوم NAT' },
      { name: 'acl', desc: 'مفهوم ACL' },
      { name: 'stp', desc: 'مفهوم STP' },
      { name: 'vpn', desc: 'انواع VPN' },
      { name: 'proxy', desc: 'مفهوم Proxy' },
      { name: 'firewall', desc: 'انواع فایروال' },
      { name: 'wifi', desc: 'استانداردهای Wi-Fi' },
      { name: 'cable', desc: 'انواع کابل شبکه' },
      { name: 'fiber', desc: 'فیبر نوری' },
      { name: 'bandwidth', desc: 'Bandwidth vs Throughput' },
      { name: 'latency', desc: 'Latency / Jitter / Packet Loss' },
    ],
  },
  {
    cat: 'لینوکس شبکه (مرجع)',
    cmds: [
      { name: 'ip addr', desc: 'آدرس‌ها' },
      { name: 'ip route', desc: 'جدول روت' },
      { name: 'ip neigh', desc: 'ARP لینوکس' },
      { name: 'ss -tuln', desc: 'سوکت‌ها' },
      { name: 'ifconfig', desc: 'آداپتر (قدیمی)' },
      { name: 'traceroute', desc: 'traceroute لینوکس' },
      { name: 'nmcli', desc: 'NetworkManager' },
    ],
  },
];

function helpText(filter?: string): string {
  let cats = COMMAND_CATALOG;
  if (filter === 'windows' || filter === 'win') {
    cats = COMMAND_CATALOG.filter((c) => c.cat.includes('ویندوز') || c.cat.includes('عمومی'));
  } else if (filter === 'network' || filter === 'net') {
    cats = COMMAND_CATALOG.filter(
      (c) =>
        c.cat.includes('شبکه') ||
        c.cat.includes('IP') ||
        c.cat.includes('netsh') ||
        c.cat.includes('ARP') ||
        c.cat.includes('DNS') ||
        c.cat.includes('PowerShell') ||
        c.cat.includes('اتصال') ||
        c.cat.includes('آموزشی') ||
        c.cat.includes('لینوکس')
    );
  }

  let total = 0;
  let out = '╔══════════════════════════════════════════════════════════╗\n';
  out += '║         NetworkLearn Lab — Command Reference           ║\n';
  out += '╚══════════════════════════════════════════════════════════╝\n\n';
  for (const c of cats) {
    out += `▸ ${c.cat}\n`;
    for (const cmd of c.cmds) {
      out += `    ${cmd.name.padEnd(42)} ${cmd.desc}\n`;
      total++;
    }
    out += '\n';
  }
  out += `────────────────────────────────────────\nمجموع دستورات در این لیست: ${total}+\n`;
  out += 'نکته: بسیاری دستورات آرگومان دارند (مثل ping 8.8.8.8 یا ipconfig /all)\n';
  out += 'راهنماهای فیلتر: help windows  |  help network\n';
  return out;
}

function countCatalog(): number {
  return COMMAND_CATALOG.reduce((n, c) => n + c.cmds.length, 0);
}

export function runCommand(raw: string): CommandResult {
  const input = raw.trim();
  if (!input) return { output: '' };

  const lower = input.toLowerCase();
  const parts = input.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const argstr = args.join(' ').toLowerCase();

  // ── clear ──────────────────────────────────────────────────
  if (cmd === 'clear' || cmd === 'cls') return { output: '__CLEAR__' };

  // ── help ───────────────────────────────────────────────────
  if (cmd === 'help' || cmd === '?') {
    return ok(helpText(args[0]?.toLowerCase()));
  }

  // ── generic ────────────────────────────────────────────────
  if (cmd === 'whoami') return ok(`${LAB.domain}\\${LAB.user}`);
  if (cmd === 'hostname') return ok(LAB.hostname);
  if (cmd === 'ver' || cmd === 'winver')
    return ok('Microsoft Windows [Version 10.0.26100.1]\nNetworkLearn Lab Simulation');
  if (cmd === 'date') return ok(new Date().toLocaleDateString('en-US'));
  if (cmd === 'time') return ok(new Date().toLocaleTimeString('en-US'));
  if (cmd === 'echo') {
    if (argstr.includes('%userdomain%')) return ok(LAB.domain);
    if (argstr.includes('%logonserver%')) return ok('\\\\DC01');
    if (argstr.includes('%computername%')) return ok(LAB.hostname);
    if (argstr.includes('%username%')) return ok(LAB.user);
    return ok(args.join(' ') || '');
  }
  if (cmd === 'lab-info')
    return ok(
      `Lab Host: ${LAB.hostname}\nUser: ${LAB.user}@${LAB.domain}\nIPv4: ${LAB.ipv4}/${LAB.mask}\nGW: ${LAB.gateway}\nDNS: ${LAB.dns1}, ${LAB.dns2}\nMAC: ${LAB.mac}\nAdapter: ${LAB.adapter}\nDHCP: ${LAB.dhcp ? 'Yes' : 'No'}\nCommands in catalog: ${countCatalog()}+`
    );
  if (cmd === 'about-network')
    return ok(
      `LAN / WAN / MAN / Intranet / Internet\nOSI = 7 layers (conceptual) | TCP/IP = 4 layers (practical)\nUse: osi | packet-journey | help network`
    );
  if (cmd === 'systeminfo' || cmd === 'msinfo32')
    return ok(
      `Host Name:                 ${LAB.hostname}\nOS Name:                   Microsoft Windows 11 Pro\nOS Version:                10.0.26100 N/A Build 26100\nSystem Type:               x64-based PC\nDomain:                    ${LAB.domain}\nNetwork Card(s):           1 NIC(s) Installed.\n                           [${LAB.adapter}] ${LAB.mac}\n                           IP: ${LAB.ipv4}`
    );
  if (cmd === 'set')
    return ok(
      `COMPUTERNAME=${LAB.hostname}\nUSERDOMAIN=${LAB.domain}\nUSERNAME=${LAB.user}\nLOGONSERVER=\\\\DC01\nUSERDNSDOMAIN=${LAB.domain}`
    );

  // ── ipconfig family ────────────────────────────────────────
  if (cmd === 'ipconfig') {
    if (argstr.includes('/all')) {
      return ok(
        `Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : ${LAB.hostname}\n   Primary Dns Suffix  . . . . . . . : ${LAB.domain}\n   Node Type . . . . . . . . . . . . : Hybrid\n   IP Routing Enabled. . . . . . . . : No\n   WINS Proxy Enabled. . . . . . . . : No\n   DNS Suffix Search List. . . . . . : ${LAB.domain}\n\nEthernet adapter ${LAB.adapter}:\n\n   Connection-specific DNS Suffix  . : ${LAB.domain}\n   Description . . . . . . . . . . . : Microsoft Hyper-V Network Adapter\n   Physical Address. . . . . . . . . : ${LAB.mac}\n   DHCP Enabled. . . . . . . . . . . : ${LAB.dhcp ? 'Yes' : 'No'}\n   Autoconfiguration Enabled . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : ${LAB.ipv4}(Preferred)\n   Subnet Mask . . . . . . . . . . . : ${LAB.mask}\n   Default Gateway . . . . . . . . . : ${LAB.gateway}\n   DHCP Server . . . . . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . . . . . : ${LAB.dns1}\n                                       ${LAB.dns2}\n   NetBIOS over Tcpip. . . . . . . . : Enabled`
      );
    }
    if (argstr.includes('/release')) return ok(`Windows IP Configuration\n\n${LAB.adapter}\n    IP address released successfully.`);
    if (argstr.includes('/renew'))
      return ok(
        `Windows IP Configuration\n\nEthernet adapter ${LAB.adapter}:\n   Connection-specific DNS Suffix  . : ${LAB.domain}\n   IPv4 Address. . . . . . . . . . . : ${LAB.ipv4}\n   Subnet Mask . . . . . . . . . . . : ${LAB.mask}\n   Default Gateway . . . . . . . . . : ${LAB.gateway}`
      );
    if (argstr.includes('/flushdns')) return ok('Windows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.');
    if (argstr.includes('/displaydns'))
      return ok(
        `Windows IP Configuration\n\n    example.com\n    ----------------------------------------\n    Record Name . . . . . : example.com\n    Record Type . . . . . : 1\n    Time To Live  . . . . : 298\n    A (Host) Record . . . : 93.184.216.34`
      );
    if (argstr.includes('/registerdns')) return ok('Registration of the DNS resource records for all adapters has been initiated.');
    return ok(
      `Windows IP Configuration\n\nEthernet adapter ${LAB.adapter}:\n\n   IPv4 Address. . . . . . . . . . . : ${LAB.ipv4}\n   Subnet Mask . . . . . . . . . . . : ${LAB.mask}\n   Default Gateway . . . . . . . . . : ${LAB.gateway}`
    );
  }

  if (cmd === 'getmac') {
    if (argstr.includes('/v'))
      return ok(`Network Adapter         Transport Name                         Physical Address\n======================= ===================================== ===================\n${LAB.adapter.padEnd(23)} \\Device\\Tcpip_{A1B2C3D4}          ${LAB.mac}`);
    return ok(`${LAB.mac}   \\Device\\Tcpip_{A1B2C3D4}`);
  }

  // ── netsh ──────────────────────────────────────────────────
  if (cmd === 'netsh') {
    const j = argstr;
    if (j.includes('interface show interface') || j.includes('interface show'))
      return ok(
        `Admin State    State          Type             Interface Name\n-------------------------------------------------------------------------\nEnabled        Connected      Dedicated        ${LAB.adapter}\nEnabled        Connected      Dedicated        Wi-Fi\nEnabled        Disconnected   Dedicated        Bluetooth Network`
      );
    if (j.includes('ip show config') || j.includes('ip show address'))
      return ok(
        `Configuration for interface "${LAB.adapter}"\n    DHCP enabled:                         ${LAB.dhcp ? 'Yes' : 'No'}\n    IP Address:                           ${LAB.ipv4}\n    Subnet Prefix:                        ${LAB.ipv4}/24\n    Default Gateway:                      ${LAB.gateway}\n    Gateway Metric:                       0\n    InterfaceMetric:                      25`
      );
    if (j.includes('ip show dns') || j.includes('ipv4 show dns'))
      return ok(
        `Configuration for interface "${LAB.adapter}"\n    DNS servers configured through DHCP:  ${LAB.dns1}\n                                          ${LAB.dns2}\n    Register with which suffix:           Primary only`
      );
    if (j.includes('wlan show profiles'))
      return ok(`Profiles on interface Wi-Fi:\n\nGroup policy profiles (read only)\n---------------------------------\n    <None>\n\nUser profiles\n-------------\n    All User Profile     : Office-WiFi\n    All User Profile     : Home-5G`);
    if (j.includes('wlan show interfaces'))
      return ok(
        `There is 1 interface on the system:\n\n    Name                   : Wi-Fi\n    State                  : connected\n    SSID                   : Office-WiFi\n    BSSID                  : aa:bb:cc:11:22:33\n    Radio type             : 802.11ax\n    Channel                : 36\n    Receive rate (Mbps)    : 1201\n    Transmit rate (Mbps)   : 1201\n    Signal                 : 88%`
      );
    if (j.includes('wlan show wlanreport')) return ok('WLAN Report generated. (Simulation) Open: C:\\ProgramData\\Microsoft\\Windows\\WLANReport\\WLAN-report-latest.html');
    if (j.includes('advfirewall show'))
      return ok(
        `Domain Profile Settings:\n----------------------------------------------------------------------\nState                                 ON\nFirewall Policy                       BlockInbound,AllowOutbound\n\nPrivate Profile Settings:\n----------------------------------------------------------------------\nState                                 ON\n\nPublic Profile Settings:\n----------------------------------------------------------------------\nState                                 ON`
      );
    if (j.includes('firewall show rule') || j.includes('firewall rule'))
      return ok(
        `Rule Name:                            Core Networking - DNS (UDP-Out)\n----------------------------------------------------------------------\nEnabled:                              Yes\nDirection:                            Out\nProfiles:                             Domain,Private,Public\nGrouping:                             Core Networking\nLocalIP:                              Any\nRemoteIP:                             Any\nProtocol:                             UDP\nLocalPort:                            Any\nRemotePort:                           53\nAction:                               Allow`
      );
    if (j.includes('winhttp show proxy')) return ok('Current WinHTTP proxy settings:\n\n    Direct access (no proxy server).');
    if (j.includes('show route') || j.includes('ipv4 show route'))
      return ok(
        `Publish     Type      Met  Prefix                    Idx  Gateway\n-------  --------  ----  ------------------------  ---  ------------------------\nNo       Manual       0  0.0.0.0/0                    12  ${LAB.gateway}\nNo       Manual     256  ${LAB.ipv4}/32                12  \nNo       Manual     256  192.168.1.0/24               12  \nNo       Manual     256  127.0.0.0/8                   1`
      );
    if (j.includes('show neighbors') || j.includes('show neighbour'))
      return ok(
        `Interface ${LAB.adapter}: Internet Address                              Physical Address   Type\n--------------------------------------------  -----------------  -----------\n${LAB.gateway.padEnd(45)} aa-bb-cc-dd-ee-01  Reachable\n192.168.1.10                                  11-22-33-44-55-66  Reachable`
      );
    return ok('netsh — از زیرمجموعه‌ها استفاده کنید:\n  netsh interface show interface\n  netsh interface ip show config\n  netsh wlan show profiles\n  netsh advfirewall show allprofiles\n  netsh interface ipv4 show route\nبرای لیست کامل: help windows');
  }

  // ── ping ───────────────────────────────────────────────────
  if (cmd === 'ping' || cmd === 'test-connection') {
    const host = args.find((a) => !a.startsWith('-')) || LAB.gateway;
    let count = 4;
    if (argstr.includes('-t')) count = 8;
    const nIdx = args.findIndex((a) => a === '-n' || a === '-c');
    if (nIdx >= 0 && args[nIdx + 1]) count = parseInt(args[nIdx + 1], 10) || 4;
    return ok(pingOut(host, Math.min(count, 10)));
  }

  // ── tracert / pathping ─────────────────────────────────────
  if (cmd === 'tracert' || cmd === 'traceroute') {
    const host = args.find((a) => !a.startsWith('-')) || '8.8.8.8';
    return ok(tracertOut(host));
  }
  if (cmd === 'pathping') {
    const host = args.find((a) => !a.startsWith('-')) || '8.8.8.8';
    return ok(
      `Tracing route to ${host} over a maximum of 30 hops:\n\n  0  ${LAB.hostname} [${LAB.ipv4}]\n  1  ${LAB.gateway}\n  2  10.0.0.1\n  3  ${host}\n\nComputing statistics for 75 seconds...\n            Source to Here   This Node/Link\nHop  RTT    Lost/Sent = Pct  Lost/Sent = Pct  Address\n  0                                           ${LAB.ipv4}\n                                0/100 =  0%   |\n  1    1ms     0/100 =  0%     0/100 =  0%  ${LAB.gateway}\n  2    4ms     0/100 =  0%     0/100 =  0%  10.0.0.1\n  3   18ms     0/100 =  0%     0/100 =  0%  ${host}\n\nTrace complete.`
    );
  }

  // ── nslookup ───────────────────────────────────────────────
  if (cmd === 'nslookup') {
    const host = args.find((a) => !a.startsWith('-') && !a.includes('=')) || 'example.com';
    if (argstr.includes('type=mx') || argstr.includes('-type=mx'))
      return ok(`Server:  dns.google\nAddress:  ${LAB.dns1}\n\n${host}\tmx preference = 10, mail exchanger = mail.${host}`);
    if (argstr.includes('type=ns') || argstr.includes('-type=ns'))
      return ok(`Server:  dns.google\nAddress:  ${LAB.dns1}\n\n${host}\tnameserver = ns1.${host}\n${host}\tnameserver = ns2.${host}`);
    return ok(`Server:  dns.google\nAddress:  ${LAB.dns1}\n\nName:    ${host}\nAddress:  93.184.216.34`);
  }

  // ── arp ────────────────────────────────────────────────────
  if (cmd === 'arp') {
    if (argstr.includes('-d')) return ok('The ARP entry has been deleted. (Simulation)');
    return ok(
      `Interface: ${LAB.ipv4} --- 0xc\n  Internet Address      Physical Address      Type\n  ${LAB.gateway}           aa-bb-cc-dd-ee-01     dynamic\n  192.168.1.10          11-22-33-44-55-66     dynamic\n  192.168.1.255         ff-ff-ff-ff-ff-ff     static`
    );
  }

  // ── route ──────────────────────────────────────────────────
  if (cmd === 'route') {
    return ok(
      `===========================================================================\nInterface List\n 12...${LAB.mac} ......Microsoft Hyper-V Network Adapter\n  1...........................Software Loopback Interface 1\n===========================================================================\n\nIPv4 Route Table\n===========================================================================\nActive Routes:\nNetwork Destination        Netmask          Gateway       Interface  Metric\n          0.0.0.0          0.0.0.0      ${LAB.gateway}     ${LAB.ipv4}     25\n        127.0.0.0        255.0.0.0         On-link         127.0.0.1    331\n      192.168.1.0    255.255.255.0         On-link      ${LAB.ipv4}    281\n      ${LAB.ipv4}  255.255.255.255         On-link      ${LAB.ipv4}    281\n===========================================================================`
    );
  }

  // ── netstat ────────────────────────────────────────────────
  if (cmd === 'netstat') {
    if (argstr.includes('-s'))
      return ok(
        `IPv4 Statistics\n\n  Packets Received                   = 12840\n  Received Header Errors             = 0\n  Received Address Errors            = 2\n  Datagrams Forwarded                = 0\n  Received Unknown Protocols         = 0\n  Received Packets Discarded         = 12\n  Received Packets Delivered         = 12820\n  Output Requests                    = 9421\n\nTCP Statistics for IPv4\n\n  Active Opens                        = 312\n  Passive Opens                       = 48\n  Failed Connection Attempts          = 5\n  Reset Connections                   = 18\n  Current Connections                 = 14\n  Segments Received                   = 50210\n  Segments Sent                       = 48902\n  Segments Retransmitted              = 21`
      );
    if (argstr.includes('-e'))
      return ok(
        `Interface Statistics\n\n                           Received            Sent\nBytes                      14523010         8234011\nUnicast packets               12840            9421\nNon-unicast packets             312             128\nDiscards                          0               0\nErrors                            0               0\nUnknown protocols                0`
      );
    if (argstr.includes('-r')) return runCommand('route print');
    const withPid = argstr.includes('-o') || argstr.includes('-ano');
    return ok(
      `Active Connections\n\n  Proto  Local Address          Foreign Address        State${withPid ? '           PID' : ''}\n  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING${withPid ? '       1088' : ''}\n  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING${withPid ? '          4' : ''}\n  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING${withPid ? '       1204' : ''}\n  TCP    ${LAB.ipv4}:49712      40.99.10.20:443        ESTABLISHED${withPid ? '       5820' : ''}\n  TCP    ${LAB.ipv4}:49801      142.250.185.46:443     ESTABLISHED${withPid ? '       9100' : ''}\n  UDP    0.0.0.0:53             *:*${withPid ? '                            1512' : ''}\n  UDP    0.0.0.0:123            *:*${withPid ? '                            1232' : ''}`
    );
  }

  // ── net * ──────────────────────────────────────────────────
  if (cmd === 'net') {
    const sub = (args[0] || '').toLowerCase();
    if (sub === 'view') return ok(`Server Name\n-------------------------------------------------------------------------------\n\\\\${LAB.hostname}\n\\\\DC01\n\\\\FS01\nThe command completed successfully.`);
    if (sub === 'share')
      return ok(
        `Share name   Resource                        Remark\n-------------------------------------------------------------------------------\nADMIN$       C:\\Windows                      Remote Admin\nC$           C:\\                             Default share\nIPC$                                         Remote IPC\nThe command completed successfully.`
      );
    if (sub === 'use') return ok('New connections will be remembered.\n\nThere are no entries in the list.');
    if (sub === 'user')
      return ok(`User accounts for \\\\${LAB.hostname}\n-------------------------------------------------------------------------------\nAdministrator            Guest                    ${LAB.user}\nThe command completed successfully.`);
    if (sub === 'localgroup') {
      if (argstr.includes('administrators'))
        return ok(`Alias name     administrators\nComment        Administrators have complete and unrestricted access\n\nMembers\n-------------------------------------------------------------------------------\nAdministrator\n${LAB.user}\nThe command completed successfully.`);
      return ok(`Aliases for \\\\${LAB.hostname}\n-------------------------------------------------------------------------------\n*Administrators\n*Guests\n*Users\nThe command completed successfully.`);
    }
    if (sub === 'accounts')
      return ok(
        `Force user logoff how long after time expires?:       Never\nMinimum password age (days):                          1\nMaximum password age (days):                          42\nMinimum password length:                              8\nLength of password history maintained:                24\nLockout threshold:                                    5\nLockout duration (minutes):                           30\nThe command completed successfully.`
      );
    if (sub === 'session') return ok('There are no entries in the list.');
    if (sub === 'statistics')
      return ok(
        `Workstation Statistics for \\\\${LAB.hostname}\n\nStatistics since 10/8/2026 8:00:00 AM\n\n  Bytes received                             14523010\n  Server Message Blocks (SMBs) received           8421\n  Bytes transmitted                           8234011\n  Server Message Blocks (SMBs) transmitted        7902\nThe command completed successfully.`
      );
    if (sub === 'config')
      return ok(
        `Computer name                        \\\\${LAB.hostname}\nFull Computer name                   ${LAB.hostname}.${LAB.domain}\nUser name                            ${LAB.domain}\\${LAB.user}\nWorkstation domain                   ${LAB.domain}\nWorkstation Domain DNS Name          ${LAB.domain}\nLogon domain                         ${LAB.domain}\nThe command completed successfully.`
      );
    if (sub === 'start')
      return ok(
        `These Windows services are started:\n\n   DHCP Client\n   DNS Client\n   Network Connections\n   Network List Service\n   Network Location Awareness\n   Network Store Interface Service\n   Server\n   Workstation\n\nThe command completed successfully.`
      );
    if (sub === 'stop') return ok(`The ${args[1] || 'service'} service was stopped successfully. (Simulation)`);
    return ok('net — زیرمجموعه‌ها: view | share | use | user | localgroup | accounts | session | statistics | config | start | stop');
  }

  // ── nbtstat ────────────────────────────────────────────────
  if (cmd === 'nbtstat') {
    if (argstr.includes('-n'))
      return ok(
        `${LAB.adapter}:\nNode IpAddress: [${LAB.ipv4}] Scope Id: []\n\n                NetBIOS Local Name Table\n\n       Name               Type         Status\n    ---------------------------------------------\n    ${LAB.hostname.padEnd(16)} <00>  UNIQUE      Registered\n    ${LAB.domain.padEnd(16)}  <00>  GROUP       Registered\n    ${LAB.hostname.padEnd(16)} <20>  UNIQUE      Registered`
      );
    if (argstr.includes('-c'))
      return ok(
        `${LAB.adapter}:\nNode IpAddress: [${LAB.ipv4}] Scope Id: []\n\n                  NetBIOS Remote Cache Name Table\n\n        Name              Type       Host Address    Life [sec]\n    ------------------------------------------------------------\n    DC01            <20>  UNIQUE     192.168.1.10         450`
      );
    if (argstr.includes('-r'))
      return ok(`    NetBIOS Names Resolution and Registration Statistics\n\n    Resolved By Broadcast     = 12\n    Resolved By Name Server   = 48\n    Registered By Broadcast   = 3\n    Registered By Name Server = 3`);
    if (argstr.includes('-a'))
      return ok(
        `${LAB.adapter}:\nNode IpAddress: [${LAB.ipv4}] Scope Id: []\n\n           NetBIOS Remote Machine Name Table\n\n       Name               Type         Status\n    ---------------------------------------------\n    DC01            <00>  UNIQUE      Registered\n    LAB             <00>  GROUP       Registered\n    DC01            <20>  UNIQUE      Registered`
      );
    return ok('nbtstat — سوئیچ‌ها: -n | -c | -a <name> | -r');
  }

  // ── PowerShell-style ───────────────────────────────────────
  if (cmd === 'get-netadapter' || (cmd === 'get-netadapterstatistics'))
    return ok(
      `Name     InterfaceDescription                     Status       MacAddress        LinkSpeed\n----     --------------------                     ------       ----------        ---------\n${LAB.adapter}  Microsoft Hyper-V Network Adapter          Up           ${LAB.mac.replace(/-/g, '-')}  10 Gbps\nWi-Fi    Intel(R) Wi-Fi 6 AX201                   Up           AA-BB-CC-11-22-33  1.2 Gbps`
    );
  if (cmd === 'get-netipaddress')
    return ok(
      `IPAddress         InterfaceAlias  AddressFamily  PrefixLength\n---------         --------------  -------------  ------------\n${LAB.ipv4}       ${LAB.adapter}         IPv4            24\n127.0.0.1         Loopback        IPv4            8\nfe80::a00:27ff:fe4e:66a1%12  ${LAB.adapter}  IPv6  64`
    );
  if (cmd === 'get-netipconfiguration')
    return ok(
      `InterfaceAlias       : ${LAB.adapter}\nInterfaceIndex       : 12\nInterfaceDescription : Microsoft Hyper-V Network Adapter\nNetProfile.Name      : ${LAB.domain}\nIPv4Address          : ${LAB.ipv4}\nIPv4DefaultGateway    : ${LAB.gateway}\nDNSServer            : ${LAB.dns1}, ${LAB.dns2}`
    );
  if (cmd === 'get-netroute')
    return ok(
      `ifIndex DestinationPrefix  NextHop       RouteMetric\n------- -----------------  -------       -----------\n12      0.0.0.0/0          ${LAB.gateway}  25\n12      192.168.1.0/24     0.0.0.0       281\n1       127.0.0.0/8        0.0.0.0       331`
    );
  if (cmd === 'get-netneighbor')
    return ok(
      `ifIndex IPAddress       LinkLayerAddress   State\n------- ---------       ----------------   -----\n12      ${LAB.gateway}    aa-bb-cc-dd-ee-01 Reachable\n12      192.168.1.10    11-22-33-44-55-66 Reachable`
    );
  if (cmd === 'get-nettcpconnection')
    return ok(
      `LocalAddress LocalPort RemoteAddress RemotePort State       OwningProcess\n------------ --------- ------------- ---------- -----       -------------\n0.0.0.0      135       0.0.0.0       0          Listen      1088\n0.0.0.0      445       0.0.0.0       0          Listen      4\n${LAB.ipv4}  49712     40.99.10.20   443        Established 5820`
    );
  if (cmd === 'get-netudpendpoint')
    return ok(`LocalAddress LocalPort OwningProcess\n------------ --------- -------------\n0.0.0.0      53        1512\n0.0.0.0      123       1232\n0.0.0.0      137       4`);
  if (cmd === 'get-netfirewallrule')
    return ok(
      `Name                          DisplayName                        Enabled Direction Action\n----                          -----------                        ------- --------- ------\nCoreNet-DNS-Out               Core Networking - DNS (UDP-Out)    True    Outbound  Allow\nCoreNet-DHCP-Out              Core Networking - Dynamic Host...  True    Outbound  Allow\nFPS-SMB-In-TCP                File and Printer Sharing (SMB-In)  True    Inbound   Allow`
    );
  if (cmd === 'get-netfirewallprofile')
    return ok(
      `Name    Enabled DefaultInboundAction DefaultOutboundAction\n----    ------- -------------------- ---------------------\nDomain  True    NotConfigured        NotConfigured\nPrivate True    NotConfigured        NotConfigured\nPublic  True    NotConfigured        NotConfigured`
    );
  if (cmd === 'get-netconnectionprofile')
    return ok(`Name             : ${LAB.domain}\nInterfaceAlias   : ${LAB.adapter}\nNetworkCategory  : DomainAuthenticated\nIPv4Connectivity : Internet\nIPv6Connectivity : LocalNetwork`);
  if (cmd === 'get-netadapterbinding')
    return ok(
      `Name   DisplayName                                        ComponentID          Enabled\n----   -----------                                        -----------          -------\n${LAB.adapter}  Client for Microsoft Networks                     ms_msclient          True\n${LAB.adapter}  File and Printer Sharing for Microsoft Networks   ms_server            True\n${LAB.adapter}  Internet Protocol Version 4 (TCP/IPv4)            ms_tcpip             True\n${LAB.adapter}  Internet Protocol Version 6 (TCP/IPv6)            ms_tcpip6            True`
    );
  if (cmd === 'get-netipinterface')
    return ok(
      `ifIndex InterfaceAlias AddressFamily NlMtu(Bytes) InterfaceMetric Dhcp\n------- -------------- ------------- ------------ --------------- ----\n12      ${LAB.adapter}        IPv4          1500         25              Enabled\n12      ${LAB.adapter}        IPv6          1500         25              Enabled`
    );
  if (cmd === 'get-netadapteradvancedproperty')
    return ok(
      `Name   DisplayName                  DisplayValue  RegistryKeyword\n----   -----------                  ------------  ---------------\n${LAB.adapter}  Jumbo Packet                 Disabled      *JumboPacket\n${LAB.adapter}  Receive Side Scaling         Enabled       *RSS\n${LAB.adapter}  Speed & Duplex               Auto Negot... *SpeedDuplex`
    );
  if (cmd === 'get-smbshare')
    return ok(`Name   Path       Description\n----   ----       -----------\nADMIN$ C:\\Windows Remote Admin\nC$     C:\\        Default share\nIPC$               Remote IPC`);
  if (cmd === 'get-smbconnection' || cmd === 'get-smbsession') return ok('(No active SMB connections in lab simulation)');
  if (cmd === 'get-dnsclient')
    return ok(`InterfaceAlias ConnectionSpecificSuffix ConnectionSpecificSuffixSearchList RegisterThisConnectionsAddress\n-------------- ------------------------ ----------------------------------- ------------------------------\n${LAB.adapter}        ${LAB.domain}                     {}                                  True`);
  if (cmd === 'get-dnsclientserveraddress')
    return ok(`InterfaceAlias               AddressFamily ServerAddresses\n--------------               ------------- ---------------\n${LAB.adapter}                      IPv4          {${LAB.dns1}, ${LAB.dns2}}`);
  if (cmd === 'get-dnsclientcache')
    return ok(`Entry        RecordName   RecordType Data\n-----        ----------   ---------- ----\nexample.com  example.com  A          93.184.216.34`);
  if (cmd === 'clear-dnsclientcache') return ok('DNS client cache cleared. (Simulation)');
  if (cmd === 'resolve-dnsname') {
    const host = args[0] || 'example.com';
    return ok(`Name                                           Type   TTL   Section    IPAddress\n----                                           ----   ---   -------    ---------\n${host}                                        A      300   Answer     93.184.216.34`);
  }
  if (cmd === 'test-netconnection' || cmd === 'tnc') {
    const host = args[0] || LAB.gateway;
    const port = args.find((a) => a.startsWith('-Port') || /^\d+$/.test(a))?.replace('-Port', '') || '';
    return ok(
      `ComputerName           : ${host}\nRemoteAddress          : ${host}\nRemotePort             : ${port || 'ICMP'}\nInterfaceAlias         : ${LAB.adapter}\nSourceAddress          : ${LAB.ipv4}\nPingSucceeded          : True\nTcpTestSucceeded       : ${port ? 'True' : 'N/A'}`
    );
  }
  if (cmd === 'get-service')
    return ok(
      `Status   Name               DisplayName\n------   ----               -----------\nRunning  Dhcp               DHCP Client\nRunning  Dnscache           DNS Client\nRunning  nsi                Network Store Interface Service\nRunning  netman             Network Connections\nRunning  LanmanWorkstation  Workstation\nRunning  LanmanServer       Server`
    );
  if (cmd === 'get-process' || cmd === 'tasklist') {
    if (argstr.includes('/svc'))
      return ok(
        `Image Name                     PID Services\n========================= ======== ============================================\nsvchost.exe                   1088 RpcEptMapper, RpcSs\nsvchost.exe                   1512 Dnscache\nsystem                           4`
      );
    return ok(
      `Image Name                     PID Session Name        Session#    Mem Usage\n========================= ======== ================ =========== ============\nSystem Idle Process              0 Services                   0          8 K\nSystem                           4 Services                   0        144 K\nsvchost.exe                   1088 Services                   0     12,480 K\nsvchost.exe                   1512 Services                   0      8,212 K`
    );
  }
  if (cmd === 'sc') {
    const svc = (args[1] || args[0] || 'dnscache').toLowerCase();
    const names: Record<string, string> = {
      dnscache: 'DNS Client',
      dhcp: 'DHCP Client',
      nsi: 'Network Store Interface Service',
      netman: 'Network Connections',
      lanmanworkstation: 'Workstation',
      lanmanserver: 'Server',
    };
    const display = names[svc] || svc;
    return ok(
      `SERVICE_NAME: ${svc}\nDISPLAY_NAME: ${display}\n        TYPE               : 20  WIN32_SHARE_PROCESS\n        STATE              : 4  RUNNING\n        WIN32_EXIT_CODE    : 0  (0x0)\n        SERVICE_EXIT_CODE  : 0  (0x0)`
    );
  }
  if (cmd === 'gpresult') return ok(`Microsoft (R) Windows (R) Operating System Group Policy Result tool\n\nUSER SETTINGS\n--------------\nCN=${LAB.user},CN=Users,DC=LAB,DC=LOCAL\n    Last time Group Policy was applied: 10/8/2026 9:00:00 AM\n    Group Policy was applied from:      DC01.LAB.LOCAL`);
  if (cmd === 'gpupdate') return ok('Updating policy...\n\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.');
  if (cmd === 'nltest')
    return ok(`           DC: \\\\DC01\n      Address: \\\\192.168.1.10\n     Dom Guid: a1b2c3d4-e5f6-7890-abcd-ef1234567890\n     Dom Name: ${LAB.domain}\n  Forest Name: ${LAB.domain}\n Dc Site Name: Default-First-Site-Name\nThe command completed successfully`);
  if (cmd === 'get-winevent')
    return ok(
      `TimeCreated           Id LevelDisplayName Message\n-----------           -- ---------------- -------\n10/8/2026 10:15:00  4201 Information      The network link is up\n10/8/2026 09:02:11  1014 Warning          Name resolution timeout for name: stale.lab.local`
    );
  if (cmd === 'eventvwr') return ok('Event Viewer — مسیر: eventvwr.msc\nبرای رویداد شبکه: Applications and Services Logs → Microsoft → Windows → NetworkProfile');
  if (cmd === 'telnet') {
    const host = args[0] || LAB.gateway;
    const port = args[1] || '23';
    return ok(`Connecting To ${host}...\n(Simulation) Connection to ${host}:${port} — use Test-NetConnection for modern checks.`);
  }

  // ── educational ────────────────────────────────────────────
  if (cmd === 'osi') {
    if (args[0]) {
      const n = parseInt(args[0], 10);
      const layer = OSI_LAYERS[n];
      if (!layer) return err('لایه باید بین ۱ تا ۷ باشد.');
      return ok(`Layer ${n}: ${layer.name}\nPDU: ${layer.pdu}\n${layer.desc}`);
    }
    let out = 'OSI Model (top → bottom):\n\n';
    for (let i = 7; i >= 1; i--) out += `  ${i}. ${OSI_LAYERS[i].name.padEnd(14)} [${OSI_LAYERS[i].pdu}]\n`;
    out += '\nDetail: osi <1-7>';
    return ok(out);
  }
  if (cmd === 'packet-journey')
    return ok(
      `Encapsulation (App → Wire):\n  7 App → 6 Presentation → 5 Session → 4 Transport (+TCP/UDP)\n  → 3 Network (+IP) → 2 Data Link (+MAC/FCS) → 1 Physical (bits)\nDecapsulation is reverse at destination.`
    );
  if (cmd === 'show-mac')
    return ok(`VLAN  MAC Address        Type       Ports\n----  -----------------  ---------  -----\n1     aa:bb:cc:11:22:33  DYNAMIC    Gi0/1\n1     aa:bb:cc:44:55:66  DYNAMIC    Gi0/2\n1     aa:bb:cc:77:88:99  STATIC     Gi0/24`);
  if (cmd === 'switch-behavior')
    return ok(`Switch frame handling:\n1. Learn Source MAC → CAM table\n2. Known Dest MAC → Forward to port\n3. Unknown / Broadcast → Flood\n4. Same port as source → Filter`);
  if (cmd === 'domains')
    return ok(`Collision Domain: each switch port is separate.\nBroadcast Domain: entire VLAN (router separates them).`);
  if (cmd === 'subnet') {
    if (args.length < 2) return err('Usage: subnet <network/mask> <hosts>\nExample: subnet 192.168.10.0/24 50');
    const hosts = parseInt(args[1], 10);
    if (isNaN(hosts) || hosts < 1) return err('Invalid host count');
    let hostBits = 1;
    while (Math.pow(2, hostBits) - 2 < hosts) hostBits++;
    return ok(`Hosts needed: ${hosts}\nHost bits: ${hostBits}\nNew mask: /${32 - hostBits}\nUsable hosts: ${Math.pow(2, hostBits) - 2}`);
  }
  if (cmd === 'private-ranges')
    return ok(`RFC1918:\n  10.0.0.0/8\n  172.16.0.0/12\n  192.168.0.0/16\nAPIPA: 169.254.0.0/16\nLoopback: 127.0.0.0/8`);
  if (cmd === 'arp-how')
    return ok(`ARP: Broadcast request «Who has IP?» → Unicast reply with MAC.\nRisk: ARP spoofing.`);
  if (cmd === 'tcp-handshake')
    return ok(`TCP 3-way: SYN → SYN+ACK → ACK`);
  if (cmd === 'dns-records')
    return ok(`A, AAAA, CNAME, MX, NS, PTR, TXT, SOA, SRV, CAA`);
  if (cmd === 'dig') {
    const domain = args[0] || 'example.com';
    return ok(`; <<>> DiG sim <<>> ${domain}\n;; ANSWER: ${domain}. 300 IN A 93.184.216.34`);
  }
  if (cmd === 'dhcp-dora') return ok(`DHCP DORA: Discover → Offer → Request → Acknowledge`);
  if (cmd === 'security-zones')
    return ok(`Zones: Users | Servers | Voice | IoT/CCTV | Management | Guest | DMZ\nPrinciple: Least Privilege + Defense in Depth`);
  if (cmd === 'ports')
    return ok(
      `Common ports:\n  20/21 FTP   22 SSH   23 Telnet   25 SMTP   53 DNS\n  67/68 DHCP  80 HTTP  110 POP3    123 NTP   143 IMAP\n  443 HTTPS   445 SMB  3389 RDP    5060 SIP  8080 Alt-HTTP`
    );
  if (cmd === 'vlan') return ok(`VLAN = logical broadcast domain on a switch. Separates traffic without extra hardware. Trunk carries multiple VLANs (802.1Q).`);
  if (cmd === 'nat') return ok(`NAT translates private IPs to public. Types: Static, Dynamic, PAT (overload). Enables RFC1918 hosts to reach Internet.`);
  if (cmd === 'acl') return ok(`ACL filters traffic by IP/port/protocol. Standard (source IP) vs Extended (src/dst/port). Applied inbound/outbound on interfaces.`);
  if (cmd === 'stp') return ok(`STP prevents loops in switched networks. Blocks redundant ports. Variants: RSTP, MSTP. Root bridge election by Bridge ID.`);
  if (cmd === 'vpn') return ok(`VPN types: Site-to-Site, Remote Access, SSL/TLS, IPsec, WireGuard. Encrypts traffic over untrusted networks.`);
  if (cmd === 'proxy') return ok(`Proxy sits between client and server. Forward proxy (client-side) / Reverse proxy (server-side). Can cache, filter, authenticate.`);
  if (cmd === 'firewall') return ok(`Packet filter | Stateful | NGFW (app-aware) | WAF. Windows: Windows Defender Firewall + netsh advfirewall / Get-NetFirewallRule.`);
  if (cmd === 'wifi') return ok(`Standards: 802.11n (Wi-Fi 4), ac (5), ax (6), be (7). Security: WPA2/WPA3. Bands: 2.4 / 5 / 6 GHz.`);
  if (cmd === 'cable') return ok(`Copper: Cat5e / Cat6 / Cat6A (T568A/B). Fiber: OM3/OM4 MMF, OS2 SMF. Connectors: RJ45, LC, SC, SFP/SFP+.`);
  if (cmd === 'fiber') return ok(`MMF short reach high bandwidth; SMF long distance. Transceivers: SFP, SFP+, QSFP. Watch dBm levels and dirty connectors.`);
  if (cmd === 'bandwidth') return ok(`Bandwidth = capacity (Mbps). Throughput = actual goodput. Latency = delay. Utilization and loss reduce effective throughput.`);
  if (cmd === 'latency') return ok(`Latency (RTT), Jitter (variation), Packet Loss. VoIP sensitive to all three. Measure with ping / pathping / Test-NetConnection.`);

  // ── Linux-ish ──────────────────────────────────────────────
  if (cmd === 'ip') {
    if (argstr.includes('route')) return ok(`default via ${LAB.gateway} dev eth0\n192.168.1.0/24 dev eth0 proto kernel scope link src ${LAB.ipv4}`);
    if (argstr.includes('neigh')) return ok(`${LAB.gateway} dev eth0 lladdr aa:bb:cc:dd:ee:01 REACHABLE`);
    return ok(`1: lo: <LOOPBACK,UP>\n    inet 127.0.0.1/8\n2: eth0: <BROADCAST,UP>\n    inet ${LAB.ipv4}/24`);
  }
  if (cmd === 'ifconfig')
    return ok(`eth0: flags=4163<UP,BROADCAST,RUNNING>\n        inet ${LAB.ipv4}  netmask ${LAB.mask}  broadcast 192.168.1.255\n        ether ${LAB.mac.replace(/-/g, ':')}`);
  if (cmd === 'ss')
    return ok(`Netid State  Local Address:Port  Peer Address:Port\nudp   UNCONN 0.0.0.0:53         0.0.0.0:*\ntcp   LISTEN 0.0.0.0:445        0.0.0.0:*`);
  if (cmd === 'nmcli') return ok(`${LAB.adapter}: connected to Lab Network\n        inet4 ${LAB.ipv4}/24\n        route4 default via ${LAB.gateway}`);

  // ── fallback ───────────────────────────────────────────────
  return err(`دستور ناشناخته: ${cmd}\n«help» یا «help windows» را امتحان کنید. (${countCatalog()}+ دستور در کاتالوگ)`);
}
