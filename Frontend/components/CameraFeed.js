'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';

const CameraFeed = ({ onAnalysisComplete }) => {
  const webcamRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localStats, setLocalStats] = useState({ face_detected: false });

  const captureAndAnalyze = useCallback(async () => {
    if (isProcessing || !webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot({ mirrored: false });
    if (!imageSrc) return;

    setIsProcessing(true);
    try {
      const blob = await fetch(imageSrc).then(r => r.blob());
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-frame`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!data.error) {
        setLocalStats({ face_detected: data.face_detected });
        
        // CRITICAL: Pass data to parent component
        if (onAnalysisComplete) {
          onAnalysisComplete({
            emotions: data.emotions,           // e.g., { happy: 0.75, sad: 0.1, ... }
            dominant_emotion: data.dominant_emotion,  // e.g., "happy"
            face_detected: data.face_detected  // true/false
          });
        }
      }
    } catch (error) {
      console.error("Frame Analysis Error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [webcamRef, isProcessing, onAnalysisComplete]);

  useEffect(() => {
    const interval = setInterval(captureAndAnalyze, 500);
    return () => clearInterval(interval);
  }, [captureAndAnalyze]);

  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden">
      <Webcam
        ref={webcamRef}
        mirrored={false}
        audio={false}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover"
      />
      {!localStats.face_detected && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
          No Face Detected
        </div>
      )}
    </div>
  );
};

export default CameraFeed;  