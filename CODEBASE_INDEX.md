# 📋 Codebase Index - Portal Mini Store Template

**Last Updated**: 2025-01-13 23:37:50 UTC  
**Version**: Enhanced with Interactive Order Status System  
**Tech Stack**: Next.js 15 + Payload CMS 3.0 + TypeScript + Tailwind CSS

---

## 🏗️ Project Architecture Overview

### **Core Technologies**
- **Frontend**: Next.js 15.3.0 with App Router + React 19 + TypeScript
- **Backend/CMS**: Payload CMS 3.0 with built-in authentication
- **Database**: Vercel Postgres with automatic schema management
- **UI Framework**: shadcn/ui components + Radix UI primitives
- **Styling**: Tailwind CSS 4.1.10 with custom design system
- **Email**: Nodemailer with Gmail integration + Bangla templates
- **Media Storage**: Vercel Blob (preferred) or S3 fallback
- **Package Manager**: pnpm 9+ with Node.js 18+/20+

---

## 📁 Directory Structure

```
portal-mini-store-template/
├── 📄 Configuration Files
│   ├── package.json              # Dependencies, scripts, engines
│   ├── pnpm-lock.yaml           # Lockfile for reproducible builds
│   ├── next.config.ts           # Next.js configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── eslint.config.mjs        # ESLint configuration
│   ├── postcss.config.mjs       # PostCSS configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── components.json          # shadcn/ui configuration
│   ├── vercel.json              # Vercel deployment configuration
│   ├── docker-compose.yml       # Docker development setup
│   ├── Dockerfile               # Container configuration
│   └── .env.example             # Environment variables template
│
├── 📚 Documentation
│   ├── README.md                # Project overview and setup
│   ├── WARP.md                  # AI development guidance
│   ├── DEPLOYMENT.md            # Comprehensive deployment guide
│   ├── AI_RULES.md              # AI development best practices
│   └── CODEBASE_INDEX.md        # This comprehensive index
│
├── ⚙️ Development Configuration
│   ├── .github/workflows/
│   │   └── deploy.yml           # GitHub Actions auto-deployment
│   ├── .vscode/
│   │   ├── settings.json        # VS Code workspace settings
│   │   ├── extensions.json      # Recommended extensions
│   │   └── launch.json          # Debug configuration
│   ├── .gitignore               # Git ignore patterns
│   ├── .npmrc                   # npm configuration
│   ├── .yarnrc                  # Yarn configuration
│   └── .prettierrc.json        # Code formatting rules
│
└── src/                         # Main source code directory
    ├── 🌐 Application Routes
    ├── 📊 Collections & Data Models
    ├── 🧩 Components & UI
    ├── 🔧 Utilities & Helpers
    ├── 🗄️ Database Migrations
    └── 🚀 Deployment Assets
```

---

## 🌐 Application Routes (`src/app/`)

### **Frontend Routes** (`(frontend)/`)
```
├── layout.tsx                   # Root layout with CartProvider
├── page.tsx                     # Homepage with product catalog
├── globals.css                  # Global styles and CSS variables
├── admin-dashboard/
│   ├── page.tsx                 # Custom admin dashboard
│   └── order-status-update.tsx  # Order status management UI
├── checkout/
│   ├── page.tsx                 # Checkout process
│   └── checkout-form.tsx        # Order form component
├── item/[id]/
│   ├── page.tsx                 # Product detail page
│   └── ReviewSection.tsx        # Product reviews component
├── my-orders/page.tsx           # User order history
├── order/[id]/
│   ├── page.tsx                 # Individual order page
│   └── order-form.tsx           # Order modification form
├── profile/
│   ├── page.tsx                 # User profile page
│   └── profile-form.tsx         # Profile editing form
├── login/page.tsx               # User authentication
├── register/page.tsx            # User registration
├── forgot-password/page.tsx     # Password reset
├── reset-password/page.tsx      # Password reset confirmation
├── order-confirmation/page.tsx  # Post-order success page
└── privacy/page.tsx             # Privacy policy
```

### **Payload Admin Routes** (`(payload)/`)
```
├── layout.tsx                   # Auto-generated Payload layout
├── custom.scss                  # Custom admin styles
└── admin/importMap.js           # Auto-generated import map
```

### **API Routes** (`api/`)
```
├── orders/
│   ├── route.ts                 # Order CRUD operations
│   └── update-status/route.ts   # Enhanced status updates
├── admin/metrics/route.ts       # Dashboard analytics
├── users/
│   ├── me/route.ts              # User profile API
│   └── forgot-password/route.ts # Password reset API
├── reviews/route.ts             # Product reviews API
├── cart-activity/route.ts       # Shopping cart tracking
├── abandoned-carts/mark/route.ts # Abandoned cart cleanup
├── health/db/route.ts           # Database health check
└── my-route/route.ts            # Custom API example
```

