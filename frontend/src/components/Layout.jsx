import React, { useState } from 'react'
import { 
  Home, 
  Camera, 
  FileText, 
  ShoppingBag, 
  Calendar, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon, 
  Bell, 
  User, 
  Menu, 
  X 
} from 'lucide-react'

export default function Layout({ 
  children, 
  activePage, 
  navigateTo, 
  user, 
  logout, 
  darkMode, 
  setDarkMode 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Custom mock notifications
  const [notifications] = useState([
    { id: 1, title: "Daily Reminder", message: "Time for your morning Salicylic Cleanser!", time: "9:00 AM" },
    { id: 2, title: "Consultation Booked", message: "Dr. Jenkins is scheduled for tomorrow at 10:00 AM.", time: "Yesterday" }
  ]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'scanner', label: 'AI Scanner', icon: Camera },
    { id: 'results', label: 'AI Reports', icon: FileText },
    { id: 'store', label: 'DermaStore', icon: ShoppingBag },
    { id: 'consultation', label: 'Telehealth', icon: Calendar },
  ];

  // If user is admin, append Admin Panel
  if (user && user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: ShieldCheck });
  }

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Skin Health Dashboard';
      case 'scanner': return 'AI Skin Diagnostic Scanner';
      case 'results': return 'AI Diagnostic Reports';
      case 'store': return 'SkinSense E-Commerce Store';
      case 'consultation': return 'Clinical Dermatologist Consultations';
      case 'admin': return 'Clinical Administrative Portal';
      default: return 'SkinSense AI';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-800/50 h-full p-6 select-none relative z-20">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigateTo('dashboard')}>
          <div className="bg-brand-500 text-white p-2 rounded-xl shadow-glow">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-accent dark:from-white dark:to-brand-accent font-sans tracking-wide">
            SkinSense <span className="font-extrabold text-brand-500">AI</span>
          </span>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-glow' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-brand-500 dark:hover:text-brand-accent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User profile section bottom */}
        <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-slate-800 flex items-center justify-center text-brand-600 dark:text-brand-accent font-bold border border-brand-200 dark:border-slate-700">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role} Account</p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header Utilities */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 relative z-30">
          
          {/* Menu Trigger (Mobile) */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white font-sans tracking-wide">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors relative"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-accent rounded-full animate-ping"></span>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-accent rounded-full border border-white dark:border-slate-950"></span>
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-2xl p-4 z-50 animate-float-in glass-panel">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Recent Notifications</h3>
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className="pb-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs font-bold text-brand-500">{n.title}</p>
                            <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Chip Display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-950/80 border border-slate-200/50 dark:border-slate-800/50 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 dark:bg-slate-800 dark:text-brand-accent flex items-center justify-center text-xs font-extrabold">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-28">{user?.full_name}</span>
            </div>

          </div>
        </header>

        {/* Outer Child view panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </main>

        {/* 3. Mobile Bottom Dock Navigation Bar */}
        <nav className="md:hidden flex items-center justify-around bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 py-3 relative z-30 select-none pb-safe">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex flex-col items-center gap-1.5 ${isActive ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-bold tracking-wide">{item.label.replace('Derma', '')}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 4. Sliding Mobile Menu Panel (from Left) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex flex-col w-4/5 max-w-xs bg-white dark:bg-slate-900 p-6 h-full shadow-2xl glass-panel animate-slide-right">
            
            {/* Close Button */}
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-slate-900 dark:text-white">Menu Options</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Sidebar Nav */}
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateTo(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-brand-500 text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Bottom user profile logout */}
            <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 dark:bg-slate-800 dark:text-brand-accent flex items-center justify-center font-bold">
                  {user?.full_name ? user.full_name.charAt(0) : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.full_name}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
