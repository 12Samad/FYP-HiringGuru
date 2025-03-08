"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [message, setMessage] = useState(""); // ✅ Define the state
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("") // Reset message before new attempt
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("✅ Welcome back! Redirecting to test..."); // ✅ Now displayed

        setTimeout(() => {
          router.push("/interview-setup"); // Redirect after delay
        }, 2000); // 2-second delay
      } else {
        setError(data.message || "Invalid credentials")
      }
    } catch (err) {
      setError("Failed to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F1111] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#6666FF]">Welcome Back</h2>
          <p className="mt-2 text-gray-400">Sign in to continue your preparation</p>
        </div>

        {/* ✅ Display Success Message */}
        {message && <div className="rounded-md bg-green-500/10 p-4 text-center text-green-500">{message}</div>}

        {/* ✅ Display Error Message */}
        {error && <div className="rounded-md bg-red-500/10 p-4 text-center text-red-500">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                required
                className="mt-1 block w-full border-gray-700 bg-[#1A1A1A] text-white placeholder-gray-400"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                className="mt-1 block w-full border-gray-700 bg-[#1A1A1A] text-white placeholder-gray-400"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#6666FF] text-white hover:bg-[#5555DD]" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-gray-400">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-[#6666FF] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
