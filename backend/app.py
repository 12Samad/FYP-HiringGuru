from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
import os
import pymongo
from dotenv import load_dotenv
import numpy as np
import cv2
import tensorflow as tf
import mediapipe as mp
import base64
import zipfile
import time
from datetime import datetime
from collections import defaultdict
tab_switches = defaultdict(list)  # userId -> list of tab switch events
# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load the body posture detection model
MODEL_PATH = "D:\\Hiring-Guru\\backend\\posture_model.keras"
print("🔁 Checking model format...", flush=True)
if zipfile.is_zipfile(MODEL_PATH):
    print("✅ Model file is a valid Keras archive", flush=True)
else:
    print("❌ Model file is NOT a valid .keras archive. Try re-saving it.", flush=True)

print("🔁 Loading model...", flush=True)
model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model loaded successfully", flush=True)
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
IMG_SIZE = (224, 224)
CLASS_LABELS = ["Good Posture", "Bad Posture"]
# Connect to MongoDB
try:
    mongo_client = pymongo.MongoClient(os.getenv('MONGO_URI'))
    db = mongo_client.interview_db
    print("MongoDB connected ✅")
except Exception as e:
    print(f"MongoDB connection error: {e}")

# Collections
users_collection = db.users
interview_setups_collection = db.interview_setups
posture_collection = db.posture_stats

# Helper function for posture detection
def detect_hand_raised(landmarks):
    """Detect if either hand is raised above shoulders."""
    left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
    right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
    left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST]
    right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]
    
    left_hand_raised = left_wrist.y < left_shoulder.y - 0.05
    right_hand_raised = right_wrist.y < right_shoulder.y - 0.05
    
    return left_hand_raised or right_hand_raised

# Tab tracking starts here:
# Add this to your app.py file
# Required imports - add these if not already present
import time
from datetime import datetime
from collections import defaultdict

# In-memory storage for tab activity
tab_switches = defaultdict(list)  # userId -> list of tab switch events

