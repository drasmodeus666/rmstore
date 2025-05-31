import type { Order } from "@/types"

export interface Stats {
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  spentToday: number
  monthlySpending: number
}

export const calculateStats = (orders: Order[]): Stats => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const stats: Stats = {
    totalOrders: orders.length,
    pendingOrders: 0,
    approvedOrders: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    spentToday: 0,
    monthlySpending: 0,
  }

  orders.forEach((order) => {
    // Count by status
    if (order.status === "pending") {
      stats.pendingOrders++
    } else if (order.status === "approved") {
      stats.approvedOrders++
    }

    // Calculate financial metrics
    const price = Number(order.price) || 0
    const cost = Number(order.cost) || 0
    const profit = price - cost

    stats.totalRevenue += price
    stats.totalCost += cost
    stats.totalProfit += profit

    // Calculate today's spending
    const orderDate = new Date(order.timestamp)
    if (orderDate >= today) {
      stats.spentToday += cost
    }

    // Calculate monthly spending
    if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
      stats.monthlySpending += cost
    }
  })

  // Round all financial values to 2 decimal places
  stats.totalRevenue = Math.round(stats.totalRevenue * 100) / 100
  stats.totalCost = Math.round(stats.totalCost * 100) / 100
  stats.totalProfit = Math.round(stats.totalProfit * 100) / 100
  stats.spentToday = Math.round(stats.spentToday * 100) / 100
  stats.monthlySpending = Math.round(stats.monthlySpending * 100) / 100

  return stats
}
