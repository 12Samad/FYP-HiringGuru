export default function CTASection() {
  return (
    <section className="px-4 py-16 md:px-12 bg-gradient-to-r from-[#6666FF] to-[#8888FF]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Transform Your Hiring?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Join hundreds of HR leaders who are already revolutionizing their recruitment process with AI-powered, cheat-proof interviews.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <button className="bg-white text-[#6666FF] px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Get Early Access
          </button>
          <button className="border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-[#6666FF] transition-colors">
            Join the Waitlist Today
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-white mb-2">70%</div>
            <div className="text-blue-100">Time Saved</div>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-white mb-2">98%</div>
            <div className="text-blue-100">Cheat Detection</div>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-white mb-2">100+</div>
            <div className="text-blue-100">Beta Users</div>
          </div>
        </div>

        <p className="text-blue-200 text-sm">
          No signup fees • Free beta access • Cancel anytime
        </p>
      </div>
    </section>
  )
}