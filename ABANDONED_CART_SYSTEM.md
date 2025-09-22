# Abandoned Cart Tracking System

## Overview
This system automatically tracks and marks shopping carts as abandoned when customers leave the site without completing their purchase. The implementation is designed to work without cron jobs, making it compatible with Vercel's free plan.

## How It Works

### 1. Real-time Cart Activity Tracking
- Every time a user adds, removes, or updates items in their cart, an activity update is sent to the server
- The server maintains an "active" status for each cart with a timestamp of the last activity
- Cart data is stored in the `abandoned-carts` collection in the database

### 2. Client-side Heartbeat System
- While a user has items in their cart, the client sends periodic "heartbeat" signals to the server
- These signals keep the cart marked as "active" as long as the user is engaged with the site
- Heartbeats are sent every 5 minutes while the cart has items

### 3. Client-side Abandonment Detection
- When a user is about to leave the site (closing tab, navigating away, etc.), a final "abandonment" signal is sent
- This is accomplished through event listeners for `beforeunload`, `pagehide`, and `visibilitychange` events
- The signal includes all current cart items and customer information

### 4. Manual Cleanup via MCP
- Instead of cron jobs, cleanup is triggered manually through Vercel MCP tools
- AI assistants can trigger cleanup on demand when needed
- Admin users can also trigger cleanup through direct API calls

## API Endpoints

### `/api/cart-activity` (POST)
Records cart activity and maintains the "active" status of carts.

**Special Parameters:**
- `isFinalUpdate`: Indicates this is the final update when a user leaves the site
- `isPotentialAbandonment`: Indicates a potential abandonment (e.g., cart closed)

### `/api/abandoned-carts/heartbeat` (POST)
Sends a heartbeat signal to keep a cart marked as active.

**Parameters:**
- `sessionId`: The session ID of the cart to keep active

### `/api/abandoned-carts/heartbeat` (GET)
Manually triggers cleanup of abandoned carts (admin or secret authentication required).

**Parameters:**
- `ttlMinutes`: Time in minutes after which inactive carts are marked as abandoned (default: 30)

### `/api/mcp/abandoned-carts/cleanup` (POST)
MCP endpoint for cleaning up abandoned carts on demand.

**Parameters:**
- `ttlMinutes`: Time in minutes after which inactive carts are marked as abandoned (default: 30)

## Vercel Free Plan Compatibility

To ensure the system works efficiently within Vercel's free plan limitations:

1. **No Cron Jobs Required**: Uses client-side heartbeats and manual triggers instead
2. **Limited Batch Size**: Only 25-100 carts are processed in each cleanup run
3. **Efficient Queries**: Database queries are optimized with proper indexing and limits
4. **Lightweight Operations**: Minimal data processing is done in each operation
5. **Reasonable TTL Values**: Default timeouts prevent excessive resource usage
6. **Error Handling**: Graceful error handling prevents cascading failures

## Configuration

The system can be configured through the following parameters:

- **TTL (Time To Live)**: How long to wait before marking a cart as abandoned (default: 30 minutes)
- **Batch Size**: Number of carts to process in each cleanup run (default: 25 for MCP, 100 for manual)
- **Heartbeat Interval**: How frequently to send heartbeat signals (default: 5 minutes)

## Data Flow

1. User adds items to cart → Cart activity recorded in database
2. Client sends periodic heartbeats → Cart remains "active"
3. User leaves site → Final abandonment signal sent
4. Admin/MCP triggers cleanup → Inactive carts identified and marked as abandoned
5. Admins can view abandoned carts in the Payload CMS dashboard

## Future Enhancements

1. **Email Recovery System**: Send automated emails to customers with abandoned carts
2. **Analytics Dashboard**: Provide insights on cart abandonment rates and patterns
3. **Segmentation**: Different TTL values for different customer segments
4. **Re-engagement Campaigns**: Integrate with marketing tools for targeted campaigns
5. **n8n Integration**: Automated workflow management for cart cleanup and reminders

## Using with Vercel MCP

For detailed instructions on using the abandoned cart cleanup through Vercel MCP, see `MCP_ABANDONED_CARTS.md`.

## Using with n8n

For detailed instructions on using the abandoned cart management with n8n workflows, see `N8N_ABANDONED_CART_SETUP.md`.