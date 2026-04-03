"use client"
import { api } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { Bell, Home, TrendingUp, Heart, Settings, HelpCircle, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Loader2, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userSessions, setUserSessions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({ happy: 0, sad: 0, stressed: 0 });
  const [realTimeAnalytics, setRealTimeAnalytics] = useState(null);
  const [joke, setJoke] = useState('');
  const [fact, setFact] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [mounted, setMounted] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  // ─── Auth guard ───────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-lime-600" />
      </div>
    );
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  // ─── Load session list from backend ───────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadUserData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/session/list?user_id=${session.user.id}`
        );
        if (!res.ok) { console.error("Failed to fetch sessions:", res.status); return; }

        const sessions = await res.json();
        if (!Array.isArray(sessions)) { console.error("Invalid session data format"); return; }

        setUserSessions(sessions);
        calculateMonthlyStats(sessions);
      } catch (err) {
        console.error("Failed to load sessions", err);
        setUserSessions([]);
      }
    };

    loadUserData();
  }, [session]);

  // ─── Monthly stats from dominant_emotion ──────────────────────────────────
  const calculateMonthlyStats = (sessions) => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const stats = { happy: 0, sad: 0, stressed: 0 };

    sessions.forEach((s) => {
      if (!s.timestamp) return;
      const d = new Date(s.timestamp * 1000);
      if (d.getMonth() !== m || d.getFullYear() !== y) return;

      const e = (s.dominant_emotion || "").toLowerCase();
      if (e === "happy") stats.happy++;
      else if (e === "sad") stats.sad++;
      else if (["angry", "fear", "disgust"].includes(e)) stats.stressed++;
    });

    setMonthlyStats(stats);
  };

  // ─── Chart data from real sessions ────────────────────────────────────────
  // Uses emotion_distribution (object of { emotion: count }) stored per session.
  const getChartData = () => {
    if (!userSessions || userSessions.length === 0) {
      return [{ session: 1, performance: 0, mood: 0, feedback: 0 }];
    }

    const recent = userSessions.slice(-10);

    return recent.map((s, i) => {
      const dist = s.emotion_distribution || {};
      const totalFrames = s.total_frames || 1;

      // Positivity = (Happy + Surprise) / total frames * 100
      const positiveCount = (dist["Happy"] || 0) + (dist["Surprise"] || 0);
      const performance = Math.round((positiveCount / totalFrames) * 100);

      // Mood rating: avg_confidence scaled to 0-5
      const mood = Math.round((s.avg_confidence || 0) * 5 * 10) / 10;

      // Overall well-being: avg_confidence * 100
      const feedback = Math.round((s.avg_confidence || 0) * 100);

      return { session: i + 1, performance, mood, feedback };
    });
  };

  // ─── Poll analytics every 30 s (was 5 s — too aggressive) ────────────────
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/analytics?user_id=${session.user.id}`
        );
        const data = await res.json();
        setRealTimeAnalytics(data);
      } catch (err) {
        console.error("Analytics error", err);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [session]);

  // ─── Joke + Fact ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [jokeData, factData] = await Promise.all([api.getJoke(), api.getFact()]);
        setJoke(jokeData.joke);
        setFact(factData.fact);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };
    fetchContent();
  }, []);

  // ─── Mount animations ─────────────────────────────────────────────────────
  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), 0);
    const statsTimer = setTimeout(() => setStatsVisible(true), 300);
    return () => { clearTimeout(mountTimer); clearTimeout(statsTimer); };
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 to-emerald-200">
        <Loader2 className="w-12 h-12 animate-spin text-lime-600" />
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 via-emerald-100 to-teal-100 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-lime-400 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-emerald-400 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-80 bg-white shadow-2xl z-10 flex flex-col">
        <div className="p-8 bg-gradient-to-r from-lime-500 to-emerald-500">
          <h1 className="text-3xl font-black text-white mb-2">DASHBOARD</h1>
          <p className="text-lime-100 font-semibold text-lg">
            {session?.user?.name}
          </p>
        </div>

        <div className="flex-1 flex flex-col py-4">

          <Link href="/dashboard">
            <button
              className="w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 bg-lime-600 text-white"
            >
              <Home size={24} />HOME
            </button>
          </Link>

          <Link href="/analysis">
            <button
              className="w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 bg-lime-600 text-gray-900 hover:bg-lime-300"
            >
              <TrendingUp size={24} />ANALYSIS
            </button>
          </Link>
          <Link href="/pet">
            <button

              className="w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 bg-lime-600 text-white">
              <Heart size={24} />PET SUPPORT
            </button>
          </Link>
          <Link href="/settings">
            <button

              className="w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 bg-lime-600 text-white">
              <Settings size={24} />SETTINGS
            </button>
          </Link>
        </div>

        <div className="border-t border-gray-200 py-4">
          <button className="w-full px-6 py-3 text-left font-bold text-lg flex items-center gap-3 text-gray-700 hover:bg-gray-100">
            <HelpCircle size={20} />HELP
          </button>
          <button className="w-full px-6 py-3 text-left font-bold text-lg flex items-center gap-3 text-gray-700 hover:bg-gray-100">
            <User size={20} />PROFILE
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-80 p-12 relative z-0">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-gray-800 mb-2">WELCOME BACK!</h2>
            <p className="text-2xl font-bold text-lime-600">
              {session?.user?.name?.toUpperCase() || 'USER'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
              <Bell size={24} className="text-lime-600" />
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white font-black text-xl rounded-full hover:from-lime-600 hover:to-lime-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <LogOut size={20} />LOG OUT
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Column - Action Buttons */}
          <div className="space-y-6">
            <Link href="/monitor">
              <button
                className="w-full p-8 bg-lime-400 hover:bg-lime-500 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0ms' }}
              >
                <h3 className="text-3xl font-black text-gray-800">MONITOR YOUR MOOD</h3>
              </button>
            </Link>
            <Link href="/quiz">
              <button
                className="w-full p-8 bg-lime-300 hover:bg-lime-400 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 100ms' }}
              >
                <h3 className="text-3xl font-black text-gray-800">QUICK QUIZ</h3>
              </button>
            </Link>
            <Link href="/tips">
              <button
                className="w-full p-8 bg-lime-200 hover:bg-lime-300 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 200ms' }}
              >
                <h3 className="text-3xl font-black text-gray-800">TODAY'S TIP</h3>
              </button>
            </Link>
          </div>

          {/* Right Column - Chart */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h3 className="text-2xl font-black text-gray-800 mb-6">
              Your Mood Journey: Last {Math.min(userSessions.length, 10) || 0} Sessions
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="session" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="performance" stroke="#84cc16" strokeWidth={3} name="Positivity Score" />
                <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3} name="Mood Rating" />
                <Line type="monotone" dataKey="feedback" stroke="#14b8a6" strokeWidth={3} name="Overall Well-being" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section - Monthly Stats */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h3 className="text-2xl font-black text-gray-800 mb-6">THIS MONTH</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl p-6 text-white">
              <p className="text-lg font-bold mb-2">HAPPY DAYS</p>
              <p className="text-5xl font-black">{monthlyStats.happy}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 text-white">
              <p className="text-lg font-bold mb-2">SAD DAYS</p>
              <p className="text-5xl font-black">{monthlyStats.sad}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white">
              <p className="text-lg font-bold mb-2">STRESSED DAYS</p>
              <p className="text-5xl font-black">{monthlyStats.stressed}</p>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {userSessions.length === 0 && (
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <p className="text-lg font-bold text-blue-800">
              👋 Start tracking your mood to see your personalized data here!
            </p>
            <p className="text-blue-600 mt-2">
              Use the "Monitor Your Mood" feature to begin collecting your emotional journey data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;