
const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss");

dotenv.config();

const connectDB = require("./config/db");

// MODELS
const Order = require("./models/Order");

// ROUTES
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/items");
const orderRoutes = require("./routes/orders");
const productRoutes = require("./routes/products");
const reservationRoutes = require("./routes/reservations");

// INITIALIZE EXPRESS
const app = express();

// SECURITY HEADERS
app.use(helmet());

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// XSS INPUT SANITIZATION
function sanitizeValue(value, key = "") {
    if (typeof value === "string") {
        // Do not modify passwords
        if (
            key.toLowerCase() === "password" ||
            key.toLowerCase() === "confirmpassword"
        ) {
            return value;
        }

        return xss(value);
    }

    if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item, key));
    }

    if (value !== null && typeof value === "object") {
        const sanitized = {};

        for (const property in value) {
            sanitized[property] = sanitizeValue(
                value[property],
                property
            );
        }

        return sanitized;
    }

    return value;
}

app.use((req, res, next) => {
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeValue(req.body);
    }

    next();
});

// LOGIN RATE LIMITER
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many requests, try again later"
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use("/api/auth/login", loginLimiter);

// MAIN HOMEPAGE
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

// INDEX PAGE
app.get("/index.html", (req, res) => {
    res.redirect("/login.html");
});

// DASHBOARD PAGE
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dashboard.html"));
});

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "../frontend")));

// API ROUTES
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reservations", reservationRoutes);

// HEALTH CHECK
app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "EVENT-UALLY DONE API is running!"
    });
});

// SYSTEM STATUS
app.get("/status", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "System is running"
    });
});

// ORDERS LIST WITH POPULATED DATA
app.get("/api/orders-list", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "full_name email role")
            .populate("items", "item_name category");

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// START SERVER
const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("EVENT-UALLY DONE API is ready!");
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

start();
