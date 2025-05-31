"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Home } from "lucide-react"
import { motion } from "framer-motion"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(10)

  const isInGameOrder = searchParams.get("type") === "in-game"

  useEffect(() => {
    if (isInGameOrder) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isInGameOrder])

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
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

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <Card
            className={`border ${isInGameOrder ? "border-yellow-500/50 bg-yellow-950/20" : "border-green-500/50 bg-green-950/20"} backdrop-blur-xl`}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                {isInGameOrder ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                )}
                {isInGameOrder ? "IMPORTANT NOTICE" : "Order Successful"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isInGameOrder ? (
                <>
                  <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-lg font-bold text-yellow-300 mb-2">DO NOT LOG IN TO YOUR ACCOUNT</p>
                    <p className="text-white">
                      Please wait until you are mentioned in the Bangladesh group chat by Pronoy before logging in to
                      your account.
                    </p>
                  </div>
                  <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
                    <p className="text-white">
                      Your Ruby Keys will be delivered within 400-500 minutes. Logging in before delivery is complete may
                      cause issues with your purchase. For faster Delivery, mention Pronoy M. Arpon in the Messenger Group of BANGLAdesh
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">This page will redirect in {countdown} seconds</p>
                    <Button onClick={() => router.push("/")} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      <Home className="h-4 w-4 mr-2" />
                      Return to Home
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-lg font-bold text-green-300 mb-2">Payment Received!</p>
                    <p className="text-white">Your order has been successfully placed and is being processed.</p>
                  </div>
                  <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
                    <p className="text-white">
                      Your gems will be delivered to your account within 5-10 minutes. Thank you for your purchase!
                    </p>
                  </div>
                  <div className="text-center">
                    <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-700 text-white">
                      <Home className="h-4 w-4 mr-2" />
                      Return to Home
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
