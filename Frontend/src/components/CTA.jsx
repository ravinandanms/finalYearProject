import React from "react";
import { useI18n } from "../context/I18nContext";
export default function CTA() {
  const { t } = useI18n();
  return (
    <section
      id="contact"
      className="bg-green-600 text-white py-12 text-center px-6"
    >
      <h2 className="text-2xl md:text-3xl font-semibold">
        {t('cta.title')}
      </h2>
      <p className="mt-3 text-lg">
        {t('cta.subtitle')}
      </p>
      <button className="mt-6 px-6 py-3 bg-white text-green-700 font-semibold rounded-lg shadow hover:bg-gray-100">
        {t('cta.button')}
      </button>
    </section>
  );
}
