import React from 'react'
import { Sparkles, Printer, ShieldAlert, Heart, Moon, Sun, Apple, Info } from 'lucide-react'

export default function Results({ report, navigateTo, addToCart }) {
  
  if (!report) {
    return (
      <div className="max-w-xl mx-auto bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-glass-light font-sans select-none">
        <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-bounce" />
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-none">No Scan File Found</h3>
        <p className="text-xs text-slate-400 font-semibold leading-none mt-2 mb-6">
          You haven't run an AI skincare diagnostic yet. Map your face to inspect reports history.
        </p>
        <button
          onClick={() => navigateTo('scanner')}
          className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition-all"
        >
          Open face scanner
        </button>
      </div>
    );
  }

  const { metrics, regions, routine, recommended_ingredients, diet_tips, lifestyle_tips, weather_suggestion } = report;

  const handlePrint = () => {
    window.print();
  };

  const getMetricColor = (val) => {
    if (val > 30) return "bg-rose-500";
    if (val > 15) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans select-none print-container relative">
      
      {/* 1. Header Toolbar Controls */}
      <div className="flex justify-between items-center bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-glass-light no-print">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 dark:text-white leading-none">Diagnostic File: #{report.id}</h2>
          <p className="text-[10px] text-slate-400 font-bold leading-none mt-1.5 uppercase">Compiled on: {new Date(report.created_at).toLocaleString()}</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Export PDF Report
        </button>
      </div>

      {/* 2. Score Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric gauge Score Card */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light dark:shadow-glass-dark flex flex-col justify-center items-center text-center">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-4">Overall Score</span>
          <div className="relative w-32 h-32 flex items-center justify-center mb-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="52" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="none" />
              <circle
                cx="64"
                cy="64"
                r="52"
                className="stroke-brand-500"
                strokeWidth="8"
                fill="none"
                strokeDasharray="326.7"
                strokeDashoffset={326.7 - (326.7 * report.overall_score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-3xl font-black text-slate-800 dark:text-white">{report.overall_score}</span>
          </div>
          <span className="text-xs font-bold text-brand-500 capitalize">Epidermal integrity is prime</span>
        </div>

        {/* Severity Progress indicators */}
        <div className="md:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light dark:shadow-glass-dark space-y-3.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Dermal Layer Severity Index</h3>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold leading-none text-slate-600 dark:text-slate-300">
              <span>Active Acne & Inflammations</span>
              <span className="font-extrabold">{metrics.acne}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-500 ${getMetricColor(metrics.acne)}`} style={{ width: `${metrics.acne}%` }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold leading-none text-slate-600 dark:text-slate-300">
              <span>Under-eye Dark Circles</span>
              <span className="font-extrabold">{metrics.dark_circles}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-500 ${getMetricColor(metrics.dark_circles)}`} style={{ width: `${metrics.dark_circles}%` }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold leading-none text-slate-600 dark:text-slate-300">
              <span>Fine Line Wrinkles</span>
              <span className="font-extrabold">{metrics.wrinkles}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-500 ${getMetricColor(metrics.wrinkles)}`} style={{ width: `${metrics.wrinkles}%` }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold leading-none text-slate-600 dark:text-slate-300">
              <span>Sebaceous Excretion (Oiliness)</span>
              <span className="font-extrabold">{metrics.oiliness}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="bg-brand-accent h-2 rounded-full transition-all duration-500" style={{ width: `${metrics.oiliness}%` }}></div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Computer Vision Mapping Overlay canvas */}
      {regions && regions.length > 0 && (
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light dark:shadow-glass-dark">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 leading-none">Interactive Computer Vision Face Map</h3>
          
          <div className="flex flex-col md:flex-row gap-6 items-center">
            
            {/* Visual Selfie with bounding overlays */}
            <div className="relative w-64 h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 shrink-0">
              <img 
                src={report.face_image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"} 
                alt="Epidermal Coordinates Mapping" 
                className="w-full h-full object-cover select-none pointer-events-none"
              />
              
              {/* Plot Bounding Boxes */}
              {regions.map((reg, idx) => (
                <div 
                  key={idx}
                  className={`absolute border-2 rounded shadow-glow group/box transition-transform hover:scale-105 duration-200 ${
                    reg.issue.includes("Acne") ? "border-rose-500" :
                    reg.issue.includes("hyperpigmentation") ? "border-brand-accent" : "border-amber-500"
                  }`}
                  style={{
                    left: `${reg.x * 100}%`,
                    top: `${reg.y * 100}%`,
                    width: `${reg.width * 100}%`,
                    height: `${reg.height * 100}%`
                  }}
                >
                  {/* Floating tag label accuracy indicator */}
                  <span className={`absolute -top-4.5 left-0 text-[7px] text-white px-1 py-0.5 rounded font-bold uppercase whitespace-nowrap leading-none ${
                    reg.issue.includes("Acne") ? "bg-rose-500" :
                    reg.issue.includes("hyperpigmentation") ? "bg-brand-accent text-slate-900" : "bg-amber-500"
                  }`}>
                    {reg.label}: {Math.round(reg.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>

            {/* List coordinates analysis */}
            <div className="flex-1 space-y-3 w-full">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Computerized Coordinates Audit Logs</p>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {regions.map((reg, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{reg.label}</p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">Symptom classification: {reg.issue}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block text-[8px] font-extrabold px-2 py-0.5 rounded-lg mb-1 leading-none uppercase ${
                        reg.severity === "High" ? "bg-rose-500/10 text-rose-500" :
                        reg.severity === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {reg.severity} Severity
                      </span>
                      <p className="text-[9px] text-slate-400 font-semibold leading-none">Accuracy: {Math.round(reg.confidence * 100)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. Skincare Morning/Night Clinical Routine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Morning AM */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 leading-none flex items-center gap-1.5">
            <Sun className="w-4.5 h-4.5 text-amber-500 animate-spin" style={{ animationDuration: '30s' }} /> Morning (AM) Regimen
          </h3>
          <div className="space-y-4">
            {routine.morning.map((step) => (
              <div key={step.step} className="flex gap-4 items-start pb-4 border-b border-slate-100 dark:border-slate-800 last:border-none last:pb-0">
                <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-600 dark:bg-slate-800 dark:text-brand-accent flex items-center justify-center text-xs font-extrabold shrink-0">
                  {step.step}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{step.product_type}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Active: {step.active_ingredient}</p>
                  <p className="text-[9px] text-brand-500 font-bold mt-1 uppercase">Purpose: {step.purpose}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Night PM */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 leading-none flex items-center gap-1.5">
            <Moon className="w-4.5 h-4.5 text-indigo-500 animate-float" /> Night (PM) Regimen
          </h3>
          <div className="space-y-4">
            {routine.night.map((step) => (
              <div key={step.step} className="flex gap-4 items-start pb-4 border-b border-slate-100 dark:border-slate-800 last:border-none last:pb-0">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-slate-800 dark:text-brand-accent flex items-center justify-center text-xs font-extrabold shrink-0">
                  {step.step}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{step.product_type}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Active: {step.active_ingredient}</p>
                  <p className="text-[9px] text-indigo-500 font-bold mt-1 uppercase">Purpose: {step.purpose}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Recommended Ingredients and weather tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Ingredients Grid */}
        <div className="md:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Targeted Active Molecules</h3>
          
          <div className="grid grid-cols-2 gap-3.5">
            {recommended_ingredients.map((ing, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0"></div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-none">{ing}</p>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal font-semibold">Recommended by SkinSense AI engine to fade symptoms.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ambient Climate tip */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light flex flex-col justify-center">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-3">Seasonal Climate Alert</span>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs leading-relaxed font-semibold">
            {weather_suggestion}
          </div>
        </div>

      </div>

      {/* 6. Lifestyle & Dietary clinical advices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Dietary cards */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none flex items-center gap-1.5">
            <Apple className="w-4.5 h-4.5 text-emerald-500" /> Dietary Advices
          </h3>
          <div className="space-y-3">
            {diet_tips.map((tip, idx) => (
              <div key={idx} className="flex gap-2.5 items-start text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-1.5"></div>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lifestyle card */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none flex items-center gap-1.5">
            <Info className="w-4.5 h-4.5 text-brand-500" /> Lifestyle Practices
          </h3>
          <div className="space-y-3">
            {lifestyle_tips.map((tip, idx) => (
              <div key={idx} className="flex gap-2.5 items-start text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0 mt-1.5"></div>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
