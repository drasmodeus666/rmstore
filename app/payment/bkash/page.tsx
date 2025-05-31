"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CreditCard, Shield, Clock, Copy, Check, User, Calculator } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { database } from "@/lib/firebase"
import { ref, push } from "firebase/database"
import { motion } from "framer-motion"

export default function BkashPaymentPage() {
  const router = useRouter()

  const [orderData, setOrderData] = useState<any>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [bkashLastDigits, setBkashLastDigits] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const bkashNumber = "01818618349"
  const TAX_RATE = 0.15 // 15% tax

  useEffect(() => {
    // Get order data from localStorage
    const storedOrder = localStorage.getItem("pendingOrder")
    if (storedOrder) {
      const parsedOrder = JSON.parse(storedOrder)
      setOrderData(parsedOrder)
    } else {
      // If no order data, redirect back to home
      router.push("/")
    }
  }, [router])

  const calculateTax = (price: number) => {
    return price * TAX_RATE
  }

  const calculateTotal = (price: number) => {
    return price + calculateTax(price)
  }

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(bkashNumber)
      setCopied(true)
      toast({
        title: "📋 Copied!",
        description: "bKash number copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the number manually: " + bkashNumber,
        variant: "destructive",
      })
    }
  }

  const handlePayment = async () => {
    if (!orderData) {
      toast({
        title: "Error",
        description: "Order data not found. Please start over.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Validation
    if (!customerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name",
        variant: "destructive",
      })
      return
    }

    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter your bKash transaction ID",
        variant: "destructive",
      })
      return
    }

    if (!bkashLastDigits.trim() || bkashLastDigits.length !== 3) {
      toast({
        title: "bKash Last 3 Digits Required",
        description: "Please enter the last 3 digits of your bKash number",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const basePrice = orderData.price
      const tax = calculateTax(basePrice)
      const totalPrice = calculateTotal(basePrice)

      // Create complete order object
      const completeOrderData = {
        uid: orderData.uid || null,
        neteaseEmail: orderData.email || null, // Changed from 'email' to 'neteaseEmail'
        neteasePassword: orderData.password || null, // Changed from 'password' to 'neteasePassword'
        product: orderData.product,
        basePrice: basePrice,
        tax: tax,
        price: totalPrice, // Total price including tax
        cost: orderData.cost,
        customerName: customerName.trim(),
        customerEmail: customerName.trim() + "@temp.com", // Required by Firebase rules
        customerPhone: customerPhone.trim(),
        transactionId: transactionId.trim(),
        bkashLastDigits: bkashLastDigits.trim(),
        paymentMethod: "bKash",
        status: "pending",
        timestamp: Date.now(),
        date: new Date().toISOString(),
        createdAt: new Date().toLocaleDateString(),
        orderDate: new Date().toLocaleDateString("en-GB"),
        orderType: orderData.orderType || "uid",
      }

      console.log("Saving order to Firebase:", completeOrderData)

      // Save to Firebase Database
      const ordersRef = ref(database, "orders")
      const result = await push(ordersRef, completeOrderData)

      console.log("Order saved successfully to Firebase with ID:", result.key)

      toast({
        title: "Order Completed! ✅",
        description: "Payment submitted successfully. You'll receive gems within 5-10 minutes.",
      })

      // Clear localStorage
      localStorage.removeItem("pendingOrder")

      // Redirect to success page with appropriate parameters
      if (orderData.orderType === "in-game") {
        setTimeout(() => {
          router.push("/success?type=in-game")
        }, 2000)
      } else {
        // Regular UID orders
        setTimeout(() => {
          router.push("/success")
        }, 2000)
      }
    } catch (error) {
      console.error("Error saving order to Firebase:", error)
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Please wait while we load your order details.</p>
        </div>
      </div>
    )
  }

  const basePrice = orderData.price
  const tax = calculateTax(basePrice)
  const totalPrice = calculateTotal(basePrice)

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Toaster />

      {/* Clean Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute top-0 left-0 w-full h-full">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 3,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/20"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-white">Complete Payment</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-8">
            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <Calculator className="h-6 w-6" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Product:</span>
                    <span className="font-semibold text-white">{orderData.product}</span>
                  </div>
                  {orderData.orderType === "in-game" ? (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Account Email:</span>
                      <span className="font-semibold text-white">{orderData.email}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Player UID:</span>
                      <span className="font-semibold text-white">{orderData.uid}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Base Price:</span>
                      <span className="font-semibold text-white">৳{basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Tax (15%):</span>
                      <span className="font-semibold text-white">৳{tax.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-lg">Total Amount:</span>
                        <span className="font-bold text-2xl text-white">৳{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <User className="h-6 w-6" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customerName" className="text-white text-lg font-semibold">
                        Full Name *
                      </Label>
                      <Input
                        id="customerName"
                        type="text"
                        placeholder="Enter your full name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="h-14 text-lg bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="customerPhone" className="text-white text-lg font-semibold">
                        Phone Number (Optional)
                      </Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="h-14 text-lg bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">bK</span>
                    </div>
                    bKash Payment Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <h3 className="font-bold text-white mb-4">Follow these steps:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-300">
                      <li>Open your bKash app</li>
                      <li>Go to "Send Money"</li>
                      <li>
                        Send <strong className="text-white">৳{totalPrice.toLocaleString()}</strong> to the number below
                      </li>
                      <li>Enter the transaction ID and last 3 digits below</li>
                      <li>Click "Complete Payment"</li>
                    </ol>
                  </div>

                  {/* Copy Number Section */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <h3 className="font-bold text-white mb-4">Send Money To:</h3>
                    <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                      <span className="text-2xl font-bold text-white">{bkashNumber}</span>
                      <Button
                        onClick={copyNumber}
                        className={`${
                          copied ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 hover:bg-white/20"
                        } backdrop-blur-xl border border-white/20 text-white transition-all duration-300`}
                      >
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="transactionId" className="text-white text-lg font-semibold">
                        bKash Transaction ID *
                      </Label>
                      <Input
                        id="transactionId"
                        type="text"
                        placeholder="Enter your bKash transaction ID"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="h-14 text-lg bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bkashLastDigits" className="text-white text-lg font-semibold">
                        Last 3 Digits of Your bKash Number *
                      </Label>
                      <Input
                        id="bkashLastDigits"
                        type="text"
                        placeholder="Enter last 3 digits (e.g., 349)"
                        value={bkashLastDigits}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 3)
                          setBkashLastDigits(value)
                        }}
                        maxLength={3}
                        className="h-14 text-lg bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                      />
                      <p className="text-gray-400 text-sm mt-2">
                        This helps us verify your payment (e.g., if your number is 01712345349, enter 349)
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={
                      loading ||
                      !transactionId.trim() ||
                      !customerName.trim() ||
                      !bkashLastDigits.trim() ||
                      bkashLastDigits.length !== 3
                    }
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {loading ? "Processing..." : "Complete Payment & Send Confirmation"}
                  </Button>

                  {/* Security Notice */}
                  <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <Shield className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-400">Secure Payment</p>
                      <p>Your payment is processed securely. Orders are typically approved within 5-10 minutes.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-400">Processing Time</p>
                      <p>Your gems will be delivered within 5-10 minutes after payment verification.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
