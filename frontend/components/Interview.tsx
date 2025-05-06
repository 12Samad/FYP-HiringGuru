"use client"
import { useEffect, useState, useRef } from "react"
import type React from "react"

import { getFirestore, doc, setDoc, type Firestore } from "firebase/firestore"
import { getApps } from "firebase/app"
import { useRouter } from "next/navigation"
import InterviewReport from "./InterviewReport"
// Groq API Configuration - consistent across the application
const GROQ_API_KEY = "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"
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

// Don't initialize Firebase here - access the existing instance
let db: Firestore

interface InterviewProps {
  initialEmotion?: string
  jobDescription?: string
  numberOfQuestions?: string
  difficultyLevel?: string
}

const Interview: React.FC<InterviewProps> = ({
  initialEmotion = "neutral",
  jobDescription = "",
  numberOfQuestions = "5",
  difficultyLevel = "medium",
}) => {
  const router = useRouter()
  const [questions, setQuestions] = useState<string[]>([])
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [userName, setUserName] = useState("Test User")
  const [jobRole, setJobRole] = useState("")
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [emotion, setEmotion] = useState(initialEmotion)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [showReport, setShowReport] = useState(false)


  // Store the actual number of questions to use
  const [actualQuestionCount, setActualQuestionCount] = useState(5)

  // Reference to the speech synthesis utterance
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Reference to the speech recognition instance
  const recognitionRef = useRef<any>(null)

  // Initialize Firestore when component mounts
  useEffect(() => {
    // Check if Firebase is already initialized
    if (getApps().length > 0) {
      db = getFirestore()
      console.log("Firestore instance acquired")
    } else {
      console.warn("Firebase not initialized! Make sure initializeApp is called in parent component")
    }

    // Clean up speech and recognition on unmount
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel()
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          console.log("Error cleaning up recognition:", e)
        }
      }
    }
  }, [])

  // Debug helper function
  const debugState = () => {
    console.log("DEBUG STATE:", {
      questions: questions,
      questionsLength: questions.length,
      currentIndex: currentQuestionIndex,
      currentQuestion: currentQuestion,
      isComplete: interviewComplete,
      responses: responses,
      emotion: emotion,
      jobRole: jobRole,
      numberOfQuestions: numberOfQuestions,
      actualQuestionCount: actualQuestionCount,
      difficultyLevel: difficultyLevel,
      isSpeaking: isSpeaking,
      isListening: isListening,
    })
  }

  // Extract and set job role from job description when component mounts or props change
  useEffect(() => {
    if (jobDescription && jobDescription.trim() !== "") {
      const role = extractRoleFromDescription(jobDescription)
      if (role) {
        console.log("Setting job role from description:", role)
        setJobRole(role)
      }
    }
  }, [jobDescription])

  // React to emotion changes from parent component
  useEffect(() => {
    setEmotion(initialEmotion)
  }, [initialEmotion])

  // Auto-start interview when mounted and job role is set
  useEffect(() => {
    if (!interviewStarted && jobRole && !isLoading) {
      console.log("Auto-starting interview with role:", jobRole)
      startInterview()
    }
  }, [jobRole, interviewStarted, isLoading])

  // Extract role from job description
  const extractRoleFromDescription = (description: string): string => {
    // Simple extraction - check for common job titles
    const jobTitles = [
      "Fashion Designer",
      "Graphic Designer",
      "Web Developer",
      "BBA",
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
      "Marketing Manager",
      "Content Writer",
      "HR Manager",
      "Financial Analyst",
      "Project Manager",
      "Business Analyst",
      "Sales Representative",
      "Customer Support",
      "Operations Manager",
      "Executive Assistant",
    ]

    for (const title of jobTitles) {
      if (description.toLowerCase().includes(title.toLowerCase())) {
        return title
      }
    }

    // Default to first few words
    return description.split(" ").slice(0, 3).join(" ")
  }

  // Generate Questions from Groq API
  const generateQuestions = async (role: string) => {
    console.log(`Generating questions for role: ${role}`)
    console.log(`Number of questions: ${numberOfQuestions}, Difficulty: ${difficultyLevel}`)
    console.log(`Job Description: ${jobDescription?.substring(0, 50)}...`)

    // Reset critical state values
    setCurrentQuestionIndex(0)
    setResponses({})
    setInterviewComplete(false)

    setIsLoading(true)
    setError("")

    // Determine number of questions based on props
    const numQuestions = Math.max(3, Number.parseInt(numberOfQuestions) || 5)
    setActualQuestionCount(numQuestions)
    console.log(`Attempting to generate ${numQuestions} questions`)

    // Adjust difficulty based on props
    let complexityLevel = "intermediate"
    if (difficultyLevel === "low") complexityLevel = "basic"
    if (difficultyLevel === "high") complexityLevel = "advanced"

    // System message for more structured response
    const systemMessage = `You are an AI assistant specialized in generating interview questions.
                              Format your response as a numbered list, with each question on a new line.
                              Each question should be prefixed with a number followed by a period.
                              Do not include any additional text or explanations.`

    // Enhanced user message that includes the full job description when available
    const userMessage = `Generate exactly ${numQuestions} ${complexityLevel} interview questions for a ${role} role.
                           Based on the candidate's initial emotion being "${emotion}", adjust the tone to be ${
                             emotion === "happy"
                               ? "energetic and engaging"
                               : emotion === "sad"
                                 ? "supportive and encouraging"
                                 : emotion === "angry"
                                   ? "calm and measured"
                                   : emotion === "surprised"
                                     ? "clear and direct"
                                     : "professional and neutral"
                           }.
                           The questions should be challenging but fair.
                           Make sure the questions are specifically tailored for a ${role} position.
                           ${jobDescription ? `Use the following job description to create relevant questions: ${jobDescription}` : ""}`

    try {
      console.log("Sending request to Groq API...")
      console.log("API URL:", GROQ_API_URL)
      console.log("API Key:", GROQ_API_KEY.substring(0, 10) + "...")

      // Request body for Groq API
      const requestBody = {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("API Response received")

      // Handle Groq API response format with careful null checks
      if (
        !data ||
        !data.choices ||
        !data.choices.length ||
        !data.choices[0] ||
        !data.choices[0].message ||
        !data.choices[0].message.content
      ) {
        console.error("Invalid response structure from API")
        throw new Error("Invalid response structure from API")
      }

      // Parse the content of the message
      const content = data.choices[0].message.content
      console.log("Raw content received from API")

      // Extract questions using regex to handle different numbering formats
      const lines = content
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)

      // Process each line to remove numbering
      const questionsArray = lines
        .filter((line: string) => /^\d+[.)]\s+/.test(line) || line.length > 15) // Only keep lines that look like questions
        .map((line: string) => line.replace(/^\d+[.)\s]+/, "").trim()) // Remove numbering
        .filter((line: string) => line.length > 0)
        .slice(0, numQuestions)

      console.log("Extracted questions:", questionsArray.length)

      if (questionsArray.length === 0) {
        console.error("Failed to extract questions from content")
        throw new Error("Failed to extract questions from API response")
      }

      // Ensure we have at least the minimum number of questions
      const finalQuestions = ensureMinimumQuestions(questionsArray, role, numQuestions)

      setQuestions(finalQuestions)
      setActualQuestionCount(finalQuestions.length);

      console.log(`Successfully set ${finalQuestions.length} questions:`, finalQuestions)
      setCurrentQuestion(finalQuestions[0])
      setInterviewStarted(true)
      setIsLoading(false)

      // Wait a moment before starting to speak to ensure the UI has updated
      setTimeout(() => {
        askQuestion(finalQuestions[0])
      }, 500)

      console.log("Questions loaded successfully")
      debugState()
    } catch (error) {
      console.error("Error generating questions:", error)
      setError("Failed to connect to interview service. Using fallback questions.")

      // Generate fallback questions
      const fallbackQuestions = generateFallbackQuestions(role, numQuestions)

      console.log("Using fallback questions, count:", fallbackQuestions.length)

      setQuestions(fallbackQuestions)
      setActualQuestionCount(fallbackQuestions.length);
      console.log(`Using ${fallbackQuestions.length} fallback questions:`, fallbackQuestions)
      setCurrentQuestion(fallbackQuestions[0])
      setCurrentQuestionIndex(0) // Explicitly reset the index
      setInterviewStarted(true)
      setIsLoading(false)

      // Wait a moment before starting to speak
      setTimeout(() => {
        askQuestion(fallbackQuestions[0])
      }, 500)

      debugState()
    }
  }

  // Ensure we have at least the minimum number of questions
  const ensureMinimumQuestions = (questions: string[], role: string, minCount: number): string[] => {
    if (questions.length >= minCount) {
      return questions
    }

    // If we don't have enough questions, add some generic ones
    const genericQuestions = [
      `Tell me about your experience as a ${role}.`,
      `What skills do you think are most important for a ${role} position?`,
      `Describe a challenging situation you faced in your previous role as a ${role} and how you handled it.`,
      `Where do you see yourself in 5 years in the ${role} field?`,
      `What motivates you to work as a ${role}?`,
      `How do you stay updated with the latest trends in the ${role} field?`,
      `What's your approach to problem-solving as a ${role}?`,
      `How do you handle feedback and criticism in your work?`,
      `What's your greatest professional achievement as a ${role}?`,
      `How do you prioritize tasks when working on multiple projects?`,
    ]

    // Add generic questions until we reach the minimum count
    const neededCount = minCount - questions.length
    return [...questions, ...genericQuestions.slice(0, neededCount)]
  }

  // Generate fallback questions
  const generateFallbackQuestions = (role: string, numQuestions: number): string[] => {
    // Extract keywords from job description if available
    const keywords: string[] = []
    if (jobDescription) {
      const words = jobDescription.toLowerCase().split(/\s+/)
      // List of common technical skills and keywords
      const techKeywords = [
        "javascript",
        "react",
        "vue",
        "angular",
        "node",
        "python",
        "java",
        "c#",
        "php",
        "aws",
        "azure",
        "cloud",
        "docker",
        "kubernetes",
        "ci/cd",
        "agile",
        "scrum",
        "sql",
        "nosql",
        "mongodb",
        "database",
        "api",
        "rest",
        "graphql",
        "machine learning",
        "ai",
        "artificial intelligence",
        "data",
        "analytics",
        "ui",
        "ux",
        "design",
        "frontend",
        "backend",
        "fullstack",
        "mobile",
        "ios",
        "android",
        "devops",
        "security",
        "testing",
        "qa",
      ]

      techKeywords.forEach((keyword) => {
        if (words.includes(keyword) || jobDescription.toLowerCase().includes(keyword)) {
          keywords.push(keyword)
        }
      })
    }

    // Generic questions that work for any role
    const genericQuestions = [
      `Tell me about your experience as a ${role}.`,
      `What skills do you think are most important for a ${role} position?`,
      `Describe a challenging situation you faced in your previous role as a ${role} and how you handled it.`,
      `Where do you see yourself in 5 years in the ${role} field?`,
      `What motivates you to work as a ${role}?`,
      `How do you stay updated with the latest trends in the ${role} field?`,
      `What's your approach to problem-solving as a ${role}?`,
      `How do you handle feedback and criticism in your work?`,
      `What's your greatest professional achievement as a ${role}?`,
      `How do you prioritize tasks when working on multiple projects?`,
    ]

    // Role-specific fallback questions
    const roleSpecificQuestions: { [key: string]: string[] } = {
      "Software Engineer": [
        "Can you walk me through your experience with frontend frameworks like React, Vue, or Angular? Which one do you prefer and why?",
        "Describe how you would structure a REST API for a social media application. What endpoints would you create and what technologies would you use?",
        "How do you handle authentication and authorization in your web applications? What security considerations do you keep in mind?",
        "Explain your approach to optimizing web application performance. What metrics do you focus on and what tools do you use?",
        "How do you ensure your code is maintainable and scalable? What design patterns do you commonly implement?",
      ],
      "Fashion Designer": [
        "Can you describe your design process from concept to final product?",
        "What fashion trends do you think will be important in the coming season?",
        "How do you balance creativity with commercial viability in your designs?",
        "Tell me about a time when you had to adapt your design to meet budget or material constraints.",
        "How do you incorporate sustainability into your fashion design process?",
      ],
      "Data Scientist": [
        "Explain a complex data analysis project you've worked on and the insights you discovered.",
        "What machine learning algorithms do you have experience with, and how do you choose which one to use?",
        "How do you handle missing or incomplete data in your analysis?",
        "Describe your experience with data visualization tools and techniques.",
        "How do you communicate technical findings to non-technical stakeholders?",
      ],
    }

    // Generate keyword-based questions if we have keywords from the job description
    const keywordQuestions = keywords
      .map((keyword) => `Can you tell me about your experience with ${keyword}?`)
      .slice(0, 3) // Limit to 3 keyword questions

    // Check if we have specific questions for this role
    let allQuestions = []
    if (roleSpecificQuestions[role]) {
      allQuestions = [...keywordQuestions, ...roleSpecificQuestions[role], ...genericQuestions]
    } else {
      allQuestions = [...keywordQuestions, ...genericQuestions]
    }

    // Ensure we have at least the requested number of questions
    if (allQuestions.length < numQuestions) {
      // Add variations of generic questions if needed
      const variations = [
        `What do you consider your biggest strength as a ${role}?`,
        `What area do you think you need to improve on as a ${role}?`,
        `How do you handle tight deadlines in your work?`,
        `Describe your ideal work environment.`,
        `How do you approach collaboration with team members?`,
        `What tools or software are you most comfortable using in your work?`,
        `How do you measure success in your role?`,
        `What was the most challenging project you've worked on and why?`,
        `How do you handle disagreements with colleagues or managers?`,
        `What makes you passionate about this field?`,
      ]
      allQuestions = [...allQuestions, ...variations]
    }

    // Return the requested number of questions
    return allQuestions.slice(0, numQuestions)
  }

  // Text-to-Speech (Read Question Aloud)
  const askQuestion = (text: string) => {
    // Ensure question is set in the UI before speaking it
    setCurrentQuestion(text)

    console.log(`Asking question: ${text}`)

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    // Create new speech instance
    const speech = new SpeechSynthesisUtterance(text)
    speech.lang = "en-US"
    speech.rate = 0.9 // Slightly slower rate for better clarity

    // Store reference to speech
    speechRef.current = speech

    // Set speaking flag
    setIsSpeaking(true)

    // Add event handlers
    speech.onstart = () => {
      console.log("Speech started")
      setIsSpeaking(true)
    }

    speech.onend = () => {
      console.log("Speech ended")
      setIsSpeaking(false)
      // Wait a short moment before starting to listen
      setTimeout(() => {
        listenForAnswer()
      }, 500)
    }

    speech.onerror = (e) => {
      console.error("Speech error:", e)
      setIsSpeaking(false)
      listenForAnswer()
    }

    // Start speaking
    window.speechSynthesis.speak(speech)
  }

  // Speech-to-Text (Capture User Answer)
  // Replace ONLY the listenForAnswer function with this version:

