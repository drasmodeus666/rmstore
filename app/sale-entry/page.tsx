"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, CheckCircle, Clock, User, Package } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"

interface Order {
  id: string
  uid: string
  product: string
  price: number
  cost: number
  transactionId: string
  paymentMethod: string
  status: "pending" | "approved" | "rejected"
  timestamp: number
  date: string
}

export default function SaleEntry() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = () => {
    setRefreshing(true)
    const ordersRef = ref(database, "orders")

    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val()
      const ordersArray: Order[] = []

      if (data) {
        Object.keys(data).forEach((key) => {
          ordersArray.push({
            id: key,
            ...data[key],
          })
        })
      }

      // Sort by timestamp (newest first) and filter approved orders
      const approvedOrders = ordersArray
        .filter((order) => order.status === "approved")
        .sort((a, b) => b.timestamp - a.timestamp)

      setOrders(approvedOrders)
      setLoading(false)
      setRefreshing(false)
    })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 text-white">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      <Toaster />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
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
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Completed Orders
                </h1>
                <p className="text-gray-400">View all processed sales</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative container mx-auto py-12 px-6">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div>
              <h2 className="text-2xl font-bold text-white">Sales History</h2>
              <p className="text-gray-400 mt-2">All approved and completed orders</p>
            </div>
            <Button
              variant="outline"
              onClick={fetchOrders}
              disabled={refreshing}
              className="flex items-center gap-2 text-white border-white/20 hover:bg-white/10 rounded-xl"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6"
          >
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : orders.length > 0 ? (
              orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-white">{order.product}</CardTitle>
                            <p className="text-gray-400 flex items-center gap-2 mt-1">
                              <Clock className="h-4 w-4" />
                              {formatDate(order.timestamp)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="space-y-2">
                          <p className="text-gray-400 text-sm flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Customer UID
                          </p>
                          <p className="font-semibold text-white text-lg">{order.uid}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-400 text-sm">Sale Price</p>
                          <p className="font-bold text-green-400 text-xl">৳{order.price.toLocaleString()}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-400 text-sm">Cost</p>
                          <p className="font-semibold text-red-400 text-lg">৳{order.cost?.toFixed(2) || "0.00"}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-400 text-sm">Profit</p>
                          <p className="font-bold text-emerald-400 text-xl">
                            ৳{((order.price || 0) - (order.cost || 0)).toFixed(2)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-400 text-sm">Transaction ID</p>
                          <p className="font-mono text-white bg-white/5 px-3 py-1 rounded-lg text-sm">
                            {order.transactionId}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Completed Orders</h3>
                <p className="text-gray-400 text-lg">Completed orders will appear here after admin approval.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
