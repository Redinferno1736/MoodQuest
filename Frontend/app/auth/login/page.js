'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Handle sign up
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }

        // Auto sign in after signup
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password
        });

        if (result?.error) {
          setError(result.error);
        } else {
          router.push(`/${name}/dashboard`);
        }
      } else {
        // Handle sign in
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password
        });

        if (result?.error) {
          setError('Invalid email or password');
        } else {
          // Extract username from email or use stored name
          const username = email.split('@')[0];
          router.push(`/${username}/dashboard`);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', {
        callbackUrl: '/Prateek/dashboard'
      });
    } catch (err) {
      setError('Google sign-in failed');
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    try {
      await signIn('facebook', {
        callbackUrl: '/Prateek/dashboard'
      });
    } catch (err) {
      setError('Facebook sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-400 via-lime-300 to-lime-200 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center md:text-left space-y-6">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <div className="w-20 h-20 bg-lime-500 rounded-full flex items-center justify-center">
              <span className="text-4xl">🧠</span>
            </div>
          </div>
          
          <h1 className="text-6xl font-black text-gray-900 leading-tight">
            YOUR FACE<br/>
            SPEAKS.<br/>
            WE LISTEN!
          </h1>
          
          <p className="text-2xl font-bold text-gray-800">
            Join our community and start your mental wellness journey today
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              <div className="w-12 h-12 rounded-full bg-blue-400 border-4 border-white"></div>
              <div className="w-12 h-12 rounded-full bg-purple-400 border-4 border-white"></div>
              <div className="w-12 h-12 rounded-full bg-pink-400 border-4 border-white"></div>
              <div className="w-12 h-12 rounded-full bg-orange-400 border-4 border-white"></div>
            </div>
            <p className="font-bold text-gray-800">
              Join <span className="text-2xl font-black">10,000+</span> users
            </p>
          </div>

          <div className="pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-lime-600 rounded-full flex items-center justify-center text-white font-black">✓</div>
              <p className="font-bold text-gray-800">Track your mood daily</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-lime-600 rounded-full flex items-center justify-center text-white font-black">✓</div>
              <p className="font-bold text-gray-800">Get personalized insights</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-lime-600 rounded-full flex items-center justify-center text-white font-black">✓</div>
              <p className="font-bold text-gray-800">Connect with support</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-gray-900 mb-2">
              {isSignUp ? 'SIGN UP' : 'WELCOME BACK!'}
            </h2>
            <p className="text-gray-600 font-bold">
              {isSignUp ? 'Create your account to get started' : 'Sign in to continue your journey'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-2xl">
              <p className="font-bold text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">FULL NAME</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required={isSignUp}
                    className="w-full px-4 py-4 pl-12 bg-lime-50 border-2 border-lime-300 rounded-2xl font-bold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lime-600">
                    <span className="text-xl">👤</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 py-4 pl-12 bg-lime-50 border-2 border-lime-300 rounded-2xl font-bold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lime-600" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className="w-full px-4 py-4 pl-12 pr-12 bg-lime-50 border-2 border-lime-300 rounded-2xl font-bold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lime-600" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lime-600 hover:text-lime-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-lime-300 text-lime-500 focus:ring-2 focus:ring-lime-500"
                  />
                  <span className="ml-2 text-sm font-bold text-gray-700">Remember me</span>
                </label>
                <button type="button" className="text-sm font-bold text-lime-600 hover:text-lime-700">
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-lime-500 text-white font-black text-lg rounded-full hover:bg-lime-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'LOADING...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
              <ArrowRight size={24} />
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white font-bold text-gray-500">OR CONTINUE WITH</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-full font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleFacebookSignIn}
                disabled={loading}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 font-bold">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-lime-600 hover:text-lime-700 font-black"
              >
                {isSignUp ? 'SIGN IN' : 'SIGN UP'}
              </button>
            </p>
          </div>

          {isSignUp && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 font-bold">
                By signing up, you agree to our{' '}
                <a href="#" className="text-lime-600 hover:text-lime-700">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-lime-600 hover:text-lime-700">Privacy Policy</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}