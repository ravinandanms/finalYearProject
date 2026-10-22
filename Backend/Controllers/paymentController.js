import Razorpay from 'razorpay';
import crypto from 'crypto';
import Appointment from '../Models/Appointment.js';

const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TqtFL0lzMVCNj0';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'Z5FtdKHl64GY01XRlX8O09UG';
    return new Razorpay({ key_id, key_secret });
};

// GET /api/payments/key - Get public Razorpay Key ID
export const getRazorpayKey = async (req, res) => {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TqtFL0lzMVCNj0';
        res.status(200).json({ keyId });
    } catch (error) {
        res.status(500).json({ message: "Error fetching Razorpay key", error: error.message });
    }
};

// POST /api/payments/create-order - Create Razorpay order
export const createOrder = async (req, res) => {
    try {
        const { amount, appointmentId } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: "A valid payment amount is required" });
        }

        const razorpay = getRazorpayInstance();
        const amountInPaise = Math.round(Number(amount) * 100);

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${appointmentId ? String(appointmentId).slice(-6) : Date.now().toString().slice(-6)}`,
            notes: {
                patientId: req.userData?.userId || 'guest',
                appointmentId: appointmentId || ''
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TqtFL0lzMVCNj0'
        });
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).json({ message: "Failed to create Razorpay order", error: error.message });
    }
};

// POST /api/payments/verify - Verify Razorpay payment signature
export const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            appointmentId, 
            amount 
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing payment verification parameters" 
            });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || 'Z5FtdKHl64GY01XRlX8O09UG';
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({ 
                success: false, 
                message: "Payment signature verification failed. Invalid transaction." 
            });
        }

        // Update appointment status if appointmentId provided
        let updatedAppointment = null;
        if (appointmentId) {
            const appointment = await Appointment.findById(appointmentId);
            if (appointment) {
                appointment.paymentStatus = 'Paid';
                appointment.paymentDetails = {
                    transactionId: razorpay_payment_id,
                    paymentMethod: 'RAZORPAY',
                    amount: Number(amount) || appointment.consultationFee,
                    paidAt: new Date(),
                    receiptNumber: `REC-RZP-${Date.now().toString().slice(-6)}`
                };
                await appointment.save();
                updatedAppointment = await Appointment.findById(appointmentId)
                    .populate('doctorId', 'name email specialization')
                    .populate('patientId', 'name email phone');
            }
        }

        res.status(200).json({
            success: true,
            message: "Payment successfully verified and recorded",
            transactionId: razorpay_payment_id,
            orderId: razorpay_order_id,
            appointment: updatedAppointment
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ message: "Payment verification error", error: error.message });
    }
};
