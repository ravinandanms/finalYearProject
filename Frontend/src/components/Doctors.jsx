import React from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { DOCTORS } from "../data/doctors";
import { useI18n } from "../context/I18nContext";

export default function Doctors() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <section id="doctors" className="max-w-6xl mx-auto px-6 py-14">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
          {t('doctors.title')}
        </h2>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          {t('doctors.subtitle')}
        </p>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="pb-12"
      >
        {DOCTORS.map((doc, idx) => (
          <SwiperSlide key={idx}>
            <div className="bg-white shadow-md hover:shadow-xl rounded-3xl overflow-hidden border border-slate-100 transition-all duration-300 flex flex-col h-full">
              <div className="h-60 overflow-hidden relative">
                <img
                  src={doc.img}
                  alt={doc.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  ✓ Available
                </span>
              </div>
              <div className="p-5 text-center flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-semibold text-teal-700">{doc.title}</p>
                  <p className="text-xs text-slate-400 mt-1">Verified Medical Practitioner</p>
                </div>

                <button
                  onClick={() => navigate('/video-consultation')}
                  className="w-full bg-slate-900 hover:bg-teal-600 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>📹 {t('doctors.bookConsult')}</span>
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}