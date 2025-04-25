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
  const [message, setMessage] = useState("") // Define the state
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState("") // Debug state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("") // Reset message before new attempt
    setDebugInfo("") // Reset debug info
    setIsLoading(true)

    try {
      console.log("Sending login request to server with email:", formData.email)
      
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      // Debug: Log the full response data
      console.log("Full server response:", data)
      setDebugInfo(JSON.stringify(data, null, 2))

      if (response.ok) {
        // Look for possible userId field variants
        const possibleUserIdFields = ['userId', 'user_id', 'id', 'uid', '_id'];
        let foundUserId = null;
        
        // Check for different field names
        for (const field of possibleUserIdFields) {
          if (data[field] !== undefined) {
            foundUserId = data[field];
            console.log(`Found user ID in field "${field}":`, foundUserId);
            break;
          }
        }
        
        // Check if userId might be nested inside a user object
        if (!foundUserId && data.user) {
          for (const field of possibleUserIdFields) {
            if (data.user[field] !== undefined) {
              foundUserId = data.user[field];
              console.log(`Found user ID in nested field "user.${field}":`, foundUserId);
              break;
            }
          }
        }
        
        // Store user ID if found
        if (foundUserId) {
          localStorage.setItem('userId', foundUserId);
          console.log("User ID stored in localStorage:", foundUserId);
          
          // You can also store other user info if needed
          if (data.name) localStorage.setItem('userName', data.name);
          if (data.user?.name) localStorage.setItem('userName', data.user.name);
          
          if (data.email) localStorage.setItem('userEmail', data.email);
          if (data.user?.email) localStorage.setItem('userEmail', data.user.email);
        } else {
          console.warn("User ID not received from server in any expected field");
        }
        
        setMessage("✅ Welcome back! Redirecting..."); 

        setTimeout(() => {
          router.push("/interview-setup"); // Redirect after delay
        }, 2000); // 2-second delay
      } else {
        setError(data.message || "Invalid credentials")
      }
    } catch (err) {
      console.error("Login error:", err);
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

        {/* Display Success Message */}
        {message && <div className="rounded-md bg-green-500/10 p-4 text-center text-green-500">{message}</div>}

        {/* Display Error Message */}
        {error && <div className="rounded-md bg-red-500/10 p-4 text-center text-red-500">{error}</div>}

        {/* Debug Info - Can be removed in production */}
        {/* {debugInfo && (
          <div className="rounded-md bg-gray-800/50 p-4 text-xs text-gray-400 overflow-auto max-h-40">
            <p className="font-bold mb-1">Debug - Server Response:</p>
            <pre>{debugInfo}</pre>
          </div>
        )} */}  

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