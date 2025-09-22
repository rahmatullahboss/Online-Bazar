# MCP Abandoned Cart Cleanup Tool

## Overview
This document explains how to use the Vercel MCP tool for cleaning up abandoned carts without relying on cron jobs, which are not available on Vercel's free plan.

## How It Works
Instead of using cron jobs, this solution uses:
1. **Client-side heartbeat signals** - Keeps active carts marked as "active"
2. **Manual trigger via MCP** - Allows AI tools to trigger cleanup on demand
3. **Event-based tracking** - Marks carts when users leave the site

## MCP Tool Endpoint
The MCP tool is available at:
```
POST /api/mcp/abandoned-carts/cleanup
```

## Authentication
This endpoint requires admin authentication. When using through Vercel MCP, you'll need to authenticate with your Vercel account which has admin access to the project.

## Parameters
The tool accepts the following parameters:

| Parameter | Type | Description | Default | Range |
|-----------|------|-------------|---------|-------|
| `ttlMinutes` | number | Time in minutes after which inactive carts are marked as abandoned | 30 | 5-1440 |

## Usage Examples

### Basic Usage
```json
{
  "ttlMinutes": 30
}
```

### Aggressive Cleanup
```json
{
  "ttlMinutes": 15
}
```

### Conservative Cleanup
```json
{
  "ttlMinutes": 60
}
```

## Using with AI Assistants

### Claude Code/Chat
```
/mcp
> Use the "Vercel MCP Abandoned Cart Cleanup Tool" to clean up abandoned carts with a 30-minute timeout
```

### ChatGPT
When the tool is available in the connector, you can prompt:
```
Please use the Vercel MCP Abandoned Cart Cleanup Tool to mark carts inactive for 30 minutes as abandoned.
```

### Cursor/VS Code
With the MCP configured, you can trigger the tool through the IDE's MCP interface.

## How to Set Up

1. **Configure Vercel MCP** as described in `VERCEL_MCP_SETUP.md`
2. **Authenticate** with your Vercel account when prompted
3. **Use the tool** through your AI assistant

## Benefits of This Approach

1. **No Cron Jobs Required** - Works on Vercel's free plan
2. **On-Demand Cleanup** - Trigger cleanup when needed
3. **AI Integration** - Can be automated through AI workflows
4. **Resource Efficient** - Processes carts in small batches
5. **Flexible Timing** - Adjustable timeout periods

## Manual Trigger Option

You can also trigger cleanup manually by visiting:
```
GET /api/abandoned-carts/heartbeat?ttlMinutes=30
```

This endpoint can be called:
- Through the browser
- Via curl/wget
- Through other automation tools

## Client-side Heartbeat System

The system automatically sends heartbeat signals every 5 minutes while a user has items in their cart:
- Keeps genuinely active carts marked as "active"
- Reduces false positives for abandonment
- Works even when users have multiple tabs open

## Event-based Abandonment Detection

When users leave the site, the system sends a final update:
- `beforeunload` event (closing tab/browser)
- `pagehide` event (navigating away)
- `visibilitychange` event (switching tabs/apps)

This ensures carts are marked appropriately when users genuinely abandon them.

## Error Handling

The system includes robust error handling:
- Graceful degradation if heartbeat fails
- Detailed error reporting through MCP
- Automatic retry logic for failed updates
- Bounded execution to prevent resource exhaustion

## Security

- Requires admin authentication
- Input validation and sanitization
- Rate limiting through batch processing
- Secure session handling