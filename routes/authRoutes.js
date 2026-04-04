import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

router.post("/register", async (req, res) => {
    try 
    {
        const { username, password, role } = req.body;

        if (!username || !password) 
        {
            return res.status(400).json({ message: "Username and password required" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) 
        {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({username, password: hashedPassword, role: role === "admin" ? "admin" : "user"});

        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            spotifyId: user.spotifyId,
            spotifyDisplayName: user.spotifyDisplayName,
            spotifyEmail: user.spotifyEmail,
            spotifyUrl: user.spotifyUrl,
            spotifyImage: user.spotifyImage,
            token: generateToken(user._id)
        });
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.post("/login", async (req, res) => {
    try 
    {
        const { username, password } = req.body;

        if (!username || !password) 
        {
            return res.status(400).json({ message: "Username and password required" });
        }

        const user = await User.findOne({ username });
        if (!user) 
        {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) 
        {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            spotifyId: user.spotifyId,
            spotifyDisplayName: user.spotifyDisplayName,
            spotifyEmail: user.spotifyEmail,
            spotifyUrl: user.spotifyUrl,
            spotifyImage: user.spotifyImage,
            token: generateToken(user._id)
        });
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.get("/me", protect, async (req, res) => {
    try 
    {
        res.json(req.user);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.post("/link-spotify", protect, async (req, res) => {
    try 
    {
        const {spotifyId, spotifyDisplayName, spotifyEmail, spotifyUrl, spotifyImage} = req.body;

        const user = await User.findById(req.user._id);

        if (!user) 
        {
            return res.status(404).json({ message: "User not found" });
        }

        user.spotifyId = spotifyId || "";
        user.spotifyDisplayName = spotifyDisplayName || "";
        user.spotifyEmail = spotifyEmail || "";
        user.spotifyUrl = spotifyUrl || "";
        user.spotifyImage = spotifyImage || "";

        await user.save();

        res.json({
        message: "Spotify account linked successfully",
        user
        });
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

export default router;