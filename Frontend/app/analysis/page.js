"use client"

import React, { useState, useEffect } from 'react';
import { Bell, Home, TrendingUp, Heart, Settings, HelpCircle, User, Smile, Target, Award, Calendar } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

// Colours for pie chart slices
const EMOTION_COLORS = {
  Happy: '#a3e635',
  Sad: '#f87171',
  Angry: '#fde047',
  Fear: '#fb923c',
  Disgust: '#a78bfa',
  Surprise: '#38bdf8',
  Neutral: '#94a3b8',
};

const AnalysisPage = () => {
  const params = useParams();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState('analysis');
  const [timeRange, setTimeRange] = useState('month');

  // ── Real data state ──────────────────────────────────────────────────────
  const [analyticsData, setAnalyticsData] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch analytics + session list ──────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [analyticsRes, sessionsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics?user_id=${session.user.id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/session/list?user_id=${session.user.id}`),
        ]);

        const analytics = await analyticsRes.json();
        const sessions = await sessionsRes.json();

        setAnalyticsData(analytics);
        setUserSessions(Array.isArray(sessions) ? sessions : []);
      } catch (err) {
        console.error("Failed to load analysis data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [session, timeRange]);

  // ── Derived chart data ───────────────────────────────────────────────────

  // Mood Distribution pie
  const getMoodDistribution = () => {
    if (!analyticsData?.emotion_distribution) return [];
    return Object.entries(analyticsData.emotion_distribution).map(([name, value]) => ({
      name,
      value,
      color: EMOTION_COLORS[name] || '#94a3b8',
    }));
  };

  // Weekly trend bar chart (from /api/analytics trend array)
  const getTrendData = () => {
    if (!analyticsData?.trend || analyticsData.trend.length === 0) return [];
    return analyticsData.trend;
  };

  // Daily mood area chart from session list (avg_confidence * 5 per session, grouped by day)
  const getDailyMoodData = () => {
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map = {};
    userSessions.forEach((s) => {
      if (!s.timestamp) return;
      const day = DAY_LABELS[new Date(s.timestamp * 1000).getDay()];
      if (!map[day]) map[day] = { total: 0, count: 0 };
      map[day].total += (s.avg_confidence || 0) * 5;
      map[day].count += 1;
    });
    return DAY_LABELS.filter(d => map[d]).map(day => ({
      day,
      mood: Math.round((map[day].total / map[day].count) * 10) / 10,
    }));
  };

  // Performance vs mood from last 10 sessions
  const getPerformanceData = () => {
    if (!userSessions.length) return [];
    return userSessions.slice(-10).map((s, i) => {
      const dist = s.emotion_distribution || {};
      const totalFrames = s.total_frames || 1;
      const positiveCount = (dist['Happy'] || 0) + (dist['Surprise'] || 0);
      return {
        session: i + 1,
        performance: Math.round((positiveCount / totalFrames) * 100),
        mood: Math.round((s.avg_confidence || 0) * 5 * 10) / 10,
      };
    });
  };

  // Quick stats
  const totalSessions = analyticsData?.total_sessions || 0;
  const avgDuration = analyticsData?.avg_duration || 0;
  const avgConfidence = analyticsData?.avg_confidence || 0;
  const dist = analyticsData?.emotion_distribution || {};
  const totalEmotionCounts = Object.values(dist).reduce((a, b) => a + b, 0);
  const happyPct = totalEmotionCounts > 0
    ? Math.round(((dist['Happy'] || 0) / totalEmotionCounts) * 100)
    : 0;
  const avgMoodScore = Math.round(avgConfidence * 5 * 10) / 10;

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-lime-600" />
      </div>
    );
  }

  const moodDistributionData = getMoodDistribution();
  const trendData = getTrendData();
  const dailyMoodData = getDailyMoodData();
  const performanceData = getPerformanceData();

  // Fallback static data if no sessions yet (keeps charts from being empty/broken)
  const hasData = userSessions.length > 0;

  return (
    <div className="flex h-screen bg-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-lime-200 flex flex-col">
        <div className="bg-gray-900 text-white p-6 text-center">
          <h1 className="text-2xl font-black tracking-wide">DASHBOARD</h1>
          <p className="text-sm font-bold text-lime-400 mt-2">
            {session?.user?.name || params.username}
          </p>
        </div>

        <nav className="flex-1 py-4">
          <Link
            href={`/${params.username}/dashboard`}
            onClick={() => setActiveTab('home')}
            className={`w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 transition-colors ${activeTab === 'home' ? 'bg-lime-600 text-white' : 'bg-lime-200 text-gray-900 hover:bg-lime-300'}`}
          >
            <Home size={24} />HOME
          </Link>
          <Link
            href="/analysis"
            onClick={() => setActiveTab('analysis')}
            className={`w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 transition-colors ${activeTab === 'analysis' ? 'bg-lime-600 text-white' : 'bg-lime-200 text-gray-900 hover:bg-lime-300'}`}
          >
            <TrendingUp size={24} />ANALYSIS
          </Link>
          <Link
            href="/pet"
            onClick={() => setActiveTab('pet')}
            className={`w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 transition-colors ${activeTab === 'pet' ? 'bg-lime-600 text-white' : 'bg-lime-200 text-gray-900 hover:bg-lime-300'}`}
          >
            <Heart size={24} />PET SUPPORT
          </Link>
          <Link
            href="/settings"
            onClick={() => setActiveTab('settings')}
            className={`w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-lime-600 text-white' : 'bg-lime-200 text-gray-900 hover:bg-lime-300'}`}
          >
            <Settings size={24} />SETTINGS
          </Link>
        </nav>

        <div className="border-t-2 border-lime-400">
          <Link href="/help" className="w-full px-6 py-4 text-left font-black text-lg flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300">
            <HelpCircle size={20} />HELP
          </Link>
          <Link href="/profile" className="w-full px-6 py-4 text-left font-black text-lg flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300">
            <User size={20} />PROFILE
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        {/* Header */}
        <div className="bg-white px-8 py-6 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-4xl font-black text-gray-900">ANALYSIS</h1>
            <p className="text-gray-600 font-bold mt-1">Track your mood patterns and insights</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-lime-200 rounded-full hover:bg-lime-300 transition-colors">
              <Bell size={24} className="text-gray-900" />
            </button>
            <button className="px-8 py-3 bg-lime-500 text-white font-black text-xl rounded-full hover:bg-lime-600 transition-colors">
              LOG OUT
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Time Range Selector */}
            <div className="flex gap-4 mb-6">
              {['week', 'month', 'year'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-3 font-black rounded-full transition-colors ${timeRange === range ? 'bg-lime-500 text-white' : 'bg-white text-gray-900 hover:bg-lime-100'}`}
                >
                  THIS {range.toUpperCase()}
                </button>
              ))}
            </div>

            {/* No data banner */}
            {!hasData && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-4">
                <p className="text-lg font-bold text-blue-800">
                  📊 No session data yet — complete a mood monitoring session to see real analytics!
                </p>
              </div>
            )}

            {/* Quick Stats (real data) */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-lime-400 to-lime-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <Smile size={32} />
                </div>
                <p className="text-4xl font-black mb-1">{happyPct}%</p>
                <p className="font-bold text-lime-100">Overall Happiness</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp size={32} />
                </div>
                <p className="text-4xl font-black mb-1">{avgMoodScore}</p>
                <p className="font-bold text-blue-100">Average Mood Score</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <Target size={32} />
                </div>
                <p className="text-4xl font-black mb-1">{totalSessions}</p>
                <p className="font-bold text-purple-100">Check-ins Completed</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <Award size={32} />
                </div>
                <p className="text-4xl font-black mb-1">{Math.round(avgDuration)}s</p>
                <p className="font-bold text-orange-100">Avg Session Duration</p>
              </div>
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Mood Trend (from backend trend array) */}
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-2xl font-black text-gray-900 mb-4">MOOD TRENDS</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData.length ? trendData : [{ day: 'No data', Happy: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Happy" fill="#a3e635" name="Happy" />
                    <Bar dataKey="Sad" fill="#f87171" name="Sad" />
                    <Bar dataKey="Angry" fill="#fde047" name="Stressed" />
                    <Bar dataKey="Neutral" fill="#94a3b8" name="Neutral" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Mood Distribution Pie */}
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-2xl font-black text-gray-900 mb-4">MOOD DISTRIBUTION</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodDistributionData.length ? moodDistributionData : [{ name: 'No data', value: 1, color: '#e5e7eb' }]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {(moodDistributionData.length ? moodDistributionData : [{ color: '#e5e7eb' }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Mood Pattern */}
            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h3 className="text-2xl font-black text-gray-900 mb-4">DAILY MOOD PATTERN</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyMoodData.length ? dailyMoodData : [{ day: 'No data', mood: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="mood" stroke="#84cc16" fill="#d9f99d" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Emotion breakdown radar */}
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-2xl font-black text-gray-900 mb-4">EMOTION BREAKDOWN</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={
                    moodDistributionData.length
                      ? moodDistributionData.map(e => ({ category: e.name, score: e.value }))
                      : [{ category: 'No data', score: 0 }]
                  }>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} />
                    <Radar name="Count" dataKey="score" stroke="#84cc16" fill="#a3e635" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance vs Mood */}
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-2xl font-black text-gray-900 mb-4">PERFORMANCE VS MOOD</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData.length ? performanceData : [{ session: 1, performance: 0, mood: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="session" label={{ value: 'Session', position: 'insideBottom', offset: -5 }} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="performance" stroke="#3b82f6" name="Performance" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="mood" stroke="#ef4444" name="Mood" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="text-4xl mb-3">💪</div>
                <h4 className="text-xl font-black mb-2">STRENGTH</h4>
                <p className="font-bold text-green-100">Your mood improves significantly on weekends. Keep up your weekend routines!</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="text-4xl mb-3">💡</div>
                <h4 className="text-xl font-black mb-2">INSIGHT</h4>
                <p className="font-bold text-yellow-100">Your performance peaks when your mood is above 4.0. Prioritize mood-boosting activities!</p>
              </div>
              <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="text-xl font-black mb-2">GOAL</h4>
                <p className="font-bold text-pink-100">Try to increase your social wellness score by 10% this month for better overall health!</p>
              </div>
            </div>

            {/* Recent Sessions (real) */}
            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h3 className="text-2xl font-black text-gray-900 mb-4">RECENT SESSIONS</h3>
              <div className="space-y-3">
                {userSessions.length === 0 && (
                  <p className="text-gray-500 font-bold text-center py-6">No sessions recorded yet.</p>
                )}
                {userSessions.slice(-5).reverse().map((s, idx) => {
                  const emo = s.dominant_emotion || 'Neutral';
                  const color = EMOTION_COLORS[emo] || '#94a3b8';
                  const date = s.timestamp
                    ? new Date(s.timestamp * 1000).toLocaleString()
                    : 'Unknown time';
                  const bgClass = emo === 'Happy' ? 'bg-lime-50' : emo === 'Sad' ? 'bg-blue-50' : 'bg-gray-50';
                  return (
                    <div key={idx} className={`flex items-center justify-between p-4 ${bgClass} rounded-2xl`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: color + '33' }}>
                          {emo === 'Happy' ? '😊' : emo === 'Sad' ? '😢' : emo === 'Angry' ? '😠' : emo === 'Fear' ? '😨' : emo === 'Surprise' ? '😲' : emo === 'Disgust' ? '🤢' : '😐'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Mood Session</p>
                          <p className="text-sm text-gray-600">{date} • {s.duration}s • {s.total_frames} frames</p>
                        </div>
                      </div>
                      <span className="px-4 py-2 text-white font-bold rounded-full" style={{ backgroundColor: color }}>
                        {emo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;