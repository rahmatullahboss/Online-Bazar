# OTP System Usage Examples

## Quick Start (No Paid Services)

### 1. Environment Variables
```env
# Basic setup using your existing Gmail
OTP_ENABLED=true
OTP_USE_SMS=false
OTP_USE_EMAIL=false
OTP_FALLBACK_EMAIL=true
OTP_MAX_DAILY=20
OTP_MAX_HOURLY=5
OTP_COOLDOWN_MINUTES=10
OTP_AUTO_DISABLE=true
OTP_AUTO_ENABLE=true
```

### 2. How It Works
- **OTP Service**: Enabled with limits
- **SMS Service**: Disabled (no paid service)
- **Email Service**: Disabled (no paid service)
- **Fallback**: Uses your existing Gmail setup
- **Limits**: 20 OTPs per day, 5 per hour, 10 minutes cooldown
- **Auto Disable**: Automatically disables when daily limit reached
- **Auto Enable**: Automatically enables next day

### 3. User Experience
1. User requests OTP → System checks limits
2. If within limits → Sends via Gmail (your existing setup)
3. If limit reached → Service auto-disables, but still sends via Gmail
4. Next day → Service auto-enables with fresh limits
5. **No errors shown to users** - Always works with Gmail fallback

## With Paid Services

### 1. SMS + Email Setup
```env
# Enable all services
OTP_ENABLED=true
OTP_USE_SMS=true
OTP_USE_EMAIL=true
OTP_FALLBACK_EMAIL=true

# SMS Service
GREENWEB_TOKEN=your_greenweb_token

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
```

### 2. How It Works
- **Primary**: SMS service (fast, reliable)
- **Fallback**: Email service if SMS fails
- **Final Fallback**: Gmail if all else fails

## Admin Control Panel

### 1. Access Admin Panel
Navigate to `/admin` and look for "OTP Configuration" section.

### 2. Toggle Services
- **Enable/Disable OTP**: Master switch
- **SMS Service**: Turn on/off SMS sending
- **Email Service**: Turn on/off dedicated email
- **Fallback Email**: Use Gmail when limits hit

### 3. Adjust Limits
- **Daily Limit**: Max OTPs per day (default: 50)
- **Hourly Limit**: Max OTPs per hour (default: 10)
- **Cooldown**: Wait time between requests (default: 5 minutes)

## API Examples

### 1. Send OTP
```javascript
// Send OTP via email
const response = await fetch('/api/otp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    type: 'registration'
  })
})

// Response
{
  "success": true,
  "message": "OTP sent to your email address",
  "sentVia": "email (fallback)",
  "usedFallback": true,
  "remainingDailyRequests": 19,
  "remainingHourlyRequests": 4,
  "cooldownMinutes": 10
}
```

### 2. Send OTP via SMS
```javascript
// Send OTP via SMS
const response = await fetch('/api/otp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '01712345678',
    type: 'registration'
  })
})

// Response
{
  "success": true,
  "message": "OTP sent to your phone number",
  "sentVia": "SMS",
  "usedFallback": false,
  "remainingDailyRequests": 19,
  "remainingHourlyRequests": 4,
  "cooldownMinutes": 5
}
```

### 3. Rate Limit Response
```javascript
// When limits are reached
{
  "error": "Daily OTP limit reached. You can request 0 more OTP(s) tomorrow.",
  "remainingDailyRequests": 0,
  "remainingHourlyRequests": 2,
  "cooldownMinutes": 0,
  "fallbackAvailable": true
}
```

### 4. Auto Disable Response (No Error - Uses Fallback)
```javascript
// When service is auto-disabled, still works with fallback
{
  "success": true,
  "message": "OTP sent to your email address",
  "sentVia": "email (fallback)",
  "usedFallback": true,
  "serviceDisabled": true,
  "remainingDailyRequests": 0,
  "remainingHourlyRequests": 0,
  "cooldownMinutes": 0
}
```

## Error Handling

### 1. Service Unavailable
```javascript
{
  "error": "OTP service is currently unavailable",
  "remainingDailyRequests": 0,
  "remainingHourlyRequests": 0,
  "cooldownMinutes": 15,
  "fallbackAvailable": true
}
```

### 2. Invalid Input
```javascript
{
  "error": "Please provide a valid email address"
}
```

### 3. Service Not Configured
```javascript
{
  "error": "SMS service is not configured. Please contact support."
}
```

## Frontend Integration

### 1. Registration Form
```tsx
const handleSendOTP = async () => {
  try {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        phone: formData.phone,
        type: 'registration'
      })
    })

    const data = await response.json()

    if (response.ok) {
      setCurrentStep('otp-verification')
      setSuccess('OTP sent successfully!')
      
      // Show service status (optional)
      if (data.serviceDisabled) {
        setInfo('Service temporarily using backup email system')
      }
      
      // Show remaining requests
      if (data.remainingDailyRequests < 5) {
        setWarning(`Only ${data.remainingDailyRequests} OTPs remaining today`)
      }
    } else {
      setError(data.error)
    }
  } catch (error) {
    setError('Network error. Please try again.')
  }
}
```

### 2. OTP Verification
```tsx
const handleOTPComplete = async (otp: string) => {
  try {
    const response = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        code: otp,
        type: 'registration'
      })
    })

    const data = await response.json()

    if (response.ok) {
      // Proceed with registration
      await handleRegistration()
    } else {
      setError(data.error)
    }
  } catch (error) {
    setError('Verification failed. Please try again.')
  }
}
```

## Monitoring and Analytics

### 1. Check Service Status
```javascript
const response = await fetch('/api/admin/otp-config')
const data = await response.json()

console.log('OTP Service Status:', data.status)
console.log('Current Config:', data.config)
```

### 2. Usage Statistics
```javascript
// Get usage stats for a specific user
const stats = otpConfig.getUsageStats('user@example.com')
console.log('Daily Used:', stats.dailyUsed)
console.log('Hourly Used:', stats.hourlyUsed)
console.log('Remaining:', stats.remaining)
```

## Best Practices

### 1. Error Messages
- **Never show errors to users** - Always use fallback
- Show service status (optional info)
- Display remaining request counts

### 2. Rate Limiting
- Implement client-side cooldown timers
- Show progress indicators
- Warn users about approaching limits

### 3. Fallback Strategy
- **Always enable fallback email** - Critical for user experience
- Monitor service health
- **Seamless fallback** - Users never see errors

### 4. Security
- Never expose API keys in frontend
- Implement proper rate limiting
- Log all OTP requests
- Monitor for abuse patterns

### 5. User Experience
- **Zero downtime** - Always works with Gmail
- **No error messages** - Seamless experience
- **Transparent fallback** - Users don't notice