---

## 📊 Collections & Data Models (`src/collections/`)

### **Core Collections**
```
├── Users.ts                     # Authentication & user management
│   ├── Fields: email, firstName, lastName, role, customerNumber
│   ├── Roles: 'admin' | 'user' (default: 'user')
│   ├── Address: line1, line2, city, state, postalCode, country
│   └── Access: adminsOrSelf pattern
├── Orders.ts                    # Enhanced order management
│   ├── Status: pending | processing | shipped | completed | cancelled | refunded
│   ├── Customer: name, email, number (captured at order time)
│   ├── Items: array of item + quantity relationships
│   ├── Shipping: complete address group
│   ├── Metadata: userAgent, deviceType for analytics
│   └── Hooks: orderStatusUpdate + email notifications
├── Items.ts                     # Product catalog
│   ├── Fields: name, description, price, category, availability
│   ├── Media: image relationship with alt text
│   └── SEO: slug generation and metadata
├── Categories.ts                # Product categorization
│   ├── Hierarchical: name, slug, parent relationship
│   └── SEO: description and metadata
├── Reviews.ts                   # Product review system
│   ├── Rating: 1-5 star system
│   ├── Content: title, review text, helpful votes
│   ├── Moderation: approval workflow
│   └── Relationships: user + item
├── Media.ts                     # File upload management
│   ├── Storage: Vercel Blob or S3 integration
│   ├── Optimization: Sharp image processing
│   └── SEO: alt text for accessibility
└── access/
    └── index.ts                 # Centralized access control patterns
        ├── anyone: Access       # Public access
        ├── authenticated: Access # Logged-in users
        ├── admins: Access       # Admin-only access
        ├── adminsOrSelf: Access # Admin or own records
        └── adminsOrOwner: Access # Admin or record owner
```

### **Collection Hooks**
```
├── hooks/
│   └── orderStatusUpdate.ts     # Enhanced email notifications
│       ├── Status Change Detection: previousDoc vs doc comparison
│       ├── Email Templates: Bangla for customers, English for admins
│       ├── Status Messages: Contextual messages for each status
│       └── Error Handling: Comprehensive try-catch with logging
```

---

## 🧩 Components & UI (`src/components/`)

### **Admin Components** (`admin/`)
```
├── OrderStatusDropdown.tsx      # Interactive status dropdown
│   ├── Features: Real-time updates, loading states, visual feedback
│   ├── API Integration: PATCH /api/orders/update-status
│   ├── Notifications: Custom events for success/error
│   └── UI: Hover effects, animations, mobile-optimized
├── OrderStatusCell.tsx          # Status badge display
│   ├── Visual: Color-coded badges with emojis
│   └── Styling: Consistent with design system
├── OrderStatusSelect.tsx        # Form field component
│   ├── Integration: Payload form system
│   └── Validation: Status options with type safety
├── OrderStatusNotifications.tsx # Toast notification system
│   ├── Events: Custom event listeners
│   ├── Animations: Slide-in/out transitions
│   ├── Auto-dismiss: 5-second timeout
│   └── Types: Success/error variants
└── GlobalNotificationProvider.tsx # Admin-wide notification injection
    ├── Mounting: Dynamic DOM injection
    └── Lifecycle: Component cleanup
```

### **Frontend Components**
```
├── add-to-cart-button.tsx       # Shopping cart integration
├── cart-button.tsx              # Cart toggle button
├── cart-sidebar.tsx             # Sliding cart drawer
├── order-now-button.tsx         # Direct order button
├── review-stars.tsx             # Star rating display
├── logout-button.tsx            # User logout functionality
├── site-header.tsx              # Navigation header
├── site-footer.tsx              # Footer with links
└── before-dashboard/
    ├── index.tsx                # Custom dashboard overview
    ├── index.scss               # Dashboard-specific styles
    ├── seed-button.tsx          # Data seeding utility
    └── GlobalNotificationProvider # Notification system integration
```

### **UI Components** (`ui/`)
```
shadcn/ui components (DO NOT MODIFY - regenerate via CLI):
├── accordion.tsx, alert-dialog.tsx, alert.tsx, aspect-ratio.tsx
├── avatar.tsx, badge.tsx, breadcrumb.tsx, button.tsx
├── calendar.tsx, card.tsx, carousel.tsx, chart.tsx
├── checkbox.tsx, collapsible.tsx, command.tsx, context-menu.tsx
├── dialog.tsx, drawer.tsx, dropdown-menu.tsx, form.tsx
├── hover-card.tsx, input-otp.tsx, input.tsx, label.tsx
├── menubar.tsx, navigation-menu.tsx, popover.tsx, progress.tsx
├── radio-group.tsx, scroll-area.tsx, select.tsx, separator.tsx
├── sheet.tsx, skeleton.tsx, slider.tsx, sonner.tsx
├── switch.tsx, table.tsx, tabs.tsx, textarea.tsx
├── toast.tsx, toggle-group.tsx, toggle.tsx, tooltip.tsx
└── pagination.tsx, resizable.tsx, select.tsx
```

