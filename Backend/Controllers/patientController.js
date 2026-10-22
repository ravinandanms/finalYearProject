import User from '../Models/User.js';
import MedicalRecord from '../Models/MedicalRecord.js';
import Appointment from '../Models/Appointment.js';
import fs from 'fs';
import path from 'path';

export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify ownership
        if (req.userData.userId !== id && req.userData.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: You can only edit your own profile" });
        }

        const { name, dateOfBirth, gender, phone, address, medicalInformation } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
        if (gender) updateData.gender = gender;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (medicalInformation) updateData.medicalInformation = medicalInformation;

        const user = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
}

export const uploadMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params; // patientId
        
        // Ensure patient is uploading to their own account or a doctor/admin is uploading
        if (req.userData.role === 'patient' && req.userData.userId !== id) {
            return res.status(403).json({ message: "Forbidden: You can only upload records to your own profile" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { name, type, description } = req.body;

        const fileUrl = `/uploads/${req.file.filename}`;

        const newRecord = new MedicalRecord({
            name,
            type,
            description,
            fileUrl,
            patientId: id,
            uploadedBy: req.userData.userId
        });

        await newRecord.save();

        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ message: "Error uploading record", error: error.message });
    }
};

export const getMedicalRecords = async (req, res) => {
    try {
        const { id } = req.params; // patientId
        
        // Ensure authorization
        if (req.userData.role === 'patient' && req.userData.userId !== id) {
            return res.status(403).json({ message: "Forbidden: You can only view your own records" });
        }
        // If doctor, maybe check appointment relationship, but for now allow authorized doctors
        
        const records = await MedicalRecord.find({ patientId: id }).populate('uploadedBy', 'name role');
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: "Error fetching records", error: error.message });
    }
};

export const deleteMedicalRecord = async (req, res) => {
    try {
        const { patientId, recordId } = req.params;

        const record = await MedicalRecord.findById(recordId);
        if (!record) {
            return res.status(404).json({ message: "Record not found" });
        }

        // Only patient who uploaded it or admin can delete it. Doctor generated records cannot be deleted by patient.
        if (req.userData.role === 'patient') {
            if (record.uploadedBy.toString() !== req.userData.userId) {
                return res.status(403).json({ message: "Forbidden: You can only delete your own uploaded records" });
            }
        }

        await MedicalRecord.findByIdAndDelete(recordId);

        res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting record", error: error.message });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const { id } = req.params; // patientId
        if (req.userData.userId !== id && req.userData.role !== 'admin' && req.userData.role !== 'doctor') {
            return res.status(403).json({ message: "Forbidden" });
        }

        const appointments = await Appointment.find({ patientId: id })
            .populate('doctorId', 'name email specialization')
            .sort({ createdAt: -1 });

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments", error: error.message });
    }
};

export const payAppointment = async (req, res) => {
    try {
        const { id, appointmentId } = req.params;
        const { paymentMethod = 'UPI', amount, transactionId } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        const txn = transactionId || `TXN-TS-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
        const receipt = `REC-TS-${Date.now().toString().slice(-5)}`;

        appointment.paymentStatus = 'Paid';
        appointment.paymentDetails = {
            transactionId: txn,
            paymentMethod,
            amount: amount || appointment.consultationFee || 500,
            paidAt: new Date(),
            receiptNumber: receipt
        };

        await appointment.save();
        const populated = await Appointment.findById(appointment._id)
            .populate('doctorId', 'name email specialization')
            .populate('patientId', 'name email phone');

        res.status(200).json({
            message: "Payment processed successfully",
            appointment: populated
        });
    } catch (error) {
        res.status(500).json({ message: "Error processing payment", error: error.message });
    }
};

