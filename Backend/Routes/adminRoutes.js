import express from 'express';
import { getStatistics, getDoctors, updateDoctorStatus, getPatients, updatePatientStatus, getAppointments } from '../Controllers/adminController.js';
import authMiddleware from '../Middlewares/auth.js';
import { requireAdmin } from '../Middlewares/roleMiddleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware, requireAdmin);

router.get('/statistics', getStatistics);

router.get('/doctors', getDoctors);
router.patch('/doctors/:id/status', updateDoctorStatus);

router.get('/patients', getPatients);
router.patch('/patients/:id/status', updatePatientStatus);

router.get('/appointments', getAppointments);

export default router;
