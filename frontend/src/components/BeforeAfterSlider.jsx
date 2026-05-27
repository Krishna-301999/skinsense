import React, { useState, useRef } from 'react'
import { Sparkles, Info } from 'lucide-react'

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) { // Mouse is pressed
      handleMove(e.clientX);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-glass-light dark:shadow-glass-dark font-sans select-none relative overflow-hidden">
      
      {/* Title */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 leading-none">
            <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" /> Clinical Before vs After
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5 block">Visualizing active treatment progress</span>
        </div>
        <div className="text-[10px] bg-brand-500/10 text-brand-600 px-2 py-0.5 rounded-lg font-bold">14-Day Cycle</div>
      </div>

      {/* Slider Canvas Container */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="flex-1 relative w-full h-[220px] rounded-2xl overflow-hidden cursor-ew-resize border border-slate-200 dark:border-slate-800"
      >
        {/* 'After' glowing healthy face image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop" 
            alt="Glowing Skin (After)" 
            className="w-full h-full object-cover select-none pointer-events-none filter brightness-105 saturate-105"
          />
          <div className="absolute bottom-3 right-3 bg-brand-accent/90 text-slate-950 font-bold text-[9px] px-2 py-0.5 rounded-md shadow-md backdrop-blur-sm tracking-wider uppercase">
            After: Hydrated & Radiant
          </div>
        </div>

        {/* 'Before' dry/blemished face image (clipped by slider position) */}
        <div 
          className="absolute inset-0 h-full overflow-hidden" 
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop" 
            alt="Blemished Skin (Before)" 
            className="absolute top-0 left-0 w-full h-full object-cover select-none pointer-events-none filter sepia-[0.25] saturate-[0.8] contrast-[0.9]"
            style={{ width: containerRef.current ? containerRef.current.offsetWidth : 350 }}
          />
          {/* Subtle acne/pigmentation overlays on the 'Before' view */}
          <div className="absolute top-[48%] left-[25%] w-3 h-3 bg-rose-500/35 border border-rose-500/25 rounded-full blur-[2px]"></div>
          <div className="absolute top-[52%] left-[62%] w-5 h-5 bg-rose-500/20 border border-rose-500/10 rounded-full blur-[3px]"></div>
          
          <div className="absolute bottom-3 left-3 bg-rose-500/90 text-white font-bold text-[9px] px-2 py-0.5 rounded-md shadow-md backdrop-blur-sm tracking-wider uppercase">
            Before: Active Redness
          </div>
        </div>

        {/* Sliding Vertical Bar Divider */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white/90 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Center Handle Knob */}
          <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xl flex items-center justify-center flex-col gap-0.5 text-slate-500">
            <div className="flex gap-0.5">
              <span className="w-0.5 h-2 bg-brand-500 rounded-full"></span>
              <span className="w-0.5 h-2 bg-brand-500 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Legend */}
      <div className="mt-3.5 flex gap-1.5 items-start bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
          Drag the slider left and right to compare skin texture before and after completing the daily custom morning/night regimens.
        </p>
      </div>

    </div>
  )
}
