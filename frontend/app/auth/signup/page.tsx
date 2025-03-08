"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [message, setMessage] = useState(""); // ✅ Success message state
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("✅ Account created successfully! Redirecting..."); // ✅ Show success message

        setTimeout(() => {
          router.push("/interview-setup"); // ✅ Redirect after delay
        }, 2000);
      } else {
        setError(data.message || "Something went wrong")
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
          <h2 className="text-3xl font-bold text-[#6666FF]">Create Account</h2>
          <p className="mt-2 text-gray-400">Start your interview preparation journey</p>
        </div>

        {error && <div className="rounded-md bg-red-500/10 p-4 text-center text-red-500">{error}</div>}
        {message && <div className="rounded-md bg-green-500/10 p-4 text-center text-green-500">{message}</div>} {/* ✅ Show success message */}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                className="mt-1 block w-full border-gray-700 bg-[#1A1A1A] text-white placeholder-gray-400"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

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
            {isLoading ? "Signing up..." : "Sign up"}
          </Button>
        </form>

        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#6666FF] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
