export const requireAdmin = (req, res, next) => {
    if (req.userData && req.userData.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Admin access required" });
    }
};

export const requireDoctor = (req, res, next) => {
    if (req.userData && req.userData.role === 'doctor') {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Doctor access required" });
    }
};

export const requirePatient = (req, res, next) => {
    if (req.userData && req.userData.role === 'patient') {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Patient access required" });
    }
};
