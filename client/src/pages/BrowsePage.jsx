import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
    pageStyle,
    contentStyle,
    sectionHeaderStyle,
    messageStyle,
    imageStyle,
    linkResetStyle,
    metaTextStyle,
    buttonStyle,
    pageIntroStyle,
    emptyStateStyle,
    actionRowStyle,
    rowSectionStyle,
    rowHeaderStyle,
    horizontalRowStyle,
    mediaCardStyle,
    largeHeroStyle
} from "../styles/ui";

const formatDuration = (ms) => {
    if (!ms) return "0:00";

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
};

const BrowsePage = () => {
    const [reviewedSongs, setReviewedSongs] = useState([]);
    const [reviewedAlbums, setReviewedAlbums] = useState([]);
    const [message, setMessage] = useState("");
    const [featuredSongs, setFeaturedSongs] = useState([]);
    const [featuredAlbums, setFeaturedAlbums] = useState([]);
    const [recentSongs, setRecentSongs] = useState([]);

    const loadBrowseData = async () => {
        try
        {
            const [
                reviewedSongsRes,
                featuredSongsRes,
                featuredAlbumsRes,
                recentSongsRes,
                reviewedAlbumsRes
            ] = await Promise.allSettled([
                api.get("/songs/with-reviews/all"),
                api.get("/songs/featured"),
                api.get("/albums/featured"),
                api.get("/songs"),
                api.get("/albums/with-reviews/all")
            ]);

            setMessage("");

            setFeaturedSongs(
                featuredSongsRes.status === "fulfilled" ? featuredSongsRes.value.data : []
            );

            setFeaturedAlbums(
                featuredAlbumsRes.status === "fulfilled" ? featuredAlbumsRes.value.data : []
            );

            setReviewedSongs(
                reviewedSongsRes.status === "fulfilled" ? reviewedSongsRes.value.data : []
            );

            setReviewedAlbums(
                reviewedAlbumsRes.status === "fulfilled" ? reviewedAlbumsRes.value.data : []
            );

            setRecentSongs(
                recentSongsRes.status === "fulfilled"
                    ? (recentSongsRes.value.data || []).slice(0, 8)
                    : []
            );
        }
        catch (error)
        {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to load browse content");
        }
    };

    useEffect(() => {
        loadBrowseData();
    }, []);

    const handleSaveToLibrary = async (e, songId, title) => {
        e.preventDefault();
        e.stopPropagation();

        try
        {
            await api.post("/library/save", { songId });
            setMessage(`Saved "${title}" to your library`);
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to save song to library");
        }
    };

    const renderSongRow = (items, emptyText, showReviewData = false) => {
        if (items.length === 0) {
            return <div style={emptyStateStyle}>{emptyText}</div>;
        }

        return (
            <div style={horizontalRowStyle}>
                {items.map((song) => (
                    <Link
                        key={song._id}
                        to={`/songs/${song._id}`}
                        style={linkResetStyle}
                    >
                        <div
                            style={mediaCardStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.03)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            {song.coverImage && (
                                <img src={song.coverImage} alt={song.title} style={imageStyle} />
                            )}

                            <h3 style={{ marginBottom: "0.5rem" }}>{song.title}</h3>
                            <p style={metaTextStyle}><strong>Artist:</strong> {song.artist}</p>
                            <p style={metaTextStyle}><strong>Album:</strong> {song.album || "N/A"}</p>

                            {showReviewData && (
                                <>
                                    {song.genre && (
                                        <p style={metaTextStyle}><strong>Genre:</strong> {song.genre}</p>
                                    )}
                                    <p style={metaTextStyle}>
                                        <strong>Duration:</strong> {formatDuration(song.duration)}
                                    </p>
                                    <p style={metaTextStyle}>
                                        <strong>Average Rating:</strong>{" "}
                                        {song.reviewCount > 0 ? `${song.averageRating} / 5` : "No ratings yet"}
                                    </p>
                                    <p style={metaTextStyle}>
                                        <strong>Reviews:</strong> {song.reviewCount ?? 0}
                                    </p>
                                </>
                            )}

                            <div style={actionRowStyle}>
                                <button
                                    onClick={(e) => handleSaveToLibrary(e, song._id, song.title)}
                                    style={buttonStyle}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    };

    const renderAlbumRow = (items, emptyText, showReviewData = false) => {
        if (items.length === 0) {
            return <div style={emptyStateStyle}>{emptyText}</div>;
        }

        return (
            <div style={horizontalRowStyle}>
                {items.map((album) => (
                    <Link
                        key={album._id}
                        to={`/albums/${album._id}`}
                        style={linkResetStyle}
                    >
                        <div
                            style={mediaCardStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.03)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            {album.coverImage && (
                                <img src={album.coverImage} alt={album.title} style={imageStyle} />
                            )}

                            <h3 style={{ marginBottom: "0.5rem" }}>{album.title}</h3>
                            <p style={metaTextStyle}><strong>Artist:</strong> {album.artist}</p>

                            {showReviewData && (
                                <>
                                    <p style={metaTextStyle}>
                                        <strong>Tracks:</strong> {album.totalTracks || 0}
                                    </p>
                                    <p style={metaTextStyle}>
                                        <strong>Average Rating:</strong>{" "}
                                        {album.reviewCount > 0 ? `${album.averageRating} / 5` : "No ratings yet"}
                                    </p>
                                    <p style={metaTextStyle}>
                                        <strong>Reviews:</strong> {album.reviewCount ?? 0}
                                    </p>
                                </>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        );
    };

    return (
        <div style={pageStyle}>
            <div style={contentStyle}>
                <h1 style={sectionHeaderStyle}>Browse</h1>
                <p style={pageIntroStyle}>
                    Discover featured picks, recent additions, and the most reviewed music on Record Room.
                </p>

                {message && <div style={messageStyle}>{message}</div>}

                <section style={largeHeroStyle}>
                    <h2 style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>Featured by Record Room</h2>
                    <p style={{ margin: 0, color: "#c7d0dd" }}>
                        Curated songs and albums highlighted by the site.
                    </p>
                </section>

                <section style={rowSectionStyle}>
                    <h2 style={rowHeaderStyle}>Featured Songs</h2>
                    {renderSongRow(featuredSongs, "No featured songs yet.")}
                </section>

                <section style={rowSectionStyle}>
                    <h2 style={rowHeaderStyle}>Featured Albums</h2>
                    {renderAlbumRow(featuredAlbums, "No featured albums yet.")}
                </section>

                <section style={rowSectionStyle}>
                    <h2 style={rowHeaderStyle}>Recently Added</h2>
                    {renderSongRow(recentSongs, "No songs added yet.")}
                </section>

                <section style={rowSectionStyle}>
                    <h2 style={rowHeaderStyle}>Top Reviewed Songs</h2>
                    {renderSongRow(reviewedSongs, "No reviewed songs yet.", true)}
                </section>

                <section style={rowSectionStyle}>
                    <h2 style={rowHeaderStyle}>Top Reviewed Albums</h2>
                    {renderAlbumRow(reviewedAlbums, "No reviewed albums yet.", true)}
                </section>
            </div>
        </div>
    );
};

export default BrowsePage;