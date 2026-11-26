
console.log("AUTH ROUTES FILE LOADED");

const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");

const {
    register,
    login
} = require("../controllers/authController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

// VALIDATION ERROR HANDLER
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    next();
};

// REGISTER VALIDATION
const registerValidation = [
    body("full_name")
        .trim()
        .notEmpty()
        .withMessage("Full name is required."),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email address."),

    body("role")
        .isIn(["Student", "Event Organizer"])
        .withMessage("Please select a valid registration role."),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters.")
        .matches(/[A-Z]/)
        .withMessage("Password must include an uppercase letter.")
        .matches(/[0-9]/)
        .withMessage("Password must include a number."),

    body("confirmPassword")
        .notEmpty()
        .withMessage("Please confirm your password.")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords do not match.")
];

// LOGIN VALIDATION
const loginValidation = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email address."),

    body("password")
        .notEmpty()
        .withMessage("Password is required.")
];

// REGISTER
router.post(
    "/register",
    registerValidation,
    checkValidation,
    register
);

// LOGIN
router.post(
    "/login",
    loginValidation,
    checkValidation,
    login
);

// PROTECTED PROFILE ROUTE
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message: "Profile access granted!",
        user: req.user
    });
});

// PROTECTED DATA ROUTE
router.get("/secure-data", protect, (req, res) => {
    res.status(200).json({
        message: "Secure data access granted!",
        user: req.user.full_name,
        data: "This information is available only to authenticated users."
    });
});

// ADMIN-ONLY ROUTE
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
