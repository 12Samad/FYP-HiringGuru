import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function About() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>
      <p className="text-lg mb-8 max-w-2xl text-center">
        This is the about page of your Next.js application. You can add your company or project information here.
      </p>
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </main>
  )
}

