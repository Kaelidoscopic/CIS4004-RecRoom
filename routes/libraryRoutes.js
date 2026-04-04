import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("librarySongs")
            .populate("libraryAlbums");

        res.json({
            songs: user.librarySongs || [],
            albums: user.libraryAlbums || []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/save", protect, async (req, res) => {
    try {
        const { songId } = req.body;

        if (!songId) {
            return res.status(400).json({ message: "songId is required" });
        }

        const user = await User.findById(req.user._id);

        if (!user.librarySongs) {
            user.librarySongs = [];
        }

        const alreadySaved = user.librarySongs.some(
            (id) => id.toString() === songId
        );

        if (alreadySaved) {
            return res.status(400).json({ message: "Song already in library" });
        }

        user.librarySongs.push(songId);
        await user.save();

        res.json({ message: "Song saved to library" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/save-album", protect, async (req, res) => {
    try {
        const { albumId } = req.body;

        if (!albumId) {
            return res.status(400).json({ message: "albumId is required" });
        }

        const user = await User.findById(req.user._id);

        if (!user.libraryAlbums) {
            user.libraryAlbums = [];
        }

        const alreadySaved = user.libraryAlbums.some(
            (id) => id.toString() === albumId
        );

        if (alreadySaved) {
            return res.status(400).json({ message: "Album already in library" });
        }

        user.libraryAlbums.push(albumId);
        await user.save();

        res.json({ message: "Album saved to library" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/album/:albumId", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.libraryAlbums = (user.libraryAlbums || []).filter(
            (id) => id.toString() !== req.params.albumId
        );

        await user.save();

        res.json({ message: "Album removed from library" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:songId", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.librarySongs = (user.librarySongs || []).filter(
            (id) => id.toString() !== req.params.songId
        );

        await user.save();

        res.json({ message: "Song removed from library" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;