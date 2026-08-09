import express from 'express';
import { getDoctors } from '../Controllers/userController.js';
import authMiddleware from '../Middlewares/auth.js';

const router = express.Router();

// Protect the routes so only logged in users can see doctors
router.get('/doctors', authMiddleware, getDoctors);

export default router;
