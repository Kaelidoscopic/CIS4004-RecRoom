import express from "express";
import Review from "../models/Review.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("user", "username")
            .populate("song", "title artist coverImage")
            .populate("album", "title artist coverImage")
            .populate("playlist", "title");

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/mine", protect, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate("user", "username")
            .populate("song", "title artist coverImage")
            .populate("album", "title artist coverImage")
            .populate("playlist", "title");

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/admin/all", protect, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access only" });
        }

        const reviews = await Review.find()
            .populate("user", "username")
            .populate("song", "title artist coverImage")
            .populate("album", "title artist coverImage")
            .populate("playlist", "title")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/song/:id", async (req, res) => {
    try {
        const reviews = await Review.find({ song: req.params.id })
            .populate("user", "username")
            .populate("song", "title artist coverImage");

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/album/:id", async (req, res) => {
    try {
        const reviews = await Review.find({ album: req.params.id })
            .populate("user", "username")
            .populate("album", "title artist coverImage");

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/playlist/:id", async (req, res) => {
    try {
        const reviews = await Review.find({ playlist: req.params.id })
            .populate("user", "username")
            .populate("playlist", "title");

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/", protect, async (req, res) => {
    try {
        const { songId, albumId, playlistId, rating, comment } = req.body;

        if (!rating) {
            return res.status(400).json({ message: "Rating is required" });
        }

        if (!songId && !albumId && !playlistId) {
            return res.status(400).json({ message: "A song, album, or playlist review target is required" });
        }

        const targetCount = [songId, albumId, playlistId].filter(Boolean).length;

        if (targetCount > 1) {
            return res.status(400).json({ message: "A review can only target one item at a time" });
        }

        const existingReview = await Review.findOne({
            user: req.user._id,
            ...(songId ? { song: songId } : {}),
            ...(albumId ? { album: albumId } : {}),
            ...(playlistId ? { playlist: playlistId } : {})
        });

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this item" });
        }

        const review = await Review.create({
            user: req.user._id,
            song: songId || undefined,
            album: albumId || undefined,
            playlist: playlistId || undefined,
            rating,
            comment: comment || ""
        });

        const populatedReview = await Review.findById(review._id)
            .populate("user", "username")
            .populate("song", "title artist coverImage")
            .populate("album", "title artist coverImage")
            .populate("playlist", "title");

        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put("/:id", protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const isOwner = review.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to edit this review" });
        }

        review.rating = req.body.rating ?? review.rating;
        review.comment = req.body.comment ?? review.comment;

        const updatedReview = await review.save();

        const populatedReview = await Review.findById(updatedReview._id)
            .populate("user", "username")
            .populate("song", "title artist coverImage")
            .populate("album", "title artist coverImage")
            .populate("playlist", "title");

        res.json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const isOwner = review.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        await review.deleteOne();
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;