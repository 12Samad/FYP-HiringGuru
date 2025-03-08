import Image from "next/image"

export default function TrustedSection() {
  return (
    <section className="px-4 py-12 md:px-12">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:justify-between">
        <div className="w-full max-w-lg">
          <Image
            src="/aceinterview_secpic.webp"
            alt="Illustration of trusted service"
            width={500}
            height={300}
            className="rounded-lg"
          />
        </div>

        <div className="max-w-xl space-y-6">
          <h2 className="text-2xl font-bold text-white">Trusted by job seekers worldwide</h2>
          <p className="text-gray-400">
            Stop depending on mock interviews with real people and start practicing with AI.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="rounded bg-[#6666FF] p-2 text-xl">🔍</span>
              <div>
                <p className="text-wheat">
                  <strong>Customizable Questions</strong>
                </p>
                <p className="text-gray-400">Tailor your practice to a specific job description or role</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="rounded bg-[#6666FF] p-2 text-xl">💬</span>
              <div>
                <p className="text-wheat">
                  <strong>Instant Feedback</strong>
                </p>
                <p className="text-gray-400">Identify strengths and weaknesses with instant feedback</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="rounded bg-[#6666FF] p-2 text-xl">🌍</span>
              <div>
                <p className="text-wheat">
                  <strong>Convenient and Accessible</strong>
                </p>
                <p className="text-gray-400">Accessible from anywhere, at any time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

