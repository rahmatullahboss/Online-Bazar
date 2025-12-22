# 🏷️ White-Label Setup Guide

এই e-commerce platform সম্পূর্ণ white-label ready। নিচের steps follow করে যেকোনো brand এর জন্য customize করুন।

---

## 📋 Quick Checklist

```
[ ] 1. GitHub থেকে clone করুন
[ ] 2. Dependencies install করুন (npm install)
[ ] 3. .env ফাইল তৈরি করুন এবং configure করুন
[ ] 4. Database setup করুন (Neon)
[ ] 5. Logo ও favicon images পরিবর্তন করুন
[ ] 6. Static files update করুন (manifest.json, offline.html)
[ ] 7. npm run build দিয়ে verify করুন
[ ] 8. Deploy করুন (Vercel / VPS)
[ ] 9. Admin account তৈরি করুন
```

---

## Step 1: GitHub Clone

```bash
# Repository clone করুন
git clone https://github.com/YOUR_USERNAME/Online-Bazar.git my-store

# Directory তে যান
cd my-store
```

---

## Step 2: Dependencies Install

```bash
# Node.js v20+ প্রয়োজন
node --version

# Dependencies install করুন
npm install
```

---

## Step 3: Environment Variables (.env)

```bash
# .env ফাইল তৈরি করুন
cp .env.example .env
```

এখন `.env` ফাইল open করুন এবং সব values update করুন:

### 🏪 Store Branding (Required)

```env
NEXT_PUBLIC_STORE_NAME="আপনার স্টোরের নাম"
NEXT_PUBLIC_STORE_TAGLINE="আপনার স্লোগান"
NEXT_PUBLIC_STORE_DESCRIPTION="স্টোরের বর্ণনা"
NEXT_PUBLIC_STORE_EMOJI="🛒"
```

### 📞 Contact Info (Required)

```env
NEXT_PUBLIC_CONTACT_EMAIL="you@example.com"
NEXT_PUBLIC_CONTACT_PHONE="+880 1XXX-XXXXXX"
NEXT_PUBLIC_WHATSAPP="+8801XXXXXXXXX"
NEXT_PUBLIC_ADDRESS="ঠিকানা"
```

### 💳 Payment Numbers (Required)

```env
NEXT_PUBLIC_BKASH_NUMBER="01XXXXXXXXX"
NEXT_PUBLIC_NAGAD_NUMBER="01XXXXXXXXX"
```

### 🔗 Social Media (Optional)

```env
NEXT_PUBLIC_FACEBOOK_URL="https://facebook.com/yourpage"
NEXT_PUBLIC_INSTAGRAM_URL=""
```

### 🗄️ Database (Required)

