"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, TrendingDown, Package, DollarSign, Calculator, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { database, auth } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { onAuthStateChanged } from "firebase/auth"

interface OrderCost {
  id: string
  product: string
  cost: number
  price: number
  customerName: string
  customerEmail: string
  transactionId: string
  date: string
  status: string
  uid: string
}

export default function DetailedCostPage() {
  const router = useRouter()
  const [orderCosts, setOrderCosts] = useState<OrderCost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check Firebase authentication
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login")
        return
      }
      fetchOrderCosts()
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const interval = setInterval(fetchOrderCosts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchOrderCosts = () => {
    try {
      // Get orders from Firebase
      const ordersRef = ref(database, "orders")
      onValue(ordersRef, (snapshot) => {
        const data = snapshot.val()
        const orders = data ? Object.values(data) : []

        // Transform orders to cost format
        const costData: OrderCost[] = orders.map((order: any, index: number) => ({
          id: order.id || `order_${index}`,
          product: order.product || "Unknown Product",
          cost: order.cost || 0,
          price: order.price || 0,
          customerName: order.customerName || "Unknown Customer",
          customerEmail: order.customerEmail || "No Email",
          transactionId: order.transactionId || "N/A",
          date: order.createdAt || new Date().toLocaleDateString(),
          status: order.status || "pending",
          uid: order.uid || "N/A",
        }))

        // Sort by date (newest first)
        costData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setOrderCosts(costData)
        setLoading(false)
      })
    } catch (error) {
      console.error("Error fetching cost data:", error)
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Order ID",
      "Product",
      "Cost",
      "Price",
      "Customer Name",
      "Customer Email",
      "Transaction ID",
      "Date",
      "Status",
      "UID",
    ]

    const csvData = orderCosts.map((item) => [
      item.id,
      item.product,
      item.cost.toFixed(2),
      item.price.toFixed(2),
      item.customerName,
      item.customerEmail,
      item.transactionId,
      item.date,
      item.status,
      item.uid,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `detailed-costs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Detailed cost data exported to CSV",
    })
  }

  const totalCosts = orderCosts.reduce((sum, item) => sum + item.cost, 0)
  const totalRevenue = orderCosts.reduce((sum, item) => sum + item.price, 0)
  const totalProfit = totalRevenue - totalCosts

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading cost data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-100">
      <Toaster />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 sm:gap-4"
            >
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-black">Detailed Cost Analysis</h1>
                <p className="text-gray-600 text-sm sm:text-lg">Order-by-order cost breakdown</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Button
                onClick={exportToCSV}
                className="bg-black hover:bg-gray-800 text-white rounded-xl px-4 sm:px-6 py-2 sm:py-3"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Export CSV
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8 sm:space-y-12">
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <Card className="shadow-lg rounded-2xl border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Total Orders</CardTitle>
                <Package className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{orderCosts.length}</div>
                <p className="text-xs text-gray-600 mt-1">All orders tracked</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Total Costs</CardTitle>
                <TrendingDown className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">৳{totalCosts.toLocaleString()}</div>
                <p className="text-xs text-red-600 mt-1">Total investment</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">৳{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-green-600 mt-1">Total sales</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Net Profit</CardTitle>
                <Calculator className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">৳{totalProfit.toLocaleString()}</div>
                <p className="text-xs text-blue-600 mt-1">Revenue - Costs</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Orders List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <h3 className="text-3xl sm:text-4xl font-bold text-black">Order-by-Order Costs</h3>
              <p className="text-gray-600 text-lg sm:text-xl">Detailed breakdown of each order</p>
            </div>

            {orderCosts.length === 0 ? (
              <Card className="shadow-lg rounded-2xl border-gray-200">
                <CardContent className="text-center py-12">
                  <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black mb-2">No Cost Data</h3>
                  <p className="text-gray-600">No orders found. Complete some orders to see cost analysis.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {orderCosts.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <Card className="shadow-lg rounded-2xl border-gray-200 hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl font-bold text-black">{order.product}</CardTitle>
                            <p className="text-gray-600 text-sm mt-1">Order ID: {order.id}</p>
                          </div>
                          <Badge
                            className={`${
                              order.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            } border-0`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Financial Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">৳{order.cost.toLocaleString()}</div>
                            <p className="text-xs text-gray-600">Cost</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">৳{order.price.toLocaleString()}</div>
                            <p className="text-xs text-gray-600">Price</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              ৳{(order.price - order.cost).toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-600">Profit</p>
                          </div>
                        </div>

                        {/* Customer Details */}
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer Details</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Name:</span>
                              <span className="font-semibold text-black ml-2">{order.customerName}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <span className="font-semibold text-black ml-2">{order.customerEmail}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">UID:</span>
                              <span className="font-semibold text-black ml-2">{order.uid}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Transaction:</span>
                              <span className="font-semibold text-black ml-2">{order.transactionId}</span>
                            </div>
                          </div>
                        </div>

                        {/* Date and Performance */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{order.date}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-black">
                              {(((order.price - order.cost) / order.price) * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-600">profit margin</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
