import express from "express";
import Album from "../models/Album.js";
import Song from "../models/Song.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try
    {
        const albums = await Album.find().sort({ createdAt: -1 });
        res.json(albums);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
});

router.get("/featured", async (req, res) => {
    try
    {
        const albums = await Album.find({ isFeatured: true }).sort({ createdAt: -1 });
        res.json(albums);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
});

router.get("/with-reviews/all", async (req, res) => {
    try {
        const albums = await Album.aggregate([
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "album",
                    as: "reviews"
                }
            },
            {
                $addFields: {
                    reviewCount: { $size: "$reviews" },
                    averageRating: {
                        $cond: [
                            { $gt: [{ $size: "$reviews" }, 0] },
                            { $round: [{ $avg: "$reviews.rating" }, 1] },
                            0
                        ]
                    }
                }
            },
            {
                $match: {
                    reviewCount: { $gt: 0 }
                }
            },
            {
                $sort: {
                    reviewCount: -1,
                    averageRating: -1,
                    createdAt: -1
                }
            }
        ]);

        res.json(albums);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try
    {
        const album = await Album.findById(req.params.id).populate("tracks");

        if (!album)
        {
            return res.status(404).json({ message: "Album not found" });
        }

        res.json(album);
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
            coverImage,
            spotifyAlbumId,
            spotifyUrl,
            releaseDate,
            totalTracks,
            tracks = []
        } = req.body;

        if (!title || !artist || !spotifyAlbumId)
        {
            return res.status(400).json({ message: "Title, artist, and spotifyAlbumId are required" });
        }

        const linkedTrackIds = [];

        for (const track of tracks)
        {
            if (!track.title) continue;

            let song = null;

            if (track.spotifyId)
            {
                song = await Song.findOne({ spotifyId: track.spotifyId });
            }

            if (!song)
            {
                song = await Song.findOne({
                    title: track.title,
                    artist: track.artist || artist,
                    album: title
                });
            }

            if (!song)
            {
                song = await Song.create({
                    title: track.title,
                    artist: track.artist || artist,
                    album: title,
                    duration: track.duration || 0,
                    coverImage: track.coverImage || coverImage || "",
                    spotifyId: track.spotifyId || "",
                    spotifyUrl: track.spotifyUrl || "",
                    genre: track.genre || ""
                });
            }
            else
            {
                song.title = song.title || track.title;
                song.artist = song.artist || track.artist || artist;
                song.album = track.album || song.album || title;
                song.duration = track.duration ?? song.duration;
                song.coverImage = track.coverImage || song.coverImage || coverImage || "";
                song.spotifyId = track.spotifyId || song.spotifyId || "";
                song.spotifyUrl = track.spotifyUrl || song.spotifyUrl || "";
                await song.save();
            }

            linkedTrackIds.push(song._id);
        }

        let album = await Album.findOne({ spotifyAlbumId });

        if (album)
        {
            album.title = title;
            album.artist = artist;
            album.coverImage = coverImage || album.coverImage || "";
            album.spotifyUrl = spotifyUrl || album.spotifyUrl || "";
            album.releaseDate = releaseDate || album.releaseDate || "";
            album.totalTracks = totalTracks || linkedTrackIds.length || album.totalTracks || 0;
            album.isFeatured = true;
            album.addedByAdmin = true;
            album.addedBy = req.user._id;
            album.tracks = linkedTrackIds;

            const updatedAlbum = await album.save();
            const populatedAlbum = await Album.findById(updatedAlbum._id).populate("tracks");
            return res.json(populatedAlbum);
        }

        album = await Album.create({
            title,
            artist,
            coverImage: coverImage || "",
            spotifyAlbumId,
            spotifyUrl: spotifyUrl || "",
            releaseDate: releaseDate || "",
            totalTracks: totalTracks || linkedTrackIds.length || 0,
            isFeatured: true,
            addedByAdmin: true,
            addedBy: req.user._id,
            tracks: linkedTrackIds
        });

        const populatedAlbum = await Album.findById(album._id).populate("tracks");
        res.status(201).json(populatedAlbum);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
    try
    {
        const album = await Album.findById(req.params.id);

        if (!album)
        {
            return res.status(404).json({ message: "Album not found" });
        }

        album.isFeatured = req.body.isFeatured ?? album.isFeatured;

        const updatedAlbum = await album.save();
        res.json(updatedAlbum);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
    try
    {
        const album = await Album.findById(req.params.id);

        if (!album)
        {
            return res.status(404).json({ message: "Album not found" });
        }

        await album.deleteOne();
        res.json({ message: "Album deleted" });
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
});

export default router;