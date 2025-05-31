"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { database } from "../../firebase"
import { ref, onValue, update, push, remove } from "firebase/database"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Order {
  id: string
  uid: string
  product: string
  price: number
  cost: number
  status: "pending" | "approved" | "rejected"
  timestamp: number
  date: string
  firebaseKey?: string
}

interface Stats {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  pendingOrders: number
  approvedOrders: number
  rejectedOrders: number
}

const OrdersPage = () => {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
  })

  useEffect(() => {
    // Check authentication
    const authStatus = localStorage.getItem("isAdminLoggedIn")
    if (authStatus !== "true") {
      router.push("/login")
      return
    }
  }, [router])

  useEffect(() => {
    // Load orders from Firebase
    const loadOrders = () => {
      try {
        const ordersRef = ref(database, "orders")
        onValue(ordersRef, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            const ordersArray = Object.entries(data).map(([key, value]: [string, any]) => ({
              ...value,
              firebaseKey: key,
            }))
            setOrders(ordersArray)
            calculateStats(ordersArray)
          } else {
            setOrders([])
            calculateStats([])
          }
          setLoading(false)
        })
      } catch (error) {
        console.log("Firebase error, using fallback:", error)
        setOrders([])
        calculateStats([])
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const calculateStats = (orders: Order[]) => {
    let totalRevenue = 0
    let totalCost = 0
    let totalProfit = 0
    let pendingOrders = 0
    let approvedOrders = 0
    let rejectedOrders = 0

    orders.forEach((order) => {
      totalRevenue += order.price
      totalCost += order.cost
      totalProfit += order.price - order.cost

      if (order.status === "pending") pendingOrders++
      else if (order.status === "approved") approvedOrders++
      else if (order.status === "rejected") rejectedOrders++
    })

    setStats({
      totalRevenue,
      totalCost,
      totalProfit,
      pendingOrders,
      approvedOrders,
      rejectedOrders,
    })
  }

  const updateOrderStatus = async (orderId: string, newStatus: "approved" | "rejected", firebaseKey?: string) => {
    try {
      if (firebaseKey) {
        // Update in Firebase
        const orderRef = ref(database, `orders/${firebaseKey}`)
        await update(orderRef, { status: newStatus })

        // If approved, create statement
        if (newStatus === "approved") {
          const order = orders.find((o) => o.id === orderId)
          if (order) {
            const statementEntry = {
              uid: order.uid,
              product: order.product,
              price: order.price,
              cost: order.cost,
              profit: order.price - order.cost,
              timestamp: Date.now(),
              date: new Date().toISOString(),
              type: "sale",
              orderId: order.id,
            }

            const statementsRef = ref(database, "statements")
            await push(statementsRef, statementEntry)
          }
        }
      }

      toast({
        title: "Order Updated",
        description: `Order has been ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    }
  }

  const deleteOrder = async (orderId: string, firebaseKey?: string) => {
    try {
      if (firebaseKey) {
        // Delete from Firebase
        const orderRef = ref(database, `orders/${firebaseKey}`)
        await remove(orderRef)
      }

      toast({
        title: "Order Deleted",
        description: "Order has been permanently deleted",
      })
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white shadow-md rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          {loading ? <Skeleton className="h-6 w-24" /> : <p className="text-2xl">${stats.totalRevenue.toFixed(2)}</p>}
        </div>
        <div className="bg-white shadow-md rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">Total Cost</h3>
          {loading ? <Skeleton className="h-6 w-24" /> : <p className="text-2xl">${stats.totalCost.toFixed(2)}</p>}
        </div>
        <div className="bg-white shadow-md rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">Total Profit</h3>
          {loading ? <Skeleton className="h-6 w-24" /> : <p className="text-2xl">${stats.totalProfit.toFixed(2)}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white shadow-md rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">Pending Orders</h3>
          {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl">{stats.pendingOrders}</p>}
        </div>
        <div className="bg-white shadow-md rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">Approved Orders</h3>
          {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl">{stats.approvedOrders}</p>}
        </div>
        <div className="bg-white shadow-md rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">Rejected Orders</h3>
          {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl">{stats.rejectedOrders}</p>}
        </div>
      </div>

      <Table>
        <TableCaption>A list of your recent orders.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Order ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[50px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[50px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.uid}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell>${order.price}</TableCell>
                <TableCell>${order.cost}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "pending" ? "secondary" : order.status === "approved" ? "success" : "destructive"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "approved", order.firebaseKey)}>
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "rejected", order.firebaseKey)}>
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => deleteOrder(order.id, order.firebaseKey)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default OrdersPage
