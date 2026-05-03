import React, { useRef } from 'react'
import { useI18n } from '../context/I18nContext'

export default function Hero() {
  const { t } = useI18n();
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
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative max-w-6xl mx-auto px-6 py-16 text-center z-20">
        <p className="text-white text-sm font-semibold uppercase">
          {t('hero.kicker')}
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-white">
          {t('hero.title')}
        </h1>
        <p className="mt-6 text-white max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>
      </div>
    </section>
  );
}