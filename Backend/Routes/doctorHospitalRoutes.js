import express from 'express';
import { getDoctorAndHospitalRecommendations } from '../Controllers/doctorHospitalController.js';

const router = express.Router();

// POST /api/doctors-hospitals/recommend
router.post('/recommend', getDoctorAndHospitalRecommendations);

export default router;
