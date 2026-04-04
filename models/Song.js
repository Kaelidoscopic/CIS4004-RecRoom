import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
    {
        title:
        {
            type: String,
            required: true,
            trim: true
        },
        artist:
        {
            type: String,
            required: true,
            trim: true
        },
        album:
        {
            type: String,
            default: ""
        },
        genre:
        {
            type: String,
            default: ""
        },
        duration:
        {
            type: Number,
            default: 0
        },
        coverImage:
        {
            type: String,
            default: ""
        },
        spotifyTrackId:
        {
            type: String,
            default: "",
            index: true
        },
        spotifyUrl:
        {
            type: String,
            default: ""
        },
        isFeatured:
        {
            type: Boolean,
            default: false
        },
        addedByAdmin:
        {
            type: Boolean,
            default: false
        },
        addedBy:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    { timestamps: true }
);

const Song = mongoose.model("Song", songSchema);
export default Song;