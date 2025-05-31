"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, Check, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
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

        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
          totalProfit,
        })
      } else {
        setOrders([])
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          totalProfit: 0,
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

  if (!authChecked || loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/admin/orders")}>Manage Orders</Button>
          <Button onClick={() => router.push("/admin/profit-analysis")}>Profit Analysis</Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>All orders in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending Orders</CardTitle>
            <CardDescription>Orders awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pendingOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Sum of all order values</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Manage your recent orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>${order.price}</TableCell>
                    <TableCell>${order.profit || 0}</TableCell>
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
                    <TableCell>{new Date(order.timestamp).toLocaleDateString()}</TableCell>
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

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Credentials</DialogTitle>
            <DialogDescription>Netease account credentials for this order</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                    toast({ title: "Copied to clipboard" })
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
                    toast({ title: "Copied to clipboard" })
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
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
                Profit ($)
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
