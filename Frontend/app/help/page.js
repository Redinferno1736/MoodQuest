"use client";

import React, { useState } from 'react';
import {
  Home, TrendingUp, Heart, Settings, HelpCircle,
  User, Bell, LogOut, ChevronDown, ChevronUp,
  Camera, BarChart2, PawPrint, ClipboardList,
  Lightbulb, MessageCircle, Mail, BookOpen, Search
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react'; 
import { Loader2 } from 'lucide-react';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard',  label: 'HOME',        Icon: Home       },
  { href: '/analysis',   label: 'ANALYSIS',    Icon: TrendingUp },
  { href: '/pet',        label: 'PET SUPPORT', Icon: Heart      },
  { href: '/settings',   label: 'SETTINGS',    Icon: Settings   },
];
const BOTTOM_NAV = [
  { href: '/help',    label: 'HELP',    Icon: HelpCircle },
  { href: '/profile', label: 'PROFILE', Icon: User       },
];

function SidebarLink({ href, label, Icon, active }) {
  return (
    <Link href={href} className={`w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 transition-colors ${
      active ? 'bg-lime-600 text-white' : 'bg-lime-200 text-gray-900 hover:bg-lime-300'
    }`}>
      <Icon size={24} />{label}
    </Link>
  );
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    category: 'Mood Monitor',
    icon: Camera,
    color: 'lime',
    items: [
      {
        q: 'How does the mood monitor work?',
        a: 'The mood monitor uses your device camera and an AI model to detect facial expressions in real time. It analyses each frame and identifies emotions like Happy, Sad, Angry, Fear, Disgust, Surprise, and Neutral. At the end of a session, results are saved to your profile.',
      },
      {
        q: 'Why is my face not being detected?',
        a: 'Make sure you are in a well-lit environment, facing the camera directly, and that no other apps are using the camera. Try moving closer to the camera and ensure your full face is visible in the frame.',
      },
      {
        q: 'How long should a monitoring session be?',
        a: 'We recommend sessions of at least 30 seconds for meaningful data. Longer sessions (2–5 minutes) give more accurate dominant emotion readings and richer session history on your dashboard.',
      },
    ],
  },
  {
    category: 'Analysis & Dashboard',
    icon: BarChart2,
    color: 'emerald',
    items: [
      {
        q: 'Why is my dashboard empty?',
        a: 'Your dashboard populates once you complete at least one mood monitoring session. Head to Monitor Your Mood and finish a session — your data will appear immediately afterwards.',
      },
      {
        q: 'What do the monthly stats mean?',
        a: 'Happy Days counts sessions where your dominant emotion was Happy. Sad Days counts Sad sessions. Stressed Days counts sessions dominated by Angry, Fear, or Disgust. These are based on the current calendar month.',
      },
      {
        q: 'Why did my past session data disappear after logging out?',
        a: 'Sessions are always saved to your account in the cloud. If data looks missing, make sure you are logged in with the same account you used during those sessions. Google sign-in users should always use Google — do not create a separate email/password account.',
      },
    ],
  },
  {
    category: 'Pet Support',
    icon: PawPrint,
    color: 'teal',
    items: [
      {
        q: 'What is the Pet Support feature?',
        a: 'Pet Support is a virtual companion that responds to your emotional state. Based on your recent mood sessions, your pet reacts, offers encouragement, and provides light-hearted interactions to help lift your mood.',
      },
      {
        q: 'Does my pet save its state between visits?',
        a: 'Yes — your pet\'s state is linked to your account. Its mood, level, and interaction history persist across logins so you can build a continuous relationship with it.',
      },
    ],
  },
  {
    category: 'Quick Quiz',
    icon: ClipboardList,
    color: 'lime',
    items: [
      {
        q: 'What is the Quick Quiz?',
        a: 'The Quick Quiz is a short self-assessment questionnaire based on validated mental wellness scales. It gives you an instant score and interpretation so you can reflect on your current mental state alongside the camera-based monitoring.',
      },
      {
        q: 'Are my quiz results saved?',
        a: 'Quiz results are currently shown immediately after completion. Future updates will include saving quiz history alongside your camera session data for a fuller picture of your wellbeing.',
      },
    ],
  },
  {
    category: 'Tips',
    icon: Lightbulb,
    color: 'emerald',
    items: [
      {
        q: 'Where do the daily tips come from?',
        a: 'Tips are curated evidence-based suggestions covering breathing exercises, mindfulness, positive reframing, and healthy habits. A new tip is surfaced each day to keep the content fresh and relevant.',
      },
    ],
  },
  {
    category: 'Account & Settings',
    icon: Settings,
    color: 'teal',
    items: [
      {
        q: 'Can I change my email or password?',
        a: 'If you signed up with email and password, you can change your password in Settings → Account Settings. Email changes are not yet supported. Google account users manage their credentials directly through Google.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Settings → Danger Zone and click DELETE. You will need to type DELETE to confirm. This permanently removes your account and all mood session data and cannot be undone.',
      },
      {
        q: 'Where are my preferences stored?',
        a: 'Notification toggles, dark mode, sound effects, and language preferences are saved locally on your device, keyed to your account. They reload automatically each time you log in on the same device.',
      },
    ],
  },
];

