# 🎯 Portal Mini Store Template - Quick Reference

**Updated**: 2025-01-13 | **Status**: Production-Ready with Enhanced Order Management

---

## ⚡ Quick Start Commands

```bash
# Development
pnpm dev                        # Start dev server → http://localhost:3000
pnpm devsafe                   # Clean start (removes .next)

# Type Generation & Build
pnpm generate:types            # Generate Payload types
pnpm generate:importmap        # Generate admin imports
pnpm build                     # Production build
pnpm ci                        # Full CI pipeline

# Admin Access
http://localhost:3000/admin    # Payload CMS admin dashboard
```

---

## 🏗️ Architecture at a Glance

### **Tech Stack**
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Payload CMS 3.0 + Vercel Postgres + Node.js 20+
- **UI**: shadcn/ui + Radix UI + Custom components
- **Email**: Nodemailer + Gmail (Bangla templates)

### **Key Directories**
```
src/
├── app/(frontend)/             # Public website pages
├── app/(payload)/              # Admin interface customizations  
├── app/api/                    # REST API endpoints
├── collections/                # Database models & access control
├── components/                 # Reusable UI components
└── lib/                        # Utilities & configurations
```

---

## 🛍️ E-commerce Features

### **Customer Experience**
- ✅ Product browsing with categories & search
- ✅ Shopping cart with persistent storage
- ✅ User registration & authentication
- ✅ Order placement & tracking
- ✅ Order history with status updates
- ✅ Email notifications in Bangla
- ✅ Responsive mobile design

### **Product Management**
- ✅ Product catalog with images & descriptions
- ✅ Category organization & filtering
- ✅ Price management & availability
- ✅ Review & rating system
- ✅ Media upload & optimization

---

## 🎛️ Enhanced Admin System

### **Interactive Order Management**
- **Status Dropdown**: Click-to-change status in list view
- **6-Status Workflow**: pending → processing → shipped → completed/cancelled/refunded
- **Visual Feedback**: Color-coded badges with emojis
- **Real-time Updates**: Instant database & UI sync
- **Loading States**: Spinner animations during updates

### **Smart Notifications**
- **Toast Alerts**: Success/error messages with auto-dismiss
- **Email Integration**: Customer notifications + admin alerts
- **Custom Events**: JavaScript event system for real-time feedback

### **Analytics Dashboard**
- **Sales Metrics**: Revenue, conversion rates, average order value
- **Order Analytics**: Active orders, fulfillment rates
- **User Insights**: New users, device breakdown
- **Performance**: Charts & KPI tracking

---

## 📊 Data Models

### **Collections Overview**
```typescript
Users {
  role: 'admin' | 'user'         // Role-based access
  customerInfo: name, email, phone
  address: complete shipping details
}

Orders {
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded'
  customer: captured at order time
  items: product relationships with quantities
  totals: calculated amounts
  metadata: device info for analytics
}

Items {
  catalog: name, description, price
  media: image relationships
  availability: stock management
  categories: organization & filtering
}

Reviews {
  ratings: 1-5 star system
  moderation: approval workflow
  relationships: user + product
}
```

---

## 🔐 Security & Access Control

### **Authentication System**
- **JWT-based**: Payload's built-in auth
- **Role Management**: Admin vs User permissions
- **Access Patterns**: Public, authenticated, admin-only, self-only

### **API Security**
- **Server-side Validation**: Never trust client data
- **Type Safety**: Full TypeScript coverage
- **Environment Variables**: Secure credential storage

---

## 🚀 Deployment Ready

### **Auto-Deployment Setup**
- **GitHub Actions**: Push to main → auto-deploy
- **Vercel Integration**: Production hosting with analytics
- **Database Migrations**: Automatic schema management
- **Environment Management**: Production/development configs

### **Required Environment Variables**
```bash
PAYLOAD_SECRET=your-secret-key
POSTGRES_URL=your-database-url
BLOB_READ_WRITE_TOKEN=vercel-blob-token
GMAIL_USER=your-email@gmail.com
GOOGLE_APP_PASSWORD=your-app-password
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
```

---

## 🎨 UI/UX Design System

### **Component Architecture**
- **shadcn/ui**: Base component library (DO NOT MODIFY)
- **Custom Components**: Business logic components
- **Admin Components**: Interactive management interfaces
- **Styling**: Tailwind CSS + CSS variables

### **Design Tokens**
- **Colors**: Status-specific palette (6 status colors)
- **Typography**: Consistent font scales
- **Animations**: Smooth transitions & hover effects
- **Responsive**: Mobile-first design

---

## 📧 Email System

### **Notification Types**
- **Order Confirmation**: Detailed order summary (Bangla)
- **Status Updates**: Real-time tracking updates (Bangla)
- **Admin Alerts**: Order management notifications (English)
- **Password Reset**: Secure token-based recovery

### **Template Features**
- **Bangla Language**: Customer-friendly localization
- **Rich HTML**: Professional email design
- **Order Details**: Complete product & pricing info
- **Responsive**: Mobile-optimized email layout

---

## 🛠️ Development Workflow

### **Standard Development**
1. `pnpm install` → Install dependencies
2. Copy `.env.example` → `.env.local` → Configure environment
3. `pnpm dev` → Start development server
4. `pnpm generate:types` → After schema changes
5. `pnpm build` → Test production build
6. `git push origin main` → Auto-deploy

### **Admin Workflow Testing**
1. Access `/admin` → Login as admin
2. Navigate to Orders collection
3. Test interactive status dropdown
4. Verify email notifications
5. Check analytics dashboard

---

## 📱 API Endpoints

### **Order Management**
- `GET /api/orders` - List orders (filtered by user/admin)
- `POST /api/orders` - Create new order
- `PATCH /api/orders/update-status` - Update order status (admin only)

### **Analytics**
- `GET /api/admin/metrics` - Dashboard analytics
- `GET /api/health/db` - Database health check

### **User Management**
- `GET /api/users/me` - Current user profile
- `POST /api/users/forgot-password` - Password reset

---

## 🧪 Quality Assurance

### **Code Quality**
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Build Testing**: Production build verification
- **Manual Testing**: Complete user workflows

### **Performance**
- **Next.js SSR**: Server-side rendering
- **Image Optimization**: Sharp processing
- **Code Splitting**: Automatic bundle optimization
- **Caching**: API response caching

---

## 📚 Documentation Index

1. **CODEBASE_INDEX.md** - Complete technical documentation
2. **WARP.md** - AI development guidance
3. **DEPLOYMENT.md** - Production deployment guide
4. **AI_RULES.md** - Development best practices
5. **README.md** - Project overview & setup

---

**🎉 Your enhanced portal-mini-store-template is fully documented and ready for production deployment with professional order management capabilities!**