# 🏷️ White-Label Guide | হোয়াইট-লেবেল গাইড

নতুন ব্র্যান্ড তৈরি করতে নিচের ধাপগুলো অনুসরণ করুন।  
Follow these steps to rebrand this e-commerce platform for a new client.

---

## ✅ Quick Checklist | দ্রুত চেকলিস্ট

```
[ ] 1. .env ফাইল কনফিগার করুন (Copy .env.example → .env)
[ ] 2. Logo ও favicon পরিবর্তন করুন (public/ folder)
[ ] 3. manifest.json আপডেট করুন (PWA settings)
[ ] 4. Theme colors কাস্টমাইজ করুন (globals.css)
[ ] 5. Build ও Test করুন
[ ] 6. Deploy করুন
```

---

## 📝 Step 1: Environment Variables | .env কনফিগারেশন

`.env.example` ফাইল থেকে `.env` তৈরি করুন এবং নিচের মানগুলো পরিবর্তন করুন:

### 🏪 Store Branding | স্টোর ব্র্যান্ডিং

```bash
# স্টোরের নাম (সকল জায়গায় দেখাবে)
NEXT_PUBLIC_STORE_NAME="আপনার স্টোরের নাম"

# স্লোগান
NEXT_PUBLIC_STORE_TAGLINE="আপনার স্লোগান"

# বিস্তারিত বিবরণ
NEXT_PUBLIC_STORE_DESCRIPTION="স্টোরের বিস্তারিত বর্ণনা"

# ইমোজি (ব্র্যান্ড আইকন হিসেবে ব্যবহৃত)
NEXT_PUBLIC_STORE_EMOJI="🛒"
```

### 📞 Contact Information | যোগাযোগের তথ্য

```bash
NEXT_PUBLIC_CONTACT_EMAIL="owner@example.com"
NEXT_PUBLIC_CONTACT_PHONE="+880 1XXX-XXXXXX"
NEXT_PUBLIC_WHATSAPP="+8801XXXXXXXXX"
NEXT_PUBLIC_ADDRESS="ঠিকানা, শহর, বাংলাদেশ"
```

### 💳 Payment Numbers | পেমেন্ট নম্বর

```bash
NEXT_PUBLIC_BKASH_NUMBER="01XXXXXXXXX"
NEXT_PUBLIC_NAGAD_NUMBER="01XXXXXXXXX"
```

### 🔗 Social Media Links | সোশ্যাল মিডিয়া

```bash
NEXT_PUBLIC_FACEBOOK_URL="https://facebook.com/yourpage"
NEXT_PUBLIC_INSTAGRAM_URL="https://instagram.com/yourpage"
NEXT_PUBLIC_YOUTUBE_URL=""
NEXT_PUBLIC_TWITTER_URL=""
NEXT_PUBLIC_TIKTOK_URL=""
```

### 🌐 Domain Configuration

```bash
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_COMPANY_NAME="Your Company Ltd."
```

---

## 🎨 Step 2: Logo & Favicon | লোগো এবং ফেভিকন

`public/` ফোল্ডারে নিচের ফাইলগুলো প্রতিস্থাপন করুন:

| ফাইল                  | সাইজ     | ব্যবহার              |
| --------------------- | -------- | -------------------- |
| `icon.png`            | 512x512  | Main app icon        |
| `favicon-192x192.png` | 192x192  | Mobile icon          |
| `favicon-48x48.png`   | 48x48    | Small icon           |
| `favicon-32x32.png`   | 32x32    | Browser tab          |
| `favicon-16x16.png`   | 16x16    | Smallest icon        |
| `favicon-round.png`   | 192x192  | Round variant        |
| `og-image.png`        | 1200x630 | Social share preview |

### 💡 Tips:

