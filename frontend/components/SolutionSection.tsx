export default function SolutionSection() {
  const features = [
    {
      icon: "🤖",
      title: "Automated Interviews",
      description: "AI conducts interviews automatically, saving your team hours of manual work."
    },
    {
      icon: "🛡️",
      title: "Anti-Cheating Detection",
      description: "Advanced monitoring prevents cheating with real-time proctoring and behavior analysis."
    },
    {
      icon: "🧠",
      title: "AI-Assisted Evaluation",
      description: "Smart algorithms evaluate candidates objectively, removing human bias from the process."
    },
    {
      icon: "📊",
      title: "Easy Reporting & Dashboard",
      description: "Get comprehensive reports and insights through an intuitive dashboard interface."
    }
  ]

  return (
    <section className="px-4 py-16 md:px-12 bg-[#0F1111]">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          HiringGuru Solves Everything
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Reduce hiring time, improve quality, and remove bias and cheating with our AI-powered platform.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-[#1A1A1A] p-8 rounded-xl text-center hover:bg-[#2A2A2A] transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-[#6666FF] to-[#8888FF] p-8 rounded-xl">
          <h3 className="text-2xl font-bold text-white mb-4">
            HiringGuru helps HR teams run automated, cheat-proof interviews that save time and ensure fair hiring.
          </h3>
          <p className="text-lg text-blue-100">
            Our promise: reduce hiring time, improve quality, remove bias and cheating.
          </p>
        </div>
      </div>
    </section>
  )
}