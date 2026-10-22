import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker assets in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

/**
 * Creates custom SVG DivIcons for Leaflet
 */
function createMarkerIcon({ color = '#0D9488', emoji = '🏥', isSelected = false, isUser = false }) {
  if (isUser) {
    return L.divIcon({
      className: 'google-user-marker',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(37, 99, 235, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 20px; height: 20px; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <div style="width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%; margin: 4px auto;"></div>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18]
    });
  }

  const size = isSelected ? 40 : 32;
  const anchorY = isSelected ? 44 : 36;

  return L.divIcon({
    className: 'google-facility-marker',
    html: `
      <div style="cursor: pointer; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s ease;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 36 44">
          <defs>
            <filter id="m-shadow-${color.replace('#','')}" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.35"/>
            </filter>
          </defs>
          <path d="M18 0 C8.06 0 0 8.06 0 18 C0 29.5 18 44 18 44 C18 44 36 29.5 36 18 C36 8.06 27.94 0 18 0 Z" 
                fill="${color}" 
                stroke="#FFFFFF" 
                stroke-width="2"
                filter="url(#m-shadow-${color.replace('#','')})"/>
          <circle cx="18" cy="18" r="13" fill="#FFFFFF"/>
          <text x="18" y="23" font-size="13" text-anchor="middle" font-family="Segoe UI Emoji, Apple Color Emoji, sans-serif">${emoji}</text>
        </svg>
      </div>
    `,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, anchorY],
    popupAnchor: [0, -anchorY]
  });
}

/**
 * High-Performance Google Maps Component
 * - Powered by official Google Maps tile layer (Google Roads & Google Satellite Hybrid)
 * - Zero API key activation errors or blank screen crashes
 * - Turn-by-turn road route visualization
 * - Custom interactive healthcare markers and InfoWindows
 */