- **PNG format** ব্যবহার করুন (transparent background সহ)
- [Favicon.io](https://favicon.io/) বা [RealFaviconGenerator](https://realfavicongenerator.net/) ব্যবহার করে সব সাইজ একসাথে তৈরি করুন
- `og-image.png` এ brand name এবং tagline যুক্ত করুন

---

## 📱 Step 3: PWA Settings | manifest.json

`public/manifest.json` ফাইলটি এডিট করুন:

```json
{
  "name": "আপনার স্টোরের নাম",
  "short_name": "Short Name",
  "description": "স্টোরের বর্ণনা",
  "theme_color": "#YOUR_BRAND_COLOR",
  "background_color": "#ffffff"
}
```

---

## 🎨 Step 4: Theme Colors | থিম কালার

`src/app/globals.css` ফাইলে brand colors কাস্টমাইজ করুন:

### Primary Brand Color পরিবর্তন

`.brand-text` এবং `.brand-glow` ক্লাসে আপনার ব্র্যান্ড কালার দিন:

```css
/* Brand styling: your brand gradient */
.brand-text {
  background-image: linear-gradient(90deg, #YOUR_COLOR_1, #YOUR_COLOR_2, #YOUR_COLOR_3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.brand-glow {
  background-image: radial-gradient(closest-side, rgba(YOUR_RGB, 0.5), rgba(YOUR_RGB, 0));
}
```

### সাধারণ Color Palettes:

| ব্র্যান্ড টাইপ | Colors                      |
| -------------- | --------------------------- |
| Gold/Premium   | `#b8860b, #daa520, #ffd700` |
| Blue/Trust     | `#1e3a8a, #3b82f6, #60a5fa` |
| Green/Organic  | `#15803d, #22c55e, #4ade80` |
| Red/Energetic  | `#b91c1c, #ef4444, #f87171` |
| Purple/Luxury  | `#6b21a8, #a855f7, #d8b4fe` |

---

## 🔧 Step 5: Build & Test | বিল্ড এবং টেস্ট

```bash
# Dependencies install
npm install

# Development mode এ চালান
npm run dev

# Production build টেস্ট করুন
npm run build
npm run start
```

### ✅ যা চেক করবেন:

- [ ] Homepage এ সঠিক store name দেখাচ্ছে
- [ ] Footer এ সঠিক contact info দেখাচ্ছে
- [ ] WhatsApp button সঠিক নম্বরে redirect করছে
- [ ] Email links সঠিক email এ যাচ্ছে
- [ ] Social media links কাজ করছে
- [ ] Logo সব জায়গায় দেখাচ্ছে
- [ ] Browser tab এ সঠিক favicon দেখাচ্ছে

---

## 🚀 Step 6: Deploy | ডিপ্লয়

### Vercel এ Deploy:

1. GitHub এ repository push করুন
2. [Vercel.com](https://vercel.com) এ login করুন
3. "New Project" → GitHub repo select করুন
4. Environment Variables section এ `.env` এর সব variable যুক্ত করুন
5. Deploy করুন

### Important Environment Variables for Vercel:

```
NEXT_PUBLIC_STORE_NAME
NEXT_PUBLIC_STORE_TAGLINE
NEXT_PUBLIC_CONTACT_EMAIL
NEXT_PUBLIC_CONTACT_PHONE
NEXT_PUBLIC_WHATSAPP
NEXT_PUBLIC_BKASH_NUMBER
NEXT_PUBLIC_NAGAD_NUMBER
NEXT_PUBLIC_SITE_URL
POSTGRES_URL
PAYLOAD_SECRET
GMAIL_USER
GMAIL_APP_PASSWORD
```

---

## 📁 Files Summary | ফাইল সারাংশ

| ফাইল                     | কাজ                                   |
| ------------------------ | ------------------------------------- |
| `.env`                   | সব branding ও config                  |
| `public/manifest.json`   | PWA app name ও theme                  |
| `public/*.png`           | Logo ও favicon files                  |
| `src/app/globals.css`    | Brand colors ও animations             |
| `src/lib/site-config.ts` | Branding logic (সাধারণত edit লাগে না) |

---

## 🔄 New Client Setup Workflow

```
1. Clone/Copy repository
2. npm install
3. .env.example → .env (values edit)
4. Replace logo/favicon images
5. Update manifest.json
6. (Optional) Customize globals.css colors
7. npm run build (verify no errors)
8. Deploy to Vercel with env vars
9. Database setup (POSTGRES_URL)
10. Admin account create (Post-deploy)
```

---

## ❓ FAQ | সাধারণ প্রশ্ন

### Q: Database কি নতুন করে setup করতে হবে?

**A:** হ্যাঁ, প্রতিটি নতুন client এর জন্য আলাদা Neon/PostgreSQL database তৈরি করুন।

### Q: Products ও Categories নতুন করে add করতে হবে?

**A:** হ্যাঁ, `/admin` panel এ গিয়ে নতুন products add করুন।

### Q: Email configuration কিভাবে করব?

**A:** Gmail এ 2FA enable করে App Password তৈরি করুন: [Google App Passwords](https://myaccount.google.com/apppasswords)

### Q: Push notifications এর জন্য কি করতে হবে?

**A:** নতুন VAPID keys generate করুন: `npx web-push generate-vapid-keys`

---

## 📞 Support

কোনো সমস্যা হলে issue তৈরি করুন অথবা contact করুন।
