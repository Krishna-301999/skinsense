import React, { useState, useEffect } from 'react'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Scanner from './pages/Scanner.jsx'
import Results from './pages/Results.jsx'
import Store from './pages/Store.jsx'
import Consultation from './pages/Consultation.jsx'
import Admin from './pages/Admin.jsx'
import Layout from './components/Layout.jsx'
import SkincareChatbot from './components/SkincareChatbot.jsx'
import { Bell, User } from 'lucide-react'

export const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  // Navigation & Routing State
  const [activePage, setActivePage] = useState('landing');
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || '';
  });

  // E-Commerce State
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState([]);

  // Skin Reports state
  const [latestReport, setLatestReport] = useState(null);
  const [reportsHistory, setReportsHistory] = useState([]);

  // UI Toast State
  const [toast, setToast] = useState(null);

  // Global Toast Trigger
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync Theme to HTML class list
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Authenticate user on mount if token exists
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  // Fetch logged in user profile
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        fetchReportsHistory(data.id);
      } else {
        // Token expired/invalid
        logout();
      }
    } catch (err) {
      // Backend offline: Use local simulated default user if token exists
      console.warn("Backend offline. Simulating active session local authentication.");
      const decodedPayload = parseJwt(token);
      if (decodedPayload && decodedPayload.sub) {
        const isProdAdmin = decodedPayload.sub.includes("admin");
        setUser({
          id: isProdAdmin ? "usr_admin" : "usr_patient",
          email: decodedPayload.sub,
          full_name: isProdAdmin ? "Dr. Alex Sterling" : "Jane Doe",
          role: isProdAdmin ? "admin" : "user",
          skin_type: isProdAdmin ? null : "Combination",
          created_at: new Date().toISOString()
        });
      } else {
        logout();
      }
    }
  };

  const fetchReportsHistory = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/reports/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReportsHistory(data);
        if (data.length > 0) {
          setLatestReport(data[0]);
        }
      }
    } catch (err) {
      // Offline fallback: seed some mock reports
      setReportsHistory([
        {
          id: "rep_init",
          user_id: userId,
          overall_score: 82,
          metrics: { acne: 18.0, wrinkles: 5.0, dark_circles: 22.0, pigmentation: 10.0, redness: 12.0, oiliness: 45.0, dryness: 35.0 },
          regions: [],
          routine: { morning: [], night: [] },
          recommended_ingredients: ["Niacinamide", "Vitamin C"],
          diet_tips: [],
          lifestyle_tips: [],
          weather_suggestion: "Dry weather forecasted. Shield skin barrier with ceramides.",
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }
  };

  // JWT Decoder helper
  const parseJwt = (t) => {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const login = (jwtToken) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    triggerToast("Logged in successfully!", "success");
    setActivePage('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setLatestReport(null);
    setReportsHistory([]);
    triggerToast("Session terminated.", "info");
    setActivePage('landing');
  };

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        triggerToast(`Updated ${product.name} quantity in cart!`, "success");
        return prev.map(item => item.product.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
        );
      }
      triggerToast(`Added ${product.name} to cart!`, "success");
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    triggerToast("Item removed from cart.", "info");
  };

  const updateCartQty = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const isFav = prev.includes(productId);
      if (isFav) {
        triggerToast("Removed from wishlist.", "info");
        return prev.filter(id => id !== productId);
      } else {
        triggerToast("Added to wishlist!", "success");
        return [...prev, productId];
      }
    });
  };

  // Simulated protected page wrapper
  const navigateTo = (page) => {
    const protectedPages = ['dashboard', 'scanner', 'results', 'store', 'consultation', 'admin'];
    if (protectedPages.includes(page) && !user) {
      triggerToast("Authentication required to access dashboard.", "error");
      setActivePage('login');
    } else {
      setActivePage(page);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-grid-pattern">
      {/* Toast popup */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl transition-all duration-300 transform scale-100 flex items-center gap-2 border text-sm font-semibold tracking-wide ${
          toast.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400 backdrop-blur-md' :
          toast.type === 'error' ? 'bg-rose-500/90 text-white border-rose-400 backdrop-blur-md' :
          'bg-brand-500/90 text-white border-brand-400 backdrop-blur-md'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Floating Ambient Glow Background blobs */}
      <div className="ambient-glow bg-brand-500 w-96 h-96 -top-40 -left-40 opacity-15 dark:opacity-10 pointer-events-none"></div>
      <div className="ambient-glow bg-brand-accent w-[30rem] h-[30rem] -bottom-60 -right-60 opacity-10 pointer-events-none"></div>

      {/* Navigation Router Switch */}
      {activePage === 'landing' ? (
        <Landing 
          user={user} 
          navigateTo={navigateTo} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
        />
      ) : activePage === 'login' ? (
        <Login 
          login={login} 
          navigateTo={navigateTo} 
          triggerToast={triggerToast} 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      ) : (
        <Layout 
          activePage={activePage} 
          navigateTo={navigateTo} 
          user={user} 
          logout={logout}
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
        >
          {activePage === 'dashboard' && (
            <Dashboard 
              user={user} 
              navigateTo={navigateTo} 
              latestReport={latestReport} 
              reportsHistory={reportsHistory}
              triggerToast={triggerToast}
            />
          )}
          {activePage === 'scanner' && (
            <Scanner 
              token={token} 
              setLatestReport={setLatestReport} 
              setReportsHistory={setReportsHistory} 
              navigateTo={navigateTo}
              triggerToast={triggerToast}
              user={user}
            />
          )}
          {activePage === 'results' && (
            <Results 
              report={latestReport} 
              navigateTo={navigateTo}
              addToCart={addToCart}
            />
          )}
          {activePage === 'store' && (
            <Store 
              token={token} 
              addToCart={addToCart} 
              cart={cart}
              updateCartQty={updateCartQty}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              triggerToast={triggerToast}
              user={user}
            />
          )}
          {activePage === 'consultation' && (
            <Consultation 
              token={token} 
              triggerToast={triggerToast}
              user={user}
            />
          )}
          {activePage === 'admin' && (
            <Admin 
              token={token} 
              triggerToast={triggerToast}
            />
          )}
        </Layout>
      )}

      {/* Floating Global AI Assistant Bot Panel (shows on internal routes) */}
      {user && activePage !== 'landing' && activePage !== 'login' && (
        <SkincareChatbot token={token} user={user} />
      )}
    </div>
  )
}
