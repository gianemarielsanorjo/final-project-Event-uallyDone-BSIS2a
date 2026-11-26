
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Reservation = require("../models/Reservation");
const Item = require("../models/Item");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

// ==========================================
// HELPER: UPDATE ITEM STATUS
// ==========================================
const updateItemStatus = async (item) => {
    if (item.available_quantity <= 0) {
        item.status = "Unavailable";
    } else if (item.available_quantity <= 3) {
        item.status = "Low Stock";
    } else {
        item.status = "Available";
    }

    await item.save();
};

// ==========================================
// GET ALL RESERVATIONS
// Admin: all reservations
// Other roles: own reservations
// ==========================================
router.get("/", protect, async (req, res) => {
    try {
        const filter = {};

        if (req.user.role !== "Admin") {
            filter.user = req.user._id;
        }

        const reservations = await Reservation.find(filter)
            .populate("item", "item_name category available_quantity")
            .populate("user", "full_name email role")
            .sort({ createdAt: -1 });

        res.status(200).json(reservations);

    } catch (error) {
        console.error("Get reservations error:", error);

        res.status(500).json({
            message: "Unable to retrieve reservations."
        });
    }
});

// ==========================================
// GET SINGLE RESERVATION
// Admin: any reservation
// Other roles: own reservation only
// ==========================================
router.get("/:id", protect, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid reservation ID."
            });
        }

        const reservation = await Reservation.findById(req.params.id)
            .populate("item", "item_name category available_quantity")
            .populate("user", "full_name email role");

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found."
            });
        }

        if (
            req.user.role !== "Admin" &&
            (!reservation.user ||
                reservation.user._id.toString() !== req.user._id.toString())
        ) {
            return res.status(403).json({
                message: "You can only view your own reservations."
            });
        }

        res.status(200).json(reservation);

    } catch (error) {
        console.error("Get reservation error:", error);

        res.status(500).json({
            message: "Unable to retrieve reservation."
        });
    }
});

// ==========================================
// CREATE RESERVATION
// Student / Event Organizer / Admin
// Pending reservations do not deduct stock
// ==========================================
router.post(
    "/",
    protect,
    authorize("Student", "Event Organizer", "Admin"),
    async (req, res) => {
        try {
            const {
                event_name,
                item,
                quantity,
                event_date,
                description
            } = req.body;

            if (!event_name || !item || !quantity || !event_date) {
                return res.status(400).json({
                    message: "Please complete all required fields."
                });
            }

            const numericQuantity = Number(quantity);

            if (
                !Number.isInteger(numericQuantity) ||
                numericQuantity < 1
            ) {
                return res.status(400).json({
                    message: "Quantity must be a positive whole number."
                });
            }

            if (!mongoose.isValidObjectId(item)) {
                return res.status(400).json({
                    message: "Invalid inventory item."
                });
            }

            const parsedDate = new Date(event_date);

            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid event date."
                });
            }

            const selectedItem = await Item.findById(item);

            if (!selectedItem) {
                return res.status(404).json({
                    message: "Inventory item not found."
                });
            }

            if (numericQuantity > selectedItem.available_quantity) {
                return res.status(400).json({
                    message: "Requested quantity exceeds available stock."
                });
            }

            const reservation = await Reservation.create({
                event_name: event_name.trim(),
                item,
                quantity: numericQuantity,
                event_date: parsedDate,
                description: description || "",
                status: "Pending",
                user: req.user._id,
                stock_deducted: false
            });

            const populatedReservation = await Reservation.findById(
                reservation._id
            )
                .populate("item", "item_name category available_quantity")
                .populate("user", "full_name email role");

            res.status(201).json({
                message: "Reservation created successfully! Waiting for Admin approval.",
                reservation: populatedReservation
            });

        } catch (error) {
            console.error("Create reservation error:", error);

            res.status(400).json({
                message: "Unable to create reservation."
            });
        }
    }
);

