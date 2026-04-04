import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
    {
        title: 
        {
            type: String,
            required: true,
            trim: true
        },
        description: 
        {
            type: String,
            default: ""
        },
        owner: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        songs: 
        [
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song"
            }
        ],
        upvotes: 
        [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    { timestamps: true }
);

const Playlist = mongoose.model("Playlist", playlistSchema);
export default Playlist;