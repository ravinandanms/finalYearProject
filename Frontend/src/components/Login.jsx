import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import telesevaLogo from "../assets/telesevaLogo.jpg";
export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("signin"); // 'signin' | 'signup'
  const [showForgot, setShowForgot] = useState(false);

  // Shared fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState("patient"); // new role state
  const [specialization, setSpecialization] = useState(""); // new specialization state
  const [errorMsg, setErrorMsg] = useState("");

  // Forgot password
  const [otpPhone, setOtpPhone] = useState("");
  const [otp, setOtp] = useState("");

  async function handleSignIn(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!email.trim() || !password) return;
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('teleseva_token', data.token);
      login(data.user);
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setErrorMsg("");
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role,
          specialization: role === 'doctor' ? specialization : undefined 
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      
      localStorage.setItem('teleseva_token', data.token);
      login(data.user);
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url('https://i.pinimg.com/1200x/6e/30/bb/6e30bb0372fd68401659db9087a05971.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="w-full max-w-lg bg-white/30 backdrop-blur-lg shadow-2xl rounded-2xl p-6 md:p-8 border border-slate-200/50">
        {/* Logo and Title Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={telesevaLogo} 
              alt="Teleseva Logo" 
              className="w-16 h-16 object-contain mr-3"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Teleseva
            </h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-800">
              Welcome to Teleseva
            </h2>
            <p className="text-slate-600 text-sm">
              Your trusted healthcare companion for better health management
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "signin" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("signin")}
            >
              {t('auth.signIn')}
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "signup" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("signup")}
            >
              {t('auth.signUpRegister')}
            </button>
          </div>
        </div>

        {activeTab === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errorMsg}</div>}
            <div>
              <label className="block text-sm text-slate-600 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.placeholder.email')}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">{t('auth.password')}</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-600">{t('auth.newHere')} <button type="button" className="text-green-700 hover:underline" onClick={() => setActiveTab("signup")}>{t('auth.signUpLink')}</button></div>
              <button type="button" className="text-green-700 hover:underline" onClick={() => setShowForgot(true)}>{t('auth.forgot')}</button>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg shadow"
            >
              {t('auth.signInCta')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errorMsg}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">{t('auth.name')}</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.placeholder.name')}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">{t('auth.phone')}</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('auth.placeholder.phone')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">{t('auth.gender')}</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Male">{t('auth.gender.male')}</option>
                  <option value="Female">{t('auth.gender.female')}</option>
                  <option value="Other">{t('auth.gender.other')}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600 mb-1">{t('auth.age')}</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Role</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              {role === 'doctor' && (
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Specialization</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Cardiologist"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">{t('auth.email')}</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.placeholder.email')}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">{t('auth.password')}</label>
                <input
                  type="password"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.placeholder.password')}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg shadow"
            >
              {t('auth.registerCta')}
            </button>
          </form>
        )}

        {showForgot && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{t('auth.reset.title')}</h2>
                <button className="text-slate-500 hover:text-slate-700" onClick={() => setShowForgot(false)}>✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">{t('auth.phone')}</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    placeholder={t('auth.placeholder.phone')}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button className="col-span-1 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-2 text-sm">{t('auth.reset.sendOtp')}</button>
                  <input
                    className="col-span-2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={t('auth.otp')}
                  />
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg">{t('auth.reset.verify')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


