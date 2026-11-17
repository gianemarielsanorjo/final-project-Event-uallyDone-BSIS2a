
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const Order = require("./models/Order");

// Import routes
const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items");
const ordersRouter = require("./routes/orders");
const productsRouter = require("./routes/products");
const authRouter = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/users", usersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);

console.log("AUTH ROUTES MOUNTED");

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "EVENT-UALLY DONE API is running!"
    });
});

// Orders list
app.get("/api/orders-list", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "full_name email role")
            .populate("items", "item_name category quantity status");

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Start server
async function start() {
    try {
        await connectDB();

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log("================================");
            console.log("EVENT-UALLY DONE SERVER");
            console.log("MongoDB Connected!");
            console.log(`Server running on port ${PORT}`);
            console.log("Authentication routes loaded!");
            console.log("================================");
        });

    } catch (error) {
        console.error("Server startup error:", error.message);
        process.exit(1);
    }
}

start();


