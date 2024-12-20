const express = require("express");
const { register, login, logout, resetPassword } = require("../controllers/auth.js");
const { authenticateToken } = require("../middleware/authorization");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/reset-password", resetPassword);

module.exports = router;