---

## 🔧 Utilities & Helpers (`src/lib/`)

### **Context Providers**
```
├── cart-context.tsx             # Shopping cart state management
│   ├── State: items, quantities, totals
│   ├── Actions: add, remove, update, clear
│   ├── Persistence: localStorage integration
│   └── Types: CartItem, CartContextType
```

### **Configuration Files**
```
├── payload.config.ts            # Main Payload configuration
│   ├── Database: Vercel Postgres adapter
│   ├── Storage: Vercel Blob/S3 plugins
│   ├── Email: Nodemailer with Gmail
│   ├── Collections: All collection imports
│   ├── Admin: Custom components integration
│   └── Environment: Dynamic URL detection
└── payload-types.ts             # Auto-generated types (DO NOT MODIFY)
```

---

## 🗄️ Database Migrations (`src/migrations/`)

```
├── 20250908_055127.ts           # Initial schema setup
├── 20250909_050442.ts           # Collection updates
└── 20250911_063423.ts           # Enhanced order system
```

**Migration Commands:**
```bash
pnpm migrate:create              # Create new migration
pnpm payload migrate             # Run pending migrations
```

---

## 🚀 Development & Build Scripts

### **Package.json Scripts**
```json
{
  "scripts": {
    "dev": "next dev",                    // Development server
    "build": "next build",                // Production build
    "start": "next start",                // Production server
    "devsafe": "rm -rf .next && next dev", // Clean development
    "lint": "next lint",                  // ESLint validation
    "ci": "payload migrate && pnpm generate:importmap && pnpm generate:types && pnpm build",
    "generate:types": "payload generate:types",      // Type generation
    "generate:importmap": "payload generate:importmap", // Admin imports
    "migrate:create": "payload migrate:create",      // New migration
    "payload": "payload"                  // Payload CLI
  }
}
```

### **Build Pipeline**
1. **Development**: `pnpm dev` → http://localhost:3000
2. **Type Safety**: `pnpm generate:types` → payload-types.ts
3. **Admin Setup**: `pnpm generate:importmap` → importMap.js
4. **Production**: `pnpm build` → .next/ folder
5. **CI/CD**: `pnpm ci` → Full pipeline for deployment

---

## 🔒 Authentication & Authorization

### **User Roles**
```typescript
type UserRole = 'admin' | 'user'

// Access Patterns:
- Public: Product browsing, registration
- Authenticated: Order placement, profile management
- Admin: Order management, content administration
- Self: Own orders and profile data only
```

### **Security Features**
- **JWT Authentication**: Payload's built-in system
- **Role-based Access Control**: Collection-level permissions
- **Server-side Validation**: Never trust client data
- **CORS Configuration**: Restricted origins
- **Environment Variables**: Secure credential storage

---

## 📧 Email System

### **Email Templates**
- **Customer Notifications**: Bangla language templates
- **Admin Notifications**: English language templates
- **Order Confirmations**: Detailed order breakdown
- **Status Updates**: Real-time order tracking
- **Password Reset**: Secure token-based reset

### **Email Configuration**
```typescript
// Required Environment Variables:
GMAIL_USER=your-email@gmail.com
GOOGLE_APP_PASSWORD=your-app-password
EMAIL_DEFAULT_FROM_NAME=Online Bazar
ORDER_NOTIFICATIONS_EMAIL=admin@yourdomain.com
```

---

## 🎨 Styling & Design System

### **CSS Architecture**
```
src/app/
├── globals.css                  # Global styles, CSS variables
└── (payload)/custom.scss        # Admin-specific enhancements

Design Tokens:
├── Colors: Status-specific color palette
├── Typography: Consistent font scales
├── Spacing: Standardized margins/padding
├── Animations: Smooth transitions and micro-interactions
└── Responsive: Mobile-first breakpoints
```

### **Component Styling Strategy**
1. **Tailwind CSS**: Primary styling system
2. **CSS Variables**: Theme-aware color system
3. **shadcn/ui**: Consistent component library
4. **Custom Components**: Inline styles for dynamic content
5. **SCSS**: Admin panel enhancements

---

## 🔧 Environment Configuration

