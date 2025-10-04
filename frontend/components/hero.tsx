import Image from "next/image"
import TypingEffect from "./typing-effect"
import InterviewCards from "./interview-cards"

export default function Hero() {
  return (
    <>
      <section className="flex flex-col-reverse items-center justify-between gap-8 px-4 py-12 md:flex-row md:px-12">
        <div className="max-w-xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-400">Boost Your</h1>
            <h1 className="text-4xl font-bold text-[#6666FF]">
              <TypingEffect />
            </h1>
            <h1 className="text-3xl text-gray-400">
              With <span className="text-[#6666FF] text-5xl">HIRING GURU</span>
            </h1>
          </div>

          <p className="text-gray-400">
            We offer solutions that help you prepare for your dream job. Best part? The first 15 queries are{" "}
            <span className="text-[#6666FF]">FREE.</span>
          </p>

          {/* NEW: Dual audience enhancement */}
          <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#6666FF] border-opacity-30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏢</span>
              <p className="text-sm font-semibold text-[#6666FF]">FOR HR TEAMS:</p>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Run automated, cheat-proof interviews in minutes. Save time, hire smarter, and ensure fairness with AI-powered interviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a 
                href="#waitlist" 
                className="bg-[#6666FF] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#5555EE] transition-colors text-center"
              >
                Join HR Waitlist
              </a>
              <a 
                href="#waitlist" 
                className="border border-[#6666FF] text-[#6666FF] px-4 py-2 rounded text-sm font-semibold hover:bg-[#6666FF] hover:text-white transition-colors text-center"
              >
                Get Early Access
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <a href="#" className="text-[#6666FF] hover:underline">
              🌐 Share with a job seeker
            </a>
            <a href="#" className="text-[#6666FF] hover:underline">
              📋 Copy Link
            </a>
          </div>

          <p className="text-sm text-gray-400">No signup & no data saved :)</p>

          {/* NEW: Social proof addition */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <span className="text-[#6666FF] font-bold">100+</span>
              <span>HR Leaders</span>
            </div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-1">
              <span className="text-[#6666FF] font-bold">1500+</span>
              <span>Job Seekers</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg">
          <Image
            src="/aceinterview_mainpic.webp"
            alt="HIRING GURU - AI Interview Platform for Job Seekers and HR Teams"
            width={500}
            height={500}
            className="rounded-full"
          />
        </div>
      </section>

      <InterviewCards />
    </>
  )
}