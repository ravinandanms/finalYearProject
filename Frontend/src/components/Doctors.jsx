import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { DOCTORS } from "../data/doctors";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Doctors() {
  const { t, isKannada } = useI18n();
  const { socket } = useAuth();
  const navigate = useNavigate();
  const [onlineDoctorIds, setOnlineDoctorIds] = useState([]);
  const [doctorList, setDoctorList] = useState(DOCTORS);

  useEffect(() => {
    // Attempt to fetch real registered doctors from DB
    const fetchRealDoctors = async () => {
      try {
        const res = await axios.get('/api/users/doctors');
        if (res.data && res.data.length > 0) {
          // Merge registered DB doctors with fallback image assets if needed
          const merged = res.data.map((doc, idx) => ({
            ...doc,
            title: doc.specialization || "General Physician",
            img: doc.profilePicture || DOCTORS[idx % DOCTORS.length]?.img || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800"
          }));
          setDoctorList(merged);
        }
      } catch (err) {
        console.warn("Using sample doctors for slider:", err.message);
      }
    };
    fetchRealDoctors();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleOnlineDoctors = (list) => {
      if (Array.isArray(list)) {
        setOnlineDoctorIds(list.map(String));
      }
    };
    socket.on('online_doctors_list', handleOnlineDoctors);
    socket.emit('get_online_doctors');

    const interval = setInterval(() => {
      socket.emit('get_online_doctors');
    }, 4000);

    return () => {
      socket.off('online_doctors_list', handleOnlineDoctors);
      clearInterval(interval);
    };
  }, [socket]);

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
        {doctorList.map((doc, idx) => {
          const isOnline = onlineDoctorIds.some(id => String(id) === String(doc._id || doc.id));

          return (
            <SwiperSlide key={doc._id || idx}>
              <div className="bg-white shadow-md hover:shadow-xl rounded-3xl overflow-hidden border border-slate-100 transition-all duration-300 flex flex-col h-full">
                <div className="h-60 overflow-hidden relative">
                  <img
                    src={doc.img}
                    alt={doc.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {isOnline ? (
                    <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      <span>✓ {isKannada ? 'ಲಭ್ಯವಿದೆ' : 'Online & Ready'}</span>
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>{isKannada ? 'ಆಫ್‌ಲೈನ್‌' : 'Offline'}</span>
                    </span>
                  )}
                </div>
                <div className="p-5 text-center flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700">{doc.title || doc.specialization}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Fee: ₹{doc.consultationFee || 500} • Verified Practitioner
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/video-consultation')}
                    className={`w-full font-bold py-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 ${
                      isOnline 
                        ? 'bg-slate-900 hover:bg-emerald-600 text-white cursor-pointer'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                    }`}
                  >
                    <span>📹 {isOnline ? t('doctors.bookConsult') : (isKannada ? 'ವೈದ್ಯರ ವಿವರ ನೋಡಿ' : 'Check Availability')}</span>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}