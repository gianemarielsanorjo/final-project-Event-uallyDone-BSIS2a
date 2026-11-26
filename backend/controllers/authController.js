
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==========================================
// REGISTER
// ==========================================
exports.register = async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            confirmPassword,
            role
        } = req.body;

        if (!full_name || !email || !password || !confirmPassword || !role) {
            return res.status(400).json({
                message: "Please complete all required fields."
            });
        }

        // Only Student and Event Organizer can register publicly
        const allowedRoles = ["Student", "Event Organizer"];

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                message: "Admin registration is not allowed."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        // Normalize user information
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedName = full_name.trim();

        if (!normalizedName) {
            return res.status(400).json({
                message: "Full name is required."
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            full_name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            role: role
        });

        await user.save();

        return res.status(201).json({
            message: "User registered successfully!",
            user: {
                id: user._id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        return res.status(500).json({
            message: "An unexpected server error occurred."
        });
    }
};

// ==========================================
// LOGIN
// ==========================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");

            return res.status(500).json({
                message: "Authentication service is unavailable."
            });
        }

        // Find user by normalized email
        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Compare submitted password with hashed password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful!",
            token: token,
            user: {
                id: user._id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "An unexpected server error occurred."
        });
    }
};

