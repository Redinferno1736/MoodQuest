# MoodQuest - Real-time Facial Expression and Mood Analysis

### Video Demo - https://drive.google.com/drive/folders/17Na-Pc4KGolHg-C5J_kyCj1GSRuipBlg?usp=sharing

## Project Overview

MoodQuest is an AI-powered web application for real-time facial landmark and micro-expression analysis to detect users' mood and stress levels. It features a dashboard with visualizations, mental health quick quizzes, personalized insights, and a supportive pet companion chatbot.

The system uses a fine-tuned EfficientNet-B0 deep learning model to classify facial expressions into seven emotion categories: Angry, Disgust, Fear, Happy, Sad, Surprise, and Neutral. The app estimates stress levels based on detected emotions and tracks mood trends over time.

## Dataset and Model

- The model is a fine-tuned EfficientNet-B0 trained specifically on FER2013 (Facial Expression Recognition 2013) dataset, which includes labeled facial expression images.
- The model file `bestfer2013model70.pth` is loaded at backend startup.
- Facial landmarks and expressions are detected from webcam input using OpenCV's Haar cascades and PyTorch for inference on the GPU if available.

## Technical Approach

- **Backend:** Flask API server handling camera feed, emotion detection, mood analysis logic, mental health quizzes (PHQ-9, GAD-7, PSS), and external APIs integration (jokes, facts, Gemini API for chat).
- **Frontend:** Next.js React app with personalized dashboards, real-time video feed, quizzes, profile management, insights, and accessibility features.
- **Communication:** Next.js frontend proxies API requests to Flask backend running on port 5000.
- **Emotion Detection:** Input frames are pre-processed and passed through the EfficientNet model to predict emotion probabilities.
- **Stress Level Calculation:** Based on the frequency of negative emotions in recent observations.
- **Additional Features:** Real-time analytics, jokes, facts, and a chatbot to improve user engagement and mental well-being.

## Directory Structure

```

redinferno1736-moodquest/
├── README.md
├── Backend/
│   ├── helpers.py
│   ├── main.py
│   ├── requirements.txt
│   └── trivia.py
└── Frontend/
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── app/
│   ├── globals.css
│   ├── layout.js
│   ├── page.js
│   ├── [username]/
│   │   └── dashboard/
│   │       └── page.js
│   ├── analysis/
│   │   └── page.js
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.js
│   │       └── signup/
│   │           └── route.js
│   ├── auth/
│   │   └── login/
│   │       └── page.js
│   ├── monitor/
│   │   └── page.js
│   ├── pet/
│   │   └── page.js
│   ├── profile/
│   │   └── page.js
│   ├── quiz/
│   │   └── page.js
│   └── settings/
│       └── page.js
├── components/
│   ├── Navbar.js
│   ├── SessionProvider.js
│   └── VideoFeed.js
└── lib/
├── api.js
├── auth.js
└── db.js

```

## Prerequisites

- Python 3.8+ 
- Node.js 18+ and npm/yarn
- GPU with CUDA support recommended for backend model acceleration (optional)
- Environment variables configured in `.env` files for API keys and secrets

## Backend Setup

1. Navigate to the Backend directory:
```

cd Backend

```

2. Create and activate a Python virtual environment (recommended):
```

python -m venv venv
source venv/bin/activate    \# Linux/Mac
venv\Scripts\activate       \# Windows

```

3. Install the required Python packages:
```

pip install -r requirements.txt

```

4. Prepare environment variables for API keys by creating a `.env` file with values such as:
```

NINJAAPI=<your_api_ninjas_key>
GEMINIAPIKEY=<your_gemini_api_key>
GEMINIAPIURL=<your_gemini_api_url>

```

5. Run the backend server:
```

python main.py

```
The backend will start on `http://localhost:5000/`.

## Frontend Setup

1. Navigate to the Frontend directory:
```

cd ../Frontend

```

2. Install Node.js dependencies:
```

npm install

```
or
```

yarn

```

3. Set up environment variables for Next.js in `.env.local` (example):
```

NEXT_PUBLIC_API_URL=http://localhost:5000
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
NEXTAUTH_SECRET=<your_nextauth_secret>

```

4. Run the frontend development server:
```

npm run dev

```
or
```

yarn dev

```
The frontend will be available at `http://localhost:3000/`.

## Usage

- Open the frontend URL and sign up or log in.
- Allow camera access for real-time mood detection.
- Use the dashboard to view live emotion analysis and stress levels.
- Take mental health quizzes and view personalized insights.
- Interact with the pet support chatbot.
- Access other features like mood trends, profile, and settings.

---

Thank you for reviewing MoodQuest. For any questions or issues running the app locally, please contact the project team.


