"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Printer, Plus, Minus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { database } from "@/lib/firebase"
import { ref, onValue, push } from "firebase/database"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface InvoiceEntry {
  id: string
  product: string
  price: number
  quantity: number
  customer: string
  timestamp: number
  invoiceNumber?: string
}

interface InvoiceItem {
  name: string
  unitPrice: string
  quantity: string
}

export default function InvoiceGenerator() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [customerName, setCustomerName] = useState<string>("Customer")
  const [customerEmail, setCustomerEmail] = useState<string>("")
  const [customerPhone, setCustomerPhone] = useState<string>("")
  const [invoiceNumber, setInvoiceNumber] = useState<string>("")
  const [items, setItems] = useState<InvoiceItem[]>([{ name: "", unitPrice: "", quantity: "1" }])
  const [recentInvoices, setRecentInvoices] = useState<InvoiceEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [notes, setNotes] = useState<string>("")

  // Generate a random invoice number on component mount
  useEffect(() => {
    generateRandomInvoiceNumber()
  }, [])

  useEffect(() => {
    // Get params from URL if available
    const productParam = searchParams.get("product")
    const priceParam = searchParams.get("price")
    const quantityParam = searchParams.get("quantity")
    const customerParam = searchParams.get("customer")

    if (productParam && priceParam) {
      setItems([
        {
          name: productParam || "",
          unitPrice: priceParam || "",
          quantity: quantityParam || "1",
        },
      ])
    }

    if (customerParam) setCustomerName(customerParam)

    fetchRecentInvoices()
  }, [searchParams])

  const fetchRecentInvoices = () => {
    const invoicesRef = ref(database, "ingame_invoices")

    onValue(
      invoicesRef,
      (snapshot) => {
        const data = snapshot.val()
        const invoicesArray: InvoiceEntry[] = []

        if (data) {
          Object.keys(data).forEach((key) => {
            invoicesArray.push({
              id: key,
              ...data[key],
            })
          })
        }

        // Sort by timestamp (newest first) and limit to 10
        invoicesArray.sort((a, b) => b.timestamp - a.timestamp)
        setRecentInvoices(invoicesArray.slice(0, 10))
        setLoading(false)
      },
      {
        onlyOnce: true,
      },
    )
  }

  const generateRandomInvoiceNumber = () => {
    const prefix = "INV"
    const randomPart = Math.floor(10000 + Math.random() * 90000)
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "")
    const newInvoiceNumber = `${prefix}-${datePart}-${randomPart}`

    // Ensure we don't generate the same number
    if (newInvoiceNumber !== invoiceNumber) {
      setInvoiceNumber(newInvoiceNumber)
    } else {
      // If same, try again with a different random part
      generateRandomInvoiceNumber()
    }
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...items]

    if (field === "unitPrice" && value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return
    }

    if (field === "quantity" && value !== "" && !/^\d*$/.test(value)) {
      return
    }

    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { name: "", unitPrice: "", quantity: "1" }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items]
      newItems.splice(index, 1)
      setItems(newItems)
    }
  }

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const price = Number.parseFloat(item.unitPrice) || 0
      const quantity = Number.parseInt(item.quantity) || 0
      return total + price * quantity
    }, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() // No tax
  }

  const validateForm = () => {
    // Check if customer name is provided
    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a customer name.",
        variant: "destructive",
      })
      return false
    }

    // Check if at least one item has name and price
    const validItems = items.filter(
      (item) =>
        item.name.trim() &&
        item.unitPrice.trim() &&
        Number.parseFloat(item.unitPrice) > 0 &&
        item.quantity.trim() &&
        Number.parseInt(item.quantity) > 0,
    )

    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item with a name, price, and quantity.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const generateInvoice = (recordSale = false) => {
    if (!validateForm()) return

    // Prepare invoice data for database
    const invoiceData = {
      customer: customerName,
      customerEmail,
      customerPhone,
      invoiceNumber,
      items: items.map((item) => ({
        product: item.name,
        price: Number.parseFloat(item.unitPrice) || 0,
        quantity: Number.parseInt(item.quantity) || 0,
      })),
      subtotal: calculateSubtotal(),
      total: calculateTotal(), // No tax
      notes,
      timestamp: Date.now(),
    }

    // Generate PDF
    generateInvoicePDF(invoiceData)

    // Save invoice record to database
    push(ref(database, "ingame_invoices"), invoiceData)
      .then(() => {
        toast({
          title: "Success",
          description: "Invoice generated successfully!",
        })

        // If also recording as a sale
        if (recordSale) {
          // Create entries for each item
          const salePromises = items
            .map((item) => {
              if (!item.name.trim() || !item.unitPrice.trim()) return null

              const saleEntry = {
                product: item.name,
                price: Number.parseFloat(item.unitPrice) || 0,
                profit: (Number.parseFloat(item.unitPrice) || 0) * (Number.parseInt(item.quantity) || 0),
                quantity: Number.parseInt(item.quantity) || 0,
                customer: customerName,
                invoiceNumber,
                timestamp: Date.now(),
              }

              return push(ref(database, "in_game_entries"), saleEntry)
            })
            .filter(Boolean)

          Promise.all(salePromises)
            .then(() => {
              toast({
                title: "Success",
                description: "Sales recorded successfully!",
              })
            })
            .catch((error) => {
              toast({
                title: "Error",
                description: "Failed to record sales: " + error.message,
                variant: "destructive",
              })
            })
        }

        // Reset form or prepare for new invoice
        generateRandomInvoiceNumber()
        fetchRecentInvoices()
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to save invoice: " + error.message,
          variant: "destructive",
        })
      })
  }

  const generateInvoicePDF = (invoiceData: any) => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF()

      // Add company logo/header
      doc.setFillColor(220, 38, 38) // Red color
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.text("RM STORE", 14, 20)
      doc.setFontSize(12)
      doc.text("Racing Master Recharge Services", 14, 30)

      // Add invoice details
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(18)
      doc.text("INVOICE", doc.internal.pageSize.getWidth() - 14, 20, { align: "right" })
      doc.setFontSize(10)
      doc.text(`#${invoiceData.invoiceNumber}`, doc.internal.pageSize.getWidth() - 14, 30, { align: "right" })

      // Add date and due date
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 15)
      const dueDateFormatted = dueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      doc.setFontSize(10)
      doc.text(`Date: ${currentDate}`, 14, 50)
      doc.text(`Due Date: ${dueDateFormatted}`, 14, 57)

      // Add customer info
      doc.setFontSize(12)
      doc.text("Bill To:", 14, 70)
      doc.setFontSize(10)
      doc.text(invoiceData.customer, 14, 77)

      if (invoiceData.customerEmail) {
        doc.text(`Email: ${invoiceData.customerEmail}`, 14, 84)
      }

      if (invoiceData.customerPhone) {
        doc.text(`Phone: ${invoiceData.customerPhone}`, 14, invoiceData.customerEmail ? 91 : 84)
      }

      // Add items table
      const tableColumn = ["Item", "Unit Price", "Quantity", "Total"]
      const tableRows = invoiceData.items.map((item: any) => {
        // Make sure item has all required properties
        if (!item || typeof item !== "object") {
          return ["Invalid item", "৳0.00", "0", "৳0.00"]
        }

        const price = typeof item.price === "number" ? item.price : 0
        const quantity = typeof item.quantity === "number" ? item.quantity : 0
        const total = price * quantity

        return [item.product || "", `৳${price.toFixed(2)}`, quantity.toString(), `৳${total.toFixed(2)}`]
      })

      // Add the table
      autoTable(doc, {
        startY: 100,
        head: [tableColumn],
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          cellPadding: 5,
        },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 30, halign: "right" },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 30, halign: "right" },
        },
      })

      // Get the final Y position after the table
      const finalY = (doc as any).lastAutoTable.finalY || 120

      // Add totals (without tax)
      doc.setFontSize(10)
      doc.text("Subtotal:", 140, finalY + 10)
      doc.text(`৳${invoiceData.subtotal.toFixed(2)}`, 170, finalY + 10, { align: "right" })

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Total:", 140, finalY + 27)
      doc.text(`৳${invoiceData.total.toFixed(2)}`, 170, finalY + 27, { align: "right" })
      doc.setFont("helvetica", "normal")

      // Add payment info
      doc.setFontSize(10)
      doc.text("Payment Information", 14, finalY + 40)
      doc.text("Payment Method: Bkash", 14, finalY + 47)

      // Add notes if any
      if (invoiceData.notes) {
        doc.text("Notes:", 14, finalY + 65)
        doc.text(invoiceData.notes, 14, finalY + 72)
      }

      // Add footer
      doc.setFontSize(8)
      doc.text("Thank you for your business!", doc.internal.pageSize.getWidth() / 2, finalY + 85, { align: "center" })
      doc.text(
        "Contact: +880 1818618349 | Email: xrupture.tw@gmail.com",
        doc.internal.pageSize.getWidth() / 2,
        finalY + 90,
        { align: "center" },
      )

      // Save the PDF
      doc.save(`Invoice_${invoiceData.invoiceNumber}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF invoice: " + (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-black to-red-900 p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white glow-text">Invoice Generator</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invoice Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Card className="shadow-lg border-red-800/20">
              <CardHeader className="bg-gradient-to-r from-red-950 to-red-900">
                <CardTitle className="text-xl text-white">Generate Invoice</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Invoice Number */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Invoice #:</div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-red-600">{invoiceNumber}</div>
                      <Button variant="outline" size="sm" onClick={generateRandomInvoiceNumber} className="h-7 px-2">
                        Regenerate
                      </Button>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h3 className="font-medium border-b pb-1">Customer Information</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Customer Name:</label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email (Optional):</label>
                        <Input
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="customer@example.com"
                          type="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone (Optional):</label>
                        <Input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    <h3 className="font-medium border-b pb-1">Items</h3>
                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <label className="text-xs font-medium">Item:</label>
                          <Input
                            value={item.name}
                            onChange={(e) => handleItemChange(index, "name", e.target.value)}
                            placeholder="Item name"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-xs font-medium">Price:</label>
                          <Input
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-medium">Qty:</label>
                          <Input
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            placeholder="1"
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="h-10 w-10 text-red-500"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="w-full flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Item
                    </Button>
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Subtotal:</span>
                      <span className="font-medium">৳{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-red-600">৳{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes (Optional):</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional notes here..."
                      className="w-full min-h-[80px] p-2 border rounded-md"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => generateInvoice(false)}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      Generate Invoice Only
                    </Button>
                    <Button onClick={() => generateInvoice(true)} variant="outline" className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Generate & Record Sale
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Invoices */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Card className="shadow-lg border-red-800/20">
              <CardHeader className="bg-gradient-to-r from-red-950 to-red-900">
                <CardTitle className="text-xl text-white">Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : recentInvoices.length > 0 ? (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {recentInvoices.map((invoice) => (
                      <motion.div
                        key={invoice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-primary">{invoice.customer}</h3>
                            <p className="text-sm text-muted-foreground">{formatDate(invoice.timestamp)}</p>
                            {invoice.invoiceNumber && (
                              <p className="text-xs font-medium text-red-600 mt-1">#{invoice.invoiceNumber}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-500">
                              ৳
                              {typeof invoice.total === "number"
                                ? invoice.total.toFixed(2)
                                : ((invoice.price || 0) * (invoice.quantity || 1)).toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 mt-1"
                              onClick={() => {
                                // Regenerate the PDF for this invoice
                                const invoiceData = {
                                  customer: invoice.customer,
                                  invoiceNumber:
                                    invoice.invoiceNumber ||
                                    `INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                                  items: [
                                    {
                                      product: invoice.product,
                                      price: invoice.price,
                                      quantity: invoice.quantity || 1,
                                    },
                                  ],
                                  subtotal: invoice.price * (invoice.quantity || 1),
                                  total: invoice.price * (invoice.quantity || 1), // No tax
                                  timestamp: invoice.timestamp,
                                }
                                generateInvoicePDF(invoiceData)
                              }}
                            >
                              <Printer className="h-3 w-3 mr-1" /> Reprint
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm">{invoice.product && `${invoice.product} x${invoice.quantity || 1}`}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground">No recent invoices available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
