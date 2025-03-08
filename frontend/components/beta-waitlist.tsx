"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function BetaWaitlist() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, you would send this to your backend
    console.log("Email submitted:", email)
    setSubmitted(true)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center px-4 py-16 text-center md:px-12">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image src="/placeholder.svg?height=800&width=1600" alt="Background pattern" fill className="object-cover" />
        </div>
        <div className="z-10 max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold md:text-5xl">
            Join the Beta – Experience the Future of <span className="text-[#6666FF]">AI Mock Interviews!</span>
          </h1>
          <p className="text-lg text-gray-400">
            Be among the first to access our cutting-edge AI-driven mock interview platform. Get exclusive early access,
            provide feedback, and shape the future of job interview preparation!
          </p>
          <Button
            className="mt-4 bg-[#6666FF] px-8 py-6 text-lg hover:bg-[#5555DD]"
            onClick={() => {
              document.getElementById("signup-form")?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Join the Beta Waitlist
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-zinc-900 px-4 py-16 md:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Join Our Beta?</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg bg-zinc-800 p-6">
              <div className="mb-4 text-3xl">🚀</div>
              <h3 className="mb-2 text-xl font-bold text-[#6666FF]">Exclusive Early Access</h3>
              <p className="text-gray-400">
                Try features before they're available to the public and get a head start on your interview preparation.
              </p>
            </div>
            <div className="rounded-lg bg-zinc-800 p-6">
              <div className="mb-4 text-3xl">💬</div>
              <h3 className="mb-2 text-xl font-bold text-[#6666FF]">Direct Feedback to Developers</h3>
              <p className="text-gray-400">
                Help shape the final product by providing valuable insights directly to our team.
              </p>
            </div>
            <div className="rounded-lg bg-zinc-800 p-6">
              <div className="mb-4 text-3xl">🏆</div>
              <h3 className="mb-2 text-xl font-bold text-[#6666FF]">Priority Support & Special Perks</h3>
              <p className="text-gray-400">
                Get premium features and dedicated support as a thank you for being an early adopter.
              </p>
            </div>
            <div className="rounded-lg bg-zinc-800 p-6">
              <div className="mb-4 text-3xl">🤖</div>
              <h3 className="mb-2 text-xl font-bold text-[#6666FF]">AI-Powered Insights</h3>
              <p className="text-gray-400">
                Experience advanced interview analysis and personalized feedback to improve your skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-16 md:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">What Early Testers Are Saying</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-zinc-900 p-6">
              <p className="mb-4 text-gray-400">
                "The AI feedback was incredibly helpful for my technical interviews. It caught things I never would have
                noticed!"
              </p>
              <p className="font-semibold text-[#6666FF]">- Alex K., Software Engineer</p>
            </div>
            <div className="rounded-lg bg-zinc-900 p-6">
              <p className="mb-4 text-gray-400">
                "I practiced with HIRING GURU before my product manager interview and got the job! The targeted
                questions were spot on."
              </p>
              <p className="font-semibold text-[#6666FF]">- Priya M., Product Manager</p>
            </div>
            <div className="rounded-lg bg-zinc-900 p-6">
              <p className="mb-4 text-gray-400">
                "As someone who gets nervous in interviews, this tool helped me practice until I felt confident. Game
                changer!"
              </p>
              <p className="font-semibold text-[#6666FF]">- Jordan T., Marketing Specialist</p>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup-form" className="bg-zinc-900 px-4 py-16 md:px-12">
        <div className="mx-auto max-w-2xl rounded-xl bg-zinc-800 p-8">
          <h2 className="mb-6 text-center text-3xl font-bold">Reserve Your Spot</h2>
          {submitted ? (
            <div className="text-center">
              <div className="mb-4 text-5xl">🎉</div>
              <h3 className="mb-2 text-2xl font-bold text-[#6666FF]">You're on the list!</h3>
              <p className="text-gray-400">
                Thanks for joining our beta waitlist. We'll be in touch soon with your exclusive access details.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-gray-400">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:border-[#6666FF] focus:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
              <Button type="submit" className="w-full bg-[#6666FF] py-6 text-lg hover:bg-[#5555DD]">
                Join the Beta Waitlist
              </Button>
              <p className="text-center text-sm text-gray-400">
                Spots are limited! Join now and be part of our exclusive testers.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 text-center text-sm text-gray-400 md:px-12">
        <p>
          By joining the waitlist, you agree to our{" "}
          <Link href="#" className="text-[#6666FF] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-[#6666FF] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </div>
  )
}

