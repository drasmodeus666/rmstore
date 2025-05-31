"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Eye,
  Edit,
  Trash2,
  Package,
  Clock,
  DollarSign,
  TrendingUp,
  LogOut,
  Plus,
  Percent,
  Tag,
  Settings,
  BarChart3,
  ShoppingBag,
  Crown,
  Sparkles,
} from "lucide-react"

interface Order {
  id: string
  customerName?: string
  customerEmail?: string
  name?: string
  email?: string
  product?: string
  price?: number
  cost?: number
  profit?: number
  status?: string
  timestamp?: string
  uid?: string
  neteaseEmail?: string
  neteasePassword?: string
}

interface Stats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  totalProfit: number
  totalCost: number
  spentToday: number
  monthlySpending: number
}

interface Discount {
  id: string
  title: string
  percentage: number
  type: "uid" | "in-game"
  duration: number
  createdAt: number
  expiresAt: number
  isActive: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCredentials, setShowCredentials] = useState(false)
  const [showDiscountDialog, setShowDiscountDialog] = useState(false)
  const [discountForm, setDiscountForm] = useState({
    title: "",
    percentage: 0,
    type: "uid" as "uid" | "in-game",
    duration: 7,
  })
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

  // Check authentication using localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isAdminLoggedIn")
      if (isLoggedIn !== "true") {
        router.push("/admin/login")
      } else {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [router])

  // Load data from localStorage
  useEffect(() => {
    if (!authChecked || typeof window === "undefined") return

    const loadData = () => {
      try {
        // Load orders
        const savedOrders = localStorage.getItem("orders")
        let ordersData: Order[] = []

        if (savedOrders) {
          ordersData = JSON.parse(savedOrders)
        } else {
          // Create sample orders
          ordersData = [
            {
              id: "1",
              customerName: "John Doe",
              customerEmail: "john@example.com",
              product: "Racing Master UID Package",
              price: 500,
              cost: 300,
              profit: 200,
              status: "completed",
              timestamp: new Date().toISOString(),
              uid: "123456789",
            },
            {
              id: "2",
              customerName: "Jane Smith",
              customerEmail: "jane@example.com",
              product: "Ruby Keys Package",
              price: 800,
              cost: 500,
              profit: 300,
              status: "pending",
              timestamp: new Date().toISOString(),
              neteaseEmail: "jane.netease@example.com",
              neteasePassword: "password123",
            },
          ]
          localStorage.setItem("orders", JSON.stringify(ordersData))
        }

        // Load discounts
        const savedDiscounts = localStorage.getItem("discounts")
        let discountsData: Discount[] = []

        if (savedDiscounts) {
          discountsData = JSON.parse(savedDiscounts)
          // Filter out expired discounts
          discountsData = discountsData.filter((d) => d.expiresAt > Date.now())
        }

        setOrders(ordersData)
        setDiscounts(discountsData)

        // Calculate stats
        const totalOrders = ordersData.length
        const pendingOrders = ordersData.filter((order) => order.status === "pending").length
        const completedOrders = ordersData.filter((order) => order.status === "completed").length
        const totalRevenue = ordersData.reduce((sum, order) => sum + (order.price || 0), 0)
        const totalCost = ordersData.reduce((sum, order) => sum + (order.cost || 0), 0)
        const totalProfit = totalRevenue - totalCost

        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
          totalProfit,
          totalCost,
          spentToday: 300,
          monthlySpending: 5000,
        })

        setLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [authChecked])

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn")
    localStorage.removeItem("adminEmail")
    router.push("/admin/login")
  }

  const handleCreateDiscount = () => {
    if (!discountForm.title || !discountForm.percentage) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      const newDiscount: Discount = {
        id: Date.now().toString(),
        title: discountForm.title,
        percentage: discountForm.percentage,
        type: discountForm.type,
        duration: discountForm.duration,
        createdAt: Date.now(),
        expiresAt: Date.now() + discountForm.duration * 24 * 60 * 60 * 1000,
        isActive: true,
      }

      const updatedDiscounts = [...discounts, newDiscount]
      setDiscounts(updatedDiscounts)
      localStorage.setItem("discounts", JSON.stringify(updatedDiscounts))

      setShowDiscountDialog(false)
      setDiscountForm({ title: "", percentage: 0, type: "uid", duration: 7 })

      toast({
        title: "Discount Created",
        description: "The discount has been created successfully.",
      })
    } catch (error) {
      console.error("Error creating discount:", error)
      toast({
        title: "Error",
        description: "Failed to create discount.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDiscount = (discountId: string) => {
    try {
      const updatedDiscounts = discounts.filter((d) => d.id !== discountId)
      setDiscounts(updatedDiscounts)
      localStorage.setItem("discounts", JSON.stringify(updatedDiscounts))

      toast({
        title: "Discount Deleted",
        description: "The discount has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting discount:", error)
      toast({
        title: "Error",
        description: "Failed to delete discount.",
        variant: "destructive",
      })
    }
  }

  const handleViewCredentials = (order: Order) => {
    setSelectedOrder(order)
    setShowCredentials(true)
  }

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
        <div className="relative z-10 p-6">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-8 w-64 bg-white/10" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Skeleton className="h-32 bg-white/10" />
              <Skeleton className="h-32 bg-white/10" />
              <Skeleton className="h-32 bg-white/10" />
              <Skeleton className="h-32 bg-white/10" />
            </div>
            <Skeleton className="h-96 bg-white/10" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl animate-pulse"
            style={{
              left: `${20 + i * 20}%`,
              top: `${10 + i * 15}%`,
              animationDelay: `${i * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Premium Header */}
        <div className="border-b border-white/10 backdrop-blur-xl bg-black/20 px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Racing Master Dashboard
                </h1>
                <p className="text-purple-200/80">Welcome back, xrupture.tw@gmail.com</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Premium Navigation Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-xl border border-white/10 mb-8 h-14">
              <TabsTrigger
                value="overview"
                className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="discounts"
                className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium"
              >
                <Percent className="h-4 w-4 mr-2" />
                Discounts
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Premium Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-200 text-sm font-medium">Total Orders</p>
                        <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                        <p className="text-blue-300/60 text-xs">+12% from last month</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-200 text-sm font-medium">Pending</p>
                        <p className="text-3xl font-bold text-white">{stats.pendingOrders}</p>
                        <p className="text-yellow-300/60 text-xs">Awaiting approval</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-200 text-sm font-medium">Revenue</p>
                        <p className="text-3xl font-bold text-white">৳{stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-green-300/60 text-xs">+8% from last week</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-200 text-sm font-medium">Profit</p>
                        <p className="text-3xl font-bold text-white">৳{stats.totalProfit.toLocaleString()}</p>
                        <p className="text-purple-300/60 text-xs">+15% margin</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Discounts Preview */}
              {discounts.length > 0 && (
                <Card className="bg-gradient-to-br from-pink-500/10 to-purple-600/5 border-pink-500/20 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-pink-400" />
                      Active Discounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {discounts.map((discount) => (
                        <div key={discount.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                              {discount.percentage}% OFF
                            </Badge>
                            <Badge variant="outline" className="text-white border-white/20">
                              {discount.type === "uid" ? "UID" : "In-Game"}
                            </Badge>
                          </div>
                          <h3 className="text-white font-medium">{discount.title}</h3>
                          <p className="text-gray-400 text-sm">
                            Expires: {new Date(discount.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="orders">
              <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-gray-300">Date</TableHead>
                          <TableHead className="text-gray-300">Customer</TableHead>
                          <TableHead className="text-gray-300">Type</TableHead>
                          <TableHead className="text-gray-300">Product</TableHead>
                          <TableHead className="text-gray-300">Price</TableHead>
                          <TableHead className="text-gray-300">Profit</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} className="border-white/5 hover:bg-white/5">
                            <TableCell className="text-white">
                              {order.timestamp ? new Date(order.timestamp).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell className="text-white">
                              <div>
                                <div className="font-medium">{order.customerName || order.name || "N/A"}</div>
                                <div className="text-sm text-gray-400">
                                  {order.customerEmail || order.email || "N/A"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {order.uid ? "UID" : "In-Game"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white">{order.product || "N/A"}</TableCell>
                            <TableCell className="text-green-400 font-medium">৳{order.price || 0}</TableCell>
                            <TableCell className="text-purple-400 font-medium">
                              ৳{(order.profit || (order.price && order.cost ? order.price - order.cost : 0)).toFixed(1)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  order.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                    : order.status === "completed"
                                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                                      : "bg-red-500/20 text-red-300 border-red-500/30"
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
                                  className="h-8 w-8 bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30"
                                  onClick={() => handleViewCredentials(order)}
                                >
                                  <Eye className="h-4 w-4 text-purple-300" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
                                >
                                  <Edit className="h-4 w-4 text-blue-300" />
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

            <TabsContent value="discounts">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Discount Management</h2>
                  <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Discount
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/90 border-white/20 backdrop-blur-xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New Discount</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Add a new discount for your products
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right text-white">
                            Title
                          </Label>
                          <Input
                            id="title"
                            placeholder="e.g., EID Special"
                            value={discountForm.title}
                            onChange={(e) => setDiscountForm({ ...discountForm, title: e.target.value })}
                            className="col-span-3 bg-white/5 border-white/20 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="percentage" className="text-right text-white">
                            Percentage
                          </Label>
                          <Input
                            id="percentage"
                            type="number"
                            placeholder="5"
                            value={discountForm.percentage}
                            onChange={(e) => setDiscountForm({ ...discountForm, percentage: Number(e.target.value) })}
                            className="col-span-3 bg-white/5 border-white/20 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="type" className="text-right text-white">
                            Apply To
                          </Label>
                          <Select
                            value={discountForm.type}
                            onValueChange={(value: "uid" | "in-game") =>
                              setDiscountForm({ ...discountForm, type: value })
                            }
                          >
                            <SelectTrigger className="col-span-3 bg-white/5 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/20">
                              <SelectItem value="uid">UID Purchases</SelectItem>
                              <SelectItem value="in-game">In-Game Purchases</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="duration" className="text-right text-white">
                            Duration (days)
                          </Label>
                          <Input
                            id="duration"
                            type="number"
                            placeholder="7"
                            value={discountForm.duration}
                            onChange={(e) => setDiscountForm({ ...discountForm, duration: Number(e.target.value) })}
                            className="col-span-3 bg-white/5 border-white/20 text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handleCreateDiscount}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          Create Discount
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Active Discounts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {discounts.length === 0 ? (
                      <div className="text-center py-8">
                        <Percent className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No active discounts</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {discounts.map((discount) => (
                          <div
                            key={discount.id}
                            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                  <Tag className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-white">{discount.title}</h3>
                                  <p className="text-gray-400">
                                    {discount.percentage}% off on {discount.type === "uid" ? "UID" : "In-Game"}{" "}
                                    purchases
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Expires: {new Date(discount.expiresAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                                  Active
                                </Badge>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => handleDeleteDiscount(discount.id)}
                                  className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
                                >
                                  <Trash2 className="h-4 w-4 text-red-300" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-20">
                <BarChart3 className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h3>
                <p className="text-gray-400">Coming soon with detailed insights and reports</p>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="text-center py-20">
                <Settings className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">System Settings</h3>
                <p className="text-gray-400">Configure your dashboard preferences</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="bg-black/90 border-white/20 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedOrder?.uid ? "UID Information" : "Account Credentials"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedOrder?.uid ? "UID details for this order" : "Netease account credentials for this order"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedOrder?.uid ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="uid" className="text-right text-white">
                  UID
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="uid"
                    value={selectedOrder?.uid || ""}
                    readOnly
                    className="flex-1 bg-white/5 border-white/20 text-white"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const uid = selectedOrder?.uid || ""
                      navigator.clipboard.writeText(uid)
                      toast({ title: "UID copied to clipboard" })
                    }}
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-white">
                    Email
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="email"
                      value={selectedOrder?.neteaseEmail || selectedOrder?.email || ""}
                      readOnly
                      className="flex-1 bg-white/5 border-white/20 text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const email = selectedOrder?.neteaseEmail || selectedOrder?.email || ""
                        navigator.clipboard.writeText(email)
                        toast({ title: "Email copied to clipboard" })
                      }}
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right text-white">
                    Password
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="password"
                      value={selectedOrder?.neteasePassword || ""}
                      readOnly
                      className="flex-1 bg-white/5 border-white/20 text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const password = selectedOrder?.neteasePassword || ""
                        navigator.clipboard.writeText(password)
                        toast({ title: "Password copied to clipboard" })
                      }}
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
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
    </div>
  )
}
