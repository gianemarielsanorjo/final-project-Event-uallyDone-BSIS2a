
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    event_name: {
        type: String,
        required: true,
        trim: true
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Reservation", reservationSchema);
