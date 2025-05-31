import { Resend } from "resend"

interface OrderData {
  customerName: string
  customerEmail: string
  customerPhone: string
  uid: string
  product: string
  price: number
  transactionId: string
  orderDate: string
}

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY || "")

export const sendPremiumInvoiceEmail = async (orderData: OrderData) => {
  try {
    // Generate invoice number
    const invoiceNumber = `RM${Date.now()}`

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email functionality is disabled.")
      return {
        success: true,
        message: "Order processed successfully. Email functionality is disabled.",
        invoiceNumber: invoiceNumber,
      }
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Racing Master Store <orders@rmstore.dev>",
      to: [orderData.customerEmail],
      subject: `Invoice ${invoiceNumber} - Racing Master Store`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">Racing Master Store</h1>
            <p style="margin: 5px 0 0;">Order Confirmation</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Dear ${orderData.customerName},</p>
            
            <p>Thank you for your purchase! Here are your order details:</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Invoice:</strong> ${invoiceNumber}</p>
              <p style="margin: 5px 0;"><strong>Product:</strong> ${orderData.product}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ৳${orderData.price.toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Player UID:</strong> ${orderData.uid}</p>
              <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${orderData.transactionId}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleString()}</p>
            </div>
            
            <p>Your order has been received and is being processed. You will receive your items within 24 hours.</p>
            
            <p style="margin-top: 30px;">Thank you for choosing Racing Master Store!</p>
            
            <p>Best regards,<br>Racing Master Store Team<br>Email: xrupture.tw@gmail.com<br>Phone: +880 1818618349</p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>&copy; 2024 Racing Master Store. All rights reserved.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("Resend API error:", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    // Admin notification (console log only)
    console.log(`
      Admin notification:
      
      🔔 New Order Received
      
      Invoice: ${invoiceNumber}
      Customer: ${orderData.customerName}
      Email: ${orderData.customerEmail}
      Phone: ${orderData.customerPhone}
      UID: ${orderData.uid}
      Product: ${orderData.product}
      Amount: ৳${orderData.price.toLocaleString()}
      Transaction ID: ${orderData.transactionId}
      Order Date: ${orderData.orderDate}
    `)

    return {
      success: true,
      message: "Order processed and email sent successfully.",
      invoiceNumber: invoiceNumber,
    }
  } catch (error) {
    console.error("Email service error:", error)

    // Return success anyway so order processing continues
    return {
      success: true,
      message: "Order saved successfully. Email service encountered an error.",
      invoiceNumber: `RM${Date.now()}`,
    }
  }
}

export const sendInvoiceNotificationEmail = async (orderData: OrderData) => {
  // Use the same function as fallback
  return sendPremiumInvoiceEmail(orderData)
}
