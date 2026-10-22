import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function CTA() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <section
      id="contact"
      className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-16 text-center px-6"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
          {t('cta.title')}
        </h2>
        <p className="text-emerald-100 text-base sm:text-lg">
          {t('cta.subtitle')}
        </p>
        <div className="pt-4">
          <button 
            onClick={() => navigate('/video-consultation')}
            className="px-8 py-4 bg-white text-teal-900 font-extrabold text-sm sm:text-base rounded-2xl shadow-xl hover:bg-emerald-50 transition-all transform hover:scale-105"
          >
            {t('cta.button')} ➔
          </button>
        </div>
      </div>
    </section>
  );
}

