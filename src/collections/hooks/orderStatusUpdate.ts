import type { CollectionAfterChangeHook } from 'payload'

const orderStatusUpdate: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  // Only process updates, not creates
  if (operation !== 'update') return doc

  const payload = req?.payload
  if (!payload) return doc

  // Check if status has changed
  const previousStatus = (previousDoc as any)?.status
  const currentStatus = (doc as any)?.status

  if (!previousStatus || !currentStatus || previousStatus === currentStatus) {
    return doc
  }

  try {
    const serverURL = (payload?.config as any)?.serverURL || process.env.NEXT_PUBLIC_SERVER_URL || ''
    const companyName = process.env.EMAIL_DEFAULT_FROM_NAME || 'Online Bazar'
    
    const orderId = (doc as any).id
    const customerName = String((doc as any).customerName || '')
    const customerEmail = String((doc as any).customerEmail || '')

    // Status messages in Bangla
    const statusMessages = {
      pending: {
        subject: `অর্ডার #${orderId} এর স্ট্যাটাস: অপেক্ষমান`,
        message: 'আপনার অর্ডারটি আমাদের কাছে রয়েছে এবং আমরা এটি প্রস্তুত করার প্রক্রিয়ায় আছি।',
        icon: '⏳'
      },
      processing: {
        subject: `অর্ডার #${orderId} এর স্ট্যাটাস: প্রক্রিয়াধীন`,
        message: 'আপনার অর্ডারটি এখন প্রক্রিয়াধীন রয়েছে। আমরা আপনার পণ্যগুলো প্রস্তুত করছি।',
        icon: '🔄'
      },
      shipped: {
        subject: `অর্ডার #${orderId} এর স্ট্যাটাস: শিপ করা হয়েছে`,
        message: 'দুর্দান্ত খবর! আপনার অর্ডারটি শিপ করা হয়েছে এবং শীঘ্রই আপনার কাছে পৌঁছাবে।',
        icon: '📦'
      },
      completed: {
        subject: `অর্ডার #${orderId} সম্পন্ন হয়েছে`,
        message: 'আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! আমাদের সাথে শপিং করার জন্য ধন্যবাদ।',
        icon: '✅'
      },
      cancelled: {
        subject: `অর্ডার #${orderId} বাতিল করা হয়েছে`,
        message: 'দুঃখিত, আপনার অর্ডারটি বাতিল করা হয়েছে। কোনো সমস্যার জন্য আমাদের সাথে যোগাযোগ করুন।',
        icon: '❌'
      },
      refunded: {
        subject: `অর্ডার #${orderId} এর টাকা ফেরত দেওয়া হয়েছে`,
        message: 'আপনার অর্ডারের টাকা ফেরত প্রক্রিয়া সম্পন্ন হয়েছে। ৩-৫ কার্যদিবসের মধ্যে আপনার অ্যাকাউন্টে টাকা ফেরত পাবেন।',
        icon: '💰'
      }
    }

    const statusInfo = statusMessages[currentStatus as keyof typeof statusMessages]
    if (!statusInfo) return doc

    const orderDate = (doc as any).orderDate ? new Date((doc as any).orderDate) : new Date()
    const orderDateStr = orderDate.toISOString().slice(0, 10)
    const year = new Date().getFullYear()

    // Get order items for email
    const items: any[] = Array.isArray((doc as any).items) ? ((doc as any).items as any[]) : []
    const detailed: { name: string; quantity: number; price?: number }[] = []
    
    for (const it of items) {
      let name = 'Item'
      let price: number | undefined
      let snackId: string | undefined

      const rel = (it as any)?.item
      if (rel && typeof rel === 'object') {
        if (typeof (rel as any).name === 'string') name = (rel as any).name
        if (typeof (rel as any).price === 'number') price = Number((rel as any).price)
        if (typeof (rel as any).id === 'string' || typeof (rel as any).id === 'number') {
          snackId = String((rel as any).id)
        }
      } else if (rel != null && (typeof rel === 'string' || typeof rel === 'number')) {
        snackId = String(rel)
      }

      if ((!name || name === 'Item' || typeof price !== 'number') && snackId) {
        try {
          const itemDoc = await payload?.findByID({ collection: 'items', id: snackId })
          if (itemDoc) {
            if ((itemDoc as any).name && (!name || name === 'Item')) name = (itemDoc as any).name
            if (typeof (itemDoc as any).price === 'number' && typeof price !== 'number') {
              price = Number((itemDoc as any).price)
            }
          }
        } catch {}
      }

      detailed.push({ name: name || 'Item', quantity: Number((it as any)?.quantity ?? 1), price })
    }

    const total = Number((doc as any).totalAmount || 0)
    const fmt = (n: number) => `৳${n.toFixed(2)}`

    const rowsHTML = detailed
      .map((d) => `<tr><td style="padding:6px 8px;border:1px solid #e5e7eb;">${d.name}</td><td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center;">${d.quantity}</td><td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;">${typeof d.price === 'number' ? fmt(d.price) : '-'}</td></tr>`) 
      .join('')

    // Status-specific styling
    const statusColors = {
      pending: '#f59e0b',
      processing: '#3b82f6', 
      shipped: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444',
      refunded: '#6b7280'
    }

    const statusColor = statusColors[currentStatus as keyof typeof statusColors] || '#6b7280'

    const bodyHTML = `
      <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;max-width:600px;margin:0 auto;">
        <div style="background:${statusColor};color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="margin:0;font-size:24px;">${statusInfo.icon} অর্ডার স্ট্যাটাস আপডেট</h1>
        </div>
        
        <div style="padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <p>হ্যালো ${customerName || 'গ্রাহক'},</p>
          <p>${statusInfo.message}</p>
          
          <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0;"><strong>অর্ডার আইডি:</strong> #${orderId}</p>
            <p style="margin:8px 0 0 0;"><strong>নতুন স্ট্যাটাস:</strong> <span style="color:${statusColor};font-weight:bold;">${statusInfo.icon} ${statusInfo.subject.split(': ')[1]}</span></p>
            <p style="margin:8px 0 0 0;"><strong>অর্ডারের তারিখ:</strong> ${orderDateStr}</p>
          </div>

          <h3 style="margin:20px 0 10px 0;color:#374151;">অর্ডারের বিবরণ</h3>
          <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;width:100%;">
            <thead>
              <tr style="background:#f9fafb;">
                <th align="left" style="padding:12px 8px;border:1px solid #e5e7eb;font-weight:600;">পণ্য</th>
                <th align="center" style="padding:12px 8px;border:1px solid #e5e7eb;font-weight:600;">পরিমাণ</th>
                <th align="right" style="padding:12px 8px;border:1px solid #e5e7eb;font-weight:600;">মূল্য</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>

          <p style="margin-top:16px;text-align:right;font-size:18px;"><strong>মোট মূল্য: ${fmt(total)}</strong></p>

          ${serverURL ? `<div style="text-align:center;margin:24px 0;"><a href="${serverURL}" target="_blank" style="background:${statusColor};color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">অর্ডার হিস্টোরি দেখুন</a></div>` : ''}

          <p style="margin-top:20px;">আমাদের সাথে শপিং করার জন্য আপনাকে ধন্যবাদ!</p>
          <p style="margin:16px 0 0 0;">শুভেচ্ছান্তে,<br/><strong>${companyName} টিম</strong></p>
        </div>

        <div style="text-align:center;padding:16px;color:#6b7280;font-size:12px;">
          © ${year} ${companyName}. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    `

    const bodyText = [
      `হ্যালো ${customerName || 'গ্রাহক'},`,
      '',
      statusInfo.message,
      '',
      `অর্ডার আইডি: #${orderId}`,
      `নতুন স্ট্যাটাস: ${statusInfo.subject.split(': ')[1]}`,
      `অর্ডারের তারিখ: ${orderDateStr}`,
      '',
      'অর্ডারের বিবরণ:',
      ...detailed.map((d) => `- ${d.name} x ${d.quantity} ${typeof d.price === 'number' ? `(${fmt(d.price)})` : ''}`),
      '',
      `মোট মূল্য: ${fmt(total)}`,
      '',
      serverURL ? `অর্ডার হিস্টোরি: ${serverURL}` : '',
      '',
      `শুভেচ্ছান্তে,\n${companyName} টিম`,
      `© ${year} ${companyName}. সর্বস্বত্ব সংরক্ষিত।`,
    ].filter(Boolean).join('\n')

    // Send status update email to customer
    if (customerEmail) {
      await payload?.sendEmail?.({
        to: customerEmail,
        subject: statusInfo.subject,
        text: bodyText,
        html: bodyHTML,
      })

      req?.payload?.logger?.info?.(`Order status update email sent to ${customerEmail} for order #${orderId}: ${previousStatus} -> ${currentStatus}`)
    }

    // Send admin notification
    const adminEmail = process.env.ORDER_NOTIFICATIONS_EMAIL || process.env.GMAIL_USER
    if (adminEmail) {
      const adminHTML = `
        <div style="font-family:Arial,sans-serif;">
          <h3>Order Status Updated</h3>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Customer:</strong> ${customerName} &lt;${customerEmail}&gt;</p>
          <p><strong>Status Change:</strong> <span style="color:#6b7280;">${previousStatus}</span> → <span style="color:${statusColor};font-weight:bold;">${currentStatus}</span></p>
          <p><strong>Total:</strong> ৳${total.toFixed(2)}</p>
          ${serverURL ? `<p><a href="${serverURL}/admin/collections/orders/${orderId}">View in Admin</a></p>` : ''}
        </div>
      `

      await payload?.sendEmail?.({
        to: adminEmail,
        subject: `Order #${orderId} Status: ${previousStatus} → ${currentStatus}`,
        html: adminHTML,
      })
    }

  } catch (error) {
    req?.payload?.logger?.error?.('Order status update notification failed', error as any)
  }

  return doc
}

export default orderStatusUpdate