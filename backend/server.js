
const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

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

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "../frontend")));

// OPEN THE FRONTEND DASHBOARD
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dashboard.html"));
});

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


