import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: 
    {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: 
    {
        type: String,
        required: true
    },
    role: 
    {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },

    spotifyId: 
    {
        type: String,
        default: ""
    },
    spotifyDisplayName: 
    {
        type: String,
        default: ""
    },
    spotifyEmail: 
    {
        type: String,
        default: ""
    },
    spotifyUrl: 
    {
        type: String,
        default: ""
    },
    spotifyImage: 
    {
        type: String,
        default: ""
    },
    librarySongs: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
    }
    ],
    libraryAlbums: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album"
        }
    ],
        album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
        required: false
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;