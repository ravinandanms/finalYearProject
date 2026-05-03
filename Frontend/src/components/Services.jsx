import React from "react";
import { SERVICES } from "../data/services";
import { useI18n } from "../context/I18nContext";

export default function Services({ onAiClick, onDietClick, onPharmacyClick, onVideoConsultationClick, onMedicalRecordsClick }) {
  const { t } = useI18n();
  return (
    <section id="services" className="max-w-6xl mx-auto px-6 py-12">
      <span className="block text-2xl md:text-3xl text-slate-500 font-medium mt-2 text-center">
        {t('services.title')}
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {SERVICES.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-105 overflow-hidden cursor-pointer group"
            onClick={() => {
              if (s.title === "Ai Symptoms Checker") onAiClick();
              if (s.title === "Diet Planner") onDietClick();
              if (s.title === "Pharmacy Locator") onPharmacyClick();
              if (s.title === "Video Consultation") onVideoConsultationClick();
              if (s.title === "Medical Records") onMedicalRecordsClick();
            }}
          >
            {/* Image */}
            <div className="h-64 w-full group-hover:ring-4 group-hover:ring-green-300 transition-all duration-300">
              <img
                src={s.img}
                alt={s.title}
                className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
              />
            </div>
            {/* Text */}
            <div className="p-4 text-center">
              <h3 className="font-semibold text-xl text-slate-800 group-hover:text-green-600 transition-colors duration-300">
                {s.title}
              </h3>
              {s.subtitle && (
                <p className="text-sm text-slate-500 mt-2 group-hover:text-slate-700 transition-colors duration-300">{s.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}