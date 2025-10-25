'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import VideoFeed from '@/components/VideoFeed';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MonitorPage() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/Prateek/dashboard" className="inline-flex items-center gap-2 mb-6 text-lime-600 font-bold hover:text-lime-700">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-black text-gray-900 mb-8">LIVE EMOTION MONITORING</h1>

        <div className="grid grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="col-span-2">
            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h2 className="text-2xl font-black mb-4">LIVE FEED</h2>
              <div className="aspect-video">
                <VideoFeed />
              </div>
            </div>
          </div>

          {/* Analytics Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h3 className="text-xl font-black mb-4">CURRENT EMOTION</h3>
              {analytics && (
                <>
                  <p className="text-5xl font-black text-lime-600 mb-2">
                    {analytics.current_emotion}
                  </p>
                  <p className="text-gray-600">
                    Confidence: {analytics.confidence}%
                  </p>
                </>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h3 className="text-xl font-black mb-4">STRESS LEVEL</h3>
              {analytics && (
                <p className={`text-4xl font-black ${
                  analytics.stress_level === 'Low' ? 'text-green-500' :
                  analytics.stress_level === 'Medium' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {analytics.stress_level}
                </p>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h3 className="text-xl font-black mb-4">EMOTION DISTRIBUTION</h3>
              {analytics && analytics.emotion_distribution && (
                <div className="space-y-2">
                  {Object.entries(analytics.emotion_distribution).map(([emotion, count]) => (
                    <div key={emotion} className="flex justify-between items-center">
                      <span className="font-bold">{emotion}</span>
                      <span className="text-gray-600">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
