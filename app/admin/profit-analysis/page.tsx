"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { auth, database } from "@/lib/firebase"
import { ref, onValue, off } from "firebase/database"
import { onAuthStateChanged } from "firebase/auth"

interface Order {
  id: string
  product: string
  price: number
  cost: number
  profit: number
  status: string
  timestamp: number
  date: string
}

interface ProductStats {
  product: string
  totalSales: number
  totalRevenue: number
  totalProfit: number
  averageProfit: number
  count: number
}

export default function ProfitAnalysisPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [productStats, setProductStats] = useState<ProductStats[]>([])
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    averageProfit: 0,
  })

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login")
      } else {
        setAuthChecked(true)
      }
    })

    return () => unsubscribe()
  }, [router])

  // Load orders
  useEffect(() => {
    if (!authChecked) return

    const ordersRef = ref(database, "orders")

    const handleOrdersValue = (snapshot: any) => {
      const data = snapshot.val()
      if (data) {
        const ordersArray = Object.entries(data)
          .map(([key, value]: [string, any]) => ({
            id: key,
            ...value,
          }))
          .filter((order: Order) => order.status === "completed")

        setOrders(ordersArray)
        calculateProductStats(ordersArray)
      } else {
        setOrders([])
        setProductStats([])
        setTotalStats({
          totalRevenue: 0,
          totalProfit: 0,
          totalOrders: 0,
          averageProfit: 0,
        })
      }
      setLoading(false)
    }

    onValue(ordersRef, handleOrdersValue)

    return () => {
      off(ordersRef, "value", handleOrdersValue)
    }
  }, [authChecked])

  const calculateProductStats = (orders: Order[]) => {
    const productMap = new Map<string, ProductStats>()

    let totalRevenue = 0
    let totalProfit = 0

    orders.forEach((order) => {
      const profit = order.profit || 0
      totalRevenue += order.price
      totalProfit += profit

      if (productMap.has(order.product)) {
        const stats = productMap.get(order.product)!
        stats.totalSales += 1
        stats.totalRevenue += order.price
        stats.totalProfit += profit
        stats.count += 1
        stats.averageProfit = stats.totalProfit / stats.count
      } else {
        productMap.set(order.product, {
          product: order.product,
          totalSales: 1,
          totalRevenue: order.price,
          totalProfit: profit,
          averageProfit: profit,
          count: 1,
        })
      }
    })

    const productStatsArray = Array.from(productMap.values()).sort((a, b) => b.totalProfit - a.totalProfit)
    setProductStats(productStatsArray)

    setTotalStats({
      totalRevenue,
      totalProfit,
      totalOrders: orders.length,
      averageProfit: orders.length > 0 ? totalProfit / orders.length : 0,
    })
  }

  const exportToCSV = () => {
    const headers = ["Product", "Total Sales", "Total Revenue", "Total Profit", "Average Profit"]
    const rows = productStats.map((stat) => [
      stat.product,
      stat.totalSales.toString(),
      stat.totalRevenue.toFixed(2),
      stat.totalProfit.toFixed(2),
      stat.averageProfit.toFixed(2),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `profit-analysis-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!authChecked || loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profit Analysis</h1>
        <div className="flex gap-2">
          <Button onClick={exportToCSV}>Export to CSV</Button>
          <Button onClick={() => router.push("/admin")}>Back to Dashboard</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>From completed orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalStats.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Profit</CardTitle>
            <CardDescription>From completed orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalStats.totalProfit.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>Completed orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Average Profit</CardTitle>
            <CardDescription>Per order</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalStats.averageProfit.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Profit Distribution</CardTitle>
            <CardDescription>Profit by product</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="h-full w-full flex items-center justify-center">
              {productStats.length === 0 ? (
                <p className="text-muted-foreground">No data available</p>
              ) : (
                <div className="h-full w-full relative">
                  {/* Simple pie chart visualization */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full bg-gray-100 relative overflow-hidden">
                      {productStats.map((stat, index) => {
                        const totalProfit = totalStats.totalProfit
                        const percentage = totalProfit > 0 ? (stat.totalProfit / totalProfit) * 100 : 0
                        const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500"]
                        const color = colors[index % colors.length]

                        // Create a simple pie chart segment
                        return (
                          <div
                            key={stat.product}
                            className={`absolute ${color}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              clipPath: `polygon(50% 50%, 50% 0, ${50 + 50 * Math.cos((index * 2 * Math.PI) / productStats.length)}% ${50 - 50 * Math.sin((index * 2 * Math.PI) / productStats.length)}%, ${50 + 50 * Math.cos(((index + 1) * 2 * Math.PI) / productStats.length)}% ${50 - 50 * Math.sin(((index + 1) * 2 * Math.PI) / productStats.length)}%)`,
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute right-0 top-0 bottom-0 w-32 flex flex-col justify-center gap-2">
                    {productStats.map((stat, index) => {
                      const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500"]
                      const color = colors[index % colors.length]
                      const percentage =
                        totalStats.totalProfit > 0
                          ? ((stat.totalProfit / totalStats.totalProfit) * 100).toFixed(1)
                          : "0.0"

                      return (
                        <div key={stat.product} className="flex items-center gap-2">
                          <div className={`w-3 h-3 ${color}`} />
                          <span className="text-xs truncate">{stat.product}</span>
                          <span className="text-xs font-medium">{percentage}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>By profit margin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productStats.slice(0, 5).map((stat) => (
                <div key={stat.product} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{stat.product}</span>
                    <span>${stat.totalProfit.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{
                        width: `${totalStats.totalProfit > 0 ? (stat.totalProfit / totalStats.totalProfit) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
          <CardDescription>Detailed breakdown by product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Total Profit</TableHead>
                  <TableHead>Average Profit</TableHead>
                  <TableHead>Profit Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  productStats.map((stat) => (
                    <TableRow key={stat.product}>
                      <TableCell className="font-medium">{stat.product}</TableCell>
                      <TableCell>{stat.totalSales}</TableCell>
                      <TableCell>${stat.totalRevenue.toFixed(2)}</TableCell>
                      <TableCell>${stat.totalProfit.toFixed(2)}</TableCell>
                      <TableCell>${stat.averageProfit.toFixed(2)}</TableCell>
                      <TableCell>
                        {stat.totalRevenue > 0 ? ((stat.totalProfit / stat.totalRevenue) * 100).toFixed(1) : "0.0"}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
