export default function ProblemSection() {
  return (
    <section className="px-4 py-16 text-center md:px-12 bg-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">
          Hiring is Broken
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Time Consuming</h3>
            <p className="text-gray-400">
              Interviews waste countless hours of your team's valuable time with repetitive processes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Prone to Cheating</h3>
            <p className="text-gray-400">
              Remote setups make it easy for candidates to cheat on tests and interviews.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Biased & Unfair</h3>
            <p className="text-gray-400">
              Human bias affects hiring decisions, leading to unfair candidate evaluation.
            </p>
          </div>
        </div>

        <div className="mt-12 p-8 bg-[#2A2A2A] rounded-xl">
          <p className="text-xl text-gray-300">
            "Hiring is slow, biased, and candidates often cheat in remote tests. 
            HR teams are struggling to find quality candidates efficiently."
          </p>
        </div>
      </div>
    </section>
  )
}