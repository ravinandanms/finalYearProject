import bcrypt from 'bcrypt';
import User from '../Models/User.js';

export const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin@123', 12);
            const newAdmin = new User({
                name: 'System Admin',
                email: 'admin@teleseva.com',
                password: hashedPassword,
                role: 'admin',
                status: 'active'
            });
            await newAdmin.save();
            console.log('Admin account created successfully.');
        } else {
            console.log('Admin account already exists.');
        }

        // Seed AYUSH Doctor if not exists
        const ayushExists = await User.findOne({ email: 'ayush.doctor@teleseva.com' });
        if (!ayushExists) {
            const doctorPassword = await bcrypt.hash('doctor@123', 12);
            const ayushDoctor = new User({
                name: 'Dr. Ayush Sharma',
                email: 'ayush.doctor@teleseva.com',
                password: doctorPassword,
                role: 'doctor',
                specialization: 'AYUSH & Holistic Wellness Specialist',
                status: 'active'
            });
            await ayushDoctor.save();
            console.log('AYUSH Doctor account created successfully (ayush.doctor@teleseva.com / doctor@123).');
        }

        // Seed General Doctor if not exists
        const generalDoctorExists = await User.findOne({ email: 'doctor@teleseva.com' });
        if (!generalDoctorExists) {
            const doctorPassword = await bcrypt.hash('doctor@123', 12);
            const generalDoctor = new User({
                name: 'Dr. Arvind Sivaram',
                email: 'doctor@teleseva.com',
                password: doctorPassword,
                role: 'doctor',
                specialization: 'General Physician & Cardiologist',
                status: 'active'
            });
            await generalDoctor.save();
            console.log('General Doctor account created successfully (doctor@teleseva.com / doctor@123).');
        }
    } catch (error) {
        console.error('Error seeding accounts:', error.message);
    }
};