const listenForAnswer = () => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Speech recognition not supported.");
      setError("Speech recognition is not supported in your browser. Please type your answer below.");
      setIsListening(true); // Still set to true so user can type answer
      return;
    }
  
    // Ensure we're not already listening
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.log("Error stopping previous recognition:", e);
      }
    }
  
    setIsListening(true);
    console.log("Listening for answer...");
    console.log("Current question index:", currentQuestionIndex, "of", questions.length);
  
    try {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognitionRef.current = recognition;
  
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
  
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const isFinal = event.results[0].isFinal;
  
        // Update the current transcript regardless of whether it's final
        setCurrentTranscript(transcript);
  
       // Then in your listenForAnswer function, update the response handling like this:
if (isFinal) {
    console.log(`User answered: ${transcript}`);
    console.log(`Current question index: ${currentQuestionIndex}, Total questions: ${questions.length}`);
  
    // Store response using current question text as key
    const updatedResponses = {...responses};
    updatedResponses[currentQuestionIndex] = transcript;
    setResponses(updatedResponses);
    
    setIsListening(false);
    setCurrentTranscript(""); // Clear the transcript after saving
  
    // Get a local value for checks to avoid state timing issues
    const isLastQuestion = currentQuestionIndex >= actualQuestionCount - 1;
    
    console.log(`Is this the last question? ${isLastQuestion}`);
    console.log(`Current responses:`, updatedResponses);
  
    if (!isLastQuestion) {
      // Move to next question - using a timeout to ensure state updates
      const nextIndex = currentQuestionIndex + 1;
      
      // First update state
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      
      // Then wait a moment before asking next question
      setTimeout(() => {
        console.log(`Moving to question ${nextIndex + 1} of ${questions.length}`);
        askQuestion(questions[nextIndex]);
      }, 1500);
    } else {
      console.log("All questions answered. Interview complete.");
      
      // Only set interviewComplete after storage is successful
      storeInterviewData(userName, jobRole)
        .then(() => {
          console.log("Interview data stored successfully");
          setInterviewComplete(true);
        })
        .catch((err) => {
          console.error("Error storing interview data:", err);
          setError("Failed to save responses, but interview is complete.");
          setInterviewComplete(true);
        });
    }
  }
      };
  
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setError(`Speech recognition error: ${event.error}. Please type your answer instead.`);
        setIsListening(true); // Keep listening state true so user can type
      };
  
      recognition.start();
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setError("There was an error with speech recognition. Please type your answer instead.");
      setIsListening(true);
    }
  };

  // Store Interview Data in Firebase Firestore
  const storeInterviewData = async (name: string, role: string): Promise<void> => {
    try {
      // Check if db is initialized
      if (!db) {
        console.error("Firestore not initialized")
        setError("Failed to save your responses. Database connection error.")
        return Promise.reject(new Error("Firestore not initialized"))
      }

      // Convert responses from index-based to question-based for better readability
      const formattedResponses: { [key: string]: string } = {}
      Object.entries(responses).forEach(([index, answer]) => {
        const questionIndex = Number.parseInt(index)
        if (!isNaN(questionIndex) && questionIndex < questions.length) {
          formattedResponses[questions[questionIndex]] = answer
        }
      })

      const timestamp = new Date().toISOString()
      const docId = `${name.replace(/\s+/g, "_")}_${timestamp}`
      await setDoc(doc(db, "interviews", docId), {
        name,
        role,
        responses: formattedResponses,
        initialEmotion: emotion,
        numberOfQuestions: actualQuestionCount,
        difficultyLevel,
        timestamp,
        jobDescription: jobDescription?.substring(0, 500) || "", // Store a portion of the job description
      })
      console.log("Interview responses stored in Firebase!")
      return Promise.resolve()
    } catch (error) {
      console.error("Error saving to Firebase:", error)
      setError("Failed to save your responses. Please try again.")
      return Promise.reject(error)
    }
  }

  // Start the Interview
  const startInterview = () => {
    if (!userName.trim() || !jobRole.trim()) {
      setError("Please enter both your name and job role")
      return
    }
    console.log(`Starting interview for ${userName} - Role: ${jobRole} - Initial emotion: ${emotion}`)

    // Reset interview state to ensure clean start
    setCurrentQuestionIndex(0)
    setResponses({})
    setInterviewComplete(false)

    generateQuestions(jobRole)
  }

  // Handle manual answer submission (fallback for speech recognition)
  const submitManualAnswer = (answer: string) => {
    if (!answer.trim()) {
      setError("Please provide an answer")
      return
    }

    // Cancel any ongoing speech or recognition
    window.speechSynthesis.cancel()
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        console.log("Error stopping recognition:", e)
      }
    }

    console.log("Submitting manual answer for question", currentQuestionIndex + 1)
    console.log("Current question:", currentQuestion)
    console.log("Total questions:", questions.length)

    setError("")
    setResponses((prev) => ({ ...prev, [currentQuestionIndex]: answer }))
    setIsListening(false)

    if (currentQuestionIndex < actualQuestionCount - 1) {
      const nextIndex = currentQuestionIndex + 1
      console.log("Moving to question", nextIndex + 1)

      // Update state with next question
      setCurrentQuestionIndex(nextIndex)
      setCurrentQuestion(questions[nextIndex])

      // Wait a moment before asking the next question
      setTimeout(() => {
        console.log("Asking next question:", questions[nextIndex])
        askQuestion(questions[nextIndex])
      }, 1000)
    } else {
      console.log("All questions answered. Interview complete.")
      // Only set interviewComplete after storage is successful
      storeInterviewData(userName, jobRole)
        .then(() => {
          setInterviewComplete(true)
        })
        .catch((err) => {
          console.error("Error storing interview data:", err)
          setError("Failed to save responses, but interview is complete.")
          setInterviewComplete(true)
        })
    }
  }

  // Reset interview and redirect to dashboard
  const cancelAndRedirect = () => {
    // Cancel any ongoing speech or recognition
    window.speechSynthesis.cancel()
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        console.log("Error stopping recognition:", e)
      }
    }

    // Reset all state
    resetInterview()

    // Redirect to dashboard
    router.push("/")
  }

  // Reset interview
  const resetInterview = () => {
    // Cancel any ongoing speech or recognition
    window.speechSynthesis.cancel()
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        console.log("Error stopping recognition:", e)
      }
    }

    setInterviewStarted(false)
    setCurrentQuestionIndex(0)
    setQuestions([])
    setResponses({})
    setIsListening(false)
    setIsSpeaking(false)
    setCurrentQuestion("")
    setInterviewComplete(false)
    setError("")
  }

  if (!interviewStarted) {
    return (
      <div className="flex flex-col space-y-4 bg-[#1A1A1A] p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold text-[#6666FF] mb-4">Interview Setup</h2>

        {error && <div className="bg-red-900 text-white p-3 rounded-md mb-4">{error}</div>}

        <div className="mb-4">
          <p className="text-gray-400 mb-2">
            Initial detected emotion: <span className="font-bold text-[#6666FF]">{emotion}</span>
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">Your Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-[#222222] text-white focus:outline-none focus:ring-[#6666FF] focus:border-[#6666FF]"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">Job Role</label>
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-[#222222] text-white focus:outline-none focus:ring-[#6666FF] focus:border-[#6666FF]"
          />
        </div>
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-1">Number of Questions (minimum 3)</label>
          <input
            type="number"
            min="3"
            max="10"
            value={numberOfQuestions}
            onChange={(e) => {
              const value = Math.max(3, Number.parseInt(e.target.value) || 5)
              setActualQuestionCount(value)
            }}
            className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-[#222222] text-white focus:outline-none focus:ring-[#6666FF] focus:border-[#6666FF]"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={startInterview}
            disabled={isLoading}
            className="bg-[#6666FF] text-white py-2 px-8 rounded-md hover:bg-[#5555DD] transition duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? "Setting up interview..." : "Start Interview"}
          </button>
        </div>
      </div>
    )
  }

  if (interviewComplete) {
    return (
      <div className="text-center bg-[#1A1A1A] p-6 rounded-lg text-white">
        {showReport ? (
          // Show the report component when showReport is true
          <div>
            <InterviewReport userId={localStorage.getItem("userId") || "guest_user"} />
            <button
              onClick={() => setShowReport(false)}
              className="mt-4 bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
            >
              Back to Interview Results
            </button>
          </div>
        ) : (
          // Show the normal interview complete screen when showReport is false
          <>
            <h3 className="text-xl font-bold mb-4 text-[#6666FF]">Interview Complete!</h3>
            <p className="mb-6 text-gray-300">Thank you for completing the interview. Your responses have been saved.</p>
      
            <div className="bg-[#222222] p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2 text-white">Your Responses:</h4>
              {Object.entries(responses).map(([questionIndex, answer], index) => (
                <div key={index} className="mb-4 text-left">
                  <p className="font-medium text-[#6666FF]">Q: {questions[parseInt(questionIndex)]}</p>
                  <p className="text-gray-300">A: {answer}</p>
                </div>
              ))}
            </div>
      
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/")}
                className="bg-[#6666FF] text-white py-2 px-4 rounded-md hover:bg-[#5555DD] transition duration-200"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => setShowReport(true)}
                className="bg-[#444444] text-white py-2 px-4 rounded-md hover:bg-[#555555] transition duration-200"
              >
                Generate Report
              </button>
              <button
                onClick={resetInterview}
                className="bg-transparent border border-[#6666FF] text-[#6666FF] py-2 px-4 rounded-md hover:bg-[#6666FF]/10 transition duration-200"
              >
                New Interview
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-[#1A1A1A] p-6 rounded-lg text-white">
      {error && <div className="bg-red-900 text-white p-3 rounded-md mb-4">{error}</div>}

      <div className="bg-[#222222] p-4 rounded-lg">
        <h3 className="font-bold mb-2 text-[#6666FF]">Current Question:</h3>
        <p className="text-lg text-white">{currentQuestion}</p>

        {/* Status indicator */}
        <div className="mt-2 flex items-center">
          <div
            className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-green-400 animate-pulse" : "bg-gray-600"} mr-2`}
          ></div>
          <p className="text-xs text-gray-400">{isSpeaking ? "Speaking question..." : "Question ready"}</p>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-gray-700 bg-[#222222]">
        <div className="flex items-center mb-4">
          <div
            className={`w-3 h-3 rounded-full ${isListening ? "bg-red-500 animate-pulse" : "bg-gray-600"} mr-2`}
          ></div>
          <p className="text-gray-300">{isListening ? "Listening... Speak your answer" : "Ready for next question"}</p>
        </div>

        {/* Add this block to display the current transcript */}
        {isListening && currentTranscript && (
          <div className="mb-4 p-3 bg-[#333333] rounded-md">
            <p className="text-white">{currentTranscript}</p>
          </div>
        )}

        <div className="text-sm text-gray-400 mb-2">
          {isListening
            ? "If speech recognition isn't working, you can type your answer below:"
            : "Question will automatically advance after your answer"}
        </div>

        {isListening && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type your answer here..."
              className="flex-1 px-3 py-2 border border-gray-700 rounded-md bg-[#333333] text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submitManualAnswer((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ""
                }
              }}
            />
            <button
              className="bg-[#6666FF] text-white px-4 py-2 rounded-md hover:bg-[#5555DD]"
              onClick={(e) => {
                const input = (e.target as HTMLElement).previousSibling as HTMLInputElement
                submitManualAnswer(input.value)
                input.value = ""
              }}
            >
              Submit
            </button>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-[#6666FF] h-2.5 rounded-full"
            style={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <div className="text-sm text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <button onClick={cancelAndRedirect} className="text-sm text-red-400 hover:text-red-300">
            Cancel Interview
          </button>
        </div>
      </div>
    </div>
  )
}

export default Interview
