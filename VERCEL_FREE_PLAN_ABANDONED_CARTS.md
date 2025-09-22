# Abandoned Cart System for Vercel Free Plan

## Overview
This document explains how the abandoned cart system works on Vercel's free plan without using cron jobs, which are not supported on the free tier.

## How It Works Without Cron Jobs

### 1. Client-Side Heartbeat System
- While a user has items in their cart, the browser sends periodic "heartbeat" signals to the server every 5 minutes
- These signals keep the cart marked as "active" in the database
- When a user leaves the site (closes tab, navigates away), a final signal is sent to mark potential abandonment

### 2. Manual Cleanup Triggers
Instead of automated cron jobs, cleanup is triggered manually through:
1. **Vercel MCP Tools** - AI assistants can trigger cleanup on demand
2. **Direct API Calls** - Admin users can trigger cleanup through API endpoints
3. **Manual Dashboard Actions** - Admins can trigger cleanup through the Payload CMS

### 3. Event-Based Detection
- `beforeunload` event (closing tab/browser)
- `pagehide` event (navigating away)
- `visibilitychange` event (switching tabs/apps)

## Available Endpoints

### Manual Cleanup Endpoint
```
GET /api/abandoned-carts/heartbeat?ttlMinutes=30
```

Parameters:
- `ttlMinutes`: Time in minutes after which inactive carts are marked as abandoned (default: 30)
- Optional authentication via admin login or secret key

### MCP Cleanup Endpoint
```
POST /api/mcp/abandoned-carts/cleanup
```

Body:
```json
{
  "ttlMinutes": 30
}
```

Authentication: Requires admin access through Vercel MCP

## Using with Vercel MCP

### Claude Code/Chat
```
/mcp
> Use the "Vercel MCP Abandoned Cart Cleanup Tool" to clean up abandoned carts with a 30-minute timeout
```

### ChatGPT
When the tool is available in the connector:
```
Please use the Vercel MCP Abandoned Cart Cleanup Tool to mark carts inactive for 30 minutes as abandoned.
```

### VS Code/Cursor
With the MCP configured, you can trigger the tool through the IDE's MCP interface.

## Benefits of This Approach

1. **Vercel Free Plan Compatible** - No cron jobs required
2. **On-Demand Cleanup** - Trigger cleanup when needed
3. **AI Integration** - Can be automated through AI workflows
4. **Resource Efficient** - Processes carts in small batches
5. **Flexible Timing** - Adjustable timeout periods

## Configuration

The system can be configured through the following parameters:

- **TTL (Time To Live)**: How long to wait before marking a cart as abandoned (default: 30 minutes)
- **Batch Size**: Number of carts to process in each cleanup run (default: 25 for MCP, 50 for manual)
- **Heartbeat Interval**: How frequently to send heartbeat signals (default: 5 minutes)

## Data Flow

1. User adds items to cart → Cart activity recorded in database
2. Client sends periodic heartbeats → Cart remains "active"
3. User leaves site → Final abandonment signal sent
4. Admin/MCP triggers cleanup → Inactive carts identified and marked as abandoned
5. Admins can view abandoned carts in the Payload CMS dashboard

## Best Practices

1. **Regular Cleanup Schedule** - Set up a routine to trigger cleanup (daily/weekly)
2. **Monitor Resource Usage** - Keep batch sizes reasonable to avoid timeouts
3. **Adjust TTL Values** - Tune timeout values based on your business needs
4. **Track Recovery Rates** - Monitor how many abandoned carts are recovered