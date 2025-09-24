import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { otpConfig, getServiceStatus } from '@/lib/otp-config'

// GET - Get current OTP configuration and status
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = getServiceStatus()
    const config = otpConfig.getConfig()

    return NextResponse.json({
      success: true,
      config: config,
      status: status,
    })
  } catch (error) {
    console.error('Get OTP config error:', error)
    return NextResponse.json({ error: 'Failed to get configuration' }, { status: 500 })
  }
}

// POST - Update OTP configuration
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, config: newConfig, identifier } = body

    switch (action) {
      case 'toggle_otp':
        otpConfig.toggleOTP(newConfig.enabled)
        break

      case 'toggle_sms':
        otpConfig.toggleSMS(newConfig.useSMS)
        break

      case 'toggle_email':
        otpConfig.toggleEmail(newConfig.useEmail)
        break

      case 'toggle_fallback':
        otpConfig.toggleFallback(newConfig.fallbackToDefaultEmail)
        break

      case 'update_config':
        otpConfig.updateConfig(newConfig)
        break

      case 'reset_limits':
        if (identifier) {
          otpConfig.resetLimits(identifier)
        }
        break

      case 'manual_enable':
        otpConfig.manualEnableService()
        break

      case 'manual_disable':
        otpConfig.manualDisableService()
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedConfig = otpConfig.getConfig()
    const status = getServiceStatus()

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      config: updatedConfig,
      status: status,
    })
  } catch (error) {
    console.error('Update OTP config error:', error)
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 })
  }
}
