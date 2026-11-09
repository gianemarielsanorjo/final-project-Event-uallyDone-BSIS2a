
const express = require("express");
const router = express.Router();

const {
    createUser,
    getUsers,
    updateUser,
    deleteUser
} = require("../controllers/usersController");

// CREATE
router.post("/", createUser);

// READ
router.get("/", getUsers);

// UPDATE
router.put("/:id", updateUser);

// DELETE
router.delete("/:id", deleteUser);

module.exports = router;
