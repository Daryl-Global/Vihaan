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

        if (passwordMatch) {
            const token = jwt.sign(
                { userId: user.userId, userRole: user.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1h" }
            );

            const sessionStartTime = new Date().toISOString();
            return res
                .cookie("access_token", token, {
                    httpOnly: true,
                    domain: "",
                    sameSite: "none",
                    secure: true,
                })
                .json({
                    status: 200,
                    message: "Logged in successfully 😊 👌",
                    id: user.userId,
                    role: user.role,
                    permissions: user.permissions,
                    branch: user.branch,
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    sessionStartTime: sessionStartTime,
                });
        } else {
            return res.json({ status: 401, error: "Invalid credentials" });
        }
    } catch (error) {
        res.json({ status: 500, error: error.message });
    }
};

const logout = (req, res) => {
    return res
        .clearCookie("access_token")
        .status(200)
        .json({ message: "Successfully logged out" });
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
        await user.save();

        res.json({ status: 200, message: "Password has been reset successfully." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.json({ status: 500, error: "Internal Server Error" });
    }
};

module.exports = { register, login, logout, resetPassword };