"use client"
import React, { useState, useCallback } from 'react';
import { Camera, Save, TrendingUp, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CameraFeed from '@/components/CameraFeed';

const MonitorPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [sessionData, setSessionData] = useState({
    emotions: {},
    dominant_emotion: '',
    face_detected: false
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  const handleAnalysisComplete = useCallback((data) => {
    setSessionData(prev => ({
      ...prev,
      emotions: data.emotions || prev.emotions,
      dominant_emotion: data.dominant_emotion || prev.dominant_emotion,
      face_detected: data.face_detected || false
    }));
  }, []);

  const startSession = () => {
    setIsMonitoring(true);
    setSessionStartTime(Date.now());
    setSaveStatus('');
  };

const endAndSaveSession = async () => {
  console.log("STOP CLICKED");
  
  if (!sessionStartTime) {
    setSaveStatus("✗ Error: No active session");
    return;
  }

  if (!session?.user?.id) {
    setSaveStatus("✗ Error: Not authenticated");
    return;
  }

  // ADD THIS CHECK
  if (Object.keys(sessionData.emotions).length === 0) {
    setSaveStatus("✗ Error: No emotion data captured");
    return;
  }

  const duration = Math.round((Date.now() - sessionStartTime) / 1000);

  try {
    const payload = {
      user_id: String(session.user.id),
      duration,
      emotions: sessionData.emotions,
      dominant_emotion: sessionData.dominant_emotion
    };

    console.log("Sending payload:", payload);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/session/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // IMPROVED ERROR HANDLING
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const result = await res.json();
    console.log("Save successful:", result);

    setSaveStatus("✓ Session saved successfully!");
    setIsMonitoring(false);
    setSessionStartTime(null);

    setTimeout(() => {
      router.push(`/${session.user.name}/dashboard`);
    }, 1200);


  } catch (err) {
    console.error("SAVE ERROR:", err);
    setSaveStatus(`✗ Error: ${err.message}`);
  }
};


  if (status === "loading") {
    return <div className="p-10 text-xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 to-emerald-200 p-8">
      <div className="max-w-6xl mx-auto">

        <button 
          onClick={() => router.push('/dashboard')}
          className="mb-4 flex items-center gap-2 text-gray-700 hover:text-gray-900 font-bold"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <h1 className="text-5xl font-black text-gray-800 mb-8">MOOD MONITOR</h1>

        <div className="grid grid-cols-2 gap-8">

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-black mb-4">Camera Feed</h2>

            {isMonitoring && <CameraFeed onAnalysisComplete={handleAnalysisComplete} />}

            {!isMonitoring && (
              <div className="w-full h-96 bg-gray-900 rounded-2xl flex items-center justify-center">
                <Camera size={64} className="text-gray-600" />
              </div>
            )}

            <div className="mt-6">
              {!isMonitoring ? (
                <button
                  onClick={startSession}
                  className="w-full py-4 bg-lime-500 text-white font-black text-xl rounded-2xl"
                >
                  START MONITORING
                </button>
              ) : (
                <button
                  onClick={endAndSaveSession}
                  className="w-full py-4 bg-red-500 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-2"
                >
                  <Save size={24} />
                  STOP & SAVE SESSION
                </button>
              )}
            </div>

            {saveStatus && (
              <div className="mt-4 p-4 text-center font-bold">
                {saveStatus}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <TrendingUp size={28} />
              Current Emotions
            </h2>

            {Object.keys(sessionData.emotions).length === 0 ? (
              <p className="text-gray-400">Start monitoring to see emotions</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(sessionData.emotions).map(([emotion, value]) => (
                  <div key={emotion}>
                    <div className="flex justify-between">
                      <span className="capitalize">{emotion}</span>
                      <span>{Math.round(value * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded">
                      <div className="bg-lime-500 h-3 rounded" style={{ width: `${value * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorPage;
