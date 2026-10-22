import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';

export default function Hero() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const videoUrl = "https://res.cloudinary.com/dfx3jsxnf/video/upload/v1777807194/heroVid1-CuYqXOhX_n6y6pk.mp4";

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={videoUrl}
      />
      <div className="absolute inset-0 bg-black/65 z-10"></div>
      <div className="relative max-w-6xl mx-auto px-6 py-16 text-center z-20 space-y-6">
        <p className="text-teal-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
          {t('hero.kicker') || "AI-POWERED TELEHEALTH & LOCAL CLINICAL CARE"}
        </p>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
          {t('hero.title') || "Accessible Healthcare for Everyone, Everywhere"}
        </h1>
        <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto">
          {t('hero.subtitle') || "Diagnose symptoms with AI, get specialist recommendations, and discover budget-friendly to premium hospitals and real doctors in your locality."}
        </p>

        {/* Hero Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate('/ai-symptom-checker')}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-transform transform hover:scale-105 text-sm flex items-center gap-2"
          >
            <span>🤖 {t('hero.cta.symptom')}</span>
            <span>➔</span>
          </button>
          <button
            onClick={() => navigate('/doctor-finder')}
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 font-semibold px-6 py-3 rounded-xl shadow-lg transition-transform transform hover:scale-105 text-sm flex items-center gap-2"
          >
            <span>🏥 {t('hero.cta.find')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}