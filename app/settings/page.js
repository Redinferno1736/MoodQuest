"use client"

import React, { useState } from 'react';
import { Bell, Home, TrendingUp, Heart, Settings, HelpCircle, User, Lock, Mail, Globe, Sun, Shield, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('settings');
  const params = useParams();
  
  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [language, setLanguage] = useState('english');

  return (
    <div className="flex h-screen bg-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-lime-200 flex flex-col">
        <div className="bg-gray-900 text-white p-6 text-center">
          <h1 className="text-2xl font-black tracking-wide">DASHBOARD</h1>
          <p className="text-sm font-bold text-lime-400 mt-2">{params.username}</p>
        </div>

        <nav className="flex-1 py-4">
          <Link
            href={`/${params.username}/dashboard`}
            onClick={() => setActiveTab('home')}
            className={`w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 transition-colors ${
              activeTab === 'home' ? 'bg-lime-600 text-white' : 'bg-lime-200 text-gray-900 hover:bg-lime-300'
            }`}
          >
            <Home size={24} />
            HOME
          </Link>
          <Link
            href={`analysis`}
            onClick={() => setActiveTab('analysis')}
            className={`w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 transition-colors ${
              activeTab === 'analysis' ? 'bg-lime-600 text-white' : 'bg-lime-200 text-gray-900 hover:bg-lime-300'
            }`}
          >
            <TrendingUp size={24} />
            ANALYSIS
          </Link>
          <Link
            href={`/pet`}
            onClick={() => setActiveTab('pet')}
            className={`w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 transition-colors ${
              activeTab === 'pet' ? 'bg-lime-600 text-white' : 'bg-lime-200 text-gray-900 hover:bg-lime-300'
            }`}
          >
            <Heart size={24} />
            PET SUPPORT
          </Link>
          <Link
            href={`/settings`}
            onClick={() => setActiveTab('settings')}
            className={`w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 transition-colors ${
              activeTab === 'settings' ? 'bg-lime-600 text-white' : 'bg-lime-200 text-gray-900 hover:bg-lime-300'
            }`}
          >
            <Settings size={24} />
            SETTINGS
          </Link>
        </nav>

        <div className="border-t-2 border-lime-400">
          <Link
            href={`/help`}
            className="w-full px-6 py-4 text-left font-black text-lg flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300"
          >
            <HelpCircle size={20} />
            HELP
          </Link>
          <Link
            href={`/profile`}
            className="w-full px-6 py-4 text-left font-black text-lg flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300"
          >
            <User size={20} />
            PROFILE
          </Link>
        </div>
      </div>

      {/* Main Content */}
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
            <button className="px-8 py-3 bg-lime-500 text-white font-black text-xl rounded-full hover:bg-lime-600 transition-colors">
              LOG OUT
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Account Settings */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <User size={32} />
                ACCOUNT SETTINGS
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Mail className="text-lime-600" />
                    <div>
                      <p className="font-bold text-gray-900">Email Address</p>
                      <p className="text-sm text-gray-600">john.doe@example.com</p>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-lime-500 text-white font-bold rounded-full hover:bg-lime-600 transition-colors">
                    CHANGE
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Lock className="text-lime-600" />
                    <div>
                      <p className="font-bold text-gray-900">Password</p>
                      <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-lime-500 text-white font-bold rounded-full hover:bg-lime-600 transition-colors">
                    CHANGE
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Bell size={32} />
                NOTIFICATIONS
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive mood check reminders</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={() => setNotifications(!notifications)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-lime-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Weekly mood summary reports</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-lime-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Sun size={32} />
                APPEARANCE
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-900">Dark Mode</p>
                    <p className="text-sm text-gray-600">Switch to dark theme</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={() => setDarkMode(!darkMode)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-lime-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-900">Sound Effects</p>
                    <p className="text-sm text-gray-600">Play sounds on interactions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={() => setSoundEffects(!soundEffects)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-lime-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Globe className="text-lime-600" />
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

            {/* Privacy & Security */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Shield size={32} />
                PRIVACY & SECURITY
              </h2>
              <div className="space-y-4">
                <button className="w-full p-4 bg-lime-50 rounded-2xl text-left hover:bg-lime-100 transition-colors">
                  <p className="font-bold text-gray-900">Data & Privacy Settings</p>
                  <p className="text-sm text-gray-600">Manage your data and privacy preferences</p>
                </button>
                <button className="w-full p-4 bg-lime-50 rounded-2xl text-left hover:bg-lime-100 transition-colors">
                  <p className="font-bold text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-red-200">
              <h2 className="text-3xl font-black text-red-600 mb-6 flex items-center gap-3">
                <Trash2 size={32} />
                DANGER ZONE
              </h2>
              <div className="space-y-4">
                <button className="w-full p-4 bg-red-50 rounded-2xl text-left hover:bg-red-100 transition-colors">
                  <p className="font-bold text-red-600">Delete Account</p>
                  <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}