require("dotenv").config();
const jwt = require("jsonwebtoken");
const UserData = require("../models/userModel");
const bcrypt = require("bcrypt");

const SALTROUNDS = 10;

const register = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, SALTROUNDS);

        const newUser = new UserData({
            userId: req.body.userId,
            email: req.body.email,
            phone: req.body.phone,
            name: req.body.name,
            password: hashedPassword,
            role: req.body.role,
            session: null, // Initialize session field as null
        });

        await newUser.save();

        res.json({ status: 200 });
    } catch (error) {
        if (error.code === 11000) {
            res.json({
                status: 11000,
                error: "An account with this name already exists!",
            });
        } else {
            res.json({ status: 404, error: "Signup failed" });
        }
    }
};

const login = async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await UserData.findOne({ name });

        if (!user) {
            return res.json({ status: 404, error: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.json({ status: 401, error: "Invalid credentials" });
        }

        if (user.session && user.session.token) {
            const sessionExpiry = new Date(user.session.sessionExpiry).getTime();
            const currentTime = new Date().getTime();

            if (currentTime < sessionExpiry) {
                return res.json({
                    status: 403,
                    error: "User is already logged in on another device.",
                });
            }
        }

        const token = jwt.sign(
            { userId: user.userId, userRole: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        const sessionStartTime = new Date();
        const sessionExpiry = new Date(sessionStartTime.getTime() + 3600 * 1000);

        user.session = { token, sessionStartTime, sessionExpiry };
        await user.save();

        return res
            .cookie("access_token", token, {
                httpOnly: true,
                sameSite: "none",
                secure: true,
            })
            .json({
                status: 200,
                message: "Logged in successfully",
                id: user.userId,
                role: user.role,
                permissions: user.permissions,
                branch: user.branch,
                name: user.name,
            });
    } catch (error) {
        res.json({ status: 500, error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await UserData.findOne({ userId });

        if (user) {
            user.session = null;
            await user.save();
        }

        return res
            .clearCookie("access_token")
            .status(200)
            .json({ message: "Successfully logged out" });
    } catch (error) {
        res.json({ status: 500, error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { name, newPassword } = req.body;

    try {
        const user = await UserData.findOne({ name });
        if (!user) {
            return res.json({ status: 404, error: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALTROUNDS);

        user.password = hashedPassword;
        user.session = null; // Invalidate active session after password reset
        await user.save();

        res.json({ status: 200, message: "Password has been reset successfully." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.json({ status: 500, error: "Internal Server Error" });
    }
};

module.exports = { register, login, logout, resetPassword };
