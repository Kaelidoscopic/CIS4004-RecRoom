import express from "express";
import Playlist from "../models/Playlist.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
    try 
    {
        const playlists = await Playlist.find()
            .populate("owner", "username")
            .populate("songs");

        res.json(playlists);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.post("/", protect, async (req, res) => {
    try 
    {
        const { title, description, songs } = req.body;

        if (!title) 
        {
            return res.status(400).json({ message: "Playlist title is required" });
        }

        const playlist = await Playlist.create({title, description, songs: songs || [], owner: req.user._id, upvotes: []});

        res.status(201).json(playlist);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.get("/admin/all", protect, adminOnly, async (req, res) => {
    try 
    {
        const playlists = await Playlist.find()
        .populate("owner", "username")
        .populate("songs")
        .sort({ createdAt: -1 });

        res.json(playlists);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:id", protect, async (req, res) => {
    try
    {
        const playlist = await Playlist.findById(req.params.id)
            .populate("owner", "username")
            .populate("songs");

        if (!playlist)
        {
            return res.status(404).json({ message: "Playlist not found" });
        }

        res.json(playlist);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
});

router.put("/:id", protect, async (req, res) => {
    try 
    {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) 
        {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") 
        {
            return res.status(403).json({ message: "Not allowed to edit this playlist" });
        }

        playlist.title = req.body.title ?? playlist.title;
        playlist.description = req.body.description ?? playlist.description;
        playlist.songs = req.body.songs ?? playlist.songs;

        const updatedPlaylist = await playlist.save();
        res.json(updatedPlaylist);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", protect, async (req, res) => {
    try 
    {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) 
        {
            return res.status(404).json({ message: "Playlist not found" });
        }

        if (playlist.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") 
        {
            return res.status(403).json({ message: "Not allowed to delete this playlist" });
        }

        await playlist.deleteOne();
        res.json({ message: "Playlist deleted" });
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.post("/:id/upvote", protect, async (req, res) => {
    try 
    {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) 
        {
            return res.status(404).json({ message: "Playlist not found" });
        }

        const alreadyUpvoted = playlist.upvotes.some((userId) => userId.toString() === req.user._id.toString());

        if (alreadyUpvoted) 
        {
            playlist.upvotes = playlist.upvotes.filter((userId) => userId.toString() !== req.user._id.toString());

            await playlist.save();

            return res.json({message: "Upvote removed", upvoteCount: playlist.upvotes.length, hasUpvoted: false});
        }

        playlist.upvotes.push(req.user._id);
        await playlist.save();

        res.json({message: "Playlist upvoted", upvoteCount: playlist.upvotes.length, hasUpvoted: true});
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

export default router;