import React from "react";
import { useI18n } from "../context/I18nContext";

export default function About() {
  const { t } = useI18n();

  const STEPS = [
    {
      num: "01",
      title: t("about.step1.title"),
      desc: t("about.step1.desc"),
      img:
        "https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=1200&auto=format&fit=crop",
      badgeBg: "bg-green-500",
    },
    {
      num: "02",
      title: t("about.step2.title"),
      desc: t("about.step2.desc"),
      img:
        "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1200&auto=format&fit=crop",
      badgeBg: "bg-blue-600",
    },
    {
      num: "03",
      title: t("about.step3.title"),
      desc: t("about.step3.desc"),
      img:
        "https://5.imimg.com/data5/SELLER/Default/2024/10/457360054/OA/BU/JR/13831983/medical-record-summarization-service-500x500.png",
      badgeBg: "bg-green-500",
    },
    {
      num: "04",
      title: t("about.step4.title"),
      desc: t("about.step4.desc"),
      img:
        "https://images.unsplash.com/photo-1512678080530-7760d81faba6?q=80&w=1200&auto=format&fit=crop",
      badgeBg: "bg-blue-600",
    },
  ];

  return (
    <section id="about" className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-center text-slate-800">{t("about.heading")}</h2>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {STEPS.map((s, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center"
          >
            <div className="relative w-56 h-56 rounded-full overflow-hidden shadow-md">
              <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
              <div className={`absolute -top-2 -right-2 ${s.badgeBg} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow`}>{s.num}</div>
            </div>
            <h3 className="mt-6 font-semibold text-lg text-slate-800">{s.title}</h3>
            <p className="mt-2 text-slate-500 text-sm leading-relaxed max-w-xs">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


