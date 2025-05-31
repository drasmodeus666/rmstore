import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface InvoiceItem {
  item: string
  price: number
  quantity: number
}

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: InvoiceItem[]
  paymentMethod: string
}

export const generateInvoicePDF = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF()

  // Header
  doc.setFillColor(220, 38, 38) // Red color
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.text("RM STORE", 14, 22)

  doc.setFontSize(12)
  doc.text("Racing Master Recharge Services", 14, 32)

  doc.setFontSize(24)
  doc.text("INVOICE", doc.internal.pageSize.getWidth() - 20, 22, { align: "right" })

  doc.setFontSize(10)
  doc.text(`#INV-${data.invoiceNumber}`, doc.internal.pageSize.getWidth() - 20, 32, { align: "right" })

  // Customer and Invoice Info
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)

  doc.text(`Date: ${data.date}`, 14, 50)
  doc.text(`Due Date: ${data.dueDate}`, 14, 58)

  doc.text("Bill To:", 14, 70)
  doc.setFontSize(11)
  doc.text(data.customerName, 14, 78)
  doc.setFontSize(10)
  doc.text(`Email: ${data.customerEmail}`, 14, 86)
  doc.text(`Phone: ${data.customerPhone}`, 14, 94)

  // Items Table
  const tableColumn = ["Item", "Unit Price", "Quantity", "Total"]
  const tableRows: any[] = []

  let subtotal = 0

  data.items.forEach((item) => {
    const total = item.price * item.quantity
    subtotal += total

    // Format price with BDT symbol
    const formattedPrice = `৳${item.price.toFixed(2)}`
    const formattedTotal = `৳${total.toFixed(2)}`

    tableRows.push([item.item, formattedPrice, item.quantity, formattedTotal])
  })

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 110,
    theme: "striped",
    headStyles: {
      fillColor: [220, 38, 38],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  })

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10

  doc.text(`Subtotal:`, 120, finalY)
  doc.text(`৳${subtotal.toFixed(2)}`, doc.internal.pageSize.getWidth() - 20, finalY, { align: "right" })

  // No tax calculation

  doc.setFontSize(12)
  doc.setFont(undefined, "bold")
  doc.text(`Total:`, 120, finalY + 20)
  doc.text(`৳${subtotal.toFixed(2)}`, doc.internal.pageSize.getWidth() - 20, finalY + 20, { align: "right" })

  // Payment Information
  doc.setFontSize(10)
  doc.setFont(undefined, "normal")
  doc.text(`Payment Information`, 14, finalY + 40)
  doc.text(`Payment Method: ${data.paymentMethod}`, 14, finalY + 48)

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(8)
  doc.text("Thank you for your business!", doc.internal.pageSize.getWidth() / 2, pageHeight - 30, { align: "center" })
  doc.text(
    "Contact: +880 1818618349 | Email: xrupture.tw@gmail.com",
    doc.internal.pageSize.getWidth() / 2,
    pageHeight - 25,
    { align: "center" },
  )

  return doc
}
