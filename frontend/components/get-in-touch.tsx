"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import { Mail, Phone, Linkedin, Twitter } from "lucide-react"

export default function GetInTouch() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, you would send this to your backend
    console.log("Form submitted:", formData)
    setSubmitted(true)
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center px-4 py-16 text-center md:px-12">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image src="/placeholder.svg?height=800&width=1600" alt="Background pattern" fill className="object-cover" />
        </div>
        <div className="z-10 max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold md:text-5xl">
            We'd Love to <span className="text-[#6666FF]">Hear from You!</span>
          </h1>
          <p className="text-lg text-gray-400">
            Have questions, suggestions, or partnership ideas? Reach out, and we'll get back to you as soon as possible!
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              className="bg-[#6666FF] px-8 py-6 text-lg hover:bg-[#5555DD]"
              onClick={() => {
                document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Send a Message
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Form and Alternative Contact */}
      <section id="contact-form" className="px-4 py-16 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-xl bg-zinc-900 p-8">
            <h2 className="mb-6 text-2xl font-bold">Send Us a Message</h2>
            {submitted ? (
              <div>
                <div className="mb-4 text-5xl">✅</div>
                <h3 className="mb-2 text-2xl font-bold text-[#6666FF]">Message Sent!</h3>
                <p className="text-gray-400">Thanks for reaching out. We'll get back to you as soon as possible.</p>
                <Button className="mt-6 bg-[#6666FF] hover:bg-[#5555DD]" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-gray-400">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-[#6666FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-gray-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-[#6666FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="mb-2 block text-gray-400">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-[#6666FF] focus:outline-none"
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Support">Support</option>
                    <option value="Feedback">Feedback</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-gray-400">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-[#6666FF] focus:outline-none"
                  ></textarea>
                </div>
                <Button type="submit" className="w-full bg-[#6666FF] py-6 text-lg hover:bg-[#5555DD]">
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Alternative Contact */}
          <div className="space-y-8">
            <div>
              <h2 className="mb-6 text-2xl font-bold">Alternative Ways to Reach Us</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6666FF]">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Us</h3>
                    <a href="mailto:support@hiringguru.com" className="text-[#6666FF] hover:underline">
                      info@hiringguru.agency
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6666FF]">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Call Us</h3>
                    <a href="tel:+1234567890" className="text-[#6666FF] hover:underline">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6666FF]">
                    <Linkedin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">LinkedIn</h3>
                    <a
                      href="https://linkedin.com/company/hiringguru"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6666FF] hover:underline"
                    >
                      linkedin.com/company/hiringguru
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6666FF]">
                    <Twitter className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Twitter</h3>
                    <a
                      href="https://twitter.com/hiringguru"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6666FF] hover:underline"
                    >
                      @hiringguru
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="rounded-xl bg-zinc-900 p-8">
              <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="rounded-md bg-zinc-800 p-4">
                  <summary className="cursor-pointer font-semibold text-[#6666FF]">How do I schedule a demo?</summary>
                  <p className="mt-2 text-gray-400">
                    You can schedule a demo by sending us a message through the contact form or by emailing us directly
                    at support@hiringguru.com with the subject "Demo Request".
                  </p>
                </details>
                <details className="rounded-md bg-zinc-800 p-4">
                  <summary className="cursor-pointer font-semibold text-[#6666FF]">Do you offer integrations?</summary>
                  <p className="mt-2 text-gray-400">
                    Yes, we're working on integrations with popular ATS and HR platforms. Contact us for more details
                    about specific integrations you're interested in.
                  </p>
                </details>
                <details className="rounded-md bg-zinc-800 p-4">
                  <summary className="cursor-pointer font-semibold text-[#6666FF]">
                    How quickly do you respond to inquiries?
                  </summary>
                  <p className="mt-2 text-gray-400">
                    We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please
                    mark your email as high priority.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 px-4 py-8 text-center md:px-12">
        <p className="text-gray-400">
          Have an urgent question? Drop us an email at{" "}
          <a href="mailto:support@hiringguru.com" className="text-[#6666FF] hover:underline">
            support@hiringguru.com
          </a>
          !
        </p>
      </footer>
    </div>
  )
}

