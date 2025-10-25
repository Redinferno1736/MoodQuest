from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import torch
from torchvision import transforms
from timm import create_model
import numpy as np
from collections import deque
import time
import requests
from helpers import get_random_joke, get_one_fact
from trivia import fetch_questionnaire, score_assessment, interpret_score

app = Flask(__name__)

# Enable CORS for Next.js frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configuration
MODEL_PATH = 'best_fer2013_model_70.pth'
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
NUM_CLASSES = 7
EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
API_NINJAS_KEY = "bNnq+iUY1JqBvm5CzS4DcQ==KfjZtD8ZFa4sl8af"

# Load model
print("Loading fine-tuned model...")
try:
    model = create_model('efficientnet_b0', pretrained=False, num_classes=NUM_CLASSES)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model = model.to(DEVICE)
    model.eval()
    print("Model loaded successfully!")
    MODEL_LOADED = True
except Exception as e:
    print(f"Error loading model: {e}")
    MODEL_LOADED = False

# Image preprocessing
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Grayscale(num_output_channels=3),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Emotion history
emotion_history = deque(maxlen=30)

# Global variables
current_emotion = "Neutral"
emotion_confidence = 0.0
stress_level = "Low"


def detect_emotion(face_img):
    """Detect emotion from face image"""
    if not MODEL_LOADED:
        return "Neutral", 0.0
    
    try:
        face_tensor = transform(face_img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            output = model(face_tensor)
            probabilities = torch.nn.functional.softmax(output, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)
        
        emotion = EMOTION_LABELS[predicted_idx.item()]
        confidence_score = confidence.item()
        return emotion, confidence_score
    except Exception as e:
        print(f"Error in emotion detection: {e}")
        return "Neutral", 0.0


def calculate_stress_level(emotion_history):
    """Calculate stress level based on emotion patterns"""
    if len(emotion_history) < 10:
        return "Low"
    
    negative_emotions = sum(1 for e in emotion_history if e in ['Angry', 'Fear', 'Sad'])
    negative_ratio = negative_emotions / len(emotion_history)
    
    if negative_ratio > 0.6:
        return "High"
    elif negative_ratio > 0.3:
        return "Medium"
    else:
        return "Low"


def generate_frames():
    """Generate video frames with emotion detection"""
    global current_emotion, emotion_confidence, stress_level
    
    camera = cv2.VideoCapture(0)
    
    if not camera.isOpened():
        print("Error: Could not open camera")
        return
    
    while True:
        success, frame = camera.read()
        if not success:
            break
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5, minSize=(50, 50))
        
        for (x, y, w, h) in faces:
            face = frame[y:y+h, x:x+w]
            emotion, confidence = detect_emotion(face)
            
            current_emotion = emotion
            emotion_confidence = confidence
            emotion_history.append(emotion)
            stress_level = calculate_stress_level(emotion_history)
            
            color = (0, 255, 0) if stress_level == "Low" else (0, 165, 255) if stress_level == "Medium" else (0, 0, 255)
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            
            label = f"{emotion}: {confidence*100:.1f}%"
            cv2.putText(frame, label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            cv2.putText(frame, f"Stress: {stress_level}", (x, y+h+25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    
    camera.release()


# ==================== API ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': MODEL_LOADED,
        'device': DEVICE
    })


@app.route('/api/video_feed', methods=['GET'])
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(), 
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/api/analytics', methods=['GET'])
def analytics():
    """Get current analytics data"""
    emotion_counts = {}
    for emotion in emotion_history:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    return jsonify({
        'current_emotion': current_emotion,
        'confidence': round(emotion_confidence * 100, 2),
        'stress_level': stress_level,
        'emotion_distribution': emotion_counts,
        'total_frames': len(emotion_history),
        'emotion_history': list(emotion_history)
    })


@app.route('/api/joke', methods=['GET'])
def get_joke():
    """Get a random joke"""
    joke = get_random_joke()
    return jsonify({'joke': joke})


@app.route('/api/fact', methods=['GET'])
def get_fact():
    """Get a random fact"""
    fact = get_one_fact(API_NINJAS_KEY)
    return jsonify({'fact': fact})


@app.route('/api/questionnaire/<name>', methods=['GET'])
def get_questionnaire(name):
    """Get questionnaire by name (PHQ-9, GAD-7, PSS)"""
    questions = fetch_questionnaire(name)
    if not questions:
        return jsonify({'error': 'Questionnaire not found'}), 404
    return jsonify({
        'name': name,
        'questions': questions
    })


@app.route('/api/questionnaire/submit', methods=['POST'])
def submit_questionnaire():
    """Submit questionnaire answers and get score"""
    data = request.json
    name = data.get('name')
    answers = data.get('answers')
    
    if not name or not answers:
        return jsonify({'error': 'Missing name or answers'}), 400
    
    score = score_assessment(name, answers)
    interpretation = interpret_score(name, score)
    
    return jsonify({
        'name': name,
        'score': score,
        'interpretation': interpretation
    })


@app.route('/api/emotion/reset', methods=['POST'])
def reset_emotion_history():
    """Reset emotion history"""
    global emotion_history, current_emotion, emotion_confidence, stress_level
    emotion_history.clear()
    current_emotion = "Neutral"
    emotion_confidence = 0.0
    stress_level = "Low"
    return jsonify({'message': 'Emotion history reset successfully'})


if __name__ == '__main__':
    print("Starting MoodQuest Flask Backend...")
    print(f"Device: {DEVICE}")
    print(f"Model Loaded: {MODEL_LOADED}")
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
