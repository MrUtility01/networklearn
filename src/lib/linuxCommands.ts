export interface LabState {
  hostname: string; user: string; domain: string; ipv4: string; mask: string;
  gateway: string; dns1: string; dns2: string; mac: string; adapter: string; dhcp: boolean;
}

export interface CmdResult {
  output: string;
  isError?: boolean;
}

function ok(o: string): CmdResult { return { output: o.trim() }; }

/** Precise Linux networking command simulation. Returns null if not a Linux cmd. */
export function runLinuxCommand(
  cmd: string,
  args: string[],
  argstr: string,
  fullLower: string,
  LAB: LabState
): CmdResult | null {
  if (cmd === 'ip') {
    if (argstr.includes('route') || args[0] === 'r') {
      if (argstr.includes('add') || argstr.includes('del')) return ok('RTNETLINK answers: operation completed. (Lab)');
      return ok(`default via ${LAB.gateway} dev eth0 proto dhcp metric 100\n192.168.1.0/24 dev eth0 proto kernel scope link src ${LAB.ipv4}`);
    }
    if (argstr.includes('neigh') || args[0] === 'n' || argstr.includes('neighbour')) {
      return ok(`${LAB.gateway} dev eth0 lladdr aa:bb:cc:dd:ee:01 REACHABLE\n192.168.1.10 dev eth0 lladdr 11:22:33:44:55:66 STALE`);
    }
    if (argstr.includes('link')) {
      if (argstr.includes('set')) return ok('Link state changed. (Lab)');
      const mac = LAB.mac.replace(/-/g, ':').toLowerCase();
      return ok(`1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    link/loopback 00:00:00:00:00:00\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    link/ether ${mac} brd ff:ff:ff:ff:ff:ff`);
    }
    if (argstr.includes('-s')) {
      return ok(`2: eth0: <BROADCAST,MULTICAST,UP>\n    RX: bytes  packets\n    14523010   98234\n    TX: bytes  packets\n    8234011    61200`);
    }
    const mac = LAB.mac.replace(/-/g, ':').toLowerCase();
    return ok(`1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    link/ether ${mac}\n    inet ${LAB.ipv4}/24 brd 192.168.1.255 scope global dynamic eth0`);
  }
  if (cmd === 'ifconfig') {
    const mac = LAB.mac.replace(/-/g, ':').toLowerCase();
    return ok(`eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet ${LAB.ipv4}  netmask ${LAB.mask}  broadcast 192.168.1.255\n        ether ${mac}\n        RX packets 98234  bytes 14523010\n        TX packets 61200  bytes 8234011\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0`);
  }
  if (cmd === 'ifup' || cmd === 'ifdown') return ok(`${cmd}: interface operation completed. (Lab)`);
  if (cmd === 'ethtool') return ok(`Settings for eth0:\n\tSpeed: 1000Mb/s\n\tDuplex: Full\n\tLink detected: yes`);
  if (cmd === 'ss') {
    if (argstr.includes('-s')) return ok(`Total: 214\nTCP:   48 (estab 12, closed 20)\nUDP:   16`);
    return ok(`Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port\ntcp   LISTEN 0      128    0.0.0.0:22           0.0.0.0:*\ntcp   LISTEN 0      128    0.0.0.0:80           0.0.0.0:*\nudp   UNCONN 0      0      0.0.0.0:53           0.0.0.0:*\ntcp   ESTAB  0      0      ${LAB.ipv4}:44342    40.99.10.20:443`);
  }
  if (cmd === 'lsof') return ok(`COMMAND  PID USER   TYPE  NAME\nsshd     882 root   IPv4  *:22 (LISTEN)\nnginx   1201 root   IPv4  *:80 (LISTEN)`);
  if (cmd === 'iptables') {
    if (argstr.includes('-S')) return ok(`-P INPUT ACCEPT\n-P FORWARD DROP\n-P OUTPUT ACCEPT\n-A INPUT -i lo -j ACCEPT\n-A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT\n-A INPUT -p tcp --dport 22 -j ACCEPT`);
    return ok(`Chain INPUT (policy ACCEPT)\ntarget     prot opt source               destination\nACCEPT     all  --  0.0.0.0/0            0.0.0.0/0\nACCEPT     all  --  0.0.0.0/0            0.0.0.0/0  state RELATED,ESTABLISHED\nACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0  tcp dpt:22\nChain FORWARD (policy DROP)\nChain OUTPUT (policy ACCEPT)`);
  }
  if (cmd === 'nft') return ok(`table inet filter {\n  chain input { type filter hook input priority 0; policy accept; }\n  chain forward { type filter hook forward priority 0; policy drop; }\n}`);
  if (cmd === 'firewall-cmd') {
    if (argstr.includes('state')) return ok('running');
    return ok(`public\n  interfaces: eth0\n  services: ssh dhcpv6-client\n  ports: 80/tcp 443/tcp`);
  }
  if (cmd === 'ufw') {
    if (argstr.includes('allow') || argstr.includes('deny') || argstr.includes('enable') || argstr.includes('disable'))
      return ok('Rules updated. (Lab)');
    return ok(`Status: active\n\nTo                         Action      From\n22/tcp                     ALLOW       Anywhere\n80/tcp                     ALLOW       Anywhere\n443/tcp                    ALLOW       Anywhere`);
  }
  if (cmd === 'nmcli') {
    if (argstr.includes('device')) return ok(`DEVICE  TYPE      STATE      CONNECTION\neth0    ethernet  connected  Wired connection 1\nwlan0   wifi      connected  Office-WiFi\nlo      loopback  unmanaged  --`);
    if (argstr.includes('connection')) return ok(`NAME                 TYPE      DEVICE\nWired connection 1   ethernet  eth0\nOffice-WiFi          wifi      wlan0`);
    if (argstr.includes('networking')) return ok('enabled');
    return ok('nmcli — try: nmcli device status | nmcli connection show');
  }
  if (cmd === 'systemctl') {
    const name = args[1] || args[0] || 'NetworkManager';
    return ok(`* ${name}.service\n     Loaded: loaded\n     Active: active (running)\n   Main PID: 1024`);
  }
  if (cmd === 'hostnamectl') return ok(`Static hostname: linux-lab-01\nOperating System: Ubuntu 24.04 LTS\nKernel: Linux 6.8.0\nArchitecture: x86-64`);
  if (cmd === 'uname') return ok('Linux linux-lab-01 6.8.0-generic #1 SMP x86_64 GNU/Linux');
  if (cmd === 'uptime') return ok(' 14:32:01 up 3 days,  4:12,  2 users,  load average: 0.08, 0.12, 0.15');
  if (cmd === 'tcpdump' || cmd === 'tshark') {
    return ok(`tcpdump: listening on eth0\n12:00:01.100 IP ${LAB.ipv4}.54321 > 8.8.8.8.53: UDP, length 32\n12:00:01.120 IP 8.8.8.8.53 > ${LAB.ipv4}.54321: UDP, length 64\n12:00:02.200 IP ${LAB.ipv4}.44342 > 40.99.10.20.443: Flags [P.]\n(Lab sample)`);
  }
  if (cmd === 'curl') {
    const host = args[args.length - 1] || 'https://example.com';
    if (argstr.includes('-i') || argstr.includes('-I')) return ok(`HTTP/2 200\ncontent-type: text/html\nserver: lab-sim`);
    return ok(`<html>OK (curl sim → ${host})</html>`);
  }
  if (cmd === 'wget') return ok('HTTP request sent... 200 OK\nLength: 1256\nSaved.');
  if (cmd === 'nc' || cmd === 'ncat') return ok(`Connection to ${args[0] || LAB.gateway} succeeded. (Lab)`);
  if (cmd === 'nmap') {
    const target = args[args.length - 1] || LAB.gateway;
    return ok(`Starting Nmap (lab)\nNmap scan report for ${target}\nHost is up.\nPORT    STATE SERVICE\n22/tcp  open  ssh\n80/tcp  open  http\n443/tcp open  https`);
  }
  if (cmd === 'iperf3') return ok('iperf3: lab simulation');
  if (cmd === 'bridge' || cmd === 'brctl') return ok('bridge name\tbridge id\tSTP\n(none in lab)');
  if (cmd === 'iwconfig' || cmd === 'iw' || cmd === 'iwlist') {
    return ok(`wlan0     IEEE 802.11  ESSID:"Office-WiFi"\n          Mode:Managed  Frequency:5.18 GHz\n          Bit Rate=866.7 Mb/s  Signal level=-40 dBm`);
  }
  if (cmd === 'resolvectl') {
    if (argstr.includes('query')) {
      const q = args[args.length - 1] || 'example.com';
      return ok(`${q}: 93.184.216.34`);
    }
    return ok(`Global\nCurrent DNS Server: ${LAB.dns1}\n       DNS Servers: ${LAB.dns1} ${LAB.dns2}`);
  }
  if (cmd === 'getent') return ok(`${args[args.length - 1] || 'example.com'}  93.184.216.34`);
  if (cmd === 'sysctl') {
    if (argstr.includes('ip_forward')) return ok('net.ipv4.ip_forward = 0');
    return ok('net.ipv4.ip_forward = 0');
  }
  if (cmd === 'dig') {
    const dname = args.find(a => !a.startsWith('@') && !a.startsWith('+') && !['A','MX','NS','AAAA'].includes(a)) || 'example.com';
    if (argstr.includes('mx')) return ok(`;; ANSWER:\n${dname}. 300 IN MX 10 mail.${dname}.`);
    if (argstr.includes('ns')) return ok(`;; ANSWER:\n${dname}. 300 IN NS ns1.${dname}.`);
    if (argstr.includes('+short')) return ok('93.184.216.34');
    return ok(`;; ANSWER:\n${dname}. 300 IN A 93.184.216.34`);
  }
  if (cmd === 'host') return ok(`${args[0] || 'example.com'} has address 93.184.216.34`);
  if (cmd === 'traceroute' || cmd === 'tracepath' || cmd === 'mtr') {
    const host = args.find(a => !a.startsWith('-')) || '8.8.8.8';
    return ok(`traceroute to ${host}\n 1  ${LAB.gateway}  1.0 ms\n 2  10.0.0.1  4.0 ms\n 3  ${host}  18.0 ms`);
  }
  if (fullLower.startsWith('cat /etc/') || fullLower.startsWith('cat /proc/net')) {
    if (fullLower.includes('resolv')) return ok(`nameserver ${LAB.dns1}\nnameserver ${LAB.dns2}`);
    if (fullLower.includes('hosts')) return ok(`127.0.0.1 localhost\n${LAB.ipv4} linux-lab-01`);
    if (fullLower.includes('interfaces')) return ok('auto eth0\niface eth0 inet dhcp');
    if (fullLower.includes('netplan')) return ok('network:\n  version: 2\n  ethernets:\n    eth0:\n      dhcp4: true');
    if (fullLower.includes('ifcfg')) return ok('DEVICE=eth0\nBOOTPROTO=dhcp\nONBOOT=yes');
    if (fullLower.includes('/proc/net/dev')) return ok('Inter-| Receive | Transmit\n eth0: 14523010 98234 0 0  8234011 61200');
    if (fullLower.includes('/proc/net/route')) return ok('Iface Destination Gateway Flags\neth0 00000000 0101A8C0 0003');
    if (fullLower.includes('/proc/net/arp')) return ok(`IP address       HW address\n${LAB.gateway}     aa:bb:cc:dd:ee:01`);
    return ok('(file simulation)');
  }
  return null;
}