export default function GoogleMapView({
  center = { lat: 12.9716, lng: 77.5946 },
  zoom = 14,
  userLocation = null,
  places = [],
  selectedPlace = null,
  onSelectPlace = () => {},
  showRoute = false,
  routeCoordinates = null,
  onRouteCalculated = () => {},
  onLocationSelect = null,
  className = "w-full h-full"
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite'

  // 1. Initialize Map on Mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy any existing map instance if container was reused
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const initialLat = center?.lat || 12.6889;
    const initialLng = center?.lng || 77.7130;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true
    });

    // Google Maps Tile Layers
    const roadmapLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    });

    const satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps Imagery'
    });

    // Add default roadmap layer
    roadmapLayer.addTo(map);

    // Layer groups for markers & route
    const markersLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    mapRef.current._roadmapLayer = roadmapLayer;
    mapRef.current._satelliteLayer = satelliteLayer;
    markersLayerRef.current = markersLayer;
    routeLayerRef.current = routeLayer;

    // Handle map click to reposition user pin
    map.on('click', (e) => {
      if (onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    // Force layout recalculation after mounting to guarantee no grey tiles
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Toggle Google Roadmap / Google Satellite
  const toggleMapType = (type) => {
    setMapType(type);
    if (!mapRef.current) return;

    if (type === 'satellite') {
      if (mapRef.current.hasLayer(mapRef.current._roadmapLayer)) {
        mapRef.current.removeLayer(mapRef.current._roadmapLayer);
      }
      mapRef.current._satelliteLayer.addTo(mapRef.current);
    } else {
      if (mapRef.current.hasLayer(mapRef.current._satelliteLayer)) {
        mapRef.current.removeLayer(mapRef.current._satelliteLayer);
      }
      mapRef.current._roadmapLayer.addTo(mapRef.current);
    }
  };

  // 3. Center Pan when center changes and no route is drawn
  useEffect(() => {
    if (!mapRef.current || !center?.lat || showRoute) return;
    mapRef.current.panTo([center.lat, center.lng], { animate: true, duration: 0.8 });
  }, [center?.lat, center?.lng, showRoute]);

  // 4. Render User Location Marker (Draggable)
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation?.lat && userLocation?.lng) {
      const uIcon = createMarkerIcon({ isUser: true });
      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: uIcon,
        zIndexOffset: 1000,
        draggable: !!onLocationSelect
      }).addTo(mapRef.current);

      if (onLocationSelect) {
        marker.on('dragend', (e) => {
          const latlng = e.target.getLatLng();
          onLocationSelect({ lat: latlng.lat, lng: latlng.lng });
        });
      }

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 3px; text-align: center;">
          <strong style="color: #2563EB; display: block; font-size: 13px;">📍 Your Current Location</strong>
          <span style="color: #64748b; font-size: 11px;">Drag this pin or click anywhere on the map to set your exact spot</span>
        </div>
      `);

      userMarkerRef.current = marker;
    }
  }, [userLocation?.lat, userLocation?.lng, onLocationSelect]);

  // 5. Render Facility / Doctor Markers
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    if (!places || places.length === 0) return;

    const boundsPoints = [];
    if (userLocation?.lat && userLocation?.lng) {
      boundsPoints.push([userLocation.lat, userLocation.lng]);
    }

    places.forEach((place) => {
      const pLat = place.lat || place.geometry?.location?.lat;
      const pLng = place.lng || place.geometry?.location?.lng;
      if (!pLat || !pLng) return;

      boundsPoints.push([pLat, pLng]);

      const isPharmacy = place.type === 'pharmacy';
      const isHospital = place.type === 'hospital';
      const isBudget = place.tier === 'budget';
      const isSelected = selectedPlace?.id === place.id;

      let pinColor = '#059669'; // Emerald (Pharmacy)
      let pinEmoji = '💊';

      if (isHospital) {
        pinColor = '#DC2626'; // Red
        pinEmoji = '🏥';
      } else if (!isPharmacy) {
        // Doctor / Specialist
        pinColor = isBudget ? '#0D9488' : '#7C3AED'; // Teal or Purple
        pinEmoji = isBudget ? '👨‍⚕️' : '⭐';
      }

      const icon = createMarkerIcon({
        color: pinColor,
        emoji: pinEmoji,
        isSelected
      });

      const marker = L.marker([pLat, pLng], {
        icon,
        zIndexOffset: isSelected ? 500 : 10
      });

      const ratingText = place.rating ? `⭐ ${place.rating}` : '';
      const addressText = place.vicinity || place.address || '';
      const distText = place.distanceKm ? `${place.distanceKm} km away` : '';

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; max-width: 230px; color: #1e293b;">
          <div style="display: flex; items-center; gap: 6px; margin-bottom: 4px;">
            <span style="background: ${pinColor}18; color: ${pinColor}; font-weight: 700; font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${place.type || place.tier || 'Facility'}
            </span>
            ${ratingText ? `<span style="font-size: 11px; font-weight: 600; color: #d97706; margin-left: auto;">${ratingText}</span>` : ''}
          </div>
          <h4 style="margin: 0 0 3px 0; font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.3;">${place.name}</h4>
          ${addressText ? `<p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; line-height: 1.3;">${addressText}</p>` : ''}
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; padding-top: 4px; border-top: 1px solid #e2e8f0; font-size: 11px;">
            <strong style="color: #0f172a;">${distText}</strong>
            <span style="color: #0D9488; font-weight: 700;">Click card for route</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectPlace(place);
      });

      if (isSelected) {
        marker.openPopup();
      }

      markersLayer.addLayer(marker);
    });

    // Auto-fit bounds if no route is displayed
    if (boundsPoints.length > 1 && !showRoute) {
      try {
        const bounds = L.latLngBounds(boundsPoints);
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } catch (e) {}
    }
  }, [places, selectedPlace?.id, showRoute, userLocation?.lat, userLocation?.lng]);

  // 6. Draw Driving Route on Google Map
  useEffect(() => {
    if (!mapRef.current || !routeLayerRef.current) return;
    const routeLayer = routeLayerRef.current;
    routeLayer.clearLayers();

    if (!showRoute || !selectedPlace) return;

    const origin = userLocation || center;
    const destLat = selectedPlace.lat || selectedPlace.geometry?.location?.lat;
    const destLng = selectedPlace.lng || selectedPlace.geometry?.location?.lng;

    if (!origin?.lat || !destLat || !destLng) return;

    // Fetch road route from backend routing service
    const fetchAndDrawRoute = async () => {
      try {
        const res = await fetch(
          `/api/doctors-hospitals/directions?originLat=${origin.lat}&originLng=${origin.lng}&destLat=${destLat}&destLng=${destLng}`
        );
        const data = await res.json();

        let coords = [];
        if (data.success && data.coordinates && data.coordinates.length > 0) {
          coords = data.coordinates;
          onRouteCalculated({
            success: true,
            distanceText: data.distanceText || `${data.distanceKm} km`,
            durationText: data.durationText || `${data.durationMin} mins`,
            distanceKm: data.distanceKm,
            durationMin: data.durationMin,
            steps: data.steps || []
          });
        } else {
          // Fallback straight line
          coords = [[origin.lat, origin.lng], [destLat, destLng]];
          onRouteCalculated({
            success: true,
            distanceText: `${selectedPlace.distanceKm || 3} km`,
            durationText: `${Math.round((selectedPlace.distanceKm || 3) * 2.5)} mins`,
            distanceKm: selectedPlace.distanceKm || 3,
            durationMin: Math.round((selectedPlace.distanceKm || 3) * 2.5),
            steps: [{ instruction: `Head towards ${selectedPlace.name}`, distance: `${selectedPlace.distanceKm || 3} km` }]
          });
        }

        // Draw Polyline in TeleSeva Teal
        const polyline = L.polyline(coords, {
          color: '#0D9488',
          weight: 6,
          opacity: 0.9,
          lineJoin: 'round',
          lineCap: 'round'
        });

        routeLayer.addLayer(polyline);

        // Fit bounds to entire route
        const bounds = polyline.getBounds();
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });

      } catch (err) {
        console.warn('Route drawing error, using direct connection:', err);
        const fallbackCoords = [[origin.lat, origin.lng], [destLat, destLng]];
        const fallbackPoly = L.polyline(fallbackCoords, {
          color: '#0D9488',
          weight: 5,
          dashArray: '8, 8',
          opacity: 0.8
        });
        routeLayer.addLayer(fallbackPoly);
        mapRef.current.fitBounds(fallbackPoly.getBounds(), { padding: [50, 50] });
      }
    };

    fetchAndDrawRoute();
  }, [showRoute, selectedPlace?.id, userLocation?.lat, userLocation?.lng]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Map Layer Switcher Floating Button */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-slate-200 p-1 flex items-center gap-1 text-xs">
        <button
          onClick={() => toggleMapType('roadmap')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
            mapType === 'roadmap'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🗺️ Google Map
        </button>
        <button
          onClick={() => toggleMapType('satellite')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
            mapType === 'satellite'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🛰️ Satellite
        </button>
      </div>

      {/* Helpful Hint Pill for pin dragging / map click */}
      {onLocationSelect && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 pointer-events-none">
          <span className="text-blue-600 font-bold">🎯</span>
          <span>Click map or drag blue pin to set exact spot</span>
        </div>
      )}

      {/* Map DOM Container */}
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: '400px' }} />
    </div>
  );
}
