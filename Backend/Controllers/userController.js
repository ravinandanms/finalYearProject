import User from '../Models/User.js';

export const getDoctors = async (req, res) => {
    try {
        // Fetch all users with role 'doctor'
        // In a real app, you might want to paginate or filter by specialization
        const doctors = await User.find({ role: 'doctor' }).select('-password');
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};
