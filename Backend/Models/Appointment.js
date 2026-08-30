import mongoose from "mongoose";

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
    consultationNotes: String
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
