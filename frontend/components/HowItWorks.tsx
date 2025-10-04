export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Post Interview Questions",
      description: "Create customized interview questions or choose from our AI-generated templates.",
      icon: "📝"
    },
    {
      step: "02", 
      title: "Candidates Record Answers",
      description: "Candidates complete the interview remotely with video responses at their convenience.",
      icon: "🎥"
    },
    {
      step: "03",
      title: "Anti-Cheating Checks Run",
      description: "Our AI automatically monitors for cheating behaviors and suspicious activities.",
      icon: "🛡️"
    },
    {
      step: "04",
      title: "Receive Report & Insights",
      description: "Get detailed scoring, insights, and recommendations for each candidate.",
      icon: "📊"
    }
  ]

  return (
    <section className="px-4 py-16 md:px-12 bg-[#0F1111]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Simple 4-step process to revolutionize your hiring workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line - hidden on last item */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-[#6666FF] opacity-30 transform -translate-y-1/2 z-0"></div>
              )}
              
              <div className="relative bg-[#1A1A1A] p-8 rounded-xl text-center hover:bg-[#2A2A2A] transition-colors z-10">
                <div className="w-16 h-16 bg-[#6666FF] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">{step.icon}</span>
                </div>
                
                <div className="text-sm font-bold text-[#6666FF] mb-2">STEP {step.step}</div>
                <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[#6666FF] to-[#8888FF] p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Hiring Process?
            </h3>
            <p className="text-blue-100 mb-6">
              Join the waitlist and be among the first to experience the future of recruiting.
            </p>
            <button className="bg-white text-[#6666FF] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Early Access Now
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}