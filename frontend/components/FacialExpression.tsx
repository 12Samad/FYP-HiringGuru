"use client"
import type React from "react"

import { useEffect, useRef, useState } from "react"
import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc, increment } from "firebase/firestore"
// import TabTracker from "./TabTracker"; // Import TabTracker component
import TabTracker from "./TabTracker"

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
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface FacialExpressionProps {
  onEmotionUpdate?: (emotion: string) => void
  onPostureUpdate?: (posture: string) => void
  isInterviewComplete?: boolean
}

const FacialExpression: React.FC<FacialExpressionProps> = ({
  onEmotionUpdate,
  onPostureUpdate,
  isInterviewComplete = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [expression, setExpression] = useState<string>("")
  const [posture, setPosture] = useState<string>("")
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false)
  const [userId, setUserId] = useState<string>("guest_user")
  const postureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const emotionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastEmotionRef = useRef<string | null>(null)

  // Get userId from localStorage - This is key to fixing the issue
  useEffect(() => {
    // Force it to run in client-side only
    if (typeof window === "undefined") return

    // Define a function to retrieve and set userId
    const getUserId = () => {
      try {
        const storedId = localStorage.getItem("userId")
        console.log("DEBUG - Retrieved from localStorage:", storedId)

        if (storedId && storedId.length > 0) {
          console.log("Setting userId to:", storedId)
          setUserId(storedId)
          return true
        } else {
          console.log("No valid userId found in localStorage")
          return false
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error)
        return false
      }
    }

    // Try to get userId immediately
    const found = getUserId()

    // Set up a retry mechanism with multiple attempts
    if (!found) {
      let attemptCount = 0
      const maxAttempts = 10 // Try for longer to be sure

      console.log("Setting up userId retry mechanism")
      const checkInterval = setInterval(() => {
        attemptCount++
        console.log(`Retry attempt ${attemptCount}/${maxAttempts}`)

        if (getUserId() || attemptCount >= maxAttempts) {
          console.log(`Clearing retry interval after ${attemptCount} attempts`)
          clearInterval(checkInterval)
        }
      }, 1000) // Check every second

      // Clean up interval on component unmount
      return () => clearInterval(checkInterval)
    }
  }, []) // Empty dependency array ensures this runs once on mount

  // Log userId changes to help with debugging
  useEffect(() => {
    console.log("Current userId state:", userId)
  }, [userId])

  // Start webcam when component mounts
  useEffect(() => {
    const startWebcam = async () => {
      if (videoRef.current && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            console.log("Webcam stream loaded successfully")
            setIsWebcamActive(true)
          }
        } catch (err) {
          console.error("Error accessing webcam:", err)
        }
      }
    }

    startWebcam()

    // Cleanup function to stop webcam when component unmounts
    return () => {
      // Ensure webcam is properly closed
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => {
          track.stop()
          console.log("Webcam track stopped")
        })
        videoRef.current.srcObject = null
      }

      if (postureIntervalRef.current) {
        clearInterval(postureIntervalRef.current)
        postureIntervalRef.current = null
      }

      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current)
        emotionIntervalRef.current = null
      }
    }
  }, [])

  // Save emotions to Firebase - Modified to always use the latest userId
  const saveEmotionToFirebase = async (emotion: string) => {
    try {
      // Get userId from localStorage, fallback to state if not found
      let currentUserId = localStorage.getItem("userId")

      if (!currentUserId || currentUserId.length === 0) {
        currentUserId = userId
        console.log("Using userId from state:", currentUserId)
      } else {
        console.log("Using userId from localStorage:", currentUserId)

        if (currentUserId !== userId) {
          console.log("Updating state userId from localStorage")
          setUserId(currentUserId)
        }
      }

      // Save to Firebase
      const userRef = doc(db, "facial_expressions", currentUserId)
      const timestamp = new Date().toISOString()

      await setDoc(
        userRef,
        {
          [emotion]: increment(1),
          last_detected: timestamp,
          [`history.${timestamp}`]: emotion,
        },
        { merge: true },
      )

      console.log(`✅ Successfully stored ${emotion} in Firebase for user ${currentUserId}`)
    } catch (error) {
      console.error("❌ Error saving to Firebase:", error)
    }
  }

  // Save emotions to MongoDB via Flask backend
  const saveEmotionToMongoDB = async (emotion: string) => {
    try {
      // Get current userId from localStorage or state
      let currentUserId = localStorage.getItem("userId")
      if (!currentUserId || currentUserId.length === 0) {
        currentUserId = userId
      }

      const res = await fetch("http://localhost:5000/api/analyze-emotion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
          emotion: emotion,
        }),
      })

      // Log the actual response for debugging
      const responseText = await res.text()

      if (!res.ok) {
        console.error(`Server returned: ${responseText}`)
        throw new Error(`Failed to update emotion stats in MongoDB: ${res.status}`)
      }

      console.log(`✅ MongoDB emotion stats updated for ${emotion}`)
      console.log("Server response:", responseText)
    } catch (err) {
      console.error("❌ Error updating emotion stats in MongoDB:", err)
    }
  }

  // Process emotions using backend ML approach
  const analyzeEmotion = async () => {
    if (!videoRef.current || !isWebcamActive) return

    try {
      // Create canvas to capture video frame
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Draw current video frame to canvas
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      // Get current userId
      const currentUserId = localStorage.getItem("userId") || userId

      // Send to a new Flask API endpoint for emotion detection
      const response = await fetch("http://localhost:5000/api/analyze-emotion-ml", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageData,
          userId: currentUserId,
        }),
      })

      if (!response.ok) throw new Error("Failed to analyze emotion")

      const data = await response.json()
      const newEmotion = data.emotion

      // Only update if emotion has changed or is significant
      if (newEmotion !== lastEmotionRef.current) {
        lastEmotionRef.current = newEmotion

        // Update state
        setExpression(newEmotion)

        // Save to both databases
        saveEmotionToFirebase(newEmotion)
        saveEmotionToMongoDB(newEmotion)

        // Notify parent component if callback exists
        if (onEmotionUpdate) {
          onEmotionUpdate(newEmotion)
        }

        console.log("Emotion updated:", newEmotion)
      }
    } catch (error) {
      console.error("Error analyzing emotion:", error)
    }
  }

  // Function to analyze posture using the Flask backend
  const analyzePosture = async () => {
    if (!videoRef.current || !isWebcamActive) return

    try {
      // Create canvas to capture video frame
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Draw current video frame to canvas
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      // Get current userId
      const currentUserId = localStorage.getItem("userId") || userId

      // Send to Flask API
      const response = await fetch("http://localhost:5000/api/analyze-posture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageData,
          userId: currentUserId,
        }),
      })

      if (!response.ok) throw new Error("Failed to analyze posture")

      const data = await response.json()
      const newPosture = data.posture

      // Update state
      setPosture(newPosture)

      // Notify parent component if callback exists
      if (onPostureUpdate) {
        onPostureUpdate(newPosture)
      }

      console.log("Posture updated:", newPosture)

      // No need to save to Firebase as the backend is already doing it
    } catch (error) {
      console.error("Error analyzing posture:", error)
    }
  }

  // Start analysis when webcam is active
  useEffect(() => {
    if (!isWebcamActive) return

    // Initial delay before starting analysis
    const initialDelay = setTimeout(() => {
      // First emotion analysis
      analyzeEmotion()

      // Set up interval for repeated emotion analysis
      emotionIntervalRef.current = setInterval(analyzeEmotion, 3000) // Every 3 seconds

      // First posture analysis
      analyzePosture()

      // Set up interval for repeated posture analysis
      postureIntervalRef.current = setInterval(analyzePosture, 5000) // Every 5 seconds
    }, 3000) // Start after 3 seconds

    // Cleanup function
    return () => {
      clearTimeout(initialDelay)
      if (postureIntervalRef.current) {
        clearInterval(postureIntervalRef.current)
        postureIntervalRef.current = null
      }
      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current)
        emotionIntervalRef.current = null
      }
    }
  }, [isWebcamActive])

  // Shut down webcam when interview is complete
  useEffect(() => {
    if (isInterviewComplete && isWebcamActive) {
      console.log("Interview complete - shutting down webcam and analysis")

      // Stop all analysis intervals
      if (postureIntervalRef.current) {
        clearInterval(postureIntervalRef.current)
        postureIntervalRef.current = null
      }

      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current)
        emotionIntervalRef.current = null
      }

      // Stop webcam
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => {
          track.stop()
          console.log("Webcam track stopped due to interview completion")
        })
        videoRef.current.srcObject = null
      }

      // Update state
      setIsWebcamActive(false)
    }
  }, [isInterviewComplete])

  // Format the emotion text to be more user-friendly
  const formatEmotion = (emotion: string): string => {
    if (!emotion) return "Analyzing..."

    // Simple formatting - capitalize first letter
    return emotion.charAt(0).toUpperCase() + emotion.slice(1)
  }

  return isInterviewComplete && !isWebcamActive ? null : (
    <div className="flex flex-col items-center">
      {/* Include TabTracker at the top of the component */}
      {userId !== "guest_user" && <TabTracker userId={userId} />}

      {/* Display current user ID for debugging - can be removed in production */}
      <div className="w-full p-2 mb-2 bg-slate-800 text-xs text-gray-400">{/* User ID: {userId} */}</div>

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-lg shadow-lg"
          style={{ maxWidth: "100%", height: "auto" }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        {!isWebcamActive && !isInterviewComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
            Starting webcam...
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 w-full">
        {/* Emotion display */}
        <div className="p-3 bg-[#222222] rounded-lg text-center">
          <h3 className="text-lg text-white">
            Facial Expression: <span className="font-bold text-[#6666FF]">{formatEmotion(expression)}</span>
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {!expression ? "Analyzing..." : "Detected using ML facial analysis"}
          </p>
        </div>

        {/* Posture display */}
        <div className="p-3 bg-[#222222] rounded-lg text-center">
          <h3 className="text-lg text-white">
            Body Posture: <span className="font-bold text-[#6666FF]">{posture || "Analyzing..."}</span>
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {!posture ? "Analyzing your posture..." : "Detected based on posture analysis"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FacialExpression
