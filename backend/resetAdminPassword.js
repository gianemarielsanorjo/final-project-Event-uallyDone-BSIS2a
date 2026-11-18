
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("./models/User");

async function resetAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "admin.eventually@test.com";
        const newPassword = crypto.randomBytes(12).toString("hex");

        const user = await User.findOne({ email });

        if (!user) {
            console.log("Admin account not found.");
            return;
        }

        if (user.role !== "Admin") {
            console.log("Safety stop: Account is not an Admin.");
            return;
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        console.log("Admin password updated successfully!");
        console.log("Email:", user.email);
        console.log("Role:", user.role);
        console.log("Temporary password:", newPassword);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

resetAdminPassword();
