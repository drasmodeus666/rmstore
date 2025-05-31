"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, TrendingUp, TrendingDown, Package, DollarSign, Percent, Calculator } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { database, auth } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { onAuthStateChanged } from "firebase/auth"

interface ProductSpending {
  product: string
  totalCost: number
  totalRevenue: number
  totalProfit: number
  orderCount: number
  avgCost: number
  avgRevenue: number
  profitMargin: number
  roi: number
}

export default function DetailedSpendingPage() {
  const router = useRouter()
  const [productSpending, setProductSpending] = useState<ProductSpending[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check Firebase authentication
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login")
        return
      }
      fetchDetailedSpending()
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const interval = setInterval(fetchDetailedSpending, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDetailedSpending = () => {
    try {
      // Get statements from Firebase
      const statementsRef = ref(database, "statements")
      onValue(statementsRef, (snapshot) => {
        const data = snapshot.val()
        const statements = data ? Object.values(data) : []

        // Group by product
        const productMap = new Map<
          string,
          {
            totalCost: number
            totalRevenue: number
            orderCount: number
          }
        >()

        statements.forEach((statement: any) => {
          const product = statement.product || "Unknown"
          const cost = statement.cost || 0
          const revenue = statement.price || 0

          if (productMap.has(product)) {
            const existing = productMap.get(product)!
            productMap.set(product, {
              totalCost: existing.totalCost + cost,
              totalRevenue: existing.totalRevenue + revenue,
              orderCount: existing.orderCount + 1,
            })
          } else {
            productMap.set(product, {
              totalCost: cost,
              totalRevenue: revenue,
              orderCount: 1,
            })
          }
        })

        // Convert to array and calculate metrics
        const spendingData: ProductSpending[] = Array.from(productMap.entries()).map(([product, data]) => {
          const totalProfit = data.totalRevenue - data.totalCost
          const profitMargin = data.totalRevenue > 0 ? (totalProfit / data.totalRevenue) * 100 : 0
          const roi = data.totalCost > 0 ? (totalProfit / data.totalCost) * 100 : 0

          return {
            product,
            totalCost: data.totalCost,
            totalRevenue: data.totalRevenue,
            totalProfit,
            orderCount: data.orderCount,
            avgCost: data.totalCost / data.orderCount,
            avgRevenue: data.totalRevenue / data.orderCount,
            profitMargin,
            roi,
          }
        })

        // Sort by total cost (highest first)
        spendingData.sort((a, b) => b.totalCost - a.totalCost)

        setProductSpending(spendingData)
        setLoading(false)
      })
    } catch (error) {
      console.error("Error fetching spending data:", error)
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Product",
      "Total Cost",
      "Total Revenue",
      "Total Profit",
      "Order Count",
      "Avg Cost",
      "Avg Revenue",
      "Profit Margin (%)",
      "ROI (%)",
    ]

    const csvData = productSpending.map((item) => [
      item.product,
      item.totalCost.toFixed(2),
      item.totalRevenue.toFixed(2),
      item.totalProfit.toFixed(2),
      item.orderCount,
      item.avgCost.toFixed(2),
      item.avgRevenue.toFixed(2),
      item.profitMargin.toFixed(2),
      item.roi.toFixed(2),
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `detailed-spending-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Detailed spending data exported to CSV",
    })
  }

  const totalSpending = productSpending.reduce((sum, item) => sum + item.totalCost, 0)
  const totalRevenue = productSpending.reduce((sum, item) => sum + item.totalRevenue, 0)
  const totalProfit = totalRevenue - totalSpending
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading spending data...</p>
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
                <h1 className="text-2xl sm:text-4xl font-bold text-black">Detailed Spending Analysis</h1>
                <p className="text-gray-600 text-sm sm:text-lg">Product-wise cost breakdown and ROI</p>
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
            <Card className="monster-ultra-card shadow-lg rounded-2xl border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Total Products</CardTitle>
                <Package className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{productSpending.length}</div>
                <p className="text-xs text-gray-600 mt-1">Different products sold</p>
              </CardContent>
            </Card>

            <Card className="monster-ultra-card shadow-lg rounded-2xl border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Total Spending</CardTitle>
                <TrendingDown className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">৳{totalSpending.toLocaleString()}</div>
                <p className="text-xs text-red-600 mt-1">Total investment costs</p>
              </CardContent>
            </Card>

            <Card className="monster-ultra-card shadow-lg rounded-2xl border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">৳{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-green-600 mt-1">Total sales revenue</p>
              </CardContent>
            </Card>

            <Card className="monster-ultra-card shadow-lg rounded-2xl border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Overall Margin</CardTitle>
                <Percent className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{overallMargin.toFixed(1)}%</div>
                <p className="text-xs text-blue-600 mt-1">Profit margin</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Product Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <h3 className="text-3xl sm:text-4xl font-bold text-black">Product-wise Analysis</h3>
              <p className="text-gray-600 text-lg sm:text-xl">Detailed breakdown by product performance</p>
            </div>

            {productSpending.length === 0 ? (
              <Card className="monster-ultra-card shadow-lg rounded-2xl border-gray-200">
                <CardContent className="text-center py-12">
                  <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black mb-2">No Spending Data</h3>
                  <p className="text-gray-600">
                    No transactions found. Complete some orders to see detailed spending analysis.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {productSpending.map((item, index) => (
                  <motion.div
                    key={item.product}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <Card className="monster-ultra-card shadow-lg rounded-2xl border-gray-200 monster-hover">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl font-bold text-black">{item.product}</CardTitle>
                            <p className="text-gray-600 text-sm mt-1">{item.orderCount} orders completed</p>
                          </div>
                          <Badge
                            className={`${
                              item.profitMargin > 50
                                ? "bg-green-100 text-green-800"
                                : item.profitMargin > 25
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            } border-0`}
                          >
                            {item.profitMargin.toFixed(1)}% Margin
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Financial Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">৳{item.totalCost.toLocaleString()}</div>
                            <p className="text-xs text-gray-600">Total Cost</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              ৳{item.totalRevenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-600">Total Revenue</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              ৳{item.totalProfit.toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-600">Total Profit</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{item.roi.toFixed(1)}%</div>
                            <p className="text-xs text-gray-600">ROI</p>
                          </div>
                        </div>

                        {/* Average Metrics */}
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Average per Order</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg Cost:</span>
                              <span className="font-semibold text-black">৳{item.avgCost.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg Revenue:</span>
                              <span className="font-semibold text-black">৳{item.avgRevenue.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Performance Indicator */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2">
                            {item.roi > 100 ? (
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {item.roi > 100
                                ? "High Performance"
                                : item.roi > 50
                                  ? "Good Performance"
                                  : "Needs Attention"}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-black">
                              {((item.totalCost / totalSpending) * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-600">of total spending</div>
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
