import express from 'express';
import { updateProfile, getProfile, uploadMedicalRecord, getMedicalRecords, deleteMedicalRecord } from '../Controllers/patientController.js';
import authMiddleware from '../Middlewares/auth.js';
import upload from '../Middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/:id/profile', getProfile);
router.put('/:id/profile', updateProfile);

router.post('/:id/records', upload.single('file'), uploadMedicalRecord);
router.get('/:id/records', getMedicalRecords);
router.delete('/:patientId/records/:recordId', deleteMedicalRecord);

export default router;
