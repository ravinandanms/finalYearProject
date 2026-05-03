import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { DOCTORS } from "../data/doctors";
import { useI18n } from "../context/I18nContext";

export default function Doctors() {
  const { t } = useI18n();
  return (
    <section id="doctors" className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold text-center text-slate-700 mb-8">
        {t('doctors.title')}
      </h2>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {DOCTORS.map((doc, idx) => (
          <SwiperSlide key={idx}>
            <div className="bg-white shadow-md rounded-xl overflow-hidden">
              <img
                src={doc.img}
                alt={doc.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg text-slate-800">
                  {doc.name}
                </h3>
                <p className="text-sm text-slate-500">{doc.title}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}