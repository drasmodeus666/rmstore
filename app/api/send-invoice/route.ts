import { NextResponse } from "next/server"
import { sendPremiumInvoiceEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.customerName || !data.customerEmail || !data.product || !data.price || !data.uid) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Format the order data
    const orderData = {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || "",
      uid: data.uid,
      product: data.product,
      price: data.price,
      transactionId: data.transactionId || `TX${Date.now()}`,
      orderDate: new Date().toISOString(),
    }

    // Send email
    const result = await sendPremiumInvoiceEmail(orderData)

    return NextResponse.json({
      success: true,
      message: "Invoice sent successfully",
      invoiceNumber: result.invoiceNumber,
    })
  } catch (error) {
    console.error("Error sending invoice:", error)
    return NextResponse.json({ success: false, message: "Failed to send invoice" }, { status: 500 })
  }
}
