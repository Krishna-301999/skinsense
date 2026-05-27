import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, ShoppingCart } from 'lucide-react'
import { API_BASE } from '../App.jsx'

export default function SkincareChatbot({ token, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${user?.full_name || 'there'}! I'm your SkinSense clinical AI assistant. How can I help you optimize your skincare routine today? You can ask me about acne breakouts, anti-aging retinols, or dry skin moisturizers!`,
      products: [],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageText = inputValue;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMessageText,
      products: [],
      time: currentTime
    }]);

    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessageText })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: data.reply,
          products: data.recommended_products || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error("Chat server error");
      }
    } catch (err) {
      // Local Intelligent Simulation Fallback
      console.warn("Backend offline. Running clinical chatbot simulation.");
      setTimeout(() => {
        const text = userMessageText.toLowerCase();
        let reply = "";
        let mockProds = [];

        if (text.includes("acne") || text.includes("pimple") || text.includes("breakout")) {
          reply = `Acne breakouts are usually triggered by hyper-keratinization and high sebum in tropical climates. Since your diagnosed skin type is **${user?.skin_type || 'Combination'}**, you should treat breakouts with oil-soluble **Salicylic Acid (BHA)**. Try our 2% Salicylic Acid Face Cleanser twice daily!`;
          mockProds = [{
            id: "prod_2",
            name: "2% Salicylic Acid Face Cleanser",
            brand: "The Derma Co",
            price: 349.0,
            image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=300&auto=format&fit=crop"
          }];
        } else if (text.includes("dry") || text.includes("hydrate") || text.includes("moisture")) {
          reply = "For dry skin barriers, we focus heavily on humectants and lipid sealing. I suggest pairing **Hyaluronic Acid Serum** with a rich **Ceramide cream**. Apply Kama Ayurveda's Kumkumadi Miraculous Beauty Fluid on damp skin to trap moisture.";
          mockProds = [{
            id: "prod_5",
            name: "Kumkumadi Miraculous Beauty Fluid",
            brand: "Kama Ayurveda",
            price: 1895.0,
            image_url: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=300&auto=format&fit=crop"
          }];
        } else if (text.includes("wrinkle") || text.includes("aging") || text.includes("fine")) {
          reply = "The absolute golden cure for skin aging is Speeds up cellular division. Follow up with Kumkumadi Beauty Fluid, and make absolutely sure to apply broad-spectrum sunscreen like Re'equil SPF 50 daily!";
          mockProds = [{
            id: "prod_5",
            name: "Kumkumadi Miraculous Beauty Fluid",
            brand: "Kama Ayurveda",
            price: 1895.0,
            image_url: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=300&auto=format&fit=crop"
          }];
        } else {
          reply = `Hello ${user?.full_name || 'Patient'}! I am here to help you design a clinical routine. Please specify if you are treating active **acne**, chronic **dryness**, **pigmentation**, or **wrinkles**!`;
          mockProds = [{
            id: "prod_4",
            name: "Ultra Matte Dry Touch Sunscreen SPF 50",
            brand: "Re'equil",
            price: 695.0,
            image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=300&auto=format&fit=crop"
          }];
        }

        setMessages(prev => [...prev, {
          sender: 'bot',
          text: reply,
          products: mockProds,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render bold strings styled beautifully
  const renderFormattedText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-brand-500 font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans no-print select-none">
      
      {/* 1. Closed State Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-brand-500 to-brand-accent rounded-full text-white shadow-glow hover:scale-110 active:scale-95 transition-transform duration-200 border border-brand-400 group"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-6" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-accent border-2 border-white dark:border-slate-950"></span>
          </span>
        </button>
      )}

      {/* 2. Expanded Chat Panel (Glassmorphic Slide-up) */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] rounded-2xl flex flex-col bg-white/95 dark:bg-slate-900/95 shadow-2xl border border-slate-200 dark:border-slate-800 glass-panel overflow-hidden transition-all duration-300 animate-slide-up">
          
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-brand-500/10 to-brand-accent/5 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-brand-500 text-white p-1.5 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-none">SkinSense Clinic Bot</h3>
                <span className="text-[10px] font-semibold text-emerald-500">Clinical Diagnostics Online</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Text Bubble */}
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                }`}>
                  <p className="whitespace-pre-line">{renderFormattedText(m.text)}</p>
                </div>

                {/* Embedded recommended products catalog */}
                {m.products && m.products.length > 0 && (
                  <div className="mt-2 space-y-2 w-full max-w-[85%] animate-float-in">
                    <p className="text-[10px] font-bold text-brand-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Recommended clinical solution:
                    </p>
                    {m.products.map((p) => (
                      <div key={p.id} className="flex gap-2 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl items-center shadow-sm">
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-100 dark:border-slate-900" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                          <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">{p.brand}</p>
                          <p className="text-[10px] font-extrabold text-brand-500 mt-1">₹{p.price.toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Time Indicator */}
                <span className="text-[9px] text-slate-400 font-medium mt-1 mx-1.5">{m.time}</span>
              </div>
            ))}

            {/* Simulated Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-1.5 p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none w-20 justify-center">
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Form Input Footer */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white/80 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/50 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about acne, dark circles, wrinkles..."
              className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white flex items-center justify-center shadow-glow transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
