// Abandoned Cart Recovery Email Templates

export type AbandonedCartEmailData = {
  customerName: string
  customerEmail: string
  cartItems: Array<{
    name: string
    price: number
    quantity: number
    imageUrl?: string
  }>
  cartTotal: number
  discountCode?: string
  discountPercent?: number
  recoveryLink: string
  reminderStage: number // 1, 2, or 3
}

const REMINDER_SUBJECTS = [
  '🛒 আপনার কার্টে items waiting করছে!',
  '⏰ শেষ সুযোগ! আপনার cart expire হতে চলেছে',
  '🎁 Special Offer: ১০% Discount আপনার জন্য!',
]

const REMINDER_HEADERS = [
  'আপনি কি কিছু ভুলে গেছেন?',
  'আপনার Cart এখনও অপেক্ষা করছে!',
  'এই সুযোগ মিস করবেন না!',
]

export function getAbandonedCartEmailSubject(stage: number): string {
  return REMINDER_SUBJECTS[Math.min(stage - 1, 2)] || REMINDER_SUBJECTS[0]
}

export function generateAbandonedCartEmailHTML(data: AbandonedCartEmailData): string {
  const {
    customerName,
    cartItems,
    cartTotal,
    discountCode,
    discountPercent,
    recoveryLink,
    reminderStage,
  } = data

  const header = REMINDER_HEADERS[Math.min(reminderStage - 1, 2)] || REMINDER_HEADERS[0]
  const showDiscount = reminderStage >= 3 && discountCode && discountPercent

  const itemsHTML = cartItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />` : ''}
          <div>
            <p style="margin: 0; font-weight: 600; color: #1f2937;">${item.name}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">Qty: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #1f2937;">
        ৳${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `,
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Purchase</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px;">🛒 Online Bazar</h1>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      
      <!-- Greeting -->
      <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 22px;">${header}</h2>
      <p style="margin: 0 0 24px; color: #6b7280; line-height: 1.6;">
        হ্যালো ${customerName || 'Valued Customer'},<br><br>
        আপনি আমাদের store এ কিছু দুর্দান্ত items cart এ রেখেছিলেন। এগুলো এখনও আপনার জন্য অপেক্ষা করছে!
      </p>
      
      ${
        showDiscount
          ? `
      <!-- Discount Banner -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #92400e;">🎁 Special Offer Just For You!</p>
        <p style="margin: 0; font-size: 28px; font-weight: bold; color: #b45309;">${discountPercent}% OFF</p>
        <p style="margin: 8px 0 0; font-size: 14px; color: #92400e;">Use code: <strong>${discountCode}</strong></p>
      </div>
      `
          : ''
      }
      
      <!-- Cart Items -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 12px; text-align: left; font-size: 14px; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Item</th>
            <th style="padding: 12px; text-align: right; font-size: 14px; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 16px 12px; font-size: 18px; font-weight: bold; color: #1f2937;">Total</td>
            <td style="padding: 16px 12px; text-align: right; font-size: 18px; font-weight: bold; color: #f59e0b;">৳${cartTotal.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${recoveryLink}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; font-size: 18px; font-weight: 600; padding: 16px 48px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 12px rgba(245,158,11,0.4);">
          Complete My Order 🛍️
        </a>
      </div>
      
      <p style="margin: 24px 0 0; text-align: center; font-size: 14px; color: #9ca3af;">
        এই link টি ${reminderStage < 3 ? '48 hours' : '24 hours'} পর্যন্ত valid থাকবে।
      </p>
      
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0 0 8px;">© ${new Date().getFullYear()} Online Bazar. All rights reserved.</p>
      <p style="margin: 0;">
        আপনি এই email পেয়েছেন কারণ আপনার একটি pending cart আছে।<br>
        <a href="#" style="color: #f59e0b;">Unsubscribe</a>
      </p>
    </div>
    
  </div>
</body>
</html>
`
}

export function generateAbandonedCartEmailText(data: AbandonedCartEmailData): string {
  const {
    customerName,
    cartItems,
    cartTotal,
    discountCode,
    discountPercent,
    recoveryLink,
    reminderStage,
  } = data

  const header = REMINDER_HEADERS[Math.min(reminderStage - 1, 2)]
  const showDiscount = reminderStage >= 3 && discountCode && discountPercent

  let text = `${header}\n\n`
  text += `হ্যালো ${customerName || 'Valued Customer'},\n\n`
  text += `আপনি আমাদের store এ কিছু দুর্দান্ত items cart এ রেখেছিলেন। এগুলো এখনও আপনার জন্য অপেক্ষা করছে!\n\n`

  if (showDiscount) {
    text += `🎁 SPECIAL OFFER: ${discountPercent}% OFF - Use code: ${discountCode}\n\n`
  }

  text += `Your Cart:\n`
  text += `${'─'.repeat(40)}\n`

  for (const item of cartItems) {
    text += `${item.name} x${item.quantity} - ৳${(item.price * item.quantity).toLocaleString()}\n`
  }

  text += `${'─'.repeat(40)}\n`
  text += `Total: ৳${cartTotal.toLocaleString()}\n\n`
  text += `Complete your order: ${recoveryLink}\n\n`
  text += `© ${new Date().getFullYear()} Online Bazar`

  return text
}
