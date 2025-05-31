"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Shield,
  Star,
  Crown,
  Sparkles,
  Tag,
  Key,
  Package,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
} from "lucide-react"

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

export default function HomePage() {
  const router = useRouter()
  const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([])

  // Load active discounts from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDiscounts = localStorage.getItem("discounts")
      if (savedDiscounts) {
        try {
          const discounts = JSON.parse(savedDiscounts) as Discount[]
          const active = discounts.filter((discount) => discount.expiresAt > Date.now())
          setActiveDiscounts(active)
        } catch (error) {
          console.error("Error loading discounts:", error)
        }
      }
    }
  }, [])

  const uidDiscount = activeDiscounts.find((d) => d.type === "uid")
  const inGameDiscount = activeDiscounts.find((d) => d.type === "in-game")

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), 
                      radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)`,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"
            animate={{
              x: [0, 150, 0],
              y: [0, -150, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 20 + i * 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Racing Master Store
                </h1>
                <p className="text-purple-200/80 text-sm">Premium Gaming Experience</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/admin/login")}
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl"
            >
              Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Active Discounts Banner */}
      <AnimatePresence>
        {activeDiscounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="relative z-10 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-y border-pink-500/30 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <Sparkles className="h-5 w-5 text-pink-400" />
                <span className="text-white font-bold text-lg">🎉 Special Offers Active!</span>
                {activeDiscounts.map((discount) => (
                  <div key={discount.id} className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                      {discount.percentage}% OFF
                    </Badge>
                    <span className="text-pink-200">{discount.title}</span>
                  </div>
                ))}
                <Sparkles className="h-5 w-5 text-pink-400" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
              >
                Racing Master
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl sm:text-2xl text-purple-200 max-w-3xl mx-auto"
              >
                Premium gaming packages delivered instantly. Experience the ultimate racing adventure with our exclusive
                offers.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-white text-sm">Instant Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-white text-sm">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2">
                <Users className="h-4 w-4 text-purple-400" />
                <span className="text-white text-sm">24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Package Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* UID Packages */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-xl group hover:scale-105 transition-all duration-500">
              {uidDiscount && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white animate-pulse">
                    <Tag className="h-3 w-3 mr-1" />
                    {uidDiscount.percentage}% OFF
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-white text-center">UID Packages</CardTitle>
                <p className="text-purple-200 text-center">Direct gem delivery to your account</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span className="text-white">Instant gem delivery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="text-white">Secure transactions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-purple-400" />
                    <span className="text-white">Premium support</span>
                  </div>
                </div>

                {uidDiscount && (
                  <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-pink-400" />
                      <span className="text-white font-semibold">{uidDiscount.title}</span>
                    </div>
                    <p className="text-pink-200 text-sm">
                      Save {uidDiscount.percentage}% on all UID packages! Limited time offer.
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => router.push("/uid-packages")}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transition-all duration-300 group"
                >
                  <span>Explore UID Packages</span>
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* In-Game Packages */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-xl group hover:scale-105 transition-all duration-500">
              {inGameDiscount && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white animate-pulse">
                    <Tag className="h-3 w-3 mr-1" />
                    {inGameDiscount.percentage}% OFF
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
                  <Key className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-white text-center">In-Game Packages</CardTitle>
                <p className="text-purple-200 text-center">Ruby Keys delivered to your account</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-red-400" />
                    <span className="text-white">Ruby Key delivery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="text-white">Account security</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    <span className="text-white">Best value deals</span>
                  </div>
                </div>

                {inGameDiscount && (
                  <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-pink-400" />
                      <span className="text-white font-semibold">{inGameDiscount.title}</span>
                    </div>
                    <p className="text-pink-200 text-sm">
                      Save {inGameDiscount.percentage}% on all Ruby Key packages! Don't miss out.
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => router.push("/in-game-packages")}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transition-all duration-300 group"
                >
                  <span>Explore In-Game Packages</span>
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-center space-y-12"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Why Choose Us?
              </h2>
              <p className="text-purple-200 text-xl max-w-2xl mx-auto">
                Experience the premium difference with our top-tier service and unmatched reliability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
                <p className="text-gray-300">Instant delivery within minutes of payment confirmation.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">100% Secure</h3>
                <p className="text-gray-300">Bank-level encryption and secure payment processing.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">24/7 Support</h3>
                <p className="text-gray-300">Round-the-clock customer support for all your needs.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
