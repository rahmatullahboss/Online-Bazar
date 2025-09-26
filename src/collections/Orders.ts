import type { CollectionConfig } from 'payload'
import { admins, adminsOnly, adminsOrOwner, authenticated } from './access'
import orderStatusUpdate from './hooks/orderStatusUpdate'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: [
      'id',
      'customerName',
      'customerEmail',
      'status',
      'orderDate',
      'customerNumber',
      'deliveryZone',
      'shippingCharge',
      'shippingAddress.city',
      'shippingAddress.line1',
    ],
  },
  access: {
    read: adminsOrOwner('user'), // Admins can read all orders, users can only read their own
    create: ({ req }) => true, // Allow guest checkout via API route
    update: admins, // Only admins can update orders
    delete: admins, // Only admins can delete orders
    admin: adminsOnly,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
    {
      name: 'coupon',
      type: 'relationship',
      relationTo: 'coupons' as any,
      required: false,
      admin: {
        description: 'Coupon applied to this order, if any',
      },
    },
    {
      name: 'discountAmount',
      type: 'number',
      required: false,
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Discount amount applied from coupon',
      },
    },
    // Client/device metadata for analytics
    {
      name: 'userAgent',
      type: 'text',
      required: false,
      admin: { description: 'Captured at order time' },
    },
    {
      name: 'deviceType',
      type: 'select',
      required: false,
      options: [
        { label: 'Mobile', value: 'mobile' },
        { label: 'Desktop', value: 'desktop' },
        { label: 'Tablet', value: 'tablet' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'customerName',
      type: 'text',
      label: 'Customer name',
      required: true,
      admin: {
        description: 'Name captured at time of order',
      },
    },
    {
      name: 'customerEmail',
      type: 'email',
      label: 'Customer email',
      required: true,
    },
    {
      name: 'customerNumber',
      type: 'text',
      label: 'Customer number',
      required: true,
      admin: {
        description: 'Customer contact number captured at time of order',
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Payment method',
      required: true,
      defaultValue: 'cod',
      options: [
        { label: 'Cash on Delivery', value: 'cod' },
        { label: 'bKash', value: 'bkash' },
        { label: 'Nagad', value: 'nagad' },
      ],
    },
    {
      name: 'paymentSenderNumber',
      type: 'text',
      label: 'Sender wallet number',
      required: false,
      admin: {
        description: 'Wallet number used to send the payment',
        condition: (data) => data?.paymentMethod === 'bkash' || data?.paymentMethod === 'nagad',
      },
      validate: (
        value: unknown,
        { siblingData }: { siblingData?: { paymentMethod?: 'cod' | 'bkash' | 'nagad' } },
      ) => {
        if (siblingData?.paymentMethod === 'bkash' || siblingData?.paymentMethod === 'nagad') {
          return typeof value === 'string' && value.trim().length > 0
            ? true
            : 'Sender wallet number is required for digital payments'
        }
        return true
      },
    },
    {
      name: 'paymentTransactionId',
      type: 'text',
      label: 'Transaction ID',
      required: false,
      admin: {
        description: 'Reference ID from the mobile wallet payment',
        condition: (data) => data?.paymentMethod === 'bkash' || data?.paymentMethod === 'nagad',
      },
      validate: (
        value: unknown,
        { siblingData }: { siblingData?: { paymentMethod?: 'cod' | 'bkash' | 'nagad' } },
      ) => {
        if (siblingData?.paymentMethod === 'bkash' || siblingData?.paymentMethod === 'nagad') {
          return typeof value === 'string' && value.trim().length > 0
            ? true
            : 'Transaction ID is required for digital payments'
        }
        return true
      },
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'item',
          type: 'relationship',
          relationTo: 'items',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
      ],
      required: true,
      minRows: 1,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: '⏳ Pending', value: 'pending' },
        { label: '🔄 Processing', value: 'processing' },
        { label: '📦 Shipped', value: 'shipped' },
        { label: '✅ Completed', value: 'completed' },
        { label: '❌ Cancelled', value: 'cancelled' },
        { label: '🔄 Refunded', value: 'refunded' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: {
        description: 'Current status of the order - updates customer via email notifications',
        components: {
          Field: '@/components/admin/OrderStatusSelect',
          Cell: '@/components/admin/OrderStatusDropdown',
        },
      },
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'subtotal',
      label: 'Subtotal',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'shippingCharge',
      label: 'Delivery charge',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'deliveryZone',
      type: 'select',
      required: true,
      defaultValue: 'inside_dhaka',
      options: [
        { label: 'Inside Dhaka', value: 'inside_dhaka' },
        { label: 'Outside Dhaka', value: 'outside_dhaka' },
      ],
    },
    {
      name: 'freeDeliveryApplied',
      type: 'checkbox',
      defaultValue: false,
      label: 'Free delivery applied',
    },
    {
      name: 'orderDate',
      type: 'date',
      defaultValue: () => new Date(),
      required: true,
    },
    {
      name: 'shippingAddress',
      type: 'group',
      admin: {
        description: 'Shipping address captured at time of order',
      },
      fields: [
        {
          name: 'line1',
          type: 'text',
          label: 'Address line 1',
          required: true,
        },
        {
          name: 'line2',
          type: 'text',
          label: 'Address line 2',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'state',
          type: 'text',
        },
        {
          name: 'postalCode',
          type: 'text',
          label: 'Postal code',
          required: true,
        },
        {
          name: 'country',
          type: 'text',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      orderStatusUpdate,
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc

        try {
          const payload = req?.payload
          const serverURL =
            (payload?.config as any)?.serverURL || process.env.NEXT_PUBLIC_SERVER_URL || ''

          const items: any[] = Array.isArray((doc as any).items)
            ? ((doc as any).items as any[])
            : []
          const detailed: { name: string; quantity: number; price?: number }[] = []
          for (const it of items) {
            let name = 'Item'
            let price: number | undefined
            let snackId: string | undefined

            const rel = (it as any)?.item
            if (rel && typeof rel === 'object') {
              // If populated relationship
              if (typeof (rel as any).name === 'string') name = (rel as any).name
              if (typeof (rel as any).price === 'number') price = Number((rel as any).price)
              if (typeof (rel as any).id === 'string' || typeof (rel as any).id === 'number') {
                snackId = String((rel as any).id)
              } else if (
                typeof (rel as any).value === 'string' ||
                typeof (rel as any).value === 'number'
              ) {
                snackId = String((rel as any).value)
              }
            } else if (rel != null && (typeof rel === 'string' || typeof rel === 'number')) {
              // If stored as an ID
              snackId = String(rel)
            }

            // Fetch snack if needed to fill missing fields
            if ((!name || name === 'Item' || typeof price !== 'number') && snackId) {
              try {
                const itemDoc = await payload?.findByID({ collection: 'items', id: snackId })
                if (itemDoc) {
                  if ((itemDoc as any).name && (!name || name === 'Item'))
                    name = (itemDoc as any).name
                  if (typeof (itemDoc as any).price === 'number' && typeof price !== 'number') {
                    price = Number((itemDoc as any).price)
                  }
                }
              } catch {}
            }

            detailed.push({
              name: name || 'Item',
              quantity: Number((it as any)?.quantity ?? 1),
              price,
            })
          }

          const orderId = (doc as any).id
          const total = Number((doc as any).totalAmount || 0)
          const customerName = String((doc as any).customerName || '')
          const customerEmail = String((doc as any).customerEmail || '')
          const paymentMethodRaw = String((doc as any).paymentMethod || 'cod')
          const paymentSenderNumber = String((doc as any).paymentSenderNumber || '')
          const paymentTransactionId = String((doc as any).paymentTransactionId || '')
          const formatPaymentLabel = (method: string) => {
            switch (method) {
              case 'bkash':
                return 'bKash'
              case 'nagad':
                return 'Nagad'
              case 'cod':
              default:
                return 'Cash on Delivery'
            }
          }
          const paymentLabel = formatPaymentLabel(paymentMethodRaw)
          const orderAdminURL = serverURL ? `${serverURL}/admin/collections/orders/${orderId}` : ''
          const companyName = process.env.EMAIL_DEFAULT_FROM_NAME || 'Online Bazar'

          const orderDate = (doc as any).orderDate ? new Date((doc as any).orderDate) : new Date()
          const orderDateStr = orderDate.toISOString().slice(0, 10)
          const year = new Date().getFullYear()
          const fmt = (n: number) => `৳${n.toFixed(2)}`

          // Build customer email (Bangla)
          const subjectCustomer = `আপনার অর্ডার #${orderId} কনফার্ম করা হয়েছে!`
          const rowsHTML = detailed
            .map(
              (d) =>
                `<tr><td style="padding:6px 8px;border:1px solid #e5e7eb;">${d.name}</td><td style=\"padding:6px 8px;border:1px solid #e5e7eb;text-align:center;\">${d.quantity}</td><td style=\"padding:6px 8px;border:1px solid #e5e7eb;text-align:right;\">${typeof d.price === 'number' ? fmt(d.price) : '-'}</td></tr>`,
            )
            .join('')
          const rowsText = detailed
            .map(
              (d) =>
                `${d.name}\t${d.quantity}\t${typeof d.price === 'number' ? d.price.toFixed(2) : '-'}`,
            )
            .join('\n')

          const address = (doc as any).shippingAddress || {}
          const addressLines = [
            String(address.line1 || '').trim(),
            String(address.line2 || '').trim(),
            [address.city, address.postalCode].filter(Boolean).join(', '),
            String(address.country || '').trim(),
          ].filter((l) => l && l.length > 0)

          const bodyHTML = `
            <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;">
              <p>হ্যালো ${customerName || 'গ্রাহক'},</p>
              <p>আপনার অর্ডারের জন্য ধন্যবাদ! আমরা আপনার অর্ডারটি পেয়েছি এবং এটি শিপমেন্টের জন্য প্রস্তুত করছি।</p>
              <p><strong>অর্ডার আইডি:</strong> #${orderId}<br/>
              <strong>অর্ডারের তারিখ:</strong> ${orderDateStr}</p>

              <h3 style="margin:16px 0 8px 0;">অর্ডারের বিবরণ</h3>
              <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;min-width:300px;">
                <thead>
                  <tr>
                    <th align="left" style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">পণ্য</th>
                    <th align="center" style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">পরিমাণ</th>
                    <th align="right" style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">মূল্য</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHTML}
                </tbody>
              </table>

              <p style="margin-top:12px;"><strong>মোট মূল্য:</strong> ${fmt(total)}</p>
              <p style="margin-top:12px;"><strong>পেমেন্ট:</strong> ${paymentLabel}${
                paymentSenderNumber ? ` (Sender: ${paymentSenderNumber})` : ''
              }${paymentTransactionId ? `, Txn: ${paymentTransactionId}` : ''}</p>

              <h3 style="margin:16px 0 8px 0;">যে ঠিকানায় পাঠানো হবে:</h3>
              <p>${addressLines.map((l: string) => l.replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('<br/>')}</p>

              <p style="margin-top:16px;">আমরা আপনার অর্ডারটি শিপিং করার পর আপনাকে আরেকটি ইমেলের মাধ্যমে জানিয়ে দেব।</p>
              ${serverURL ? `<p>আপনার অর্ডার হিস্টোরি দেখতে চাইলে আমাদের ওয়েবসাইটে লগইন করতে পারেন: <a href="${serverURL}" target="_blank" rel="noreferrer">${serverURL}</a></p>` : ''}

              <p>আমাদের সাথে শপিং করার জন্য আবারও ধন্যবাদ!</p>
              <p>শুভেচ্ছান্তে,<br/>${companyName} টিম</p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;"/>
              <p style="font-size:12px;color:#6b7280;">© ${year} ${companyName}. সর্বস্বত্ব সংরক্ষিত।</p>
            </div>
          `

          const bodyText = [
            `হ্যালো ${customerName || 'গ্রাহক'},`,
            '',
            'আপনার অর্ডারের জন্য ধন্যবাদ! আমরা আপনার অর্ডারটি পেয়েছি এবং এটি শিপমেন্টের জন্য প্রস্তুত করছি।',
            '',
            `অর্ডার আইডি: #${orderId}`,
            `অর্ডারের তারিখ: ${orderDateStr}`,
            '',
            'অর্ডারের বিবরণ',
            'পণ্য\tপরিমাণ\tমূল্য',
            rowsText,
            '',
            `মোট মূল্য: ${total.toFixed(2)}`,
            '',
            'যে ঠিকানায় পাঠানো হবে:',
            ...addressLines,
            '',
            'আমরা আপনার অর্ডারটি শিপিং করার পর আপনাকে আরেকটি ইমেলের মাধ্যমে জানিয়ে দেব।',
            serverURL ? `অর্ডার হিস্টোরি: ${serverURL}` : '',
            '',
            `শুভেচ্ছান্তে,\n${companyName} টিম`,
            `© ${year} ${companyName}. সর্বস্বত্ব সংরক্ষিত।`,
          ]
            .filter(Boolean)
            .join('\n')

          // Send to customer (Bangla template)
          if (customerEmail) {
            await payload?.sendEmail?.({
              to: customerEmail,
              subject: subjectCustomer,
              text: bodyText,
              html: bodyHTML,
            })
          }

          // Admin notification (keep English)
          const adminEmail = process.env.ORDER_NOTIFICATIONS_EMAIL || process.env.GMAIL_USER
          if (adminEmail) {
            const adminLines = detailed.map((d) => `- ${d.name} x ${d.quantity}`).join('\n')
            const adminText = [
              `New order #${orderId} from ${customerName} <${customerEmail}>`,
              '',
              'Order summary:',
              adminLines,
              '',
              `Total: ${total.toFixed(2)}`,
              `Payment: ${paymentLabel}`,
              paymentSenderNumber ? `Sender: ${paymentSenderNumber}` : '',
              paymentTransactionId ? `Txn: ${paymentTransactionId}` : '',
              orderAdminURL ? `\nAdmin link: ${orderAdminURL}` : '',
            ]
              .filter(Boolean)
              .join('\n')

            const adminHTML = `
            <div>
              <p><strong>New order #${orderId}</strong></p>
              <p>Customer: ${customerName} &lt;${customerEmail}&gt;</p>
              <p><strong>Order summary:</strong></p>
              <ul>
                ${detailed.map((d) => `<li>${d.name} x ${d.quantity}</li>`).join('')}
              </ul>
              <p><strong>Total:</strong> ${total.toFixed(2)}</p>
              <p><strong>Payment:</strong> ${paymentLabel}</p>
              ${paymentSenderNumber ? `<p><strong>Sender:</strong> ${paymentSenderNumber}</p>` : ''}
              ${paymentTransactionId ? `<p><strong>Transaction:</strong> ${paymentTransactionId}</p>` : ''}
              ${orderAdminURL ? `<p><a href="${orderAdminURL}">Open in Admin</a></p>` : ''}
            </div>
          `

            await payload?.sendEmail?.({
              to: adminEmail,
              subject: `New Order #${orderId} from ${customerName || 'Customer'}`,
              text: adminText,
              html: adminHTML,
            })
          }
        } catch (e) {
          req?.payload?.logger?.error?.('Order email hook failed', e as any)
        }

        return doc
      },
    ],
  },
}