const COLOR_MAP = {
  lime:    { bg: 'bg-lime-100',    icon: 'text-lime-600',    border: 'border-lime-200',    badge: 'bg-lime-500'    },
  emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-500' },
  teal:    { bg: 'bg-teal-100',    icon: 'text-teal-600',    border: 'border-teal-200',    badge: 'bg-teal-500'    },
};

// ─── FAQ accordion item ───────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-all ${open ? 'border-lime-400' : 'border-gray-100'}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-lime-50 transition-colors"
      >
        <span className="font-bold text-gray-900 pr-4">{q}</span>
        {open ? <ChevronUp size={20} className="text-lime-600 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 bg-lime-50 text-gray-700 leading-relaxed font-medium">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Quick link card ──────────────────────────────────────────────────────────
function QuickCard({ href, Icon, label, desc, color }) {
  const c = COLOR_MAP[color] || COLOR_MAP.lime;
  return (
    <Link href={href} className={`block p-6 rounded-3xl border-2 ${c.border} ${c.bg} hover:scale-105 transition-transform shadow-sm`}>
      <Icon size={28} className={`${c.icon} mb-3`} />
      <p className="font-black text-gray-900 text-lg">{label}</p>
      <p className="text-sm text-gray-600 font-medium mt-1">{desc}</p>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HelpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lime-50">
        <Loader2 className="w-12 h-12 animate-spin text-lime-600" />
      </div>
    );
  }
  if (status === 'unauthenticated') return null;

  const userName = session?.user?.name || 'User';

  // Filter FAQs by search
  const query = search.toLowerCase().trim();
  const filteredFaqs = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item => !query || item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
    ),
  })).filter(cat => cat.items.length > 0);

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
            <SidebarLink key={href} href={href} label={label} Icon={Icon} active={false} />
          ))}
        </nav>
        <div className="border-t-2 border-lime-400">
          {BOTTOM_NAV.map(({ href, label, Icon }) => (
            <SidebarLink key={href} href={href} label={label} Icon={Icon} active={href === '/help'} />
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        {/* Header */}
        <div className="bg-white px-8 py-6 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-4xl font-black text-gray-900">HELP CENTER</h1>
            <p className="text-gray-600 font-bold mt-1">Hey {userName.split(' ')[0]}, what can we help you with?</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-lime-200 rounded-full hover:bg-lime-300 transition-colors">
              <Bell size={24} className="text-gray-900" />
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-8 py-3 bg-lime-500 text-white font-black text-xl rounded-full hover:bg-lime-600 transition-colors"
            >
              <LogOut size={20} /> LOG OUT
            </button>
          </div>
        </div>

        <div className="p-8 max-w-5xl mx-auto space-y-8">

          {/* ── Search ── */}
          <div className="relative">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for answers… e.g. 'face not detected', 'delete account'"
              className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-lime-300 bg-white font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-lime-500 shadow-sm text-lg"
            />
          </div>

          {/* ── Quick links ── */}
          {!query && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">QUICK LINKS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <QuickCard href="/monitor"  Icon={Camera}      label="Monitor Mood"   desc="Start a new emotion session"          color="lime"    />
                <QuickCard href="/analysis" Icon={BarChart2}   label="Analysis"       desc="View your mood history & trends"      color="emerald" />
                <QuickCard href="/pet"      Icon={PawPrint}    label="Pet Support"    desc="Visit your virtual companion"         color="teal"    />
                <QuickCard href="/quiz"     Icon={ClipboardList} label="Quick Quiz"   desc="Take a short wellbeing assessment"    color="lime"    />
                <QuickCard href="/tips"     Icon={Lightbulb}   label="Today's Tip"    desc="Browse daily mental wellness tips"    color="emerald" />
                <QuickCard href="/settings" Icon={Settings}    label="Settings"       desc="Manage your account & preferences"    color="teal"    />
              </div>
            </div>
          )}

          {/* ── FAQs ── */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              {query ? `Results for "${search}"` : 'FREQUENTLY ASKED QUESTIONS'}
            </h2>

            {filteredFaqs.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center shadow-sm border-2 border-gray-100">
                <HelpCircle size={48} className="text-lime-400 mx-auto mb-4" />
                <p className="text-xl font-black text-gray-800">No results found</p>
                <p className="text-gray-500 font-medium mt-2">Try a different search term or contact support below.</p>
              </div>
            )}

            <div className="space-y-8">
              {filteredFaqs.map(({ category, icon: Icon, color, items }) => {
                const c = COLOR_MAP[color] || COLOR_MAP.lime;
                return (
                  <div key={category} className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    <div className={`flex items-center gap-3 px-6 py-4 ${c.bg} border-b-2 ${c.border}`}>
                      <div className={`p-2 rounded-xl ${c.badge} bg-opacity-20`}>
                        <Icon size={22} className={c.icon} />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">{category}</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {items.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Contact card ── */}
          <div className="bg-gradient-to-r from-lime-500 to-emerald-500 rounded-3xl p-8 shadow-xl text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-3xl font-black mb-2">STILL NEED HELP?</h3>
                <p className="font-bold text-lime-100 text-lg">
                  Can&apos;t find what you&apos;re looking for? Our support team is here for you.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <a
                  href="mailto:support@moodmonitor.app"
                  className="flex items-center gap-2 px-7 py-3 bg-white text-lime-700 font-black text-lg rounded-full hover:bg-lime-50 transition-colors shadow-md"
                >
                  <Mail size={20} /> EMAIL US
                </a>
                <Link
                  href="/chat"
                  className="flex items-center gap-2 px-7 py-3 bg-lime-800 bg-opacity-30 border-2 border-white text-white font-black text-lg rounded-full hover:bg-opacity-50 transition-colors"
                >
                  <MessageCircle size={20} /> AI CHAT
                </Link>
              </div>
            </div>
          </div>

          {/* ── Getting started ── */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen size={28} className="text-lime-600" />
              <h3 className="text-2xl font-black text-gray-900">GETTING STARTED</h3>
            </div>
            <ol className="space-y-4">
              {[
                { step: '01', title: 'Complete your first session', desc: 'Go to Monitor Your Mood and let the camera run for at least 30 seconds. This generates your first data point.' },
                { step: '02', title: 'Check your dashboard', desc: 'After saving a session, return to the Dashboard to see your Mood Journey chart and monthly emotion stats update in real time.' },
                { step: '03', title: 'Take the Quick Quiz', desc: 'Complement the camera data with a short self-assessment quiz to get a fuller picture of your wellbeing.' },
                { step: '04', title: 'Visit your Pet', desc: 'Your virtual pet reacts to your mood history. Check in regularly and build your streak.' },
                { step: '05', title: 'Review Analysis trends', desc: 'After a few sessions, the Analysis page shows weekly trends and emotion breakdowns to help you spot patterns.' },
              ].map(({ step, title, desc }) => (
                <li key={step} className="flex gap-5 items-start">
                  <span className="flex-shrink-0 w-10 h-10 bg-lime-500 text-white font-black text-lg rounded-full flex items-center justify-center">
                    {step}
                  </span>
                  <div>
                    <p className="font-black text-gray-900">{title}</p>
                    <p className="text-gray-600 font-medium text-sm mt-1">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
}