1. [Neon.tech](https://neon.tech) এ free account তৈরি করুন
2. নতুন project তৈরি করুন
3. Connection string copy করুন

```env
POSTGRES_URL="postgresql://user:pass@host/db?sslmode=require"
```

### 🔐 Payload CMS Secret (Required)

```bash
# Terminal এ run করুন:
openssl rand -base64 32
```

```env
PAYLOAD_SECRET="generated-secret-here"
```

### 📧 Email Configuration (Required)

1. Gmail এ [2FA enable](https://myaccount.google.com/security) করুন
2. [App Password](https://myaccount.google.com/apppasswords) তৈরি করুন

```env
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
EMAIL_DEFAULT_FROM_NAME="Your Store Name"
```

### 🌐 Site URL (Required for Production)

```env
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_SERVER_URL="https://yourdomain.com"
```

### 🤖 AI Chatbot (Optional)

Groq recommended (fastest, free):

- [Groq Console](https://console.groq.com/keys) থেকে API key নিন

```env
GROQ_API_KEY="gsk_..."
```

---

## Step 4: Logo & Images

`public/` folder এ নিচের images replace করুন:

| File                  | Size     | Purpose            |
| --------------------- | -------- | ------------------ |
| `icon.png`            | 512x512  | Main app icon      |
| `favicon-192x192.png` | 192x192  | Mobile icon        |
| `favicon-48x48.png`   | 48x48    | Small icon         |
| `favicon-32x32.png`   | 32x32    | Browser tab        |
| `favicon-16x16.png`   | 16x16    | Smallest icon      |
| `og-image.png`        | 1200x630 | Social share image |

**Tip:** [Favicon.io](https://favicon.io/) দিয়ে logo থেকে সব sizes তৈরি করুন।

---

## Step 5: Static Files (Manual Edit Required)

এই files environment variables পড়তে পারে না, তাই manually edit করতে হবে:

### `public/manifest.json`

```json
{
  "name": "আপনার স্টোর",
  "short_name": "Store",
  "description": "স্টোরের বর্ণনা",
  "theme_color": "#YOUR_BRAND_COLOR"
}
```

### `public/offline.html`

Line 6: Title পরিবর্তন করুন

```html
<title>Offline - আপনার স্টোর</title>
```

### `public/push-sw.js`

Lines 34, 37: Notification title পরিবর্তন করুন

```javascript
// Line 34
event.waitUntil(self.registration.showNotification(data.title || 'আপনার স্টোর', options))

// Line 37
const title = 'আপনার স্টোর'
```

---

## Step 6: Theme Colors (Optional)

`src/app/globals.css` এ brand gradient পরিবর্তন করুন:

```css
.brand-text {
  background-image: linear-gradient(90deg, #COLOR1, #COLOR2, #COLOR3);
}

.brand-glow {
  background-image: radial-gradient(closest-side, rgba(R, G, B, 0.5), rgba(R, G, B, 0));
}
```

**Color Palettes:**
| Theme | Gradient |
|-------|----------|
| Gold | `#b8860b, #daa520, #ffd700` |
| Blue | `#1e3a8a, #3b82f6, #60a5fa` |
| Green | `#15803d, #22c55e, #4ade80` |
| Red | `#b91c1c, #ef4444, #f87171` |
| Purple | `#6b21a8, #a855f7, #d8b4fe` |

---

## Step 7: Build & Test

```bash
# Development mode
npm run dev

# Production build test
npm run build

# Start production
npm run start
```

**Verification Checklist:**

- [ ] Homepage এ সঠিক store name
- [ ] Footer এ সঠিক contact info
- [ ] WhatsApp button কাজ করছে
- [ ] Browser tab এ সঠিক favicon

---

## Step 8: Deploy to Vercel

### 8.1 GitHub Push

```bash
# New repository তৈরি করুন GitHub এ
# তারপর:
git remote set-url origin https://github.com/YOUR_USERNAME/new-store.git
git push -u origin main
```

### 8.2 Vercel Deploy

1. [vercel.com](https://vercel.com) এ login করুন
2. "Add New Project" → GitHub repo select করুন
3. **Environment Variables** section এ `.env` এর সব variable add করুন
4. Deploy করুন

### Required Vercel Environment Variables:

```
NEXT_PUBLIC_STORE_NAME
NEXT_PUBLIC_CONTACT_PHONE
NEXT_PUBLIC_CONTACT_EMAIL
NEXT_PUBLIC_WHATSAPP
NEXT_PUBLIC_BKASH_NUMBER
NEXT_PUBLIC_NAGAD_NUMBER
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SERVER_URL
POSTGRES_URL
PAYLOAD_SECRET
GMAIL_USER
GMAIL_APP_PASSWORD
EMAIL_DEFAULT_FROM_NAME
```

---

## Step 9: Post-Deployment Setup

### 9.1 Create Admin Account

Deploy হওয়ার পর:

1. `https://yourdomain.com/admin` এ যান
2. প্রথমবার একটি admin account তৈরি করুন

### 9.2 Add Categories & Products

Admin panel এ:

1. Categories তৈরি করুন
2. Products add করুন
3. Media upload করুন

---

## 📁 Files Summary

| File                   | What to Edit                   | How                   |
| ---------------------- | ------------------------------ | --------------------- |
| `.env`                 | All branding, contact, payment | Environment variables |
| `public/*.png`         | Logo, favicon images           | Replace files         |
| `public/manifest.json` | PWA name, theme                | Edit JSON             |
| `public/offline.html`  | Page title                     | Edit HTML             |
| `public/push-sw.js`    | Notification title             | Edit JS               |
| `src/app/globals.css`  | Brand colors                   | Edit CSS (optional)   |

---

## ❓ FAQ

**Q: প্রতিটি client এর জন্য আলাদা database লাগবে?**
A: হ্যাঁ, প্রতিটি store এর জন্য আলাদা Neon database তৈরি করুন।

**Q: Code এ কি কোনো পরিবর্তন লাগবে?**
A: না, শুধু `.env`, images, এবং static files পরিবর্তন করলেই হবে।

**Q: Push notifications এর জন্য কি করতে হবে?**
A: `npx web-push generate-vapid-keys` run করে `.env` এ add করুন।

---

## 🆘 Troubleshooting

### Build Error?

```bash
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Failed?

- Neon dashboard এ IP allowlist check করুন
- `?sslmode=require` connection string এ আছে কিনা দেখুন

### Images Not Loading?

- File names exact match করছে কিনা দেখুন
- PNG format ব্যবহার করুন
