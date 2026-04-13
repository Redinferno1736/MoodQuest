'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Loader2, LogOut } from 'lucide-react';

const Navbar = () => {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-[#BDE49F] flex justify-between items-center px-8 py-4">
      {/* Logo */}
      <Link
        href={status === 'authenticated' ? '/dashboard' : '/'}  // ← removed /${session.user.name}
        className="flex items-center gap-3"
      >
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
          <div className="text-center flex flex-col items-center justify-center">
            <div className="text-3xl leading-none mb-0.5">😊</div>
            <p className="text-[8px] font-bold text-gray-600 tracking-tight leading-tight">
              FACE SCAN
            </p>
          </div>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-12">
        <ul className="flex items-center gap-8">
          <Link href="/explore">
            <li className="flex items-center gap-2 font-bold text-black text-xl cursor-pointer hover:text-gray-700">
              EXPLORE
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </li>
          </Link>
          <Link href="/contact">
            <li className="flex items-center gap-2 font-bold text-black text-xl cursor-pointer hover:text-gray-700">
              CONTACT
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </li>
          </Link>
          <Link href="/help">  {/* ← /support → /help (your actual help page) */}
            <li className="flex items-center gap-2 font-bold text-black text-xl cursor-pointer hover:text-gray-700">
              SUPPORT
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </li>
          </Link>
        </ul>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        <div className="cursor-pointer hover:opacity-80">
          <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>

        <div className="flex items-center gap-6">
          {status === 'loading' && (
            <Loader2 className="w-8 h-8 animate-spin text-black" />
          )}

          {status === 'unauthenticated' && (
            <>
              <Link href="/auth/login" className="font-bold text-black text-lg hover:text-gray-700">
                LOGIN
              </Link>
              <Link href="/auth/signup" className="bg-gray-900 text-white text-lg px-6 py-3 hover:bg-gray-800">  {/* ← /auth/login → /auth/signup */}
                SIGN UP
              </Link>
            </>
          )}

          {status === 'authenticated' && session && (
            <>
              <span className="font-bold text-black text-lg">
                Hi, {session.user.name?.split(' ')[0] || 'User'}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-600 text-white text-lg px-6 py-3 hover:bg-red-700 flex items-center gap-2"
              >
                <LogOut size={18} />
                LOGOUT
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 