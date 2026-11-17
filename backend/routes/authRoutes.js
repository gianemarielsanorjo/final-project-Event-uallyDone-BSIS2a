console.log("AUTH ROUTES FILE LOADED");
const express = require("express");
const router = express.Router();

const {
    register,
    login
} = require("../controllers/authController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Protected profile route
router.get(
    "/profile",
    protect,
    (req, res) => {
        console.log("PROFILE ROUTE HIT");
        
        res.status(200).json({
            message: "Profile access granted!",
            user: req.user
        });
    }
);

// Admin-only route
router.get(
    "/admin",
    protect,
    authorize("Admin"),
    (req, res) => {
        res.status(200).json({
            message: "Admin access granted!"
        });
    }
);

module.exports = router;
