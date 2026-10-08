<div align="center">

# 🌐 NetworkLearn | نتورک‌لرن

### پلتفرم بازی‌محور یادگیری شبکه — **ویندوز · لینوکس · PowerShell**

![NetworkLearn](https://img.shields.io/badge/NetworkLearn-v1.3-0ea5e9?style=for-the-badge)
![Commands](https://img.shields.io/badge/Commands-530%2B-22c55e?style=for-the-badge)
![Windows](https://img.shields.io/badge/Windows-CMD%20%7C%20PowerShell-0078d4?style=for-the-badge&logo=windows)
![Linux](https://img.shields.io/badge/Linux-ip%20ss%20nmcli-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

<p align="center">
  <b>ترمینال تعاملی · ۵۳۰+ دستور · کوئست · XP · نشان</b>
</p>

</div>

---

## 📖 درباره

نسخه بازی‌محور [NetworkEncyclopedia](https://github.com/MrUtility01/NetworkEncyclopedia) با شبیه‌ساز ترمینال برای:

| حوزه | محتوا |
|------|--------|
| **ویندوز CMD** | ipconfig · netsh · ping · tracert · netstat · arp · route · net |
| **PowerShell** | Get-NetAdapter · Get-NetIP* · Get-NetRoute · Test-NetConnection · Get-NetFirewall* · SMB |
| **لینوکس** | ip · ss · dig · nmcli · tcpdump · iptables/ufw · traceroute · mtr · resolvectl |
| **آموزشی** | OSI · subnet · VLAN · NAT · STP · DNS/DHCP · امنیت |

---

## ⌨️ راهنما در ترمینال

```text
help
help windows
help linux
help powershell
help network
lab-info
```

---

## 🚀 اجرا

```bash
git clone https://github.com/MrUtility01/networklearn.git
cd networklearn
npm install
cp .env.example .env
npm run dev
```

[http://localhost:3000](http://localhost:3000)

---

## 📂 ساختار

```text
src/lib/
  commandCatalog.ts    # ادغام A+B
  commandCatalogA.ts   # ویندوز + شروع لینوکس
  commandCatalogB.ts   # لینوکس کامل + PowerShell
  commands.ts          # موتور اجرا
  quests.ts
```

---

## 📄 لایسنس

MIT
