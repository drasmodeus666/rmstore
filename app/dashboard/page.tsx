"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { database } from "@/lib/firebase"
import { ref, onValue, off } from "firebase/database"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MoreVertical, Pencil, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Order {
  id: string
  name: string
  email: string
  phone: string
  address: string
  items: string
  total: number
  status: string
  createdAt: string
  notes: string
  uid?: string
  password?: string
  orderType?: string
}

interface Stats {
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  spentToday: number
  monthlySpending: number
}

interface User {
  email: string | null
}

const DashboardPage = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    spentToday: 0,
    monthlySpending: 0,
  })
  const [currentUser, setCurrentUser] = useState<User>({ email: null })
  const [open, setOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [editItems, setEditItems] = useState("")
  const [editTotal, setEditTotal] = useState(0)
  const [editStatus, setEditStatus] = useState("")
  const [editNotes, setEditNotes] = useState("")

  useEffect(() => {
    // Check authentication
    const authStatus = localStorage.getItem("isAdminLoggedIn")
    if (authStatus !== "true") {
      console.log("No user logged in, redirecting to login")
      router.push("/login")
      return
    }

    console.log("User authenticated")
    setCurrentUser({ email: localStorage.getItem("adminEmail") })

    // Load orders from Firebase
    loadOrdersFromFirebase()
  }, [router])

  const loadOrdersFromFirebase = () => {
    try {
      const ordersRef = ref(database, "orders")
      const unsubscribe = onValue(
        ordersRef,
        (snapshot) => {
          const data = snapshot.val()
          console.log("Firebase data received:", data)

          if (data) {
            const ordersArray = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }))
            setOrders(ordersArray.reverse()) // Show newest first
            calculateStats(ordersArray)
            console.log("Orders loaded:", ordersArray)
          } else {
            setOrders([])
            setStats({
              totalOrders: 0,
              pendingOrders: 0,
              approvedOrders: 0,
              totalRevenue: 0,
              totalCost: 0,
              totalProfit: 0,
              spentToday: 0,
              monthlySpending: 0,
            })
            console.log("No orders found in Firebase")
          }
          setLoading(false)
        },
        (error) => {
          console.error("Firebase error:", error)
          toast({
            title: "Firebase Error",
            description: "Failed to load orders from Firebase. Check console for details.",
            variant: "destructive",
          })
          setLoading(false)
        },
      )

      // Cleanup function
      return () => off(ordersRef, "value", unsubscribe)
    } catch (error) {
      console.error("Error setting up Firebase listener:", error)
      toast({
        title: "Connection Error",
        description: "Failed to connect to Firebase database.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      localStorage.removeItem("isAdminLoggedIn")
      localStorage.removeItem("adminEmail")

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })

      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Logout Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const calculateStats = (orders: Order[]) => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter((order) => order.status === "pending").length
    const approvedOrders = orders.filter((order) => order.status === "approved").length
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0)
    const totalCost = orders.reduce((acc, order) => acc + order.total * 0.5, 0) // Assuming cost is 50% of total
    const totalProfit = totalRevenue - totalCost
    const today = new Date()
    const spentToday = orders
      .filter((order) => new Date(order.createdAt).toDateString() === today.toDateString())
      .reduce((acc, order) => acc + order.total, 0)
    const monthlySpending = orders
      .filter((order) => new Date(order.createdAt).getMonth() === today.getMonth())
      .reduce((acc, order) => acc + order.total, 0)

    setStats({
      totalOrders,
      pendingOrders,
      approvedOrders,
      totalRevenue,
      totalCost,
      totalProfit,
      spentToday,
      monthlySpending,
    })
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM dd, yyyy hh:mm a") // Format the date as needed
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  const handleOpen = (order: Order) => {
    setSelectedOrder(order)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedOrder(null)
  }

  const handleEdit = (order: Order) => {
    setEditOrder(order)
    setEditName(order.name)
    setEditEmail(order.email)
    setEditPhone(order.phone)
    setEditAddress(order.address)
    setEditItems(order.items)
    setEditTotal(order.total)
    setEditStatus(order.status)
    setEditNotes(order.notes)
  }

  const handleEditClose = () => {
    setEditOrder(null)
  }

  const handleEditSave = async () => {
    if (!editOrder) return

    try {
      const orderRef = ref(database, `orders/${editOrder.id}`)
      await set(orderRef, {
        ...editOrder,
        name: editName,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
        items: editItems,
        total: editTotal,
        status: editStatus,
        notes: editNotes,
      })

      toast({
        title: "Order Updated",
        description: "Order has been successfully updated.",
      })

      setEditOrder(null)
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Update Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (orderId: string) => {
    try {
      const orderRef = ref(database, `orders/${orderId}`)
      await remove(orderRef)

      toast({
        title: "Order Deleted",
        description: "Order has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: "Delete Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const set = async (orderRef: any, updates: Partial<Order>) => {
    try {
      await update(orderRef, updates)
    } catch (error) {
      console.error("Error updating data:", error)
      throw error
    }
  }

  const remove = async (orderRef: any) => {
    try {
      await deleteData(orderRef)
    } catch (error) {
      console.error("Error deleting data:", error)
      throw error
    }
  }

  const update = async (orderRef: any, updates: Partial<Order>) => {
    try {
      await set(orderRef, updates)
    } catch (error) {
      console.error("Error updating data:", error)
      throw error
    }
  }

  const deleteData = async (orderRef: any) => {
    try {
      await remove(orderRef)
    } catch (error) {
      console.error("Error deleting data:", error)
      throw error
    }
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>All orders in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
            <CardDescription>Orders waiting for approval</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approved Orders</CardTitle>
            <CardDescription>Orders that have been approved</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.approvedOrders}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Total income from all orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>A list of all orders in the system</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>{order.address}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>${order.total}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "pending"
                            ? "secondary"
                            : order.status === "approved"
                              ? "success"
                              : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleOpen(order)}>View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(order)}>
                            Edit
                            <Pencil className="ml-2 h-4 w-4" />
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" className="w-full">
                                  Delete
                                  <Trash className="ml-2 h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the order from our
                                    servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(order.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order Details</AlertDialogTitle>
            <AlertDialogDescription>Here are the details of the selected order.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input type="text" id="name" value={selectedOrder?.name || ""} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input type="email" id="email" value={selectedOrder?.email || ""} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input type="tel" id="phone" value={selectedOrder?.phone || ""} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input type="text" id="address" value={selectedOrder?.address || ""} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="items" className="text-right">
                Items
              </Label>
              <Textarea id="items" value={selectedOrder?.items || ""} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right">
                Total
              </Label>
              <Input type="number" id="total" value={selectedOrder?.total || 0} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Input type="text" id="status" value={selectedOrder?.status || ""} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea id="notes" value={selectedOrder?.notes || ""} readOnly className="col-span-3" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editOrder && (
        <AlertDialog open={!!editOrder} onOpenChange={() => handleEditClose()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Order</AlertDialogTitle>
              <AlertDialogDescription>Make changes to the order details.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  type="text"
                  id="address"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="items" className="text-right">
                  Items
                </Label>
                <Textarea
                  id="items"
                  value={editItems}
                  onChange={(e) => setEditItems(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="total" className="text-right">
                  Total
                </Label>
                <Input
                  type="number"
                  id="total"
                  value={editTotal}
                  onChange={(e) => setEditTotal(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Input
                  type="text"
                  id="status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleEditClose()}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleEditSave}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

export default DashboardPage
