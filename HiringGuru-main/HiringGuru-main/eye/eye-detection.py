import cv2
import dlib
import time

# Load face detector and facial landmarks predictor
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")  # Ensure this file is downloaded

# Function to detect eyes
def detect_eyes(shape):
    left_eye = shape[36:42]  # Left eye landmarks
    right_eye = shape[42:48]  # Right eye landmarks
    return left_eye, right_eye

# Function to draw eye landmarks
def draw_eye(frame, eye_points):
    for point in eye_points:
        cv2.circle(frame, point, 2, (0, 255, 0), -1)

# Open webcam
cap = cv2.VideoCapture(0)

# Time tracking
start_time = time.time()
active_count = 0
sleeping_count = 0
frame_count = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)

    status = "Active"

    for face in faces:
        landmarks = predictor(gray, face)
        landmarks = [(landmarks.part(n).x, landmarks.part(n).y) for n in range(68)]

        left_eye, right_eye = detect_eyes(landmarks)

        # Draw eyes on frame
        draw_eye(frame, left_eye)
        draw_eye(frame, right_eye)

        # Basic logic: If eyes appear smaller (closed), classify as "Sleeping"
        eye_height_left = abs(left_eye[1][1] - left_eye[5][1])
        eye_height_right = abs(right_eye[1][1] - right_eye[5][1])

        if eye_height_left < 5 or eye_height_right < 5:  # Adjust threshold as needed
            status = "Sleeping"

    # Update counts
    if status == "Active":
        active_count += 1
    else:
        sleeping_count += 1

    # Show real-time status
    cv2.putText(frame, f"Status: {status}", (10, 50), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

    cv2.imshow("Eye Tracking", frame)

    # Exit when 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Calculate total session time
end_time = time.time()
total_time = end_time - start_time

# Calculate percentages
total_frames = active_count + sleeping_count
active_ratio = (active_count / total_frames) * 100 if total_frames > 0 else 0
sleeping_ratio = (sleeping_count / total_frames) * 100 if total_frames > 0 else 0

# Print results in terminal
print(f"\nTotal Session Time: {total_time:.2f} seconds")
print(f"Active Time: {active_ratio:.2f}%")
print(f"Sleeping Time: {sleeping_ratio:.2f}%")

# Release resources
cap.release()
cv2.destroyAllWindows()
