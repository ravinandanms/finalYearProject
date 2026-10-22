import { useState, useCallback, useEffect } from 'react';

const ANEKAL_DEFAULT = { lat: 12.6889, lng: 77.7130 };

/**
 * Custom Hook for Proper Location Access
 * - Prioritizes User-Selected Location (e.g. Anekal) persisted in localStorage
 * - Draggable pin / map click support to pinpoint exact home/clinic location
 * - Reverse Geocoding with clean locality/town name
 * - High-accuracy HTML5 Geolocation with fallback
 */
export function useProperLocation(defaultCenter = ANEKAL_DEFAULT) {
  // Check if user previously saved their location
  const getSavedCoords = () => {
    try {
      const saved = localStorage.getItem('teleseva_user_coords');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultCenter;
  };

  const getSavedLabel = () => {
    try {
      const saved = localStorage.getItem('teleseva_user_label');
      if (saved) return saved;
    } catch (e) {}
    return 'Anekal, Karnataka';
  };

  const [coords, setCoords] = useState(getSavedCoords);
  const [accuracy, setAccuracy] = useState(null);
  const [locationLabel, setLocationLabel] = useState(getSavedLabel);
  const [status, setStatus] = useState('idle'); // 'idle' | 'detecting' | 'granted' | 'denied' | 'custom'
  const [errorMessage, setErrorMessage] = useState('');

  // Reverse geocode lat/lng to readable locality/town string
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(`/api/doctors-hospitals/reverse-geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.success && data.location) {
        return data.location.shortName || data.location.displayName || 'Anekal';
      }
    } catch (e) {}

    try {
      const bRes = await fetch(`/api/doctors-hospitals/geocode?query=${lat},${lng}`);
      const bData = await bRes.json();
      if (bData.success && bData.location?.displayName) {
        return bData.location.shortName || bData.location.displayName;
      }
    } catch (e) {}

    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }, []);

  // Explicitly set location (from search, quick pill, or map pin drag/click)
  const setCustomLocation = useCallback(async (newCoords, customLabel, onLocationSuccess) => {
    setCoords(newCoords);
    setStatus('custom');
    setAccuracy(null);

    let finalLabel = customLabel;
    if (!finalLabel) {
      finalLabel = await reverseGeocode(newCoords.lat, newCoords.lng);
    }

    setLocationLabel(finalLabel);

    // Save to localStorage for persistence
    try {
      localStorage.setItem('teleseva_user_coords', JSON.stringify(newCoords));
      localStorage.setItem('teleseva_user_label', finalLabel);
    } catch (e) {}

    if (onLocationSuccess) {
      onLocationSuccess(newCoords, finalLabel, null);
    }
  }, [reverseGeocode]);

  // Request browser GPS
  const requestLocation = useCallback(async (onLocationSuccess) => {
    setStatus('detecting');
    setErrorMessage('');

    if (!navigator.geolocation) {
      setStatus('fallback');
      setErrorMessage('Geolocation not supported by browser. Using saved location.');
      fallbackToDefault(onLocationSuccess);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const userAcc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;

        const newCoords = { lat: userLat, lng: userLng };
        setCoords(newCoords);
        setAccuracy(userAcc);
        setStatus('granted');

        const address = await reverseGeocode(userLat, userLng);
        setLocationLabel(address);

        try {
          localStorage.setItem('teleseva_user_coords', JSON.stringify(newCoords));
          localStorage.setItem('teleseva_user_label', address);
        } catch (e) {}

        if (onLocationSuccess) {
          onLocationSuccess(newCoords, address, userAcc);
        }
      },
      async (err) => {
        console.warn('GPS position error:', err.message);
        setStatus('denied');
        setErrorMessage('Browser GPS unavailable. Set location via search or map pin.');
        fallbackToDefault(onLocationSuccess);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [reverseGeocode]);

  const fallbackToDefault = (onLocationSuccess) => {
    const curCoords = getSavedCoords();
    const curLabel = getSavedLabel();
    setCoords(curCoords);
    setLocationLabel(curLabel);
    if (onLocationSuccess) {
      onLocationSuccess(curCoords, curLabel, null);
    }
  };

  return {
    coords,
    setCoords,
    accuracy,
    locationLabel,
    setLocationLabel,
    status,
    errorMessage,
    requestLocation,
    setCustomLocation,
    reverseGeocode
  };
}
