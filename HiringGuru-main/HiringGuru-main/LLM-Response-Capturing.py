import cohere
import pyttsx3
import speech_recognition as sr

# Initialize Cohere API
cohere_api_key = "jkPsr8ccIVgQ965DMqM4C0baTSblc8jcQagAslTy"  
co = cohere.Client(cohere_api_key)

# Initialize TTS engine
engine = pyttsx3.init()

# Function to speak text
def speak(text):
    engine.say(text)
    engine.runAndWait()

# Function to listen and capture user response
def listen():
    print("Listening for your response...")
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        try:
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=30)
            return recognizer.recognize_google(audio)
        except Exception as e:
            print(f"Error: {e}")
            return "No response detected."

# Function to generate questions
def generate_questions(role, num_questions, difficulty):
    prompt = (f"Generate exactly {num_questions} concise interview questions, each up to 2 lines, "
              f"for a {role} role. The questions should be specific, relevant to the role, "
              f"and of {difficulty} difficulty level.")
    
    response = co.generate(
        model="command-xlarge",
        prompt=prompt,
        max_tokens=100 * num_questions,
        temperature=0.5
    )
    
    questions = response.generations[0].text.strip().split("\n")
    return [q.lstrip("0123456789. ").strip() for q in questions if q.strip()]

# Main function
def main():
    username = input("Enter your name: ").strip()
    job_role = input("Enter the job role you are applying for: ").strip()
    num_questions = int(input("Enter the number of questions for the interview: ").strip())
    difficulty = input("Enter the difficulty level (easy, medium, hard): ").strip().lower()
    
    print("If you're ready for the interview, press 'y'. If not, press 'n'.")
    ready_response = input().lower()
    
    if ready_response == 'y':
        print("Generating questions...")
        questions = generate_questions(job_role, num_questions, difficulty)
        responses = {}
        
        print("\nStarting the interview:")
        for i, question in enumerate(questions, 1):
            print(f"Question {i}: {question}")
            speak(f"Question {i}. {question}")
            response = listen()
            responses[question] = response
            print(f"Response: {response}\n")
        
        # Display results
        print("\nInterview Results:")
        print(f"Name: {username}")
        print(f"Role: {job_role}")
        print(f"Difficulty: {difficulty.capitalize()}")
        print("\nQuestions and Responses:")
        for question, response in responses.items():
            print(f"Q: {question}")
            print(f"A: {response}\n")
    
    elif ready_response == 'n':
        print("Alright, we can start later. Goodbye!")
        speak("Goodbye!")
    else:
        print("Invalid input. Please press 'y' to start or 'n' to quit.")

# Run the program
if __name__ == "__main__":
    main()
