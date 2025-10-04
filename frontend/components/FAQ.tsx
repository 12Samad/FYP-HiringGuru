"use client"
import { useState } from "react"

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: "Is HiringGuru secure and compliant?",
      answer: "Yes, HiringGuru is built with enterprise-grade security. We are SOC 2 compliant, GDPR compliant, and use end-to-end encryption for all data. Your candidate information and interview recordings are stored securely and can be deleted upon request."
    },
    {
      question: "How accurate is the anti-cheating detection?",
      answer: "Our AI-powered anti-cheating system has a 98% accuracy rate in detecting suspicious behavior. It monitors eye movement, tab switching, multiple faces, audio anomalies, and other indicators of cheating while minimizing false positives."
    },
    {
      question: "Can candidates complete interviews on mobile devices?",
      answer: "Yes, our platform is fully responsive and works on desktop, tablet, and mobile devices. Candidates can complete interviews using any device with a camera and microphone."
    },
    {
      question: "How does the AI evaluation work?",
      answer: "Our AI analyzes multiple factors including speech patterns, content relevance, communication skills, and technical accuracy. It provides objective scoring while highlighting key strengths and areas for improvement for each candidate."
    },
    {
      question: "What happens to the interview recordings?",
      answer: "Interview recordings are securely stored for the duration specified in your settings (typically 30-90 days). You have full control over retention periods and can delete recordings at any time. All data handling complies with privacy regulations."
    },
    {
      question: "Can I customize the interview questions?",
      answer: "Absolutely! You can create fully custom questions, use our AI-generated templates, or mix both approaches. The platform supports various question types including video responses, coding challenges, and scenario-based questions."
    },
    {
      question: "How much does HiringGuru cost?",
      answer: "We offer flexible pricing based on your hiring volume. Early access members get special pricing. Join the waitlist to be notified about our launch pricing and exclusive beta discounts."
    },
    {
      question: "Do you integrate with existing ATS systems?",
      answer: "Yes, we integrate with popular ATS platforms including Workday, BambooHR, Greenhouse, and others. We also provide API access for custom integrations with your existing hiring workflow."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <section className="px-4 py-16 md:px-12 bg-[#0F1111]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-300">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#1A1A1A] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-[#2A2A2A] transition-colors"
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <div className={`transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-[#6666FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <div className="border-t border-gray-600 pt-4">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-[#2A2A2A] p-8 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Our team is here to help. Reach out and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@hiringguru.com" 
                className="bg-[#6666FF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5555EE] transition-colors"
              >
                Contact Support
              </a>
              <a 
                href="#waitlist" 
                className="border-2 border-[#6666FF] text-[#6666FF] px-6 py-3 rounded-lg font-semibold hover:bg-[#6666FF] hover:text-white transition-colors"
              >
                Join Waitlist
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}