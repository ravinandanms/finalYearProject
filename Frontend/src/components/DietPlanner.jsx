import React, { useState } from "react";
import { useI18n } from "../context/I18nContext";

export default function DietPlanner({ onBackHome }) {
  const { t, isKannada } = useI18n();

  const [form, setForm] = useState({
    age: "",
    gender: "male",
    activity: "Sedentary",
    diet: "Veg",
  });
  const [goal, setGoal] = useState(isKannada ? "ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮತ್ತು ಚೈತನ್ಯ" : "General wellness");
  const [allergies, setAllergies] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState("");

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setPlan("");
    try {
      const prompt = `Can you create a structured, healthy diet and nutrition plan?
Language requirement: ${isKannada ? 'Kannada (ಕನ್ನಡ)' : 'English'}
Age: ${form.age}
Gender: ${form.gender}
Activity level: ${form.activity}
Diet preference: ${form.diet}
Health goal: ${goal || "General wellness"}
Allergies/avoid: ${allergies || "none"}
Please include breakfast, lunch, dinner, hydration tips, and local Indian food recommendations.`;
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: prompt, 
          context: { page: 'diet-planner', lang: isKannada ? 'kn' : 'en' } 
        })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      setPlan(data.reply);
    } catch (e) {
      setPlan(isKannada ? "ಕ್ಷಮಿಸಿ, ಆಹಾರ ಯೋಜನೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." : "Sorry, I couldn't generate a plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-xs border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
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
                <h1 className="text-xl font-bold text-slate-800">{t('ai.dietTitle')}</h1>
                <p className="text-xs text-slate-500">{t('ai.dietSubtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-8">
            
            {/* Form Section */}
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  {t('profile.personalInfo')}
                </h2>
                <p className="text-xs text-slate-500">
                  {isKannada ? 'ವೈಯಕ್ತಿಕ ಆಹಾರ ಯೋಜನೆ ಪಡೆಯಲು ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ' : 'Fill in your details to get a personalized diet & nutrition plan'}
                </p>
              </div>
              
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('auth.age')}</label>
                    <input 
                      type="number" 
                      required 
                      value={form.age} 
                      onChange={(e)=>update("age", e.target.value)} 
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                      placeholder="e.g. 28"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('auth.gender')}</label>
                    <select 
                      value={form.gender} 
                      onChange={(e)=>update("gender", e.target.value)} 
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="male">{t('auth.gender.male')}</option>
                      <option value="female">{t('auth.gender.female')}</option>
                      <option value="other">{t('auth.gender.other')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {isKannada ? 'ದೈಹಿಕ ಚಟುವಟಿಕೆ' : 'Activity Level'}
                    </label>
                    <select 
                      value={form.activity} 
                      onChange={(e)=>update("activity", e.target.value)} 
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="Sedentary">{isKannada ? 'ಕುಳಿತು ಕೆಲಸ (Sedentary)' : 'Sedentary'}</option>
                      <option value="Lightly active">{isKannada ? 'ಮಧ್ಯಮ ಚಟುವಟಿಕೆ' : 'Lightly active'}</option>
                      <option value="Active">{isKannada ? 'ಸಕ್ರಿಯ (Active)' : 'Active'}</option>
                      <option value="Very active">{isKannada ? 'ಅತ್ಯಂತ ಸಕ್ರಿಯ / ಕ್ರೀಡೆ' : 'Very active'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {isKannada ? 'ಆಹಾರ ಪದ್ಧತಿ' : 'Diet Preference'}
                    </label>
                    <select 
                      value={form.diet} 
                      onChange={(e)=>update("diet", e.target.value)} 
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="Veg">{isKannada ? 'ಸಸ್ಯಾಹಾರಿ (Veg)' : 'Vegetarian (Veg)'}</option>
                      <option value="Non-veg">{isKannada ? 'ಮಾಂಸಾಹಾರಿ (Non-Veg)' : 'Non-Vegetarian'}</option>
                      <option value="Vegan">{isKannada ? 'ವೀಗನ್ (Vegan)' : 'Vegan'}</option>
                      <option value="Eggetarian">{isKannada ? 'ಮೊಟ್ಟೆ ಮತ್ತು ಸಸ್ಯಹಾರ' : 'Eggetarian'}</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {isKannada ? 'ಆರೋಗ್ಯ ಗುರಿ (Health Goal)' : 'Health Goal'}
                  </label>
                  <input 
                    value={goal} 
                    onChange={(e)=>setGoal(e.target.value)} 
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium" 
                    placeholder="e.g. weight loss, sugar control, muscle gain"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {isKannada ? 'ಅಲರ್ಜಿ / ವರ್ಜ್ಯ ಆಹಾರ (Allergies)' : 'Allergies / Foods to Avoid'}
                  </label>
                  <input 
                    value={allergies} 
                    onChange={(e)=>setAllergies(e.target.value)} 
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium" 
                    placeholder="e.g. peanuts, dairy, gluten"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-emerald-600 text-white rounded-2xl py-3.5 font-bold hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-md text-sm" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>{isKannada ? 'ಆಹಾರ ಯೋಜನೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'Generating Diet Plan…'}</span>
                  ) : (
                    <span>{t('ai.generateDiet')}</span>
                  )}
                </button>
              </form>
            </div>

            {/* Results Section */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  {isKannada ? 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಆಹಾರ ಯೋಜನೆ' : 'Your Customized Diet Plan'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isKannada ? 'AI-ಆಧಾರಿತ ಸಮಗ್ರ ಪೌಷ್ಟಿಕಾಂಶ ಶಿಫಾರಸು' : 'AI-powered personalized nutrition and daily meal structure'}
                </p>
              </div>
              
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 h-[430px] overflow-y-auto">
                <div className="whitespace-pre-wrap text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  {plan ? (
                    <div className="space-y-2">
                      {plan.split('\n').map((line, index) => (
                        <div key={index} className={line.trim().startsWith('*') || line.trim().startsWith('#') ? 'font-bold text-slate-900 mt-2 text-sm' : ''}>
                          {line}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-6 space-y-2">
                      <span className="text-4xl">🥗</span>
                      <p className="text-sm font-bold text-slate-600">
                        {isKannada ? 'ಯಾವುದೇ ಆಹಾರ ಯೋಜನೆ ರಚನೆಯಾಗಿಲ್ಲ' : 'No plan generated yet'}
                      </p>
                      <p className="text-xs max-w-xs">
                        {isKannada ? 'ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ ಬಟನ್ ಒತ್ತಿ ನಿಮ್ಮ ಆಹಾರ ಯೋಜನೆ ಪಡೆಯಿರಿ' : 'Fill in your details and click "Generate Diet Plan" to begin'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
