import express from 'express';
import { 
    updateProfile, 
    getProfile, 
    uploadMedicalRecord, 
    getMedicalRecords, 
    deleteMedicalRecord,
    getAppointments,
    payAppointment 
} from '../Controllers/patientController.js';
import authMiddleware from '../Middlewares/auth.js';
import upload from '../Middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/:id/profile', getProfile);
router.put('/:id/profile', updateProfile);

router.post('/:id/records', upload.single('file'), uploadMedicalRecord);
router.get('/:id/records', getMedicalRecords);
router.delete('/:patientId/records/:recordId', deleteMedicalRecord);

router.get('/:id/appointments', getAppointments);
router.post('/:id/appointments/:appointmentId/pay', payAppointment);

export default router;

