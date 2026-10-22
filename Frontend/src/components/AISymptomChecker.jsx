import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function AISymptomChecker({ onBackHome }) {
  const navigate = useNavigate();
  const { t, isKannada } = useI18n();

  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: isKannada 
        ? "ನಮಸ್ಕಾರ 👋 ನಾನು ನಿಮ್ಮ ಟೆಲಿಸೇವಾ AI ವೈದ್ಯಕೀಯ ಸಹಾಯಕ. ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು (ಉದಾ: ಎದೆನೋವು, ಜ್ವರ, ಚರ್ಮದ ದದ್ದು, ಕೀಲು ನೋವು) ವಿವರವಾಗಿ ತಿಳಿಸಿ. ನಾನು ಅವುಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ, ಸೂಕ್ತ ತಜ್ಞ ವೈದ್ಯರು ಹಾಗೂ ಸಮೀಪದ ಆಸ್ಪತ್ರೆಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ."
        : "Hello 👋 I'm your AI Medical Assistant. Please describe your symptoms in detail (e.g. chest pain, severe skin rash, joint swelling, persistent fever), and I'll analyze them, suggest likely causes, and help you find the right specialist doctors and hospitals nearby." 
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIndexes, setExpandedIndexes] = useState({});
  const [lastUserSymptoms, setLastUserSymptoms] = useState("");

  const toggleExpand = (idx) => {
    setExpandedIndexes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const sendMessage = async (textToSend) => {
    if (isLoading) return;
    const userText = (textToSend || input).trim();
    if (!userText) return;

    setInput("");
    setLastUserSymptoms(userText);

    const userMsg = { sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);

    setIsLoading(true);
    const typingMsg = { 
      sender: "bot", 
      text: isKannada 
        ? "ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ ಮತ್ತು ತಜ್ಞ ವೈದ್ಯರ ವಿವರಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ..."
        : "Analyzing your symptoms and determining specialist care requirements..." 
    };
    const typingIndex = messages.length + 1;
    setMessages((prev) => [...prev, typingMsg]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, context: { page: 'ai-symptom-checker', lang: isKannada ? 'kn' : 'en' } })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setMessages((prev) => {
        const next = [...prev];
        next[typingIndex] = { 
          sender: "bot", 
          text: data.reply,
          specialistRecommendation: data.specialistRecommendation,
          userQuery: userText
        };
        return next;
      });
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[typingIndex] = {
          sender: "bot",
          text: isKannada 
            ? "ಕ್ಷಮಿಸಿ, ಈ ಸಮಯದಲ್ಲಿ ವಿನಂತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
            : "Sorry, I couldn't process your request right now. Please check your connection and try again.",
        };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const MAX_CHARS = 500;

  const quickSymptoms = isKannada ? [
    "ಎದೆ ನೋವು ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ",
    "ನಿರಂತರ ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಮೈಕೈ ನೋವು",
    "ಚರ್ಮದ ಕೆಂಪು ದದ್ದು ಮತ್ತು ಅಲರ್ಜಿ",
    "ಕೀಲು ನೋವು ಮತ್ತು ಊತ",
    "ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ"
  ] : [
    "Chest pain & shortness of breath",
    "Persistent high fever & body ache",
    "Red itchy skin rash & allergy",
    "Severe knee & joint stiffness",
    "Severe headache & dizziness"
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-xs border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackHome}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-semibold text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('nav.back')}
              </button>
              <div className="border-l border-slate-200 pl-4">
                <h1 className="text-xl font-bold text-slate-800">{t('ai.symptomTitle')}</h1>
                <p className="text-xs text-slate-500">{t('ai.symptomSubtitle')}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/doctor-finder')}
              className="hidden sm:flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            >
              <span>🏥 {t('service.finder.title')}</span>
            </button>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 h-[calc(100vh-170px)] flex flex-col overflow-hidden">
          
          {/* Quick Symptoms Chips */}
          {messages.length <= 2 && (
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs flex items-center gap-2 overflow-x-auto">
              <span className="text-slate-500 font-semibold shrink-0">Common Symptoms:</span>
              {quickSymptoms.map((sym, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(sym)}
                  className="bg-white border border-slate-300 hover:border-teal-500 text-slate-700 hover:text-teal-700 px-2.5 py-1 rounded-full shrink-0 transition-colors shadow-2xs"
                >
                  {sym}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, i) => {
              const isUser = msg.sender === "user";
              const isLong = msg.text.length > MAX_CHARS;
              const isExpanded = !!expandedIndexes[i];
              const displayText = isLong && !isExpanded ? msg.text.slice(0, MAX_CHARS) + "…" : msg.text;
              const recommendation = msg.specialistRecommendation;

              return (
                <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[78%] shadow-xs ${
                    isUser 
                      ? "bg-teal-600 text-white rounded-br-xs" 
                      : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200"
                  }`}>
                    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{displayText}</div>
                    
                    {!isUser && isLong && (
                      <button
                        className="mt-2 text-xs text-teal-700 font-semibold hover:underline"
                        onClick={() => toggleExpand(i)}
                      >
                        {isExpanded ? "Show less" : "Show full explanation"}
                      </button>
                    )}
                  </div>

                  {/* Specialist & Hospital Recommendation Card underneath bot reply */}
                  {!isUser && recommendation && recommendation.specialty && (
                    <div className="mt-3 w-full max-w-[85%] sm:max-w-[78%] bg-gradient-to-r from-teal-900 to-slate-900 text-white p-4 rounded-2xl shadow-md border border-teal-500/30">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🩺</span>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
                              Recommended Care
                            </span>
                            <h4 className="font-bold text-sm sm:text-base text-white">
                              Consult a {recommendation.specialty}
                            </h4>
                          </div>
                        </div>
                        <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2.5 py-0.5 rounded-full font-medium">
                          Budget & Premium Options Available
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mb-3">
                        We can find real verified {recommendation.specialty} doctors, government hospitals, and super-specialty clinics near your location.
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => navigate('/doctor-finder', {
                            state: {
                              specialty: recommendation.specialty,
                              symptoms: msg.userQuery || lastUserSymptoms
                            }
                          })}
                          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <span>🏥 Find Nearby {recommendation.specialty}s & Hospitals</span>
                          <span>➔</span>
                        </button>
                        <button
                          onClick={() => navigate('/video-consultation')}
                          className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-2 rounded-xl transition-colors border border-slate-700"
                        >
                          📹 Online Video Consultation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-slate-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 font-medium"
                placeholder={t('ai.describe')}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 disabled:opacity-60 transition-colors font-bold text-sm flex items-center gap-2 shadow-xs"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('ai.analyzing')}</span>
                  </>
                ) : (
                  <span>{isKannada ? 'ಕಳುಹಿಸಿ' : 'Send'}</span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              {isKannada 
                ? 'ಟೆಲಿಸೇವಾ AI ಶೈಕ್ಷಣಿಕ ಸಹಾಯಕವಾಗಿದೆ. ವೈದ್ಯಕೀಯ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಾಗಿ ತಕ್ಷಣವೇ ಆಂಬ್ಯುಲೆನ್ಸ್ (108/112) ಗೆ ಕರೆ ಮಾಡಿ.'
                : 'TeleSeva AI is an educational assistant. For medical emergencies, call your local ambulance (108/112) immediately.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

