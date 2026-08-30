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
    } catch (error) {
        console.error('Error seeding admin account:', error.message);
    }
};
