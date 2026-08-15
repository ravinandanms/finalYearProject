import React, { useState } from "react";
// Deprecated: using backend API instead

export default function DietPlanner({ onBackHome }) {
  const [form, setForm] = useState({
    age: "",
    gender: "male",
    activity: "Sedentary",
    diet: "Veg",
  });
  const [goal, setGoal] = useState("General wellness");
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
      const prompt = `Can you create a diet plan for me?
Age: ${form.age}
Gender: ${form.gender}
Activity: ${form.activity}
Diet preference: ${form.diet}
Goal: ${goal || "General wellness"}
Allergies/avoid: ${allergies || "none"}`;
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: { page: 'diet-planner' } })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      setPlan(data.reply);
    } catch (e) {
      setPlan("Sorry, I couldn't generate a plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackHome}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
              <h1 className="text-2xl font-bold text-slate-800">Diet Planner</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Form Section */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Personal Information</h2>
                <p className="text-slate-600">Fill in your details to get a personalized diet plan</p>
              </div>
              
              <form onSubmit={submit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
                  <input 
                    type="number" 
                    required 
                    value={form.age} 
                    onChange={(e)=>update("age", e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                    placeholder="e.g., 28"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                  <select 
                    value={form.gender} 
                    onChange={(e)=>update("gender", e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Activity Level</label>
                  <select 
                    value={form.activity} 
                    onChange={(e)=>update("activity", e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  >
                    <option>Sedentary</option>
                    <option>Lightly active</option>
                    <option>Active</option>
                    <option>Very active</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Diet Preference</label>
                  <select 
                    value={form.diet} 
                    onChange={(e)=>update("diet", e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  >
                    <option>Veg</option>
                    <option>Non-veg</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Goal (optional)</label>
                  <input 
                    value={goal} 
                    onChange={(e)=>setGoal(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                    placeholder="e.g., weight loss, muscle gain"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Allergies (optional)</label>
                  <input 
                    value={allergies} 
                    onChange={(e)=>setAllergies(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" 
                    placeholder="e.g., peanuts, lactose"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 disabled:opacity-60 transition-colors" 
                  disabled={isLoading}
                >
                  {isLoading ? "Generating Plan…" : "Generate Diet Plan"}
                </button>
              </form>
            </div>

            {/* Results Section */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Your Diet Plan</h2>
                <p className="text-slate-600">Your personalized daily and weekly plan will appear here</p>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-6 bg-slate-50 h-96 overflow-y-auto">
                <div className="whitespace-pre-wrap text-slate-700">
                  {plan ? (
                    <div className="space-y-4">
                      {plan.split('\n').map((line, index) => (
                        <div key={index} className={line.trim().startsWith('**') ? 'font-semibold text-slate-800' : ''}>
                          {line}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No plan generated yet</p>
                        <p className="text-sm">Fill in your information and click "Generate Diet Plan" to get started</p>
                      </div>
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
