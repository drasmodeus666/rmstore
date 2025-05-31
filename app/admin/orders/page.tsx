"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Eye, Check, X, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { auth, database } from "@/lib/firebase"
import { ref, onValue, update, remove, off } from "firebase/database"
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
  uid: string
  neteaseEmail?: string
  neteasePassword?: string
  email?: string
  password?: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCredentials, setShowCredentials] = useState(false)
  const [filter, setFilter] = useState("all")

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
        }))

        setOrders(ordersArray)
      } else {
        setOrders([])
      }
      setLoading(false)
    }

    onValue(ordersRef, handleOrdersValue)

    // Set up auto-refresh every 10 seconds
    const intervalId = setInterval(() => {
      onValue(ordersRef, handleOrdersValue, { onlyOnce: true })
    }, 10000)

    return () => {
      off(ordersRef, "value", handleOrdersValue)
      clearInterval(intervalId)
    }
  }, [authChecked])

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

  const filteredOrders = filter === "all" ? orders : orders.filter((order) => order.status === filter)

  if (!authChecked || loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <Button onClick={() => router.push("/admin")}>Back to Dashboard</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
          <CardDescription>Filter orders by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
              All Orders
            </Button>
            <Button variant={filter === "pending" ? "default" : "outline"} onClick={() => setFilter("pending")}>
              Pending
            </Button>
            <Button variant={filter === "completed" ? "default" : "outline"} onClick={() => setFilter("completed")}>
              Completed
            </Button>
            <Button variant={filter === "rejected" ? "default" : "outline"} onClick={() => setFilter("rejected")}>
              Rejected
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
          <CardDescription>
            {filter === "all" ? "All orders" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} orders`}
          </CardDescription>
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
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
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
                            disabled={order.status === "completed"}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 bg-red-50"
                            onClick={() => handleRejectOrder(order.id)}
                            disabled={order.status === "rejected"}
                          >
                            <X className="h-4 w-4 text-red-500" />
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
                  ))
                )}
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
                    navigator.clipboard.writeText(selectedOrder?.neteaseEmail || selectedOrder?.email || "")
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
                    navigator.clipboard.writeText(selectedOrder?.neteasePassword || selectedOrder?.password || "")
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
    </div>
  )
}
