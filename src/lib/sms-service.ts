// SMS Service for OTP delivery
// Supports multiple SMS providers for reliability

interface SMSProvider {
  name: string
  sendSMS: (phone: string, message: string) => Promise<boolean>
}

// Twilio SMS Provider
class TwilioProvider implements SMSProvider {
  name = 'twilio'

  async sendSMS(phone: string, message: string): Promise<boolean> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      const fromNumber = process.env.TWILIO_PHONE_NUMBER

      if (!accountSid || !authToken || !fromNumber) {
        console.error('Twilio credentials not configured')
        return false
      }

      // Format phone number for Bangladesh (+880)
      const formattedPhone = phone.startsWith('+') ? phone : `+880${phone.slice(1)}`

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: formattedPhone,
            Body: message,
          }),
        },
      )

      return response.ok
    } catch (error) {
      console.error('Twilio SMS error:', error)
      return false
    }
  }
}

// BulkSMS Provider (Alternative)
class BulkSMSProvider implements SMSProvider {
  name = 'bulksms'

  async sendSMS(phone: string, message: string): Promise<boolean> {
    try {
      const username = process.env.BULKSMS_USERNAME
      const password = process.env.BULKSMS_PASSWORD

      if (!username || !password) {
        console.error('BulkSMS credentials not configured')
        return false
      }

      const response = await fetch('https://api.bulksms.com/v1/messages', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone,
          body: message,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('BulkSMS error:', error)
      return false
    }
  }
}

// GreenWeb SMS Provider (Bangladesh)
class GreenWebProvider implements SMSProvider {
  name = 'greenweb'

  async sendSMS(phone: string, message: string): Promise<boolean> {
    try {
      const token = process.env.GREENWEB_TOKEN

      if (!token) {
        console.error('GreenWeb token not configured')
        return false
      }

      const response = await fetch('https://api.greenweb.com.bd/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: token,
          to: phone,
          message: message,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('GreenWeb SMS error:', error)
      return false
    }
  }
}

// SMS Service Manager
export class SMSService {
  private providers: SMSProvider[] = []

  constructor() {
    // Initialize providers based on environment variables
    if (process.env.TWILIO_ACCOUNT_SID) {
      this.providers.push(new TwilioProvider())
    }
    if (process.env.BULKSMS_USERNAME) {
      this.providers.push(new BulkSMSProvider())
    }
    if (process.env.GREENWEB_TOKEN) {
      this.providers.push(new GreenWebProvider())
    }
  }

  async sendOTP(phone: string, otpCode: string, type: string = 'registration'): Promise<boolean> {
    const message = this.generateOTPMessage(otpCode, type)

    // Try each provider until one succeeds
    for (const provider of this.providers) {
      try {
        console.log(`Attempting to send SMS via ${provider.name}`)
        const success = await provider.sendSMS(phone, message)
        if (success) {
          console.log(`SMS sent successfully via ${provider.name}`)
          return true
        }
      } catch (error) {
        console.error(`SMS failed via ${provider.name}:`, error)
        continue
      }
    }

    console.error('All SMS providers failed')
    return false
  }

  private generateOTPMessage(code: string, type: string): string {
    const typeText =
      type === 'registration'
        ? 'account registration'
        : type === 'login'
          ? 'login'
          : type === 'password_reset'
            ? 'password reset'
            : 'verification'

    return `Your Online Bazar ${typeText} code is: ${code}. This code will expire in 10 minutes. Do not share this code with anyone.`
  }

  isConfigured(): boolean {
    return this.providers.length > 0
  }

  getAvailableProviders(): string[] {
    return this.providers.map((p) => p.name)
  }
}

// Singleton instance
export const smsService = new SMSService()
