import express from 'express';
import { getDoctors } from '../Controllers/userController.js';

const router = express.Router();

// Allow fetching the list of registered doctors
router.get('/doctors', getDoctors);

export default router;

