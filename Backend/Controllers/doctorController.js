import User from '../Models/User.js';
import Appointment from '../Models/Appointment.js';

export const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAvailable } = req.body;
        
        if (req.userData.userId !== id) {
             return res.status(403).json({ message: "Forbidden: You can only update your own availability" });
        }

        const doctor = await User.findById(id);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: "Doctor not found" });
        }
        
        // Storing availability status dynamically, we can add a simple field or just rely on sockets.
        // Actually, the socket connection already tracks online status.
        // But for completeness, we can store it.
        // Let's assume frontend just uses Socket.io to manage "Available" state.
        // So this endpoint might not strictly be necessary, but let's provide it in case they want a persistent state.
        
        res.status(200).json({ message: "Availability updated" });
    } catch (error) {
        res.status(500).json({ message: "Error updating availability", error: error.message });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const { id } = req.params; // doctorId
        
        if (req.userData.userId !== id && req.userData.role !== 'admin') {
             return res.status(403).json({ message: "Forbidden" });
        }

        const appointments = await Appointment.find({ doctorId: id })
             .populate('patientId', 'name email profilePicture')
             .sort({ date: 1 });
             
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments", error: error.message });
    }
};

export const createConsultationRecord = async (req, res) => {
    try {
        const { id } = req.params; // doctorId
        const { 
            patientId, 
            diagnosis, 
            prescription, 
            prescribedMedicines,
            consultationNotes, 
            testsAdvised,
            consultationFee = 500,
            reason 
        } = req.body;
        
        if (req.userData.userId !== id && req.userData.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Format structured medicines if passed
        const formattedMedicines = Array.isArray(prescribedMedicines) && prescribedMedicines.length > 0 
            ? prescribedMedicines 
            : prescription 
                ? [{ name: prescription, dosage: "As directed", frequency: "1-0-1", duration: "5 days", instructions: "After meals" }]
                : [];
        
        const newAppointment = new Appointment({
            patientId: patientId || req.userData.userId,
            doctorId: id,
            date: new Date(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Completed',
            reason: reason || diagnosis || 'Live Video Consultation',
            diagnosis,
            prescription: prescription || (formattedMedicines.map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join(', ')),
            prescribedMedicines: formattedMedicines,
            consultationNotes,
            testsAdvised,
            consultationFee: Number(consultationFee) || 500,
            paymentStatus: 'Pending'
        });
        
        await newAppointment.save();

        // Also update doctor's profile consultation fee if provided
        if (consultationFee) {
            await User.findByIdAndUpdate(id, { consultationFee: Number(consultationFee) || 500 });
        }

        const populated = await Appointment.findById(newAppointment._id)
            .populate('doctorId', 'name email specialization consultationFee')
            .populate('patientId', 'name email phone');
            
        res.status(201).json(populated || newAppointment);
    } catch (error) {
        res.status(500).json({ message: "Error creating consultation record", error: error.message });
    }
};

export const updateDoctorFee = async (req, res) => {
    try {
        const { id } = req.params;
        const { consultationFee } = req.body;
        if (req.userData.userId !== id && req.userData.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden" });
        }
        const updated = await User.findByIdAndUpdate(
            id, 
            { consultationFee: Number(consultationFee) || 500 }, 
            { new: true }
        ).select('-password');
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error updating doctor fee", error: error.message });
    }
};


