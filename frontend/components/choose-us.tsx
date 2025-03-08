import Image from "next/image"

export default function ChooseUs() {
  return (
    <section className="px-4 py-12 md:px-12">
      <div className="flex flex-col items-start gap-12 lg:flex-row lg:justify-between">
        <div className="max-w-xl space-y-6">
          <h2 className="text-3xl font-bold text-white">Why choose us over competitors?</h2>
          <p className="text-gray-400">
            We are the only FREE platform that offers a fully customizable interview experience.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="rounded bg-[#6666FF] p-2 text-xl">📝</span>
              <div>
                <p className="text-wheat">
                  <strong>Real-Time Insights</strong>
                </p>
                <p className="text-gray-400">
                  Receive instant feedback on your answers and body language during the interview.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="rounded bg-[#6666FF] p-2 text-xl">📈</span>
              <div>
                <p className="text-wheat">
                  <strong>Progress Tracking</strong>
                </p>
                <p className="text-gray-400">
                  Save and review detailed performance analytics to monitor improvements over time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="rounded bg-[#6666FF] p-2 text-xl">🎖️</span>
              <div>
                <p className="text-wheat">
                  <strong>AI-Powered Evaluation</strong>
                </p>
                <p className="text-gray-400">
                  Get a customized score based on role-specific interview criteria and overall performance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg">
          <Image
            src="/aceinterview_thirdpic.webp"
            alt="Illustration of why choose us"
            width={500}
            height={300}
            className="rounded-lg"
          />
        </div>
      </div>
    </section>
  )
}

