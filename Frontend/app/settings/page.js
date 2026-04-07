"use client";

import React, { useState, useEffect } from 'react';
import {
  Bell, Home, TrendingUp, Heart, Settings,
  HelpCircle, User, Lock, Mail, Globe, Sun,
  Shield, Trash2, LogOut, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// ─── Sidebar link helper ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard',  label: 'HOME',        icon: Home       },
  { href: '/analysis',   label: 'ANALYSIS',    icon: TrendingUp },
  { href: '/pet',        label: 'PET SUPPORT', icon: Heart      },
  { href: '/settings',   label: 'SETTINGS',    icon: Settings   },
];

const BOTTOM_NAV = [
  { href: '/help',    label: 'HELP',    icon: HelpCircle },
  { href: '/profile', label: 'PROFILE', icon: User       },
];

function SidebarLink({ href, label, Icon, active }) {
  return (
    <Link
      href={href}
      className={`w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 transition-colors ${
        active
          ? 'bg-lime-600 text-white'
          : 'bg-lime-200 text-gray-900 hover:bg-lime-300'
      }`}
    >
      <Icon size={24} />
      {label}
    </Link>
  );
}

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-lime-500" />
    </label>
  );
}

// ─── Toast component ──────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-white transition-all ${
      type === 'success' ? 'bg-lime-500' : 'bg-red-500'
    }`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      {message}
    </div>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ onClose, onSave }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (next.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (next !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSave();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h3 className="text-2xl font-black text-gray-900 mb-6">CHANGE PASSWORD</h3>
        <div className="space-y-4">
          {[
            { label: 'Current Password', value: current, set: setCurrent },
            { label: 'New Password',     value: next,    set: setNext    },
            { label: 'Confirm Password', value: confirm, set: setConfirm },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
              <input
                type="password"
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full px-4 py-3 border-2 border-lime-300 rounded-xl font-bold focus:outline-none focus:border-lime-500"
              />
            </div>
          ))}
          {error && <p className="text-red-500 font-bold text-sm">{error}</p>}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-300 rounded-full font-black text-gray-700 hover:bg-gray-50">
            CANCEL
          </button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-lime-500 text-white rounded-full font-black hover:bg-lime-600 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Account Modal ─────────────────────────────────────────────────────
function DeleteAccountModal({ onClose, userId }) {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm !== 'DELETE') return;
    setLoading(true);
    try {
      await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await signOut({ callbackUrl: '/' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-2 border-red-200">
        <h3 className="text-2xl font-black text-red-600 mb-2">DELETE ACCOUNT</h3>
        <p className="text-gray-600 font-bold mb-6">
          This permanently deletes your account and ALL mood session data. Type <span className="text-red-500">DELETE</span> to confirm.
        </p>
        <input
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Type DELETE"
          className="w-full px-4 py-3 border-2 border-red-300 rounded-xl font-bold focus:outline-none focus:border-red-500 mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-300 rounded-full font-black text-gray-700 hover:bg-gray-50">
            CANCEL
          </button>
          <button
            onClick={handleDelete}
            disabled={confirm !== 'DELETE' || loading}
            className="flex-1 py-3 bg-red-500 text-white rounded-full font-black hover:bg-red-600 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Prefs state
  const [notifications,      setNotifications]      = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode,           setDarkMode]           = useState(false);
  const [soundEffects,       setSoundEffects]       = useState(true);
  const [language,           setLanguage]           = useState('english');
  const [saving,             setSaving]             = useState(false);

  // Modal / toast state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal,   setShowDeleteModal]   = useState(false);
  const [toast,             setToast]             = useState(null); // { message, type }

  // ── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  // ── Load persisted prefs ─────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;
    const saved = localStorage.getItem(`prefs_${session.user.id}`);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.notifications      !== undefined) setNotifications(p.notifications);
        if (p.emailNotifications !== undefined) setEmailNotifications(p.emailNotifications);
        if (p.darkMode           !== undefined) setDarkMode(p.darkMode);
        if (p.soundEffects       !== undefined) setSoundEffects(p.soundEffects);
        if (p.language           !== undefined) setLanguage(p.language);
      } catch (_) {}
    }
  }, [session?.user?.id]);

  const savePrefs = () => {
    if (!session?.user?.id) return;
    setSaving(true);
    const prefs = { notifications, emailNotifications, darkMode, soundEffects, language };
    localStorage.setItem(`prefs_${session.user.id}`, JSON.stringify(prefs));
    setTimeout(() => {
      setSaving(false);
      setToast({ message: 'Preferences saved!', type: 'success' });
    }, 400);
  };

  // ── Loading / unauthenticated ─────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lime-50">
        <Loader2 className="w-12 h-12 animate-spin text-lime-600" />
      </div>
    );
  }
  if (status === 'unauthenticated') return null;

  const userName  = session.user.name  || 'User';
  const userEmail = session.user.email || '—';
  const userId    = session.user.id;
  const isGoogle  = !session.user.email?.includes('@') ? false : !!session.user.image; // heuristic

  return (
    <div className="flex h-screen bg-gray-800">
      {/* ── Sidebar ── */}
      <div className="w-64 bg-lime-200 flex flex-col flex-shrink-0">
        <div className="bg-gray-900 text-white p-6 text-center">
          <h1 className="text-2xl font-black tracking-wide">DASHBOARD</h1>
          <p className="text-sm font-bold text-lime-400 mt-2 truncate">{userName}</p>
        </div>

        <nav className="flex-1 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <SidebarLink
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={href === '/settings'}
            />
          ))}
        </nav>

        <div className="border-t-2 border-lime-400">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => (
            <SidebarLink key={href} href={href} label={label} Icon={Icon} active={false} />
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        {/* Header */}
        <div className="bg-white px-8 py-6 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-4xl font-black text-gray-900">SETTINGS</h1>
            <p className="text-gray-600 font-bold mt-1">Manage your preferences and account</p>
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

        {/* Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* ── Account ── */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <User size={32} /> ACCOUNT SETTINGS
              </h2>
              <div className="space-y-4">
                {/* Email — always shown, never editable for OAuth users */}
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Mail className="text-lime-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900">Email Address</p>
                      <p className="text-sm text-gray-600">{userEmail}</p>
                    </div>
                  </div>
                  {isGoogle ? (
                    <span className="px-4 py-1 bg-gray-100 text-gray-500 text-sm font-bold rounded-full">
                      Google Account
                    </span>
                  ) : (
                    <button className="px-6 py-2 bg-lime-500 text-white font-bold rounded-full hover:bg-lime-600 transition-colors">
                      CHANGE
                    </button>
                  )}
                </div>

                {/* Password — only for credentials users */}
                {!isGoogle && (
                  <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Lock className="text-lime-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900">Password</p>
                        <p className="text-sm text-gray-600">Change your login password</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-6 py-2 bg-lime-500 text-white font-bold rounded-full hover:bg-lime-600 transition-colors"
                    >
                      CHANGE
                    </button>
                  </div>
                )}

                {/* Display name */}
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <User className="text-lime-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900">Display Name</p>
                      <p className="text-sm text-gray-600">{userName}</p>
                    </div>
                  </div>
                  <span className="px-4 py-1 bg-gray-100 text-gray-500 text-sm font-bold rounded-full">
                    From provider
                  </span>
                </div>
              </div>
            </div>

            {/* ── Notifications ── */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Bell size={32} /> NOTIFICATIONS
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive mood check reminders</p>
                  </div>
                  <Toggle checked={notifications} onChange={() => setNotifications(v => !v)} />
                </div>
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Weekly mood summary reports</p>
                  </div>
                  <Toggle checked={emailNotifications} onChange={() => setEmailNotifications(v => !v)} />
                </div>
              </div>
            </div>

            {/* ── Appearance ── */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Sun size={32} /> APPEARANCE
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-900">Dark Mode</p>
                    <p className="text-sm text-gray-600">Switch to dark theme</p>
                  </div>
                  <Toggle checked={darkMode} onChange={() => setDarkMode(v => !v)} />
                </div>
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-900">Sound Effects</p>
                    <p className="text-sm text-gray-600">Play sounds on interactions</p>
                  </div>
                  <Toggle checked={soundEffects} onChange={() => setSoundEffects(v => !v)} />
                </div>
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Globe className="text-lime-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900">Language</p>
                      <p className="text-sm text-gray-600">Choose your preferred language</p>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-2 bg-white border-2 border-lime-500 rounded-full font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Save button ── */}
            <div className="flex justify-end">
              <button
                onClick={savePrefs}
                disabled={saving}
                className="flex items-center gap-2 px-10 py-4 bg-lime-500 text-white font-black text-xl rounded-full hover:bg-lime-600 transition-colors disabled:opacity-60 shadow-lg"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                {saving ? 'SAVING…' : 'SAVE PREFERENCES'}
              </button>
            </div>

            {/* ── Privacy & Security ── */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Shield size={32} /> PRIVACY & SECURITY
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-lime-50 rounded-2xl">
                  <p className="font-bold text-gray-900">Session Data</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your mood sessions are stored securely and linked only to your account ID.
                    They are never shared with third parties.
                  </p>
                </div>
                {!isGoogle && (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full p-4 bg-lime-50 rounded-2xl text-left hover:bg-lime-100 transition-colors"
                  >
                    <p className="font-bold text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security (coming soon)</p>
                  </button>
                )}
              </div>
            </div>

            {/* ── Danger Zone ── */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-red-200">
              <h2 className="text-3xl font-black text-red-600 mb-6 flex items-center gap-3">
                <Trash2 size={32} /> DANGER ZONE
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-red-600">Delete Account</p>
                    <p className="text-sm text-gray-600">
                      Permanently deletes your account and all {userEmail !== '—' ? `(${userEmail}) ` : ''}session data.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-2 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-colors flex-shrink-0 ml-4"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSave={() => setToast({ message: 'Password changed!', type: 'success' })}
        />
      )}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          userId={userId}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}