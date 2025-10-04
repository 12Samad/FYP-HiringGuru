export default function SocialProof() {
  const testimonials = [
    {
      quote: "HiringGuru reduced our interview time by 70% while improving candidate quality.",
      name: "Sarah Johnson",
      role: "HR Director",
      company: "TechCorp"
    },
    {
      quote: "The anti-cheating features gave us confidence in remote hiring for the first time.",
      name: "Mike Chen",
      role: "Talent Acquisition Manager", 
      company: "StartupXYZ"
    },
    {
      quote: "Finally, an unbiased way to evaluate candidates. Our diversity hiring improved significantly.",
      name: "Emma Rodriguez",
      role: "Chief People Officer",
      company: "GrowthCo"
    }
  ]

  return (
    <section className="px-4 py-16 md:px-12 bg-[#1A1A1A]">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Trusted by HR Leaders
        </h2>
        <p className="text-xl text-[#6666FF] font-semibold mb-12">
          Join 100+ HR leaders already using HiringGuru
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-[#2A2A2A] p-8 rounded-xl">
              <div className="text-4xl text-[#6666FF] mb-4">"</div>
              <p className="text-gray-300 mb-6 italic">
                {testimonial.quote}
              </p>
              <div className="border-t border-gray-600 pt-4">
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-gray-400 text-sm">{testimonial.role}</p>
                <p className="text-[#6666FF] text-sm">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#6666FF] bg-opacity-10 border border-[#6666FF] p-8 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                Join 50+ HR managers already testing HiringGuru
              </h3>
              <p className="text-gray-300">
                Be part of the future of hiring. Get early access to our beta program.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#6666FF]">100+</div>
                <div className="text-sm text-gray-400">Beta Testers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#6666FF]">500+</div>
                <div className="text-sm text-gray-400">Interviews Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#6666FF]">95%</div>
                <div className="text-sm text-gray-400">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}