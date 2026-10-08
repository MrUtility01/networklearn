import { COMMAND_CATALOG, COMMAND_COUNT } from './commandCatalog';
import { runLinuxCommand } from './linuxCommands';

export interface CommandResult {
  output: string;
  isError?: boolean;
}

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

const OSI: Record<number, { name: string; pdu: string; desc: string }> = {
  7: { name: 'Application', pdu: 'Data', desc: 'HTTP DNS FTP SMTP RDP' },
  6: { name: 'Presentation', pdu: 'Data', desc: 'Encryption compression' },
  5: { name: 'Session', pdu: 'Data', desc: 'Session management' },
  4: { name: 'Transport', pdu: 'Segment', desc: 'TCP UDP ports' },
  3: { name: 'Network', pdu: 'Packet', desc: 'IP routing' },
  2: { name: 'Data Link', pdu: 'Frame', desc: 'MAC switching FCS' },
  1: { name: 'Physical', pdu: 'Bits', desc: 'Cable signal NIC' },
};

const EDU: Record<string, string> = {
  'packet-journey': 'Encapsulation: App→Pres→Sess→Trans(+TCP)→Net(+IP)→DL(+MAC)→Phys. Reverse at dest.',
  'show-mac': 'VLAN  MAC                Type     Ports\n1     aa:bb:cc:11:22:33  DYNAMIC  Gi0/1\n1     aa:bb:cc:44:55:66  DYNAMIC  Gi0/2',
  'switch-behavior': '1 Learn SRC MAC  2 Known DST→Forward  3 Unknown/Bcast→Flood  4 Same port→Filter',
  'domains': 'Collision Domain = per switch port. Broadcast Domain = whole VLAN.',
  'private-ranges': 'RFC1918: 10.0.0.0/8  172.16.0.0/12  192.168.0.0/16\nAPIPA: 169.254.0.0/16  Loopback: 127.0.0.0/8',
  'arp-how': 'Broadcast Who-has IP? → Unicast reply with MAC. Risk: ARP spoofing.',
  'tcp-handshake': 'SYN → SYN+ACK → ACK',
  'dns-records': 'A AAAA CNAME MX NS PTR TXT SOA SRV CAA',
  'dhcp-dora': 'Discover → Offer → Request → Acknowledge',
  'security-zones': 'Users | Servers | Voice | IoT | Management | Guest | DMZ — Least Privilege',
  'ports': '22 SSH  53 DNS  67/68 DHCP  80 HTTP  443 HTTPS  445 SMB  3389 RDP  25 SMTP',
  'vlan': 'Logical broadcast domain on switch. Trunk = 802.1Q multiple VLANs.',
  'nat': 'Private↔Public translation. Static / Dynamic / PAT (overload).',
  'acl': 'Filter by IP/port/protocol. Standard vs Extended. In/out on interface.',
  'stp': 'Prevents loops. Blocks redundant ports. RSTP/MSTP. Root by Bridge ID.',
  'vpn': 'Site-to-Site, Remote Access, SSL, IPsec, WireGuard.',
  'proxy': 'Forward (client) / Reverse (server). Cache filter authenticate.',
  'firewall': 'Packet filter | Stateful | NGFW | WAF. Windows: Defender + netsh advfirewall.',
  'wifi': '802.11n/ac/ax/be — WPA2/WPA3 — 2.4/5/6 GHz',
  'cable': 'Cat5e/6/6A T568A/B — Fiber OM3/OM4 OS2 — RJ45 LC SC SFP',
  'fiber': 'MMF short high BW; SMF long distance. Watch dBm and dirty connectors.',
  'bandwidth': 'Capacity vs Throughput. Loss and latency cut effective throughput.',
  'latency': 'RTT + Jitter + Loss. VoIP sensitive. Measure: ping pathping TNC.',
  'mtu': 'Max Transmission Unit. Default Ethernet 1500. Path MTU Discovery.',
  'qos': 'Prioritize traffic (voice/video). DSCP, queues, shaping, policing.',
  'load-balancing': 'Distribute sessions across links/servers. ECMP, LACP, LB appliances.',
  'ha': 'Redundancy: active/passive or active/active. Failover, clustering.',
  'sdn': 'Control plane separated from data plane. Central controller.',
  'vxlan': 'L2 overlay on L3. VNI. Common in data centers.',
  'bgp': 'Internet routing protocol. Path vector. eBGP/iBGP.',
  'ospf': 'Link-state IGP. Areas. Fast convergence.',
  'eigrp': 'Cisco hybrid IGP. DUAL algorithm.',
  'rip': 'Distance-vector. Hop count max 15. Legacy.',
  'mpls': 'Labels instead of IP lookup in core. TE, VPN.',
  'gre': 'Simple tunnel encapsulating packets. Often + IPsec.',
  'ipsec': 'AH/ESP. IKE. Confidentiality integrity auth.',
  'ssl': 'TLS handshake certs. HTTPS. SSL VPN.',
  'dhcp-options': 'Option 3 Router, 6 DNS, 15 Domain, 42 NTP, 66/67 PXE.',
  'dnssec': 'Signed DNS records. Prevents cache poisoning.',
  'cdp': 'Cisco Discovery Protocol — neighbor info.',
  'lldp': 'Vendor-neutral neighbor discovery.',
  'pagp': 'Cisco EtherChannel negotiation.',
  'lacp': '802.3ad link aggregation.',
  'hsrp': 'Cisco first-hop redundancy.',
  'vrrp': 'Standard FHRP.',
  'glbp': 'Cisco load-balancing gateway.',
  'etherchannel': 'Bundle multiple links. LACP/PAgP/on.',
  'port-security': 'Limit MAC per port. Violation: shutdown/restrict/protect.',
  'dhcp-snooping': 'Trusted ports only for DHCP server messages.',
  'dynamic-arp-inspection': 'Validate ARP against DHCP snooping binding.',
  'ip-source-guard': 'Filter IP based on DHCP binding.',
  'about-network': 'LAN WAN MAN Intranet Internet — OSI 7 layers / TCP-IP 4 layers',
  'cmd': 'Simulated Windows CMD lab. Type help windows',
  'powershell': 'Simulated PowerShell networking. Try Get-NetAdapter',
  'exit': 'Close the browser tab to leave the lab. (Simulation)',
  'title': 'Title changed. (Simulation)',
  'color': 'Console color changed. (Simulation)',
  'prompt': 'Prompt noted. Lab keeps C:\\Users\\Student>',
  'tcpdump': 'Linux packet capture. Example: tcpdump -i eth0 port 53',
  'wireshark': 'GUI packet analyzer. Capture vs display filter. Follow TCP stream.',
  'mtr': 'Combined traceroute+ping. Windows: pathping',
  'tracepath': 'MTU path discovery (Linux).',
  'nmtui': 'NetworkManager TUI (Linux).',
  'resolvectl': 'systemd-resolved status (Linux).',
  'host': 'Simple DNS lookup. Windows: nslookup / Resolve-DnsName',
};

