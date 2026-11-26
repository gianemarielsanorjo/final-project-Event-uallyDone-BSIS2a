
const express = require("express");
const router = express.Router();

const Item = require("../models/Item");
const cache = require("../utils/cache");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

// ==========================================
// CREATE ITEM - ADMIN ONLY
// ==========================================
router.post(
    "/",
    protect,
    authorize("Admin"),
    async (req, res) => {
        try {
            const item = await Item.create(req.body);

            // Clear cached items after creating
            cache.del("items");

            res.status(201).json(item);

        } catch (error) {
            res.status(400).json({
                message: error.message
            });
        }
    }
);

// ==========================================
// GET ALL ITEMS - VIEW ACCESS
// ==========================================
router.get("/", async (req, res) => {
    try {
        const cachedItems = cache.get("items");

        if (cachedItems !== undefined) {
            res.set("X-Cache", "HIT");
            return res.json(cachedItems);
        }

        const items = await Item.find().lean();

        cache.set("items", items);

        res.set("X-Cache", "MISS");
        res.json(items);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// ==========================================
// UPDATE ITEM - ADMIN ONLY
// ==========================================
router.put(
    "/:id",
    protect,
    authorize("Admin"),
    async (req, res) => {
        try {
            const {
                item_name,
                category,
                quantity
            } = req.body;

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
            item.status = quantity > 0
                ? "Available"
                : "Unavailable";

            await item.save();

            // Clear cached items after updating
            cache.del("items");

            res.json({
                message: "Item updated successfully!",
                item
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);

// ==========================================
// GET ITEM BY ID - VIEW ACCESS
// ==========================================
router.get("/:id", async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).lean();

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.json(item);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// ==========================================
// DELETE ITEM - ADMIN ONLY
// ==========================================
router.delete(
    "/:id",
    protect,
    authorize("Admin"),
    async (req, res) => {
        try {
            const item = await Item.findByIdAndDelete(req.params.id);

            if (!item) {
                return res.status(404).json({
                    message: "Item not found"
                });
            }

            // Clear cached items after deleting
            cache.del("items");

            res.json({
                message: "Item deleted successfully!",
                item
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;
