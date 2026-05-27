import React, { useState, useEffect } from 'react'
import { Sparkles, Camera, ShoppingBag, Calendar, ShieldCheck, Heart, ArrowRight, CheckCircle2 } from 'lucide-react'
import WeatherWidget from '../components/WeatherWidget.jsx'
import BeforeAfterSlider from '../components/BeforeAfterSlider.jsx'
import { API_BASE } from '../App.jsx'

export default function Dashboard({ 
  user, 
  navigateTo, 
  latestReport, 
  reportsHistory,
  triggerToast 
}) {
  const [recommendedProds, setRecommendedProds] = useState([]);
  
  // Track checkmarks for morning and night routines
  const [morningDone, setMorningDone] = useState(false);
  const [nightDone, setNightDone] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [user, latestReport]);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products/recommend`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendedProds(data);
      }
    } catch (err) {
      // Fallback recommendations if offline
      console.warn("Backend offline. Simulating local product recommendations.");
      const mockRecommendations = [
        {
          id: "prod_1",
          name: "10% Niacinamide Face Serum",
          brand: "Minimalist",
          price: 599.0,
          rating: 4.8,
          image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=300&auto=format&fit=crop"
        },
        {
          id: "prod_4",
          name: "Ultra Matte Dry Touch Sunscreen SPF 50",
          brand: "Re'equil",
          price: 695.0,
          rating: 4.9,
          image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=300&auto=format&fit=crop"
        }
      ];
      setRecommendedProds(mockRecommendations);
    }
  };

  // Helper to draw SVG progress charts dynamically based on historical scores
  const renderSVGProgressChart = () => {
    // Generate dummy score timeline if reports history is too short
    const chartPoints = reportsHistory.length > 1
      ? [...reportsHistory].reverse().map(r => r.overall_score)
      : [74, 78, 76, 82, 85, (latestReport?.overall_score || 88)];

    const width = 500;
    const height = 150;
    const padding = 20;
    
    // Convert scores to SVG coordinate points
    const pointsCount = chartPoints.length;
    const xStep = (width - padding * 2) / (pointsCount - 1);
    
    const svgPoints = chartPoints.map((score, idx) => {
      const x = padding + idx * xStep;
      // Invert Y coordinate so higher score is at top
      // Assuming score ranges 50 - 100
      const y = height - padding - ((score - 50) / 50) * (height - padding * 2);
      return { x, y, score };
    });

    const pathData = svgPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0.00" />
          </linearGradient>
        </defs>
        
        {/* Fill Area */}
        <path
          d={`${pathData} L ${svgPoints[svgPoints.length - 1].x} ${height - padding} L ${svgPoints[0].x} ${height - padding} Z`}
          fill="url(#chartGradient)"
        />
        
        {/* Stroke Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#0066FF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bouncing circular points */}
        {svgPoints.map((p, idx) => (
          <g key={idx} className="group/dot cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#00D2FF"
              stroke="#0066FF"
              strokeWidth="2.5"
            />
            {/* Tooltip hover highlight */}
            <circle
              cx={p.x}
              cy={p.y}
              r="10"
              fill="#00D2FF"
              fillOpacity="0"
              className="hover:fill-opacity-20 transition-all"
            />
            {/* Score label text */}
            <text
              x={p.x}
              y={p.y - 10}
              className="text-[9px] font-extrabold text-slate-800 dark:text-slate-300 fill-current text-anchor-middle hidden group-hover/dot:block"
              textAnchor="middle"
            >
              {p.score}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const getDiagnosticsStatus = () => {
    if (!latestReport) {
      return {
        title: "No Skin Analysis Yet",
        desc: "Diagnostic modules waiting. Capture a portrait photo to run AI skin mapping.",
        score: "--",
        sub: "Diagnostic pending"
      };
    }
    return {
      title: `${latestReport.overall_score} - Healthy Index`,
      desc: `Diagnosed skin classification: ${user?.skin_type || "Combination"}. Focus on ${latestReport.recommended_ingredients.slice(0,2).join(" & ")}.`,
      score: latestReport.overall_score,
      sub: "Last scanned: " + new Date(latestReport.created_at).toLocaleDateString()
    };
  };

  const stats = getDiagnosticsStatus();

  return (
    <div className="space-y-6 select-none font-sans relative">
      
      {/* 1. Header Greeting & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
            Welcome Back, {user?.full_name.split(' ')[0]}!
          </h2>
          <p className="text-xs text-slate-400 font-semibold leading-none mt-2">
            Your customized computerized diagnostic pipeline is active and updated.
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigateTo('scanner')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" /> Start AI Scan
          </button>
        </div>
      </div>

      {/* 2. Grid section: Telemetries & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Diagnosis Telemetry */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light dark:shadow-glass-dark flex flex-col sm:flex-row gap-6 items-center justify-between">
          
          <div className="space-y-4 flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-accent px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Skin Diagnostics Index
            </div>
            
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{stats.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-sm">
                {stats.desc}
              </p>
            </div>

            <div className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">
              {stats.sub}
            </div>

            {latestReport && (
              <button
                onClick={() => navigateTo('results')}
                className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 text-xs font-bold transition-all cursor-pointer"
              >
                View Full Diagnostic Report <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Big gauge meter */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            {/* Circular background tract */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="56"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
                fill="none"
              />
              {latestReport && (
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  className="stroke-brand-500"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="351.8"
                  strokeDashoffset={351.8 - (351.8 * stats.score) / 100}
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800 dark:text-white">{stats.score}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-0.5">Health Score</span>
            </div>
          </div>

        </div>

        {/* Contextual Weather suggests */}
        <div className="h-full">
          <WeatherWidget />
        </div>

      </div>

      {/* 3. Grid section: Routine Timeline Charts & Before-After Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress chart score history */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light dark:shadow-glass-dark flex flex-col h-[280px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-none">Diagnostic Progress Timeline</h3>
              <p className="text-[10px] text-slate-400 font-semibold leading-none mt-1">Computerized tracking tracking variables</p>
            </div>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg">Historical Index</div>
          </div>

          {/* SVG line chart Container */}
          <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-900 p-2.5 relative">
            {renderSVGProgressChart()}
          </div>
        </div>

        {/* Before After drag slider */}
        <div className="h-full">
          <BeforeAfterSlider />
        </div>

      </div>

      {/* 4. Skincare routines tracker checklist & recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active daily routines completion checkmark tracker */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light dark:shadow-glass-dark">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-none">Skincare Action Checklist</h3>
            <span className="text-[10px] text-brand-500 font-bold bg-brand-500/10 px-2 py-0.5 rounded-lg">Daily Tracker</span>
          </div>

          <div className="space-y-3.5">
            {/* Morning trigger */}
            <div 
              onClick={() => {
                setMorningDone(!morningDone);
                triggerToast(morningDone ? "Morning routine checklist reset" : "Completed Morning routine! Awesome job!", "success");
              }}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                morningDone 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-50 dark:bg-slate-950/80 border-slate-100 dark:border-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${morningDone ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                <div>
                  <p className="text-xs font-bold leading-none">Morning Clinical Routine</p>
                  <p className="text-[9px] opacity-75 mt-1 font-semibold">Cleanser + Hyaluronic Serum + Hydrating SPF</p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">AM</span>
            </div>

            {/* Night trigger */}
            <div 
              onClick={() => {
                setNightDone(!nightDone);
                triggerToast(nightDone ? "Night routine checklist reset" : "Completed Night routine! Skin repair active!", "success");
              }}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                nightDone 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-50 dark:bg-slate-950/80 border-slate-100 dark:border-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${nightDone ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                <div>
                  <p className="text-xs font-bold leading-none">Night Repair Routine</p>
                  <p className="text-[9px] opacity-75 mt-1 font-semibold">Salicylic Double Cleanse + Active Retinol + Barrier Cream</p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">PM</span>
            </div>
          </div>
        </div>

        {/* Quick e-commerce recommender */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light dark:shadow-glass-dark">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-none">AI Recommended Skincare</h3>
            <button onClick={() => navigateTo('store')} className="text-[10px] text-brand-500 font-bold hover:underline">View Store</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {recommendedProds.map((prod) => (
              <div 
                key={prod.id} 
                onClick={() => navigateTo('store')}
                className="bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-900 rounded-2xl p-2.5 flex items-center gap-2.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200"
              >
                <img src={prod.image_url} alt={prod.name} className="w-10 h-10 object-cover rounded-xl border border-slate-100 dark:border-slate-900" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-extrabold text-slate-800 dark:text-slate-200 truncate leading-tight">{prod.name}</p>
                  <p className="text-[8px] text-slate-400 mt-0.5 font-bold leading-none">{prod.brand}</p>
                  <p className="text-[10px] font-extrabold text-brand-500 mt-1">₹{prod.price.toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
