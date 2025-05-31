"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      console.log("Login successful with Firebase:", user.email)

      // Set additional login state for compatibility
      localStorage.setItem("isAdminLoggedIn", "true")
      localStorage.setItem("adminEmail", user.email || "")

      toast({
        title: "Login Successful! ✅",
        description: `Welcome back, ${user.email}`,
      })

      // Redirect to admin dashboard
      setTimeout(() => {
        router.push("/admin")
      }, 1000)
    } catch (error: any) {
      console.error("Firebase login error:", error)

      let errorMessage = "Invalid email or password"

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later"
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Toaster />
      <div className="w-full max-w-md">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-2">Admin Login</CardTitle>
            <p className="text-gray-300">Access Racing Master Admin Panel</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-lg font-semibold">
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-lg bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white text-lg font-semibold">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-lg bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">Use your Firebase authentication credentials</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
