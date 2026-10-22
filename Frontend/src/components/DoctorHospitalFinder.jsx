import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GoogleMapView from './GoogleMapView';
import { useProperLocation } from '../utils/useProperLocation';

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

  const initialSpecialty = routerLocation.state?.specialty || "Cardiologist";
  const initialSymptoms = routerLocation.state?.symptoms || "";

  const defaultLocation = { lat: 12.6889, lng: 77.7130 }; // Anekal default coordinates

  // Proper Location Hook
  const {
    coords: userCoords,
    setCoords: setUserCoords,
    accuracy,
    locationLabel,
    setLocationLabel,
    status: locStatus,
    errorMessage: locError,
    requestLocation,
    setCustomLocation,
    reverseGeocode
  } = useProperLocation(defaultLocation);

  const [userLocation, setUserLocation] = useState(userCoords || defaultLocation);
  const [mapCenter, setMapCenter] = useState(userCoords || defaultLocation);
  const [zoomLevel, setZoomLevel] = useState(14);

  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [searchCity, setSearchCity] = useState(routerLocation.state?.city || "");
  const [radiusKm, setRadiusKm] = useState(5);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'budget', 'premium'

  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // In-App Directions State
  const [showRoute, setShowRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showSteps, setShowSteps] = useState(false);

  const mapSectionRef = useRef(null);

  // 1. Initial Load using saved or default Anekal location
  useEffect(() => {
    const initialPos = userCoords || defaultLocation;
    setUserLocation(initialPos);
    setMapCenter(initialPos);
    fetchRecommendations(initialPos.lat, initialPos.lng, locationLabel, radiusKm, specialty);
  }, []);

  // Set location by dragging blue pin on map or clicking on map
  const handleManualLocationSelect = async (newCoords) => {
    setUserLocation(newCoords);
    setMapCenter(newCoords);
    clearRoute();
    const address = await reverseGeocode(newCoords.lat, newCoords.lng);
    setCustomLocation(newCoords, address, (c, l) => {
      fetchRecommendations(c.lat, c.lng, l, radiusKm, specialty);
    });
  };

  // Quick Locality Button Handler
  const handleQuickLocality = (loc) => {
    setUserLocation(loc.coords);
    setMapCenter(loc.coords);
    setSearchCity(loc.name);
    clearRoute();
    setCustomLocation(loc.coords, loc.name, (c, l) => {
      fetchRecommendations(c.lat, c.lng, l, radiusKm, specialty);
    });
  };

  // 2. Fetch doctors & hospitals using Google Places & Verified Specialist Directory
  const fetchRecommendations = async (lat, lng, locName, radius, currentSpecialty) => {
    setLoading(true);
    setErrorMsg("");

    const centerLat = lat || mapCenter.lat;
    const centerLng = lng || mapCenter.lng;
    const currentSpec = currentSpecialty || specialty;
    const searchArea = locName || searchCity || locationLabel || "Current Location";

    // Call backend recommendation service directly and instantly
    try {
      const response = await fetch('/api/doctors-hospitals/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: currentSpec,
          symptoms: initialSymptoms,
          lat: centerLat,
          lng: centerLng,
          locationName: searchArea,
          userRadius: radius
        })
      });

      const res = await response.json();
      if (!res.success) {
        throw new Error(res.error || "Failed to fetch recommendation data");
      }

      setResultsData(res.data);
    } catch (err) {
      console.error("Error fetching doctor/hospital data:", err);
      setErrorMsg("Unable to retrieve healthcare recommendations right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Searching specific location
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchCity.trim()) {
      fetchRecommendations(mapCenter.lat, mapCenter.lng, locationLabel, radiusKm, specialty);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const geoRes = await fetch(`/api/doctors-hospitals/geocode?query=${encodeURIComponent(searchCity)}`);
      const geoData = await geoRes.json();

      if (geoData.success && geoData.location) {
        const newCoords = { lat: geoData.location.lat, lng: geoData.location.lng };
        setUserLocation(newCoords);
        setMapCenter(newCoords);
        setZoomLevel(14);
        clearRoute();
        setCustomLocation(newCoords, geoData.location.displayName, (c, l) => {
          fetchRecommendations(c.lat, c.lng, l, radiusKm, specialty);
        });
      } else {
        setErrorMsg(`Could not find "${searchCity}". Please verify city or locality name.`);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      fetchRecommendations(mapCenter.lat, mapCenter.lng, searchCity, radiusKm, specialty);
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    clearRoute();
    fetchRecommendations(mapCenter.lat, mapCenter.lng, searchCity || locationLabel, newRadius, specialty);
  };

  const handleSpecialtyChange = (newSpec) => {
    setSpecialty(newSpec);
    clearRoute();
    fetchRecommendations(mapCenter.lat, mapCenter.lng, searchCity || locationLabel, radiusKm, newSpec);
  };

  // In-App Directions to Provider
  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
    if (!provider.lat || !provider.lng) return;

    setShowRoute(true);
    setShowSteps(true);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearRoute = () => {
    setShowRoute(false);
    setRouteInfo(null);
    setSelectedProvider(null);
    setShowSteps(false);
  };

  const handleRouteCalculated = (info) => {
    setRouteInfo(info);
  };

  const getDisplayedProviders = () => {
    if (!resultsData) return [];
    if (activeTab === 'budget') return resultsData.budgetProviders || [];
    if (activeTab === 'premium') return resultsData.premiumProviders || [];
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
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 font-medium text-sm"
              title="Return to TeleSeva Home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <div className="border-l border-slate-200 pl-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
                <span>🩺</span> TeleSeva Doctor & Hospital Finder
              </h1>
              <p className="text-xs text-slate-500">Live Google Maps Healthcare Specialist & Hospital Locator</p>
            </div>
          </div>

          {/* Proper Location Access Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                requestLocation((coords, label) => {
                  setUserLocation(coords);
                  setMapCenter(coords);
                  clearRoute();
                  fetchRecommendations(coords.lat, coords.lng, label, radiusKm, specialty);
                });
              }}
              disabled={locStatus === 'detecting'}
              className="flex items-center gap-2 text-xs sm:text-sm bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3.5 py-2 rounded-xl font-semibold transition-all shadow-2xs"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${locStatus === 'detecting' ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`}></span>
              <span>{locStatus === 'detecting' ? 'Acquiring GPS...' : 'Use My GPS Location'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-5">
        
        {/* Location Banner */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Current Search Center:</span>
            <strong className="text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold">{locationLabel}</strong>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            {accuracy && (
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md font-medium border border-emerald-100">
                GPS Precision: ~{accuracy}m
              </span>
            )}
            <span>Radius: <strong>{radiusKm} km</strong></span>
          </div>
        </div>

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
                Symptom Profile: <span className="italic">{initialSymptoms}</span>
              </p>
            </div>
            <div className="text-xs bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10 text-slate-200">
              Filtered for certified {specialty} practitioners & clinics
            </div>
          </div>
        )}

        {/* Search, Specialty, and Filter Controls */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Specialty Dropdown */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Specialty</label>
              <select
                value={specialty}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {SPECIALTY_OPTIONS.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* City / Locality Search Input */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">City or Locality</label>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="e.g. Indiranagar, Jayanagar, Mysore..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0"
                >
                  Locate
                </button>
              </form>
            </div>

            {/* Radius Selector */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Search Distance</label>
              <div className="flex gap-1.5">
                {[3, 5, 10, 25].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRadiusChange(r)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      radiusKm === r
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Locality Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
            <span className="text-slate-500 font-semibold text-[11px]">Popular Localities:</span>
            {[
              { name: "Anekal Town", coords: { lat: 12.6889, lng: 77.7130 } },
              { name: "Chandapura", coords: { lat: 12.7933, lng: 77.7011 } },
              { name: "Electronic City", coords: { lat: 12.8399, lng: 77.6770 } },
              { name: "Jigani", coords: { lat: 12.7836, lng: 77.6415 } },
              { name: "Attibele", coords: { lat: 12.7783, lng: 77.7712 } },
              { name: "Bengaluru Central", coords: { lat: 12.9716, lng: 77.5946 } }
            ].map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => handleQuickLocality(loc)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  locationLabel.toLowerCase().includes(loc.name.toLowerCase().split(' ')[0])
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
                }`}
              >
                📍 {loc.name}
              </button>
            ))}
          </div>

          {/* Tier Filter Tabs: Budget vs Premium */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Care Category:</span>
              <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Facilities ({resultsData ? (resultsData.budgetProviders?.length || 0) + (resultsData.premiumProviders?.length || 0) : 0})
                </button>
                <button
                  onClick={() => setActiveTab('budget')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'budget' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  <span>🏛️ Budget / Public</span>
                  {resultsData?.budgetProviders && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full">
                      {resultsData.budgetProviders.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('premium')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'premium' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-700 hover:text-purple-900'
                  }`}
                >
                  <span>⭐ Multi-Specialty</span>
                  {resultsData?.premiumProviders && (
                    <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded-full">
                      {resultsData.premiumProviders.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {resultsData && (
              <div className="text-xs text-slate-500 flex items-center gap-4">
                <span>Budget fee: <strong className="text-emerald-700">{resultsData.budgetRange?.label || '₹0 - ₹400'}</strong></span>
                <span>Specialty fee: <strong className="text-purple-700">{resultsData.premiumRange?.label || '₹700 - ₹1,500'}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-amber-900 font-bold">✕</button>
          </div>
        )}

        {/* Content Layout: Providers List (7 cols) + Sticky Google Map (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Doctor / Hospital Cards List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {loading ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="font-bold text-slate-800 text-sm">Searching Google Maps & Healthcare Network...</h3>
                <p className="text-xs text-slate-500">Locating certified {specialty} doctors and accredited hospitals in your area.</p>
              </div>
            ) : getDisplayedProviders().length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
                <span className="text-4xl">🏥</span>
                <h3 className="font-bold text-slate-800">No providers found in this radius</h3>
                <p className="text-xs text-slate-500">Try expanding your search distance to 10km or 25km, or search a nearby major locality.</p>
                <button
                  onClick={() => handleRadiusChange(15)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Expand Search to 15km
                </button>
              </div>
            ) : (
              getDisplayedProviders().map((provider) => {
                const isSelected = selectedProvider?.id === provider.id;
                const isBudget = provider.tier === 'budget';

                return (
                  <div
                    key={provider.id}
                    onClick={() => handleSelectProvider(provider)}
                    className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 shadow-md ring-1 ring-teal-500 bg-teal-50/20'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      
                      {/* Provider Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              isBudget
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}
                          >
                            {provider.tierBadge}
                          </span>
                          <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                            ⭐ {provider.rating} <span className="text-slate-400 font-normal">({provider.reviewsCount})</span>
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">{provider.name}</h3>
                          <p className="text-xs font-semibold text-teal-700">{provider.specialization}</p>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <span>🏥</span>
                            <span className="font-medium text-slate-700">{provider.hospitalName}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Experience:</span>
                            <span className="font-medium">{provider.experience}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Consultation Fee:</span>
                            <span className={`font-bold ${isBudget ? 'text-emerald-700' : 'text-purple-700'}`}>
                              {provider.consultationFee}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                          <p className="flex items-start gap-1">
                            <span className="text-slate-400">📍</span>
                            <span>{provider.address}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="text-slate-400">🕒</span>
                            <span>{provider.timing}</span>
                          </p>
                        </div>

                        {/* Features Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
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
                      </div>

                      {/* Distance & Action */}
                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        {provider.distanceKm !== null && (
                          <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Distance</span>
                            <span className="text-sm font-extrabold text-slate-900">{provider.distanceKm} km</span>
                          </div>
                        )}

                        <div className="mt-3 flex sm:flex-col gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProvider(provider);
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 ${
                              isSelected && showRoute
                                ? 'bg-teal-700 text-white'
                                : 'bg-teal-600 hover:bg-teal-700 text-white'
                            }`}
                          >
                            <span>🧭</span>
                            <span>{isSelected && showRoute ? 'Viewing Route' : 'Get Directions'}</span>
                          </button>

                          <a
                            href={`tel:${provider.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 text-center transition-colors flex items-center justify-center gap-1"
                          >
                            <span>📞 Call Clinic</span>
                          </a>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}

          </div>

          {/* Right Column: Google Maps Interactive Section (5 cols) */}
          <div ref={mapSectionRef} className="lg:col-span-5 sticky top-20 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
              
              {/* Map Title Bar */}
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-sm tracking-wide">Google Maps Healthcare View</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Budget
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-purple-300">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span> Specialty
                  </span>
                </div>
              </div>

              {/* Google Map View */}
              <div className="flex-1 relative">
                <GoogleMapView
                  center={mapCenter}
                  zoom={zoomLevel}
                  userLocation={userLocation || userCoords}
                  places={getDisplayedProviders()}
                  selectedPlace={selectedProvider}
                  onSelectPlace={handleSelectProvider}
                  showRoute={showRoute}
                  onRouteCalculated={handleRouteCalculated}
                  onLocationSelect={handleManualLocationSelect}
                  className="w-full h-full"
                />
              </div>

              {/* Selected Provider Quick Route Summary Bar */}
              {selectedProvider && (
                <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate">
                      <strong className="text-slate-900 block truncate">{selectedProvider.name}</strong>
                      <span className="text-slate-500 text-[11px] truncate">{selectedProvider.hospitalName}</span>
                    </div>

                    <button
                      onClick={clearRoute}
                      className="text-slate-400 hover:text-slate-700 px-2 py-1 text-xs font-bold"
                      title="Clear route"
                    >
                      Clear ✕
                    </button>
                  </div>

                  {/* Route Summary Pill */}
                  {routeInfo && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-teal-50 border border-teal-200 px-3 py-2 rounded-xl text-teal-900 text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span>🚗 Driving:</span>
                          <strong className="text-teal-950 font-extrabold">{routeInfo.distanceText}</strong>
                          <span>•</span>
                          <strong className="text-teal-950 font-extrabold">{routeInfo.durationText}</strong>
                        </div>
                        {routeInfo.steps && routeInfo.steps.length > 0 && (
                          <button
                            onClick={() => setShowSteps(!showSteps)}
                            className="text-teal-700 underline text-[11px] font-bold"
                          >
                            {showSteps ? 'Hide Turns' : 'Show Turns'}
                          </button>
                        )}
                      </div>

                      {/* Turn-by-Turn Steps */}
                      {showSteps && routeInfo.steps && (
                        <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-xl p-2.5 space-y-1.5 text-[11px] text-slate-700">
                          {routeInfo.steps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-1.5 py-0.5 border-b border-slate-100 last:border-b-0">
                              <span className="text-teal-600 font-bold shrink-0">{sIdx + 1}.</span>
                              <span className="flex-1">{step.instruction}</span>
                              {step.distance && <span className="text-slate-400 shrink-0 font-medium">{step.distance}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
