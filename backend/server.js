
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Database connection
const connectDB = require("./config/db");

// Models
const Order = require("./models/Order");

// Routes
const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items");
const ordersRouter = require("./routes/orders");
const productsRouter = require("./routes/products");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/users", usersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/products", productsRouter);

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "EVENT-UALLY DONE API is running!"
    });
});

// Get all orders with populated information
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
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup error:", error.message);
        process.exit(1);
    }
}

start();
