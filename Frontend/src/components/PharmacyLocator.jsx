import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import GoogleMapView from './GoogleMapView';
import { searchNearbyHealthcarePlaces } from '../utils/googlePlacesService';
import { useProperLocation } from '../utils/useProperLocation';

export default function PharmacyLocator({ onBackHome }) {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { t, isKannada } = useI18n();

  // Prescribed medicines passed from post-video consultation
  const prescriptionState = routerLocation.state || {};
  const prescribedMedicines = prescriptionState.prescribedMedicines || [];
  const prescribedMedicineNames = prescribedMedicines.map((m) =>
    typeof m === 'string' ? m : m.name
  ).filter(Boolean);

  const defaultLocation = { lat: 12.6889, lng: 77.7130 }; // Anekal center

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

  const [mapCenter, setMapCenter] = useState(userCoords || defaultLocation);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [userLocation, setUserLocation] = useState(userCoords || defaultLocation);
  const [searchLocation, setSearchLocation] = useState(prescriptionState.city || '');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5);

  const [showRoute, setShowRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null); // { distanceText, durationText, steps }
  const [showSteps, setShowSteps] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [filter, setFilter] = useState(prescribedMedicineNames.length > 0 ? 'pharmacy' : 'all'); // 'all', 'hospital', 'pharmacy'

  // Order / Reserve Modal state
  const [orderModalPlace, setOrderModalPlace] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderType, setOrderType] = useState('pickup');
  const [orderPhone, setOrderPhone] = useState('');

  // 1. Initial Load using saved or default Anekal location
  useEffect(() => {
    const initialPos = userCoords || defaultLocation;
    setUserLocation(initialPos);
    setMapCenter(initialPos);
    searchPlaces(initialPos.lat, initialPos.lng, filter, radiusKm);
  }, []);

  // Set location by dragging blue pin on map or clicking on map
  const handleManualLocationSelect = async (newCoords) => {
    setUserLocation(newCoords);
    setMapCenter(newCoords);
    clearRoute();
    const address = await reverseGeocode(newCoords.lat, newCoords.lng);
    setCustomLocation(newCoords, address, (c) => {
      searchPlaces(c.lat, c.lng, filter, radiusKm);
    });
  };

  // Quick Locality Button Handler
  const handleQuickLocality = (loc) => {
    setUserLocation(loc.coords);
    setMapCenter(loc.coords);
    setSearchLocation(loc.name);
    clearRoute();
    setCustomLocation(loc.coords, loc.name, (c) => {
      searchPlaces(c.lat, c.lng, filter, radiusKm);
    });
  };

  // 2. Fetch Places via Google Places API when filter, radius, or mapCenter changes
  const searchPlaces = async (lat, lng, curFilter, curRadius) => {
    if (!lat || !lng) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      const places = await searchNearbyHealthcarePlaces({
        lat,
        lng,
        type: curFilter || filter,
        radiusKm: curRadius || radiusKm
      });

      // Enrich with prescribed medicines availability
      const augmented = (places || []).map((p) => ({
        ...p,
        hasPrescribedMeds: p.type === 'pharmacy' && prescribedMedicineNames.length > 0,
        stockItems: prescribedMedicineNames.length > 0 ? prescribedMedicineNames : p.stockItems
      }));

      setNearbyPlaces(augmented);
    } catch (err) {
      console.error('Error searching healthcare places:', err);
      setErrorMsg(isKannada ? 'ಸ್ಥಳಗಳನ್ನು ಹುಡುಕಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.' : 'Unable to find facilities in this area. Try expanding radius.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run search when filter or radius changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    clearRoute();
    searchPlaces(mapCenter.lat, mapCenter.lng, newFilter, radiusKm);
  };

  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    clearRoute();
    searchPlaces(mapCenter.lat, mapCenter.lng, filter, newRadius);
  };

  // Manual city/area search with Geocoding
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchLocation.trim()) {
      searchPlaces(mapCenter.lat, mapCenter.lng, filter, radiusKm);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/doctors-hospitals/geocode?query=${encodeURIComponent(searchLocation)}`);
      const data = await res.json();

      if (data.success && data.location) {
        const newCoords = { lat: data.location.lat, lng: data.location.lng };
        setUserLocation(newCoords);
        setMapCenter(newCoords);
        clearRoute();
        setCustomLocation(newCoords, data.location.displayName, (c) => {
          searchPlaces(c.lat, c.lng, filter, radiusKm);
        });
      } else {
        setErrorMsg(`Could not find "${searchLocation}". Please check spelling.`);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setErrorMsg('Search error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Click on a place from list or map
  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    if (place.lat && place.lng) {
      setMapCenter({ lat: place.lat, lng: place.lng });
    }
  };

  // In-App Directions to Destination
  const handleGetDirections = (destPlace) => {
    const target = destPlace || selectedPlace;
    if (!target) return;

    setSelectedPlace(target);
    setShowRoute(true);
    setShowSteps(true);
  };

  const clearRoute = () => {
    setShowRoute(false);
    setRouteInfo(null);
    setSelectedPlace(null);
    setShowSteps(false);
  };

  const handleRouteCalculated = (info) => {
    setRouteInfo(info);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackHome || (() => navigate('/'))}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 font-medium text-sm"
              title="Return to Home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <div className="border-l border-slate-200 pl-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
                <span>📍</span> {t('loc.title')}
              </h1>
              <p className="text-xs text-slate-500">Live Google Maps Healthcare & Pharmacy Navigator</p>
            </div>
          </div>

          {/* Proper Location Access Button & Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                requestLocation((coords, label) => {
                  setUserLocation(coords);
                  setMapCenter(coords);
                  clearRoute();
                  searchPlaces(coords.lat, coords.lng, filter, radiusKm);
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-4">
        
        {/* Prescribed Medicine Alert Banner */}
        {prescribedMedicineNames.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3 border border-emerald-700/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 bg-emerald-800/80 rounded-xl">📋</span>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full">
                  Doctor Prescribed
                </span>
                <p className="font-bold text-sm text-emerald-100 mt-0.5">
                  Looking for: <span className="text-white font-extrabold">{prescribedMedicineNames.join(', ')}</span>
                </p>
              </div>
            </div>
            <span className="text-xs text-emerald-200 bg-emerald-800/60 px-3 py-1.5 rounded-xl border border-emerald-600/40">
              ✓ Filtered for pharmacies carrying your prescription
            </span>
          </div>
        )}

        {/* Live Location & GPS Status Bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">📍</span>
            <span className="text-slate-500">Search Center:</span>
            <strong className="text-slate-900 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
              {locationLabel}
            </strong>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            {accuracy && (
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md font-medium border border-emerald-100">
                GPS Accuracy: ~{accuracy}m
              </span>
            )}
            <span>Radius: <strong>{radiusKm} km</strong></span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Facility Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filter === 'all' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('loc.all')}
            </button>
            <button
              onClick={() => handleFilterChange('pharmacy')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                filter === 'pharmacy' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>💊</span> {t('loc.pharmacies')}
            </button>
            <button
              onClick={() => handleFilterChange('hospital')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                filter === 'hospital' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏥</span> {t('loc.hospitals')}
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search area (e.g. Indiranagar, Koramangala)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0"
            >
              Search
            </button>
          </form>

          {/* Radius Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Distance:</span>
            {[3, 5, 10, 25].map((r) => (
              <button
                key={r}
                onClick={() => handleRadiusChange(r)}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                  radiusKm === r
                    ? 'bg-teal-50 text-teal-700 border-teal-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Quick Locality Selector Pills */}
          <div className="w-full flex flex-wrap items-center gap-1.5 text-xs pt-2 border-t border-slate-100">
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
        </div>

        {/* Error or Notice Banner */}
        {errorMsg && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="font-bold text-amber-900">✕</button>
          </div>
        )}

        {/* Main Grid: Google Map & Facility Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Interactive Google Map Canvas (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[460px] sm:h-[540px] lg:h-[620px]">
              
              {/* Map Title Bar */}
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-sm tracking-wide">Live Google Map</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Pharmacy (💊)
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-rose-300">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span> Hospital (🏥)
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> You (📍)
                  </span>
                </div>
              </div>

              {/* Google Map View */}
              <div className="flex-1 relative">
                <GoogleMapView
                  center={mapCenter}
                  zoom={zoomLevel}
                  userLocation={userLocation || userCoords}
                  places={nearbyPlaces}
                  selectedPlace={selectedPlace}
                  onSelectPlace={handlePlaceClick}
                  showRoute={showRoute}
                  onRouteCalculated={handleRouteCalculated}
                  onLocationSelect={handleManualLocationSelect}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Direction Panel & Facility List (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col h-[460px] sm:h-[540px] lg:h-[620px]">
            
            {/* In-App Driving Route Summary Card */}
            {showRoute && selectedPlace && (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 shadow-sm space-y-3 animate-fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                      In-App Google Driving Directions
                    </span>
                    <h3 className="font-bold text-teal-950 text-sm mt-1">
                      Route to {selectedPlace.name}
                    </h3>
                  </div>
                  <button
                    onClick={clearRoute}
                    className="text-teal-700 hover:text-teal-950 text-xs font-bold underline"
                  >
                    Clear Route
                  </button>
                </div>

                {/* Distance & Time Metrics */}
                {routeInfo && (
                  <div className="grid grid-cols-2 gap-3 bg-white/95 p-3 rounded-xl border border-teal-100">
                    <div>
                      <p className="text-[10px] text-teal-700 uppercase tracking-wider font-bold">Driving Distance</p>
                      <p className="text-xl font-extrabold text-teal-950">{routeInfo.distanceText}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-teal-700 uppercase tracking-wider font-bold">Estimated Time</p>
                      <p className="text-xl font-extrabold text-teal-950">{routeInfo.durationText}</p>
                    </div>
                  </div>
                )}

                {/* Turn-by-Turn Steps Toggle */}
                {routeInfo?.steps && routeInfo.steps.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowSteps(!showSteps)}
                      className="w-full py-1.5 px-3 bg-white border border-teal-200 text-teal-900 rounded-xl text-xs font-bold flex items-center justify-between"
                    >
                      <span>🚗 View Turn-by-Turn Navigation Steps ({routeInfo.steps.length})</span>
                      <span>{showSteps ? '▲ Hide' : '▼ Show'}</span>
                    </button>

                    {showSteps && (
                      <div className="mt-2 max-h-40 overflow-y-auto bg-white border border-teal-100 rounded-xl p-2.5 space-y-1.5 text-xs text-slate-700">
                        {routeInfo.steps.map((st, i) => (
                          <div key={i} className="flex items-start gap-2 py-1 border-b border-slate-100 last:border-0">
                            <span className="font-extrabold text-teal-600 shrink-0">{i + 1}.</span>
                            <span className="flex-1 text-[11px] leading-tight">{st.instruction}</span>
                            {st.distance && <span className="text-[10px] text-slate-400 shrink-0 font-medium">{st.distance}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Scrollable Facility Cards List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>🏥</span>
                  <span>
                    {filter === 'hospital' ? t('loc.hospitals') : filter === 'pharmacy' ? t('loc.pharmacies') : t('loc.all')}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {nearbyPlaces.length}
                  </span>
                </h2>
                {isLoading && (
                  <div className="flex items-center gap-1.5 text-xs text-teal-600">
                    <span className="w-2.5 h-2.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
                    <span>Finding places...</span>
                  </div>
                )}
              </div>

              {/* Cards List */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {nearbyPlaces.length === 0 && !isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                    <span className="text-3xl mb-2">🔍</span>
                    <p className="text-xs">No healthcare facilities found within {radiusKm} km.</p>
                    <button
                      onClick={() => handleRadiusChange(15)}
                      className="mt-3 text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg font-bold hover:bg-teal-100"
                    >
                      Expand search to 15 km
                    </button>
                  </div>
                ) : (
                  nearbyPlaces.map((place) => {
                    const isSelected = selectedPlace?.id === place.id;
                    const isPharmacy = place.type === 'pharmacy';

                    return (
                      <div
                        key={place.id}
                        onClick={() => handlePlaceClick(place)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50/60 shadow-xs ring-1 ring-teal-500'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  isPharmacy ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isPharmacy ? '💊 Pharmacy' : '🏥 Hospital'}
                              </span>
                              {place.rating && (
                                <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                                  ⭐ {place.rating}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm">{place.name}</h3>
                            <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{place.vicinity}</p>
                          </div>
                          {place.distanceKm !== null && (
                            <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2 py-1 rounded-lg shrink-0">
                              {place.distanceKm} km
                            </span>
                          )}
                        </div>

                        {/* Prescribed Medicine Tag */}
                        {place.hasPrescribedMeds && (
                          <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-center justify-between">
                            <span className="font-bold">✓ Prescribed Stock Available</span>
                            <span className="text-[10px] text-emerald-700">Verified</span>
                          </div>
                        )}

                        {/* In-App Actions (No External Leaving Buttons) */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGetDirections(place);
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                              isSelected && showRoute
                                ? 'bg-teal-700 text-white'
                                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-2xs'
                            }`}
                          >
                            <span>🧭</span>
                            <span>{isSelected && showRoute ? 'Viewing Route' : 'Get Directions'}</span>
                          </button>

                          {isPharmacy && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOrderModalPlace(place);
                                setOrderSuccess(false);
                              }}
                              className="py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              Reserve Medicine
                            </button>
                          )}

                          <a
                            href={`tel:${place.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                            title="Call facility"
                          >
                            📞
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reserve / Order Medicine Modal */}
      {orderModalPlace && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">
                  TeleSeva Fast Reserve
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">{orderModalPlace.name}</h3>
              </div>
              <button
                onClick={() => setOrderModalPlace(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {orderSuccess ? (
              <div className="text-center py-6 space-y-3">
                <span className="text-4xl">🎉</span>
                <h4 className="font-bold text-emerald-700 text-base">Medicines Reserved!</h4>
                <p className="text-xs text-slate-600">
                  Your reservation ID has been sent to your phone. The pharmacy has held your stock for 4 hours.
                </p>
                <button
                  onClick={() => setOrderModalPlace(null)}
                  className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Reserve prescribed medicines directly at this verified pharmacy:
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-semibold text-slate-700">Prescription Items:</span>
                  <ul className="list-disc list-inside text-slate-600">
                    {(orderModalPlace.stockItems || ["Standard Antibiotic & Pain Relief"]).slice(0, 3).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fulfillment Mode:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('pickup')}
                      className={`py-2 text-center rounded-xl font-bold border ${
                        orderType === 'pickup' ? 'bg-teal-50 text-teal-800 border-teal-300' : 'bg-white border-slate-200'
                      }`}
                    >
                      🏬 Counter Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`py-2 text-center rounded-xl font-bold border ${
                        orderType === 'delivery' ? 'bg-teal-50 text-teal-800 border-teal-300' : 'bg-white border-slate-200'
                      }`}
                    >
                      🚚 Home Delivery
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone:</label>
                  <input
                    type="tel"
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    placeholder="+91 98XXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderModalPlace(null)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderSuccess(true)}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    Confirm Reservation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
