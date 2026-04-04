import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import spotifyRoutes from "./routes/spotifyRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";


console.log("Spotify routes mounted");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("CIS4004 Project API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/spotify", spotifyRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/albums", albumRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});