
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        item_name: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        available_quantity: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            default: "Available"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
