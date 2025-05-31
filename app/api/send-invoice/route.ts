import { type NextRequest, NextResponse } from "next/server"
import { sendPremiumInvoiceEmail, sendInvoiceNotificationEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Validate required environment variable
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY environment variable is not set")
      return NextResponse.json(
        {
          success: false,
          error: "Email service not configured",
          details: "RESEND_API_KEY is missing",
        },
        { status: 500 },
      )
    }

    // Try to send premium invoice with Resend
    let emailResult = await sendPremiumInvoiceEmail(orderData)

    // If email fails, send notification email
    if (!emailResult.success) {
      console.log("Primary email failed, sending notification email...")
      emailResult = await sendInvoiceNotificationEmail(orderData)
    }

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Invoice sent successfully via Resend",
        invoiceNumber: emailResult.invoiceNumber,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send invoice email",
          details: emailResult.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in send-invoice API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
