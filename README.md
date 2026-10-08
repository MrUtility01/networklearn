<div align="center">

# 🌐 NetworkLearn | نتورک‌لرن

### پلتفرم بازی‌محور و شبیه‌ساز تعاملی یادگیری شبکه و زیرساخت IT

![NetworkLearn](https://img.shields.io/badge/NetworkLearn-v1.0-0ea5e9?style=for-the-badge&logo=cisco&logoColor=white)
![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.1-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Mentor-8e75ff?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

<p align="center">
  <b>یک محیط زنده، هوشمند و تعاملی برای یادگیری شبکه، پروتکل‌ها، سوییچینگ، روتینگ، امنیت و زیرساخت سازمانی به زبان فارسی</b>
</p>

</div>

---

## 📖 درباره پروژه

**NetworkLearn (نتورک‌لرن)** نسخه شبکه‌محور و بازی‌سازی‌شده از دایرةالمعارف شبکه است.  
بدون نیاز به تجهیزات واقعی یا شبیه‌سازهای سنگین، یک **لاب مجازی شبکه** + **ترمینال تعاملی** + **کوئست‌های مرحله‌ای** + **منتور هوش مصنوعی** را مستقیماً داخل مرورگر در اختیار شما قرار می‌دهد.

محتوا بر اساس ساختار کامل **NetworkEncyclopedia** (۶۳ فصل · L0–L4 · Capstone سازمانی) طراحی شده است.

---

## ✨ ویژگی‌های کلیدی

### 💻 ۱. شبیه‌ساز ترمینال و لاب شبکه
- دستورات واقعی شبکه: `ping`, `traceroute`, `ip`, `ifconfig`, `arp`, `netstat`, `ss`, `nslookup`, `dig`, `curl`, `nmap` (شبیه‌سازی‌شده)
- شبیه‌سازی توپولوژی ساده (سوییچ، روتر، هاست)
- تکمیل خودکار (TAB) و تاریخچه دستورات

### 🧠 ۲. دستیار هوشمند (AI Mentor)
- مجهز به Google Gemini برای توضیح مفاهیم و راهنمایی گام‌به‌گام
- سرنخ بدون لو دادن جواب نهایی

### 🎯 ۳. سیستم گیم‌فیکیشن
- کسب XP و ارتقای سطح
- نشان‌های تخصصی (Network Explorer, Switching Pro, Routing Master, Security Specialist)
- پیشرفت ذخیره‌شده در مرورگر

### 📱 ۴. طراحی واکنش‌گرا و RTL کامل
- فونت وزیرمتن + JetBrains Mono
- ناوبری مناسب موبایل و دسکتاپ

### 🗺️ ۵. سرفصل‌های آموزشی
بر اساس فصل‌های اصلی NetworkEncyclopedia:

| سطح | عنوان | مباحث کلیدی |
|:---:|:---|:---|
| **۱** | مبانی شبکه و مدل OSI | OSI، TCP/IP، انواع شبکه، Packet Journey |
| **۲** | اترنت و سوییچینگ | MAC، CAM، VLAN، STP مبانی |
| **۳** | IP و ساب‌نتینگ | IPv4/IPv6، CIDR، VLSM، طرح آدرس سازمانی |
| **۴** | پروتکل‌های کلیدی | ARP، ICMP، TCP، UDP |
| **۵** | سرویس‌های شبکه | DNS، DHCP، IPAM |
| **۶** | روتینگ پایه | Static Route، Default Gateway، Lookup |
| **۷** | امنیت شبکه پایه | ACL، Firewall، Segmenting |

---

## 🛠️ پشته فناوری

- **Frontend:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion · Lucide
- **Backend:** Express.js · NeDB (embedded)
- **AI:** Google Gemini (`@google/genai`)
- **Fonts:** Vazirmatn + JetBrains Mono

---

## 🚀 راه‌اندازی محلی

### پیش‌نیاز
- Node.js ≥ 18
- npm ≥ 9

```bash
git clone https://github.com/MrUtility01/networklearn.git
cd networklearn
npm install
cp .env.example .env
# کلید Gemini را در .env قرار دهید
npm run dev
```

سپس باز کنید: [http://localhost:3000](http://localhost:3000)

### اسکریپت‌ها
| دستور | توضیح |
|--------|--------|
| `npm run dev` | توسعه همزمان کلاینت + سرور |
| `npm run build` | بیلد پروداکشن |
| `npm run start` | اجرای بیلد |
| `npm run lint` | بررسی TypeScript |

---

## 📂 ساختار پروژه

```text
├── src/
│   ├── components/          # UI کامپوننت‌ها
│   ├── lib/
│   │   ├── quests.ts        # کوئست‌ها و سرفصل‌ها
│   │   ├── commands.ts      # شبیه‌ساز دستورات شبکه
│   │   └── sound.ts
│   ├── App.tsx
│   ├── types.ts
│   └── main.tsx
├── server.ts                # Express + Gemini + NeDB
├── package.json
└── index.html
```

---

## 🔗 ارتباط با NetworkEncyclopedia

این پروژه نسخه **بازی‌محور و تعاملی** از محتوا و ساختار ریپوی [NetworkEncyclopedia](https://github.com/MrUtility01/NetworkEncyclopedia) است.  
هدف: تبدیل دانشنامه ایستا به تجربه یادگیری فعال با تمرین عملی.

---

## 📄 لایسنس

MIT — آزاد برای استفاده و توسعه.

<div align="center">
  <sub>ساخته‌شده با ❤️ برای جامعه شبکه و زیرساخت فارسی</sub>
</div>
