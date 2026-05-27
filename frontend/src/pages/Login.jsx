import React, { useState } from 'react'
import { Sparkles, Mail, Lock, User, ArrowLeft, Sun, Moon } from 'lucide-react'
import { API_BASE } from '../App.jsx'

export default function Login({ login, navigateTo, triggerToast, darkMode, setDarkMode }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLoginTab && !fullName)) {
      triggerToast("Please fill in all required fields.", "error");
      return;
    }

    setLoading(true);

    if (isLoginTab) {
      // --- LOG IN FLOW ---
      try {
        const res = await fetch(`${API_BASE}/auth/login-json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        if (res.ok) {
          const data = await res.json();
          login(data.access_token);
        } else {
          const data = await res.json();
          triggerToast(data.detail || "Authentication failed. Check credentials.", "error");
        }
      } catch (err) {
        // Offline simulation flow
        console.warn("Backend offline. Simulating local token issuance.");
        if (
          (email === "user@skinsense.ai" && password === "user123") || 
          (email === "admin@skinsense.ai" && password === "admin123")
        ) {
          // Generate a fake but syntactically correct JWT token for local testing
          // Subject is set to user's email
          const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
          const payload = btoa(JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + 86400 }));
          const mockJwt = `${header}.${payload}.mocksignature`;
          
          login(mockJwt);
        } else {
          triggerToast("Offline Mode: Use user@skinsense.ai (user123) or admin@skinsense.ai (admin123) to sign in.", "error");
        }
      } finally {
        setLoading(false);
      }
    } else {
      // --- SIGN UP FLOW ---
      try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName })
        });

        if (res.ok) {
          triggerToast("Account registered! Please log in.", "success");
          setIsLoginTab(true);
        } else {
          const data = await res.json();
          triggerToast(data.detail || "Sign up failed.", "error");
        }
      } catch (err) {
        console.warn("Backend offline. Simulating local signup.");
        triggerToast("Offline Mode: Sign up simulation successful. Please sign in now!", "success");
        setIsLoginTab(true);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative bg-brand-50 dark:bg-slate-950 transition-colors duration-300 font-sans select-none">
      
      {/* Back button and theme toggle at top */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold shadow-glass-light hover:bg-white dark:hover:bg-slate-900 transition-all"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> Back to Home
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Glassmorphic Panel Card */}
      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-glass-light dark:shadow-glass-dark relative z-10 glass-panel">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand-500 text-white p-3 rounded-2xl shadow-glow mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
            {isLoginTab ? "Access SkinSense AI" : "Create Clinical Account"}
          </h2>
          <p className="text-xs text-slate-400 font-semibold leading-none mt-2">
            {isLoginTab ? "Analyze skin diagnostics & routines" : "Start your computerized skincare journey"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-2xl mb-6">
          <button
            onClick={() => setIsLoginTab(true)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              isLoginTab 
                ? 'bg-white dark:bg-slate-900 text-brand-500 shadow-md' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginTab(false)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              !isLoginTab 
                ? 'bg-white dark:bg-slate-900 text-brand-500 shadow-md' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name (Sign Up only) */}
          {!isLoginTab && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10.5 pr-4 py-3 text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@skinsense.ai"
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10.5 pr-4 py-3 text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10.5 pr-4 py-3 text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
              />
            </div>
          </div>

          {/* Submission Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold tracking-wide text-xs shadow-glow disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isLoginTab ? (
              "Sign In to Portal"
            ) : (
              "Complete Registration"
            )}
          </button>

        </form>

        {/* Offline notice Helper */}
        {isLoginTab && (
          <div className="mt-6 p-3 bg-brand-500/5 dark:bg-brand-500/10 rounded-xl border border-brand-500/10 text-center text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            <p className="font-extrabold text-brand-500 mb-0.5">Quick Evaluation Logins (Offline Fallback):</p>
            <p>User: <span className="font-bold text-slate-800 dark:text-slate-200">user@skinsense.ai</span> (password: <span className="font-bold">user123</span>)</p>
            <p>Admin: <span className="font-bold text-slate-800 dark:text-slate-200">admin@skinsense.ai</span> (password: <span className="font-bold">admin123</span>)</p>
          </div>
        )}

      </div>

    </div>
  )
}
