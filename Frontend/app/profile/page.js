"use client"

import React, { useState } from 'react';
import { Bell, Home, TrendingUp, Heart, Settings, HelpCircle, User, Camera, Save, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProfilePage() {
    const params = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    bio: 'Mental health advocate and wellness enthusiast',
    joinDate: 'January 2024',
    location: 'New York, USA'
  });

  const handleProfileSave = () => {
    setIsEditing(false);
    // Add save logic here
  };

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
            href={`/Prateek/dashboard`}
            onClick={() => setActiveTab('home')}
            className={`w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 transition-colors ${
              activeTab === 'home' ? 'bg-lime-600 text-white' : 'bg-lime-200 text-gray-900 hover:bg-lime-300'
            }`}
          >
            <Home size={24} />
            HOME
          </Link>
          <Link
            href={`/analysis`}
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
            <h1 className="text-4xl font-black text-gray-900">PROFILE</h1>
            <p className="text-gray-600 font-bold mt-1">View and edit your profile information</p>
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
            {/* Profile Header */}
            <div className="bg-lime-300 p-8 rounded-3xl shadow-lg text-black">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black">MY PROFILE</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-3 bg-white text-lime-600 font-bold rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={20} />
                  {isEditing ? 'CANCEL' : 'EDIT PROFILE'}
                </button>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <User size={64} className="text-lime-500" />
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 p-3 bg-lime-600 rounded-full hover:bg-lime-700 transition-colors">
                      <Camera size={20} />
                    </button>
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-black mb-2">{profileData.name}</h1>
                  <p className="text-black text-lg">Member since {profileData.joinDate}</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-2xl font-black text-gray-900 mb-6">PERSONAL INFORMATION</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">FULL NAME</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-lime-50 border-2 border-lime-300 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-lime-500"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-lime-50 rounded-2xl font-bold text-gray-900">{profileData.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">LOCATION</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        className="w-full px-4 py-3 bg-lime-50 border-2 border-lime-300 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-lime-500"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-lime-50 rounded-2xl font-bold text-gray-900">{profileData.location}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">EMAIL ADDRESS</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-lime-50 border-2 border-lime-300 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-lime-50 rounded-2xl font-bold text-gray-900">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">PHONE NUMBER</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-lime-50 border-2 border-lime-300 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-lime-50 rounded-2xl font-bold text-gray-900">{profileData.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">BIO</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 bg-lime-50 border-2 border-lime-300 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-lime-50 rounded-2xl font-bold text-gray-900">{profileData.bio}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleProfileSave}
                      className="flex-1 px-6 py-4 bg-lime-500 text-white font-black text-lg rounded-full hover:bg-lime-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save size={24} />
                      SAVE CHANGES
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-4 bg-gray-200 text-gray-700 font-black text-lg rounded-full hover:bg-gray-300 transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-2xl font-black text-gray-900 mb-6">ACTIVITY OVERVIEW</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-lime-400 p-6 rounded-2xl text-center">
                  <p className="text-4xl font-black text-gray-900 mb-2">127</p>
                  <p className="font-bold text-gray-800">Total Check-ins</p>
                </div>
                <div className="bg-blue-400 p-6 rounded-2xl text-center">
                  <p className="text-4xl font-black text-gray-900 mb-2">45</p>
                  <p className="font-bold text-gray-800">Quizzes Completed</p>
                </div>
                <div className="bg-yellow-300 p-6 rounded-2xl text-center">
                  <p className="text-4xl font-black text-gray-900 mb-2">89</p>
                  <p className="font-bold text-gray-800">Days Active</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-2xl font-black text-gray-900 mb-6">ACHIEVEMENTS</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-linear-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl text-center text-white">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="font-bold text-sm">7 Day Streak</p>
                </div>
                <div className="bg-linear-to-br from-green-400 to-emerald-500 p-6 rounded-2xl text-center text-white">
                  <div className="text-4xl mb-2">🌟</div>
                  <p className="font-bold text-sm">First Check-in</p>
                </div>
                <div className="bg-linear-to-br from-blue-400 to-blue-600 p-6 rounded-2xl text-center text-white">
                  <div className="text-4xl mb-2">💙</div>
                  <p className="font-bold text-sm">Mental Health Ally</p>
                </div>
                <div className="bg-linear-to-br from-purple-400 to-purple-600 p-6 rounded-2xl text-center text-white">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="font-bold text-sm">Goal Achiever</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}