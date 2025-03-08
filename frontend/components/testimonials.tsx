export default function Testimonials() {
  return (
    <section className="px-4 py-12 text-center md:px-12">
      <p className="text-gray-400">
        Used by <span className="text-[#6666FF] font-bold">1500+</span> job searchers across{" "}
        <span className="text-[#6666FF] font-bold">5+</span> colleges in our{" "}
        <span className="text-[#6666FF] font-bold">first week</span> live
      </p>

      <h2 className="mt-8 text-lg font-bold text-[#6666FF]">ACE INTERVIEWS WITH AI</h2>
      <h3 className="mt-4 text-3xl font-bold">Why use HIRING GURU?</h3>
      <p className="mx-auto mt-4 max-w-2xl text-gray-400">
        Provides real-time feedback, It monitors posture, facial expressions, and speaking style, helping candidates
        improve instantly for a more confident interview experience.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-[#D7B3FF] p-6 text-black">
          <p className="text-lg">
            Success in an <span className="rounded bg-[#2E2E6A] px-2 py-1 text-white">Interview</span> is the result of
            preparation, confidence, and self-belief.
          </p>
          <p className="mt-4 font-bold">
            Jordan K.
            <br />
            <span className="text-sm font-normal text-gray-700"></span>
          </p>
        </div>

        <div className="rounded-xl bg-[#B3DAFF] p-6 text-black">
          <p className="text-lg">
            Interviews are <span className="rounded bg-[#2E2E6A] px-2 py-1 text-white">Opportunity</span> to showcase
            your potential; embrace them with{" "}
            <span className="rounded bg-[#2E2E6A] px-2 py-1 text-white">confidence</span>
          </p>
          <p className="mt-4 font-bold">
            Taylor M<br />
            <span className="text-sm font-normal text-gray-700"></span>
          </p>
        </div>

        <div className="rounded-xl bg-[#FFB3D9] p-6 text-black">
          <p className="text-lg">
            Every Great <span className="rounded bg-[#2E2E6A] px-2 py-1 text-white">Accomplished</span> start with
            courage to try; let your <span className="rounded bg-[#2E2E6A] px-2 py-1 text-white">Interviews</span>{" "}
            reflect your readiness.
          </p>
          <p className="mt-4 font-bold">
            Morgan L<br />
            <span className="text-sm font-normal text-gray-700"></span>
          </p>
        </div>
      </div>
    </section>
  )
}