// ==========================================
// UPDATE RESERVATION
// Admin: any reservation
// Event Organizer: own Pending reservations
// Student: not allowed
// ==========================================
router.put("/:id", protect, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid reservation ID."
            });
        }

        const isAdmin = req.user.role === "Admin";
        const isStudent = req.user.role === "Student";

        if (isStudent) {
            return res.status(403).json({
                message: "Students are not allowed to edit reservations."
            });
        }

        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found."
            });
        }

        const isOwner =
            reservation.user &&
            reservation.user.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                message: "You can only update your own reservations."
            });
        }

        if (!isAdmin && reservation.status !== "Pending") {
            return res.status(403).json({
                message: "Only pending reservations can be edited."
            });
        }

        const allowedFields = [
            "event_name",
            "item",
            "quantity",
            "event_date",
            "description"
        ];

        if (isAdmin) {
            allowedFields.push("status");
        } else if (req.body.status !== undefined) {
            return res.status(403).json({
                message: "Only Admin can approve or reject reservations."
            });
        }

        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (updates.event_name !== undefined) {
            if (
                typeof updates.event_name !== "string" ||
                !updates.event_name.trim()
            ) {
                return res.status(400).json({
                    message: "Event name is required."
                });
            }

            updates.event_name = updates.event_name.trim();
        }

        if (updates.quantity !== undefined) {
            updates.quantity = Number(updates.quantity);

            if (
                !Number.isInteger(updates.quantity) ||
                updates.quantity < 1
            ) {
                return res.status(400).json({
                    message: "Quantity must be a positive whole number."
                });
            }
        }

        if (updates.item !== undefined &&
            !mongoose.isValidObjectId(updates.item)) {
            return res.status(400).json({
                message: "Invalid inventory item."
            });
        }

        if (updates.event_date !== undefined) {
            updates.event_date = new Date(updates.event_date);

            if (Number.isNaN(updates.event_date.getTime())) {
                return res.status(400).json({
                    message: "Invalid event date."
                });
            }
        }

        if (
            updates.status !== undefined &&
            !["Pending", "Approved", "Rejected"].includes(updates.status)
        ) {
            return res.status(400).json({
                message: "Invalid reservation status."
            });
        }

        const oldStatus = reservation.status;
        const oldItemId = reservation.item.toString();
        const oldQuantity = reservation.quantity;
        const wasDeducted = reservation.stock_deducted === true;

        const newItemId = updates.item
            ? updates.item.toString()
            : oldItemId;

        const newQuantity = updates.quantity !== undefined
            ? updates.quantity
            : oldQuantity;

        const newStatus = updates.status || oldStatus;

        // Determine inventory changes before saving
        const affectedItemIds = new Set();

        if (wasDeducted) {
            affectedItemIds.add(oldItemId);
        }

        if (newStatus === "Approved") {
            affectedItemIds.add(newItemId);
        }

        const items = {};

        for (const itemId of affectedItemIds) {
            const inventoryItem = await Item.findById(itemId);

            if (!inventoryItem) {
                return res.status(404).json({
                    message: "An inventory item could not be found."
                });
            }

            items[itemId] = inventoryItem;
        }

        // Restore previously deducted stock
        if (wasDeducted) {
            items[oldItemId].available_quantity += oldQuantity;
        }

        // Deduct stock if the new status is Approved
        if (newStatus === "Approved") {
            const targetItem = items[newItemId];

            if (newQuantity > targetItem.available_quantity) {
                return res.status(400).json({
                    message: "Not enough available stock to approve this reservation."
                });
            }

            targetItem.available_quantity -= newQuantity;
        }

        // Apply reservation changes
        Object.assign(reservation, updates);

        reservation.stock_deducted = newStatus === "Approved";

        // Save reservation and affected inventory items
        for (const itemId of affectedItemIds) {
            await updateItemStatus(items[itemId]);
        }

        await reservation.save();

        const populatedReservation = await Reservation.findById(
            reservation._id
        )
            .populate("item", "item_name category available_quantity")
            .populate("user", "full_name email role");

        res.status(200).json({
            message: "Reservation updated successfully!",
            reservation: populatedReservation
        });

    } catch (error) {
        console.error("Update reservation error:", error);

        res.status(400).json({
            message: "Unable to update reservation."
        });
    }
});

// ==========================================
// DELETE RESERVATION
// Admin: any reservation
// Event Organizer: own Pending reservations
// Student: not allowed
// ==========================================
router.delete("/:id", protect, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid reservation ID."
            });
        }

        const isAdmin = req.user.role === "Admin";
        const isStudent = req.user.role === "Student";

        if (isStudent) {
            return res.status(403).json({
                message: "Students are not allowed to delete reservations."
            });
        }

        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found."
            });
        }

        const isOwner =
            reservation.user &&
            reservation.user.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                message: "You can only delete your own reservations."
            });
        }

        if (!isAdmin && reservation.status !== "Pending") {
            return res.status(403).json({
                message: "Only pending reservations can be deleted."
            });
        }

        // Restore stock if it was previously deducted
        if (reservation.stock_deducted === true) {
            const inventoryItem = await Item.findById(reservation.item);

            if (inventoryItem) {
                inventoryItem.available_quantity += reservation.quantity;
                await updateItemStatus(inventoryItem);
            }
        }

        await Reservation.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Reservation deleted successfully!"
        });

    } catch (error) {
        console.error("Delete reservation error:", error);

        res.status(500).json({
            message: "Unable to delete reservation."
        });
    }
});

module.exports = router;
