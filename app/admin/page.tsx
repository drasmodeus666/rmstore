"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  Edit,
  Trash2,
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  LogOut,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth, database } from "@/lib/firebase"
import { ref, onValue, update, remove, off } from "firebase/database"
import { signOut, onAuthStateChanged } from "firebase/auth"
import type { Order, Stats } from "@/types"

export default function AdminPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCredentials, setShowCredentials] = useState(false)
  const [editingProfit, setEditingProfit] = useState(false)
  const [profitValue, setProfitValue] = useState(0)
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalCost: 0,
    spentToday: 0,
    monthlySpending: 0,
  })

  // Check authentication
  useEffect(() => {
    if (typeof window === "undefined") return

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
    if (!authChecked || typeof window === "undefined") return

    const ordersRef = ref(database, "orders")

    const handleOrdersValue = (snapshot: any) => {
      const data = snapshot.val()
      if (data) {
        const ordersArray = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        })) as Order[]

        setOrders(ordersArray)

        // Calculate stats
        const totalOrders = ordersArray.length
        const pendingOrders = ordersArray.filter((order) => order.status === "pending").length
        const completedOrders = ordersArray.filter(
          (order) => order.status === "completed" || order.status === "approved",
        ).length
        const totalRevenue = ordersArray.reduce((sum, order) => sum + (order.price || 0), 0)

        // Calculate profit properly (revenue - cost)
        const totalCost = ordersArray.reduce((sum, order) => sum + (order.cost || 0), 0)
        const totalProfit = totalRevenue - totalCost

        // Update each order's profit if not set
        ordersArray.forEach(async (order) => {
          if (
            order.price &&
            order.cost &&
            (order.profit === undefined || order.profit === null || order.profit === 0)
          ) {
            const calculatedProfit = order.price - order.cost
            const orderRef = ref(database, `orders/${order.id}`)
            await update(orderRef, { profit: calculatedProfit })
          }
        })

        // Calculate today's spending
        const today = new Date().toDateString()
        const spentToday = ordersArray
          .filter((order) => new Date(order.timestamp).toDateString() === today)
          .reduce((sum, order) => sum + (order.cost || 0), 0)

        // Calculate monthly spending
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const monthlySpending = ordersArray
          .filter((order) => {
            const orderDate = new Date(order.timestamp)
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
          })
          .reduce((sum, order) => sum + (order.cost || 0), 0)

        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
          totalProfit,
          totalCost,
          spentToday,
          monthlySpending,
        })
      } else {
        setOrders([])
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          totalProfit: 0,
          totalCost: 0,
          spentToday: 0,
          monthlySpending: 0,
        })
      }
      setLoading(false)
    }

    onValue(ordersRef, handleOrdersValue)

    return () => {
      off(ordersRef, "value", handleOrdersValue)
    }
  }, [authChecked])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/admin/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleViewCredentials = (order: Order) => {
    setSelectedOrder(order)
    setShowCredentials(true)
  }

  const handleApproveOrder = async (orderId: string) => {
    try {
      const orderRef = ref(database, `orders/${orderId}`)
      await update(orderRef, { status: "completed" })
      toast({
        title: "Order Approved",
        description: "The order has been approved successfully.",
      })
    } catch (error) {
      console.error("Error approving order:", error)
      toast({
        title: "Error",
        description: "Failed to approve order.",
        variant: "destructive",
      })
    }
  }

  const handleRejectOrder = async (orderId: string) => {
    try {
      const orderRef = ref(database, `orders/${orderId}`)
      await update(orderRef, { status: "rejected" })
      toast({
        title: "Order Rejected",
        description: "The order has been rejected.",
      })
    } catch (error) {
      console.error("Error rejecting order:", error)
      toast({
        title: "Error",
        description: "Failed to reject order.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const orderRef = ref(database, `orders/${orderId}`)
      await remove(orderRef)
      toast({
        title: "Order Deleted",
        description: "The order has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: "Error",
        description: "Failed to delete order.",
        variant: "destructive",
      })
    }
  }

  const handleEditProfit = (order: Order) => {
    setSelectedOrder(order)
    setProfitValue(order.profit || 0)
    setEditingProfit(true)
  }

  const handleSaveProfit = async () => {
    if (!selectedOrder) return

    try {
      const orderRef = ref(database, `orders/${selectedOrder.id}`)
      await update(orderRef, { profit: profitValue })
      setEditingProfit(false)
      toast({
        title: "Profit Updated",
        description: "The profit has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profit:", error)
      toast({
        title: "Error",
        description: "Failed to update profit.",
        variant: "destructive",
      })
    }
  }

  // Check if order is a UID purchase
  const isUidPurchase = (order: Order | null | undefined): boolean => {
    if (!order || !order.product) return false
    try {
      return order.product.toLowerCase().includes("uid") || Boolean(order.uid)
    } catch (error) {
      console.error("Error checking UID purchase:", error)
      return false
    }
  }

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Racing Master Dashboard</h1>
            <p className="text-gray-400">Welcome back, xrupture.tw@gmail.com</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-white border-gray-600">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 mb-6">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-gray-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-white data-[state=active]:bg-gray-700">
              Orders
            </TabsTrigger>
            <TabsTrigger value="spending" className="text-white data-[state=active]:bg-gray-700">
              Spending
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-gray-700">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-white data-[state=active]:bg-gray-700">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Package className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Orders</p>
                      <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Pending</p>
                      <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Approved</p>
                      <p className="text-2xl font-bold text-white">{stats.completedOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Revenue</p>
                      <p className="text-2xl font-bold text-white">৳{stats.totalRevenue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Cost</p>
                      <p className="text-2xl font-bold text-white">৳{stats.totalCost.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Profit</p>
                      <p className="text-2xl font-bold text-white">৳{stats.totalProfit.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Spent Today</p>
                      <p className="text-2xl font-bold text-white">৳{stats.spentToday.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Spending Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Monthly Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">৳{stats.monthlySpending.toFixed(1)}</div>
                <p className="text-gray-400">Current month total costs</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-400">Customer</TableHead>
                        <TableHead className="text-gray-400">UID/Type</TableHead>
                        <TableHead className="text-gray-400">Product</TableHead>
                        <TableHead className="text-gray-400">Price</TableHead>
                        <TableHead className="text-gray-400">Cost</TableHead>
                        <TableHead className="text-gray-400">Profit</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-gray-700">
                          <TableCell className="text-white">
                            {order.timestamp ? new Date(order.timestamp).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell className="text-white">
                            <div>
                              <div className="font-medium">{order.customerName || order.name || "N/A"}</div>
                              <div className="text-sm text-gray-400">{order.customerEmail || order.email || "N/A"}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            {isUidPurchase(order) ? (
                              <div className="flex items-center gap-2">
                                <span className="text-purple-400">🎮</span>
                                <span>In-Game</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-blue-400">🆔</span>
                                <span>UID</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-white">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                              {order.product || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="text-blue-400 font-medium">৳{order.price || 0}</TableCell>
                          <TableCell className="text-red-400 font-medium">৳{order.cost || 0}</TableCell>
                          <TableCell className="text-green-400 font-medium">
                            ৳{(order.profit || (order.price && order.cost ? order.price - order.cost : 0)).toFixed(1)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                order.status === "pending"
                                  ? "bg-yellow-600 text-white"
                                  : order.status === "completed" || order.status === "approved"
                                    ? "bg-green-600 text-white"
                                    : "bg-red-600 text-white"
                              }
                            >
                              {order.status || "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-purple-600 hover:bg-purple-700 border-purple-600"
                                onClick={() => handleViewCredentials(order)}
                              >
                                <Eye className="h-4 w-4 text-white" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-blue-600 hover:bg-blue-700 border-blue-600"
                                onClick={() => handleEditProfit(order)}
                              >
                                <Edit className="h-4 w-4 text-white" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-red-600 hover:bg-red-700 border-red-600"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spending">
            <div className="text-white">Spending analytics coming soon...</div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="text-white">Analytics dashboard coming soon...</div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-white">Reports section coming soon...</div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isUidPurchase(selectedOrder) ? "UID Information" : "Account Credentials"}</DialogTitle>
            <DialogDescription>
              {isUidPurchase(selectedOrder)
                ? "UID details for this order"
                : "Netease account credentials for this order"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isUidPurchase(selectedOrder) ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="uid" className="text-right">
                  UID
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input id="uid" value={selectedOrder?.uid || ""} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const uid = selectedOrder?.uid || ""
                      navigator.clipboard.writeText(uid)
                      toast({ title: "UID copied to clipboard" })
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="email"
                      value={selectedOrder?.neteaseEmail || selectedOrder?.email || ""}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const email = selectedOrder?.neteaseEmail || selectedOrder?.email || ""
                        navigator.clipboard.writeText(email)
                        toast({ title: "Email copied to clipboard" })
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="password"
                      value={selectedOrder?.neteasePassword || selectedOrder?.password || ""}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const password = selectedOrder?.neteasePassword || selectedOrder?.password || ""
                        navigator.clipboard.writeText(password)
                        toast({ title: "Password copied to clipboard" })
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profit Dialog */}
      <Dialog open={editingProfit} onOpenChange={setEditingProfit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profit</DialogTitle>
            <DialogDescription>Update the profit for this order</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profit" className="text-right">
                Profit (৳)
              </Label>
              <Input
                id="profit"
                type="number"
                value={profitValue}
                onChange={(e) => setProfitValue(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
