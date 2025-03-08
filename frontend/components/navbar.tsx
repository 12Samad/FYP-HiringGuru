"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  // For AppContainer compatibility (if you decide to use it)
  const handleNavigation = (path: string) => {
    // If we're on the main page, use window.location for navigation
    if (pathname === "/") {
      window.location.href = path
    }
    // Otherwise, Next.js Link components will handle navigation
  }

  return (
    <header className="px-4 py-5 md:px-12">
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <Link href="/" className="text-4xl font-bold text-[#6666FF]">
          H
        </Link>

        <nav className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
          <Link
            href="/beta-waitlist"
            className="text-lg text-white hover:text-[#6666FF]"
            onClick={() => handleNavigation("/beta-waitlist")}
          >
            Beta Waitlist
          </Link>
          <Link
            href="/get-in-touch"
            className="text-lg text-white hover:text-[#6666FF]"
            onClick={() => handleNavigation("/get-in-touch")}
          >
            Get in Touch
          </Link>
          <Link
            href="/buy-us-coffee"
            className="text-lg text-white hover:text-[#6666FF]"
            onClick={() => handleNavigation("/buy-us-coffee")}
          >
            Buy Us a Coffee
          </Link>
        </nav>

        <Button
          onClick={() => (window.location.href = "/interview")}
          className="bg-[#6666FF] text-white hover:bg-[#5555DD]"
        >
          Interview now
        </Button>
      </div>
    </header>
  )
}

