"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useAnimation } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function UsdConversion() {
  const router = useRouter()
  const [usdAmount, setUsdAmount] = useState<string>("")
  const [bdtAmount, setBdtAmount] = useState<string>("")
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const resultControls = useAnimation()

  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setUsdAmount(value)
    }
  }

  const handleBdtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setBdtAmount(value)
    }
  }

  const convertUsdToBdt = () => {
    if (!usdAmount) {
      toast({
        title: "Error",
        description: "Please enter a USD amount.",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)

    // Animate the result
    resultControls.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.5 },
    })

    // Convert USD to BDT (1 USD = 107 BDT)
    const usd = Number.parseFloat(usdAmount)
    const bdt = usd * 107

    // Animate the conversion with counter
    let startValue = 0
    const duration = 1000 // ms
    const increment = bdt / (duration / 16) // 60fps

    const updateCounter = () => {
      startValue += increment
      if (startValue >= bdt) {
        setBdtAmount(bdt.toFixed(2))
        setIsConverting(false)
      } else {
        setBdtAmount(startValue.toFixed(2))
        requestAnimationFrame(updateCounter)
      }
    }

    requestAnimationFrame(updateCounter)
  }

  const convertBdtToUsd = () => {
    if (!bdtAmount) {
      toast({
        title: "Error",
        description: "Please enter a BDT amount.",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)

    // Animate the result
    resultControls.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.5 },
    })

    // Convert BDT to USD (1 USD = 107 BDT)
    const bdt = Number.parseFloat(bdtAmount)
    const usd = bdt / 107

    // Animate the conversion with counter
    let startValue = 0
    const duration = 1000 // ms
    const increment = usd / (duration / 16) // 60fps

    const updateCounter = () => {
      startValue += increment
      if (startValue >= usd) {
        setUsdAmount(usd.toFixed(2))
        setIsConverting(false)
      } else {
        setUsdAmount(startValue.toFixed(2))
        requestAnimationFrame(updateCounter)
      }
    }

    requestAnimationFrame(updateCounter)
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-black to-red-900 p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white glow-text">USD to BDT Conversion</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="shadow-lg border-red-800/20">
            <CardHeader className="bg-gradient-to-r from-red-950 to-red-900">
              <CardTitle className="text-xl text-white">USD to BDT Conversion (1 USD = 107 BDT)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-lg font-medium">USD Amount:</label>
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      value={usdAmount}
                      onChange={handleUsdChange}
                      placeholder="Enter USD amount"
                      className="text-lg"
                    />
                    <Button
                      onClick={convertUsdToBdt}
                      disabled={isConverting || !usdAmount}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Convert
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                    <ArrowRight className="h-8 w-8 text-white" />
                  </div>
                </div>

                <motion.div className="space-y-4" animate={resultControls}>
                  <label className="text-lg font-medium">BDT Amount:</label>
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      value={bdtAmount}
                      onChange={handleBdtChange}
                      placeholder="BDT amount"
                      className="text-lg"
                    />
                    <Button
                      onClick={convertBdtToUsd}
                      disabled={isConverting || !bdtAmount}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                      Convert
                    </Button>
                  </div>
                </motion.div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Quick Reference:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-2 bg-background rounded-md">
                      <div className="font-medium">$1</div>
                      <div className="text-sm text-muted-foreground">107 BDT</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded-md">
                      <div className="font-medium">$5</div>
                      <div className="text-sm text-muted-foreground">535 BDT</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded-md">
                      <div className="font-medium">$10</div>
                      <div className="text-sm text-muted-foreground">1,070 BDT</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded-md">
                      <div className="font-medium">$20</div>
                      <div className="text-sm text-muted-foreground">2,140 BDT</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