@app.route('/api/track-tab-activity', methods=['POST'])
def track_tab_activity():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        status = data.get('status')  # 'hidden' or 'visible'
        timestamp = data.get('timestamp') or int(time.time() * 1000)  # Client timestamp or server time
        
        if not user_id or not status:
            return jsonify({'error': 'userId and status are required'}), 400
        
        # Validate status
        if status not in ['hidden', 'visible']:
            return jsonify({'error': 'status must be either "hidden" or "visible"'}), 400

        # Create activity entry with formatted time
        formatted_time = datetime.fromtimestamp(timestamp/1000).strftime('%H:%M:%S')
        
        activity = {
            'status': status,
            'timestamp': timestamp,
            'formatted_time': formatted_time
        }
        
        # Store in memory
        tab_switches[user_id].append(activity)
        
        return jsonify({
            'message': 'Tab activity tracked successfully',
            'activity': activity
        }), 200
    
    except Exception as e:
        print(f"Error tracking tab activity: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-tab-activity', methods=['GET'])
def get_tab_activity():
    try:
        user_id = request.args.get('userId')
        
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
        
        # Get all tab activity for this user
        activities = tab_switches.get(user_id, [])
        
        # Calculate metrics
        hidden_count = sum(1 for act in activities if act['status'] == 'hidden')
        
        # Calculate time spent away (approximate)
        time_away = 0
        hidden_start = None
        
        for act in activities:
            if act['status'] == 'hidden':
                hidden_start = act['timestamp']
            elif act['status'] == 'visible' and hidden_start is not None:
                time_away += (act['timestamp'] - hidden_start) / 1000  # Convert to seconds
                hidden_start = None
        
        # If the last status was 'hidden', count time until now
        if hidden_start is not None:
            time_away += (time.time() * 1000 - hidden_start) / 1000
        
        minutes = int(time_away // 60)
        seconds = int(time_away % 60)
        
        return jsonify({
            'activities': activities,
            'metrics': {
                'tabSwitchCount': hidden_count,
                'timeAwaySeconds': round(time_away, 2),
                'timeAwayFormatted': f"{minutes}m {seconds}s"
            }
        }), 200
    
    except Exception as e:
        print(f"Error fetching tab activity: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-emotion-ml', methods=['POST'])
def analyze_emotion_ml():
    try:
        # Get image data from request
        data = request.get_json()
        image_data = data.get('image')
        user_id = data.get('userId', 'guest_user')
        
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
        
        # Process the base64 image
        if ',' in image_data:
            image_data = image_data.split(',')[1]  # Remove the data:image/jpeg;base64, part
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Failed to decode image'}), 400
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Load the face cascade for face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5, minSize=(30, 30))
        
        # Default if no face detected
        emotion = "neutral"
        
        # Process each detected face
        for (x, y, w, h) in faces:
            # Extract the face region
            face_crop = frame[y:y+h, x:x+w]
            
            try:
                # Analyze emotion using DeepFace
                from deepface import DeepFace
                result = DeepFace.analyze(face_crop, actions=['emotion'], enforce_detection=False)
                emotion = result[0]['dominant_emotion']
                break  # Just use the first face
            except Exception as e:
                print(f"Error analyzing face: {e}")
        
        # Store emotion in MongoDB
        try:
            # Get or initialize user emotion stats
            emotion_stats = db.facial_expression_stats.find_one({'userId': user_id}) or {
                'userId': user_id,
                'emotions': {}
            }

            # Update emotion count
            current_count = emotion_stats.get('emotions', {}).get(emotion, 0)
            if 'emotions' not in emotion_stats:
                emotion_stats['emotions'] = {}
            emotion_stats['emotions'][emotion] = current_count + 1

            # Save updated stats to MongoDB
            db.facial_expression_stats.update_one(
                {'userId': user_id},
                {'$set': {'emotions': emotion_stats['emotions']}},
                upsert=True
            )
        except Exception as e:
            print(f"Error updating emotion stats: {e}")
        
        # Return the detected emotion
        return jsonify({
            'emotion': emotion,
            'message': 'Emotion analyzed successfully'
        })
        
    except Exception as e:
        print(f"Error in emotion analysis: {e}")
        return jsonify({'message': 'Server error', 'error': str(e)}), 500
# Routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        # Check if user exists
        user_exists = users_collection.find_one({'email': email})
        if user_exists:
            return jsonify({'message': 'User already exists'}), 400
        
        # Hash the password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        # Create new user
        new_user = {
            'name': name,
            'email': email,
            'password': hashed_password
        }
        
        users_collection.insert_one(new_user)
        return jsonify({'message': 'User registered successfully'}), 201
        
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # Find user
        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 400
        
        # Compare passwords
        is_match = bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8'))
        if not is_match:
            return jsonify({'message': 'Invalid credentials'}), 400
        
        return jsonify({
    'message': 'Login successful',
    'userId': str(user['_id'])  # Send this to frontend
}), 200

        
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@app.route('/api/auth/setup', methods=['POST'])
def setup_interview():
    try:
        data = request.get_json()
        job_description = data.get('jobDescription')
        number_of_questions = data.get('numberOfQuestions')
        difficulty_level = data.get('difficultyLevel')
        
        # Validate required fields
        if not job_description or not number_of_questions or not difficulty_level:
            return jsonify({'message': 'All fields are required'}), 400
        
        # Create new interview setup
        new_interview = {
            'jobDescription': job_description,
            'numberOfQuestions': number_of_questions,
            'difficultyLevel': difficulty_level
        }
        
        interview_setups_collection.insert_one(new_interview)
        return jsonify({'message': 'Interview setup saved successfully'}), 201
        
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500


@app.route('/api/analyze-emotion', methods=['POST'])
def analyze_emotion():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        emotion = data.get('emotion')

        if not user_id or not emotion:
            return jsonify({'error': 'userId and emotion are required'}), 400

        # Get or initialize user emotion stats
        emotion_stats = db.facial_expression_stats.find_one({'userId': user_id}) or {
            'userId': user_id,
            'emotions': {}
        }

        # Update emotion count
        current_count = emotion_stats.get('emotions', {}).get(emotion, 0)
        emotion_stats['emotions'][emotion] = current_count + 1

        # Save updated stats to MongoDB
        db.facial_expression_stats.update_one(
            {'userId': user_id},
            {'$set': {'emotions': emotion_stats['emotions']}},
            upsert=True
        )

        return jsonify({'message': 'Emotion stats updated successfully'}), 200

    except Exception as e:
        print(f"Error in analyze_emotion: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze-posture', methods=['POST'])
def analyze_posture():
    try:
        # Get image data from request
        data = request.get_json()
        image_data = data.get('image')
        user_id = data.get('userId', 'guest_user')
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
        
        # Process the base64 image
        if ',' in image_data:
            image_data = image_data.split(',')[1]  # Remove the data:image/jpeg;base64, part
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Failed to decode image'}), 400
        
        # Process with MediaPipe
        mp_frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(mp_frame_rgb)
        
        hand_raised = False
        if results.pose_landmarks:
            hand_raised = detect_hand_raised(results.pose_landmarks.landmark)
            
        # Process frame for model
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray_frame = cv2.GaussianBlur(gray_frame, (5, 5), 0)  # Reduce noise
        gray_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)  # Convert back to 3 channels
        img = cv2.resize(gray_frame, IMG_SIZE)
        img = img.astype("float32") / 255.0
        img = np.expand_dims(img, axis=0)
        
        # Make prediction
        prediction = model.predict(img)
        predicted_prob = float(prediction[0][0])
        
        # Determine Posture
        threshold = 0.65  # Best threshold found is 0.11
        if hand_raised:
            label = "Bad Posture"
        else:
            predicted_class = int(predicted_prob > threshold)
            label = CLASS_LABELS[predicted_class]
        
        # Store stats in MongoDB (optional)
        try:
            # Get existing stats
            stats = posture_collection.find_one({'userId': user_id}) or {
                'userId': user_id,
                'good_posture_count': 0,
                'bad_posture_count': 0,
                'total_frames': 0
            }
            
            # Update stats
            if label == "Good Posture":
                stats['good_posture_count'] = stats.get('good_posture_count', 0) + 1
            else:
                stats['bad_posture_count'] = stats.get('bad_posture_count', 0) + 1
                
            stats['total_frames'] = stats.get('total_frames', 0) + 1
            
            # Calculate percentages
            good_percentage = (stats['good_posture_count'] / stats['total_frames']) * 100
            bad_percentage = (stats['bad_posture_count'] / stats['total_frames']) * 100
            
            # Update document with new stats
            stats['good_posture_percentage'] = round(good_percentage, 2)
            stats['bad_posture_percentage'] = round(bad_percentage, 2)
            
            # Save to MongoDB
            posture_collection.update_one(
                {'userId': user_id},
                {'$set': stats},
                upsert=True
            )
        except Exception as e:
            print(f"Error updating posture stats: {e}")
        
        # Return posture analysis
        return jsonify({
            'posture': label,
            'probability': predicted_prob,
            'hand_raised': hand_raised,
            'stats': {
                'good_percentage': round(good_percentage, 2) if 'good_percentage' in locals() else 0,
                'bad_percentage': round(bad_percentage, 2) if 'bad_percentage' in locals() else 0
            }
        })
        
    except Exception as e:
        print(f"Error in posture analysis: {e}")
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)