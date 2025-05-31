"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Statement {
  id: string
  product: string
  price: number
  cost: number
  profit: number
  timestamp: number
}

interface ProductProfit {
  profit: number
  count: number
  revenue: number
  cost: number
}

interface ProductProfits {
  [key: string]: ProductProfit
}

export default function ProfitAnalysis() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [totalRevenue, setTotalRevenue] = useState<number>(0)
  const [totalCost, setTotalCost] = useState<number>(0)
  const [totalProfit, setTotalProfit] = useState<number>(0)
  const [profitMargin, setProfitMargin] = useState<number>(0)
  const [productProfits, setProductProfits] = useState<ProductProfits>({})
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    fetchData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = () => {
    setRefreshing(true)
    try {
      const statements: Statement[] = JSON.parse(localStorage.getItem("statements") || "[]")
      processData(statements)
      setRefreshing(false)
      setLoading(false)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
      setRefreshing(false)
      setLoading(false)
    }
  }

  const processData = (statements: Statement[]) => {
    let revenue = 0
    let cost = 0
    let profit = 0
    const profits: ProductProfits = {}

    statements.forEach((statement) => {
      const { product, price, cost: itemCost, profit: itemProfit } = statement

      revenue += price
      cost += itemCost
      profit += itemProfit

      if (!profits[product]) {
        profits[product] = { profit: 0, count: 0, revenue: 0, cost: 0 }
      }

      profits[product].profit += itemProfit
      profits[product].count += 1
      profits[product].revenue += price
      profits[product].cost += itemCost
    })

    const margin = revenue > 0 ? (profit / revenue) * 100 : 0

    setTotalRevenue(revenue)
    setTotalCost(cost)
    setTotalProfit(profit)
    setProfitMargin(margin)
    setProductProfits(profits)
  }

  const exportToCSV = () => {
    try {
      const columns = ["Product", "Profit", "Revenue", "Cost", "Count", "Margin"]
      let csvContent = columns.join(",") + "\n"

      Object.entries(productProfits)
        .sort(([, a], [, b]) => b.profit - a.profit)
        .forEach(([product, data]) => {
          const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0
          const row = [
            product,
            data.profit.toFixed(2),
            data.revenue.toFixed(2),
            data.cost.toFixed(2),
            data.count.toString(),
            `${margin.toFixed(2)}%`,
          ]
          csvContent += row.join(",") + "\n"
        })

      // Add total row
      const totalCount = Object.values(productProfits).reduce((sum, data) => sum + data.count, 0)
      csvContent +=
        [
          "TOTAL",
          totalProfit.toFixed(2),
          totalRevenue.toFixed(2),
          totalCost.toFixed(2),
          totalCount.toString(),
          `${profitMargin.toFixed(2)}%`,
        ].join(",") + "\n"

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", "profit-analysis.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: "CSV file has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating CSV:", error)
      toast({
        title: "Error",
        description: "Failed to generate CSV file.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Toaster />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-black/10 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin")}
              className="text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-white">Profit Analysis</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative container mx-auto py-8 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Profit and Spending Analysis</h2>
              <p className="text-sm text-gray-400">(Auto-refreshes every 30 seconds. Last updated: {lastUpdated})</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchData}
                disabled={refreshing}
                className="flex items-center gap-2 text-white border-white/20 hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="flex items-center gap-2 text-white border-white/20 hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 shadow-lg rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">৳{totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-xl border border-red-500/20 shadow-lg rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">৳{totalCost.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 shadow-lg rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">৳{totalProfit.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 shadow-lg rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Profit Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">{profitMargin.toFixed(2)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Profit Table */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-white">Profit Breakdown by Product</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : Object.keys(productProfits).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 font-semibold text-white">Product</th>
                        <th className="text-right py-3 px-4 font-semibold text-white">Profit</th>
                        <th className="text-right py-3 px-4 font-semibold text-white">Revenue</th>
                        <th className="text-right py-3 px-4 font-semibold text-white">Cost</th>
                        <th className="text-right py-3 px-4 font-semibold text-white">Count</th>
                        <th className="text-right py-3 px-4 font-semibold text-white">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(productProfits)
                        .sort(([, a], [, b]) => b.profit - a.profit)
                        .map(([product, data], index) => {
                          const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0
                          return (
                            <tr key={product} className={index % 2 === 0 ? "bg-white/5" : ""}>
                              <td className="py-2 px-4 text-white">{product}</td>
                              <td className="py-2 px-4 text-right text-green-400">৳{data.profit.toFixed(2)}</td>
                              <td className="py-2 px-4 text-right text-white">৳{data.revenue.toFixed(2)}</td>
                              <td className="py-2 px-4 text-right text-red-400">৳{data.cost.toFixed(2)}</td>
                              <td className="py-2 px-4 text-right text-white">{data.count}</td>
                              <td className="py-2 px-4 text-right text-purple-400">{margin.toFixed(2)}%</td>
                            </tr>
                          )
                        })}
                      <tr className="border-t border-white/10 font-bold text-white">
                        <td className="py-3 px-4">TOTAL</td>
                        <td className="py-3 px-4 text-right text-green-400">৳{totalProfit.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">৳{totalRevenue.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-red-400">৳{totalCost.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          {Object.values(productProfits).reduce((sum, data) => sum + data.count, 0)}
                        </td>
                        <td className="py-3 px-4 text-right text-purple-400">{profitMargin.toFixed(2)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400">No profit data available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
