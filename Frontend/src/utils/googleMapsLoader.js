// Google Maps JavaScript SDK dynamic loader
let googleMapsPromise = null;

export const GOOGLE_MAPS_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
  'AIzaSyBhToxD2Hm67smI2mhJaOhvEfedmRjNXpY';

/**
 * Loads the Google Maps JavaScript API with Places and Geometry libraries
 * Ensures only a single script instance is ever loaded.
 */
export function loadGoogleMaps(apiKey = GOOGLE_MAPS_API_KEY) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window object is not available'));
  }

  // Already loaded
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script element already exists in DOM
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        existing.addEventListener('load', () => resolve(window.google.maps));
        existing.addEventListener('error', (e) => reject(e));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;

    // Google Maps API auth failure callback
    window.gm_authFailure = () => {
      console.warn('Google Maps API authentication error: Check API key or enabled Google Cloud APIs.');
    };

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps script finished loading, but window.google.maps is undefined'));
      }
    };

    script.onerror = (err) => {
      googleMapsPromise = null;
      console.error('Failed to load Google Maps script tag:', err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
