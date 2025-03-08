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

          <div className="flex flex-col gap-2">
            <a href="#" className="text-[#6666FF] hover:underline">
              🌐 Share with a job seeker
            </a>
            <a href="#" className="text-[#6666FF] hover:underline">
              📋 Copy Link
            </a>
          </div>

          <p className="text-sm text-gray-400">No signup & no data saved :)</p>
        </div>

        <div className="w-full max-w-lg">
          <Image
            src="/aceinterview_mainpic.webp"
            alt="Illustration of person working on computer"
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

