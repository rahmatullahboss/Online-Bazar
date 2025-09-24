// Email Service for OTP delivery
// Supports multiple email providers with fallback

interface EmailProvider {
  name: string
  sendEmail: (to: string, subject: string, html: string) => Promise<boolean>
}

// SendGrid Provider
class SendGridProvider implements EmailProvider {
  name = 'sendgrid'

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const apiKey = process.env.SENDGRID_API_KEY

      if (!apiKey) {
        console.error('SendGrid API key not configured')
        return false
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject: subject,
            },
          ],
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'noreply@onlinebazar.com',
            name: 'Online Bazar',
          },
          content: [
            {
              type: 'text/html',
              value: html,
            },
          ],
        }),
      })

      return response.ok
    } catch (error) {
      console.error('SendGrid error:', error)
      return false
    }
  }
}

// Mailgun Provider
class MailgunProvider implements EmailProvider {
  name = 'mailgun'

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const apiKey = process.env.MAILGUN_API_KEY
      const domain = process.env.MAILGUN_DOMAIN

      if (!apiKey || !domain) {
        console.error('Mailgun credentials not configured')
        return false
      }

      const formData = new FormData()
      formData.append(
        'from',
        `${process.env.MAILGUN_FROM_NAME || 'Online Bazar'} <${process.env.MAILGUN_FROM_EMAIL || `noreply@${domain}`}>`,
      )
      formData.append('to', to)
      formData.append('subject', subject)
      formData.append('html', html)

      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        },
        body: formData,
      })

      return response.ok
    } catch (error) {
      console.error('Mailgun error:', error)
      return false
    }
  }
}

// Resend Provider (Modern alternative)
class ResendProvider implements EmailProvider {
  name = 'resend'

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const apiKey = process.env.RESEND_API_KEY

      if (!apiKey) {
        console.error('Resend API key not configured')
        return false
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Online Bazar <noreply@onlinebazar.com>',
          to: [to],
          subject: subject,
          html: html,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Resend error:', error)
      return false
    }
  }
}

// Gmail Provider (Fallback)
class GmailProvider implements EmailProvider {
  name = 'gmail'

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // This would use the existing Gmail setup from payload config
      // We'll implement this as a fallback
      return false // Disabled by default to avoid hitting limits
    } catch (error) {
      console.error('Gmail error:', error)
      return false
    }
  }
}

export class EmailService {
  private providers: EmailProvider[] = []

  constructor() {
    // Initialize providers based on environment variables
    if (process.env.SENDGRID_API_KEY) {
      this.providers.push(new SendGridProvider())
    }
    if (process.env.MAILGUN_API_KEY) {
      this.providers.push(new MailgunProvider())
    }
    if (process.env.RESEND_API_KEY) {
      this.providers.push(new ResendProvider())
    }

    // Gmail as last resort (with rate limiting)
    this.providers.push(new GmailProvider())
  }

  async sendOTP(to: string, otpCode: string, type: string = 'registration'): Promise<boolean> {
    const { subject, html } = this.generateOTPEmail(otpCode, type)

    // Try each provider until one succeeds
    for (const provider of this.providers) {
      try {
        console.log(`Attempting to send email via ${provider.name}`)
        const success = await provider.sendEmail(to, subject, html)
        if (success) {
          console.log(`Email sent successfully via ${provider.name}`)
          return true
        }
      } catch (error) {
        console.error(`Email failed via ${provider.name}:`, error)
        continue
      }
    }

    console.error('All email providers failed')
    return false
  }

  private generateOTPEmail(code: string, type: string): { subject: string; html: string } {
    const typeText =
      type === 'registration'
        ? 'Account Registration'
        : type === 'login'
          ? 'Login Verification'
          : type === 'password_reset'
            ? 'Password Reset'
            : 'Email Verification'

    const subject = `Your OTP Code - ${typeText} | Online Bazar`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #F97316 0%, #F43F5E 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Online Bazar</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your OTP Verification Code</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 2px dashed #F97316; display: inline-block; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #F97316; letter-spacing: 5px;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
            This code will expire in <strong>10 minutes</strong>
          </p>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">Important Security Information</h3>
          <ul style="color: #856404; margin: 0; padding-left: 20px;">
            <li>Never share this code with anyone</li>
            <li>Our team will never ask for your OTP code</li>
            <li>If you didn't request this code, please ignore this email</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message from Online Bazar. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `

    return { subject, html }
  }

  isConfigured(): boolean {
    return this.providers.length > 1 // More than just Gmail fallback
  }

  getAvailableProviders(): string[] {
    return this.providers.map((p) => p.name)
  }
}

// Singleton instance
export const emailService = new EmailService()
