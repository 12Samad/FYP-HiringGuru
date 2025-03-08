"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function InterviewSetup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    jobDescription: "",
    numberOfQuestions: "5",
    difficultyLevel: "medium",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
  
    console.log("Form submitted:", formData);
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage("Form data saved to database.");
        setTimeout(() => router.push("/start-interview"), 2000); // interview wla page idr se!
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      setMessage("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F1111] px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
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
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
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
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
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
      </div>
    </div>
  )
}
