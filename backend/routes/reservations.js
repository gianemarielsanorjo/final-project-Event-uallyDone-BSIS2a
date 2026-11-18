
const express = require("express");
const router = express.Router();

const Reservation = require("../models/Reservation");
const Item = require("../models/Item");

// GET ALL RESERVATIONS
router.get("/", async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate("item", "item_name category available_quantity");

        res.status(200).json(reservations);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET SINGLE RESERVATION
router.get("/:id", async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate("item", "item_name category available_quantity");

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found."
            });
        }

        res.status(200).json(reservation);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE RESERVATION
router.post("/", async (req, res) => {
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

        if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive whole number."
            });
        }

        const selectedItem = await Item.findById(item);

        if (!selectedItem) {
            return res.status(404).json({
                message: "Inventory item not found."
            });
        }

        if (Number(quantity) > selectedItem.available_quantity) {
            return res.status(400).json({
                message: "Requested quantity exceeds available stock."
            });
        }

        const reservation = await Reservation.create({
            event_name,
            item,
            quantity: Number(quantity),
            event_date,
            description: description || "",
            status: "Pending"
        });

        const populatedReservation = await Reservation.findById(
            reservation._id
        ).populate("item", "item_name category available_quantity");

        res.status(201).json({
            message: "Reservation created successfully!",
            reservation: populatedReservation
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE RESERVATION
router.put("/:id", async (req, res) => {
    try {
        const allowedFields = [
            "event_name",
            "item",
            "quantity",
            "event_date",
            "description",
            "status"
        ];

        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (updates.quantity !== undefined) {
            updates.quantity = Number(updates.quantity);

            if (!Number.isInteger(updates.quantity) || updates.quantity < 1) {
                return res.status(400).json({
                    message: "Quantity must be a positive whole number."
                });
            }
        }

        if (updates.item) {
            const selectedItem = await Item.findById(updates.item);

            if (!selectedItem) {
                return res.status(404).json({
                    message: "Inventory item not found."
                });
            }
        }

        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        ).populate("item", "item_name category available_quantity");

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found."
            });
        }

        res.status(200).json({
            message: "Reservation updated successfully!",
            reservation
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE RESERVATION
router.delete("/:id", async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(
            req.params.id
        );

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found."
            });
        }

        res.status(200).json({
            message: "Reservation deleted successfully!"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
