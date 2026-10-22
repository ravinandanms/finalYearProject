import express from 'express';
import { createOrder, verifyPayment, getRazorpayKey } from '../Controllers/paymentController.js';
import authMiddleware from '../Middlewares/auth.js';

const router = express.Router();

// Allow reading public key ID
router.get('/key', getRazorpayKey);

// Require authentication for creating orders and verifying payments
router.post('/create-order', authMiddleware, createOrder);
router.post('/verify', authMiddleware, verifyPayment);

export default router;
