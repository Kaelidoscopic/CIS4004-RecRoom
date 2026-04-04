import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
    pageStyle,
    contentStyle,
    sectionStyle,
    sectionHeaderStyle,
    subHeaderStyle,
    messageStyle,
    cardStyle,
    imageStyle,
    gridStyle,
    linkResetStyle,
    metaTextStyle,
    buttonStyle,
    dangerButtonStyle,
    textareaStyle,
    selectStyle,
    pageIntroStyle,
    emptyStateStyle,
    cardHoverStyle
} from "../styles/ui";

const ReviewsPage = () => {
    const [allReviews, setAllReviews] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [message, setMessage] = useState("");

    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState("5");
    const [editComment, setEditComment] = useState("");

    const getReviewTarget = (review) => {
        if (review.song) {
            return {
                type: "song",
                title: review.song.title,
                artist: review.song.artist,
                image: review.song.coverImage || "",
                link: `/songs/${review.song._id}`
            };
        }

        if (review.album) {
            return {
                type: "album",
                title: review.album.title,
                artist: review.album.artist,
                image: review.album.coverImage || "",
                link: `/albums/${review.album._id}`
            };
        }

        if (review.playlist) {
            return {
                type: "playlist",
                title: review.playlist.title,
                artist: "Playlist",
                image: "",
                link: `/playlists/${review.playlist._id}`
            };
        }

        return {
            type: "unknown",
            title: "Unknown Item",
            artist: "Unknown",
            image: "",
            link: "#"
        };
    };

    const loadReviews = async () => {
        try
        {
            setMessage("");

            const [allRes, mineRes] = await Promise.allSettled([
                api.get("/reviews"),
                api.get("/reviews/mine")
            ]);

            if (allRes.status === "fulfilled")
            {
                setAllReviews(allRes.value.data || []);
            }
            else
            {
                console.error("all reviews failed:", allRes.reason);
                setAllReviews([]);
            }

            if (mineRes.status === "fulfilled")
            {
                setMyReviews(mineRes.value.data || []);
            }
            else
            {
                console.error("my reviews failed:", mineRes.reason);
                setMyReviews([]);
            }
        }
        catch (error)
        {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to load reviews");
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const startEditing = (review) => {
        setEditingReviewId(review._id);
        setEditRating(String(review.rating));
        setEditComment(review.comment || "");
    };

    const cancelEditing = () => {
        setEditingReviewId(null);
        setEditRating("5");
        setEditComment("");
    };

    const saveEdit = async (reviewId) => {
        try
        {
            await api.put(`/reviews/${reviewId}`, {
                rating: Number(editRating),
                comment: editComment
            });

            setMessage("Review updated successfully");
            cancelEditing();
            loadReviews();
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to update review");
        }
    };

    const deleteReview = async (reviewId) => {
        try
        {
            await api.delete(`/reviews/${reviewId}`);
            setMessage("Review deleted successfully");

            if (editingReviewId === reviewId)
            {
                cancelEditing();
            }

            loadReviews();
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to delete review");
        }
    };

    return (
        <div style={pageStyle}>
            <div style={contentStyle}>
                <h1 style={sectionHeaderStyle}>Reviews</h1>
                <p style={pageIntroStyle}>
                    Manage your own reviews and explore what other users are saying.
                </p>

                {message && <div style={messageStyle}>{message}</div>}

                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>Your Reviews</h2>

                    {myReviews.length === 0 ? (
                        <div style={emptyStateStyle}>
                            You have not written any reviews yet.
                        </div>
                    ) : (
                        <div style={gridStyle}>
                            {myReviews.map((review) => {
                                const target = getReviewTarget(review);

                                return (
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
                                        <Link to={target.link} style={linkResetStyle}>
                                            {target.image && (
                                                <img
                                                    src={target.image}
                                                    alt={target.title}
                                                    style={imageStyle}
                                                />
                                            )}

                                            <h3>{target.title}</h3>
                                            <p style={metaTextStyle}>
                                                <strong>{target.type === "playlist" ? "Type:" : "Artist:"}</strong>{" "}
                                                {target.artist}
                                            </p>
                                            <p style={metaTextStyle}>
                                                <strong>Review Type:</strong> {target.type}
                                            </p>
                                            <p style={metaTextStyle}>
                                                <strong>Date:</strong>{" "}
                                                {review.createdAt
                                                    ? new Date(review.createdAt).toLocaleString()
                                                    : "Unknown"}
                                            </p>
                                        </Link>

                                        {editingReviewId === review._id ? (
                                            <>
                                                <div style={{ marginTop: "1rem" }}>
                                                    <label><strong>Rating:</strong></label>
                                                    <br />
                                                    <select
                                                        value={editRating}
                                                        onChange={(e) => setEditRating(e.target.value)}
                                                        style={selectStyle}
                                                    >
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
                                                        value={editComment}
                                                        onChange={(e) => setEditComment(e.target.value)}
                                                        style={textareaStyle}
                                                    />
                                                </div>

                                                <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem" }}>
                                                    <button onClick={() => saveEdit(review._id)} style={buttonStyle}>
                                                        Save Changes
                                                    </button>

                                                    <button onClick={cancelEditing} style={dangerButtonStyle}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p style={metaTextStyle}>
                                                    <strong>Your Rating:</strong> {review.rating} / 5
                                                </p>
                                                <p style={metaTextStyle}>
                                                    <strong>Your Review:</strong> {review.comment || "No comment"}
                                                </p>

                                                <button
                                                    onClick={() => startEditing(review)}
                                                    style={buttonStyle}
                                                >
                                                    Edit Review
                                                </button>

                                                <button
                                                    onClick={() => deleteReview(review._id)}
                                                    style={dangerButtonStyle}
                                                >
                                                    Delete Review
                                                </button>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>All Reviews on Record Room</h2>

                    {allReviews.length === 0 ? (
                        <div style={emptyStateStyle}>
                            No reviews on the site yet.
                        </div>
                    ) : (
                        <div style={gridStyle}>
                            {allReviews.map((review) => {
                                const target = getReviewTarget(review);

                                return (
                                    <Link
                                        key={review._id}
                                        to={target.link}
                                        style={linkResetStyle}
                                    >
                                        <div style={cardStyle}>
                                            {target.image && (
                                                <img
                                                    src={target.image}
                                                    alt={target.title}
                                                    style={imageStyle}
                                                />
                                            )}

                                            <h3>{target.title}</h3>
                                            <p style={metaTextStyle}>
                                                <strong>{target.type === "playlist" ? "Type:" : "Artist:"}</strong>{" "}
                                                {target.artist}
                                            </p>
                                            <p style={metaTextStyle}>
                                                <strong>Review Type:</strong> {target.type}
                                            </p>
                                            <p style={metaTextStyle}>
                                                <strong>Reviewer:</strong> {review.user?.username || "Unknown User"}
                                            </p>
                                            <p style={metaTextStyle}>
                                                <strong>Rating:</strong> {review.rating} / 5
                                            </p>
                                            <p style={metaTextStyle}>
                                                <strong>Review:</strong> {review.comment || "No comment"}
                                            </p>
                                            <p style={metaTextStyle}>
                                                <strong>Date:</strong>{" "}
                                                {review.createdAt
                                                    ? new Date(review.createdAt).toLocaleString()
                                                    : "Unknown"}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ReviewsPage;