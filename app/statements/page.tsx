"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
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

interface Statement {
  id: string
  product: string
  price: number
  cost: number
  profit: number
  timestamp: number
  uid?: string
  orderId?: string
}

export default function Statements() {
  const router = useRouter()
  const [statements, setStatements] = useState<Statement[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [showClearDialog, setShowClearDialog] = useState<boolean>(false)

  useEffect(() => {
    fetchStatements()
  }, [])

  const fetchStatements = () => {
    setRefreshing(true)
    try {
      const storedStatements = JSON.parse(localStorage.getItem("statements") || "[]")
      // Sort by timestamp (newest first)
      const sortedStatements = storedStatements.sort((a: Statement, b: Statement) => b.timestamp - a.timestamp)
      setStatements(sortedStatements)
    } catch (error) {
      console.error("Error fetching statements:", error)
      setStatements([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleClearAll = () => {
    setShowClearDialog(true)
  }

  const confirmClearAll = () => {
    try {
      localStorage.removeItem("statements")
      setStatements([])
      toast({
        title: "Success",
        description: "All statements have been cleared.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear statements",
        variant: "destructive",
      })
    } finally {
      setShowClearDialog(false)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Toaster />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-black/10 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin")}
              className="text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-white">Transaction Statements</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative container mx-auto py-8 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Transaction History</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchStatements}
                disabled={refreshing}
                className="flex items-center gap-2 text-white border-white/20 hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="destructive" onClick={handleClearAll} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : statements.length > 0 ? (
                <div className="space-y-4">
                  {statements.map((statement) => (
                    <motion.div
                      key={statement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <p className="text-sm text-gray-400">{formatDate(statement.timestamp)}</p>
                          <h3 className="text-lg font-semibold text-white">{statement.product}</h3>
                          {statement.uid && <p className="text-sm text-gray-400">UID: {statement.uid}</p>}
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Price</p>
                            <p className="font-medium text-white">৳{statement.price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Cost</p>
                            <p className="font-medium text-white">৳{statement.cost.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Profit</p>
                            <p className="font-medium text-green-400">৳{statement.profit.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400">No statements available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="bg-slate-900 border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action will permanently delete all statements. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearAll} className="bg-red-600 hover:bg-red-700">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
