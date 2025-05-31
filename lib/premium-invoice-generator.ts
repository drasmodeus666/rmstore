import { jsPDF } from "jspdf"

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  uid: string
  items: Array<{
    item: string
    price: number
    quantity: number
  }>
  paymentMethod: string
  transactionId: string
}

export const generatePremiumInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Dark background
  doc.setFillColor(15, 23, 42) // slate-950
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  // Header with blue gradient
  doc.setFillColor(37, 99, 235) // blue-600
  doc.rect(0, 0, pageWidth, 60, "F")

  // Company branding
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  doc.text("🎮 RM STORE", 20, 30)

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Racing Master Premium Services", 20, 45)

  // Invoice title
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("INVOICE", pageWidth - 20, 30, { align: "right" })

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`#${data.invoiceNumber}`, pageWidth - 20, 45, { align: "right" })

  // Invoice details section
  doc.setFillColor(30, 41, 59) // slate-800
  doc.rect(20, 70, pageWidth - 40, 35, "F")
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(1)
  doc.rect(20, 70, pageWidth - 40, 35, "S")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Invoice Details", 25, 85)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(203, 213, 225)
  doc.text(`Date: ${data.date}`, 25, 95)
  doc.text(`Transaction ID: ${data.transactionId}`, 25, 102)
  doc.text(`Player UID: ${data.uid}`, 110, 95)
  doc.text(`Payment: ${data.paymentMethod}`, 110, 102)

  // Customer information
  doc.setFillColor(30, 41, 59)
  doc.rect(20, 115, pageWidth - 40, 30, "F")
  doc.setDrawColor(59, 130, 246)
  doc.rect(20, 115, pageWidth - 40, 30, "S")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Customer Information", 25, 130)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(203, 213, 225)
  doc.text(`Name: ${data.customerName}`, 25, 140)
  if (data.customerEmail) {
    doc.text(`Email: ${data.customerEmail}`, 110, 140)
  }

  // Items section - Manual table
  let yPos = 160

  // Table header
  doc.setFillColor(59, 130, 246)
  doc.rect(20, yPos, pageWidth - 40, 15, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("Product/Service", 25, yPos + 10)
  doc.text("Qty", pageWidth - 80, yPos + 10)
  doc.text("Amount", pageWidth - 40, yPos + 10, { align: "right" })

  yPos += 15

  // Table rows
  data.items.forEach((item, index) => {
    const rowColor = index % 2 === 0 ? [30, 41, 59] : [51, 65, 85]
    doc.setFillColor(rowColor[0], rowColor[1], rowColor[2])
    doc.rect(20, yPos, pageWidth - 40, 15, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(item.item, 25, yPos + 10)
    doc.text(item.quantity.toString(), pageWidth - 80, yPos + 10)
    doc.text(`৳${item.price.toLocaleString()}`, pageWidth - 25, yPos + 10, { align: "right" })

    yPos += 15
  })

  // Total section
  const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  yPos += 10

  doc.setFillColor(30, 41, 59)
  doc.rect(pageWidth - 100, yPos, 80, 25, "F")
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(2)
  doc.rect(pageWidth - 100, yPos, 80, 25, "S")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("TOTAL:", pageWidth - 95, yPos + 10)

  doc.setTextColor(96, 165, 250) // blue-400
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(`৳${total.toLocaleString()}`, pageWidth - 95, yPos + 20)

  // Payment status
  yPos += 40
  doc.setTextColor(34, 197, 94) // green-500
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("✅ PAYMENT CONFIRMED", 20, yPos)

  // Terms section
  yPos += 20
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("Terms & Conditions:", 20, yPos)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(203, 213, 225)
  const terms = [
    "• Recharge will be processed within 24 hours",
    "• Contact support for any issues or queries",
    "• This invoice serves as proof of purchase",
  ]

  terms.forEach((term, index) => {
    doc.text(term, 20, yPos + 10 + index * 8)
  })

  // Footer
  const footerY = pageHeight - 30
  doc.setFillColor(15, 23, 42)
  doc.rect(0, footerY, pageWidth, 30, "F")

  doc.setTextColor(148, 163, 184) // slate-400
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Thank you for choosing RM STORE! 🎮", pageWidth / 2, footerY + 10, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text("📞 +880 1818618349 | 📧 xrupture.tw@gmail.com", pageWidth / 2, footerY + 18, { align: "center" })
  doc.text("🌐 rmstore.netlify.app", pageWidth / 2, footerY + 25, { align: "center" })

  return doc
}
