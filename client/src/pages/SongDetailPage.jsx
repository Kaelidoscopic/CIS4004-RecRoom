import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import {
    pageStyle,
    contentStyle,
    sectionStyle,
    sectionHeaderStyle,
    subHeaderStyle,
    messageStyle,
    cardStyle,
    detailImageStyle,
    buttonStyle,
    textareaStyle,
    selectStyle,
    metaTextStyle,
    listStackStyle,
    actionRowStyle,
    emptyStateStyle,
    cardHoverStyle
} from "../styles/ui";
import { useAuth } from "../context/AuthContext";

const formatDuration = (ms) => {
    if (!ms) return "0:00";

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
};

const SongDetailPage = () => {
    const { id } = useParams();

    const [song, setSong] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [message, setMessage] = useState("");

    const [rating, setRating] = useState("5");
    const [comment, setComment] = useState("");
    const [submitMessage, setSubmitMessage] = useState("");

    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState("");
    const [playlistMessage, setPlaylistMessage] = useState("");
    const [libraryMessage, setLibraryMessage] = useState("");

    const [mySongReview, setMySongReview] = useState(null);
    const { user } = useAuth();

    const loadSongData = async () => {
        try
        {
            setMessage("");

            const [songRes, reviewsRes, playlistsRes] = await Promise.all([
                api.get(`/songs/${id}`),
                api.get(`/reviews/song/${id}`),
                api.get("/playlists")
            ]);

            const mine = reviewsRes.data.find(
                (review) => review.user && review.user._id === user?._id
            );
            setMySongReview(mine || null);

            setSong(songRes.data);
            setReviews(reviewsRes.data);
            setPlaylists(playlistsRes.data);

            if (playlistsRes.data.length > 0 && !selectedPlaylist)
            {
                setSelectedPlaylist(playlistsRes.data[0]._id);
            }
        }
        catch (error)
        {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to load song details");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        try
        {
            setSubmitMessage("");

            await api.post("/reviews", {
                songId: id,
                rating: Number(rating),
                comment
            });

            setSubmitMessage("Review submitted successfully");
            setComment("");
            setRating("5");

            loadSongData();
        }
        catch (error)
        {
            console.error(error);
            setSubmitMessage(error.response?.data?.message || "Failed to submit review");
        }
    };

    const handleAddToPlaylist = async () => {
        try
        {
            setPlaylistMessage("");

            if (!selectedPlaylist)
            {
                setPlaylistMessage("Please select a playlist");
                return;
            }

            const playlistRes = await api.get(`/playlists/${selectedPlaylist}`);
            const playlist = playlistRes.data;

            const currentSongIds = playlist.songs.map((songItem) =>
                typeof songItem === "object" ? songItem._id : songItem
            );

            if (currentSongIds.includes(song._id))
            {
                setPlaylistMessage("Song is already in that playlist");
                return;
            }

            const updatedSongs = [...currentSongIds, song._id];

            await api.put(`/playlists/${selectedPlaylist}`, {
                title: playlist.title,
                description: playlist.description,
                songs: updatedSongs
            });

            setPlaylistMessage("Song added to playlist successfully");
        }
        catch (error)
        {
            console.error(error);
            setPlaylistMessage(error.response?.data?.message || "Failed to add song to playlist");
        }
    };

    const handleSaveToLibrary = async () => {
        try
        {
            setLibraryMessage("");
            await api.post("/library/save", { songId: song._id });
            setLibraryMessage(`Saved "${song.title}" to your library`);
        }
        catch (error)
        {
            console.error(error);
            setLibraryMessage(error.response?.data?.message || "Failed to save song to library");
        }
    };

    useEffect(() => {
        loadSongData();
    }, [id]);

    if (message)
    {
        return (
            <div style={pageStyle}>
                <div style={contentStyle}>
                    <h1 style={sectionHeaderStyle}>Song Details</h1>
                    <div style={messageStyle}>{message}</div>
                </div>
            </div>
        );
    }

    if (!song)
    {
        return (
            <div style={pageStyle}>
                <div style={contentStyle}>
                    <h1 style={sectionHeaderStyle}>Song Details</h1>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    const averageRating =
        reviews.length > 0
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : null;

    return (
        <div style={pageStyle}>
            <div style={contentStyle}>
                <section style={{
                    ...sectionStyle,
                    borderBottom: "1px solid #2b3445"
                }}>
                    <h1 style={sectionHeaderStyle}>{song.title}</h1>

                    {song.coverImage && (
                        <img
                            src={song.coverImage}
                            alt={song.title}
                            style={detailImageStyle}
                        />
                    )}

                    <p style={metaTextStyle}><strong>Artist:</strong> {song.artist}</p>
                    <p style={metaTextStyle}><strong>Album:</strong> {song.album || "N/A"}</p>
                    {song.genre && <p style={metaTextStyle}><strong>Genre:</strong> {song.genre}</p>}
                    <p style={metaTextStyle}><strong>Duration:</strong> {formatDuration(song.duration)}</p>

                    {song.spotifyUrl && (
                        <p style={metaTextStyle}>
                            <a href={song.spotifyUrl} target="_blank" rel="noreferrer" style={{ color: "#9ecbff" }}>
                                Open in Spotify
                            </a>
                        </p>
                    )}

                    <div style={actionRowStyle}>
                        <button onClick={handleSaveToLibrary} style={buttonStyle}>
                            Save to Library
                        </button>
                    </div>

                    {libraryMessage && <div style={messageStyle}>{libraryMessage}</div>}
                </section>

                <section style={{
                    ...sectionStyle,
                    borderBottom: "1px solid #2b3445"
                }}>
                    <h2 style={subHeaderStyle}>Add to Playlist</h2>

                    {playlists.length === 0 ? (
                        <div style={emptyStateStyle}>
                            You do not have any playlists yet.
                        </div>
                    ) : (
                        <div style={actionRowStyle}>
                            <select
                                value={selectedPlaylist}
                                onChange={(e) => setSelectedPlaylist(e.target.value)}
                                style={selectStyle}
                            >
                                {playlists.map((playlist) => (
                                    <option key={playlist._id} value={playlist._id}>
                                        {playlist.title}
                                    </option>
                                ))}
                            </select>

                            <button onClick={handleAddToPlaylist} style={buttonStyle}>
                                Add to Playlist
                            </button>
                        </div>
                    )}

                    {playlistMessage && <div style={messageStyle}>{playlistMessage}</div>}
                </section>

                <section style={{
                    ...sectionStyle,
                    borderBottom: "1px solid #2b3445"
                }}>
                    <h2 style={subHeaderStyle}>Reviews</h2>
                    <p style={metaTextStyle}>
                        <strong>Average Rating:</strong> {averageRating ? `${averageRating} / 5` : "No ratings yet"}
                    </p>
                    <p style={metaTextStyle}><strong>Total Reviews:</strong> {reviews.length}</p>

                    {mySongReview ? (
                        <div style={messageStyle}>
                            You already reviewed this song. You can edit or delete it from the Reviews page.
                        </div>
                    ) : (
                        <form onSubmit={handleReviewSubmit} style={{
                            marginTop: "1.5rem",
                            marginBottom: "2rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem"
                        }}>
                            <div>
                                <label><strong>Rating:</strong></label>
                                <br />
                                <select value={rating} onChange={(e) => setRating(e.target.value)} style={selectStyle}>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                            </div>

                            <div>
                                <label><strong>Comment:</strong></label>
                                <br />
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write your thoughts about this song..."
                                    style={textareaStyle}
                                />
                            </div>

                            <button type="submit" style={buttonStyle}>Submit Review</button>

                            {submitMessage && <div style={messageStyle}>{submitMessage}</div>}
                        </form>
                    )}

                    {reviews.length === 0 ? (
                        <div style={emptyStateStyle}>
                            No reviews yet. Be the first to review this song.
                        </div>
                    ) : (
                        <div style={listStackStyle}>
                            {reviews.map((review) => (
                                <div
                                    key={review._id}
                                    style={{ ...cardStyle, ...cardHoverStyle }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.02)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                    }}
                                >
                                    <p style={metaTextStyle}><strong>User:</strong> {review.user?.username || "Unknown User"}</p>
                                    <p style={metaTextStyle}><strong>Rating:</strong> {review.rating} / 5</p>
                                    <p style={metaTextStyle}><strong>Comment:</strong> {review.comment || "No comment"}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default SongDetailPage;