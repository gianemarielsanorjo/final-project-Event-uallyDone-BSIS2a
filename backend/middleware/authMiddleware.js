
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token and identify the logged-in user
exports.protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Unauthorized. Please login first."
            });
        }

        const token = authHeader.split(" ")[1];

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "JWT configuration is missing."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token. Please login again."
        });
    }
};

// Check the user's role from the database
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Forbidden. You do not have permission."
            });
        }

        next();
    };
};
