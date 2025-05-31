"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Gamepad2, User, CheckCircle, Sparkles, Volume2, VolumeX } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isMusicLoaded, setIsMusicLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true)
      toast({
        title: "🎉 Order Completed!",
        description: "Your order has been submitted successfully. Please wait for admin confirmation.",
        duration: 5000,
      })
      window.history.replaceState({}, "", "/")
    }
  }, [searchParams])

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

  const handleContinueShopping = () => {
    setShowSuccess(false)
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

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50"
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">Order Completed!</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Your order has been submitted successfully. Please wait for admin confirmation.
              </p>
              <Button
                onClick={handleContinueShopping}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300"
              >
                Continue Shopping
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full"
              >
                <Sparkles className="h-5 w-5 text-white" />
                <span className="text-white font-medium">Top-Up Store</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-5xl sm:text-7xl font-bold text-white leading-tight"
              >
                Racing Master Store
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-gray-300 text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed"
              >
                Choose your preferred package type
              </motion.p>
            </div>
          </motion.div>

          {/* Package Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="space-y-10"
          >

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* UID Option */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="relative overflow-hidden cursor-pointer transition-all duration-500 group bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20 h-full"
                  onClick={() => router.push("/uid-packages")}
                >
                  <CardHeader className="pb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-white text-2xl font-bold text-center">UID Packages</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <p className="text-gray-300 text-lg mb-6">
                        Get gems and items delivered directly to your Racing Master account using your UID
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Gem Packages</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Special Offers</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Fast Delivery</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">24/7 Support</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg transition-all duration-300">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Browse UID Packages
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* In-Game Option */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="relative overflow-hidden cursor-pointer transition-all duration-500 group bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20 h-full"
                  onClick={() => router.push("/in-game-packages")}
                >
                  <CardHeader className="pb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
                      <Gamepad2 className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-white text-2xl font-bold text-center">In-Game Packages</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <p className="text-gray-300 text-lg mb-6">
                        We log into your account and deliver Ruby Keys and other exclusive items directly
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Ruby Keys</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Exclusive Items</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Account Login Service</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Secure Process</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg transition-all duration-300">
                      <Gamepad2 className="h-5 w-5 mr-2" />
                      Browse In-Game Packages
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-center space-y-8"
          >
            <h3 className="text-3xl sm:text-4xl font-bold text-white">Secure Payment Methods</h3>
            <div className="flex justify-center items-center">
              <div className="flex items-center gap-6 px-8 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">bK</span>
                </div>
                <div>
                  <span className="text-white font-semibold text-xl">bKash</span>
                  <p className="text-gray-300 text-sm">Instant & Secure</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/10 mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="text-center space-y-6">
            <p className="text-gray-300 text-lg">© 2024 Racing Master Store. All rights reserved. | Gaming Services</p>
            <p className="text-gray-400 text-base">Contact Support: +880 1818618349 | Email: xrupture.tw@gmail.com</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
