"use client"

import { useState } from "react"
import Navbar from "./navbar"
import Hero from "./hero"
import BetaWaitlist from "./beta-waitlist"
import BuyUsCoffee from "./buy-us-coffee"
import GetInTouch from "./get-in-touch"

export default function AppContainer() {
  const [currentPage, setCurrentPage] = useState("home")

  const renderPage = () => {
    switch (currentPage) {
      case "beta-waitlist":
        return <BetaWaitlist />
      case "get-in-touch":
        return <GetInTouch />
      case "buy-us-coffee":
        return <BuyUsCoffee />
      case "interview":
        // You can replace this with your interview component when ready
        return <Hero />
      default:
        return <Hero />
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      {renderPage()}
    </div>
  )
}

