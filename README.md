# 🚀 Ecommerce White-Label Blueprint

A **production-ready, fully customizable** ecommerce platform built with Next.js 15, Payload CMS 3, and modern technologies. Perfect for selling to ecommerce entrepreneurs.

---

## ✨ Features

### Core Ecommerce

- 🛍️ **Product Catalog** - Categories, variants, gallery images
- 🛒 **Shopping Cart** - Cross-device sync, guest checkout
- 📦 **Order Management** - 6-stage status workflow
- 💳 **Payment Methods** - COD, bKash, Nagad (extensible)
- 🚚 **Delivery Zones** - Inside/Outside Dhaka pricing
- 🎟️ **Coupons** - Percentage/fixed discounts, first-order

### Advanced Features

- 📊 **Analytics Dashboard** - Sales, products, customers
- 📦 **Inventory Management** - Stock tracking, low stock alerts
- ❤️ **Wishlist** - Save favorites, notify on sale
- 🔍 **Search & Filtering** - Full-text, category, price range
- ⭐ **Reviews** - Verified purchase only
- 📱 **PWA Ready** - Install as app, push notifications
- 📧 **Email Notifications** - Bangla templates included
- 🔄 **Abandoned Cart Recovery** - Auto email reminders

### Admin Panel

- 📈 **Payload CMS** - Full admin dashboard
- 📑 **Order Export** - CSV download
- 🖨️ **Invoice Printing** - Professional invoices
- 👥 **Role-based Access** - Admin/User roles

---

## 🛠️ Quick Setup

### 1. Clone & Install

```bash
git clone <repository-url> my-store
cd my-store
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings (see [Configuration](#configuration)).

### 3. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## ⚙️ Configuration

All customization is done through environment variables and `src/config/store.config.ts`.

### Essential Variables

| Variable                    | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_STORE_NAME`    | Your store name                                       |
| `NEXT_PUBLIC_STORE_TAGLINE` | Store tagline/slogan                                  |
| `POSTGRES_URL`              | Database connection string                            |
| `PAYLOAD_SECRET`            | Auth secret (generate with `openssl rand -base64 32`) |
| `GMAIL_USER`                | Email for notifications                               |
| `GMAIL_APP_PASSWORD`        | Gmail app password                                    |

### Branding

| Variable                    | Description               |
| --------------------------- | ------------------------- |
| `NEXT_PUBLIC_LOGO_URL`      | Path to logo image        |
| `NEXT_PUBLIC_STORE_EMOJI`   | Fallback emoji icon       |
| `NEXT_PUBLIC_PRIMARY_COLOR` | Primary brand color (hex) |

### Contact & Social

| Variable                    | Description       |
| --------------------------- | ----------------- |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Support email     |
| `NEXT_PUBLIC_CONTACT_PHONE` | Phone number      |
| `NEXT_PUBLIC_WHATSAPP`      | WhatsApp number   |
| `NEXT_PUBLIC_FACEBOOK_URL`  | Facebook page URL |

### Payment

| Variable                   | Description           |
| -------------------------- | --------------------- |
| `NEXT_PUBLIC_BKASH_NUMBER` | bKash merchant number |
| `NEXT_PUBLIC_NAGAD_NUMBER` | Nagad merchant number |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (frontend)/      # Customer-facing pages
│   ├── admin/           # Payload admin panel
│   └── api/             # API routes
├── collections/         # Payload CMS collections
├── components/          # React components
├── config/
│   └── store.config.ts  # 👈 Main configuration
└── lib/                 # Utilities & context
```

---

## 🎨 Customization Checklist

- [ ] Update `.env` with store info
- [ ] Replace `/public/logo.png`
- [ ] Replace `/public/favicon-round.png`
- [ ] Replace `/public/og-image.jpg`
- [ ] Update theme colors in `.env`
- [ ] Configure payment numbers
- [ ] Set up email (Gmail)
- [ ] Configure database (Neon/Vercel Postgres)

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Required for Production

- PostgreSQL database (Neon recommended)
- Vercel Blob storage (for images)
- Domain configuration

---

## 📊 Tech Stack

| Technology    | Purpose            |
| ------------- | ------------------ |
| Next.js 15    | Framework          |
| React 19      | UI Library         |
| Payload CMS 3 | Content Management |
| Tailwind CSS  | Styling            |
| shadcn/ui     | UI Components      |
| PostgreSQL    | Database           |
| Nodemailer    | Email              |
| web-push      | Push Notifications |

---

## 📄 License

MIT License - Use freely for commercial projects.

---

## 🆘 Support

For setup assistance or customization requests, contact:

- Email: your-support@email.com
- WhatsApp: +880XXXXXXXXXX
