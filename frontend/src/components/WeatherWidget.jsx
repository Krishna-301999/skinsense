import React, { useState } from 'react'
import { Sun, CloudRain, ShieldAlert, Wind, Thermometer, Droplet } from 'lucide-react'

export default function WeatherWidget() {
  // Pre-seed a premium localized medical weather state
  const [weather] = useState({
    temp: 24,
    humidity: 78,
    uvIndex: 8,
    condition: "High Humidity"
  });

  const getSkincareAdvice = () => {
    if (weather.uvIndex >= 7) {
      return {
        title: "UV Risk Level: Extreme",
        message: "Melanin triggers are highly active. Generously apply mineral zinc oxide SPF 50. Reapply every 120 minutes.",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
      };
    } else if (weather.humidity >= 70) {
      return {
        title: "High Atmospheric Humidity",
        message: "Sebum glands will over-excrete oil. Avoid greasy moisturizers. Use ultralight weight gel formulations.",
        color: "text-teal-500 bg-teal-500/10 border-teal-500/20"
      };
    } else {
      return {
        title: "Low Humidity Warning",
        message: "Ambient dry air will pull cellular hydration. Seal skin with ceramides and Hyaluronic Acid.",
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
      };
    }
  };

  const advice = getSkincareAdvice();

  return (
    <div className="flex flex-col bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-glass-light dark:shadow-glass-dark font-sans relative overflow-hidden h-full select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-none">Contextual Weather Suggestions</h3>
          <span className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5 block">Adapting routine to ambient climate</span>
        </div>
        <CloudRain className="w-5 h-5 text-brand-accent animate-float" />
      </div>

      {/* Weather Telemetry Matrix */}
      <div className="grid grid-cols-3 gap-2 mb-4 mt-2">
        <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-900 rounded-xl p-2 flex flex-col items-center justify-center">
          <Thermometer className="w-4 h-4 text-slate-400 mb-1" />
          <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Temp</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">{weather.temp}°C</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-900 rounded-xl p-2 flex flex-col items-center justify-center">
          <Droplet className="w-4 h-4 text-brand-500 mb-1" />
          <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Humidity</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">{weather.humidity}%</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-900 rounded-xl p-2 flex flex-col items-center justify-center">
          <Sun className="w-4 h-4 text-amber-500 mb-1" />
          <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">UV Index</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">{weather.uvIndex} (High)</span>
        </div>
      </div>

      {/* Dynamic Skincare Advice Banner */}
      <div className={`flex-1 flex gap-2.5 items-start p-3 rounded-2xl border text-xs leading-relaxed font-semibold ${advice.color}`}>
        <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="font-extrabold leading-none mb-1">{advice.title}</p>
          <p className="opacity-90 leading-normal">{advice.message}</p>
        </div>
      </div>

    </div>
  )
}
