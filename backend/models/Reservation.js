
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    event_name: {
        type: String,
        required: true,
        trim: true
    },

    // Reservation owner
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
        default: null
    },

    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    event_date: {
        type: Date,
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },

    // Tracks whether this reservation already deducted inventory
    stock_deducted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// Index for faster owner-based reservation searches
reservationSchema.index({ user: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
