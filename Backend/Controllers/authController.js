import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, role, specialization } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            specialization: role === 'doctor' ? specialization : undefined
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};
