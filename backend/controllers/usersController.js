
const bcrypt = require("bcrypt");
const User = require("../models/User");

// CREATE USER
exports.createUser = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        if (!full_name || !email || !password || !role) {
            return res.status(400).json({
                error: "All fields are required."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            full_name,
            email,
            password: hashedPassword,
            role
        });

        return res.status(201).json({
            message: "User created successfully",
            user: {
                _id: user._id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

// READ ALL USERS
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ created_at: -1 });

        return res.json(users);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        const updates = {};

        if (full_name !== undefined) updates.full_name = full_name;
        if (email !== undefined) updates.email = email;
        if (role !== undefined) updates.role = role;

        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updated) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json(updated);

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json({
            message: "User deleted successfully"
        });

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