### **Required Variables** (`.env.example`)
```bash
# Database
POSTGRES_URL=postgresql://username:password@host:port/database
DATABASE_URL=postgresql://username:password@host:port/database

# Payload CMS
PAYLOAD_SECRET=your-super-secret-key-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Media Storage (choose one)
BLOB_READ_WRITE_TOKEN=vercel_blob_token
# OR S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY

# Email
GMAIL_USER=your-email@gmail.com
GOOGLE_APP_PASSWORD=your-app-password
EMAIL_DEFAULT_FROM_NAME=Online Bazar
ORDER_NOTIFICATIONS_EMAIL=admin@yourdomain.com

# Production
NODE_ENV=production
DYAD_DISABLE_DB_PUSH=true
```

---

## 🚀 Deployment Configuration

### **Vercel Setup** (`vercel.json`)
```json
{
  "buildCommand": "pnpm run ci",
  "functions": { "app/api/**/*.ts": { "maxDuration": 30 } },
  "build": { "env": { "NODE_OPTIONS": "--no-deprecation" } },
  "crons": [{ "path": "/api/abandoned-carts/mark?ttlMinutes=60", "schedule": "0 0 * * *" }]
}
```

### **GitHub Actions** (`.github/workflows/deploy.yml`)
- **Trigger**: Push to main branch
- **Steps**: Install → Generate Types → Build → Deploy
- **Environment**: Node.js 20, pnpm 10

---

## 📊 Analytics & Monitoring

### **Built-in Analytics**
- **Order Metrics**: Revenue, conversion rates, average order value
- **User Analytics**: New users, device breakdown
- **Cart Analytics**: Abandonment tracking, recovery
- **Performance**: Database health checks

### **Custom Metrics API** (`/api/admin/metrics`)
- **Time Ranges**: This month, all time
- **Charts**: Sales trends, device usage
- **KPIs**: Gross sales, active orders, conversions

---

## 🧪 Testing Strategy

### **Quality Assurance**
- **ESLint**: Code quality enforcement
- **TypeScript**: Compile-time type checking  
- **Build Verification**: Production build testing
- **Manual Testing**: Order flow, admin workflows

### **Testing Commands**
```bash
pnpm lint                        # Code quality check
pnpm build                       # Production build test
pnpm dev                         # Development testing
```

---

## 🔄 Development Workflow

### **Standard Development Flow**
1. **Setup**: `pnpm install` → `.env.local` → `pnpm dev`
2. **Development**: Code changes → Auto-reload
3. **Type Safety**: `pnpm generate:types` after schema changes
4. **Quality Check**: `pnpm lint` before commit
5. **Build Test**: `pnpm build` before push
6. **Deployment**: `git push origin main` → Auto-deploy

### **Feature Development**
1. **Schema Changes**: Update collections → Generate types
2. **API Development**: Add/modify routes → Test endpoints
3. **UI Components**: Build with TypeScript → Style with Tailwind
4. **Integration**: Test full workflow → Verify email notifications
5. **Documentation**: Update relevant docs

---

## 🎯 Key Features Summary

### **E-commerce Capabilities**
- ✅ Product catalog with categories and media
- ✅ Shopping cart with persistent storage
- ✅ Order management with status tracking
- ✅ User authentication and profiles
- ✅ Email notifications in Bangla
- ✅ Admin dashboard with analytics
- ✅ Review and rating system
- ✅ Responsive mobile design

### **Administrative Features**
- ✅ Interactive order status dropdown
- ✅ Real-time status updates with notifications
- ✅ Customer email automation
- ✅ Analytics dashboard with metrics
- ✅ User and content management
- ✅ Media upload and optimization
- ✅ Abandoned cart recovery
- ✅ Database health monitoring

### **Technical Excellence**
- ✅ Full TypeScript coverage
- ✅ Server-side rendering (SSR)
- ✅ API-first architecture
- ✅ Automated deployment pipeline
- ✅ Production-ready configuration
- ✅ Comprehensive error handling
- ✅ Security best practices
- ✅ Performance optimization

---

## 📞 Support & Maintenance

### **Documentation Resources**
- **README.md**: Basic setup and overview
- **WARP.md**: AI development guidance  
- **DEPLOYMENT.md**: Production deployment
- **AI_RULES.md**: Development best practices
- **CODEBASE_INDEX.md**: This comprehensive guide

### **Development Tools**
- **VS Code**: Configured workspace with extensions
- **GitHub Actions**: Automated CI/CD
- **Vercel**: Production hosting and analytics
- **Payload CMS**: Admin interface and API

---

**🎉 Your portal-mini-store-template is now fully indexed and documented for optimal AI assistance and future development!**