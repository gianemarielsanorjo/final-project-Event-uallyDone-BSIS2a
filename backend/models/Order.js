
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    // Reference to user who made the order
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // Array of items in the order
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],

    // Total amount
    totalAmount: {
        type: Number,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
