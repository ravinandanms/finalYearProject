import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication failed. No token provided." });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.userData = { userId: decodedToken.userId, role: decodedToken.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Authentication failed. Invalid token." });
    }
};

export default authMiddleware;
