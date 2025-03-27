import cv2  # OpenCV for capturing video and face detection  
import time  # Time module for timestamping expressions  
from deepface import DeepFace  # DeepFace for facial expression recognition  
from collections import defaultdict  # defaultdict for storing emotion counts efficiently  

# Load the pre-trained face detection model from OpenCV (Haar Cascade)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Start the webcam (0 refers to the default camera)
cap = cv2.VideoCapture(0)

# List to store detected expressions along with timestamps  
expressions_log = []  

# Dictionary to keep track of how many times each emotion appears  
emotion_counts = defaultdict(int)  

# Counter for total number of detected expressions  
total_emotions = 0  

# Variable to store the last detected emotion (used to avoid duplicate logging)
last_emotion = None  

# Infinite loop to continuously capture frames from the webcam  
while True:
    ret, frame = cap.read()  # Read a frame from the webcam  
    if not ret:  # If no frame is captured, exit the loop  
        break  

    # Convert the frame to grayscale for better face detection performance  
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces in the grayscale image using the Haar Cascade detector  
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5, minSize=(30, 30))

    # Loop through all detected faces in the frame  
    for (x, y, w, h) in faces:
        # Crop the detected face region from the original frame  
        face_crop = frame[y:y + h, x:x + w]

        try:
            # Analyze the cropped face using DeepFace to detect emotions  
            result = DeepFace.analyze(face_crop, actions=['emotion'], enforce_detection=False)

            # Extract the dominant emotion detected in the face  
            emotion = result[0]['dominant_emotion']

            # Log the emotion only if it's different from the last detected emotion  
            if emotion != last_emotion:  
                last_emotion = emotion  # Update last detected emotion  
                timestamp = round(time.time(), 2)  # Get current timestamp in seconds  
                expressions_log.append({"time": timestamp, "expression": emotion})  # Store timestamp and emotion  

                # Update the count of the detected emotion  
                emotion_counts[emotion] += 1  
                total_emotions += 1  # Increase total emotion count  

                # Print the detected emotion with its timestamp  
                print(f"At {timestamp}s: {emotion}")  

            # Overlay the detected emotion as text on the video frame  
            cv2.putText(frame, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        except:
            pass  # Ignore any errors (e.g., face not detected properly)

    # Display the video feed with detected emotions in a window  
    cv2.imshow('Emotion Detection', frame)

    # Check if the 'q' key is pressed, if so, exit the loop  
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the webcam and close all OpenCV windows  
cap.release()
cv2.destroyAllWindows()

# Print the log of detected facial expressions with timestamps  
print("\nFacial Expression Log:")
for entry in expressions_log:
    print(f"Time: {entry['time']}s - Expression: {entry['expression']}")

# Calculate and display the proportion of each detected emotion  
print("\nFacial Expression Proportions:")
if total_emotions > 0:
    for emotion, count in emotion_counts.items():
        proportion = (count / total_emotions) * 100  # Convert count to percentage  
        print(f"{emotion}: {proportion:.2f}%")  # Print emotion proportion  
else:
    print("No emotions detected.")  # If no emotions were detected, print a message  

