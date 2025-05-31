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

export const sendPremiumInvoiceEmail = async (orderData: OrderData) => {
  try {
    // Generate invoice number
    const invoiceNumber = `RM${Date.now()}`

    // Log the email that would be sent (no actual email sending)
    console.log("Email would be sent with the following data:", {
      to: orderData.customerEmail,
      subject: `Invoice ${invoiceNumber} - Racing Master Store`,
      customerName: orderData.customerName,
      product: orderData.product,
      price: orderData.price,
      uid: orderData.uid,
      transactionId: orderData.transactionId,
      orderDate: orderData.orderDate,
    })

    // For now, just log the email content and return success
    // This can be replaced with your preferred email service later
    console.log(`
      Dear ${orderData.customerName},
      
      Thank you for your purchase! Here are your order details:
      
      Invoice: ${invoiceNumber}
      Product: ${orderData.product}
      Amount: ৳${orderData.price.toLocaleString()}
      Player UID: ${orderData.uid}
      Transaction ID: ${orderData.transactionId}
      Order Date: ${orderData.orderDate}
      
      Your order has been received and is being processed. You will receive your items within 24 hours.
      
      Thank you for choosing Racing Master Store!
      
      Best regards,
      Racing Master Store Team
      Email: xrupture.tw@gmail.com
      Phone: +880 1818618349
    `)

    // Admin notification
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
      message: "Order processed successfully. Email functionality is disabled.",
      invoiceNumber: invoiceNumber,
    }
  } catch (error) {
    console.error("Email service error:", error)

    // Return success anyway so order processing continues
    return {
      success: true,
      message: "Order saved successfully. Email service is disabled.",
      invoiceNumber: `RM${Date.now()}`,
    }
  }
}

export const sendInvoiceNotificationEmail = async (orderData: OrderData) => {
  // Use the same function as fallback
  return sendPremiumInvoiceEmail(orderData)
}
