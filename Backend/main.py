from flask import Flask, render_template, Response, jsonify
import cv2
import torch
from torchvision import transforms
from timm import create_model
import numpy as np
from collections import deque
import time

app = Flask(__name__)

# Configuration
MODEL_PATH = 'best_fer2013_model_70.pth'  # Path to your trained model
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
NUM_CLASSES = 7
EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Load fine-tuned model
print("Loading fine-tuned model...")
model = create_model('efficientnet_b0', pretrained=False, num_classes=NUM_CLASSES)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model = model.to(DEVICE)
model.eval()
print("Model loaded successfully!")

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

# Emotion history for stress/mood tracking
emotion_history = deque(maxlen=30)  # Last 30 frames

# Global variables for analytics
current_emotion = "Neutral"
emotion_confidence = 0.0
stress_level = "Low"


def detect_emotion(face_img):
    """Detect emotion from face image"""
    try:
        # Preprocess
        face_tensor = transform(face_img).unsqueeze(0).to(DEVICE)
        
        # Predict
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
    
    # Count negative emotions (Angry, Fear, Sad)
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
    
    while True:
        success, frame = camera.read()
        if not success:
            break
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5, minSize=(50, 50))
        
        for (x, y, w, h) in faces:
            # Extract face
            face = frame[y:y+h, x:x+w]
            
            # Detect emotion
            emotion, confidence = detect_emotion(face)
            
            # Update globals
            current_emotion = emotion
            emotion_confidence = confidence
            emotion_history.append(emotion)
            stress_level = calculate_stress_level(emotion_history)
            
            # Draw rectangle and label
            color = (0, 255, 0) if stress_level == "Low" else (0, 165, 255) if stress_level == "Medium" else (0, 0, 255)
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            
            # Emotion label
            label = f"{emotion}: {confidence*100:.1f}%"
            cv2.putText(frame, label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            
            # Stress level
            cv2.putText(frame, f"Stress: {stress_level}", (x, y+h+25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        # Encode frame
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    
    camera.release()


@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')


@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/analytics')
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
        'total_frames': len(emotion_history)
    })


if __name__ == '__main__':
    app.run(debug=True, threaded=True)
