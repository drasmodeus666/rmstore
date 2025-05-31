import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory storage for demo (in production, use a real database)
const orders: any[] = []

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Add timestamp and ID
    const order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      createdAt: new Date().toLocaleDateString(),
    }

    // Store the order
    orders.push(order)

    console.log("Order saved:", order)

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Error saving order:", error)
    return NextResponse.json({ success: false, error: "Failed to save order" }, { status: 500 })
  }
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}
