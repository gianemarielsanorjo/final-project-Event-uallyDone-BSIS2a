
require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User");
const Item = require("./models/Item");
const Order = require("./models/Order");

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected!");
        console.log("Connected Database:", mongoose.connection.name);

        // Create test user if not existing
        let user = await User.findOne({
            email: "test@test.com"
        });

        if (!user) {
            user = await User.create({
                full_name: "Test User",
                email: "test@test.com",
                password: "test123456",
                role: "Event Organizer"
            });

            console.log("Test user created!");
        } else {
            console.log("Test user already exists!");
        }

        // Create or update Laptop
        const item1 = await Item.findOneAndUpdate(
            { item_name: "Laptop" },
            {
                $set: {
                    item_name: "Laptop",
                    category: "Electronics",
                    quantity: 5,
                    available_quantity: 5,
                    status: "Available"
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        // Create or update Phone
        const item2 = await Item.findOneAndUpdate(
            { item_name: "Phone" },
            {
                $set: {
                    item_name: "Phone",
                    category: "Electronics",
                    quantity: 5,
                    available_quantity: 5,
                    status: "Available"
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        // Create sample order if not existing
        let order = await Order.findOne({
            user: user._id,
            items: {
                $all: [item1._id, item2._id],
                $size: 2
            },
            totalAmount: 70000
        });

        if (!order) {
            order = await Order.create({
                user: user._id,
                items: [item1._id, item2._id],
                totalAmount: 70000
            });
        }

        console.log("Database seeded successfully!");
        console.log("User:", user.email);
        console.log("Items:", item1.item_name, "and", item2.item_name);
        console.log("Order ID:", order._id);

    } catch (error) {
        console.error("Seeding failed:", error.message);

    } finally {
        await mongoose.disconnect();
    }
}

seedData();

