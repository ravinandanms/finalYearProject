import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['doctor', 'patient', 'admin'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'suspended', 'rejected'],
        default: 'active'
    },
    specialization: {
        type: String,
        // Only relevant if role is 'doctor'
        required: function() {
            return this.role === 'doctor';
        }
    },
    // Patient Profile Fields
    dateOfBirth: String,
    gender: String,
    phone: String,
    address: String,
    profilePicture: String,
    
    // Patient Medical Information
    medicalInformation: {
        bloodGroup: String,
        allergies: String,
        existingConditions: String,
        currentMedications: String,
        emergencyContact: String
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
