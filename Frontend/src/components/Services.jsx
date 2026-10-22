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

  const servicesData = [
    { 
      key: "finder",
      title: t("service.finder.title"),
      subtitle: t("service.finder.desc"),
      img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
      action: onDoctorFinderClick || (() => window.location.href = '/doctor-finder')
    },
    { 
      key: "ai",
      title: t("service.ai.title"),
      subtitle: t("service.ai.desc"),
      img: "https://cdn.prod.website-files.com/635637c5d13ee9bd2b5feb65/6838ca67ed668f6532f255bb_AI%20Virtual%20Assistant%20in%20Healthcare_%20Use%20Cases%20%26%20Examples%20in%202025.png",
      action: onAiClick
    },
    { 
      key: "video",
      title: t("service.video.title"),
      subtitle: t("service.video.desc"),
      img: "https://t3.ftcdn.net/jpg/06/86/52/82/360_F_686528205_UJaEtlon1cWvwIUX0NL13uNOIhPW8Li2.jpg",
      action: onVideoConsultationClick
    },
    { 
      key: "pharmacy",
      title: t("service.pharmacy.title"),
      subtitle: t("service.pharmacy.desc"),
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRB7aoLYROje8-HRV3leHl7TyLAMxParWTbMQ&s",
      action: onPharmacyClick
    },
    { 
      key: "records",
      title: t("service.records.title"),
      subtitle: t("service.records.desc"),
      img: "https://5.imimg.com/data5/SELLER/Default/2024/10/457360054/OA/BU/JR/13831983/medical-record-summarization-service-500x500.png",
      action: onMedicalRecordsClick
    },
    { 
      key: "diet",
      title: t("service.diet.title"),
      subtitle: t("service.diet.desc"),
      img: "https://images.squarespace-cdn.com/content/v1/612d4825ee7c3b7ba3e215b7/1667458982443-N6XGU1PU7335QEMVUP7M/Delicious+food.png",
      action: onDietClick
    },
  ];

  return (
    <section id="services" className="max-w-6xl mx-auto px-6 py-14">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
          {t('services.title')}
        </h2>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          {t('services.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {servicesData.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden cursor-pointer group border border-slate-100 flex flex-col"
            onClick={s.action}
          >
            {/* Image */}
            <div className="h-52 w-full group-hover:ring-4 group-hover:ring-teal-300 transition-all duration-300 overflow-hidden relative">
              <img
                src={s.img}
                alt={s.title}
                className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-95 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            {/* Text */}
            <div className="p-5 text-center flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-teal-600 transition-colors duration-300">
                  {s.title}
                </h3>
                {s.subtitle && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
                    {s.subtitle}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center text-xs font-bold text-teal-600 group-hover:text-teal-700 gap-1.5">
                <span>{t('services.explore')}</span>
                <span>➔</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}