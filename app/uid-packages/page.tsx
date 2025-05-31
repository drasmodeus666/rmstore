"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Zap, Shield, Star, ArrowLeft, Volume2, VolumeX } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

const products = {
  "70 gems": { price: 180, cost: 102.3 },
  "140 gems": { price: 480, cost: 206.8 },
  "210 gems": { price: 600, cost: 311.3 },
  "350 gems": { price: 1000, cost: 520.3 },
  "700 gems": { price: 2650, cost: 1017.5 },
  "1000 gems": { price: 3700, cost: 1461.9 },
  "1400 gems": { price: 4800, cost: 2063.6 },
  "2100 gems": { price: 5900, cost: 3164.7 },
  "3400 gems": { price: 9000, cost: 4940.1 },
  "6600 gems": { price: 14500, cost: 9542.5 },
  "Monthly Card": { price: 850, cost: 233.2 },
  "Master Pass": { price: 1050, cost: 233.2 },
  "Growth Fund": { price: 1600, cost: 651.2 },
  "Value Outfit": { price: 170, cost: 102.3 },
}

export default function UidPackagesPage() {
  const router = useRouter()
  const [uid, setUid] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isMusicLoaded, setIsMusicLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Initialize audio
    if (audioRef.current) {
      audioRef.current.volume = 0.3
      audioRef.current.loop = true

      const handleCanPlay = () => {
        setIsMusicLoaded(true)
      }

      audioRef.current.addEventListener("canplaythrough", handleCanPlay)

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("canplaythrough", handleCanPlay)
        }
      }
    }
  }, [])

  const toggleMusic = async () => {
    if (!audioRef.current || !isMusicLoaded) return

    try {
      if (isMusicPlaying) {
        audioRef.current.pause()
        setIsMusicPlaying(false)
      } else {
        await audioRef.current.play()
        setIsMusicPlaying(true)
      }
    } catch (error) {
      console.error("Error playing audio:", error)
      toast({
        title: "Audio Error",
        description: "Unable to play background music. Please check your browser settings.",
        variant: "destructive",
      })
    }
  }

  const handleProductSelect = (productName: string) => {
    if (!uid.trim()) {
      toast({
        title: "UID Required",
        description: "Please enter your Racing Master UID first",
        variant: "destructive",
      })
      return
    }
    setSelectedProduct(productName)
  }

  const handleProceedToPayment = () => {
    if (!selectedProduct || !uid.trim()) return

    const product = products[selectedProduct as keyof typeof products]

    // Store order data in localStorage for clean URL
    const orderData = {
      product: selectedProduct,
      uid: uid.trim(),
      price: product.price,
      cost: product.cost,
      timestamp: Date.now(),
      orderType: "uid",
    }

    localStorage.setItem("pendingOrder", JSON.stringify(orderData))

    // Navigate with clean URL
    router.push("/payment/bkash")
  }

  const gemProducts = Object.entries(products).filter(([name]) => name.includes("gems"))
  const specialProducts = Object.entries(products).filter(([name]) => !name.includes("gems"))

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Toaster />

      {/* Background Music */}
      <audio ref={audioRef} preload="auto" src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" />

      {/* Music Control */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed top-6 right-6 z-50"
      >
        <Button
          onClick={toggleMusic}
          disabled={!isMusicLoaded}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white shadow-lg transition-all duration-300"
        >
          {isMusicPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </motion.div>

      {/* Clean Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute top-0 left-0 w-full h-full">
          {Array.from({ length: 30 }, (_, i) => (
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
            <h1 className="text-3xl font-bold text-white">UID Packages</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <div className="space-y-4">
                <Label htmlFor="uid" className="text-white text-lg font-semibold">
                  Player UID
                </Label>
                <Input
                  id="uid"
                  type="text"
                  placeholder="Enter your UID (e.g., 123456789)"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="h-14 text-lg bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Gem Packages */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="space-y-10"
          >
            <div className="text-center space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Gem Packages</h2>
              <p className="text-gray-300 text-xl sm:text-2xl">Choose from our collections</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gemProducts.map(([productName, product], index) => {
                const isSelected = selectedProduct === productName
                const isPopular = ["1000 gems", "2100 gems"].includes(productName)

                return (
                  <motion.div
                    key={productName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className={`relative overflow-hidden cursor-pointer transition-all duration-500 group ${
                        isSelected
                          ? "bg-white/15 backdrop-blur-2xl border-white/30 shadow-lg shadow-white/10"
                          : "bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                      onClick={() => handleProductSelect(productName)}
                    >
                      {isPopular && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-3 py-1 text-sm font-bold shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-xl font-bold">{productName}</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white mb-2">৳{product.price.toLocaleString()}</div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">24/7 Support</span>
                            <Shield className="h-4 w-4 text-green-400" />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">Fast Processing</span>
                            <Zap className="h-4 w-4 text-green-400" />
                          </div>
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="pt-4 border-t border-white/10"
                          >
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleProceedToPayment()
                              }}
                              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg transition-all duration-300"
                            >
                              <ShoppingCart className="h-5 w-5 mr-2" />
                              Proceed to Payment
                            </Button>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Special Packages */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="space-y-10"
          >
            <div className="text-center space-y-6">
              <h3 className="text-4xl sm:text-5xl font-bold text-white">Special Offers</h3>
              <p className="text-gray-300 text-xl sm:text-2xl">Packages for enhanced gameplay</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialProducts.map(([productName, product], index) => {
                const isSelected = selectedProduct === productName

                return (
                  <motion.div
                    key={productName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className={`relative overflow-hidden cursor-pointer transition-all duration-500 ${
                        isSelected
                          ? "bg-white/15 backdrop-blur-2xl border-white/30 shadow-lg shadow-white/10"
                          : "bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                      onClick={() => handleProductSelect(productName)}
                    >
                      <CardHeader className="pb-4">
                        <CardTitle className="text-white text-lg font-bold">{productName}</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white mb-2">৳{product.price.toLocaleString()}</div>
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="pt-4"
                          >
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleProceedToPayment()
                              }}
                              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Buy Now
                            </Button>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
