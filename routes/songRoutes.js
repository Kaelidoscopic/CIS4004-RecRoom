import express from "express";
import Song from "../models/Song.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import Review from "../models/Review.js";

const router = express.Router();

router.get("/with-reviews/all", protect, async (req, res) => {
    try 
    {
        const songs = await Song.find();

        const songsWithReviews = await Promise.all(
            songs.map(async (song) => {
                const reviews = await Review.find({ song: song._id });

                const reviewCount = reviews.length;
                const averageRating =
                    reviewCount > 0
                        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
                        : 0;

                return {
                    ...song.toObject(),
                    reviewCount,
                    averageRating: Number(averageRating.toFixed(1))
                };
            })
        );

        res.json(songsWithReviews);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});
router.get("/", protect, async (req, res) => {
    try 
    {
        const songs = await Song.find();
        res.json(songs);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});
router.get("/admin/all", protect, adminOnly, async (req, res) => {
    try 
    {
        const songs = await Song.find().sort({ createdAt: -1 });
        res.json(songs);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});
router.get("/featured", async (req, res) => {
    try
    {
        const songs = await Song.find({ isFeatured: true }).sort({ createdAt: -1 });
        res.json(songs);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
});
router.post("/import", protect, adminOnly, async (req, res) => {
    try
    {
        const {
            title,
            artist,
            album,
            genre,
            duration,
            coverImage,
            spotifyTrackId,
            spotifyUrl
        } = req.body;

        if (!title || !artist || !spotifyTrackId)
        {
            return res.status(400).json({ message: "Title, artist, and spotifyTrackId are required" });
        }

        let song = await Song.findOne({ spotifyTrackId });

        if (song)
        {
            song.isFeatured = true;
            song.addedByAdmin = true;
            song.addedBy = req.user._id;

            const updatedSong = await song.save();
            return res.json(updatedSong);
        }

        song = await Song.create({
            title,
            artist,
            album: album || "",
            genre: genre || "",
            duration: duration || 0,
            coverImage: coverImage || "",
            spotifyTrackId,
            spotifyUrl: spotifyUrl || "",
            isFeatured: true,
            addedByAdmin: true,
            addedBy: req.user._id
        });

        res.status(201).json(song);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
});
router.get("/:id", protect, async (req, res) => {
    try 
    {
        const song = await Song.findById(req.params.id);

        if (!song) 
        {
            return res.status(404).json({ message: "Song not found" });
        }

        res.json(song);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.post("/", protect, async (req, res) => {
    try 
    {
        const 
        {
            title,
            artist,
            album,
            genre,
            duration,
            coverImage,
            spotifyTrackId,
            spotifyUrl,
            isFeatured,
            addedByAdmin
        } = req.body;

        if (!title || !artist) 
        {
            return res.status(400).json({ message: "Title and artist are required" });
        }

        if (spotifyTrackId) 
        {
            const existingSong = await Song.findOne({ spotifyTrackId });

            if (existingSong) 
            {
                return res.status(200).json(existingSong);
            }
        }

        const song = await Song.create({
            title,
            artist,
            album: album || "",
            genre: genre || "",
            duration: duration || 0,
            coverImage: coverImage || "",
            spotifyTrackId: spotifyTrackId || "",
            spotifyUrl: spotifyUrl || "",
            isFeatured: !!isFeatured,
            addedByAdmin: !!addedByAdmin,
            addedBy: req.user._id
        });

        res.status(201).json(song);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
    try 
    {
        const song = await Song.findById(req.params.id);

        if (!song) 
        {
            return res.status(404).json({ message: "Song not found" });
        }

        song.title = req.body.title ?? song.title;
        song.artist = req.body.artist ?? song.artist;
        song.album = req.body.album ?? song.album;
        song.genre = req.body.genre ?? song.genre;
        song.duration = req.body.duration ?? song.duration;
        song.coverImage = req.body.coverImage ?? song.coverImage;
        song.spotifyTrackId = req.body.spotifyTrackId ?? song.spotifyTrackId;
        song.spotifyUrl = req.body.spotifyUrl ?? song.spotifyUrl;
        song.isFeatured = req.body.isFeatured ?? song.isFeatured;
        song.addedByAdmin = req.body.addedByAdmin ?? song.addedByAdmin;

        const updatedSong = await song.save();
        res.json(updatedSong);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
    try 
    {
        const song = await Song.findById(req.params.id);

        if (!song) 
        {
            return res.status(404).json({ message: "Song not found" });
        }

        await song.deleteOne();
        res.json({ message: "Song deleted" });
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

export default router;