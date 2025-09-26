# 🛍️ Online Bazar

This template comes configured with the bare minimum to get started on anything you need.

## Features

### 🌟 Public Features (No Authentication Required)
- **Browse Products**: View available items with images, descriptions, prices, and categories
- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile devices
- **Instant Hero Streaming**: Homepage hero renders immediately while the product grid loads asynchronously with graceful fallbacks

### 👤 Authenticated User Features
- **User Registration & Login**: Secure authentication system
- **Google Sign-In**: Sign in with Google account
- **Place Orders**: Add snacks to cart and place orders
- **Order History**: View personal order history with status tracking
- **Order Tracking**: See order status (Pending, Completed, Cancelled)
- **Cancel Pending Orders**: Cancel orders while they are still pending

### 🔧 Admin Features
- **Enhanced Admin Dashboard**: Comprehensive order management with analytics
- **Interactive Order Management**: Real-time status updates with dropdown interface
- **Advanced Status System**: 6-status workflow (⏳ Pending → 🔄 Processing → 📦 Shipped → ✅ Completed/❌ Cancelled/🔄 Refunded)
- **Smart Notifications**: Toast alerts for admin actions with email confirmation
- **Order Analytics**: Detailed statistics, sales trends, and performance metrics
- **Inventory Management**: Complete product catalog management through Payload CMS
- **Delivery Settings**: Configure inside/outside Dhaka delivery charges and the free-delivery threshold directly from Payload.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Payload CMS 3.0
- **Database**: Vercel Postgres
- **Authentication**: Built-in Payload authentication with role-based access + Google OAuth via Auth.js (NextAuth v5)
- **Styling**: Custom CSS with modern responsive design
- **Media**: Sharp for image processing

## User Roles

### Regular Users (`role: 'user'`)
- Can view all available snacks
- Can place orders for snacks
- Can view their own order history
- Cannot modify orders once placed
- Can cancel orders while status is pending

### Admin Users (`role: 'admin'`)
- All regular user permissions
- Can access admin dashboard
- Can view all orders from all customers  
- Can update order status
- Can manage snack inventory through CMS admin panel

## Collections

### Users
- Email, first name, last name
- Role-based authentication (user/admin)
- Default role: 'user'

### Snacks
- Name, description, price, category
- Image upload with media relation
- Availability toggle
- Categories: Chips, Candy, Cookies, Nuts, Crackers, Drinks

### Orders
- User relationship
- Array of items (snack + quantity)
- Total amount calculation
- Status tracking (pending/completed/cancelled)
- Order date tracking


