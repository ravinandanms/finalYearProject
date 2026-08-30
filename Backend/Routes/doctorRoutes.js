import express from 'express';
import { updateAvailability, getAppointments, createConsultationRecord } from '../Controllers/doctorController.js';
import authMiddleware from '../Middlewares/auth.js';
import { requireDoctor } from '../Middlewares/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware, requireDoctor);

router.put('/:id/availability', updateAvailability);
router.get('/:id/appointments', getAppointments);
router.post('/:id/consultation-record', createConsultationRecord);

export default router;
