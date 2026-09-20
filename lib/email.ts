type OrderConfirmationParams = {
  toEmail: string
  customerName: string
  orderNumber: string
  items: Array<{
    product_name: string
    variant_name?: string | null
    color_name?: string | null
    quantity: number
    price_at_purchase: number
    line_total: number
  }>
  subtotal: number
  shippingCost: number
  totalAmount: number
  address: {
    full_name: string
    phone: string
    address_line_1: string
    city: string
    state: string
    postal_code: string
  } | null
}

export async function sendOrderConfirmationEmail(params: OrderConfirmationParams) {
  const brevoApiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@hijabistaa.com'
  const senderName = process.env.BREVO_SENDER_NAME || 'HIJABISTAA'

  if (!brevoApiKey) {
    console.log(`[DEV MODE] Order confirmation email skipped (no BREVO_API_KEY) for ${params.toEmail}, order ${params.orderNumber}`)
    return { success: false, error: 'Email API key not configured' }
  }

  const itemsRows = params.items.map((item) => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #E6DAC4; text-align: left; color: #211D19; font-size: 13px;">
        ${item.product_name}${item.variant_name && item.variant_name !== 'Default' ? ` (${item.variant_name})` : ''}${item.color_name ? ` &middot; ${item.color_name}` : ''}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #E6DAC4; text-align: center; color: #211D19; font-size: 13px;">${item.quantity}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #E6DAC4; text-align: right; color: #211D19; font-size: 13px; font-weight: 600;">₹${item.line_total}</td>
    </tr>
  `).join('')

  const addressBlock = params.address
    ? `
      <p style="margin: 0; color: #211D19; font-size: 13px; font-weight: 600;">${params.address.full_name} &middot; ${params.address.phone}</p>
      <p style="margin: 4px 0 0; color: #211D19; opacity: 0.75; font-size: 13px;">${params.address.address_line_1}</p>
      <p style="margin: 2px 0 0; color: #211D19; opacity: 0.75; font-size: 13px;">${params.address.city}, ${params.address.state} ${params.address.postal_code}</p>
    `
    : '<p style="margin: 0; color: #211D19; opacity: 0.6; font-size: 13px;">Address on file</p>'

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #E6DAC4; border-radius: 24px; background-color: #FBF7F0; box-shadow: 0 4px 20px rgba(33,29,25,0.025);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1E3B2E; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 0; font-family: Georgia, serif;">HIJABISTAA</h1>
        <p style="color: #B9893F; font-size: 12px; margin: 4px 0 0;">Where Modesty Meets Elegance</p>
      </div>

      <hr style="border: 0; border-top: 1px solid #E6DAC4; margin: 20px 0;" />

      <h2 style="color: #211D19; font-size: 19px; font-weight: bold; margin: 0 0 4px;">Thank you, ${params.customerName}!</h2>
      <p style="color: #211D19; opacity: 0.75; font-size: 13px; line-height: 1.6; margin: 0 0 20px;">
        Your order has been placed successfully and payment has been received. Here's your confirmation.
      </p>

      <div style="background-color: #F3EADC; border-radius: 14px; padding: 14px 18px; margin-bottom: 20px;">
        <span style="color: #211D19; opacity: 0.6; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</span>
        <p style="color: #1E3B2E; font-size: 16px; font-weight: bold; margin: 2px 0 0; font-family: monospace;">${params.orderNumber}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr>
            <th style="padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #211D19; opacity: 0.5; border-bottom: 2px solid #211D19;">Item</th>
            <th style="padding: 8px; text-align: center; font-size: 11px; text-transform: uppercase; color: #211D19; opacity: 0.5; border-bottom: 2px solid #211D19;">Qty</th>
            <th style="padding: 8px; text-align: right; font-size: 11px; text-transform: uppercase; color: #211D19; opacity: 0.5; border-bottom: 2px solid #211D19;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 13px; color: #211D19; margin-bottom: 20px;">
        <p style="margin: 4px 0; opacity: 0.7;">Subtotal: ₹${params.subtotal}</p>
        <p style="margin: 4px 0; opacity: 0.7;">Shipping: ${params.shippingCost === 0 ? 'FREE' : `₹${params.shippingCost}`}</p>
        <p style="margin: 8px 0 0; font-size: 16px; font-weight: bold; color: #1E3B2E;">Total Paid: ₹${params.totalAmount}</p>
      </div>

      <hr style="border: 0; border-top: 1px solid #E6DAC4; margin: 20px 0;" />

      <div>
        <span style="color: #211D19; opacity: 0.6; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</span>
        <div style="margin-top: 6px;">
          ${addressBlock}
        </div>
      </div>

      <hr style="border: 0; border-top: 1px solid #E6DAC4; margin: 20px 0;" />

      <p style="color: #B9893F; opacity: 0.7; font-size: 11px; margin: 0; text-align: center;">
        &copy; ${new Date().getFullYear()} HIJABISTAA. All rights reserved.
      </p>
    </div>
  `

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: params.toEmail, name: params.customerName }],
        subject: `Order Confirmed - #${params.orderNumber} | HIJABISTAA`,
        textContent: `Thank you for your order #${params.orderNumber}! Total paid: ₹${params.totalAmount}. We'll notify you once it ships.`,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Brevo order confirmation email error:', errText)
      return { success: false, error: 'Failed to send order confirmation email' }
    }

    return { success: true }
  } catch (e: any) {
    console.error('Order confirmation email send error:', e)
    return { success: false, error: e.message }
  }
}
