import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import telesevaLogo from "../assets/telesevaLogo.jpg";

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Navbar(){
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    const { t, lang, setLang } = useI18n();
    return(
        <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <img 
                src={telesevaLogo} 
                alt="Teleseva Logo" 
                className="w-10 h-10 object-contain rounded-lg shadow-xs"
              />
              <div>
                <div className="font-bold text-xl bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  {t('brand.name')}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">{t('brand.tag')}</div>
              </div>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 ml-6 text-sm font-medium text-slate-600">
            {["home", "about", "services", "doctors", "contact"].map((id) => (
              <a
                key={id}
                onClick={() => scrollToSection(id)}
                className="hover:text-teal-600 transition-colors cursor-pointer"
              >
                {t(`nav.${id}`)}
              </a>
            ))}
          </nav>
          
          <div className="flex items-center gap-3">
            {/* Language Selector: English & Kannada */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 pl-1.5 font-medium">🌐</span>
              <select
                aria-label="Change Language"
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer pr-2"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>

            {user && (
              <div className="relative">
                <button
                  className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 border border-teal-300 flex items-center justify-center font-bold shadow-xs transition-transform hover:scale-105"
                  onClick={() => setProfileOpen((s) => !s)}
                  title={user.name}
                >
                  <span className="text-sm font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-sm z-50">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-lg text-teal-700">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-base text-slate-800 truncate">{user.name}</div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-2 space-y-1">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left text-slate-700 hover:bg-slate-50 hover:text-teal-600 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>👤</span>
                        <span>{t('profile.myProfile')}</span>
                      </button>
                      <button
                        className="w-full text-left text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                        onClick={logout}
                      >
                        <span>🚪</span>
                        <span>{t('profile.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-slate-700"
              onClick={() => setMobileMenuOpen((s) => !s)}
              aria-label="Toggle Mobile Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    mobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2">
          {["home", "about", "services", "doctors", "contact"].map((id) => (
            <a 
              key={id} 
              onClick={() => { scrollToSection(id); setMobileMenuOpen(false); }}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
            >
              {t(`nav.${id}`)}
            </a>
          ))}
          {user && (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left py-1 text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5"
              >
                <span>👤</span>
                <span>{t('profile.myProfile')} ({user.name})</span>
              </button>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 truncate max-w-[180px]">{user.email}</span>
                <button onClick={logout} className="text-red-600 font-semibold">{t('profile.logout')}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

    