function ok(o: string): CommandResult { return { output: o.trim() }; }
function err(o: string): CommandResult { return { output: o.trim(), isError: true }; }

function helpText(filter?: string): string {
  let cats = COMMAND_CATALOG;
  const f = (filter || '').toLowerCase();
  if (f === 'windows' || f === 'win') {
    cats = COMMAND_CATALOG.filter(c => !c.cat.includes('لینوکس') && !c.cat.includes('آموزشی'));
  } else if (f === 'linux' || f === 'lin') {
    cats = COMMAND_CATALOG.filter(c => c.cat.includes('لینوکس'));
  } else if (f === 'powershell' || f === 'ps') {
    cats = COMMAND_CATALOG.filter(c => c.cat.includes('PowerShell') || c.cat.includes('DNS Client'));
  } else if (f === 'network' || f === 'net') {
    cats = COMMAND_CATALOG.filter(c =>
      !c.cat.includes('سرویس و فرآیند') && !c.cat.includes('رویداد') && !c.cat.includes('دامنه')
    );
  }
  let total = 0;
  let out = `NetworkLearn Lab — ${COMMAND_COUNT} commands\n${'='.repeat(52)}\n\n`;
  for (const c of cats) {
    out += `▸ ${c.cat}\n`;
    for (const cmd of c.cmds) {
      out += `  ${cmd.name.padEnd(44)} ${cmd.desc}\n`;
      total++;
    }
    out += '\n';
  }
  out += `Showing ${total} | Catalog total: ${COMMAND_COUNT}\n`;
  out += 'Filters: help windows | help linux | help powershell | help network\n';
  return out;
}

