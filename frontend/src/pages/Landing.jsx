import React from 'react'
import { Sparkles, Activity, ShieldCheck, Video, ArrowRight, Sun, Moon } from 'lucide-react'

export default function Landing({ user, navigateTo, darkMode, setDarkMode }) {
  return (
    <div className="min-h-screen flex flex-col relative bg-brand-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      
      {/* 1. Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/60 dark:bg-slate-900/60 sticky top-0 z-40 select-none">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('landing')}>
          <div className="bg-brand-500 text-white p-2 rounded-xl shadow-glow">
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-accent dark:from-white dark:to-brand-accent tracking-wide">
            SkinSense <span className="font-extrabold text-brand-500">AI</span>
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          
          {/* Light/Dark Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <button
              onClick={() => navigateTo('dashboard')}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-glow transition-all"
            >
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => navigateTo('login')}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-glow transition-all animate-pulse"
            >
              Sign In
            </button>
          )}

        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12 relative z-10 select-none">
        
        {/* Left column information */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-accent px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase border border-brand-500/10 animate-float">
            <Sparkles className="w-3.5 h-3.5" /> Clinical AI Dermatology
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white font-sans leading-[1.1] tracking-tight">
            Diagnose Your Skin Health with <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-brand-accent">Computer Vision</span>
          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg font-medium">
            Unlock professional-grade dermatology insight in under 30 seconds. Snap a selfie, detect breakouts or dehydration, build dynamic routine logs, and consult board-certified physicians.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <button
              onClick={() => navigateTo(user ? 'scanner' : 'login')}
              className="px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white shadow-glow transition-all hover:scale-105 active:scale-95 font-bold tracking-wide text-sm flex items-center justify-center gap-2"
            >
              Scan Your Face Free <ArrowRight className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => navigateTo('login')}
              className="px-8 py-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold tracking-wide text-sm flex items-center justify-center"
            >
              Learn Scientific Methods
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-6 grid grid-cols-3 gap-4 max-w-md border-t border-slate-200/50 dark:border-slate-800/50">
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200">99.4%</p>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">Scan Precision</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200">20k+</p>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">Scans Diagnosed</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200">24/7</p>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">Doctor Access</p>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Visual Showcase Mockup */}
        <div className="flex-1 w-full max-w-md md:max-w-none flex justify-center relative">
          
          {/* Main Simulated Scanner Card */}
          <div className="w-72 sm:w-80 rounded-[2.5rem] p-4 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-2xl glass-panel relative z-10">
            <div className="rounded-[2rem] overflow-hidden relative border border-slate-200 dark:border-slate-800 h-96">
              
              {/* Selfie placeholder image */}
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop" 
                alt="Diagnostics Face" 
                className="w-full h-full object-cover"
              />

              {/* Glowing camera scanning laser */}
              <div className="scanner-laser"></div>

              {/* Simulated Face Bounding boxes */}
              <div className="absolute top-[38%] left-[28%] w-12 h-6 border-2 border-brand-accent rounded-lg shadow-glow flex items-center justify-center animate-pulse">
                <span className="text-[7px] text-brand-accent bg-slate-950/80 px-1 py-0.5 rounded font-extrabold">Eye: 88%</span>
              </div>

              <div className="absolute top-[48%] left-[64%] w-10 h-10 border-2 border-rose-500 rounded-lg flex items-center justify-center animate-pulse">
                <span className="text-[7px] text-rose-400 bg-slate-950/80 px-1 py-0.5 rounded font-extrabold">Acne: 92%</span>
              </div>

              {/* Scanner overlays overlay */}
              <div className="absolute top-3 left-3 bg-slate-950/80 text-brand-accent border border-brand-accent/30 backdrop-blur-md rounded-lg p-2 font-mono text-[8px] space-y-0.5">
                <p>SYS.STATUS: DISPATCH</p>
                <p>RESOLUTION: 1080P</p>
                <p>MODEL: D-GLOW v2</p>
              </div>

              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-950/90 text-white backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-1.5 border border-white/10 text-[9px] font-extrabold uppercase tracking-widest whitespace-nowrap shadow-xl">
                <Activity className="w-3.5 h-3.5 text-brand-accent animate-pulse" /> Diagnostics Complete
              </div>

            </div>
          </div>

          {/* Floater background glowing graphics */}
          <div className="absolute -top-6 -right-6 w-36 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 hidden sm:block animate-float" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-500/10 text-brand-600 rounded-lg">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">Skin Score</p>
                <p className="text-sm font-extrabold text-brand-500">88 Index</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 w-40 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 hidden sm:block animate-float" style={{ animationDelay: '3s' }}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-accent/10 text-brand-accent rounded-lg">
                <Video className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">Dermatologist</p>
                <p className="text-[9px] font-bold text-emerald-500 leading-none">Online & Active</p>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* 3. Footer */}
      <footer className="px-6 py-6 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-950/30 backdrop-blur-sm select-none text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
          © {new Date().getFullYear()} SkinSense AI Technologies. Medical-grade computer vision diagnostics. All rights reserved.
        </p>
      </footer>

    </div>
  )
}
