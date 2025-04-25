"use client";
import { useEffect, useState, useRef } from "react";
import { getFirestore, doc, setDoc, Firestore } from "firebase/firestore";
import { getApps } from "firebase/app";
import { useRouter } from "next/navigation";

// Groq API Configuration - consistent across the application
const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Don't initialize Firebase here - access the existing instance
let db: Firestore;

interface InterviewProps {
  initialEmotion?: string;
  jobDescription?: string;
  numberOfQuestions?: string;
  difficultyLevel?: string;
}

const Interview: React.FC<InterviewProps> = ({ 
  initialEmotion = "neutral",
  jobDescription = "",
  numberOfQuestions = "5",
  difficultyLevel = "medium"
}) => {
    const router = useRouter();
    const [questions, setQuestions] = useState<string[]>([]);
    const [responses, setResponses] = useState<{ [key: string]: string }>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [userName, setUserName] = useState("Test User");
    const [jobRole, setJobRole] = useState("Software Engineer");
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [emotion, setEmotion] = useState(initialEmotion);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Reference to the speech synthesis utterance
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
    
    // Reference to the speech recognition instance
    const recognitionRef = useRef<any>(null);

    // Initialize Firestore when component mounts
    useEffect(() => {
        // Check if Firebase is already initialized
        if (getApps().length > 0) {
            db = getFirestore();
            console.log("Firestore instance acquired");
        } else {
            console.warn("Firebase not initialized! Make sure initializeApp is called in parent component");
        }
        
        // Clean up speech and recognition on unmount
        return () => {
            if (speechRef.current) {
                window.speechSynthesis.cancel();
            }
            
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    console.log("Error cleaning up recognition:", e);
                }
            }
        };
    }, []);

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
            difficultyLevel: difficultyLevel,
            isSpeaking: isSpeaking,
            isListening: isListening
        });
    };

    // Use job description from props if available
    useEffect(() => {
      if (jobDescription && jobDescription.trim() !== "") {
        const role = extractRoleFromDescription(jobDescription);
        if (role) {
          setJobRole(role);
        }
      }
    }, [jobDescription]);

    // React to emotion changes from parent component
    useEffect(() => {
      setEmotion(initialEmotion);
    }, [initialEmotion]);

    // Auto-start interview when mounted
    useEffect(() => {
      if (!interviewStarted && jobRole && !isLoading) {
        startInterview();
      }
    }, [jobRole, interviewStarted, isLoading]);

    // Extract role from job description
    const extractRoleFromDescription = (description: string): string => {
      // Simple extraction - first 3 words or if contains specific job titles
      const jobTitles = [
        "Software Engineer", "Product Manager", "Data Scientist", 
        "Frontend Developer", "Backend Developer", "Full Stack Developer",
        "UX Designer", "UI Designer", "DevOps Engineer", "QA Engineer"
      ];
      
      for (const title of jobTitles) {
        if (description.includes(title)) {
          return title;
        }
      }
      
      // Default to first few words
      return description.split(' ').slice(0, 3).join(' ');
    };

    // Generate Questions from Groq API
    const generateQuestions = async (role: string) => {
        // Reset critical state values
        setCurrentQuestionIndex(0);
        setResponses({});
        setInterviewComplete(false);
        
        setIsLoading(true);
        setError("");
        
        // Determine number of questions based on props
        const numQuestions = parseInt(numberOfQuestions) || 5;
        
        // Adjust difficulty based on props
        let complexityLevel = "intermediate";
        if (difficultyLevel === "low") complexityLevel = "basic";
        if (difficultyLevel === "high") complexityLevel = "advanced";

        // System message for more structured response
        const systemMessage = `You are an AI assistant specialized in generating interview questions.
                              Format your response as a numbered list, with each question on a new line.
                              Each question should be prefixed with a number followed by a period.
                              Do not include any additional text or explanations.`;

        // User message with interview requirements
        const userMessage = `Generate exactly ${numQuestions} ${complexityLevel} interview questions for a ${role} role.
                           Based on the candidate's initial emotion being "${emotion}", adjust the tone to be ${
                             emotion === "happy" ? "energetic and engaging" : 
                             emotion === "sad" ? "supportive and encouraging" :
                             emotion === "angry" ? "calm and measured" :
                             emotion === "surprised" ? "clear and direct" :
                             "professional and neutral"
                           }.
                           The questions should be challenging but fair.`;

        try {
            console.log("Sending request to Groq API...");
            console.log("API URL:", GROQ_API_URL);
            console.log("API Key:", GROQ_API_KEY.substring(0, 10) + "...");
            
            // Request body for Groq API
            const requestBody = {
                model: "llama3-8b-8192",
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 1000,
                temperature: 0.7
            };
            
            console.log("Request body:", JSON.stringify(requestBody));
            
            const response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error:", response.status, errorText);
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("API Response:", data);
            
            // Handle Groq API response format with careful null checks
            if (!data || !data.choices || !data.choices.length || !data.choices[0] || 
                !data.choices[0].message || !data.choices[0].message.content) {
                console.error("Invalid response structure:", data);
                throw new Error("Invalid response structure from API");
            }

            // Parse the content of the message
            const content = data.choices[0].message.content;
            console.log("Raw content from API:", content);
            
            // Extract questions using regex to handle different numbering formats
            const lines = content.split('\n')
                .map((line: string) => line.trim())
                .filter((line: string) => line.length > 0);
            
            console.log("Lines extracted:", lines);
            
            // Process each line to remove numbering
            const questionsArray = lines
                .filter((line: string) => /^\d+[\.\)]\s+/.test(line) || line.length > 15) // Only keep lines that look like questions
                .map((line: string) => line.replace(/^\d+[\.\)]\s+/, "").trim()) // Remove numbering
                .filter((line: string) => line.length > 0)
                .slice(0, numQuestions);
            
            console.log("Extracted questions:", questionsArray);

            if (questionsArray.length === 0) {
                console.error("Failed to extract questions from content");
                throw new Error("Failed to extract questions from API response");
            }

            setQuestions(questionsArray);
            setCurrentQuestion(questionsArray[0]);
            setInterviewStarted(true);
            setIsLoading(false);
            
            // Wait a moment before starting to speak to ensure the UI has updated
            setTimeout(() => {
                askQuestion(questionsArray[0]);
            }, 500);
            
            console.log("Questions loaded:", questionsArray.length);
            debugState();
            
        } catch (error) {
            console.error("Error generating questions:", error);
            setError("Failed to connect to interview service. Using fallback questions.");
            
            // Fallback questions if API fails - improved full stack developer questions
            const fallbackQuestions = [
                "Can you walk me through your experience with frontend frameworks like React, Vue, or Angular? Which one do you prefer and why?",
                "Describe how you would structure a REST API for a social media application. What endpoints would you create and what technologies would you use?",
                "How do you handle authentication and authorization in your web applications? What security considerations do you keep in mind?",
                "Explain your approach to optimizing web application performance. What metrics do you focus on and what tools do you use?",
                "How do you ensure your code is maintainable and scalable? What design patterns do you commonly implement?",
                "Tell me about a challenging bug you encountered and how you debugged and resolved it.",
                "How do you implement responsive design in your applications? What frameworks or techniques do you use?",
                "Describe your experience with database design. How do you decide between SQL and NoSQL databases for different projects?",
                "How do you handle state management in frontend applications? What libraries or patterns do you prefer?",
                "What's your approach to testing web applications? What types of tests do you write and what tools do you use?",
                "How do you keep up with the rapidly changing landscape of web development technologies?",
                "Describe your experience with containerization and deployment using tools like Docker and Kubernetes.",
                "How do you implement CI/CD pipelines in your development workflow?",
                "Tell me about your experience with server-side rendering versus client-side rendering. When would you choose one over the other?",
                "How do you handle cross-browser compatibility issues in your web applications?"
            ];
            
            // Get the number of questions requested
            const numToUse = Math.min(parseInt(numberOfQuestions) || 5, fallbackQuestions.length);
            const slicedQuestions = fallbackQuestions.slice(0, numToUse);
            
            console.log("Using fallback questions, count:", slicedQuestions.length);
            
            setQuestions(slicedQuestions);
            setCurrentQuestion(slicedQuestions[0]);
            setCurrentQuestionIndex(0); // Explicitly reset the index
            setInterviewStarted(true);
            setIsLoading(false);
            
            // Wait a moment before starting to speak
            setTimeout(() => {
                askQuestion(slicedQuestions[0]);
            }, 500);
            
            debugState();
        }
    };

    // Text-to-Speech (Read Question Aloud)
    const askQuestion = (text: string) => {
        // Ensure question is set in the UI before speaking it
        setCurrentQuestion(text);
        
        console.log(`Asking question: ${text}`);
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Create new speech instance
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 0.9; // Slightly slower rate for better clarity
        
        // Store reference to speech
        speechRef.current = speech;
        
        // Set speaking flag
        setIsSpeaking(true);
        
        // Add event handlers
        speech.onstart = () => {
            console.log("Speech started");
            setIsSpeaking(true);
        };
        
        speech.onend = () => {
            console.log("Speech ended");
            setIsSpeaking(false);
            // Wait a short moment before starting to listen
            setTimeout(() => {
                listenForAnswer();
            }, 500); 
        };
        
        speech.onerror = (e) => {
            console.error("Speech error:", e);
            setIsSpeaking(false);
            listenForAnswer();
        };
        
        // Start speaking
        window.speechSynthesis.speak(speech);
    };

    // Speech-to-Text (Capture User Answer)
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
            recognition.interimResults = false;

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                console.log(`User answered: ${transcript}`);
                setResponses((prev) => ({ ...prev, [questions[currentQuestionIndex]]: transcript }));
                setIsListening(false);

                console.log("Processing answer, current index:", currentQuestionIndex, "questions length:", questions.length);
                
                if (currentQuestionIndex < questions.length - 1) {
                    const nextIndex = currentQuestionIndex + 1;
                    console.log("Moving to next question index:", nextIndex);
                    
                    // First update the state
                    setCurrentQuestionIndex(nextIndex);
                    setCurrentQuestion(questions[nextIndex]);
                    
                    // Then wait a moment before asking the next question
                    // This gives a natural pause between questions
                    setTimeout(() => {
                        console.log("Asking next question:", questions[nextIndex]);
                        askQuestion(questions[nextIndex]);
                    }, 1500);
                } else {
                    console.log("All questions answered. Interview complete.");
                    // Only set interviewComplete after storage is successful
                    storeInterviewData(userName, jobRole).then(() => {
                        setInterviewComplete(true);
                    }).catch(err => {
                        console.error("Error storing interview data:", err);
                        setError("Failed to save responses, but interview is complete.");
                        setInterviewComplete(true);
                    });
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
                console.error("Firestore not initialized");
                setError("Failed to save your responses. Database connection error.");
                return Promise.reject(new Error("Firestore not initialized"));
            }
            
            const timestamp = new Date().toISOString();
            const docId = `${name.replace(/\s+/g, '_')}_${timestamp}`;
            await setDoc(doc(db, "interviews", docId), { 
                name, 
                role, 
                responses,
                initialEmotion: emotion,
                numberOfQuestions,
                difficultyLevel,
                timestamp
            });
            console.log("Interview responses stored in Firebase!");
            return Promise.resolve();
        } catch (error) {
            console.error("Error saving to Firebase:", error);
            setError("Failed to save your responses. Please try again.");
            return Promise.reject(error);
        }
    };

    // Start the Interview
    const startInterview = () => {
        if (!userName.trim() || !jobRole.trim()) {
            setError("Please enter both your name and job role");
            return;
        }
        console.log(`Starting interview for ${userName} - Role: ${jobRole} - Initial emotion: ${emotion}`);
        
        // Reset interview state to ensure clean start
        setCurrentQuestionIndex(0);
        setResponses({});
        setInterviewComplete(false);
        
        generateQuestions(jobRole);
    };

    // Handle manual answer submission (fallback for speech recognition)
    const submitManualAnswer = (answer: string) => {
        if (!answer.trim()) {
            setError("Please provide an answer");
            return;
        }
        
        // Cancel any ongoing speech or recognition
        window.speechSynthesis.cancel();
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                console.log("Error stopping recognition:", e);
            }
        }
        
        console.log("Submitting manual answer for question", currentQuestionIndex + 1);
        console.log("Current question:", currentQuestion);
        console.log("Total questions:", questions.length);
        
        setError("");
        setResponses((prev) => ({ ...prev, [questions[currentQuestionIndex]]: answer }));
        setIsListening(false);

        if (currentQuestionIndex < questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;
            console.log("Moving to question", nextIndex + 1);
            
            // Update state with next question
            setCurrentQuestionIndex(nextIndex);
            setCurrentQuestion(questions[nextIndex]);
            
            // Wait a moment before asking the next question
            setTimeout(() => {
                console.log("Asking next question:", questions[nextIndex]);
                askQuestion(questions[nextIndex]);
            }, 1000);
        } else {
            console.log("All questions answered. Interview complete.");
            // Only set interviewComplete after storage is successful
            storeInterviewData(userName, jobRole).then(() => {
                setInterviewComplete(true);
            }).catch(err => {
                console.error("Error storing interview data:", err);
                setError("Failed to save responses, but interview is complete.");
                setInterviewComplete(true);
            });
        }
    };

    // Reset interview and redirect to dashboard
    const cancelAndRedirect = () => {
        // Cancel any ongoing speech or recognition
        window.speechSynthesis.cancel();
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                console.log("Error stopping recognition:", e);
            }
        }
        
        // Reset all state
        resetInterview();
        
        // Redirect to dashboard
        router.push('/');
    };

    // Reset interview
    const resetInterview = () => {
        // Cancel any ongoing speech or recognition
        window.speechSynthesis.cancel();
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                console.log("Error stopping recognition:", e);
            }
        }
        
        setInterviewStarted(false);
        setCurrentQuestionIndex(0);
        setQuestions([]);
        setResponses({});
        setIsListening(false);
        setIsSpeaking(false);
        setCurrentQuestion("");
        setInterviewComplete(false);
        setError("");
    };

    if (!interviewStarted) {
        return (
            <div className="flex flex-col space-y-4 bg-[#1A1A1A] p-6 rounded-lg text-white">
                <h2 className="text-2xl font-bold text-[#6666FF] mb-4">Interview Setup</h2>
                
                {error && (
                    <div className="bg-red-900 text-white p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <p className="text-gray-400 mb-2">Initial detected emotion: <span className="font-bold text-[#6666FF]">{emotion}</span></p>
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
                <div className="mb-6">
                    <label className="block text-white text-sm font-medium mb-1">Job Role</label>
                    <input
                        type="text"
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
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
        );
    }

    if (interviewComplete) {
        return (
            <div className="text-center bg-[#1A1A1A] p-6 rounded-lg text-white">
                <h3 className="text-xl font-bold mb-4 text-[#6666FF]">Interview Complete!</h3>
                <p className="mb-6 text-gray-300">Thank you for completing the interview. Your responses have been saved.</p>
                
                <div className="bg-[#222222] p-4 rounded-lg mb-6">
                    <h4 className="font-semibold mb-2 text-white">Your Responses:</h4>
                    {Object.entries(responses).map(([question, answer], index) => (
                        <div key={index} className="mb-4 text-left">
                            <p className="font-medium text-[#6666FF]">Q: {question}</p>
                            <p className="text-gray-300">A: {answer}</p>
                        </div>
                    ))}
                </div>
                
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[#6666FF] text-white py-2 px-4 rounded-md hover:bg-[#5555DD] transition duration-200"
                    >
                        Return to Dashboard
                    </button>
                    <button
                        onClick={resetInterview}
                        className="bg-transparent border border-[#6666FF] text-[#6666FF] py-2 px-4 rounded-md hover:bg-[#6666FF]/10 transition duration-200"
                    >
                        Next Question
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-[#1A1A1A] p-6 rounded-lg text-white">
            {error && (
                <div className="bg-red-900 text-white p-3 rounded-md mb-4">
                    {error}
                </div>
            )}
            
            <div className="bg-[#222222] p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-[#6666FF]">Current Question:</h3>
                <p className="text-lg text-white">{currentQuestion}</p>
                
                {/* Status indicator */}
                <div className="mt-2 flex items-center">
                    <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-600'} mr-2`}></div>
                    <p className="text-xs text-gray-400">{isSpeaking ? 'Speaking question...' : 'Question ready'}</p>
                </div>
            </div>
            
            <div className="p-4 rounded-lg border border-gray-700 bg-[#222222]">
                <div className="flex items-center mb-4">
                    <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-600'} mr-2`}></div>
                    <p className="text-gray-300">{isListening ? 'Listening... Speak your answer' : 'Ready for next question'}</p>
                </div>
                
                <div className="text-sm text-gray-400 mb-2">
                    {isListening ? 
                        "If speech recognition isn't working, you can type your answer below:" : 
                        "Question will automatically advance after your answer"}
                </div>
                
                {isListening && (
                    <div className="flex space-x-2">
                        <input 
                            type="text" 
                            placeholder="Type your answer here..."
                            className="flex-1 px-3 py-2 border border-gray-700 rounded-md bg-[#333333] text-white"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    submitManualAnswer((e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }}
                        />
                        <button
                            className="bg-[#6666FF] text-white px-4 py-2 rounded-md hover:bg-[#5555DD]"
                            onClick={(e) => {
                                const input = (e.target as HTMLElement).previousSibling as HTMLInputElement;
                                submitManualAnswer(input.value);
                                input.value = '';
                            }}
                        >
                            Submit
                        </button>
                    </div>
                )}
            </div>
            
            <div className="flex justify-between">
                <div className="text-sm text-gray-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <button
                    onClick={cancelAndRedirect}
                    className="text-sm text-red-400 hover:text-red-300"
                >
                    Cancel Interview
                </button>
            </div>
        </div>
    );
};

export default Interview;