export interface Order {
  id: string
  product: string
  price: number
  cost: number
  profit: number
  status: "pending" | "completed" | "rejected"
  timestamp: number
  date: string
  uid: string
  neteaseEmail?: string
  neteasePassword?: string
  email?: string
  password?: string
}

export interface ProductStats {
  product: string
  totalSales: number
  totalRevenue: number
  totalProfit: number
  averageProfit: number
  count: number
}

export interface Stats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  totalProfit: number
}

export interface Package {
  id: string
  name: string
  price: number
  cost: number
  description: string
  category: string
}

export interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
}
