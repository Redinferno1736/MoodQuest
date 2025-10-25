"use client"

import React, { useState } from 'react';
import { Bell, Home, TrendingUp, Heart, Settings, HelpCircle, User, Smile, Target, Award, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const AnalysisPage = () => {
   const params = useParams();

  const [activeTab, setActiveTab] = useState('analysis');
  const [timeRange, setTimeRange] = useState('month');

  // Chart Data
  const moodTrendData = [
    { date: 'Week 1', happy: 5, sad: 2, stressed: 1, neutral: 0 },
    { date: 'Week 2', happy: 4, sad: 1, stressed: 2, neutral: 1 },
    { date: 'Week 3', happy: 6, sad: 1, stressed: 0, neutral: 1 },
    { date: 'Week 4', happy: 5, sad: 2, stressed: 1, neutral: 0 },
  ];

  const dailyMoodData = [
    { day: 'Mon', mood: 4.2 },
    { day: 'Tue', mood: 3.8 },
    { day: 'Wed', mood: 4.5 },
    { day: 'Thu', mood: 3.2 },
    { day: 'Fri', mood: 4.8 },
    { day: 'Sat', mood: 4.6 },
    { day: 'Sun', mood: 4.0 },
  ];

  const moodDistributionData = [
    { name: 'Happy', value: 17, color: '#a3e635' },
    { name: 'Sad', value: 6, color: '#f87171' },
    { name: 'Stressed', value: 4, color: '#fde047' },
    { name: 'Neutral', value: 3, color: '#94a3b8' },
  ];

  const wellnessScoreData = [
    { category: 'Sleep', score: 85 },
    { category: 'Exercise', score: 70 },
    { category: 'Social', score: 75 },
    { category: 'Mindfulness', score: 80 },
    { category: 'Nutrition', score: 65 },
  ];

  const performanceData = [
    { session: 1, performance: 75, mood: 4.0 },
    { session: 2, performance: 60, mood: 3.2 },
    { session: 3, performance: 80, mood: 4.2 },
    { session: 4, performance: 45, mood: 2.5 },
    { session: 5, performance: 55, mood: 3.0 },
    { session: 6, performance: 85, mood: 4.5 },
    { session: 7, performance: 95, mood: 5.0 },
    { session: 8, performance: 90, mood: 4.7 },
    { session: 9, performance: 70, mood: 3.8 },
    { session: 10, performance: 75, mood: 4.0 },
  ];

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

        {/* Analysis Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Time Range Selector */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-6 py-3 font-black rounded-full transition-colors ${
                  timeRange === 'week' ? 'bg-lime-500 text-white' : 'bg-white text-gray-900 hover:bg-lime-100'
                }`}
              >
                THIS WEEK
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-6 py-3 font-black rounded-full transition-colors ${
                  timeRange === 'month' ? 'bg-lime-500 text-white' : 'bg-white text-gray-900 hover:bg-lime-100'
                }`}
              >
                THIS MONTH
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={`px-6 py-3 font-black rounded-full transition-colors ${
                  timeRange === 'year' ? 'bg-lime-500 text-white' : 'bg-white text-gray-900 hover:bg-lime-100'
                }`}
              >
                THIS YEAR
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-linear-to-br from-lime-400 to-lime-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <Smile size={32} />
                  <span className="text-sm font-bold">+12%</span>
                </div>
                <p className="text-4xl font-black mb-1">78%</p>
                <p className="font-bold text-lime-100">Overall Happiness</p>
              </div>

              <div className="bg-linear-to-br from-blue-400 to-blue-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp size={32} />
                  <span className="text-sm font-bold">+8%</span>
                </div>
                <p className="text-4xl font-black mb-1">4.2</p>
                <p className="font-bold text-blue-100">Average Mood Score</p>
              </div>

              <div className="bg-linear-to-br from-purple-400 to-purple-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <Target size={32} />
                  <span className="text-sm font-bold">+5%</span>
                </div>
                <p className="text-4xl font-black mb-1">27</p>
                <p className="font-bold text-purple-100">Check-ins Completed</p>
              </div>

              <div className="bg-linear-to-br from-orange-400 to-orange-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <Award size={32} />
                  <span className="text-sm font-bold">NEW!</span>
                </div>
                <p className="text-4xl font-black mb-1">7</p>
                <p className="font-bold text-orange-100">Day Streak</p>
              </div>
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Mood Trends Over Time */}
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-2xl font-black text-gray-900 mb-4">MOOD TRENDS</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="happy" fill="#a3e635" name="Happy Days" />
                    <Bar dataKey="sad" fill="#f87171" name="Sad Days" />
                    <Bar dataKey="stressed" fill="#fde047" name="Stressed Days" />
                    <Bar dataKey="neutral" fill="#94a3b8" name="Neutral Days" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Mood Distribution */}
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-2xl font-black text-gray-900 mb-4">MOOD DISTRIBUTION</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {moodDistributionData.map((entry, index) => (
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
                <AreaChart data={dailyMoodData}>
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
              {/* Wellness Score Radar */}
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-2xl font-black text-gray-900 mb-4">WELLNESS SCORE</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={wellnessScoreData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Your Score" dataKey="score" stroke="#84cc16" fill="#a3e635" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance vs Mood */}
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-2xl font-black text-gray-900 mb-4">PERFORMANCE VS MOOD</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
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

            {/* Insights & Recommendations */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-linear-to-br from-green-400 to-emerald-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="text-4xl mb-3">💪</div>
                <h4 className="text-xl font-black mb-2">STRENGTH</h4>
                <p className="font-bold text-green-100">Your mood improves significantly on weekends. Keep up your weekend routines!</p>
              </div>

              <div className="bg-linear-to-br from-yellow-400 to-orange-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="text-4xl mb-3">💡</div>
                <h4 className="text-xl font-black mb-2">INSIGHT</h4>
                <p className="font-bold text-yellow-100">Your performance peaks when your mood is above 4.0. Prioritize mood-boosting activities!</p>
              </div>

              <div className="bg-linear-to-br from-pink-400 to-rose-500 p-6 rounded-3xl shadow-lg text-white">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="text-xl font-black mb-2">GOAL</h4>
                <p className="font-bold text-pink-100">Try to increase your social wellness score by 10% this month for better overall health!</p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h3 className="text-2xl font-black text-gray-900 mb-4">RECENT ACTIVITIES</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-lime-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-lime-400 rounded-full flex items-center justify-center text-2xl">😊</div>
                    <div>
                      <p className="font-bold text-gray-900">Morning Check-in</p>
                      <p className="text-sm text-gray-600">Feeling great today! • 2 hours ago</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-lime-500 text-white font-bold rounded-full">Happy</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-2xl">✅</div>
                    <div>
                      <p className="font-bold text-gray-900">Completed Quick Quiz</p>
                      <p className="text-sm text-gray-600">Stress management assessment • Yesterday</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-blue-500 text-white font-bold rounded-full">Completed</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center text-2xl">🏆</div>
                    <div>
                      <p className="font-bold text-gray-900">Achievement Unlocked</p>
                      <p className="text-sm text-gray-600">7-day streak milestone • 2 days ago</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-purple-500 text-white font-bold rounded-full">Achievement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;