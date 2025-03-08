"use client"

import { useState, useEffect } from "react"

const words = ["Interview Skills", "Confidence", "Communication", "Body Language", "Real-Time Feedback"]
const typingSpeed = 100
const erasingSpeed = 50
const delayBetweenWords = 1000

export default function TypingEffect() {
  const [text, setText] = useState("")
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (!isDeleting && text.length < words[wordIndex].length) {
          setText(words[wordIndex].slice(0, text.length + 1))
        } else if (isDeleting && text.length > 0) {
          setText(text.slice(0, -1))
        } else if (text.length === 0 && isDeleting) {
          setIsDeleting(false)
          setWordIndex((prev) => (prev + 1) % words.length)
        } else if (text.length === words[wordIndex].length && !isDeleting) {
          setTimeout(() => {
            setIsDeleting(true)
          }, delayBetweenWords)
          return
        }
      },
      isDeleting ? erasingSpeed : typingSpeed,
    )

    return () => clearTimeout(timer)
  }, [text, isDeleting, wordIndex])

  return (
    <span className="inline-block text-white font-bold whitespace-nowrap border-r-2 border-white animate-blink">
      {text}
    </span>
  )
}

