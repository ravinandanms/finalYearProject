import React from "react";
import { SERVICES } from "../data/services";
import { useI18n } from "../context/I18nContext";

export default function Services({ 
  onAiClick, 
  onDietClick, 
  onPharmacyClick, 
  onVideoConsultationClick, 
  onMedicalRecordsClick,
  onDoctorFinderClick 
}) {
  const { t } = useI18n();
  return (
    <section id="services" className="max-w-6xl mx-auto px-6 py-12">
      <span className="block text-2xl md:text-3xl text-slate-700 font-bold mb-8 text-center">
        {t('services.title')}
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {SERVICES.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-105 overflow-hidden cursor-pointer group border border-slate-100 flex flex-col"
            onClick={() => {
              if (s.title === "Find Doctors & Hospitals" && onDoctorFinderClick) onDoctorFinderClick();
              else if (s.title === "Ai Symptoms Checker" && onAiClick) onAiClick();
              else if (s.title === "Diet Planner" && onDietClick) onDietClick();
              else if (s.title === "Pharmacy Locator" && onPharmacyClick) onPharmacyClick();
              else if (s.title === "Video Consultation" && onVideoConsultationClick) onVideoConsultationClick();
              else if (s.title === "Medical Records" && onMedicalRecordsClick) onMedicalRecordsClick();
              else if (s.title === "Find Doctors & Hospitals") window.location.href = '/doctor-finder';
            }}
          >
            {/* Image */}
            <div className="h-56 w-full group-hover:ring-4 group-hover:ring-teal-300 transition-all duration-300 overflow-hidden">
              <img
                src={s.img}
                alt={s.title}
                className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-95 transition-all duration-300"
              />
            </div>
            {/* Text */}
            <div className="p-5 text-center flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-teal-600 transition-colors duration-300">
                  {s.title}
                </h3>
                {s.subtitle && (
                  <p className="text-xs text-slate-500 mt-1.5 group-hover:text-slate-700 transition-colors duration-300">
                    {s.subtitle}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center text-xs font-semibold text-teal-600 group-hover:text-teal-700 gap-1">
                <span>Explore Service</span>
                <span>➔</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}