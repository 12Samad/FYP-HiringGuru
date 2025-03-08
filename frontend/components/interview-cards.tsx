"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserCircle, Building2 } from "lucide-react"

export default function InterviewCards() {
  const router = useRouter()

  const handleClick = () => {
    router.push("/auth/signup")
  }

  return (
    <section className="px-4 py-12 md:px-12">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Interview Card */}
        <div className="rounded-xl bg-[#1A1A1A] p-8 text-center transition-transform hover:scale-105">
          <div className="mb-6 flex justify-center">
            <UserCircle className="h-16 w-16 text-[#6666FF]" />
          </div>
          <h3 className="mb-4 text-2xl font-bold text-white">Start an Interview</h3>
          <p className="mb-6 text-gray-400">
            Practice for your upcoming interviews with our AI-powered system. Get instant feedback and improve your
            skills.
          </p>
          <Button onClick={handleClick} className="w-full bg-[#6666FF] text-white hover:bg-[#5555DD]">
            Begin Practice
          </Button>
        </div>

        {/* Organization Interview Card */}
        <div className="rounded-xl bg-[#1A1A1A] p-8 text-center transition-transform hover:scale-105">
          <div className="mb-6 flex justify-center">
            <Building2 className="h-16 w-16 text-[#6666FF]" />
          </div>
          <h3 className="mb-4 text-2xl font-bold text-white">Interview by Organization</h3>
          <p className="mb-6 text-gray-400">
            Take organization-specific interviews tailored to your target company's requirements and culture.
          </p>
          <Button onClick={handleClick} className="w-full bg-[#6666FF] text-white hover:bg-[#5555DD]">
            Select Organization
          </Button>
        </div>
      </div>
    </section>
  )
}

