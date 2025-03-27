import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import firebase_admin
from firebase_admin import credentials, firestore

# Load Firebase credentials
# cred = credentials.Certificate("/Users/ayans./Documents/FINAL YEAR PROJECT/hiring-guru-firebase-adminsdk-fbsvc-05a7111b0c.json")
# firebase_admin.initialize_app(cred)
# db = firestore.client()

# Load Model
model = tf.keras.models.load_model("D:\Hiring-Guru-Module\Body-Posture\posture_model.keras")


mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

IMG_SIZE = (224, 224)
CLASS_LABELS = ["Good Posture", "Bad Posture"]

cap = cv2.VideoCapture(0)

# Counters
good_posture_count = 0
bad_posture_count = 0
total_frames = 0
update_interval = 50  # Update Firestore every 50 frames

def detect_hand_raised(landmarks):
    """Detect if either hand is raised above shoulders."""
    left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
    right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
    left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST]
    right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]
    
    left_hand_raised = left_wrist.y < left_shoulder.y - 0.05
    right_hand_raised = right_wrist.y < right_shoulder.y - 0.05
    
    return left_hand_raised or right_hand_raised

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to capture frame")
        break
    
    display_frame = frame.copy()
    mp_frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(mp_frame_rgb)
    
    hand_raised = False
    if results.pose_landmarks:
        hand_raised = detect_hand_raised(results.pose_landmarks.landmark)

    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray_frame = cv2.GaussianBlur(gray_frame, (5, 5), 0)  # Reduce noise
    gray_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)  # Convert back to 3 channels

    img = cv2.resize(gray_frame, IMG_SIZE)
    img = img.astype("float32") / 255.0
    img = np.expand_dims(img, axis=0)

    prediction = model.predict(img)
    predicted_prob = prediction[0][0]

    # Determine Posture
    threshold = 0.12  # Best threshold found is 0.11
    if hand_raised:
        label = "Bad Posture"
    else:
        predicted_class = int(predicted_prob > threshold)
        label = CLASS_LABELS[predicted_class]

    # Update Counters
    total_frames += 1
    if label == "Good Posture":
        good_posture_count += 1
    else:
        bad_posture_count += 1

    # Calculate Summary
    good_posture_percentage = (good_posture_count / total_frames) * 100
    bad_posture_percentage = (bad_posture_count / total_frames) * 100

    # Display on Frame
    color = (0, 255, 0) if label == "Good Posture" else (0, 0, 255)
    cv2.rectangle(display_frame, (10, 10), (400, 100), color, -1)
    cv2.putText(display_frame, f"Good: {good_posture_percentage:.2f}%", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
    cv2.putText(display_frame, f"Bad: {bad_posture_percentage:.2f}%", (20, 70),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)

    cv2.imshow("Posture Detection", display_frame)

    # Update Firestore every 50 frames
    if total_frames % update_interval == 0:
        db.collection("posture_stats").document("summary").set({
            "good_posture_percentage": round(good_posture_percentage, 2),
            "bad_posture_percentage": round(bad_posture_percentage, 2),
            "total_frames": total_frames
        })

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
