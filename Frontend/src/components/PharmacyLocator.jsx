import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack/Vite
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
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const userIcon = createCustomIcon(`
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
    <circle cx="12" cy="12" r="3" fill="white"/>
  </svg>
`, 'user-marker');

const pharmacyIcon = createCustomIcon(`
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#10B981" stroke="white" stroke-width="2"/>
    <path d="M8 12h8M12 8v8" stroke="white" stroke-width="2" stroke-linecap="round"/>
  </svg>
`, 'pharmacy-marker');

const hospitalIcon = createCustomIcon(`
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#EF4444" stroke="white" stroke-width="2"/>
    <path d="M12 6v6l4 2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`, 'hospital-marker');

// Haversine formula to calculate straight-line distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; 
  return d;
}

// Component to handle map centering and programmatic zoom/fitting
function MapUpdater({ center, zoom, routeCoordinates }) {
  const map = useMap();
  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, routeCoordinates, map]);
  return null;
}

export default function PharmacyLocator({ onBackHome }) {
  const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi fallback
  
  const [mapCenter, setMapCenter] = useState(defaultLocation);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null); // { distance, time }
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'hospital', 'pharmacy'

  // Fetch location initially
  useEffect(() => {
    handleUseMyLocation(false);
  }, []);

  // Re-fetch places if filter changes and we have a location
  useEffect(() => {
    if (mapCenter) {
      searchNearbyPlaces(mapCenter.lat, mapCenter.lng, filter);
    }
  }, [filter]);

  const handleUseMyLocation = (showErrors = true) => {
    if (!navigator.geolocation) {
      if (showErrors) setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Validate coordinates
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          setErrorMsg('Invalid coordinates received from device.');
          setIsLoading(false);
          return;
        }

        const userPos = { lat, lng };
        setUserLocation(userPos);
        setMapCenter(userPos);
        setZoomLevel(14);
        setRouteCoordinates([]);
        setRouteInfo(null);
        setSelectedPlace(null);
        searchNearbyPlaces(userPos.lat, userPos.lng, filter);
      },
      (error) => {
        setIsLoading(false);
        console.error('Error getting location:', error);
        if (!showErrors) {
          searchNearbyPlaces(defaultLocation.lat, defaultLocation.lng, filter);
          return;
        }
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg("Location permission was denied. Please allow location access to find nearby hospitals and medical stores.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg("Unable to determine your current location. Please try again.");
            break;
          case error.TIMEOUT:
            setErrorMsg("Location request timed out. Please try again.");
            break;
          default:
            setErrorMsg("An unknown error occurred while getting location.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const searchNearbyPlaces = async (lat, lng, currentFilter) => {
    if (!lat || !lng) return;

    setIsLoading(true);
    setNearbyPlaces([]);
    setSelectedPlace(null);
    setRouteCoordinates([]);
    setRouteInfo(null);
    setErrorMsg('');

    const radius = 5000;
    
    // Construct Overpass query based on filter
    let queryNodes = '';
    if (currentFilter === 'hospital' || currentFilter === 'all') {
      queryNodes += `node["amenity"="hospital"](around:${radius},${lat},${lng});
                     way["amenity"="hospital"](around:${radius},${lat},${lng});`;
    }
    if (currentFilter === 'pharmacy' || currentFilter === 'all') {
      queryNodes += `node["amenity"="pharmacy"](around:${radius},${lat},${lng});
                     way["amenity"="pharmacy"](around:${radius},${lat},${lng});`;
    }

    const query = `
      [out:json];
      (
        ${queryNodes}
      );
      out center;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'data=' + encodeURIComponent(query)
      });
      
      if (!response.ok) {
        throw new Error('Overpass API failed');
      }

      const data = await response.json();
      
      const places = data.elements.map(el => {
        const elementLat = el.lat || el.center?.lat;
        const elementLon = el.lon || el.center?.lon;
        const name = el.tags?.name || (el.tags?.amenity === 'pharmacy' ? 'Unnamed Pharmacy' : 'Unnamed Hospital');
        const vicinity = el.tags?.['addr:street'] 
          ? `${el.tags?.['addr:housenumber'] || ''} ${el.tags?.['addr:street']}`.trim()
          : (el.tags?.['addr:city'] || 'Address not available');
        
        let straightLineDistance = null;
        if (userLocation) {
          straightLineDistance = calculateDistance(userLocation.lat, userLocation.lng, elementLat, elementLon);
        }
          
        return {
          id: el.id,
          name: name,
          type: el.tags?.amenity,
          geometry: {
            location: { lat: elementLat, lng: elementLon }
          },
          vicinity: vicinity,
          details: el.tags,
          distanceKm: straightLineDistance
        };
      }).filter(place => place.geometry.location.lat && place.geometry.location.lng);

      // Sort by distance if available
      places.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

      setNearbyPlaces(places);
      
      if (places.length === 0) {
        const typeStr = currentFilter === 'hospital' ? 'hospitals' : currentFilter === 'pharmacy' ? 'medical stores/pharmacies' : 'hospitals or medical stores';
        setErrorMsg(`No ${typeStr} found within ${radius/1000} km.`);
      }

    } catch (error) {
      console.error('Error searching places:', error);
      setErrorMsg('Unable to load nearby locations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setRouteCoordinates([]); 
    setRouteInfo(null);
  };

  const getDirections = async () => {
    const origin = userLocation;
    if (!origin) {
      setErrorMsg('Current location is unknown. Please click "Use My Location" first.');
      return;
    }
    if (!selectedPlace) return;

    setIsLoading(true);
    setErrorMsg('');

    const dest = selectedPlace.geometry.location;
    
    // OSRM expects longitude,latitude
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // GeoJSON uses [longitude, latitude], Leaflet Polyline uses [latitude, longitude]
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        setRouteCoordinates(coordinates);
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1), // convert meters to km
          time: Math.round(route.duration / 60) // convert seconds to minutes
        });
      } else {
        setErrorMsg('Unable to find a route to this location.');
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      setErrorMsg('Unable to find a route to this location. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearDirections = () => {
    setRouteCoordinates([]);
    setRouteInfo(null);
  };

  const handleManualSearch = async () => {
    if (!searchLocation.trim()) {
      searchNearbyPlaces(mapCenter.lat, mapCenter.lng, filter);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}&limit=1`;
    
    try {
      const response = await fetch(url);
      const results = await response.json();
      
      if (results && results.length > 0) {
        const location = {
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon)
        };
        setMapCenter(location);
        setZoomLevel(14);
        // Clear user location so distance isn't incorrectly calculated from old user location
        setUserLocation(null); 
        searchNearbyPlaces(location.lat, location.lng, filter);
      } else {
        setErrorMsg('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      setErrorMsg('Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <h1 className="text-2xl font-bold text-slate-800">Pharmacy & Hospital Locator</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Controls */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Filter Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('hospital')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'hospital' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
              >
                Hospitals
              </button>
              <button 
                onClick={() => setFilter('pharmacy')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'pharmacy' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
              >
                Medical Stores
              </button>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-64 relative">
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  placeholder="Search location manually..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleManualSearch}
                className="bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-slate-700 transition-colors font-medium whitespace-nowrap"
              >
                Search
              </button>
              <button
                onClick={() => handleUseMyLocation(true)}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium whitespace-nowrap flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                Use My Location
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message Banner */}
      {errorMsg && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-red-700 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
            </svg>
            {errorMsg}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Map */}
          <div className="lg:col-span-2 h-[500px] lg:h-[700px] flex flex-col">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden relative z-0 flex-1">
              <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapUpdater center={mapCenter} zoom={zoomLevel} routeCoordinates={routeCoordinates} />
                
                {/* User Location Marker */}
                {userLocation && (
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>Your Location</Popup>
                  </Marker>
                )}

                {/* Nearby Places Markers */}
                {nearbyPlaces.map((place) => (
                  <Marker 
                    key={place.id} 
                    position={[place.geometry.location.lat, place.geometry.location.lng]}
                    icon={place.type === 'pharmacy' ? pharmacyIcon : hospitalIcon}
                    eventHandlers={{
                      click: () => handlePlaceClick(place),
                    }}
                  >
                    <Popup>
                      <div className="p-2 w-48">
                        <h3 className="font-semibold text-sm mb-1">{place.name}</h3>
                        {place.distanceKm !== null && (
                          <p className="text-xs font-medium text-blue-600 mb-2">{place.distanceKm.toFixed(1)} km away (straight line)</p>
                        )}
                        <p className="text-xs text-gray-600 mb-3">{place.vicinity}</p>
                        
                        <button
                          onClick={getDirections}
                          className="w-full bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors text-xs font-medium"
                        >
                          Get Directions
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Route Polyline */}
                {routeCoordinates.length > 0 && (
                  <Polyline positions={routeCoordinates} color="#2563EB" weight={6} opacity={0.8} />
                )}
              </MapContainer>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 flex flex-col h-[500px] lg:h-[700px]">
            
            {/* Route Info Card */}
            {routeInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-blue-900">Route Information</h3>
                  <button onClick={clearDirections} className="text-blue-600 hover:text-blue-800 text-sm underline">Clear</button>
                </div>
                <div className="flex gap-6 mt-3">
                  <div>
                    <p className="text-xs text-blue-700 uppercase tracking-wider font-semibold">Travel Distance</p>
                    <p className="text-lg font-bold text-blue-900">{routeInfo.distance} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 uppercase tracking-wider font-semibold">Est. Time</p>
                    <p className="text-lg font-bold text-blue-900">{routeInfo.time} min</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nearby Places List */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex-1 flex flex-col overflow-hidden">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                {filter === 'hospital' ? 'Nearby Hospitals' : filter === 'pharmacy' ? 'Nearby Medical Stores' : 'Nearby Places'}
              </h2>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <span className="text-slate-500 text-sm">Searching OpenStreetMap...</span>
                </div>
              ) : nearbyPlaces.length > 0 ? (
                <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                  {nearbyPlaces.map((place) => (
                    <div
                      key={place.id}
                      onClick={() => handlePlaceClick(place)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPlace?.id === place.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-sm text-slate-800">{place.name}</h3>
                        {place.distanceKm !== null && (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {place.distanceKm.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2">{place.vicinity}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm ${
                          place.type === 'pharmacy' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {place.type === 'pharmacy' ? 'Pharmacy' : 'Hospital'}
                        </span>
                        
                        {selectedPlace?.id === place.id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); getDirections(); }}
                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium"
                          >
                            Get Directions
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <p className="text-sm text-center px-4">
                    {errorMsg || "No places found. Try a different search or use your location."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
