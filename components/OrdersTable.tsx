"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { database } from "@/lib/firebase"
import { ref, update } from "firebase/database"

interface Order {
  id: string
  uid: string
  product: string
  price: number
  cost: number
  customerName: string
  customerEmail: string
  customerPhone: string
  transactionId: string
  status: string
  timestamp: number
  date: string
  orderDate: string
}

interface OrdersTableProps {
  orders: Order[]
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const handleApprove = async (orderId: string) => {
    try {
      const orderRef = ref(database, `orders/${orderId}`)
      await update(orderRef, {
        status: "approved",
        approvedAt: new Date().toISOString(),
      })
      console.log(`Order ${orderId} approved successfully`)
    } catch (error) {
      console.error("Error approving order:", error)
    }
  }

  const handleReject = async (orderId: string) => {
    try {
      const orderRef = ref(database, `orders/${orderId}`)
      await update(orderRef, {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      })
      console.log(`Order ${orderId} rejected successfully`)
    } catch (error) {
      console.error("Error rejecting order:", error)
    }
  }

  // Sort orders by timestamp (newest first)
  const sortedOrders = [...orders].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null || isNaN(price)) {
      return "৳0"
    }
    return `৳${Number(price).toLocaleString()}`
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>UID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            sortedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.timestamp ? new Date(order.timestamp).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customerName || "N/A"}</div>
                    <div className="text-sm text-gray-500">{order.customerEmail || "N/A"}</div>
                  </div>
                </TableCell>
                <TableCell>{order.uid || "N/A"}</TableCell>
                <TableCell>{order.product || "N/A"}</TableCell>
                <TableCell>{formatPrice(order.price)}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      order.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : order.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.status === "pending" && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(order.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button size="sm" onClick={() => handleReject(order.id)} variant="destructive">
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default OrdersTable
