'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Settings, ToggleLeft, ToggleRight, RefreshCw, AlertTriangle } from 'lucide-react'

interface OTPConfig {
  enabled: boolean
  useSMS: boolean
  useEmail: boolean
  fallbackToDefaultEmail: boolean
  maxDailyOTPs: number
  maxHourlyOTPs: number
  cooldownMinutes: number
  autoDisableOnLimit: boolean
  autoEnableNextDay: boolean
}

interface ServiceStatus {
  otpEnabled: boolean
  smsEnabled: boolean
  emailEnabled: boolean
  fallbackEnabled: boolean
  limits: {
    daily: number
    hourly: number
    cooldown: number
  }
}

export function OTPConfigPanel() {
  const [config, setConfig] = useState<OTPConfig | null>(null)
  const [status, setStatus] = useState<ServiceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/otp-config')
      const data = await response.json()

      if (response.ok) {
        setConfig(data.config)
        setStatus(data.status)
      } else {
        setError(data.error || 'Failed to load configuration')
      }
    } catch (error) {
      console.error('Load config error:', error)
      setError('Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (
    action: string,
    newConfig?: Partial<OTPConfig>,
    identifier?: string,
  ) => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/admin/otp-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          config: newConfig,
          identifier,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setConfig(data.config)
        setStatus(data.status)
        setSuccess('Configuration updated successfully')
      } else {
        setError(data.error || 'Failed to update configuration')
      }
    } catch (error) {
      console.error('Update config error:', error)
      setError('Failed to update configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (field: keyof OTPConfig, value: boolean) => {
    if (!config) return

    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)

    let action = ''
    switch (field) {
      case 'enabled':
        action = 'toggle_otp'
        break
      case 'useSMS':
        action = 'toggle_sms'
        break
      case 'useEmail':
        action = 'toggle_email'
        break
      case 'fallbackToDefaultEmail':
        action = 'toggle_fallback'
        break
    }

    updateConfig(action, newConfig)
  }

  const handleLimitChange = (field: keyof OTPConfig, value: number) => {
    if (!config) return

    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    updateConfig('update_config', newConfig)
  }

  const resetLimits = (identifier: string) => {
    updateConfig('reset_limits', undefined, identifier)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading OTP configuration...</span>
        </CardContent>
      </Card>
    )
  }

  if (!config || !status) {
    return (
      <Card>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Failed to load OTP configuration</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            OTP Service Configuration
          </CardTitle>
          <CardDescription>Manage OTP service settings and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Service Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>OTP Service</Label>
              <div className="flex items-center gap-2">
                <Badge variant={status.otpEnabled ? 'default' : 'secondary'}>
                  {status.otpEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fallback Email</Label>
              <div className="flex items-center gap-2">
                <Badge variant={status.fallbackEnabled ? 'default' : 'secondary'}>
                  {status.fallbackEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Toggle Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="otp-enabled">Enable OTP Service</Label>
                <p className="text-sm text-gray-500">Master switch for OTP functionality</p>
              </div>
              <Switch
                id="otp-enabled"
                checked={config.enabled}
                onCheckedChange={(checked) => handleToggle('enabled', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sms-enabled">SMS Service</Label>
                <p className="text-sm text-gray-500">Send OTP via SMS (requires paid service)</p>
              </div>
              <Switch
                id="sms-enabled"
                checked={config.useSMS}
                onCheckedChange={(checked) => handleToggle('useSMS', checked)}
                disabled={saving || !config.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-enabled">Email Service</Label>
                <p className="text-sm text-gray-500">Send OTP via dedicated email service</p>
              </div>
              <Switch
                id="email-enabled"
                checked={config.useEmail}
                onCheckedChange={(checked) => handleToggle('useEmail', checked)}
                disabled={saving || !config.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="fallback-enabled">Fallback to Default Email</Label>
                <p className="text-sm text-gray-500">Use Gmail when limits are reached</p>
              </div>
              <Switch
                id="fallback-enabled"
                checked={config.fallbackToDefaultEmail}
                onCheckedChange={(checked) => handleToggle('fallbackToDefaultEmail', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-disable">Auto Disable on Limit</Label>
                <p className="text-sm text-gray-500">
                  Automatically disable when daily limit reached
                </p>
              </div>
              <Switch
                id="auto-disable"
                checked={config.autoDisableOnLimit}
                onCheckedChange={(checked) => handleToggle('autoDisableOnLimit', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-enable">Auto Enable Next Day</Label>
                <p className="text-sm text-gray-500">Automatically enable service next day</p>
              </div>
              <Switch
                id="auto-enable"
                checked={config.autoEnableNextDay}
                onCheckedChange={(checked) => handleToggle('autoEnableNextDay', checked)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Limits Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rate Limits</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily-limit">Daily Limit</Label>
                <Input
                  id="daily-limit"
                  type="number"
                  value={config.maxDailyOTPs}
                  onChange={(e) =>
                    handleLimitChange('maxDailyOTPs', parseInt(e.target.value) || 50)
                  }
                  disabled={saving}
                  min="1"
                  max="1000"
                />
                <p className="text-xs text-gray-500">Max OTPs per day</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourly-limit">Hourly Limit</Label>
                <Input
                  id="hourly-limit"
                  type="number"
                  value={config.maxHourlyOTPs}
                  onChange={(e) =>
                    handleLimitChange('maxHourlyOTPs', parseInt(e.target.value) || 10)
                  }
                  disabled={saving}
                  min="1"
                  max="100"
                />
                <p className="text-xs text-gray-500">Max OTPs per hour</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooldown">Cooldown (minutes)</Label>
                <Input
                  id="cooldown"
                  type="number"
                  value={config.cooldownMinutes}
                  onChange={(e) =>
                    handleLimitChange('cooldownMinutes', parseInt(e.target.value) || 5)
                  }
                  disabled={saving}
                  min="1"
                  max="60"
                />
                <p className="text-xs text-gray-500">Wait time between requests</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={loadConfig} variant="outline" disabled={saving}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => updateConfig('manual_enable')}
              variant="default"
              disabled={saving}
            >
              <ToggleRight className="h-4 w-4 mr-2" />
              Enable Service
            </Button>
            <Button
              onClick={() => updateConfig('manual_disable')}
              variant="destructive"
              disabled={saving}
            >
              <ToggleLeft className="h-4 w-4 mr-2" />
              Disable Service
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
          <CardDescription>Current service status and capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>SMS Service:</strong> {status.smsEnabled ? 'Available' : 'Not configured'}
            </div>
            <div>
              <strong>Email Service:</strong> {status.emailEnabled ? 'Available' : 'Not configured'}
            </div>
            <div>
              <strong>Daily Limit:</strong> {status.limits.daily} OTPs
            </div>
            <div>
              <strong>Hourly Limit:</strong> {status.limits.hourly} OTPs
            </div>
            <div>
              <strong>Cooldown:</strong> {status.limits.cooldown} minutes
            </div>
            <div>
              <strong>Fallback:</strong> {status.fallbackEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
