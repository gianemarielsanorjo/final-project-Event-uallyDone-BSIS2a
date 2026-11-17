
const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// Create item
router.post("/", async (req, res) => {
    try {
        const item = await Item.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all items
router.get("/", async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update item
router.put("/:id", async (req, res) => {
    try {
        const { item_name, category, quantity } = req.body;

        if (
            !item_name ||
            !category ||
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                message: "Please provide valid item information."
            });
        }

        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        item.item_name = item_name;
        item.category = category;
        item.quantity = quantity;
        item.available_quantity = quantity;
        item.status = quantity > 0 ? "Available" : "Unavailable";

        await item.save();

        res.json({
            message: "Item updated successfully!",
            item
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get item by ID
router.get("/:id", async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete item
router.delete("/:id", async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.json({
            message: "Item deleted successfully!",
            item
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
