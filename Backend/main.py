import os
import cv2
import torch
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from torchvision import transforms
from dotenv import load_dotenv
from timm import create_model
from groq import Groq
import time
from collections import Counter
from pymongo import MongoClient, ASCENDING

from helpers import get_random_joke, get_one_fact
from trivia import fetch_questionnaire, score_assessment, interpret_score

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["mood_monitor"]
sessions_col = db["sessions"]

# Create indexes for performance
sessions_col.create_index([("user_id", ASCENDING)])
sessions_col.create_index([("timestamp", ASCENDING)])
print("✅ Connected to MongoDB Atlas")

MODEL_PATH = "best_fer2013_model_70.pth"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
NUM_CLASSES = 7
EMOTION_LABELS = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

print(f"⚙️ Using device: {DEVICE}")

MODEL_LOADED = False
last_face_time = 0

try:
    print("Loading model...")
    model = create_model("efficientnet_b0", pretrained=False, num_classes=NUM_CLASSES)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model = model.to(DEVICE)
    model.eval()
    MODEL_LOADED = True
    print("✅ Model loaded")
except Exception as e:
    print("❌ Model load error:", e)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Grayscale(num_output_channels=3),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


def detect_emotion_from_frame(face_img):
    if not MODEL_LOADED:
        return "Neutral", 0.0
    try:
        face_tensor = transform(face_img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            output = model(face_tensor)
            probs = torch.nn.functional.softmax(output, dim=1)
            conf, idx = torch.max(probs, 1)
        return EMOTION_LABELS[idx.item()], conf.item()
    except Exception as e:
        print("Inference error:", e)
        return "Neutral", 0.0


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "model_loaded": MODEL_LOADED})


@app.route("/api/analyze-frame", methods=["POST"])
def analyze_frame():
    global last_face_time

    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    file = request.files["image"]
    img_bytes = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify({"error": "Bad image"}), 400

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4, minSize=(30, 30))

    if len(faces) == 0:
        if time.time() - last_face_time < 1.5:
            return jsonify({"face_detected": True, "dominant_emotion": "", "emotions": {}})
        return jsonify({"face_detected": False, "dominant_emotion": "", "emotions": {}})

    last_face_time = time.time()
    x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
    face_roi = frame[y:y + h, x:x + w]
    emotion, confidence = detect_emotion_from_frame(face_roi)

    return jsonify({
        "face_detected": True,
        "dominant_emotion": emotion,
        "emotions": {emotion.lower(): float(confidence)}
    })


@app.route("/api/session/save", methods=["POST"])
def save_session():
    """
    Expects JSON body:
    {
      "user_id": "...",
      "duration": 120,
      "frames": [
        { "emotion": "Happy", "confidence": 0.82, "time": 1710000123 },
        ...
      ]
    }
    """
    try:
        data = request.get_json(force=True)
        print("📥 Received session data:", data)

        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        frames = data.get("frames", [])
        duration = int(data.get("duration", 0))

        # --- Aggregate frames on the backend ---
        if frames:
            emotion_list = [f.get("emotion", "Neutral") for f in frames if f.get("emotion")]
            counts = Counter(emotion_list)
            dominant_emotion = counts.most_common(1)[0][0] if counts else "Neutral"

            confidences = [f.get("confidence", 0.0) for f in frames if "confidence" in f]
            avg_confidence = round(sum(confidences) / len(confidences), 4) if confidences else 0.0

            # Normalised distribution (count per emotion)
            emotion_distribution = dict(counts)
        else:
            dominant_emotion = "Neutral"
            avg_confidence = 0.0
            emotion_distribution = {}

        session_doc = {
            "user_id": str(user_id),
            "timestamp": time.time(),
            "duration": duration,
            "dominant_emotion": dominant_emotion,
            "emotion_distribution": emotion_distribution,
            "avg_confidence": avg_confidence,
            "total_frames": len(frames),
        }

        print("📝 Inserting into MongoDB:", session_doc)
        result = sessions_col.insert_one(session_doc)

        if not result.inserted_id:
            return jsonify({"error": "Failed to insert document"}), 500

        return jsonify({"success": True, "id": str(result.inserted_id)})

    except Exception as e:
        print("❌ SAVE SESSION ERROR:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/session/list")
def list_sessions():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    sessions = list(
        sessions_col.find(
            {"user_id": str(user_id)},
            {"_id": 0}
        ).sort("timestamp", ASCENDING)
    )
    return jsonify(sessions)


@app.route("/api/analytics")
def analytics():
    """
    Returns:
    {
      "total_sessions": 10,
      "avg_duration": 95.4,
      "emotion_distribution": { "Happy": 6, "Sad": 2, ... },
      "trend": [
        { "day": "Mon", "Happy": 2, "Sad": 1 },
        ...
      ],
      "avg_confidence": 0.74
    }
    """
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    sessions = list(sessions_col.find({"user_id": str(user_id)}))

    if not sessions:
        return jsonify({
            "total_sessions": 0,
            "emotion_distribution": {},
            "avg_duration": 0,
            "trend": [],
            "avg_confidence": 0
        })

    emotion_counts = {}
    total_duration = 0
    total_confidence = 0.0
    trend_map = {}  # day-label -> { emotion: count }

    DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    for s in sessions:
        total_duration += s.get("duration", 0)
        total_confidence += s.get("avg_confidence", 0.0)

        emo = s.get("dominant_emotion", "")
        if emo:
            emotion_counts[emo] = emotion_counts.get(emo, 0) + 1

        ts = s.get("timestamp")
        if ts:
            import datetime
            day_label = DAY_LABELS[datetime.datetime.fromtimestamp(ts).weekday() % 7]
            if day_label not in trend_map:
                trend_map[day_label] = {}
            if emo:
                trend_map[day_label][emo] = trend_map[day_label].get(emo, 0) + 1

    trend = [{"day": day, **emotions} for day, emotions in trend_map.items()]

    return jsonify({
        "total_sessions": len(sessions),
        "emotion_distribution": emotion_counts,
        "avg_duration": round(total_duration / len(sessions), 1),
        "avg_confidence": round(total_confidence / len(sessions), 4),
        "trend": trend
    })


@app.route("/api/joke")
def joke():
    return jsonify({"joke": get_random_joke()})


@app.route("/api/fact")
def fact():
    return jsonify({"fact": get_one_fact(os.getenv("API_NINJAS_KEY"))})


@app.route("/api/grok", methods=["POST"])
def grok():
    data = request.json
    question = data.get("question")
    if not groq_client:
        return jsonify({"reply": "AI not configured"})
    completion = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": question}],
        model="llama-3.3-70b-versatile"
    )
    return jsonify({"reply": completion.choices[0].message.content})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)