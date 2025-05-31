export interface Order {
  id: string
  product: string
  price: number
  cost: number
  profit: number
  status: "pending" | "completed" | "rejected" | "approved"
  timestamp: number
  date: string
  uid: string
  neteaseEmail?: string
  neteasePassword?: string
  email?: string
  password?: string
  name?: string
  phone?: string
  address?: string
  items?: string
  total?: number
  createdAt?: string
  notes?: string
  orderType?: string
  firebaseKey?: string
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
  approvedOrders: number
  rejectedOrders: number
  totalRevenue: number
  totalProfit: number
  totalCost: number
  spentToday: number
  monthlySpending: number
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

export interface InvoiceEntry {
  id: string
  product: string
  price: number
  quantity: number
  customer: string
  timestamp: number
  invoiceNumber?: string
  total?: number
  subtotal?: number
  items?: InvoiceItem[]
  customerEmail?: string
  customerPhone?: string
  notes?: string
}

export interface InvoiceItem {
  name: string
  unitPrice: string
  quantity: string
  product?: string
  price?: number
}
