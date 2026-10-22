import express from 'express';
import {
  getDoctorAndHospitalRecommendations,
  geocodeLocation,
  reverseGeocodeLocation,
  getDirections,
  detectUserLocation,
  getNearbyFacilities
} from '../Controllers/doctorHospitalController.js';

const router = express.Router();

// Recommendation endpoint
router.post('/recommend', getDoctorAndHospitalRecommendations);

// Reverse geocoding: coordinates to human-readable address
router.get('/reverse-geocode', reverseGeocodeLocation);

// Geocoding endpoint: converts city/area name into precise coordinates
router.get('/geocode', geocodeLocation);
router.post('/geocode', geocodeLocation);

// Turn-by-turn road driving directions endpoint
router.get('/directions', getDirections);
router.post('/directions', getDirections);

// IP-based reliable location detection
router.get('/detect-location', detectUserLocation);

// Localized pharmacies and hospitals around coordinates
router.get('/nearby-facilities', getNearbyFacilities);

export default router;
