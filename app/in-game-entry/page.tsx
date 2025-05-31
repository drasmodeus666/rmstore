"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, FileText, Save, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { database } from "@/lib/firebase"
import { ref, onValue, push, remove } from "firebase/database"

interface InGameEntry {
  id: string
  product: string
  profit: number
  timestamp: number
}

export default function InGameEntry() {
  const router = useRouter()
  const [productName, setProductName] = useState<string>("")
  const [profitAmount, setProfitAmount] = useState<string>("")
  const [entries, setEntries] = useState<InGameEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showClearDialog, setShowClearDialog] = useState<boolean>(false)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = () => {
    const entriesRef = ref(database, "in_game_entries")

    onValue(
      entriesRef,
      (snapshot) => {
        const data = snapshot.val()
        const entriesArray: InGameEntry[] = []

        if (data) {
          Object.keys(data).forEach((key) => {
            entriesArray.push({
              id: key,
              ...data[key],
            })
          })
        }

        // Sort by timestamp (newest first)
        entriesArray.sort((a, b) => b.timestamp - a.timestamp)

        setEntries(entriesArray)
        setLoading(false)
      },
      {
        onlyOnce: true,
      },
    )
  }

  const handleProfitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setProfitAmount(value)
    }
  }

  const recordInGameSale = () => {
    if (!productName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product name.",
        variant: "destructive",
      })
      return
    }

    if (!profitAmount.trim()) {
      toast({
        title: "Error",
        description: "Please enter a profit amount.",
        variant: "destructive",
      })
      return
    }

    const profit = Number.parseFloat(profitAmount)

    const inGameEntry = {
      product: productName,
      price: profit,
      profit: profit,
      timestamp: Date.now(),
    }

    push(ref(database, "in_game_entries"), inGameEntry)
      .then(() => {
        toast({
          title: "Success",
          description: `In-game sale recorded: ${productName}, Profit: ${profit.toFixed(2)}`,
        })

        setProductName("")
        setProfitAmount("")
        fetchEntries()
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to record in-game sale: " + error.message,
          variant: "destructive",
        })
      })
  }

  const recordAndPrintInvoice = () => {
    if (!productName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product name.",
        variant: "destructive",
      })
      return
    }

    if (!profitAmount.trim()) {
      toast({
        title: "Error",
        description: "Please enter a profit amount.",
        variant: "destructive",
      })
      return
    }

    const profit = Number.parseFloat(profitAmount)

    // First record the in-game sale
    const inGameEntry = {
      product: productName,
      price: profit,
      profit: profit,
      timestamp: Date.now(),
    }

    // Then prepare invoice data
    const invoiceData = {
      product: productName,
      price: profit,
      quantity: 1,
      customer: "Customer",
      timestamp: Date.now(),
    }

    // Push both to Firebase
    Promise.all([
      push(ref(database, "in_game_entries"), inGameEntry),
      push(ref(database, "ingame_invoices"), invoiceData),
    ])
      .then(() => {
        toast({
          title: "Success",
          description: "In-game sale recorded and invoice generated!",
        })

        // Navigate to invoice generator with data
        router.push(`/invoice-generator?product=${encodeURIComponent(productName)}&price=${profit}&quantity=1`)
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to process: " + error.message,
          variant: "destructive",
        })
      })
  }

  const handleClearHistory = () => {
    setShowClearDialog(true)
  }

  const confirmClearHistory = () => {
    const entriesRef = ref(database, "in_game_entries")

    remove(entriesRef)
      .then(() => {
        setEntries([])
        toast({
          title: "Success",
          description: "In-game sales history has been cleared.",
        })
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to clear history: " + error.message,
          variant: "destructive",
        })
      })
      .finally(() => {
        setShowClearDialog(false)
      })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
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
          <h1 className="text-2xl font-bold text-white glow-text">In-Game Entry</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Entry Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Card className="shadow-lg border-red-800/20">
              <CardHeader className="bg-gradient-to-r from-red-950 to-red-900">
                <CardTitle className="text-xl text-white">Record In-Game Sale</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Name:</label>
                    <Input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profit Amount:</label>
                    <Input value={profitAmount} onChange={handleProfitChange} placeholder="Enter profit amount" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={recordInGameSale}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Record In-Game Sale
                    </Button>
                    <Button onClick={recordAndPrintInvoice} variant="outline" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Record & Print Invoice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* History */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Card className="shadow-lg border-red-800/20">
              <CardHeader className="bg-gradient-to-r from-red-950 to-red-900 flex flex-row justify-between items-center">
                <CardTitle className="text-xl text-white">In-Game Sale History</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearHistory}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear History
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : entries.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {entries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <p className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</p>
                        <div className="flex justify-between items-center mt-1">
                          <h3 className="text-lg font-semibold text-primary">{entry.product}</h3>
                          <p className="font-medium text-green-500">Profit: {entry.profit.toFixed(2)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground">No in-game entries available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all in-game sales history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearHistory} className="bg-red-600 hover:bg-red-700">
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
