import React from 'react'
import { useState } from 'react'

import { useAuth } from "../context/AuthContext"
import { useI18n } from "../context/I18nContext"
import telesevaLogo from "../assets/telesevaLogo.jpg"


function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Navbar(){
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
                className="w-10 h-10 object-contain"
              />
              <div>
                <div className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Teleseva
                </div>
                <div className="text-xs text-slate-400">{t('brand.tag')}</div>
              </div>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 ml-6 text-sm text-slate-600">
            {["home", "about", "services", "doctors", "contact"].map((id) => (
              <a
                key={id}
                onClick={() => scrollToSection(id)}
                className="hover:text-slate-900 cursor-pointer"
              >
                {t(`nav.${id}`)}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <select
              className="border rounded-md px-2 py-1 text-sm text-slate-700"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
            </select>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <div className="relative">
                <button
                  className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center"
                  onClick={() => setProfileOpen((s) => !s)}
                >
                  <span className="text-sm font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow p-4 text-sm z-50">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-lg text-green-600">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-base text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                    <button
                      className="w-full text-left text-blue-600 hover:bg-blue-50 px-2 py-1 rounded mb-1"
                      onClick={() => alert('Edit profile coming soon!')}
                    >
                      Edit Profile
                    </button>
                    <button
                      className="w-full text-left text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                      onClick={logout}
                    >
                      {t('profile.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileMenuOpen((s) => !s)}
          >
            <svg
              className="w-6 h-6 text-slate-700"
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
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-2">
          {["Home", "About", "Service", "Doctors", "Contact"].map((item) => (
            <a key={item} className="block">
              {item}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
    
