# OTP System Setup Guide

## Overview
এই guide আপনাকে OTP system setup করতে সাহায্য করবে যাতে আপনি email limit সমস্যা এড়াতে পারেন।

## Environment Variables Setup

### 1. OTP Service Configuration (Required)
```env
# Master OTP service control
OTP_ENABLED=true
OTP_USE_SMS=false
OTP_USE_EMAIL=true
OTP_FALLBACK_EMAIL=true

# Rate limiting
OTP_MAX_DAILY=50
OTP_MAX_HOURLY=10
OTP_COOLDOWN_MINUTES=5

# Auto disable/enable system
OTP_AUTO_DISABLE=true
OTP_AUTO_ENABLE=true
```

### 2. SMS Service (Optional - Only if you want SMS)

#### Option A: Twilio (Recommended)
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

#### Option B: GreenWeb (Bangladesh)
```env
GREENWEB_TOKEN=your_greenweb_token
```

#### Option C: BulkSMS
```env
BULKSMS_USERNAME=your_username
BULKSMS_PASSWORD=your_password
```

### 3. Email Service (Optional - Only if you want dedicated email)

#### Option A: SendGrid (Recommended)
```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

#### Option B: Mailgun
```env
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
MAILGUN_FROM_NAME=Your App Name
```

#### Option C: Resend (Modern Alternative)
```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 4. Default Setup (No Paid Services)
```env
# Use your existing Gmail setup
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

## Setup Instructions

### 1. SMS Service Setup (প্রথমে করুন)

#### Twilio Setup:
1. [Twilio](https://www.twilio.com) এ account করুন
2. Phone number purchase করুন
3. API credentials collect করুন
4. Environment variables set করুন

#### GreenWeb Setup (Bangladesh):
1. [GreenWeb](https://greenweb.com.bd) এ account করুন
2. SMS package purchase করুন
3. API token collect করুন

### 2. Email Service Setup (Backup হিসেবে)

#### SendGrid Setup:
1. [SendGrid](https://sendgrid.com) এ account করুন
2. API key generate করুন
3. Sender identity verify করুন
4. Environment variables set করুন

### 3. Rate Limiting Configuration

Default settings:
- **5 OTP requests per 15 minutes** per email/phone
- **10 OTP requests per day** per email/phone

এই settings পরিবর্তন করতে পারেন `src/lib/rate-limiter.ts` ফাইলে।

## Cost Comparison

### SMS Services:
- **Twilio**: ~$0.0075 per SMS (Global)
- **GreenWeb**: ~৳0.50 per SMS (Bangladesh)
- **BulkSMS**: ~$0.05 per SMS

### Email Services:
- **SendGrid**: Free 100 emails/day, then $14.95/month for 40k emails
- **Mailgun**: Free 5k emails/month, then $35/month for 50k emails
- **Resend**: Free 3k emails/month, then $20/month for 100k emails

## Recommended Setup

### For Bangladesh:
1. **Primary**: GreenWeb SMS service
2. **Fallback**: SendGrid email service
3. **Rate Limit**: 5 requests/15min, 10 requests/day

### For International:
1. **Primary**: Twilio SMS service
2. **Fallback**: SendGrid email service
3. **Rate Limit**: 3 requests/15min, 8 requests/day

## Testing

Development mode এ OTP code console এ print হবে:
```json
{
  "success": true,
  "message": "OTP sent to your phone number",
  "sentVia": "SMS",
  "debugOtp": "123456",
  "expiresIn": 600
}
```

## Monitoring

### Logs to Watch:
- SMS sending success/failure
- Email sending success/failure
- Rate limit violations
- Daily limit violations

### Metrics to Track:
- OTP delivery success rate
- Average delivery time
- Cost per OTP
- User satisfaction

## Troubleshooting

### Common Issues:

1. **SMS not sending**:
   - Check API credentials
   - Verify phone number format
   - Check account balance

2. **Email not sending**:
   - Check API keys
   - Verify sender domain
   - Check spam folder

3. **Rate limit errors**:
   - Normal behavior for abuse prevention
   - Users can wait for reset time

### Debug Mode:
Set `NODE_ENV=development` to see OTP codes in response.

## Security Considerations

1. **Never expose API keys** in frontend code
2. **Use environment variables** for all credentials
3. **Implement rate limiting** to prevent abuse
4. **Monitor usage** for unusual patterns
5. **Rotate API keys** regularly

## Production Checklist

- [ ] SMS service configured and tested
- [ ] Email service configured and tested
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] Monitoring set up
- [ ] Error handling tested
- [ ] Cost limits set
- [ ] Backup service ready
