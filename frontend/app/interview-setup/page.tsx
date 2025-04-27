"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import FacialExpression from "@/components/FacialExpression"
import Interview from "@/components/Interview" // Import the Interview component
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFNmIw9VUy2MYaidt2GY7DD3_Suv7TQTo",
  authDomain: "hiring-guru.firebaseapp.com",
  projectId: "hiring-guru",
  storageBucket: "hiring-guru.firebasestorage.app",
  messagingSenderId: "842977968726",
  appId: "1:842977968726:web:3513e98ec001d1aaeeb1f7",
  measurementId: "G-Y0NQB4K87X",
}

// Initialize Firebase & Firestore
initializeApp(firebaseConfig)
const db = getFirestore()

export default function InterviewSetup() {
  const router = useRouter()
  // Form state for initial setup
  const [formData, setFormData] = useState({
    jobDescription: "",
    numberOfQuestions: "5",
    difficultyLevel: "medium",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Facial expression state
  const [showInterviewInterface, setShowInterviewInterface] = useState(false)
  const [detectedEmotion, setDetectedEmotion] = useState("")

  // Extract role from job description
  const [jobRole, setJobRole] = useState("")

  // Countdown state
  const [isCountdownActive, setIsCountdownActive] = useState(false)
  const [countdown, setCountdown] = useState(5)

  // Extract role from job description
  useEffect(() => {
    if (formData.jobDescription && formData.jobDescription.trim() !== "") {
      const role = extractRoleFromDescription(formData.jobDescription)
      if (role) {
        setJobRole(role)
      }
    }
  }, [formData.jobDescription])

  // Countdown timer effect
  useEffect(() => {
    if (!isCountdownActive) return

    if (countdown <= 0) {
      setIsCountdownActive(false)
      setShowInterviewInterface(true)
      setIsLoading(false)
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isCountdownActive, countdown])

  const extractRoleFromDescription = (description: string): string => {
    // Simple extraction - check for common job titles
    const jobTitles = [
      "Software Engineer",
      "Product Manager",
      "Data Scientist",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "UX Designer",
      "UI Designer",
      "DevOps Engineer",
      "QA Engineer",
    ]

    for (const title of jobTitles) {
      if (description.toLowerCase().includes(title.toLowerCase())) {
        return title
      }
    }

    // Default to first few words
    return description.split(" ").slice(0, 3).join(" ")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    console.log("Form submitted:", formData)

    try {
      const response = await fetch("http://localhost:5000/api/auth/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Form data saved to database.")
        // Start countdown instead of immediately showing interview interface
        setIsCountdownActive(true)
        setCountdown(5) // 5 second countdown
      } else {
        setMessage(data.message || "Something went wrong")
        setIsLoading(false)
      }
    } catch (error) {
      // If server connection fails, still proceed to interview interface with countdown
      console.error("Failed to connect to the server:", error)
      setMessage("Server connection failed, but you can continue with the interview setup.")
      // Start countdown
      setIsCountdownActive(true)
      setCountdown(5)
    }
  }

  const handleEmotionUpdate = (emotion: string) => {
    console.log("Emotion detected:", emotion)
    setDetectedEmotion(emotion)
  }

  // Function to get emoji based on emotion
  const getEmotionEmoji = (emotion: string) => {
    switch (emotion) {
      case "happy":
        return "😊"
      case "neutral":
        return "😐"
      case "surprised":
        return "😲"
      case "sad":
        return "😔"
      case "angry":
        return "😠"
      default:
        return "🤔"
    }
  }

  // Function to get color based on emotion
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case "happy":
        return "text-green-400"
      case "neutral":
        return "text-blue-400"
      case "surprised":
        return "text-purple-400"
      case "sad":
        return "text-yellow-500"
      case "angry":
        return "text-red-500"
      default:
        return "text-[#6666FF]"
    }
  }

  // Function to render the emotion feedback
  const getEmotionFeedback = () => {
    if (!detectedEmotion) {
      return (
        <p className="text-white">
          Current emotion: <span className="font-bold text-yellow-400">Analyzing...</span>
        </p>
      )
    }

    const emoji = getEmotionEmoji(detectedEmotion)
    const colorClass = getEmotionColor(detectedEmotion)
    const emotionCapitalized = detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1)

    return (
      <p className="text-white">
        Current emotion:{" "}
        <span className={`font-bold ${colorClass}`}>
          {emotionCapitalized} {emoji}
        </span>
      </p>
    )
  }

  // Reset interview
  const resetInterview = () => {
    setShowInterviewInterface(false)
    setDetectedEmotion("")
    setFormData({
      jobDescription: "",
      numberOfQuestions: "5",
      difficultyLevel: "medium",
    })
  }

  // Render countdown screen
  const renderCountdown = () => {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-3xl font-bold text-[#6666FF] mb-8">Preparing Your Interview</h2>
        <div className="text-7xl font-bold text-white mb-8">{countdown}</div>
        <p className="text-xl text-gray-400">
          Starting in {countdown} second{countdown !== 1 ? "s" : ""}...
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F1111] px-4 py-12">
      <div className="w-full max-w-5xl space-y-8">
        {isCountdownActive ? (
          renderCountdown()
        ) : !showInterviewInterface ? (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#6666FF]">Setup Your Interview</h2>
              <p className="mt-2 text-gray-400">Customize your interview experience</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobDescription" className="text-white">
                    Job Description
                  </Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the full job description here..."
                    className="mt-1 min-h-[200px] w-full rounded-md border-gray-700 bg-[#1A1A1A] text-white placeholder-gray-400"
                    value={formData.jobDescription}
                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="numberOfQuestions" className="text-white">
                      Number of Questions
                    </Label>
                    <Select
                      value={formData.numberOfQuestions}
                      onValueChange={(value) => setFormData({ ...formData, numberOfQuestions: value })}
                    >
                      <SelectTrigger className="mt-1 w-full border-gray-700 bg-[#1A1A1A] text-white">
                        <SelectValue placeholder="Select number of questions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Questions</SelectItem>
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="15">15 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficultyLevel" className="text-white">
                      Difficulty Level
                    </Label>
                    <Select
                      value={formData.difficultyLevel}
                      onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}
                    >
                      <SelectTrigger className="mt-1 w-full border-gray-700 bg-[#1A1A1A] text-white">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {message && <p className="text-center text-green-400">{message}</p>}

              <Button type="submit" className="w-full bg-[#6666FF] text-white hover:bg-[#5555DD]" disabled={isLoading}>
                {isLoading ? "Setting up..." : "Start Interview"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#6666FF]">AI Interview</h2>
              <p className="mt-2 text-gray-400">Answer the questions while we monitor your facial expressions</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left side - Interview Questions */}
              <div className="lg:w-1/2 space-y-4">
                {/* Use the Interview component instead of duplicating code */}
                <Interview
                  initialEmotion={detectedEmotion || "neutral"}
                  jobDescription={formData.jobDescription}
                  numberOfQuestions={formData.numberOfQuestions}
                  difficultyLevel={formData.difficultyLevel}
                />
              </div>

              {/* Right side - Facial Expression */}
              <div className="lg:w-1/2 space-y-4">
                <div className="bg-[#1A1A1A] p-6 rounded-lg text-white">
                  <h3 className="text-xl font-bold mb-4 text-[#6666FF]">Facial Expression Analysis</h3>

                  <div className="rounded-lg overflow-hidden bg-[#222222] p-4">
                    <FacialExpression onEmotionUpdate={handleEmotionUpdate} />
                  </div>

                  <div className="mt-4 p-3 bg-[#222222] rounded-lg">{getEmotionFeedback()}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
