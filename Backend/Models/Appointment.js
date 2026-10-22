import mongoose from "mongoose";

const medicineItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dosage: { type: String, default: "1 Tab" },
    frequency: { type: String, default: "1-0-1 (Morning-Night)" },
    duration: { type: String, default: "5 Days" },
    instructions: { type: String, default: "After food with warm water" }
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Waiting', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Upcoming'
    },
    reason: String,
    diagnosis: String,
    prescription: String,
    prescribedMedicines: [medicineItemSchema],
    consultationNotes: String,
    testsAdvised: String,
    consultationFee: {
        type: Number,
        default: 500
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded', 'Free'],
        default: 'Pending'
    },
    paymentDetails: {
        transactionId: String,
        paymentMethod: String,
        amount: Number,
        paidAt: Date,
        receiptNumber: String
    }
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);

