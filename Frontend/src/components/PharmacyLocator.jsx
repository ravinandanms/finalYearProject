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

// Component to handle map centering and programmatic zoom
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function PharmacyLocator({ onBackHome }) {
  const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi coordinates
  const [mapCenter, setMapCenter] = useState(defaultLocation);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Get user's current location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
          setMapCenter(userPos);
          setZoomLevel(14);
          searchNearbyPlaces(userPos.lat, userPos.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Still fetch default if user denies
          searchNearbyPlaces(defaultLocation.lat, defaultLocation.lng);
        }
      );
    } else {
      searchNearbyPlaces(defaultLocation.lat, defaultLocation.lng);
    }
  }, []);

  const searchNearbyPlaces = async (lat, lng) => {
    if (!lat || !lng) return;

    setIsLoading(true);
    setNearbyPlaces([]);
    setSelectedPlace(null);
    setRouteCoordinates([]);

    // Overpass API query for pharmacies and hospitals within 5000 meters
    const radius = 5000;
    const query = `
      [out:json];
      (
        node["amenity"="pharmacy"](around:${radius},${lat},${lng});
        way["amenity"="pharmacy"](around:${radius},${lat},${lng});
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const data = await response.json();
      
      const places = data.elements.map(el => {
        // Way types have their center coords provided because of "out center"
        const elementLat = el.lat || el.center?.lat;
        const elementLon = el.lon || el.center?.lon;
        const name = el.tags?.name || (el.tags?.amenity === 'pharmacy' ? 'Unknown Pharmacy' : 'Unknown Hospital');
        const vicinity = el.tags?.['addr:street'] 
          ? `${el.tags?.['addr:housenumber'] || ''} ${el.tags?.['addr:street']}`.trim()
          : (el.tags?.['addr:city'] || 'Location not specified');
          
        return {
          id: el.id,
          name: name,
          type: el.tags?.amenity,
          geometry: {
            location: {
              lat: elementLat,
              lng: elementLon
            }
          },
          vicinity: vicinity,
          details: el.tags // Store all tags for details view
        };
      }).filter(place => place.geometry.location.lat && place.geometry.location.lng);

      setNearbyPlaces(places);
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setRouteCoordinates([]); // Clear previous route
  };

  const getDirections = async () => {
    const origin = userLocation || mapCenter;
    if (!selectedPlace || !origin) return;

    const dest = selectedPlace.geometry.location;
    
    // OSRM expects longitude,latitude
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // GeoJSON uses [longitude, latitude], Leaflet Polyline uses [latitude, longitude]
        const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(coordinates);
      } else {
        alert('Could not find a route.');
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      alert('Error fetching directions.');
    }
  };

  const clearDirections = () => {
    setRouteCoordinates([]);
  };

  const handleManualSearch = async () => {
    if (!searchLocation.trim()) {
      searchNearbyPlaces(mapCenter.lat, mapCenter.lng);
      return;
    }

    // Use Nominatim API to geocode the search term
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
        searchNearbyPlaces(location.lat, location.lng);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      alert('Error searching for location.');
    }
  };

  const isOpenNow = (tags) => {
    if (!tags || !tags.opening_hours) return 'Unknown';
    // parsing opening_hours from OSM can be complex, just showing the raw string for now
    return tags.opening_hours; 
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
              <h1 className="text-2xl font-bold text-slate-800">Pharmacy & Hospital Locator</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                placeholder="Search for a location..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleManualSearch}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Search Location
            </button>
            <button
              onClick={() => {
                if (userLocation) {
                  setMapCenter(userLocation);
                  setZoomLevel(14);
                  searchNearbyPlaces(userLocation.lat, userLocation.lng);
                } else {
                  alert('Unable to get your current location. Please ensure location access is granted.');
                }
              }}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Use My Location
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden relative z-0">
              <div className="w-full h-96 lg:h-[600px]">
                <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapUpdater center={mapCenter} zoom={zoomLevel} />
                  
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
                        <div className="p-2">
                          <h3 className="font-semibold text-sm">{place.name}</h3>
                          <p className="text-xs text-gray-600">{place.vicinity}</p>
                          <p className="text-xs text-blue-600">{place.type === 'pharmacy' ? 'Pharmacy' : 'Hospital'}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Route Polyline */}
                  {routeCoordinates.length > 0 && (
                    <Polyline positions={routeCoordinates} color="blue" weight={5} opacity={0.7} />
                  )}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nearby Places */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Nearby Places</h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-slate-600">Searching OpenStreetMap...</span>
                </div>
              ) : nearbyPlaces.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {nearbyPlaces.map((place) => (
                    <div
                      key={place.id}
                      onClick={() => handlePlaceClick(place)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlace?.id === place.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-slate-800">{place.name}</h3>
                          <p className="text-xs text-slate-600 mt-1">{place.vicinity}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              place.type === 'pharmacy' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {place.type === 'pharmacy' ? 'Pharmacy' : 'Hospital'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  Search for a location to find nearby pharmacies and hospitals
                </p>
              )}
            </div>

            {/* Place Details */}
            {selectedPlace && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Place Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">{selectedPlace.name}</h3>
                    <p className="text-sm text-slate-600">{selectedPlace.vicinity}</p>
                  </div>

                  {selectedPlace.details?.phone && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">Phone:</p>
                      <p className="text-sm text-slate-600">{selectedPlace.details.phone}</p>
                    </div>
                  )}
                  
                  {selectedPlace.details?.website && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">Website:</p>
                      <a href={selectedPlace.details.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                        {selectedPlace.details.website}
                      </a>
                    </div>
                  )}

                  {selectedPlace.details?.opening_hours && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">Hours:</p>
                      <p className="text-sm text-slate-600">
                        {isOpenNow(selectedPlace.details)}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={getDirections}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Get Directions
                    </button>
                    {routeCoordinates.length > 0 && (
                      <button
                        onClick={clearDirections}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Clear Route
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
