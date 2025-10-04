"use client"
import { useState } from "react"

export default function WaitlistForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    hiringVolume: "",
    painPoint: ""
  })
  
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        role: "",
        hiringVolume: "",
        painPoint: ""
      })
    }, 3000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (isSubmitted) {
    return (
      <section className="px-4 py-16 md:px-12 bg-[#1A1A1A]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-500 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            You're on the waitlist!
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            We'll notify you first when we launch. Get ready to revolutionize your hiring process!
          </p>
          <div className="bg-[#6666FF] bg-opacity-10 border border-[#6666FF] p-6 rounded-xl">
            <p className="text-[#6666FF] font-semibold">
              Keep an eye on your inbox for exclusive updates and early access invitations.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-16 md:px-12 bg-[#1A1A1A]" id="waitlist">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join the Waitlist
          </h2>
          <p className="text-xl text-gray-300">
            Be the first to experience AI-powered, cheat-proof interviews. 
            It takes less than 1 minute to join.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-[#2A2A2A] p-8 rounded-xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-[#0F1111] text-white border border-gray-600 focus:border-[#6666FF] focus:outline-none"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-[#0F1111] text-white border border-gray-600 focus:border-[#6666FF] focus:outline-none"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#0F1111] text-white border border-gray-600 focus:border-[#6666FF] focus:outline-none"
              placeholder="john.doe@company.com"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-white mb-2">
              Company / Organization *
            </label>
            <input
              type="text"
              id="company"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#0F1111] text-white border border-gray-600 focus:border-[#6666FF] focus:outline-none"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-white mb-2">
              Your Role *
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#0F1111] text-white border border-gray-600 focus:border-[#6666FF] focus:outline-none"
            >
              <option value="">Select your role</option>
              <option value="hr-manager">HR Manager</option>
              <option value="recruiter">Recruiter</option>
              <option value="founder">Founder</option>
              <option value="talent-acquisition">Talent Acquisition Specialist</option>
              <option value="hiring-manager">Hiring Manager</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="hiringVolume" className="block text-sm font-medium text-white mb-2">
              How many interviews do you run per month?
            </label>
            <select
              id="hiringVolume"
              name="hiringVolume"
              value={formData.hiringVolume}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#0F1111] text-white border border-gray-600 focus:border-[#6666FF] focus:outline-none"
            >
              <option value="">Select volume</option>
              <option value="1-10">1-10 interviews</option>
              <option value="11-25">11-25 interviews</option>
              <option value="26-50">26-50 interviews</option>
              <option value="51-100">51-100 interviews</option>
              <option value="100+">100+ interviews</option>
            </select>
          </div>

          <div>
            <label htmlFor="painPoint" className="block text-sm font-medium text-white mb-2">
              What's your biggest hiring challenge?
            </label>
            <select
              id="painPoint"
              name="painPoint"
              value={formData.painPoint}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#0F1111] text-white border border-gray-600 focus:border-[#6666FF] focus:outline-none"
            >
              <option value="">Select challenge</option>
              <option value="time-consuming">Interviews take too much time</option>
              <option value="candidate-cheating">Candidates cheat in remote tests</option>
              <option value="bias-concerns">Bias in evaluation process</option>
              <option value="quality-candidates">Finding quality candidates</option>
              <option value="scheduling-issues">Scheduling coordination</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#6666FF] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#5555EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Joining Waitlist..." : "Join the Waitlist"}
          </button>

          <p className="text-sm text-gray-400 text-center">
            By joining, you agree to receive updates about HiringGuru. 
            Unsubscribe anytime. We respect your privacy.
          </p>
        </form>
      </div>
    </section>
  )
}