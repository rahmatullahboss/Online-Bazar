'use client'

import React, { useState } from 'react'

const SendRemindersButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const sendReminders = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/abandoned-carts/send-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult({ success: true, message: data.message || 'Reminders sent successfully!' })
      } else {
        setResult({ success: false, error: data.error || 'Failed to send reminders' })
      }
    } catch (error) {
      setResult({ success: false, error: 'Network error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <button
        onClick={sendReminders}
        disabled={loading}
        style={{
          padding: '10px 20px',
          borderRadius: '6px',
          border: '1px solid #dc2626',
          background: loading ? '#fee2e2' : '#dc2626',
          color: loading ? '#991b1b' : '#ffffff',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid #991b1b',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Sending Reminders...
          </>
        ) : (
          'Send Abandoned Cart Reminders'
        )}
      </button>
      
      {result && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '6px',
            background: result.success ? '#d1fae5' : '#fee2e2',
            border: `1px solid ${result.success ? '#10b981' : '#ef4444'}`,
            color: result.success ? '#065f46' : '#b91c1c',
          }}
        >
          {result.message || result.error}
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default SendRemindersButton