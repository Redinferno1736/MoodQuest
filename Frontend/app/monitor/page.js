"use client"

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const MonitorPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const sessionBufferRef = useRef([]);

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('');
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [saving, setSaving] = useState(false);
  // ✅ NEW: surface camera/API errors to the user instead of failing silently
  const [cameraError, setCameraError] = useState('');
  const [apiError, setApiError] = useState('');

  // ── Start webcam ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      // ✅ FIX: explicit constraints help browsers grant permission reliably
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // ✅ FIX: wait for metadata so the video element actually renders
        // before we start pulling frames from it.
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = resolve;
          videoRef.current.onerror = reject;
        });

        // ✅ FIX: explicitly call play() — autoPlay alone is unreliable in
        // some production/HTTPS environments when the element is hidden at mount.
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
      return false; // signal failure
    }
    return true; // signal success
  }, []);

  // ── Stop webcam ───────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // ── Capture & analyze one frame ───────────────────────────────────────────
  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;

    // ✅ FIX: don't capture if video isn't actually playing yet
    if (video.readyState < 2) return;

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // ✅ FIX: guard against missing env var — show clear error instead of
      // silently hitting "undefined/api/analyze-frame"
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        setApiError('NEXT_PUBLIC_API_URL is not set. Check your Vercel environment variables.');
        return;
      }

      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      try {
        const res = await fetch(`${apiUrl}/api/analyze-frame`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          console.error('Analyze-frame HTTP error:', res.status);
          return;
        }

        const data = await res.json();
        setApiError(''); // clear any previous error on success
        setFaceDetected(data.face_detected);

        if (data.face_detected && data.dominant_emotion) {
          const emotion = data.dominant_emotion;
          const confidence = data.emotions?.[emotion.toLowerCase()] ?? 0;

          setCurrentEmotion(emotion);
          setCurrentConfidence(confidence);

          sessionBufferRef.current.push({
            emotion,
            confidence: parseFloat(confidence.toFixed(4)),
            time: Math.floor(Date.now() / 1000),
          });
          setFrameCount(sessionBufferRef.current.length);
        }
      } catch (err) {
        console.error('Frame analysis error:', err);
        setApiError('Cannot reach backend. Check that your Hugging Face space is running.');
      }
    }, 'image/jpeg', 0.8);
  }, []);

  // ── Start monitoring ──────────────────────────────────────────────────────
  const startMonitoring = useCallback(async () => {
    sessionBufferRef.current = [];
    setFrameCount(0);
    setCurrentEmotion('');
    setCurrentConfidence(0);
    setFaceDetected(false);
    setApiError('');

    const cameraStarted = await startCamera();
    if (!cameraStarted) return; // abort if camera failed

    startTimeRef.current = Date.now();
    setIsMonitoring(true);
    intervalRef.current = setInterval(analyzeFrame, 500);
  }, [startCamera, analyzeFrame]);

  // ── POST session to backend ───────────────────────────────────────────────
  const saveSession = useCallback(async (frames, duration) => {
    if (frames.length === 0) {
      console.warn('Empty buffer — nothing to save');
      return;
    }
    if (!session?.user?.id) {
      console.warn('No user id — session not saved');
      return;
    }

    setSaving(true);
    try {
      const payload = { user_id: session.user.id, duration, frames };
      console.log('💾 Saving session:', payload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/session/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error('❌ Save HTTP error:', res.status);
        return;
      }

      const result = await res.json();
      if (result.success) {
        console.log('✅ Session saved:', result.id);
      } else {
        console.error('❌ Save failed:', result.error);
      }
    } catch (err) {
      console.error('Save session error:', err);
    } finally {
      setSaving(false);
    }
  }, [session?.user?.id]);

  // ── Stop monitoring + save session ────────────────────────────────────────
  const stopMonitoring = useCallback(async () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsMonitoring(false);
    stopCamera();

    const duration = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
    const frames = [...sessionBufferRef.current];
    await saveSession(frames, duration);
  }, [stopCamera, saveSession]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopCamera();
    };
  }, [stopCamera]);

  const emotionEmoji = {
    Happy: '😊', Sad: '😢', Angry: '😠',
    Fear: '😨', Surprise: '😲', Disgust: '🤢', Neutral: '😐',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 via-emerald-100 to-teal-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-black text-gray-800 mb-2">MOOD MONITOR</h1>
      <p className="text-xl font-bold text-lime-600 mb-8">Real-time emotion detection</p>

      {/* ✅ NEW: Camera error banner */}
      {cameraError && (
        <div className="mb-6 w-full max-w-2xl bg-red-100 border-2 border-red-400 rounded-2xl p-4">
          <p className="text-red-800 font-bold text-center">⚠️ {cameraError}</p>
        </div>
      )}

      {/* ✅ NEW: API error banner */}
      {apiError && (
        <div className="mb-6 w-full max-w-2xl bg-orange-100 border-2 border-orange-400 rounded-2xl p-4">
          <p className="text-orange-800 font-bold text-center">⚠️ {apiError}</p>
        </div>
      )}

      {/* Video Feed */}
      <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-lime-400">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          // ✅ FIX: explicit dimensions so the element exists in the layout
          // even before the stream attaches — prevents the "invisible video" bug
          width={640}
          height={480}
          className="w-[640px] h-[480px] object-cover bg-gray-900"
        />
        <canvas ref={canvasRef} className="hidden" />

        {isMonitoring && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-black text-sm bg-black/50 px-2 py-1 rounded-full">
              LIVE • {frameCount} frames
            </span>
          </div>
        )}

        {isMonitoring && !faceDetected && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <p className="text-white font-black text-2xl">No face detected</p>
          </div>
        )}
      </div>

      {/* Emotion display */}
      {isMonitoring && currentEmotion && (
        <div className="mb-6 bg-white rounded-3xl shadow-xl p-6 text-center min-w-[300px]">
          <div className="text-6xl mb-2">{emotionEmoji[currentEmotion] || '🤔'}</div>
          <p className="text-3xl font-black text-gray-800">{currentEmotion.toUpperCase()}</p>
          <p className="text-lg font-bold text-lime-600">
            Confidence: {Math.round(currentConfidence * 100)}%
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-6">
        {!isMonitoring ? (
          <button
            onClick={startMonitoring}
            disabled={saving}
            className="px-12 py-5 bg-lime-500 hover:bg-lime-600 text-white font-black text-2xl rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-60"
          >
            START MONITORING
          </button>
        ) : (
          <button
            onClick={stopMonitoring}
            disabled={saving}
            className="px-12 py-5 bg-red-500 hover:bg-red-600 text-white font-black text-2xl rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-60"
          >
            {saving ? 'SAVING...' : 'STOP & SAVE'}
          </button>
        )}

        <button
          onClick={() => router.back()}
          className="px-8 py-5 bg-white hover:bg-gray-100 text-gray-800 font-black text-2xl rounded-full shadow-xl hover:shadow-2xl transition-all"
        >
          BACK
        </button>
      </div>

      {isMonitoring && (
        <p className="mt-4 text-gray-600 font-bold">
          Capturing every 500ms • {frameCount} frames collected
        </p>
      )}
    </div>
  );
};

export default MonitorPage;