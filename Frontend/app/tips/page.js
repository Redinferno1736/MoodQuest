'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell, Home, TrendingUp, Heart, Settings,
  HelpCircle, User, Lightbulb, RefreshCw, Share2,
  BookOpen, Clock, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CACHE_KEY   = 'moodquest_daily_tip';
const MS_IN_DAY   = 24 * 60 * 60 * 1000;

const CATEGORIES = [
  { label: 'Mindfulness',   emoji: '🧘', color: 'from-purple-400 to-purple-500' },
  { label: 'Movement',      emoji: '🏃', color: 'from-orange-400 to-orange-500' },
  { label: 'Social',        emoji: '🤝', color: 'from-blue-400 to-blue-500'    },
  { label: 'Sleep',         emoji: '😴', color: 'from-indigo-400 to-indigo-500' },
  { label: 'Nutrition',     emoji: '🥗', color: 'from-green-400 to-emerald-500' },
  { label: 'Creativity',    emoji: '🎨', color: 'from-pink-400 to-rose-500'    },
  { label: 'Gratitude',     emoji: '🙏', color: 'from-yellow-400 to-amber-500' },
];

// Pick a deterministic category based on day-of-year so it's consistent per day
function getTodayCategory() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day   = Math.floor((now - start) / MS_IN_DAY);
  return CATEGORIES[day % CATEGORIES.length];
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ─── Anthropic API call ───────────────────────────────────────────────────────
async function fetchTipFromLLM(category, userName) {
  const prompt = `You are a warm, evidence-based mental wellness coach for an app called MoodQuest.

Generate a practical, unique daily mental wellness tip focused on: ${category.label}

The tip is for a user named ${userName}. 

Respond ONLY with a valid JSON object (no markdown, no backticks, no extra text) in this exact shape:
{
  "headline": "A short punchy tip title (max 8 words, ALL CAPS)",
  "body": "2-3 sentences of warm, actionable advice. Be specific and practical, not generic.",
  "action": "One concrete micro-action they can do RIGHT NOW in under 5 minutes.",
  "science": "One sentence explaining the psychological or physiological reason this works.",
  "affirmation": "A short, powerful affirmation related to the tip (max 10 words)."
}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error('LLM request failed');
  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard', label: 'HOME',        Icon: Home       },
  { href: '/analysis',  label: 'ANALYSIS',    Icon: TrendingUp },
  { href: '/pet',       label: 'PET SUPPORT', Icon: Heart      },
  { href: '/settings',  label: 'SETTINGS',    Icon: Settings   },
];
const BOTTOM_NAV = [
  { href: '/help',    label: 'HELP',    Icon: HelpCircle },
  { href: '/profile', label: 'PROFILE', Icon: User       },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TipPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tip,      setTip]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [copied,   setCopied]   = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const category = getTodayCategory();
  const todayKey = getTodayKey();

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  // ── Countdown to next tip ────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now      = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      const h    = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m    = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s    = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Load or generate tip ─────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'authenticated') return;

    const loadTip = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check localStorage cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { key, data } = JSON.parse(cached);
          if (key === todayKey) {
            setTip(data);
            setLoading(false);
            return;
          }
        }
        // Generate fresh tip
        const userName = session?.user?.name?.split(' ')[0] || 'friend';
        const data     = await fetchTipFromLLM(category, userName);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ key: todayKey, data }));
        setTip(data);
      } catch (e) {
        console.error(e);
        setError('Could not load today\'s tip. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTip();
  }, [status, session?.user?.name, todayKey, category]);

  const handleRefresh = async () => {
    localStorage.removeItem(CACHE_KEY);
    setTip(null);
    setLoading(true);
    setError(null);
    try {
      const userName = session?.user?.name?.split(' ')[0] || 'friend';
      const data     = await fetchTipFromLLM(category, userName);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ key: todayKey, data }));
      setTip(data);
    } catch (e) {
      setError('Could not refresh tip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!tip) return;
    const text = `💡 Today's MoodQuest tip:\n\n${tip.headline}\n\n${tip.body}\n\nTry this now: ${tip.action}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Loading / unauthenticated ──────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-lime-600" />
      </div>
    );
  }
  if (status === 'unauthenticated') return null;

  const userName = session?.user?.name || 'USER';

  return (
    <div className="flex h-screen bg-gray-800">
      {/* ── Sidebar ── */}
      <div className="w-64 bg-lime-200 flex flex-col flex-shrink-0">
        <div className="bg-gray-900 text-white p-6 text-center">
          <h1 className="text-2xl font-black tracking-wide">DASHBOARD</h1>
          <p className="text-sm font-bold text-lime-400 mt-2 truncate">{userName}</p>
        </div>
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <Link key={href} href={href}
              className="w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300 transition-colors">
              <Icon size={24} />{label}
            </Link>
          ))}
        </nav>
        <div className="border-t-2 border-lime-400">
          {BOTTOM_NAV.map(({ href, label, Icon }) => (
            <Link key={href} href={href}
              className="w-full px-6 py-4 text-left font-black text-lg flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300">
              <Icon size={20} />{label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        {/* Header */}
        <div className="bg-white px-8 py-6 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-4xl font-black text-gray-900">TODAY&apos;S TIP</h1>
            <p className="text-gray-600 font-bold mt-1">Your daily mental wellness insight</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-lime-200 rounded-full hover:bg-lime-300 transition-colors">
              <Bell size={24} className="text-gray-900" />
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-8 py-3 bg-lime-500 text-white font-black text-xl rounded-full hover:bg-lime-600 transition-colors"
            >
              LOG OUT
            </button>
          </div>
        </div>

        <div className="p-8 max-w-5xl mx-auto space-y-6">

          {/* ── Category banner ── */}
          <div className={`bg-gradient-to-br ${category.color} rounded-3xl p-6 text-white flex items-center justify-between shadow-lg`}>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{category.emoji}</span>
              <div>
                <p className="text-sm font-bold opacity-80 tracking-widest uppercase">Today&apos;s Focus</p>
                <h2 className="text-4xl font-black">{category.label}</h2>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Clock size={16} className="opacity-80" />
                <p className="text-sm font-bold opacity-80">Next tip in</p>
              </div>
              <p className="text-3xl font-black tracking-widest">{timeLeft}</p>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <p className="font-bold text-red-700">{error}</p>
              <button onClick={handleRefresh} className="mt-3 px-6 py-2 bg-red-500 text-white font-black rounded-full hover:bg-red-600 transition-colors">
                TRY AGAIN
              </button>
            </div>
          )}

          {/* ── Loading skeleton ── */}
          {loading && !error && (
            <div className="bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Sparkles size={48} className="text-lime-400 animate-pulse" />
              </div>
              <p className="text-2xl font-black text-gray-900">Generating your tip…</p>
              <p className="text-gray-500 font-bold">Our AI is crafting something just for you</p>
              <Loader2 className="w-8 h-8 animate-spin text-lime-500 mt-2" />
            </div>
          )}

          {/* ── Tip card ── */}
          {tip && !loading && (
            <>
              {/* Main headline */}
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="bg-lime-500 px-8 py-5 flex items-center gap-3">
                  <Lightbulb size={28} className="text-white" />
                  <h3 className="text-2xl font-black text-white">{tip.headline}</h3>
                </div>
                <div className="p-8">
                  <p className="text-gray-700 font-bold text-lg leading-relaxed">{tip.body}</p>
                </div>
              </div>

              {/* Action + Science row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl">⚡</span>
                    </div>
                    <h4 className="text-xl font-black text-gray-900">DO THIS NOW</h4>
                  </div>
                  <p className="text-gray-700 font-bold leading-relaxed">{tip.action}</p>
                </div>

                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <BookOpen size={20} className="text-white" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900">WHY IT WORKS</h4>
                  </div>
                  <p className="text-gray-700 font-bold leading-relaxed">{tip.science}</p>
                </div>
              </div>

              {/* Affirmation */}
              <div className="bg-gradient-to-br from-lime-400 to-emerald-500 rounded-3xl shadow-lg p-8 text-center text-white">
                <p className="text-sm font-bold opacity-80 tracking-widest uppercase mb-3">Your Affirmation For Today</p>
                <p className="text-3xl font-black leading-snug">&ldquo;{tip.affirmation}&rdquo;</p>
              </div>

              {/* Actions row */}
              <div className="flex gap-4">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-lime-500 text-lime-700 font-black text-lg rounded-full hover:bg-lime-50 transition-colors shadow-sm"
                >
                  <Share2 size={22} />
                  {copied ? 'COPIED!' : 'COPY TIP'}
                </button>
                <button
                  onClick={handleRefresh}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 font-black text-lg rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <RefreshCw size={22} />
                  NEW TIP
                </button>
                <Link
                  href="/monitor"
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-lime-500 text-white font-black text-lg rounded-full hover:bg-lime-600 transition-colors shadow-sm"
                >
                  <span>😊</span>
                  CHECK MOOD
                </Link>
              </div>
            </>
          )}

          {/* ── Past categories this week ── */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-2xl font-black text-gray-900 mb-4">THIS WEEK&apos;S TOPICS</h3>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((cat, i) => {
                const d     = new Date();
                const start = new Date(d.getFullYear(), 0, 0);
                const day   = Math.floor((d - start) / MS_IN_DAY);
                const isToday = (day % CATEGORIES.length) === i;
                return (
                  <div
                    key={cat.label}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full font-black text-lg transition-all ${
                      isToday
                        ? 'bg-lime-500 text-white shadow-md scale-105'
                        : 'bg-lime-100 text-gray-700'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    {isToday && <span className="text-xs bg-white text-lime-600 px-2 py-0.5 rounded-full ml-1">TODAY</span>}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}