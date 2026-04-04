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

const AlbumDetailPage = () => {
    const { id } = useParams();

    const [album, setAlbum] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    useEffect(() => {
        loadAlbum();
    }, [id]);

    const loadAlbum = async () => {
        try
        {
            const albumRes = await api.get(`/albums/${id}`);
            setAlbum(albumRes.data);

            try
            {
                const reviewRes = await api.get(`/reviews/album/${id}`);
                setReviews(reviewRes.data || []);
            }
            catch
            {
                setReviews([]);
            }
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to load album");
        }
    };

    const handleSaveAlbum = async () => {
        try
        {
            await api.post("/library/save-album", { albumId: id });
            setMessage("Album saved to library");
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to save album");
        }
    };

    const handleSubmitReview = async () => {
        try
        {
            await api.post("/reviews", {
                albumId: id,
                rating,
                comment
            });

            setMessage("Review added successfully");
            setComment("");
            setRating(5);
            loadAlbum();
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to add review");
        }
    };

    if (!album)
    {
        return (
            <div style={pageStyle}>
                <div style={contentStyle}>
                    <h1 style={sectionHeaderStyle}>Album</h1>
                    {message ? <div style={messageStyle}>{message}</div> : <p>Loading...</p>}
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={contentStyle}>
                <h1 style={sectionHeaderStyle}>{album.title}</h1>

                {message && <div style={messageStyle}>{message}</div>}

                {album.coverImage && (
                    <img
                        src={album.coverImage}
                        alt={album.title}
                        style={imageStyle}
                    />
                )}

                <p style={metaTextStyle}>
                    <strong>Artist:</strong> {album.artist}
                </p>
                <p style={metaTextStyle}>
                    <strong>Release Date:</strong> {album.releaseDate || "N/A"}
                </p>
                <p style={metaTextStyle}>
                    <strong>Total Tracks:</strong> {album.totalTracks || 0}
                </p>

                {album.spotifyUrl && (
                    <p style={metaTextStyle}>
                        <a href={album.spotifyUrl} target="_blank" rel="noreferrer">
                            Open in Spotify
                        </a>
                    </p>
                )}

                <button onClick={handleSaveAlbum} style={buttonStyle}>
                    Save Album to Library
                </button>

                <section style={{ marginTop: "2rem" }}>
                    <h2 style={subHeaderStyle}>Tracks</h2>

                    {!album.tracks || album.tracks.length === 0 ? (
                        <div style={emptyStateStyle}>
                            No linked tracks available for this album yet.
                        </div>
                    ) : (
                        album.tracks.map((track) => (
                            <Link
                                key={track._id}
                                to={`/songs/${track._id}`}
                                style={linkResetStyle}
                            >
                                <div style={cardStyle}>
                                    <h3>{track.title}</h3>
                                    <p style={metaTextStyle}>
                                        <strong>Artist:</strong> {track.artist}
                                    </p>
                                    <p style={metaTextStyle}>
                                        <strong>Album:</strong> {track.album || album.title}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </section>

                <section style={{ marginTop: "2rem" }}>
                    <h2 style={subHeaderStyle}>Album Reviews</h2>

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
                                placeholder="Write your thoughts about this album"
                                style={{ ...textareaStyle, marginTop: "0.35rem" }}
                            />
                        </div>

                        <button onClick={handleSubmitReview} style={buttonStyle}>
                            Submit Album Review
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

export default AlbumDetailPage;