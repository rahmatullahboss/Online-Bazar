# n8n Abandoned Cart Management Setup Guide

## Overview
This guide explains how to set up the n8n workflow for managing abandoned carts in your Portal Mini Store application. The workflow provides automated cleanup of abandoned carts, sending reminders to customers, and logging execution details.

## Prerequisites
1. A working Portal Mini Store deployment on Vercel
2. An n8n instance (cloud or self-hosted)
3. Admin access to both your Vercel project and n8n instance

## 1. Vercel Environment Setup

Add the following environment variable to your Vercel dashboard:

```env
CRON_SECRET=your-very-secure-secret-here
```

To add this in Vercel:
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add a new variable with:
   - Name: `CRON_SECRET`
   - Value: A strong, unique secret (e.g., `sk_live_abcd1234efgh5678`)
   - Environment: Select appropriate environments (Production, Preview, Development)

## 2. n8n Workflow Setup

### Import the Workflow
1. In your n8n instance, go to Workflows
2. Click "Import Workflow"
3. Upload the `n8n-abandoned-cart-workflow.json` file from this repository
4. The workflow will be imported with all necessary nodes and connections

### Configure Workflow Variables
After importing, go to Workflow Settings → Variables and set:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `domain` | Your Vercel app domain | `https://your-app.vercel.app` |
| `cronSecret` | Same secret as in Vercel | `sk_live_abcd1234efgh5678` |
| `ttlMinutes` | Minutes before cart is abandoned | `30` |

## 3. Security Features

The workflow implements double authentication for all API calls:

1. **URL Parameter**: `?secret=your-secret`
2. **Header**: `X-Cron-Secret: your-secret`

Both methods are used simultaneously to ensure maximum security.

## 4. API Endpoints Used

The workflow interacts with the following endpoints in your Portal Mini Store:

```javascript
// Main cleanup endpoint
POST https://your-domain.vercel.app/api/abandoned-carts/cleanup?ttlMinutes=30&secret=xxx

// Status check endpoint
GET https://your-domain.vercel.app/api/abandoned-carts/status?secret=xxx

// Send reminders endpoint
POST https://your-domain.vercel.app/api/abandoned-carts/reminders?secret=xxx

// Logging endpoint
POST https://your-domain.vercel.app/api/logs/cron-execution?secret=xxx
```

## 5. Workflow Execution Flow

1. **Trigger**: The workflow runs on a schedule (every 30 minutes by default)
2. **Cleanup**: Marks inactive carts as abandoned based on TTL
3. **Status Check**: Gets statistics about active/abandoned carts
4. **Reminders**: Sends email reminders to customers with abandoned carts
5. **Logging**: Records execution details for audit purposes

## 6. Features

✅ Secret-based authentication (most secure)
✅ Runs every 30 minutes (adjustable)
✅ Error handling with fallback
✅ Execution logging for audit trail
✅ Cart reminder emails for abandoned carts
✅ No user token management needed

## 7. Schedule Configuration

To set up the cron schedule:
1. In n8n, go to your workflow
2. Click on the "Start" node
3. Set the trigger to "Cron"
4. Configure the schedule (e.g., `*/30 * * * *` for every 30 minutes)

## 8. Testing

Before activating the workflow:

1. **Manual Test**: Click "Execute Workflow" to test manually
2. **Check Logs**: Verify execution logs in n8n
3. **API Responses**: Check that all API endpoints respond correctly
4. **Email Functionality**: Ensure reminder emails are sent properly

## 9. Activate the Workflow

Once testing is complete:
1. Toggle the workflow to "Active"
2. Monitor the first few executions
3. Check your Vercel logs for any errors
4. Verify that abandoned carts are being processed correctly

## 10. Monitoring and Maintenance

### Logs
- Check n8n execution logs for workflow status
- Monitor Vercel function logs for API errors
- Review the logging endpoint for detailed execution data

### Troubleshooting
- If authentication fails, verify the CRON_SECRET matches in both Vercel and n8n
- If API calls fail, check that your Vercel deployment is accessible
- If reminders aren't sending, verify email configuration in your Portal Mini Store

## 11. Customization

### Adjusting TTL
To change how long carts remain active before being marked as abandoned:
1. Modify the `ttlMinutes` variable in n8n
2. Update the schedule frequency if needed (shorter TTL may require more frequent runs)

### Email Reminders
The reminder system sends emails in 3 stages:
1. First reminder after 24 hours
2. Second reminder after 48 hours
3. Final reminder after 72 hours

These can be customized in the `src/app/api/abandoned-carts/reminders/route.ts` file.

## Security Best Practices

1. **Secret Management**: Use strong, unique secrets and rotate them periodically
2. **Access Control**: Ensure only authorized personnel can access the n8n workflow
3. **Network Security**: If possible, restrict API endpoint access to only the n8n instance IP
4. **Monitoring**: Regularly review execution logs for suspicious activity

## Support

If you encounter issues with the setup:
1. Check that all environment variables are correctly set
2. Verify that your Vercel deployment is working properly
3. Ensure your n8n instance can reach your Vercel endpoints
4. Review the API documentation in `ABANDONED_CART_SYSTEM.md`