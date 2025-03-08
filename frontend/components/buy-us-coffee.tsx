"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"

export default function BuyUsCoffee() {
  const [donationAmount, setDonationAmount] = useState<number | null>(5)
  const [customAmount, setCustomAmount] = useState("")
  const [showThankYou, setShowThankYou] = useState(false)
  const [donorName, setDonorName] = useState("")
  const [email, setEmail] = useState("")

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, you would integrate with a payment processor
    console.log("Donation:", {
      amount: donationAmount || Number.parseFloat(customAmount),
      name: donorName,
      email: email,
    })
    setShowThankYou(true)
  }

  const handleAmountSelect = (amount: number | null) => {
    setDonationAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDonationAmount(null)
    setCustomAmount(e.target.value)
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
            Love What We're Building? <span className="text-[#6666FF]">Support Us!</span>
          </h1>
          <p className="text-lg text-gray-400">
            We're working hard to bring AI-driven mock interviews to life. If you'd like to help us grow, buy us a
            coffee! ☕ Every contribution helps us refine our AI, improve the experience, and add more features.
          </p>
          <div className="mx-auto mt-8 w-32">
            <Image
              src="/placeholder.svg?height=128&width=128"
              width={128}
              height={128}
              alt="Coffee cup illustration"
              className="animate-bounce"
            />
          </div>
        </div>
      </section>

      {/* How Your Support Helps */}
      <section className="bg-zinc-900 px-4 py-16 md:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold">How Your Support Helps</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-zinc-800 p-6 text-center">
              <div className="mb-4 text-4xl">🖥️</div>
              <h3 className="mb-2 text-xl font-bold text-[#6666FF]">Better AI Models</h3>
              <p className="text-gray-400">
                More accurate mock interview feedback and smarter responses to help you ace your interviews.
              </p>
            </div>
            <div className="rounded-lg bg-zinc-800 p-6 text-center">
              <div className="mb-4 text-4xl">🔧</div>
              <h3 className="mb-2 text-xl font-bold text-[#6666FF]">Platform Improvements</h3>
              <p className="text-gray-400">
                Faster, smoother, and smarter UI to make your interview preparation experience seamless.
              </p>
            </div>
            <div className="rounded-lg bg-zinc-800 p-6 text-center">
              <div className="mb-4 text-4xl">🎁</div>
              <h3 className="mb-2 text-xl font-bold text-[#6666FF]">Exclusive Beta Features</h3>
              <p className="text-gray-400">
                Unlock premium tools for early supporters and help shape the future of our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="px-4 py-16 md:px-12">
        <div className="mx-auto max-w-2xl rounded-xl bg-zinc-900 p-8">
          {showThankYou ? (
            <div className="text-center">
              <div className="mb-4 text-6xl">☕</div>
              <h2 className="mb-4 text-3xl font-bold">Thank You for Your Support!</h2>
              <p className="mb-6 text-gray-400">
                Your contribution helps us continue building the best AI interview assistant. We truly appreciate your
                support!
              </p>
              <div className="relative mx-auto h-32 w-32">
                <div className="absolute bottom-0 h-0 w-full animate-[fill_2s_ease-in-out_forwards] rounded-b-full bg-[#6666FF]"></div>
                <div className="absolute inset-0 rounded-full border-2 border-[#6666FF]"></div>
              </div>
              <Button className="mt-8 bg-[#6666FF] hover:bg-[#5555DD]" onClick={() => setShowThankYou(false)}>
                Support Again
              </Button>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-center text-3xl font-bold">Buy Us a Coffee</h2>
              <form onSubmit={handleDonate} className="space-y-6">
                <div>
                  <label className="mb-2 block text-gray-400">Select Amount</label>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <button
                      type="button"
                      className={`rounded-md p-3 text-center ${
                        donationAmount === 5 ? "bg-[#6666FF] text-white" : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                      }`}
                      onClick={() => handleAmountSelect(5)}
                    >
                      $5
                    </button>
                    <button
                      type="button"
                      className={`rounded-md p-3 text-center ${
                        donationAmount === 10
                          ? "bg-[#6666FF] text-white"
                          : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                      }`}
                      onClick={() => handleAmountSelect(10)}
                    >
                      $10
                    </button>
                    <button
                      type="button"
                      className={`rounded-md p-3 text-center ${
                        donationAmount === 20
                          ? "bg-[#6666FF] text-white"
                          : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                      }`}
                      onClick={() => handleAmountSelect(20)}
                    >
                      $20
                    </button>
                    <button
                      type="button"
                      className={`rounded-md p-3 text-center ${
                        donationAmount === null && customAmount !== ""
                          ? "bg-[#6666FF] text-white"
                          : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                      }`}
                      onClick={() => handleAmountSelect(null)}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {donationAmount === null && (
                  <div>
                    <label htmlFor="customAmount" className="mb-2 block text-gray-400">
                      Enter Custom Amount ($)
                    </label>
                    <input
                      type="number"
                      id="customAmount"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      min="1"
                      step="0.01"
                      required={donationAmount === null}
                      className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-[#6666FF] focus:outline-none"
                      placeholder="Enter amount"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="mb-2 block text-gray-400">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-[#6666FF] focus:outline-none"
                    placeholder="How should we thank you?"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-gray-400">
                    Email (For Receipt)
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-[#6666FF] focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>

                <Button type="submit" className="w-full bg-[#6666FF] py-6 text-lg hover:bg-[#5555DD]">
                  Buy Us a Coffee ☕
                </Button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Supporters */}
      <section className="bg-zinc-900 px-4 py-16 text-center md:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-2xl font-bold">Our Amazing Supporters</h2>
          <p className="mb-8 text-gray-400">
            Thanks to Alex, Priya, Jordan, and all our supporters who have helped us build HIRING GURU!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-12 w-12 rounded-full bg-zinc-800"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 text-center md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-3xl font-bold">Your support means everything!</h2>
          <p className="mb-8 text-lg text-gray-400">
            Let's build the best AI interview assistant together. Every coffee counts!
          </p>
          <Button
            className="bg-[#6666FF] px-8 py-6 text-lg hover:bg-[#5555DD]"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          >
            Back to Top
          </Button>
        </div>
      </section>
    </div>
  )
}

