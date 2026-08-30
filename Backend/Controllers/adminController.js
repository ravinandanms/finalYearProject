import User from '../Models/User.js';
import Appointment from '../Models/Appointment.js';

export const getStatistics = async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const pendingDoctors = await User.countDocuments({ role: 'doctor', status: 'pending' });
        const totalAppointments = await Appointment.countDocuments();

        res.status(200).json({
            totalPatients,
            totalDoctors,
            pendingDoctors,
            totalAppointments
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching statistics", error: error.message });
    }
};

export const getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('-password');
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching doctors", error: error.message });
    }
};

export const updateDoctorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['active', 'pending', 'suspended', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const doctor = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: "Error updating doctor status", error: error.message });
    }
};

export const getPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' }).select('-password');
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: "Error fetching patients", error: error.message });
    }
};

export const updatePatientStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const patient = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: "Error updating patient status", error: error.message });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'name email')
            .populate('doctorId', 'name email specialization')
            .sort({ date: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments", error: error.message });
    }
};
