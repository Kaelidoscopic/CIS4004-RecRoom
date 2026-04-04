import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
    listStackStyle,
    linkResetStyle,
    metaTextStyle
} from "../styles/ui";

const formatDuration = (ms) => {
    if (!ms) return "0:00";

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
};

const SpotifyAlbumDetailPage = () => {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [message, setMessage] = useState("");

    const loadAlbum = async () => {
        try
        {
            setMessage("");
            const response = await api.get(`/spotify/album/${id}`);
            setAlbum(response.data);
        }
        catch (error)
        {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to load album");
        }
    };

    useEffect(() => {
        loadAlbum();
    }, [id]);

    if (message)
    {
        return (
            <div style={pageStyle}>
                <div style={contentStyle}>
                    <h1 style={sectionHeaderStyle}>Spotify Album</h1>
                    <div style={messageStyle}>{message}</div>
                </div>
            </div>
        );
    }

    if (!album)
    {
        return (
            <div style={pageStyle}>
                <div style={contentStyle}>
                    <h1 style={sectionHeaderStyle}>Spotify Album</h1>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={contentStyle}>
                <section style={sectionStyle}>
                    <h1 style={sectionHeaderStyle}>{album.title}</h1>

                    {album.image && (
                        <img
                            src={album.image}
                            alt={album.title}
                            style={detailImageStyle}
                        />
                    )}

                    <p style={metaTextStyle}><strong>Artist:</strong> {album.subtitle}</p>
                    <p style={metaTextStyle}>
                        <strong>Release Date:</strong> {album.releaseDate || album.release_date || "N/A"}
                    </p>
                    <p style={metaTextStyle}><strong>Total Tracks:</strong> {album.totalTracks}</p>

                    {album.spotifyUrl && (
                        <p style={metaTextStyle}>
                            <a href={album.spotifyUrl} target="_blank" rel="noreferrer" style={{ color: "#9ecbff" }}>
                                Open in Spotify
                            </a>
                        </p>
                    )}
                </section>

                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>Track List</h2>

                    {!album.tracks || album.tracks.length === 0 ? (
                        <p>No tracks found.</p>
                    ) : (
                        <div style={listStackStyle}>
                            {album.tracks.map((track) => (
                                <Link
                                    key={track.spotifyId}
                                    to={`/spotify/track/${track.spotifyId}`}
                                    style={linkResetStyle}
                                >
                                    <div style={cardStyle}>
                                        <p style={metaTextStyle}><strong>{track.trackNumber}.</strong> {track.title}</p>
                                        <p style={metaTextStyle}><strong>Duration:</strong> {formatDuration(track.duration)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default SpotifyAlbumDetailPage;