"use client"

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * Monitor page — captures webcam frames, sends each to /api/analyze-frame,
 * accumulates results in a ref-backed buffer (avoids stale-closure bugs in
 * production/strict mode), then POSTs the full buffer to /api/session/save
 * when the user stops.
 */
const MonitorPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  // KEY FIX: keep the live buffer in a ref so analyzeFrame always appends to
  // the latest array without any stale-closure or functional-update tricks.
  const sessionBufferRef = useRef([]);

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('');
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [frameCount, setFrameCount] = useState(0); // display only
  const [saving, setSaving] = useState(false);

  // ── Start webcam ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Camera error:', err);
    }
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
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-frame`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        setFaceDetected(data.face_detected);

        if (data.face_detected && data.dominant_emotion) {
          const emotion = data.dominant_emotion;
          const confidence = data.emotions?.[emotion.toLowerCase()] ?? 0;

          setCurrentEmotion(emotion);
          setCurrentConfidence(confidence);

          // Append to ref-backed buffer — no stale closure, no React batching issues
          sessionBufferRef.current.push({
            emotion,
            confidence: parseFloat(confidence.toFixed(4)),
            time: Math.floor(Date.now() / 1000),
          });
          setFrameCount(sessionBufferRef.current.length);
        }
      } catch (err) {
        console.error('Frame analysis error:', err);
      }
    }, 'image/jpeg', 0.8);
  }, []); // no deps needed — only refs and setters (both stable)

  // ── Start monitoring ──────────────────────────────────────────────────────
  const startMonitoring = useCallback(async () => {
    sessionBufferRef.current = []; // reset buffer for new session
    setFrameCount(0);
    setCurrentEmotion('');
    setCurrentConfidence(0);
    setFaceDetected(false);

    await startCamera();
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
      const payload = {
        user_id: session.user.id,
        duration,
        frames,
      };

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
    // Read directly from the ref — always current, no stale closure
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

  // ── Emotion to emoji helper ───────────────────────────────────────────────
  const emotionEmoji = {
    Happy: '😊', Sad: '😢', Angry: '😠',
    Fear: '😨', Surprise: '😲', Disgust: '🤢', Neutral: '😐',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 via-emerald-100 to-teal-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-black text-gray-800 mb-2">MOOD MONITOR</h1>
      <p className="text-xl font-bold text-lime-600 mb-8">Real-time emotion detection</p>

      {/* Video Feed */}
      <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-lime-400">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-[640px] h-[480px] object-cover bg-gray-900"
        />
        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay */}
        {isMonitoring && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-black text-sm bg-black/50 px-2 py-1 rounded-full">
              LIVE • {frameCount} frames
            </span>
          </div>
        )}

        {isMonitoring && !faceDetected && (
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

      {/* Buffer info during session */}
      {isMonitoring && (
        <p className="mt-4 text-gray-600 font-bold">
          Capturing every 500ms • {frameCount} frames collected
        </p>
      )}
    </div>
  );
};

export default MonitorPage;