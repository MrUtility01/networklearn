<div align="center">

# 🌐 NetworkLearn | نتورک‌لرن

### پلتفرم بازی‌محور و شبیه‌ساز تعاملی یادگیری شبکه — با تمرکز قوی روی **ویندوز**

![NetworkLearn](https://img.shields.io/badge/NetworkLearn-v1.1-0ea5e9?style=for-the-badge&logo=windows&logoColor=white)
![Commands](https://img.shields.io/badge/Commands-200%2B-22c55e?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

<p align="center">
  <b>ترمینال شبیه CMD/PowerShell · بیش از ۲۰۰ دستور شبکه · کوئست · XP · نشان</b>
</p>

</div>

---

## 📖 درباره پروژه

**NetworkLearn** نسخه بازی‌محور [NetworkEncyclopedia](https://github.com/MrUtility01/NetworkEncyclopedia) است.  
در مرورگر یک **لاب ویندوزی** دارید با خروجی‌های واقعی‌مانند برای دستورات شبکه ویندوز — بدون VM و بدون تجهیزات.

---

## 🪟 دستورات ویندوز (اولویت اصلی)

| دسته | نمونه دستورات |
|------|----------------|
| **IP و آداپتر** | `ipconfig` · `ipconfig /all` · `/release` · `/renew` · `/flushdns` · `getmac` |
| **netsh** | `interface show` · `ip show config` · `wlan show profiles` · `advfirewall` · `show route` |
| **عیب‌یابی** | `ping` · `tracert` · `pathping` · `nslookup` · `Test-NetConnection` · `tnc` |
| **ARP / Route / Netstat** | `arp -a` · `route print` · `netstat -an` · `-ano` · `-s` · `-e` |
| **net** | `net view` · `share` · `user` · `localgroup` · `start` · `config` · `session` |
| **DNS** | `Resolve-DnsName` · `Get-DnsClient*` · `Clear-DnsClientCache` · `nbtstat` |
| **PowerShell Net** | `Get-NetAdapter` · `Get-NetIPAddress` · `Get-NetRoute` · `Get-NetNeighbor` · `Get-NetTCPConnection` · `Get-NetFirewallRule` · `Get-SmbShare` |
| **سرویس** | `sc query` · `Get-Service` · `tasklist` · `net start` |
| **دامنه / GPO** | `gpresult` · `gpupdate` · `nltest` · `whoami` · `systeminfo` |

در ترمینال بزنید:

```text
help windows
help network
help
```

---

## ✨ سایر قابلیت‌ها

- **کوئست‌های مرحله‌ای** بر اساس سرفصل NetworkEncyclopedia (OSI، سوییچینگ، IP، پروتکل، DNS/DHCP، امنیت)
- **گیم‌فیکیشن:** XP، سطح، نشان — ذخیره در `localStorage`
- **TAB autocomplete** برای دستورات رایج ویندوز
- **پرامپت ویندوزی:** `C:\Users\Student>`
- **AI Mentor** (اختیاری با `GEMINI_API_KEY`)
- RTL فارسی + فونت وزیرمتن

---

## 🗺️ سرفصل کوئست‌ها

| سطح | عنوان |
|:---:|:---|
| ۱ | مبانی شبکه و مدل OSI |
| ۲ | اترنت و سوییچینگ |
| ۳ | IPv4 / IPv6 و ساب‌نتینگ |
| ۴ | ARP · ICMP · TCP · UDP |
| ۵ | DNS و DHCP |
| ۶ | امنیت شبکه پایه |

---

## 🚀 اجرا

```bash
git clone https://github.com/MrUtility01/networklearn.git
cd networklearn
npm install
cp .env.example .env
npm run dev
```

باز کردن: [http://localhost:3000](http://localhost:3000)

| اسکریپت | کار |
|---------|-----|
| `npm run dev` | توسعه |
| `npm run build` | بیلد |
| `npm run start` | اجرای بیلد |

---

## 📂 ساختار

```text
src/
  App.tsx              # لندینگ + لاب + ترمینال
  lib/commands.ts      # موتور ۲۰۰+ دستور (ویندوز-محور)
  lib/quests.ts        # فصل‌ها و کوئست‌ها
  lib/sound.ts
server.ts              # Express + Vite + Gemini API
```

---

## 📄 لایسنس

MIT

<div align="center">
  <sub>ساخته‌شده برای یادگیری عملی شبکه روی ویندوز</sub>
</div>
