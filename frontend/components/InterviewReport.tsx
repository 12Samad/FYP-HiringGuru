"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

// Add the Groq API configuration constants at the top of the file, after the imports
const GROQ_API_KEY = "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"
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

// Define types for the report data structure
interface Emotions {
  [key: string]: number
}

interface FacialExpressions {
  emotions: Emotions
  dominant?: {
    emotion: string
    count: number
  }
  percentages?: {
    [emotion: string]: number
  }
}

interface Posture {
  good_count: number
  bad_count: number
  total_frames: number
  good_percentage: number
  bad_percentage: number
}

interface TabActivity {
  switch_count: number
  time_away_formatted: string
}

interface ReportData {
  facial_expressions?: FacialExpressions
  posture?: Posture
  tab_activity?: TabActivity
}

interface InterviewReportProps {
  userId: string
}

const InterviewReport: React.FC<InterviewReportProps> = ({ userId }) => {
  const [report, setReport] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  // Add a new state variable for AI recommendations in the InterviewReport component
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false)
  const [recommendationsError, setRecommendationsError] = useState<string>("")

  useEffect(() => {
    fetchReport()
  }, [userId])

  const fetchReport = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Make API request to your backend endpoint
      const response = await fetch(`http://localhost:5000/api/generate-interview-report?userId=${userId}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Report data:", data)
      setReport(data.report)
    } catch (error) {
      console.error("Failed to fetch report:", error)
      setError("Failed to generate report. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new function to generate AI recommendations after the fetchReport function
  const generateAIRecommendations = async (reportData: ReportData) => {
    setIsLoadingRecommendations(true)
    setRecommendationsError("")

    try {
      console.log("Generating AI recommendations based on report data")

      // Create a detailed prompt with the report data
      const systemMessage = `You are an AI assistant specialized in analyzing interview performance data and providing personalized recommendations.
                            Format your response as a numbered list of 3-5 specific, actionable recommendations.
                            Each recommendation should be on a new line and should directly address the candidate's performance.
                            Do not include any additional text or explanations.`

      // Construct a detailed prompt with all the report data
      let userMessage =
        "Based on the following interview performance data, provide specific recommendations for improvement:\n\n"

      // Add facial expression data
      if (reportData.facial_expressions) {
        userMessage += "FACIAL EXPRESSIONS:\n"
        if (reportData.facial_expressions.emotions) {
          userMessage +=
            "Emotions detected: " +
            Object.entries(reportData.facial_expressions.emotions)
              .map(([emotion, count]) => `${emotion} (${count} times)`)
              .join(", ") +
            "\n"
        }
        if (reportData.facial_expressions.dominant) {
          userMessage += `Dominant emotion: ${reportData.facial_expressions.dominant.emotion} (${reportData.facial_expressions.dominant.count} times)\n`
        }
        if (reportData.facial_expressions.percentages) {
          userMessage +=
            "Emotion percentages: " +
            Object.entries(reportData.facial_expressions.percentages)
              .map(([emotion, percentage]) => `${emotion} (${percentage}%)`)
              .join(", ") +
            "\n"
        }
        userMessage += "\n"
      }

      // Add posture data
      if (reportData.posture) {
        userMessage += "POSTURE ANALYSIS:\n"
        userMessage += `Good posture: ${reportData.posture.good_percentage}% (${reportData.posture.good_count} frames)\n`
        userMessage += `Bad posture: ${reportData.posture.bad_percentage}% (${reportData.posture.bad_count} frames)\n`
        userMessage += `Total frames analyzed: ${reportData.posture.total_frames}\n\n`
      }

      // Add tab activity data
      if (reportData.tab_activity) {
        userMessage += "ATTENTION TRACKING:\n"
        userMessage += `Tab switches: ${reportData.tab_activity.switch_count} times\n`
        userMessage += `Time away: ${reportData.tab_activity.time_away_formatted}\n\n`
      }

      userMessage +=
        "Provide specific, actionable recommendations that will help the candidate improve their interview performance."

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

      console.log("Sending request to Groq API for recommendations")

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
      console.log("API Response received for recommendations")

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
      console.log("Raw content received from API for recommendations")

      // Extract recommendations using regex to handle different numbering formats
      const lines = content
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)

      // Process each line to remove numbering
      const recommendationsArray = lines
        .filter((line: string) => /^\d+[.)]\s+/.test(line) || line.length > 15) // Only keep lines that look like recommendations
        .map((line: string) => line.replace(/^\d+[.)\s]+/, "").trim()) // Remove numbering
        .filter((line: string) => line.length > 0)

      console.log("Extracted recommendations:", recommendationsArray.length)

      if (recommendationsArray.length === 0) {
        // If no recommendations were extracted, use the raw content
        setAiRecommendations([content])
      } else {
        setAiRecommendations(recommendationsArray)
      }

      setIsLoadingRecommendations(false)
    } catch (error) {
      console.error("Error generating AI recommendations:", error)
      setRecommendationsError("Failed to generate AI recommendations. Using default recommendations instead.")
      setIsLoadingRecommendations(false)
    }
  }

  // Modify the useEffect hook that calls fetchReport to also call generateAIRecommendations after fetching the report
  useEffect(() => {
    fetchReport()
  }, [userId])

  // Add a new useEffect hook to generate recommendations when report data is available
  useEffect(() => {
    if (report) {
      generateAIRecommendations(report)
    }
  }, [report])

  const handleExportToPDF = () => {
    // Don't proceed if report is null
    if (!report) {
      alert("No report data available to export")
      return
    }

    // Create a new window for the printable content
    const printWindow = window.open("", "_blank")

    if (!printWindow) {
      alert("Please allow pop-ups to export the report")
      return
    }

    // Prepare emotion data for visualization
    const emotionPercentageData = prepareEmotionPercentageData()
    const emotionChartData = emotionPercentageData
      .map((item) => `{ name: "${item.name}", value: ${item.value} }`)
      .join(", ")

    // Prepare posture data for visualization
    const postureData = preparePostureChartData()
    const postureChartData = postureData.map((item) => `{ name: "${item.name}", value: ${item.value} }`).join(", ")

    // Generate a clean, print-friendly HTML with modern design
    const reportDate = new Date().toLocaleDateString()
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Interview Performance Report - ${reportDate}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
          --primary-color: #6666FF;
          --primary-dark: #5555DD;
          --secondary-color: #FF8042;
          --success-color: #00C49F;
          --warning-color: #FFBB28;
          --danger-color: #FF6B6B;
          --dark-bg: #1A1A1A;
          --card-bg: #222222;
          --card-item-bg: #333333;
          --text-primary: #FFFFFF;
          --text-secondary: #CCCCCC;
          --text-muted: #999999;
          --border-color: #444444;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
          color: #333;
          line-height: 1.6;
          background-color: #FAFAFA;
          padding: 0;
          margin: 0;
        }
        
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .report-header {
          text-align: center;
          margin-bottom: 40px;
          position: relative;
          padding-bottom: 20px;
        }
        
        .report-header:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 4px;
          background: var(--primary-color);
          border-radius: 2px;
        }
        
        .report-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        
        .report-subtitle {
          font-size: 18px;
          color: #666;
          font-weight: 400;
        }
        
        .report-date {
          font-size: 14px;
          color: #888;
          margin-top: 5px;
        }
        
        .section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          margin-bottom: 30px;
          overflow: hidden;
        }
        
        .section-header {
          background: var(--primary-color);
          color: white;
          padding: 15px 20px;
          font-weight: 600;
          font-size: 18px;
          display: flex;
          align-items: center;
        }
        
        .section-header svg {
          margin-right: 10px;
        }
        
        .section-content {
          padding: 20px;
        }
        
        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .data-item {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 15px;
          transition: transform 0.2s;
          border-left: 4px solid var(--primary-color);
        }
        
        .data-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        
        .data-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .data-value {
          font-size: 20px;
          font-weight: 700;
          color: #333;
        }
        
        .data-subvalue {
          font-size: 12px;
          color: #888;
          margin-top: 2px;
        }
        
        .progress-container {
          margin: 20px 0;
        }
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 14px;
          color: #666;
        }
        
        .progress-bar {
          height: 10px;
          background-color: #f0f0f0;
          border-radius: 5px;
          overflow: hidden;
        }
        
        .progress-value {
          height: 100%;
          background: linear-gradient(to right, var(--success-color), #4CAF50);
          border-radius: 5px 0 0 5px;
        }
        
        .chart-container {
          height: 300px;
          margin: 20px 0;
        }
        
        .recommendations {
          list-style-type: none;
          padding: 0;
        }
        
        .recommendation-item {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          border-left: 4px solid var(--primary-color);
          position: relative;
        }
        
        .recommendation-item:before {
          content: '•';
          color: var(--primary-color);
          font-weight: bold;
          display: inline-block;
          width: 1em;
          margin-left: -1em;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #888;
          font-size: 12px;
        }
        
        .highlight {
          color: var(--primary-color);
          font-weight: 600;
        }
        
        .emotion-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
          margin: 20px 0;
        }
        
        .emotion-item {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }
        
        .emotion-name {
          font-weight: 600;
          margin-bottom: 5px;
          color: #555;
        }
        
        .emotion-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--primary-color);
        }
        
        .emotion-percentage {
          font-size: 12px;
          color: #888;
        }
        
        .dominant-emotion {
          background: #f0f7ff;
          border: 1px solid #d0e3ff;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .dominant-emotion-label {
          font-size: 14px;
          color: #555;
        }
        
        .dominant-emotion-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--primary-color);
        }
        
        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        @media print {
          body {
            background: white;
          }
          
          .container {
            max-width: 100%;
            padding: 20px;
          }
          
          .section {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 20px;
            box-shadow: none;
            border: 1px solid #eee;
          }
          
          .chart-container {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="report-header">
          <div class="report-title">Interview Performance Report</div>
          <div class="report-subtitle">Detailed Analysis & Recommendations</div>
          <div class="report-date">Generated on ${reportDate}</div>
        </div>
        
        <!-- Facial Expressions Section -->
        <div class="section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            Facial Expressions
          </div>
          <div class="section-content">
            ${
              report.facial_expressions &&
              (
                Object.keys(report.facial_expressions.emotions || {}).length > 0 ||
                  Object.keys(report.facial_expressions.percentages || {}).length > 0
              )
                ? `
                <div class="emotion-grid">
                  ${
                    report.facial_expressions.emotions
                      ? Object.entries(report.facial_expressions.emotions)
                          .map(
                            ([emotion, count]) => `
                    <div class="emotion-item">
                      <div class="emotion-name">${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</div>
                      <div class="emotion-value">${count}</div>
                      <div class="emotion-percentage">times detected</div>
                    </div>
                  `,
                          )
                          .join("")
                      : ""
                  }
                </div>
                
                ${
                  report.facial_expressions?.dominant
                    ? `
                  <div class="dominant-emotion">
                    <div class="dominant-emotion-label">Dominant Emotion</div>
                    <div class="dominant-emotion-value">${report.facial_expressions.dominant.emotion} - ${report.facial_expressions.dominant.count} times</div>
                  </div>
                `
                    : ""
                }
                
                ${
                  report.facial_expressions?.percentages
                    ? `
                  <div class="chart-container">
                    <canvas id="emotionChart"></canvas>
                  </div>
                `
                    : ""
                }
              `
                : `
                <p>No facial expression data available</p>
              `
            }
          </div>
        </div>
        
        <!-- Posture Section -->
        <div class="section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            Posture Analysis
          </div>
          <div class="section-content">
            ${
              report.posture && report.posture?.total_frames > 0
                ? `
                <div class="two-columns">
                  <div>
                    <div class="data-item" style="border-left-color: #4CAF50;">
                      <div class="data-label">Good Posture</div>
                      <div class="data-value">${report.posture.good_percentage}%</div>
                      <div class="data-subvalue">${report.posture.good_count} frames</div>
                    </div>
                    
                    <div class="data-item" style="border-left-color: #FF6B6B; margin-top: 15px;">
                      <div class="data-label">Bad Posture</div>
                      <div class="data-value">${report.posture.bad_percentage}%</div>
                      <div class="data-subvalue">${report.posture.bad_count} frames</div>
                    </div>
                    
                    <div class="progress-container">
                      <div class="progress-label">
                        <span>Posture Quality</span>
                        <span>${report.posture.good_percentage}%</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-value" style="width: ${report.posture.good_percentage}%;"></div>
                      </div>
                      <div style="font-size: 12px; text-align: center; color: #888; margin-top: 5px;">
                        Total frames analyzed: ${report.posture.total_frames}
                      </div>
                    </div>
                  </div>
                  
                  <div class="chart-container">
                    <canvas id="postureChart"></canvas>
                  </div>
                </div>
              `
                : `
                <p>No posture data available</p>
              `
            }
          </div>
        </div>
        
        <!-- Tab Activity Section -->
        <div class="section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            Attention Tracking
          </div>
          <div class="section-content">
            ${
              report.tab_activity
                ? `
                <div class="two-columns">
                  <div class="data-item" style="border-left-color: #FFBB28;">
                    <div class="data-label">Tab Switches</div>
                    <div class="data-value">${report.tab_activity.switch_count}</div>
                    <div class="data-subvalue">times during interview</div>
                  </div>
                  
                  <div class="data-item" style="border-left-color: #0088FE;">
                    <div class="data-label">Time Away</div>
                    <div class="data-value">${report.tab_activity.time_away_formatted}</div>
                    <div class="data-subvalue">not focused on interview</div>
                  </div>
                </div>
              `
                : `
                <p>No attention tracking data available</p>
              `
            }
          </div>
        </div>
        
        <!-- Recommendations Section -->
        <div class="section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Recommendations
          </div>
          <div class="section-content">
            <div class="recommendations">
              ${
                aiRecommendations.length > 0
                  ? aiRecommendations
                      .map(
                        (recommendation) => `
                  <div class="recommendation-item">
                    ${recommendation}
                  </div>
                `,
                      )
                      .join("")
                  : `
                <div class="recommendation-item">
                  ${
                    report.facial_expressions?.emotions
                      ? `Try to maintain more <span class="highlight">${(report.facial_expressions.emotions.happy || 0) > (report.facial_expressions.emotions.neutral || 0) ? "neutral" : "positive"}</span> expressions during interviews.`
                      : "Work on maintaining positive facial expressions during interviews."
                  }
                </div>
                <div class="recommendation-item">
                  ${
                    report.posture?.good_percentage !== undefined && report.posture.good_percentage > 70
                      ? "Continue maintaining your <span class='highlight'>excellent posture</span> throughout interviews."
                      : "Focus on <span class='highlight'>improving your posture</span> by sitting up straight and avoiding slouching."
                  }
                </div>
                <div class="recommendation-item">
                  ${
                    report.tab_activity?.switch_count === 0
                      ? "<span class='highlight'>Excellent job</span> maintaining focus throughout the interview."
                      : "Avoid <span class='highlight'>switching tabs</span> or looking away during video interviews to show your full attention."
                  }
                </div>
              `
              }
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Interview Performance Report - Generated by Interview Analysis Tool</p>
          <p>This report is confidential and intended for the candidate's personal development.</p>
        </div>
      </div>
      
      <script>
        // Initialize charts once the page is loaded
        window.onload = function() {
          // Emotion Chart
          ${
            report.facial_expressions?.percentages ||
            (report.facial_expressions?.emotions && Object.keys(report.facial_expressions.emotions).length > 0)
              ? `
              const emotionCtx = document.getElementById('emotionChart').getContext('2d');
              const emotionData = [${emotionChartData}];
              
              new Chart(emotionCtx, {
                type: 'bar',
                data: {
                  labels: emotionData.map(item => item.name),
                  datasets: [{
                    label: 'Emotion Percentage',
                    data: emotionData.map(item => item.value),
                    backgroundColor: [
                      '#FF8042', '#00C49F', '#FFBB28', '#0088FE', 
                      '#FF6B6B', '#A569BD', '#5DADE2'
                    ],
                    borderColor: [
                      '#FF8042', '#00C49F', '#FFBB28', '#0088FE', 
                      '#FF6B6B', '#A569BD', '#5DADE2'
                    ],
                    borderWidth: 1
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        }
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return context.raw + '%';
                        }
                      }
                    }
                  }
                }
              });
            `
              : ""
          }
          
          // Posture Chart
          ${
            report.posture
              ? `
              const postureCtx = document.getElementById('postureChart').getContext('2d');
              const postureData = [${postureChartData}];
              
              new Chart(postureCtx, {
                type: 'pie',
                data: {
                  labels: postureData.map(item => item.name),
                  datasets: [{
                    data: postureData.map(item => item.value),
                    backgroundColor: [
                      '#00C49F', '#FF8042'
                    ],
                    borderColor: [
                      '#00C49F', '#FF8042'
                    ],
                    borderWidth: 1
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return context.label + ': ' + context.raw + '%';
                        }
                      }
                    }
                  }
                }
              });
            `
              : ""
          }
        };
        
        // Print the document after a short delay to ensure charts are rendered
        setTimeout(() => {
          window.print();
        }, 1000);
      </script>
    </body>
    </html>
    `

    // Write the content to the new window
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  // Prepare data for charts - SIMPLIFIED VERSION
  const prepareEmotionPercentageData = () => {
    // Directly use the percentages data which is more reliable
    if (!report?.facial_expressions?.percentages) {
      // Fallback to using emotions data if percentages not available
      if (report?.facial_expressions?.emotions) {
        const emotions = report.facial_expressions.emotions
        const total = Object.values(emotions).reduce((sum, count) => sum + count, 0)

        return Object.entries(emotions).map(([emotion, count]) => ({
          name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
          value: Math.round((count / total) * 100),
        }))
      }
      return []
    }

    // Use percentages directly
    return Object.entries(report.facial_expressions.percentages).map(([emotion, percentage]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: percentage,
    }))
  }

  const preparePostureChartData = () => {
    if (!report?.posture) return []

    return [
      { name: "Good Posture", value: report.posture.good_percentage },
      { name: "Bad Posture", value: report.posture.bad_percentage },
    ]
  }

  // Colors for charts
  const EMOTION_COLORS = ["#FF8042", "#00C49F", "#FFBB28", "#0088FE", "#FF6B6B", "#A569BD", "#5DADE2"]
  const POSTURE_COLORS = ["#00C49F", "#FF8042"]

  if (isLoading) {
    return (
      <div className="text-center p-6 bg-[#1A1A1A] rounded-lg">
        <p className="text-gray-400">Loading report data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-[#1A1A1A] rounded-lg">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchReport}
          className="bg-[#6666FF] text-white py-2 px-4 rounded-md hover:bg-[#5555DD] transition duration-200"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!report) {
    return null
  }

  // Get dominant emotion safely
  const getDominantEmotion = (): string => {
    if (!report.facial_expressions?.emotions) return "None"

    const emotions = Object.entries(report.facial_expressions.emotions)
    if (emotions.length === 0) return "None"

    const dominant = emotions.sort((a, b) => b[1] - a[1])[0][0]
    return dominant.charAt(0).toUpperCase() + dominant.slice(1)
  }

  // Simple check for data
  const hasEmotionData =
    report.facial_expressions &&
    (Object.keys(report.facial_expressions.percentages || {}).length > 0 ||
      Object.keys(report.facial_expressions.emotions || {}).length > 0)

  return (
    <div className="bg-[#1A1A1A] p-6 rounded-lg text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#6666FF]">Interview Performance Report</h2>
        <button
          id="export-pdf-button"
          onClick={handleExportToPDF}
          className="flex items-center gap-2 bg-[#6666FF] text-white py-2 px-4 rounded-md hover:bg-[#5555DD] transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export Report
        </button>
      </div>

      {/* Facial Expression Section */}
      <div className="bg-[#222222] p-4 rounded-lg mb-6">
        <h3 className="font-bold text-[#6666FF] mb-2">Facial Expressions</h3>

        {report.facial_expressions && Object.keys(report.facial_expressions).length > 0 ? (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Loop over all keys of the facial_expressions object, including emotions */}
              {Object.entries(report.facial_expressions).map(([emotion, count]) => {
                // Skip 'dominant' and 'percentages' because we render them separately
                if (emotion === "dominant" || emotion === "percentages") return null

                return (
                  <div key={emotion} className="bg-[#333333] p-3 rounded-lg">
                    <div className="text-gray-300 mb-1 capitalize">{emotion}</div>
                    <div className="text-white text-lg font-medium">{count} times</div>
                  </div>
                )
              })}
            </div>

            {/* Display Dominant Emotion */}
            {report.facial_expressions.dominant && (
              <div className="bg-[#333333] p-3 rounded-lg mb-4">
                <div className="text-gray-300 mb-1">Dominant Emotion</div>
                <div className="text-white text-lg font-medium">
                  {report.facial_expressions.dominant.emotion} - {report.facial_expressions.dominant.count} times
                </div>
              </div>
            )}

            {/* Display Percentages */}
            {report.facial_expressions.percentages && (
              <div className="bg-[#333333] p-3 rounded-lg">
                <div className="text-gray-300 mb-1">Emotion Percentages</div>
                <ul className="text-white">
                  {Object.entries(report.facial_expressions.percentages).map(([emotion, percentage]) => (
                    <li key={emotion}>
                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}: {percentage}%
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400">No facial expression data available</p>
        )}
      </div>

      {/* Posture Section */}
      <div className="bg-[#222222] p-4 rounded-lg mb-6">
        <h3 className="font-bold text-[#6666FF] mb-2">Posture Analysis</h3>

        {report.posture && report.posture.total_frames > 0 ? (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#333333] p-3 rounded-lg">
                <div className="text-green-500 mb-1">Good Posture</div>
                <div className="text-white text-lg font-medium">{report.posture.good_percentage}%</div>
                <div className="text-gray-400 text-sm">{report.posture.good_count} frames</div>
              </div>

              <div className="bg-[#333333] p-3 rounded-lg">
                <div className="text-red-500 mb-1">Bad Posture</div>
                <div className="text-white text-lg font-medium">{report.posture.bad_percentage}%</div>
                <div className="text-gray-400 text-sm">{report.posture.bad_count} frames</div>
              </div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
              <div
                className="bg-green-500 h-2.5 rounded-l-full"
                style={{ width: `${report.posture.good_percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 text-center">
              Total frames analyzed: {report.posture.total_frames}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No posture data available</p>
        )}
      </div>

      {/* Tab Activity Section */}
      <div className="bg-[#222222] p-4 rounded-lg mb-6">
        <h3 className="font-bold text-[#6666FF] mb-2">Attention Tracking</h3>

        {report.tab_activity ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#333333] p-3 rounded-lg">
              <div className="text-gray-300 mb-1">Tab Switches</div>
              <div className="text-white text-lg font-medium">{report.tab_activity.switch_count}</div>
            </div>

            <div className="bg-[#333333] p-3 rounded-lg">
              <div className="text-gray-300 mb-1">Time Away</div>
              <div className="text-white text-lg font-medium">{report.tab_activity.time_away_formatted}</div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No attention tracking data available</p>
        )}
      </div>

      {/* AI Recommendations Section */}
      <div className="bg-[#222222] p-4 rounded-lg mb-6">
        <h3 className="font-bold text-[#6666FF] mb-2">AI Recommendations</h3>

        {isLoadingRecommendations ? (
          <div className="text-center py-4">
            <p className="text-gray-400">Generating personalized recommendations...</p>
          </div>
        ) : recommendationsError ? (
          <div>
            <p className="text-red-500 mb-2">{recommendationsError}</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>
                {report.facial_expressions?.emotions
                  ? `Try to maintain more ${report.facial_expressions.emotions.happy > (report.facial_expressions.emotions.neutral || 0) ? "neutral" : "positive"} expressions during interviews.`
                  : "Work on maintaining positive facial expressions during interviews."}
              </li>
              <li>
                {report.posture?.good_percentage && report.posture.good_percentage > 70
                  ? "Continue maintaining your excellent posture throughout interviews."
                  : "Focus on improving your posture by sitting up straight and avoiding slouching."}
              </li>
              <li>
                {report.tab_activity?.switch_count === 0
                  ? "Excellent job maintaining focus throughout the interview."
                  : "Avoid switching tabs or looking away during video interviews to show your full attention."}
              </li>
            </ul>
          </div>
        ) : (
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {aiRecommendations.map((recommendation, index) => (
              <li key={index} className="leading-relaxed">
                {recommendation}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CHARTS SECTION - Added below existing content */}
      <div className="mt-6">
        <h3 className="text-xl font-bold text-[#6666FF] mb-4">Data Visualization</h3>

        {/* Facial Expressions Chart - SIMPLIFIED */}
        <div className="bg-[#222222] p-4 rounded-lg mb-6">
          <h4 className="font-bold text-[#6666FF] mb-4">Emotion Percentages</h4>

          {hasEmotionData ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareEmotionPercentageData()} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Percentage"]}
                    contentStyle={{ backgroundColor: "#333", border: "none" }}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Percentage">
                    {prepareEmotionPercentageData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No facial expression data available for visualization</p>
          )}
        </div>

        {/* Posture Analysis Chart */}
        <div className="bg-[#222222] p-4 rounded-lg">
          <h4 className="font-bold text-[#6666FF] mb-4">Posture Analysis</h4>

          {report.posture && report.posture.total_frames > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={preparePostureChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {preparePostureChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={POSTURE_COLORS[index % POSTURE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Percentage"]}
                    contentStyle={{ backgroundColor: "#333", border: "none" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No posture data available for visualization</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default InterviewReport