### Delivery Settings
- Single-record collection managed by admins.
- Fields: inside/outside Dhaka delivery charges and the free-delivery threshold.
- Checkout and quick-order flows use these values to calculate shipping and trigger free delivery automatically.
### Media
- Image upload and management
- Alt text for accessibility

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- pnpm 9+ or 10+
- PostgreSQL database (Vercel Postgres recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dyad-snacks
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   PAYLOAD_SECRET=your-secret-key
   POSTGRES_URL=your-postgres-connection-string
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### First Time Setup

1. **Create Admin User**: Visit `/admin` to create your first admin user
2. **Add Products**: Use the admin panel to add items with images
3. **Test Ordering**: Create a regular user account to test the ordering flow
4. **Review Delivery Settings**: In Payload admin, open “Delivery Settings” to adjust charges for inside/outside Dhaka and the free-delivery threshold.

## API Endpoints

### Orders
- `POST /api/orders` - Create a new order (authenticated users)
- `PATCH /api/orders/update-status` - Update order status (admin only)
- `POST /api/orders/cancel` - Cancel a pending order (authenticated users)

### Built-in Payload Endpoints
- `/api/users` - User management
- `/api/snacks` - Snack management  
- `/api/media` - Media upload/management
- `/admin` - Admin panel access

## Application Flow

### For Visitors (Unauthenticated)
1. **Homepage**: Browse all available snacks
2. **Login Required**: Click "Login to Order" to authenticate
3. **Registration**: Create account with first name, last name, email, password

### For Regular Users
1. **Browse & Order**: View snacks and click "Order Now"
2. **Order Form**: Select quantity and place order
3. **Order Confirmation**: Redirected to "My Orders" with success message
4. **Order History**: View all personal orders with status

### For Admin Users
1. **Admin Dashboard**: Access via navigation or direct link  
2. **Order Overview**: See statistics and all orders
3. **Status Management**: Update order status with real-time buttons
4. **Inventory Management**: Access full CMS admin panel

## Responsive Design

The application is fully responsive with breakpoints:
- **Desktop**: 1200px+ (full grid layout, side-by-side forms)
- **Tablet**: 768px-1199px (adapted grid, stacked layouts)
- **Mobile**: <768px (single column, touch-friendly buttons)

## Streaming & Loading States

- Homepage data fetching for authentication and the product catalog now starts in parallel before any UI rendering.
- The hero section streams right away, and the product grid resolves inside a `Suspense` boundary with a skeleton layout that prevents layout shift.
- A matching header skeleton keeps navigation placement stable while user session data resolves.

## Security Features

- **Role-based Access Control**: Proper separation of user and admin permissions
- **Authentication Required**: Protected routes for ordering and admin functions
- **Data Validation**: Server-side validation for all order data
- **Price Verification**: Server validates prices to prevent manipulation

## Deployment

### Using Payload Cloud
1. Connect your repository to Payload Cloud
2. Configure environment variables
3. Deploy automatically with MongoDB and S3 storage

### Using Vercel
1. Connect repository to Vercel
2. Configure Vercel Postgres database
3. Set environment variables
4. Deploy

## Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm generate:types  # Generate TypeScript types
pnpm lint         # Run ESLint
```

## Google OAuth Setup

This project now supports Google Sign-In/Sign-Up using Auth.js (NextAuth v5) with the payload-authjs plugin. Users can sign in with their Google accounts, and new users will be automatically registered. The sessions are automatically recognized by both the site and Payload admin.

### Setup Instructions

1. Follow the instructions in [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md) to configure Google OAuth
2. Add the required environment variables to your `.env.local` file, including:
   - `AUTH_GOOGLE_ID` - Your Google OAuth client ID
   - `AUTH_GOOGLE_SECRET` - Your Google OAuth client secret
   - `AUTH_SECRET` - A random string used to encode JWT tokens
   - `ADMIN_EMAIL` - The email address that should be granted admin access
3. Restart your development server

### How It Works

- Uses Auth.js (NextAuth v5) with the official Google provider on the Next.js side
- Bridges to Payload with the payload-authjs plugin so your Auth.js session automatically counts as a Payload session
- Adds a "Continue with Google" button to the login page
- New users are automatically registered when they sign in with Google for the first time
- Existing users are signed in to their existing accounts
- Supports automatic role assignment for admin users

### Important Note About Database IDs

This project now uses UUID IDs for all database tables instead of integer/serial IDs to resolve Auth.js compatibility issues. When deploying or setting up a new environment, make sure to run migrations:

```bash
pnpm payload migrate
```

See [UUID_MIGRATION_NOTE.md](UUID_MIGRATION_NOTE.md) for more details.

### Troubleshooting

If you encounter a "redirect_uri_mismatch" error:

1. Check that your Google OAuth client is configured with the correct redirect URIs:
   - http://localhost:3000/api/auth/callback/google (for development)
   - https://yourdomain.com/api/auth/callback/google (for production)

2. Make sure you've replaced the placeholder values in your `.env.local` file with your actual Google OAuth credentials

3. Restart your development server after making changes to environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For questions or issues:
- Check the [Payload CMS documentation](https://payloadcms.com/docs)
- Review the Next.js documentation
- Open an issue in the repository

---

**Built with ❤️ using Payload CMS and Next.js**
