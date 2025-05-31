"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatsCard from "@/components/StatsCard"
import type { Order, Stats } from "@/types"

// Dynamic imports to avoid SSR issues
const AdminDashboard = () => {
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

  // Dynamic Firebase imports
  useEffect(() => {
    const initializeFirebase = async () => {
      if (typeof window === "undefined") return

      try {
        const { auth, database } = await import("@/lib/firebase")
        const { onAuthStateChanged, signOut } = await import("firebase/auth")
        const { ref, onValue, update, remove, off } = await import("firebase/database")

        // Check authentication
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            router.push("/admin/login")
          } else {
            setAuthChecked(true)
          }
        })

        // Load orders when authenticated
        if (authChecked) {
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
              const completedOrders = ordersArray.filter((order) => order.status === "completed").length
              const totalRevenue = ordersArray.reduce((sum, order) => sum + (order.price || 0), 0)
              const totalProfit = ordersArray.reduce((sum, order) => sum + (order.profit || 0), 0)
              const totalCost = ordersArray.reduce((sum, order) => sum + (order.cost || 0), 0)

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
            unsubscribe()
          }
        }

        return () => unsubscribe()
      } catch (error) {
        console.error("Firebase initialization error:", error)
        setLoading(false)
      }
    }

    initializeFirebase()
  }, [router, authChecked])

  const handleLogout = async () => {
    try {
      const { auth } = await import("@/lib/firebase")
      const { signOut } = await import("firebase/auth")
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
      const { database } = await import("@/lib/firebase")
      const { ref, update } = await import("firebase/database")
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
      const { database } = await import("@/lib/firebase")
      const { ref, update } = await import("firebase/database")
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
      const { database } = await import("@/lib/firebase")
      const { ref, remove } = await import("firebase/database")
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
      const { database } = await import("@/lib/firebase")
      const { ref, update } = await import("firebase/database")
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
  const isUidPurchase = (order: Order) => {
    return order.product && (order.product.toLowerCase().includes("uid") || order.uid)
  }

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Racing Master Dashboard</h1>
            <p className="text-gray-400">Welcome back, xrupture.tw@gmail.com</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-white border-gray-600">
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
              <StatsCard title="Total Orders" value={stats.totalOrders} icon={<Package />} color="blue" />
              <StatsCard title="Pending" value={stats.pendingOrders} icon={<Clock />} color="yellow" />
              <StatsCard title="Approved" value={stats.completedOrders} icon={<CheckCircle />} color="green" />
              <StatsCard title="Revenue" value={stats.totalRevenue} icon={<DollarSign />} color="blue" isMoney={true} />
              <StatsCard
                title="Total Cost"
                value={stats.totalCost}
                icon={<TrendingDown />}
                color="red"
                isMoney={true}
              />
              <StatsCard title="Profit" value={stats.totalProfit} icon={<TrendingUp />} color="blue" isMoney={true} />
              <StatsCard
                title="Spent Today"
                value={stats.spentToday}
                icon={<Calendar />}
                color="orange"
                isMoney={true}
              />
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
                <CardDescription className="text-gray-400">Manage your recent orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">Order ID</TableHead>
                        <TableHead className="text-gray-400">Product</TableHead>
                        <TableHead className="text-gray-400">Price</TableHead>
                        <TableHead className="text-gray-400">Profit</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-gray-700">
                          <TableCell className="font-medium text-white">{order.id.substring(0, 8)}</TableCell>
                          <TableCell className="text-white">{order.product}</TableCell>
                          <TableCell className="text-white">৳{order.price}</TableCell>
                          <TableCell className="text-white">৳{order.profit || 0}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "pending"
                                  ? "outline"
                                  : order.status === "completed"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{new Date(order.timestamp).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-red-50"
                                onClick={() => handleViewCredentials(order)}
                              >
                                <Eye className="h-4 w-4 text-red-500" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-green-50"
                                onClick={() => handleApproveOrder(order.id)}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-red-50"
                                onClick={() => handleRejectOrder(order.id)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-blue-50"
                                onClick={() => handleEditProfit(order)}
                              >
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-red-50"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
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
            <DialogTitle>{isUidPurchase(selectedOrder!) ? "UID Information" : "Account Credentials"}</DialogTitle>
            <DialogDescription>
              {isUidPurchase(selectedOrder!)
                ? "UID details for this order"
                : "Netease account credentials for this order"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isUidPurchase(selectedOrder!) ? (
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

export default AdminDashboard
