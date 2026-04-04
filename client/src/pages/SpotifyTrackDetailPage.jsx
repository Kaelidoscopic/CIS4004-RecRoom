import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import {
    pageStyle,
    contentStyle,
    sectionHeaderStyle,
    messageStyle,
    detailImageStyle,
    metaTextStyle
} from "../styles/ui";

const formatDuration = (ms) => {
    if (!ms) return "0:00";

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
};

const SpotifyTrackDetailPage = () => {
    const { id } = useParams();
    const [track, setTrack] = useState(null);
    const [message, setMessage] = useState("");

    const loadTrack = async () => {
        try
        {
            setMessage("");
            const response = await api.get(`/spotify/track/${id}`);
            setTrack(response.data);
        }
        catch (error)
        {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to load track");
        }
    };

    useEffect(() => {
        loadTrack();
    }, [id]);

    if (message)
    {
        return (
            <div style={pageStyle}>
                <div style={contentStyle}>
                    <h1 style={sectionHeaderStyle}>Spotify Song</h1>
                    <div style={messageStyle}>{message}</div>
                </div>
            </div>
        );
    }

    if (!track)
    {
        return (
            <div style={pageStyle}>
                <div style={contentStyle}>
                    <h1 style={sectionHeaderStyle}>Spotify Song</h1>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={contentStyle}>
                <h1 style={sectionHeaderStyle}>{track.title}</h1>

                {track.image && (
                    <img
                        src={track.image}
                        alt={track.title}
                        style={detailImageStyle}
                    />
                )}

                <p style={metaTextStyle}><strong>Artist:</strong> {track.subtitle}</p>
                <p style={metaTextStyle}><strong>Album:</strong> {track.album}</p>
                <p style={metaTextStyle}><strong>Duration:</strong> {formatDuration(track.duration)}</p>

                {track.spotifyUrl && (
                    <p style={metaTextStyle}>
                        <a href={track.spotifyUrl} target="_blank" rel="noreferrer" style={{ color: "#9ecbff" }}>
                            Open in Spotify
                        </a>
                    </p>
                )}
            </div>
        </div>
    );
};

export default SpotifyTrackDetailPage;