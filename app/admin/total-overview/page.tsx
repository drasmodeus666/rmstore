"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface OverviewStats {
  totalProfit: number
  totalSpending: number
  totalRevenue: number
  profitMargin: number
  roi: number
  totalOrders: number
  avgOrderValue: number
  todayProfit: number
  weeklyProfit: number
  monthlyProfit: number
  topProduct: string
  topProductProfit: number
}

export default function TotalOverviewPage() {
  const router = useRouter()
  const [stats, setStats] = useState<OverviewStats>({
    totalProfit: 0,
    totalSpending: 0,
    totalRevenue: 0,
    profitMargin: 0,
    roi: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    todayProfit: 0,
    weeklyProfit: 0,
    monthlyProfit: 0,
    topProduct: "",
    topProductProfit: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const authStatus = localStorage.getItem("adminAuthenticated")
    if (authStatus !== "true") {
      router.push("/admin")
      return
    }

    fetchOverviewStats()
    const interval = setInterval(fetchOverviewStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [router])

  const fetchOverviewStats = () => {
    try {
      const statements = JSON.parse(localStorage.getItem("statements") || "[]")
      const orders = JSON.parse(localStorage.getItem("orders") || "[]")

      // Calculate basic metrics
      const totalSpending = statements.reduce((sum: number, s: any) => sum + (s.cost || 0), 0)
      const totalRevenue = statements.reduce((sum: number, s: any) => sum + (s.price || 0), 0)
      const totalProfit = totalRevenue - totalSpending
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
      const roi = totalSpending > 0 ? (totalProfit / totalSpending) * 100 : 0
      const totalOrders = statements.length
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Time-based profits
      const today = new Date().toDateString()
      const todayProfit = statements
        .filter((s: any) => new Date(s.timestamp).toDateString() === today)
        .reduce((sum: number, s: any) => sum + ((s.price || 0) - (s.cost || 0)), 0)

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weeklyProfit = statements
        .filter((s: any) => new Date(s.timestamp) >= weekAgo)
        .reduce((sum: number, s: any) => sum + ((s.price || 0) - (s.cost || 0)), 0)

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyProfit = statements
        .filter((s: any) => {
          const date = new Date(s.timestamp)
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear
        })
        .reduce((sum: number, s: any) => sum + ((s.price || 0) - (s.cost || 0)), 0)

      // Find top performing product
      const productProfits = new Map<string, number>()
      statements.forEach((s: any) => {
        const product = s.product || "Unknown"
        const profit = (s.price || 0) - (s.cost || 0)
        productProfits.set(product, (productProfits.get(product) || 0) + profit)
      })

      let topProduct = ""
      let topProductProfit = 0
      productProfits.forEach((profit, product) => {
        if (profit > topProductProfit) {
          topProductProfit = profit
          topProduct = product
        }
      })

      setStats({
        totalProfit,
        totalSpending,
        totalRevenue,
        profitMargin,
        roi,
        totalOrders,
        avgOrderValue,
        todayProfit,
        weeklyProfit,
        monthlyProfit,
        topProduct,
        topProductProfit,
      })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching overview stats:", error)
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const data = [
      ["Metric", "Value"],
      ["Total Profit", `৳${stats.totalProfit.toFixed(2)}`],
      ["Total Spending", `৳${stats.totalSpending.toFixed(2)}`],
      ["Total Revenue", `৳${stats.totalRevenue.toFixed(2)}`],
      ["Profit Margin", `${stats.profitMargin.toFixed(2)}%`],
      ["ROI", `${stats.roi.toFixed(2)}%`],
      ["Total Orders", stats.totalOrders.toString()],
      ["Average Order Value", `৳${stats.avgOrderValue.toFixed(2)}`],
      ["Today's Profit", `৳${stats.todayProfit.toFixed(2)}`],
      ["Weekly Profit", `৳${stats.weeklyProfit.toFixed(2)}`],
      ["Monthly Profit", `৳${stats.monthlyProfit.toFixed(2)}`],
      ["Top Product", stats.topProduct],
      ["Top Product Profit", `৳${stats.topProductProfit.toFixed(2)}`],
    ]

    const csvContent = data.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `total-overview-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Total overview data exported to CSV",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading overview data...</p>
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
                <h1 className="text-2xl sm:text-4xl font-bold text-black">Total Financial Overview</h1>
                <p className="text-gray-600 text-sm sm:text-lg">Complete business performance summary</p>
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
          {/* Main Financial Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {/* Total Profit */}
            <Card className="monster-ultra-card shadow-2xl rounded-3xl border-gray-200 monster-hover">
              <CardHeader className="pb-6 pt-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center text-black">Total Profit</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <div className="text-5xl font-bold text-green-600 mb-2">৳{stats.totalProfit.toLocaleString()}</div>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Target className="h-5 w-5" />
                  <span className="text-lg font-semibold">{stats.profitMargin.toFixed(1)}% Margin</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Spending */}
            <Card className="monster-ultra-card shadow-2xl rounded-3xl border-gray-200 monster-hover">
              <CardHeader className="pb-6 pt-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-3xl flex items-center justify-center shadow-lg">
                    <TrendingDown className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center text-black">Total Spending</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <div className="text-5xl font-bold text-gray-800 mb-2">৳{stats.totalSpending.toLocaleString()}</div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <Activity className="h-5 w-5" />
                  <span className="text-lg font-semibold">{stats.roi.toFixed(1)}% ROI</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="monster-ultra-card shadow-2xl rounded-3xl border-gray-200 monster-hover">
              <CardHeader className="pb-6 pt-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center text-black">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <div className="text-5xl font-bold text-blue-600 mb-2">৳{stats.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-lg font-semibold">{stats.totalOrders} Orders</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Time-based Performance */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <h3 className="text-3xl sm:text-4xl font-bold text-black">Performance Timeline</h3>
              <p className="text-gray-600 text-lg sm:text-xl">Profit trends across different time periods</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Card className="monster-ultra-card shadow-lg rounded-2xl border-gray-200 monster-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-medium text-gray-700">Today's Profit</CardTitle>
                  <Calendar className="h-6 w-6 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-black">৳{stats.todayProfit.toLocaleString()}</div>
                  <p className="text-sm text-green-600 mt-1">Earned today</p>
                </CardContent>
              </Card>

              <Card className="monster-ultra-card shadow-lg rounded-2xl border-gray-200 monster-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-medium text-gray-700">Weekly Profit</CardTitle>
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-black">৳{stats.weeklyProfit.toLocaleString()}</div>
                  <p className="text-sm text-blue-600 mt-1">Last 7 days</p>
                </CardContent>
              </Card>

              <Card className="monster-ultra-card shadow-lg rounded-2xl border-gray-200 monster-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-medium text-gray-700">Monthly Profit</CardTitle>
                  <PieChart className="h-6 w-6 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-black">৳{stats.monthlyProfit.toLocaleString()}</div>
                  <p className="text-sm text-purple-600 mt-1">This month</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Business Insights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <h3 className="text-3xl sm:text-4xl font-bold text-black">Business Insights</h3>
              <p className="text-gray-600 text-lg sm:text-xl">Key performance indicators and top performers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Key Metrics */}
              <Card className="monster-ultra-card shadow-lg rounded-2xl border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-black">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Average Order Value</span>
                    <span className="font-bold text-black">৳{stats.avgOrderValue.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-bold text-black">{stats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Profit Margin</span>
                    <Badge
                      className={`${
                        stats.profitMargin > 50
                          ? "bg-green-100 text-green-800"
                          : stats.profitMargin > 25
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      } border-0`}
                    >
                      {stats.profitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Return on Investment</span>
                    <Badge
                      className={`${
                        stats.roi > 100
                          ? "bg-green-100 text-green-800"
                          : stats.roi > 50
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      } border-0`}
                    >
                      {stats.roi.toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performer */}
              <Card className="monster-ultra-card shadow-lg rounded-2xl border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-black">Top Performing Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {stats.topProduct ? (
                    <>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Target className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-2xl font-bold text-black mb-2">{stats.topProduct}</h4>
                        <p className="text-gray-600">Highest profit generator</p>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                          ৳{stats.topProductProfit.toLocaleString()}
                        </div>
                        <p className="text-orange-700 font-medium">Total Profit Generated</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No product data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
