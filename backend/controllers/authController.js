console.log("AUTH CONTROLLER FILE LOADED");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { full_name, email, password, confirmPassword } = req.body;

        if (!full_name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                message: "Please complete all required fields."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            full_name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "Student"
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    console.log("UPDATED LOGIN FUNCTION IS RUNNING");
    
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "JWT configuration is missing."
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Generate JWT token
        console.log("JWT LOGIN CONTROLLER UPDATED");
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
        res.status(500).json({
            message: error.message
        });
    }
};

