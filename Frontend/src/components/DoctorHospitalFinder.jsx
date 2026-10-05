import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (svgString, className) => {
  return L.divIcon({
    html: svgString,
    className: className,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const userIcon = createCustomIcon(`
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="10" fill="#2563EB" stroke="white" stroke-width="3"/>
    <circle cx="14" cy="14" r="4" fill="white"/>
  </svg>
`, 'user-marker');

const budgetIcon = createCustomIcon(`
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="24" height="24" rx="6" fill="#059669" stroke="white" stroke-width="2"/>
    <path d="M14 7v14M8 14h12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
  </svg>
`, 'budget-marker');

const premiumIcon = createCustomIcon(`
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="24" height="24" rx="6" fill="#7C3AED" stroke="white" stroke-width="2"/>
    <polygon points="14,6 16.5,11.5 22,12.3 18,16.2 19,21.8 14,19 9,21.8 10,16.2 6,12.3 11.5,11.5" fill="#FBBF24" stroke="white" stroke-width="1"/>
  </svg>
`, 'premium-marker');

// Map view controller
function MapUpdater({ center, zoom, selectedLocation, userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLocation && userLocation) {
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [selectedLocation.lat, selectedLocation.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, selectedLocation, userLocation, map]);
  return null;
}

const SPECIALTY_OPTIONS = [
  "Cardiologist",
  "Dermatologist",
  "Orthopedic Surgeon",
  "Neurologist",
  "General Physician",
  "Pediatrician",
  "Gastroenterologist",
  "ENT Specialist",
  "Pulmonologist",
  "Ophthalmologist"
];

export default function DoctorHospitalFinder({ onBackHome }) {
  const routerLocation = useLocation();
  const navigate = useNavigate();

  // Get initial values from navigation state if redirected from AI Symptom Checker or Chatbot
  const initialSpecialty = routerLocation.state?.specialty || "Cardiologist";
  const initialSymptoms = routerLocation.state?.symptoms || "";

  const defaultLocation = { lat: 12.9716, lng: 77.5946 }; // Bengaluru default coordinates
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultLocation);
  const [zoomLevel, setZoomLevel] = useState(13);

  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [searchCity, setSearchCity] = useState(routerLocation.state?.city || "");
  const [radiusKm, setRadiusKm] = useState(5);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'budget', 'premium'

  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const mapSectionRef = useRef(null);

  // Initial fetch with geolocation
  useEffect(() => {
    handleUseMyLocation(false);
  }, []);

  const handleUseMyLocation = (showAlert = true) => {
    if (!navigator.geolocation) {
      if (showAlert) setErrorMsg("Geolocation is not supported by your browser.");
      fetchRecommendations(defaultLocation.lat, defaultLocation.lng, "Default Location", radiusKm, specialty);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userPos);
        setMapCenter(userPos);
        setZoomLevel(13);
        fetchRecommendations(userPos.lat, userPos.lng, "Current GPS Location", radiusKm, specialty);
      },
      (err) => {
        console.warn("Geolocation denied/failed, falling back to default city:", err.message);
        setUserLocation(defaultLocation);
        setMapCenter(defaultLocation);
        fetchRecommendations(defaultLocation.lat, defaultLocation.lng, "Metro Region", radiusKm, specialty);
        if (showAlert) {
          setErrorMsg("Could not access precise GPS. Using standard regional coordinates.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const fetchRecommendations = async (lat, lng, locName, radius, currentSpecialty) => {
    setLoading(true);
    setErrorMsg("");
    setSelectedProvider(null);

    try {
      const response = await fetch('/api/doctors-hospitals/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: currentSpecialty || specialty,
          symptoms: initialSymptoms,
          lat: lat || mapCenter.lat,
          lng: lng || mapCenter.lng,
          locationName: locName || searchCity || "Nearby Locality",
          userRadius: radius || radiusKm
        })
      });

      const res = await response.json();
      if (!res.success) {
        throw new Error(res.error || "Failed to fetch recommendation data");
      }

      setResultsData(res.data);
      if (res.data.activeRadiusKm && res.data.activeRadiusKm !== radiusKm) {
        setRadiusKm(res.data.activeRadiusKm);
      }
    } catch (err) {
      console.error("Error fetching doctor/hospital data:", err);
      setErrorMsg("Unable to retrieve healthcare recommendations right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecommendations(mapCenter.lat, mapCenter.lng, searchCity, radiusKm, specialty);
  };

  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    fetchRecommendations(mapCenter.lat, mapCenter.lng, searchCity, newRadius, specialty);
  };

  const handleSpecialtyChange = (newSpec) => {
    setSpecialty(newSpec);
    fetchRecommendations(mapCenter.lat, mapCenter.lng, searchCity, radiusKm, newSpec);
  };

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
    if (provider.lat && provider.lng) {
      setMapCenter({ lat: provider.lat, lng: provider.lng });
      setZoomLevel(15);
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDisplayedProviders = () => {
    if (!resultsData) return [];
    if (activeTab === 'budget') return resultsData.budgetProviders || [];
    if (activeTab === 'premium') return resultsData.premiumProviders || [];
    // Interleave or combine both
    return [...(resultsData.budgetProviders || []), ...(resultsData.premiumProviders || [])]
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackHome || (() => navigate('/'))}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 font-medium text-sm"
              title="Return to TeleSeva Home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <div className="border-l border-slate-300 pl-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-green-600 bg-clip-text text-transparent">
                TeleSeva Doctor & Hospital Finder
              </h1>
              <p className="text-xs text-slate-500">Real-Time Specialist, Budget & Premium Hospital Locator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUseMyLocation(true)}
              className="flex items-center gap-1.5 text-xs sm:text-sm bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-all font-medium"
            >
              <svg className="w-4 h-4 text-teal-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Locate Me (GPS)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Symptom Context / Diagnosis Banner if coming from AI */}
        {initialSymptoms && (
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 text-xs px-2.5 py-1 rounded-full font-medium mb-1">
                <span>🤖 AI Assessment Matched</span>
              </div>
              <h2 className="text-lg font-semibold">
                Specialist Required: <span className="text-teal-400 font-bold">{specialty}</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                Based on symptoms: "{initialSymptoms}"
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-slate-300">
                Budget Tier: <strong className="text-emerald-400">₹0 - ₹400</strong>
              </span>
              <span className="text-xs bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-slate-300">
                Premium Tier: <strong className="text-purple-400">₹800 - ₹2,500</strong>
              </span>
            </div>
          </div>
        )}

        {/* Search & Dynamic Range Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Specialty Selector */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Medical Specialist</label>
              <select
                value={specialty}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
              >
                {SPECIALTY_OPTIONS.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* City / Locality Search */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">City / Area Search</label>
              <input
                type="text"
                placeholder="e.g. Indiranagar, South Delhi, Andheri"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
              />
            </div>

            {/* Search Action Button */}
            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Find Doctors</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Dynamic Radius Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Search Radius:</span>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[5, 10, 25, 50].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRadiusChange(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      radiusKm === r 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Web Scraped & OSM Live Healthcare Data</span>
            </div>
          </div>
        </div>

        {/* Auto-Expansion Notice if radius was expanded dynamically */}
        {resultsData?.autoExpanded && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-start gap-3 shadow-xs">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-xs sm:text-sm text-amber-900">Dynamic Radius Auto-Expansion</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {resultsData.expansionMessage || `Search radius was automatically expanded to ${radiusKm} km to locate certified ${specialty} specialists and hospitals.`}
              </p>
            </div>
          </div>
        )}

        {/* Tier Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏥 All Providers ({resultsData?.totalFound || 0})
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'budget'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span>💰 Budget-Friendly</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-700 text-white">
                {resultsData?.budgetProviders?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('premium')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'premium'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <span>⭐ Premium / Best Care</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-700 text-white">
                {resultsData?.premiumProviders?.length || 0}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Showing verified doctors & hospitals within <strong className="text-slate-800">{radiusKm} km</strong>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}

        {/* Content Layout: 2 Columns (Listings on left, Interactive Map on right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Doctor / Hospital Cards List */}
          <div className="lg:col-span-7 space-y-4 max-h-[750px] overflow-y-auto pr-1">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="font-semibold text-slate-700">Finding Real Doctors & Hospitals...</h3>
                <p className="text-xs text-slate-400">Scraping healthcare directories and querying live geo-spatial nodes</p>
              </div>
            ) : getDisplayedProviders().length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-2xl">
                  🏥
                </div>
                <h3 className="font-semibold text-slate-700">No doctors found in immediate range</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try expanding the search radius using the buttons above or searching for another city name.
                </p>
                <button
                  onClick={() => handleRadiusChange(25)}
                  className="mt-2 bg-teal-600 text-white text-xs px-4 py-2 rounded-xl font-medium"
                >
                  Expand Radius to 25 km
                </button>
              </div>
            ) : (
              getDisplayedProviders().map((provider) => {
                const isSelected = selectedProvider?.id === provider.id;
                const isBudget = provider.tier === 'budget';

                return (
                  <div
                    key={provider.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-200'
                        : isBudget
                          ? 'border-slate-200 hover:border-emerald-300'
                          : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    {/* Header strip */}
                    <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between ${
                      isBudget
                        ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'
                        : 'bg-purple-50 text-purple-800 border-b border-purple-100'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        {provider.tierBadge}
                      </span>
                      <span className="font-bold">
                        Est. Fee: {provider.consultationFee}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-slate-900">
                            {provider.name}
                          </h3>
                          <p className="text-xs sm:text-sm font-medium text-teal-700">
                            {provider.specialization} • <span className="text-slate-500">{provider.experience}</span>
                          </p>
                          <p className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1">
                            <span>🏥</span> {provider.hospitalName}
                          </p>
                        </div>

                        {/* Distance Badge */}
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                            <span>📍</span> {provider.distanceKm ? `${provider.distanceKm} km` : 'Nearby'}
                          </span>
                          <div className="flex items-center justify-end gap-1 mt-1 text-xs text-amber-600 font-semibold">
                            <span>★</span> {provider.rating} <span className="text-slate-400 font-normal">({provider.reviewsCount})</span>
                          </div>
                        </div>
                      </div>

                      {/* Address & Timings */}
                      <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <p className="flex items-center gap-1.5">
                          <span className="text-slate-400">📌</span> {provider.address}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="text-slate-400">🕒</span> {provider.timing}
                        </p>
                      </div>

                      {/* Features / Benefits */}
                      <div className="flex flex-wrap gap-1.5">
                        {provider.features?.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                              isBudget
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-purple-50 text-purple-700 border border-purple-100'
                            }`}
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          {provider.lat && provider.lng && (
                            <button
                              type="button"
                              onClick={() => handleSelectProvider(provider)}
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <span>🗺️ View on Map</span>
                            </button>
                          )}
                          <a
                            href={`tel:${provider.phone}`}
                            className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>📞 Call {provider.phone}</span>
                          </a>
                        </div>

                        <button
                          onClick={() => navigate('/video-consultation')}
                          className="text-xs bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white font-semibold px-3.5 py-1.5 rounded-lg shadow-xs transition-all"
                        >
                          Book TeleSeva Consult
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Interactive Leaflet Map */}
          <div ref={mapSectionRef} className="lg:col-span-5 sticky top-20">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
              {/* Map Title Bar */}
              <div className="p-3 bg-slate-800 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                  <span className="font-semibold">Interactive Healthcare Map</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Budget
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-purple-300">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span> Premium
                  </span>
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1 relative">
                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={zoomLevel}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapUpdater
                    center={mapCenter}
                    zoom={zoomLevel}
                    selectedLocation={selectedProvider}
                    userLocation={userLocation}
                  />

                  {/* User Location Marker */}
                  {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                      <Popup>
                        <div className="text-xs font-sans">
                          <strong className="text-blue-600 block">Your Current Location</strong>
                          <span>Search Radius: {radiusKm} km</span>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Provider Markers */}
                  {getDisplayedProviders().map((prov) => {
                    if (!prov.lat || !prov.lng) return null;
                    const isBudget = prov.tier === 'budget';
                    const icon = isBudget ? budgetIcon : premiumIcon;

                    return (
                      <Marker
                        key={prov.id}
                        position={[prov.lat, prov.lng]}
                        icon={icon}
                        eventHandlers={{
                          click: () => setSelectedProvider(prov)
                        }}
                      >
                        <Popup>
                          <div className="text-xs font-sans space-y-1.5 p-1">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isBudget ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {prov.tierBadge}
                            </span>
                            <strong className="block text-slate-900 text-sm">{prov.name}</strong>
                            <p className="text-slate-600">{prov.hospitalName}</p>
                            <p className="font-semibold text-teal-700">Fee: {prov.consultationFee}</p>
                            <p className="text-slate-500">📍 {prov.distanceKm ? `${prov.distanceKm} km away` : 'Nearby'}</p>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${prov.lat},${prov.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block bg-teal-600 text-white px-2 py-1 rounded text-[11px] font-medium mt-1"
                            >
                              Get Live Directions ↗
                            </a>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Polyline Route if selected */}
                  {userLocation && selectedProvider?.lat && selectedProvider?.lng && (
                    <Polyline
                      positions={[
                        [userLocation.lat, userLocation.lng],
                        [selectedProvider.lat, selectedProvider.lng]
                      ]}
                      color={selectedProvider.tier === 'budget' ? '#059669' : '#7C3AED'}
                      weight={3}
                      dashArray="5, 10"
                    />
                  )}
                </MapContainer>
              </div>

              {/* Selected Provider Quick Bar */}
              {selectedProvider && (
                <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs flex items-center justify-between gap-2">
                  <div className="truncate">
                    <strong className="text-slate-900 block truncate">{selectedProvider.name}</strong>
                    <span className="text-slate-500 text-[11px] truncate">{selectedProvider.hospitalName}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedProvider.lat || mapCenter.lat},${selectedProvider.lng || mapCenter.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    Directions ↗
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
