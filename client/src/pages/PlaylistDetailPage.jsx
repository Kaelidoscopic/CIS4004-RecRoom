import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import {
    pageStyle,
    contentStyle,
    sectionHeaderStyle,
    subHeaderStyle,
    messageStyle,
    cardStyle,
    imageStyle,
    metaTextStyle,
    buttonStyle,
    emptyStateStyle,
    linkResetStyle,
    inputStyle,
    textareaStyle
} from "../styles/ui";

const PlaylistDetailPage = () => {
    const { id } = useParams();

    const [playlist, setPlaylist] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    useEffect(() => {
        loadPlaylist();
    }, [id]);

    const loadPlaylist = async () => {
        try
        {
            setMessage("");

            const playlistRes = await api.get(`/playlists/${id}`);
            setPlaylist(playlistRes.data);

            try
            {
                const reviewsRes = await api.get(`/reviews/playlist/${id}`);
                setReviews(reviewsRes.data || []);
            }
            catch
            {
                setReviews([]);
            }
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to load playlist");
        }
    };

    const handleSubmitReview = async () => {
        try
        {
            await api.post("/reviews", {
                playlistId: id,
                rating,
                comment
            });

            setMessage("Review added successfully");
            setRating(5);
            setComment("");
            loadPlaylist();
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to add review");
        }
    };

    if (!playlist)
    {
        return (
            <div style={pageStyle}>
                <div style={contentStyle}>
                    <h1 style={sectionHeaderStyle}>Playlist</h1>
                    {message ? <div style={messageStyle}>{message}</div> : <p>Loading...</p>}
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={contentStyle}>
                <h1 style={sectionHeaderStyle}>{playlist.title}</h1>

                {message && <div style={messageStyle}>{message}</div>}

                <p style={metaTextStyle}>
                    <strong>Description:</strong> {playlist.description || "No description"}
                </p>
                <p style={metaTextStyle}>
                    <strong>Owner:</strong> {playlist.owner?.username || "Unknown"}
                </p>
                <p style={metaTextStyle}>
                    <strong>Total Songs:</strong> {playlist.songs?.length || 0}
                </p>

                <section style={{ marginTop: "2rem" }}>
                    <h2 style={subHeaderStyle}>Songs</h2>

                    {!playlist.songs || playlist.songs.length === 0 ? (
                        <div style={emptyStateStyle}>
                            No songs in this playlist yet.
                        </div>
                    ) : (
                        playlist.songs.map((song) => (
                            <Link
                                key={song._id}
                                to={`/songs/${song._id}`}
                                style={linkResetStyle}
                            >
                                <div style={cardStyle}>
                                    {song.coverImage && (
                                        <img
                                            src={song.coverImage}
                                            alt={song.title}
                                            style={imageStyle}
                                        />
                                    )}

                                    <h3>{song.title}</h3>
                                    <p style={metaTextStyle}>
                                        <strong>Artist:</strong> {song.artist}
                                    </p>
                                    <p style={metaTextStyle}>
                                        <strong>Album:</strong> {song.album || "N/A"}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </section>

                <section style={{ marginTop: "2rem" }}>
                    <h2 style={subHeaderStyle}>Playlist Reviews</h2>

                    <div style={{ ...cardStyle, marginBottom: "1rem" }}>
                        <div style={{ marginBottom: "0.75rem" }}>
                            <label style={metaTextStyle}><strong>Rating:</strong></label>
                            <select
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                style={{ ...inputStyle, marginTop: "0.35rem" }}
                            >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: "0.75rem" }}>
                            <label style={metaTextStyle}><strong>Comment:</strong></label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your thoughts about this playlist"
                                style={{ ...textareaStyle, marginTop: "0.35rem" }}
                            />
                        </div>

                        <button onClick={handleSubmitReview} style={buttonStyle}>
                            Submit Playlist Review
                        </button>
                    </div>

                    {reviews.length === 0 ? (
                        <div style={emptyStateStyle}>No reviews yet.</div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} style={cardStyle}>
                                <p style={metaTextStyle}>
                                    <strong>User:</strong> {review.user?.username || "Unknown"}
                                </p>
                                <p style={metaTextStyle}>
                                    <strong>Rating:</strong> {review.rating} / 5
                                </p>
                                <p style={metaTextStyle}>
                                    <strong>Comment:</strong> {review.comment || "No comment"}
                                </p>
                            </div>
                        ))
                    )}
                </section>
            </div>
        </div>
    );
};

export default PlaylistDetailPage;