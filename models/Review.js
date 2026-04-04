import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        song:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
            default: null
        },
        album:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album",
            default: null
        },
        playlist:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Playlist",
            default: null
        },
        rating:
        {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment:
        {
            type: String,
            default: "",
            trim: true
        }
    },
    { timestamps: true }
);

reviewSchema.index(
    { user: 1, song: 1 },
    {
        unique: true,
        partialFilterExpression: { song: { $type: "objectId" } }
    }
);

reviewSchema.index(
    { user: 1, album: 1 },
    {
        unique: true,
        partialFilterExpression: { album: { $type: "objectId" } }
    }
);

reviewSchema.index(
    { user: 1, playlist: 1 },
    {
        unique: true,
        partialFilterExpression: { playlist: { $type: "objectId" } }
    }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;