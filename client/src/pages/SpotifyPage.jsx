import { useState } from "react";
import { redirectToAuthCodeFlow } from "../services/spotify";
import { saveSpotifyTrack, searchSpotifyTracks } from "../services/spotifyApi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
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
    buttonStyle,
    inputStyle,
    metaTextStyle,
    pageIntroStyle,
    actionRowStyle
} from "../styles/ui";

const heroStyle = {
    borderRadius: "20px",
    padding: "2rem",
    background: "linear-gradient(135deg, #1b2230 0%, #121720 100%)",
    border: "1px solid #2b3445",
    marginBottom: "2.5rem"
};

const howItWorksGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2.5rem"
};

const centerCardStyle = {
    ...cardStyle,
    maxWidth: "500px",
    margin: "0 auto",
    textAlign: "center"
};

const SpotifyPage = () => {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [message, setMessage] = useState("");

    const handleConnect = async () => {
        try {
            setLoading(true);
            await redirectToAuthCodeFlow();
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert("Failed to start Spotify login");
        }
    };

    const handleSearch = async (event) => {
        event.preventDefault();

        if (!searchTerm.trim()) {
            return;
        }

        try {
            setSearching(true);
            setMessage("");

            const data = await searchSpotifyTracks(searchTerm);

            const normalized = (data || []).map((track) => ({
                ...track,
                artist: track.artist || track.subtitle || "",
                coverImage: track.coverImage || track.image || "",
                spotifyTrackId: track.spotifyTrackId || track.spotifyId || ""
            }));

            setResults(normalized);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || "Spotify search failed");
        } finally {
            setSearching(false);
        }
    };

    const handleSaveSongToLibrary = async (track) => {
        try {
            setMessage("");

            const savedSong = await saveSpotifyTrack({
                title: track.title,
                artist: track.artist || track.subtitle || "",
                album: track.album || "",
                duration: track.duration || 0,
                coverImage: track.coverImage || track.image || "",
                spotifyTrackId: track.spotifyTrackId || track.spotifyId || "",
                spotifyUrl: track.spotifyUrl || ""
            });

            await api.post("/library/save", {
                songId: savedSong._id
            });

            setMessage(`Saved "${savedSong.title}" to your library`);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to save song");
        }
    };

    return (
        <div style={pageStyle}>
            <div style={contentStyle}>
                {/* HERO */}
                <section style={heroStyle}>
                    <h1 style={sectionHeaderStyle}>Connect your music</h1>
                    <p style={pageIntroStyle}>
                        Link your Spotify account to discover, save, and review music all in one place.
                    </p>

                    {!user?.spotifyId && (
                        <div style={actionRowStyle}>
                            <button onClick={handleConnect} disabled={loading} style={{
                                ...buttonStyle,
                                backgroundColor: "#22c55e",
                                border: "none",
                                color: "#0b0f14",
                                fontWeight: "600"
                            }}>
                                {loading ? "Redirecting..." : "Connect with Spotify"}
                            </button>
                        </div>
                    )}
                </section>

                {/* HOW IT WORKS */}
                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>How it works</h2>

                    <div style={howItWorksGrid}>
                        <div style={cardStyle}>
                            <h3 style={{ color: "#22c55e" }}>Connect</h3>
                            <p style={metaTextStyle}>
                                Log in with Spotify to access your music profile.
                            </p>
                        </div>

                        <div style={cardStyle}>
                            <h3 style={{ color: "#22c55e" }}>Discover</h3>
                            <p style={metaTextStyle}>
                                Browse your favorite music and build your own reviews.
                            </p>
                        </div>

                        <div style={cardStyle}>
                            <h3 style={{ color: "#22c55e" }}>Rate</h3>
                            <p style={metaTextStyle}>
                                Score songs, albums, and playlists in one place.
                            </p>
                        </div>
                    </div>
                </section>

                {/* PROFILE */}
                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>Your Spotify Profile</h2>

                    <div style={centerCardStyle}>
                        <h3>Spotify User</h3>

                        <p style={metaTextStyle}><strong>User ID:</strong> {user?.spotifyId || "Not linked"}</p>
                        <p style={metaTextStyle}><strong>Email:</strong> {user?.spotifyEmail || "Not linked"}</p>

                        {user?.spotifyUrl && (
                            <p style={metaTextStyle}>
                                <strong>Profile:</strong>{" "}
                                <a href={user.spotifyUrl} target="_blank" rel="noreferrer" style={{ color: "#22c55e" }}>
                                    Open Profile
                                </a>
                            </p>
                        )}

                        {user?.spotifyImage && (
                            <img
                                src={user.spotifyImage}
                                alt="Spotify profile"
                                style={{
                                    width: "120px",
                                    borderRadius: "50%",
                                    marginTop: "1rem"
                                }}
                            />
                        )}
                    </div>
                </section>

                {/* SEARCH */}
                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>Search Spotify</h2>

                    <form onSubmit={handleSearch} style={{ marginBottom: "1.5rem", display: "flex", gap: "0.75rem" }}>
                        <input
                            type="text"
                            placeholder="Search for a song..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={inputStyle}
                        />
                        <button type="submit" disabled={searching} style={buttonStyle}>
                            {searching ? "Searching..." : "Search"}
                        </button>
                    </form>

                    {message && <div style={messageStyle}>{message}</div>}

                    <div style={gridStyle}>
                        {results.map((track) => (
                            <div key={track.spotifyTrackId} style={cardStyle}>
                                {track.coverImage && (
                                    <img src={track.coverImage} alt={track.title} style={imageStyle} />
                                )}

                                <h3>{track.title}</h3>
                                <p style={metaTextStyle}><strong>Artist:</strong> {track.artist}</p>
                                <p style={metaTextStyle}><strong>Album:</strong> {track.album}</p>

                                {track.spotifyUrl && (
                                    <p style={metaTextStyle}>
                                        <a href={track.spotifyUrl} target="_blank" rel="noreferrer" style={{ color: "#9ecbff" }}>
                                            Open in Spotify
                                        </a>
                                    </p>
                                )}

                                <button onClick={() => handleSaveSongToLibrary(track)} style={buttonStyle}>
                                    Save to Library
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SpotifyPage;