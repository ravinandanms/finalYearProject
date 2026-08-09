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
        enum: ['doctor', 'patient'],
        required: true
    },
    specialization: {
        type: String,
        // Only relevant if role is 'doctor'
        required: function() {
            return this.role === 'doctor';
        }
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
