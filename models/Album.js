import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
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
        coverImage:
        {
            type: String,
            default: ""
        },
        spotifyAlbumId:
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
        releaseDate:
        {
            type: String,
            default: ""
        },
        totalTracks:
        {
            type: Number,
            default: 0
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
        },
        tracks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Song"
            }
        ]
    },
    { timestamps: true }
);

const Album = mongoose.model("Album", albumSchema);
export default Album;