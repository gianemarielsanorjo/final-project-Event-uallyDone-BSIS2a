
const express = require("express");
const router = express.Router();

const Order = require("../models/Order");

// GET ALL ORDERS WITH POPULATED USER AND ITEM DETAILS
router.get("/", async (req, res) => {
    try {
        console.log("GET ALL ORDERS ROUTE REACHED");

        const orders = await Order.find()
            .populate("user", "full_name email role")
            .populate("items", "item_name category quantity status");

        console.log("Orders found:", orders.length);

        res.status(200).json(orders);

    } catch (error) {
        console.error("GET ORDERS ERROR:", error);

        res.status(500).json({
            message: error.message
        });
    }
});

// GET ORDER BY ID
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "full_name email role")
            .populate("items", "item_name category quantity status");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json(order);

    } catch (error) {
        console.error("GET ORDER BY ID ERROR:", error);

        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;