function pingOut(host: string, count = 4): string {
  const lines = [];
  for (let i = 1; i <= count; i++) {
    const t = (0.4 + Math.random() * 2).toFixed(1);
    lines.push(`Reply from ${host}: bytes=32 time=${t}ms TTL=64`);
  }
  return `Pinging ${host} with 32 bytes of data:\n${lines.join('\n')}\n\nPing statistics for ${host}:\n    Packets: Sent = ${count}, Received = ${count}, Lost = 0 (0% loss)`;
}

export function runCommand(raw: string): CommandResult {
  const input = raw.trim();
  if (!input) return { output: '' };
  const lower = input.toLowerCase();
  const parts = input.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const argstr = args.join(' ').toLowerCase();
  const fullLower = lower;

  if (cmd === 'clear' || cmd === 'cls') return { output: '__CLEAR__' };
  if (cmd === 'help' || cmd === '?') return ok(helpText(args[0]));

  if (EDU[fullLower]) return ok(EDU[fullLower]);
  if (EDU[cmd] && args.length === 0) return ok(EDU[cmd]);

  if (cmd === 'osi') {
    if (args[0]) {
      const n = parseInt(args[0], 10);
      const L = OSI[n];
      if (!L) return err('Layer must be 1-7');
      return ok(`Layer ${n}: ${L.name}\nPDU: ${L.pdu}\n${L.desc}`);
    }
    let o = 'OSI Model:\n';
    for (let i = 7; i >= 1; i--) o += `  ${i}. ${OSI[i].name.padEnd(14)} [${OSI[i].pdu}]\n`;
    return ok(o + '\nDetail: osi <1-7>');
  }

  if (cmd === 'subnet') {
    if (args.length < 2) return err('Usage: subnet <net/mask> <hosts>  e.g. subnet 192.168.10.0/24 50');
    const hosts = parseInt(args[1], 10);
    if (isNaN(hosts) || hosts < 1) return err('Invalid hosts');
    let hb = 1;
    while (Math.pow(2, hb) - 2 < hosts) hb++;
    return ok(`Hosts: ${hosts}\nHost bits: ${hb}\nMask: /${32 - hb}\nUsable: ${Math.pow(2, hb) - 2}`);
  }

  if (cmd === 'whoami') {
    if (argstr.includes('/groups')) return ok(`LAB\\Domain Users\nLAB\\Students\nEveryone\nBUILTIN\\Users`);
    if (argstr.includes('/priv')) return ok(`SeChangeNotifyPrivilege  Enabled`);
    if (argstr.includes('/all')) return ok(`USER: ${LAB.domain}\\${LAB.user}\nGROUPS: Domain Users`);
    return ok(`${LAB.domain}\\${LAB.user}`);
  }
  if (cmd === 'hostname') return ok(LAB.hostname);
  if (cmd === 'ver' || cmd === 'winver') return ok('Microsoft Windows [Version 10.0.26100.1]\nNetworkLearn Lab');
  if (cmd === 'date') return ok(new Date().toLocaleDateString('en-US'));
  if (cmd === 'time') return ok(new Date().toLocaleTimeString('en-US'));
  if (cmd === 'echo') {
    const t = argstr;
    if (t.includes('%userdomain%')) return ok(LAB.domain);
    if (t.includes('%logonserver%')) return ok('\\\\DC01');
    if (t.includes('%computername%')) return ok(LAB.hostname);
    if (t.includes('%username%')) return ok(LAB.user);
    if (t.includes('%userdnsdomain%')) return ok(LAB.domain);
    return ok(args.join(' ') || '');
  }
  if (cmd === 'lab-info') return ok(`Host: ${LAB.hostname}\nUser: ${LAB.user}@${LAB.domain}\nIP: ${LAB.ipv4}  GW: ${LAB.gateway}\nDNS: ${LAB.dns1}, ${LAB.dns2}\nMAC: ${LAB.mac}\nCommands: ${COMMAND_COUNT}`);
  if (cmd === 'systeminfo' || cmd === 'msinfo32') return ok(`Host Name: ${LAB.hostname}\nOS: Windows 11 Pro\nDomain: ${LAB.domain}\nNIC: ${LAB.adapter} ${LAB.mac}\nIP: ${LAB.ipv4}`);
  if (cmd === 'set') return ok(`COMPUTERNAME=${LAB.hostname}\nUSERDOMAIN=${LAB.domain}\nUSERNAME=${LAB.user}\nLOGONSERVER=\\\\DC01`);

  if (cmd === 'ipconfig') {
    if (argstr.includes('/all') || argstr.includes('/allcompartments')) return ok(`Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : ${LAB.hostname}\n   Primary Dns Suffix  . . . . . . . : ${LAB.domain}\n\nEthernet adapter ${LAB.adapter}:\n   Physical Address. . . . . . . . . : ${LAB.mac}\n   DHCP Enabled. . . . . . . . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : ${LAB.ipv4}(Preferred)\n   Subnet Mask . . . . . . . . . . . : ${LAB.mask}\n   Default Gateway . . . . . . . . . : ${LAB.gateway}\n   DHCP Server . . . . . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . . . . . : ${LAB.dns1}\n                                       ${LAB.dns2}`);
    if (argstr.includes('/release')) return ok(`${LAB.adapter}\n    IP address released.`);
    if (argstr.includes('/renew') || argstr.includes('renew6') || argstr.includes('release6')) return ok(`Ethernet adapter ${LAB.adapter}:\n   IPv4 Address. . . . . . . . . . . : ${LAB.ipv4}\n   Subnet Mask . . . . . . . . . . . : ${LAB.mask}\n   Default Gateway . . . . . . . . . : ${LAB.gateway}`);
    if (argstr.includes('/flushdns')) return ok('Successfully flushed the DNS Resolver Cache.');
    if (argstr.includes('/displaydns')) return ok(`example.com\n    A (Host) Record . . . : 93.184.216.34`);
    if (argstr.includes('/registerdns')) return ok('Registration of DNS resource records initiated.');
    return ok(`Ethernet adapter ${LAB.adapter}:\n   IPv4 Address. . . . . . . . . . . : ${LAB.ipv4}\n   Subnet Mask . . . . . . . . . . . : ${LAB.mask}\n   Default Gateway . . . . . . . . . : ${LAB.gateway}`);
  }
  if (cmd === 'getmac') return ok(argstr.includes('/v') || argstr.includes('/fo') ? `Network Adapter   Physical Address\n${LAB.adapter.padEnd(18)} ${LAB.mac}` : `${LAB.mac}`);

  if (cmd === 'netsh') {
    const j = argstr;
    if (j.includes('wlan show networks')) return ok(`SSID 1 : Office-WiFi\nSSID 2 : Guest\nSSID 3 : Home-5G`);
    if (j.includes('wlan show drivers')) return ok(`Driver: Intel Wi-Fi 6 AX201\nRadio types: 802.11n/ac/ax`);
    if (j.includes('wlan show profile')) return ok(`Profile Office-WiFi\nAuthentication: WPA2-Personal\nCipher: CCMP`);
    if (j.includes('wlan export') || j.includes('wlan delete') || j.includes('wlan connect') || j.includes('wlan disconnect') || j.includes('hostednetwork')) return ok('Command completed successfully. (Lab simulation)');
    if (j.includes('wlan show profiles')) return ok(`All User Profile     : Office-WiFi\nAll User Profile     : Home-5G`);
    if (j.includes('wlan show interfaces')) return ok(`Name: Wi-Fi\nState: connected\nSSID: Office-WiFi\nSignal: 88%`);
    if (j.includes('wlanreport')) return ok('WLAN report generated (simulation).');
    if (j.includes('advfirewall') || j.includes('firewall')) {
      if (j.includes('add rule') || j.includes('delete rule') || j.includes('set allprofiles') || j.includes('reset')) return ok('Ok. (Lab simulation)');
      if (j.includes('rule')) return ok(`Rule: Core Networking - DNS (UDP-Out)\nEnabled: Yes  Direction: Out  Action: Allow`);
      return ok(`Domain/Private/Public Profile: State ON`);
    }
    if (j.includes('portproxy')) return ok('(none)');
    if (j.includes('tcp show global')) return ok(`Receive-Side Scaling: enabled\nChimney Offload: disabled`);
    if (j.includes('show interface') || (j.includes('interface show') && !j.includes('ip'))) return ok(`Admin State  State      Interface\nEnabled      Connected  ${LAB.adapter}\nEnabled      Connected  Wi-Fi`);
    if (j.includes('ip show') || j.includes('ipv4 show') || j.includes('ipv6 show')) {
      if (j.includes('route')) return ok(`0.0.0.0/0 via ${LAB.gateway}\n192.168.1.0/24 on-link`);
      if (j.includes('neighbor')) return ok(`${LAB.gateway}  aa-bb-cc-dd-ee-01  Reachable`);
      if (j.includes('dns')) return ok(`DNS: ${LAB.dns1}, ${LAB.dns2}`);
      return ok(`Interface ${LAB.adapter}\n  IP: ${LAB.ipv4}\n  Mask: ${LAB.mask}\n  GW: ${LAB.gateway}`);
    }
    if (j.includes('set ') || j.includes('add ') || j.includes('delete ') || j.includes('reset')) return ok('Ok. (Lab simulation)');
    if (j.includes('winhttp')) return ok('Direct access (no proxy server).');
    return ok('netsh — try: interface show interface | ip show config | wlan show profiles | advfirewall show allprofiles');
  }

  if (cmd === 'ping' || cmd === 'test-connection') {
    const host = args.find(a => !a.startsWith('-')) || LAB.gateway;
    let count = argstr.includes('-t') ? 8 : 4;
    const ni = args.findIndex(a => a === '-n' || a === '-c');
    if (ni >= 0 && args[ni + 1]) count = Math.min(parseInt(args[ni + 1], 10) || 4, 10);
    return ok(pingOut(host, count));
  }
  if (cmd === 'tracert' || cmd === 'traceroute') {
    const host = args.find(a => !a.startsWith('-')) || '8.8.8.8';
    return ok(`Tracing route to ${host}:\n  1  ${LAB.gateway}  <1 ms\n  2  10.0.0.1  4 ms\n  3  ${host}  18 ms\nTrace complete.`);
  }
  if (cmd === 'pathping') {
    const host = args.find(a => !a.startsWith('-')) || '8.8.8.8';
    return ok(`Tracing route to ${host}\n  0  ${LAB.ipv4}\n  1  ${LAB.gateway}\n  2  ${host}\n  Hop  RTT  Lost/Sent\n  1    1ms  0/100\n  2   18ms  0/100\nTrace complete.`);
  }
  if (cmd === 'nslookup') {
    const host = args.find(a => !a.startsWith('-') && !a.includes('=')) || 'example.com';
    if (argstr.includes('mx')) return ok(`Server: ${LAB.dns1}\n${host}  mx = 10 mail.${host}`);
    if (argstr.includes('ns')) return ok(`Server: ${LAB.dns1}\n${host}  nameserver = ns1.${host}`);
    if (argstr.includes('aaaa')) return ok(`Server: ${LAB.dns1}\n${host}  AAAA = 2606:2800:220:1:248:1893:25c8:1946`);
    if (argstr.includes('txt')) return ok(`Server: ${LAB.dns1}\n${host}  text = "v=spf1 ~all"`);
    if (argstr.includes('soa')) return ok(`Server: ${LAB.dns1}\nprimary = ns1.${host}`);
    if (argstr.includes('ptr')) return ok(`Server: ${LAB.dns1}\nName: example.com`);
    if (argstr.includes('srv')) return ok(`Server: ${LAB.dns1}\n_ldap._tcp  SRV 0 100 389 dc01.lab.local`);
    if (argstr.includes('cname')) return ok(`Server: ${LAB.dns1}\nwww.${host}  CNAME = ${host}`);
    return ok(`Server: ${LAB.dns1}\nName: ${host}\nAddress: 93.184.216.34`);
  }
  if (cmd === 'arp') {
    if (argstr.includes('-d') || argstr.includes('-s')) return ok('ARP entry operation completed. (Simulation)');
    return ok(`Interface: ${LAB.ipv4}\n  ${LAB.gateway}           aa-bb-cc-dd-ee-01     dynamic\n  192.168.1.10          11-22-33-44-55-66     dynamic`);
  }
  if (cmd === 'route') {
    if (argstr.includes('add') || argstr.includes('delete') || argstr.includes('change')) return ok('OK! (Lab simulation)');
    return ok(`IPv4 Route Table\n0.0.0.0          0.0.0.0      ${LAB.gateway}     ${LAB.ipv4}     25\n192.168.1.0    255.255.255.0         On-link      ${LAB.ipv4}    281`);
  }
  if (cmd === 'netstat') {
    if (argstr.includes('-s') || argstr.includes('-es')) return ok(`TCP Statistics\n  Active Opens = 312\n  Current Connections = 14`);
    if (argstr.includes('-e')) return ok(`Bytes Received 14523010  Sent 8234011`);
    if (argstr.includes('-r')) return runCommand('route print');
    const pid = argstr.includes('-o') || argstr.includes('-ano') || argstr.includes('-b');
    return ok(`Active Connections\n  Proto  Local Address          Foreign Address        State${pid ? '    PID' : ''}\n  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING${pid ? '  4' : ''}\n  TCP    ${LAB.ipv4}:49712      40.99.10.20:443        ESTABLISHED${pid ? '  5820' : ''}`);
  }

  if (cmd === 'net') {
    const sub = (args[0] || '').toLowerCase();
    const map: Record<string, string> = {
      view: `\\\\${LAB.hostname}\n\\\\DC01\n\\\\FS01`,
      share: `ADMIN$  C:\\Windows\nC$  C:\\`,
      use: 'There are no entries in the list.',
      user: `Administrator  Guest  ${LAB.user}`,
      localgroup: argstr.includes('admin') ? `Administrator\n${LAB.user}` : `*Administrators *Guests *Users`,
      accounts: 'Min password length: 8\nLockout threshold: 5',
      session: 'There are no entries in the list.',
      statistics: `Bytes received 14523010`,
      config: `Computer \\\\${LAB.hostname}\nDomain ${LAB.domain}`,
      start: 'DHCP Client\nDNS Client\nWorkstation\nServer',
      stop: `The ${args[1] || 'service'} service was stopped. (Simulation)`,
      pause: 'Service paused. (Simulation)',
      continue: 'Service continued. (Simulation)',
      file: 'There are no entries in the list.',
      group: 'Domain group query (simulation).',
      print: 'Printers: (none)',
      help: 'net view|share|use|user|localgroup|accounts|session|start|stop',
      helpmsg: 'Message text (simulation).',
      time: `Current time at \\\\DC01 is ${new Date().toLocaleString()}`,
      name: LAB.hostname,
    };
    if (map[sub]) return ok(map[sub] + (sub !== 'help' ? '\nThe command completed successfully.' : ''));
    return ok('net view|share|use|user|localgroup|accounts|session|statistics|config|start|stop');
  }

  if (cmd === 'nbtstat') {
    if (argstr.includes('-r') || argstr.includes('-rr') || argstr.includes('-R')) return ok('Resolved by broadcast: 12\nResolved by name server: 48');
    if (argstr.includes('-c') || argstr.includes('-s') || argstr.includes('-S')) return ok(`DC01  <20>  UNIQUE  192.168.1.10`);
    return ok(`${LAB.hostname} <00> UNIQUE Registered\n${LAB.domain} <00> GROUP Registered`);
  }

  const ps = cmd;
  if (ps.startsWith('get-netadapter') || ps === 'get-netadapterstatistics' || ps === 'get-netadapterbinding' || ps === 'get-netadapteradvancedproperty' || ps === 'get-netadapterrss')
    return ok(`Name     Status  MacAddress         LinkSpeed\n${LAB.adapter}  Up      ${LAB.mac}  10 Gbps\nWi-Fi    Up      AA-BB-CC-11-22-33  1.2 Gbps`);
  if (ps.startsWith('enable-netadapter') || ps.startsWith('disable-netadapter') || ps.startsWith('rename-netadapter') || ps.startsWith('restart-netadapter'))
    return ok('Adapter operation completed. (Simulation)');
  if (ps === 'get-netipaddress' || ps === 'get-netipconfiguration' || ps === 'get-netipinterface')
    return ok(`IPv4 ${LAB.ipv4}/24 on ${LAB.adapter}\nGateway ${LAB.gateway}\nDNS ${LAB.dns1}, ${LAB.dns2}`);
  if (ps === 'new-netipaddress' || ps === 'remove-netipaddress' || ps === 'set-netipinterface') return ok('IP configuration updated. (Simulation)');
  if (ps === 'get-netroute' || ps === 'find-netroute') return ok(`0.0.0.0/0 → ${LAB.gateway}\n192.168.1.0/24 on-link`);
  if (ps === 'new-netroute' || ps === 'remove-netroute') return ok('Route updated. (Simulation)');
  if (ps === 'get-netneighbor') return ok(`${LAB.gateway} aa-bb-cc-dd-ee-01 Reachable`);
  if (ps === 'get-nettcpconnection') return ok(`Local ${LAB.ipv4}:49712 → 40.99.10.20:443 Established`);
  if (ps === 'get-netudpendpoint') return ok(`0.0.0.0:53  0.0.0.0:123`);
  if (ps.includes('firewall')) {
    if (ps.startsWith('enable-') || ps.startsWith('disable-') || ps.startsWith('new-')) return ok('Firewall rule OK. (Simulation)');
    return ok(`CoreNet-DNS-Out  Enabled Outbound Allow`);
  }
  if (ps === 'get-netconnectionprofile' || ps === 'set-netconnectionprofile') return ok(`Name: ${LAB.domain}\nNetworkCategory: DomainAuthenticated`);
  if (ps.includes('smb')) return ok(ps.includes('get') ? `ADMIN$  C$  IPC$` : 'SMB operation completed. (Simulation)');
  if (ps === 'get-netlbfoteam' || ps === 'get-netqospolicy') return ok('(none configured in lab)');
  if (ps === 'resolve-dnsname') return ok(`Name: ${args[0] || 'example.com'}\nType: A  IP: 93.184.216.34`);
  if (ps.startsWith('get-dnsclient') || ps === 'clear-dnsclientcache' || ps === 'register-dnsclient' || ps === 'set-dnsclientserveraddress' || ps === 'set-dnsclientglobalsetting') {
    if (ps.startsWith('get')) return ok(`Interface ${LAB.adapter}\nDNS: ${LAB.dns1}, ${LAB.dns2}`);
    return ok('DNS client operation completed. (Simulation)');
  }
  if (ps === 'test-netconnection' || ps === 'tnc') {
    const host = args[0] || LAB.gateway;
    return ok(`ComputerName: ${host}\nPingSucceeded: True\nTcpTestSucceeded: True`);
  }
  if (ps === 'get-service' || ps === 'start-service' || ps === 'stop-service' || ps === 'restart-service') {
    if (ps !== 'get-service') return ok('Service operation completed. (Simulation)');
    return ok(`Running  Dhcp\nRunning  Dnscache\nRunning  LanmanWorkstation`);
  }
  if (ps === 'get-process' || ps === 'stop-process' || cmd === 'tasklist' || cmd === 'taskkill') {
    if (cmd === 'taskkill' || ps === 'stop-process') return ok('Process terminated. (Simulation)');
    return ok(`Image Name        PID\nsvchost.exe       1088\nSystem               4`);
  }
  if (cmd === 'sc') {
    if (argstr.includes('start') || argstr.includes('stop') || argstr.includes('config')) return ok('Service control OK. (Simulation)');
    return ok(`SERVICE_NAME: ${args[1] || 'dnscache'}\nSTATE: 4 RUNNING`);
  }
  if (cmd === 'gpresult') return ok(`USER SETTINGS\nCN=${LAB.user},CN=Users,DC=LAB,DC=LOCAL\nApplied from: DC01.LAB.LOCAL`);
  if (cmd === 'gpupdate') return ok('Computer Policy update completed.\nUser Policy update completed.');
  if (cmd === 'nltest') return ok(`DC: \\\\DC01\nAddress: \\\\192.168.1.10\nDom Name: ${LAB.domain}`);
  if (cmd === 'klist') return ok(argstr.includes('purge') ? 'Tickets purged.' : `Cached Tickets: (1)\nServer: krbtgt/${LAB.domain}`);
  if (cmd === 'setspn') return ok(`HOST/${LAB.hostname}\nHOST/${LAB.hostname}.${LAB.domain}`);
  if (cmd === 'dsquery' || ps.startsWith('get-ad')) return ok(`DC01  FS01  ${LAB.hostname}\nDomain: ${LAB.domain}`);
  if (cmd === 'repadmin') return ok('Replication is healthy. (Simulation)');
  if (cmd === 'get-winevent' || cmd === 'wevtutil') return ok(`4201 Information  The network link is up`);
  if (cmd === 'eventvwr' || cmd === 'perfmon' || cmd === 'resmon' || cmd.endsWith('.msc') || cmd.endsWith('.cpl') || cmd === 'msconfig' || cmd === 'dxdiag' || cmd === 'control')
    return ok(`${input} — در ویندوز واقعی GUI باز می‌شود. از دستورات CLI معادل استفاده کنید.`);
  if (cmd === 'chkdsk' || cmd === 'sfc' || cmd === 'dism' || cmd === 'powercfg' || cmd === 'winsat')
    return ok(`${cmd}: completed with no issues. (Lab simulation)`);
  if (cmd === 'certmgr.msc' || cmd === 'certutil' || ps === 'get-childitem' || ps === 'get-tlsciphersuite')
    return ok('Certificate store accessible. (Lab simulation)');
  if (ps.includes('ipsec') || ps.includes('vpn') || cmd === 'rasdial' || cmd === 'rasphone')
    return ok('VPN/IPsec: no active tunnels in lab.');
  if (ps.includes('bitlocker') || cmd === 'manage-bde') return ok('BitLocker status: Protection On (Simulation)');
  if (cmd === 'telnet') return ok(`Connecting To ${args[0] || LAB.gateway}...\n(Use Test-NetConnection for modern checks)`);

  const linuxResult = runLinuxCommand(cmd, args, argstr, fullLower, LAB);
  if (linuxResult) return linuxResult;

  const inCatalog = COMMAND_CATALOG.some(c =>
    c.cmds.some(x => x.name.toLowerCase() === fullLower || x.name.toLowerCase().startsWith(cmd))
  );
  if (inCatalog) {
    return ok(`✓ «${input}» در کاتالوگ NetworkLearn (${COMMAND_COUNT} دستور) شناخته شد.\nشبیه‌سازی خلاصه اجرا شد. برای خروجی کامل‌تر: ipconfig /all | netsh | Get-NetAdapter | ip addr | ss -tuln\nhelp windows | help linux`);
  }

  return err(`دستور ناشناخته: ${cmd}\nhelp  |  help windows  |  help linux  |  ${COMMAND_COUNT} commands`);
}
