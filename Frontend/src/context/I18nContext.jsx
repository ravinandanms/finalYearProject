import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const I18nContext = createContext(null);

const translations = {
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.doctors": "Doctors",
    "nav.contact": "Contact",
    "brand.name": "Teleseva",
    "brand.tag": "Health & Medical",
    "profile.logout": "Logout",
    "hero.kicker": "Our Services",
    "hero.title": "Our TeleSeva Specialties",
    "hero.subtitle": "We provide expert healthcare services across multiple specialties.",
    "services.title": "Technical Service",
    "doctors.title": "Meet Our Doctors",
    "cta.title": "Ready to Connect with a Doctor?",
    "cta.subtitle": "Get expert advice, prescriptions, and personalized care today.",
    "cta.button": "Book an Appointment",
    "footer.rights": "All rights reserved.",
    "footer.built": "Built with ❤️ for better healthcare access.",
    "auth.signIn": "Sign In",
    "auth.signUpRegister": "Sign Up / Register",
    "auth.newHere": "New here?",
    "auth.signUpLink": "Sign Up / Register",
    "auth.forgot": "Forgot password?",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.signInCta": "Sign In",
    "auth.registerCta": "Register",
    "auth.name": "Name",
    "auth.phone": "Phone number",
    "auth.gender": "Gender",
    "auth.age": "Age",
    "auth.gender.male": "Male",
    "auth.gender.female": "Female",
    "auth.gender.other": "Other",
    "auth.placeholder.phone": "e.g. 9876543210",
    "auth.placeholder.name": "Your name",
    "auth.placeholder.email": "you@example.com",
    "auth.placeholder.password": "Create a strong password",
    "auth.reset.title": "Reset password",
    "auth.reset.sendOtp": "Send OTP",
    "auth.reset.verify": "Verify & Continue",
    "auth.otp": "Enter OTP",
    "about.heading": "How We Work",
    "about.step1.title": "Patient Registration",
    "about.step1.desc": "We welcome patients and ensure a comfortable onboarding experience.",
    "about.step2.title": "Check-Ups",
    "about.step2.desc": "Consult with healthcare professionals for a thorough evaluation.",
    "about.step3.title": "Get Report",
    "about.step3.desc": "Review diagnostic results and integrate them into the diagnosis.",
    "about.step4.title": "Ongoing Care",
    "about.step4.desc": "We ensure continuity of care beyond the initial visit.",
  },
  hi: {
    "nav.home": "होम",
    "nav.about": "हमारे बारे में",
    "nav.services": "सेवाएँ",
    "nav.doctors": "डॉक्टर्स",
    "nav.contact": "संपर्क",
    "brand.name": "टेलीसेवा",
    "brand.tag": "स्वास्थ्य और चिकित्सा",
    "profile.logout": "लॉग आउट",
    "hero.kicker": "हमारी सेवाएँ",
    "hero.title": "हमारी टेलीसेवा विशेषताएँ",
    "hero.subtitle": "हम कई विशेषताओं में विशेषज्ञ स्वास्थ्य सेवाएँ प्रदान करते हैं।",
    "services.title": "तकनीकी सेवा",
    "doctors.title": "हमारे डॉक्टर्स से मिलें",
    "cta.title": "डॉक्टर से जुड़ने के लिए तैयार?",
    "cta.subtitle": "आज ही विशेषज्ञ सलाह, प्रिस्क्रिप्शन और व्यक्तिगत देखभाल प्राप्त करें।",
    "cta.button": "अपॉइंटमेंट बुक करें",
    "footer.rights": "सर्वाधिकार सुरक्षित।",
    "footer.built": "बेहतर स्वास्थ्य सेवा पहुँच के लिए ❤️ से निर्मित।",
    "auth.signIn": "साइन इन",
    "auth.signUpRegister": "साइन अप / रजिस्टर",
    "auth.newHere": "नए हैं?",
    "auth.signUpLink": "साइन अप / रजिस्टर",
    "auth.forgot": "पासवर्ड भूल गए?",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.signInCta": "साइन इन",
    "auth.registerCta": "रजिस्टर",
    "auth.name": "नाम",
    "auth.phone": "फोन नंबर",
    "auth.gender": "लिंग",
    "auth.age": "आयु",
    "auth.gender.male": "पुरुष",
    "auth.gender.female": "महिला",
    "auth.gender.other": "अन्य",
    "auth.placeholder.phone": "उदा. 9876543210",
    "auth.placeholder.name": "आपका नाम",
    "auth.placeholder.email": "you@example.com",
    "auth.placeholder.password": "मजबूत पासवर्ड बनाएँ",
    "auth.reset.title": "पासवर्ड रीसेट",
    "auth.reset.sendOtp": "OTP भेजें",
    "auth.reset.verify": "सत्यापित करें और आगे बढ़ें",
    "auth.otp": "OTP दर्ज करें",
    "about.heading": "हम कैसे काम करते हैं",
    "about.step1.title": "मरीज पंजीकरण",
    "about.step1.desc": "हम मरीजों का स्वागत करते हैं और आरामदायक अनुभव सुनिश्चित करते हैं।",
    "about.step2.title": "जांच",
    "about.step2.desc": "स्वास्थ्य विशेषज्ञ विस्तृत मूल्यांकन करते हैं।",
    "about.step3.title": "रिपोर्ट प्राप्त करें",
    "about.step3.desc": "डायग्नोस्टिक परिणामों का विश्लेषण कर निदान में शामिल किया जाता है।",
    "about.step4.title": "निरंतर देखभाल",
    "about.step4.desc": "हम प्रारंभिक विज़िट के बाद भी निरंतर देखभाल सुनिश्चित करते हैं।",
  },
  pa: {
    "nav.home": "ਘਰ",
    "nav.about": "ਸਾਡੇ ਬਾਰੇ",
    "nav.services": "ਸੇਵਾਵਾਂ",
    "nav.doctors": "ਡਾਕਟਰ",
    "nav.contact": "ਸੰਪਰਕ",
    "brand.name": "ਟੈਲੀਸੇਵਾ",
    "brand.tag": "ਹੈਲਥ ਅਤੇ ਮੈਡਿਕਲ",
    "profile.logout": "ਲਾੱਗ ਆਊਟ",
    "hero.kicker": "ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ",
    "hero.title": "ਸਾਡੀਆਂ ਟੈਲੀਸੇਵਾ ਖਾਸੀਅਤਾਂ",
    "hero.subtitle": "ਅਸੀਂ ਕਈ ਖੇਤਰਾਂ ਵਿੱਚ ਮਾਹਿਰ ਹੇਲਥਕੇਅਰ ਸੇਵਾਵਾਂ ਦਿੰਦੇ ਹਾਂ।",
    "services.title": "ਟੈਕਨਿਕਲ ਸੇਵਾ",
    "doctors.title": "ਸਾਡੇ ਡਾਕਟਰਾਂ ਨਾਲ ਮਿਲੋ",
    "cta.title": "ਡਾਕਟਰ ਨਾਲ ਜੁੜਨ ਲਈ ਤਿਆਰ?",
    "cta.subtitle": "ਅੱਜ ਹੀ ਮਾਹਿਰ ਸਲਾਹ, ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਅਤੇ ਨਿੱਜੀ ਦੇਖਭਾਲ ਹਾਸਲ ਕਰੋ।",
    "cta.button": "ਐਪੌਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ",
    "footer.rights": "ਸਾਰੇ ਅਧਿਕਾਰ ਰਹਿਤ।",
    "footer.built": "ਵਧੀਆ ਹੇਲਥਕੇਅਰ ਪਹੁੰਚ ਲਈ ❤️ ਨਾਲ ਬਣਾਇਆ।",
    "auth.signIn": "ਸਾਇਨ ਇਨ",
    "auth.signUpRegister": "ਸਾਇਨ ਅੱਪ / ਰਜਿਸਟਰ",
    "auth.newHere": "ਨਵੇਂ ਹੋ?",
    "auth.signUpLink": "ਸਾਇਨ ਅੱਪ / ਰਜਿਸਟਰ",
    "auth.forgot": "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?",
    "auth.email": "ਈਮੇਲ",
    "auth.password": "ਪਾਸਵਰਡ",
    "auth.signInCta": "ਸਾਇਨ ਇਨ",
    "auth.registerCta": "ਰਜਿਸਟਰ",
    "auth.name": "ਨਾਮ",
    "auth.phone": "ਫ਼ੋਨ ਨੰਬਰ",
    "auth.gender": "ਲਿੰਗ",
    "auth.age": "ਉਮਰ",
    "auth.gender.male": "ਪੁਰਸ਼",
    "auth.gender.female": "ਸਤ੍ਰੀ",
    "auth.gender.other": "ਹੋਰ",
    "auth.placeholder.phone": "ਜਿਵੇਂ 9876543210",
    "auth.placeholder.name": "ਤੁਹਾਡਾ ਨਾਮ",
    "auth.placeholder.email": "you@example.com",
    "auth.placeholder.password": "ਮਜ਼ਬੂਤ ਪਾਸਵਰਡ ਬਣਾਓ",
    "auth.reset.title": "ਪਾਸਵਰਡ ਰੀਸੈੱਟ",
    "auth.reset.sendOtp": "OTP ਭੇਜੋ",
    "auth.reset.verify": "ਤਸਦੀਕ ਕਰੋ ਅਤੇ ਜਾਰੀ ਰੱਖੋ",
    "auth.otp": "OTP ਦਾਖ਼ਲ ਕਰੋ",
    "about.heading": "ਅਸੀਂ ਕਿਵੇਂ ਕੰਮ ਕਰਦੇ ਹਾਂ",
    "about.step1.title": "ਮਰੀਜ਼ ਰਜਿਸਟ੍ਰੇਸ਼ਨ",
    "about.step1.desc": "ਅਸੀਂ ਮਰੀਜ਼ਾਂ ਦਾ ਸਵਾਗਤ ਕਰਦੇ ਹਾਂ ਅਤੇ ਆਰਾਮਦਾਇਕ ਤਜਰਬਾ ਯਕੀਨੀ ਕਰਦੇ ਹਾਂ।",
    "about.step2.title": "ਜਾਂਚ",
    "about.step2.desc": "ਹੈਲਥਕੇਅਰ ਪ੍ਰੋਫੈਸ਼ਨਲ ਵੱਲੋਂ ਵਿਸਥਾਰ ਨਾਲ ਮੁਲਾਂਕਣ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    "about.step3.title": "ਰਿਪੋਰਟ ਪ੍ਰਾਪਤ ਕਰੋ",
    "about.step3.desc": "ਟੈਸਟ ਨਤੀਜਿਆਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਕੇ ਨਿਦਾਨ ਵਿੱਚ ਸ਼ਾਮਲ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    "about.step4.title": "ਨਿਰੰਤਰ ਦੇਖਭਾਲ",
    "about.step4.desc": "ਅਸੀਂ ਪਹਿਲੇ ਦੌਰੇ ਤੋਂ ਬਾਅਦ ਵੀ ਲਗਾਤਾਰ ਦੇਖਭਾਲ ਯਕੀਨੀ ਕਰਦੇ ਹਾਂ।",
  },
};

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("teleseva_lang");
    if (stored) setLang(stored);
  }, []);

  function changeLanguage(next) {
    setLang(next);
    try {
      localStorage.setItem("teleseva_lang", next);
    } catch (_) {}
  }

  function t(key) {
    const table = translations[lang] || translations.en;
    return table[key] || translations.en[key] || key;
  }

  const value = useMemo(() => ({ lang, setLang: changeLanguage, t }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}


