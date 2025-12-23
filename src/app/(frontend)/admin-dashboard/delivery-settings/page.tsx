'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Truck, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { DEFAULT_DELIVERY_SETTINGS, type DeliverySettings } from '@/lib/delivery-settings'

export default function DeliverySettingsPage() {
  const [settings, setSettings] = useState<DeliverySettings & { id?: number }>(
    DEFAULT_DELIVERY_SETTINGS,
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/delivery-settings')
      if (res.ok) {
        const data = await res.json()
        if (data.docs && data.docs.length > 0) {
          setSettings(data.docs[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch delivery settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const method = settings.id ? 'PATCH' : 'POST'
      const url = settings.id ? `/api/delivery-settings/${settings.id}` : '/api/delivery-settings'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(data.doc || data)
        setMessage({ type: 'success', text: 'Delivery settings saved successfully!' })
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.message || 'Failed to save settings' })
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Truck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Settings</h1>
          <p className="text-gray-500">Configure delivery charges and thresholds</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
        {/* Delivery Charges Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Charges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inside Dhaka (BDT)
              </label>
              <Input
                type="number"
                min={0}
                value={settings.insideDhakaCharge}
                onChange={(e) =>
                  setSettings({ ...settings, insideDhakaCharge: Number(e.target.value) })
                }
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outside Dhaka (BDT)
              </label>
              <Input
                type="number"
                min={0}
                value={settings.outsideDhakaCharge}
                onChange={(e) =>
                  setSettings({ ...settings, outsideDhakaCharge: Number(e.target.value) })
                }
                className="h-12"
              />
            </div>
          </div>
        </div>

        {/* Free Delivery Section */}
        <div className="pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Free Delivery Threshold</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum order amount for free delivery (BDT)
            </label>
            <Input
              type="number"
              min={0}
              value={settings.freeDeliveryThreshold}
              onChange={(e) =>
                setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })
              }
              className="h-12 max-w-md"
            />
            <p className="text-sm text-gray-500 mt-2">
              Orders equal to or above this amount receive free delivery.
            </p>
          </div>
        </div>

        {/* Digital Payment Section */}
        <div className="pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Digital Payment Discount</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery charge for digital payments (BDT)
            </label>
            <Input
              type="number"
              min={0}
              value={settings.digitalPaymentDeliveryCharge}
              onChange={(e) =>
                setSettings({ ...settings, digitalPaymentDeliveryCharge: Number(e.target.value) })
              }
              className="h-12 max-w-md"
            />
            <p className="text-sm text-gray-500 mt-2">
              A reduced delivery charge applied when paying via digital wallets.
            </p>
          </div>
        </div>

        {/* Display Text Section */}
        <div className="pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Text</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Highlight Title
              </label>
              <Input
                type="text"
                value={settings.shippingHighlightTitle}
                onChange={(e) =>
                  setSettings({ ...settings, shippingHighlightTitle: e.target.value })
                }
                className="h-12"
                placeholder="e.g., Free shipping on orders over 2000 taka"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Highlight Subtitle
              </label>
              <Input
                type="text"
                value={settings.shippingHighlightSubtitle}
                onChange={(e) =>
                  setSettings({ ...settings, shippingHighlightSubtitle: e.target.value })
                }
                className="h-12"
                placeholder="e.g., Digital wallet payments have a flat Tk 20 delivery charge."
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-100">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto h-12 px-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="mt-8 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
        <div className="bg-white rounded-xl p-4 border border-violet-200">
          <p className="font-medium text-violet-700">{settings.shippingHighlightTitle}</p>
          <p className="text-sm text-gray-600 mt-1">{settings.shippingHighlightSubtitle}</p>
        </div>
      </div>
    </div>
  )
}
