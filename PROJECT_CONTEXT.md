# Portal Mini Store Template - Project Context

## Overview
This is a Next.js 15 e-commerce template built with Payload CMS 3.0. It provides a complete storefront with user authentication, cart management, and order processing capabilities.

## Key Features
- User authentication (registration, login, password reset)
- Shopping cart with persistence
- Order management
- Product catalog with categories
- Delivery zone configuration
- Abandoned cart tracking
- Responsive design

## Technology Stack
- **Frontend**: Next.js 15 with App Router
- **CMS**: Payload CMS 3.0
- **Database**: PostgreSQL (Vercel Postgres)
- **Authentication**: Payload built-in auth
- **Storage**: Vercel Blob or S3
- **Email**: Nodemailer with Gmail
- **Styling**: Tailwind CSS

## Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── (frontend)/      # Public frontend pages
│   ├── api/            # API routes
│   └── payload/        # Payload admin
├── collections/        # Payload collections
├── components/         # React components
├── lib/               # Utility functions
└── payload.config.ts   # Payload configuration
```

## Recent Changes

### 1. Removed Cart Events Functionality (September 19, 2025)
**Problem**: The cart events API (`/api/cart/events`) was causing Vercel Runtime Timeout errors due to long-running Server-Sent Events (SSE) connections.

**Solution**: 
- Removed the `/api/cart/events/route.ts` file
- Removed the `cart-realtime.ts` utility file
- Removed the real-time cart synchronization useEffect hook in `cart-context.tsx`
- Removed unused imports

**Impact**: 
- Real-time cart updates between browser tabs are no longer available
- Cart synchronization now relies solely on periodic polling
- Eliminates timeout errors on serverless platforms

### 2. Fixed Authentication Issues (September 19, 2025)
**Problem**: Login requests were failing due to incorrect parsing of request bodies with nested `_payload` structure.

**Solution**:
- Enhanced the login route parsing logic to handle multipart/form-data requests
- Improved error handling and logging for authentication flow
- Fixed cookie creation for authenticated sessions

### 3. Simplified Cart API (Previous changes)
**Problem**: Cart API was experiencing timeouts and overhead from Google Analytics events.

**Solution**:
- Removed Google Analytics event tracking from cart operations
- Simplified cart helper functions
- Reduced API response complexity

## API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `POST /api/users/forgot-password` - Password reset request
- `POST /api/users/reset-password` - Password reset
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile

### Cart
- `GET /api/cart` - Get current cart
- `POST /api/cart` - Update cart
- `POST /api/cart/merge` - Merge guest cart with user cart

### Orders
- `POST /api/orders` - Create new order

## Configuration
The application is configured through environment variables in `.env.local`:

- `POSTGRES_URL` - Database connection string
- `PAYLOAD_SECRET` - Payload CMS secret key
- `GMAIL_USER` - Email address for sending notifications
- `GOOGLE_APP_PASSWORD` - App password for Gmail
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

## Deployment
The application is designed for deployment on Vercel with Vercel Postgres and Vercel Blob storage.

## Performance Considerations
- Removed real-time cart updates to prevent serverless timeout issues
- Simplified cart API to reduce overhead
- Optimized database queries in cart operations

## Future Improvements
- Implement WebSocket-based real-time updates as an alternative to SSE
- Add caching for frequently accessed data
- Optimize image loading and delivery