import Image from "next/image"

export default function NewHero() {
  return (
    <section className="flex flex-col-reverse items-center justify-between gap-8 px-4 py-12 md:flex-row md:px-12">
      <div className="max-w-xl space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Run automated, cheat-proof interviews in minutes.
          </h1>
          <p className="text-xl text-gray-300">
            Save time, hire smarter, and ensure fairness with AI-powered interviews.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-[#6666FF] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#5555EE] transition-colors">
            Join the Waitlist
          </button>
          <button className="border-2 border-[#6666FF] text-[#6666FF] px-8 py-4 rounded-lg font-semibold hover:bg-[#6666FF] hover:text-white transition-colors">
            Get Early Access
          </button>
        </div>

        <p className="text-sm text-gray-400">
          Join 50+ HR managers already testing HiringGuru
        </p>
      </div>

      <div className="w-full max-w-lg">
        <Image
          src="/aceinterview_mainpic.webp"
          alt="HiringGuru AI Interview Platform"
          width={500}
          height={500}
          className="rounded-lg shadow-2xl"
        />
      </div>
    </section>
  )
}