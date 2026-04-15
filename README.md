# 🧠 MoodQuest — Real-time Facial Expression & Mood Analysis

<div align="center">

![MoodQuest Banner](https://img.shields.io/badge/MoodQuest-Mental%20Wellness%20AI-84cc16?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJhMTAgMTAgMCAxIDAgMTAgMTBBMTAgMTAgMCAwIDAgMTIgMnptMCAxOGE4IDggMCAxIDEgOC04IDggOCAwIDAgMS04IDh6Ii8+PC9zdmc+)

**Your face speaks. We listen.**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-mood--quest--zeta.vercel.app-lime?style=for-the-badge)](https://mood-quest-zeta.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Flask](https://img.shields.io/badge/Flask-Python-blue?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EfficientNet--B0-EE4C2C?style=for-the-badge&logo=pytorch)](https://pytorch.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)

[🌐 Live App](https://mood-quest-zeta.vercel.app/) · [📹 Video Demo](https://drive.google.com/drive/folders/17Na-Pc4KGolHg-C5J_kyCj1GSRuipBlg?usp=sharing) · [🐛 Report Bug](#) · [✨ Request Feature](#)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [AI Model](#-ai-model--fine-tuning)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌟 Overview

**MoodQuest** is a full-stack AI-powered mental wellness web application that uses your device camera to perform **real-time facial expression analysis** and detect your emotional state. It tracks mood trends over time, offers validated mental health quizzes, surfaces personalized AI-generated tips, and provides a supportive virtual pet companion.

> 🔗 **Live at:** [https://mood-quest-zeta.vercel.app/](https://mood-quest-zeta.vercel.app/)

The system uses a **fine-tuned EfficientNet-B0** deep learning model trained on the FER2013 dataset to classify facial expressions into seven emotion categories. Stress levels are estimated from aggregated emotion patterns and all session data is persisted to MongoDB Atlas.

---

## ✨ Features

### 🎥 Real-time Mood Monitoring
- Live webcam feed with frame-by-frame emotion detection
- Face detection via OpenCV Haar Cascades
- Detects **7 emotions**: Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral
- Confidence scoring per detection
- Sessions saved automatically with full frame-level metadata

### 📊 Analytics Dashboard
- Interactive charts: mood trend bars, pie distribution, area pattern, radar breakdown
- Session history with dominant emotion, duration, and frame count
- Monthly stats: Happy / Sad / Stressed day counters
- Average mood score and confidence metrics

### 🧪 Mental Health Quizzes
- **PHQ-9** — Depression screening (9 questions)
- **GAD-7** — Generalized Anxiety Disorder screening (7 questions)
- **PSS** — Perceived Stress Scale (10 questions)
- Instant scoring and clinical interpretation
- Powered by a validated backend scoring engine

### 💡 AI-Generated Daily Tips
- New wellness tip generated each day via Claude (Anthropic API)
- Category-based focus: Mindfulness, Movement, Social, Sleep, Nutrition, Creativity, Gratitude
- Includes headline, body, immediate action, scientific rationale, and affirmation
- Cached per day to avoid redundant API calls

### 🐾 Pet Companion Chatbot
- Interactive 3D virtual pet (Spline)
- Powered by **Groq + LLaMA 3.3 70B** for fast, empathetic responses
- Text-to-speech reply playback with mute / replay controls

### 🔐 Authentication
- Email/password sign-up and login via NextAuth + bcrypt
- Google OAuth sign-in
- Facebook OAuth sign-in
- JWT-based sessions with persistent user IDs

### ⚙️ Settings & Profile
- Notification, dark mode, sound, and language preferences (persisted to localStorage)
- Editable profile fields (bio, phone, location)
- Password change for credentials-based accounts
- Account deletion with confirmation

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, Tailwind CSS v4 |
| **Charts** | Recharts |
| **3D Pet** | Spline (`@splinetool/react-spline`) |
| **Auth** | NextAuth.js v4 (Google, Facebook, Credentials) |
| **Backend** | Python 3.9, Flask, Flask-CORS |
| **AI Model** | PyTorch, EfficientNet-B0 via `timm`, OpenCV |
| **LLM Chat** | Groq API (LLaMA 3.3 70B Versatile) |
| **Daily Tips** | Anthropic Claude API (claude-sonnet-4) |
| **Database** | MongoDB Atlas |
| **Deployment** | Vercel (Frontend), Hugging Face Spaces via Docker (Backend) |
| **CI/CD** | GitHub Actions → Hugging Face sync |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Browser                        │
│              https://mood-quest-zeta.vercel.app         │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────▼──────────────┐
         │    Next.js 15 Frontend     │
         │    (Vercel — Edge CDN)     │
         │                            │
         │  • Pages: Dashboard,       │
         │    Monitor, Analysis,      │
         │    Quiz, Pet, Tips,        │
         │    Profile, Settings       │
         │                            │
         │  • NextAuth (JWT)          │
         │  • Recharts visualisation  │
         │  • Spline 3D pet           │
         └──────┬─────────────┬───────┘
                │             │
      Flask API │             │ NextAuth DB
                │             │
  ┌─────────────▼──────┐  ┌───▼──────────────┐
  │  Flask Backend     │  │  MongoDB Atlas   │
  │  (HF Spaces)       │  │                  │
  │                    │  │  Collections:    │
  │  • EfficientNet-B0 │  │  • users         │
  │  • OpenCV face det │  │  • sessions      │
  │  • Groq LLM chat   │  └──────────────────┘
  │  • PHQ-9/GAD-7/PSS │
  │  • Joke & Fact APIs│
  └────────────────────┘
```

---

## 🤖 AI Model & Fine-Tuning

### Model: EfficientNet-B0 (fine-tuned)

| Parameter | Value |
|---|---|
| Base Architecture | EfficientNet-B0 (ImageNet pretrained) |
| Dataset | FER2013 (Facial Expression Recognition 2013) |
| Classes | 7 (Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral) |
| Input Size | 224 × 224 px (grayscale → 3-channel) |
| Best Val Accuracy | ~70% |
| Framework | PyTorch + `timm` |
| Training Hardware | CUDA GPU |

### Training Configuration

```python
Batch Size:    24
Epochs:        10
Learning Rate: 0.001
Optimizer:     Adam
Scheduler:     CosineAnnealingLR
Subset:        70% of FER2013 training set
Augmentation:  RandomHorizontalFlip, RandomRotation(10°),
               ColorJitter(brightness=0.2, contrast=0.2)
```

### Inference Pipeline

```
Webcam Frame → OpenCV Haar Cascade (face detection)
             → Crop face ROI
             → Grayscale → Resize 224×224 → ToTensor → Normalize
             → EfficientNet-B0
             → Softmax → Top-1 emotion + confidence
```

The model file `best_fer2013_model_70.pth` is loaded at backend startup and hosted via Hugging Face Spaces with Git LFS.

---

## 📸 Screenshots

| Page | Description |
|---|---|
| **Landing** | Hero page with sign-up CTA |
| **Login** | Email/password + Google/Facebook OAuth |
| **Dashboard** | Mood journey chart, monthly stats, quick actions |
| **Monitor** | Live webcam feed with real-time emotion overlay |
| **Analysis** | Trend bars, pie chart, radar, performance graph |
| **Quiz** | PHQ-9 / GAD-7 / PSS assessments with instant results |
| **Daily Tip** | AI-generated wellness tip with action and affirmation |
| **Pet** | 3D Spline companion with Groq-powered chat |
| **Profile** | Editable personal info, achievements |
| **Settings** | Notifications, appearance, account management |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm / yarn
- **Python** 3.9+
- **MongoDB Atlas** cluster (free tier works)
- **Groq API key** (free at [console.groq.com](https://console.groq.com))
- **Google OAuth credentials** (for social login)
- **Anthropic API key** (for daily tips)
- GPU with CUDA support *(optional — CPU fallback available)*

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd Backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate       # Linux / macOS
venv\Scripts\activate          # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create your .env file
cp .env.example .env
```

Populate `Backend/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mood_monitor
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
API_NINJAS_KEY=xxxxxxxxxxxxxxxxxxxx
PORT=7860
```

```bash
# 5. Add your model file (download from releases or train yourself)
# Place best_fer2013_model_70.pth in the Backend/ directory

# 6. Start the server
python main.py
# Backend runs on http://localhost:7860
```

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd Frontend

# 2. Install dependencies
npm install
# or
yarn

# 3. Create your .env.local file
cp .env.example .env.local
```

Populate `Frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:7860
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mood_monitor
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
FACEBOOK_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
FACEBOOK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

```bash
# 4. Start the development server
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`Backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas connection string | ✅ |
| `GROQ_API_KEY` | Groq API key for LLM chat | ✅ |
| `API_NINJAS_KEY` | API Ninjas key for random facts | ⚠️ Optional |
| `PORT` | Server port (default: 7860) | ⚠️ Optional |

### Frontend (`Frontend/.env.local`)

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Flask backend URL | ✅ |
| `MONGO_URI` | MongoDB Atlas connection string | ✅ |
| `NEXTAUTH_URL` | App base URL | ✅ |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ⚠️ For Google login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ⚠️ For Google login |
| `FACEBOOK_CLIENT_ID` | Facebook App ID | ⚠️ For Facebook login |
| `FACEBOOK_CLIENT_SECRET` | Facebook App secret | ⚠️ For Facebook login |

---

## 📡 API Reference

### Health

```
GET /api/health
→ { "status": "ok", "model_loaded": true }
```

### Emotion Detection

```
POST /api/analyze-frame
Content-Type: multipart/form-data
Body: image (file)

→ {
    "face_detected": true,
    "dominant_emotion": "Happy",
    "emotions": { "happy": 0.87 }
  }
```

### Sessions

```
POST /api/session/save
Body: {
  "user_id": "string",
  "duration": 120,
  "frames": [{ "emotion": "Happy", "confidence": 0.82, "time": 1710000123 }]
}

GET /api/session/list?user_id=<id>
→ Array of session documents
```

### Analytics

```
GET /api/analytics?user_id=<id>
→ {
    "total_sessions": 10,
    "emotion_distribution": { "Happy": 6, "Sad": 2 },
    "avg_duration": 95.4,
    "avg_confidence": 0.74,
    "trend": [{ "day": "Mon", "Happy": 2, "Sad": 1 }]
  }
```

### Quizzes

```
GET  /api/questionnaire/<PHQ-9|GAD-7|PSS>
POST /api/questionnaire/submit
     Body: { "name": "PHQ-9", "answers": [0,1,2,1,0,0,1,0,0] }
→   { "score": 14, "interpretation": "Moderate depression" }
```

### Chat & Content

```
POST /api/grok
     Body: { "question": "I'm feeling anxious today" }
→   { "reply": "..." }

GET /api/joke
→  { "joke": "..." }

GET /api/fact
→  { "fact": "..." }
```

---

## 📁 Project Structure

```
redinferno1736-moodquest/
├── .github/
│   └── workflows/
│       └── sync_to_hf.yml          # CI: auto-deploy backend to Hugging Face
│
├── Backend/
│   ├── main.py                     # Flask app (primary)
│   ├── app.py                      # Flask app (alternate/legacy)
│   ├── helpers.py                  # Joke & fact fetchers
│   ├── trivia.py                   # PHQ-9 / GAD-7 / PSS quiz engine
│   ├── requirements.txt
│   ├── Dockerfile                  # Docker config for Hugging Face Spaces
│   └── best_fer2013_model_70.pth   # Fine-tuned model (Git LFS)
│
├── Fine_Tuning/
│   ├── tune.py                     # EfficientNet-B0 training script
│   └── Model_Fine_Tuning.md        # Training documentation
│
└── Frontend/
    ├── app/
    │   ├── page.js                 # Landing page
    │   ├── layout.js               # Root layout + SessionProvider
    │   ├── globals.css
    │   ├── [username]/dashboard/   # (legacy route)
    │   ├── dashboard/              # Main dashboard
    │   ├── monitor/                # Live mood detection
    │   ├── analysis/               # Charts & session history
    │   ├── quiz/                   # PHQ-9 / GAD-7 / PSS
    │   ├── pet/                    # 3D pet chatbot
    │   ├── tips/                   # AI daily wellness tips
    │   ├── profile/                # User profile
    │   ├── settings/               # Preferences & account
    │   ├── help/                   # FAQ & support
    │   └── api/auth/               # NextAuth routes + signup
    ├── components/
    │   ├── Navbar.js
    │   ├── SessionProvider.js
    │   ├── VideoFeed.js
    │   └── CameraFeed.js
    ├── lib/
    │   ├── api.js                  # API client helpers
    │   ├── auth.js                 # Credential verification
    │   └── db.js                   # MongoDB client + user creation
    └── next.config.mjs             # Proxy rewrites → Flask backend
```

---

## ☁️ Deployment

### Frontend — Vercel

The Next.js frontend is deployed on [Vercel](https://vercel.com) with automatic deployments on every push to `main`.

1. Import the repo into Vercel
2. Set the root directory to `Frontend`
3. Add all environment variables from the table above
4. Deploy — Vercel handles the rest

**Live URL:** [https://mood-quest-zeta.vercel.app/](https://mood-quest-zeta.vercel.app/)

### Backend — Hugging Face Spaces (Docker)

The Flask backend is deployed as a Docker container on [Hugging Face Spaces](https://huggingface.co/spaces).

A GitHub Actions workflow (`.github/workflows/sync_to_hf.yml`) automatically syncs the `Backend/` folder to the HF Space on every push to `main`, including the large model file via **Git LFS**.

```yaml
# Trigger: push to main
# Action: git push Backend/ → huggingface.co/spaces/akshay1306/moodquest-api
```

To deploy manually:
```bash
cd Backend
git init && git lfs install && git lfs track "*.pth"
git add . && git commit -m "Deploy"
git remote add space https://<user>:<HF_TOKEN>@huggingface.co/spaces/<org>/<space>
git push --force space main
```

---

## 📄 License

This project was built as a personal/educational project. All third-party services and datasets are subject to their own respective licenses and terms of service.

---

<div align="center">

**[Try MoodQuest Live →](https://mood-quest-zeta.vercel.app/)**

</div>