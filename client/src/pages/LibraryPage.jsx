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
    buttonStyle,
    inputStyle,
    textareaStyle,
    linkResetStyle,
    metaTextStyle,
    checkboxRowStyle,
    pageIntroStyle,
    formCardStyle,
    emptyStateStyle,
    cardHoverStyle
} from "../styles/ui";

const formatDuration = (ms) => {
    if (!ms) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
};

const playlistFormStackStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxWidth: "720px"
};

const fullWidthStyle = {
    width: "100%",
    maxWidth: "100%"
};

const LibraryPage = () => {
    const [songs, setSongs] = useState([]);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [albums, setAlbums] = useState([]);

    const loadLibrary = async () => {
        try
        {
            const [libraryRes, playlistsRes] = await Promise.all([
                api.get("/library"),
                api.get("/playlists")
            ]);

            setSongs(libraryRes.data.songs || []);
            setAlbums(libraryRes.data.albums || []);
            setPlaylists(playlistsRes.data || []);
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to load library");
        }
    };

    useEffect(() => {
        loadLibrary();
    }, []);

    const toggleSong = (songId) => {
        setSelectedSongs((prev) =>
            prev.includes(songId)
                ? prev.filter((id) => id !== songId)
                : [...prev, songId]
        );
    };

    const removeSong = async (songId) => {
        try
        {
            await api.delete(`/library/${songId}`);
            setSongs((prev) => prev.filter((song) => song._id !== songId));
            setSelectedSongs((prev) => prev.filter((id) => id !== songId));
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to remove song");
        }
    };

    const createPlaylist = async () => {
        try
        {
            if (!title.trim())
            {
                setMessage("Playlist title is required");
                return;
            }

            if (selectedSongs.length === 0)
            {
                setMessage("Select at least one song");
                return;
            }

            await api.post("/playlists", {
                title,
                description,
                songs: selectedSongs
            });

            setMessage("Playlist created successfully");
            setTitle("");
            setDescription("");
            setSelectedSongs([]);
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to create playlist");
        }
    };

    return (
        <div style={pageStyle}>
            <div style={contentStyle}>
                <h1 style={sectionHeaderStyle}>Library</h1>
                <p style={pageIntroStyle}>
                    Save songs, organize them, and build playlists from your library.
                </p>

                <p style={metaTextStyle}>
                    <strong>Selected Songs:</strong> {selectedSongs.length}
                </p>

                {message && <div style={messageStyle}>{message}</div>}

                <section style={{ ...sectionStyle, ...formCardStyle }}>
                    <h2 style={subHeaderStyle}>Create Playlist</h2>

                    <div style={playlistFormStackStyle}>
                        <input
                            type="text"
                            placeholder="Playlist title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ ...inputStyle, ...fullWidthStyle, marginBottom: 0 }}
                        />

                        <textarea
                            placeholder="Playlist description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ ...textareaStyle, ...fullWidthStyle, marginBottom: 0 }}
                        />
                    </div>
                </section>

                <section style={{ ...sectionStyle, ...formCardStyle }}>
                    <h2 style={subHeaderStyle}>Saved Albums</h2>

                    {albums.length === 0 ? (
                        <div style={emptyStateStyle}>
                            No albums saved yet.
                        </div>
                    ) : (
                        <div style={gridStyle}>
                            {albums.map((album) => (
                                <Link
                                    key={album._id}
                                    to={`/albums/${album._id}`}
                                    style={linkResetStyle}
                                >
                                    <div style={{ ...cardStyle, ...cardHoverStyle }}>
                                        {album.coverImage && (
                                            <img src={album.coverImage} alt={album.title} style={imageStyle} />
                                        )}

                                        <h3>{album.title}</h3>
                                        <p style={metaTextStyle}>
                                            <strong>Artist:</strong> {album.artist}
                                        </p>
                                        <p style={metaTextStyle}>
                                            <strong>Tracks:</strong> {album.totalTracks || 0}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section style={{ ...sectionStyle, ...formCardStyle }}>
                    <h2 style={subHeaderStyle}>Saved Songs</h2>
                    <p style={metaTextStyle}>
                        <strong>Selected Songs:</strong> {selectedSongs.length}
                    </p>
                    {songs.length === 0 ? (
                        <div style={emptyStateStyle}>
                            No songs in your library yet. Save songs from Browse to get started.
                        </div>
                    ) : (
                        <div style={gridStyle}>
                            {songs.map((song) => (
                                <div
                                    key={song._id}
                                    style={{ ...cardStyle, ...cardHoverStyle }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.02)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                    }}
                                >
                                    <div style={checkboxRowStyle}>
                                        <input
                                            type="checkbox"
                                            checked={selectedSongs.includes(song._id)}
                                            onChange={() => toggleSong(song._id)}
                                        />
                                        <span>Select for playlist</span>
                                    </div>

                                    <Link to={`/songs/${song._id}`} style={linkResetStyle}>
                                        {song.coverImage && (
                                            <img src={song.coverImage} alt={song.title} style={imageStyle} />
                                        )}

                                        <h3>{song.title}</h3>
                                        <p style={metaTextStyle}><strong>Artist:</strong> {song.artist}</p>
                                        <p style={metaTextStyle}><strong>Album:</strong> {song.album || "N/A"}</p>
                                        <p style={metaTextStyle}><strong>Duration:</strong> {formatDuration(song.duration)}</p>
                                    </Link>

                                    <div style={{ marginTop: "0.75rem" }}>
                                        <button onClick={createPlaylist} style={buttonStyle}>
                                            Create Playlist
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                <section style={{ ...sectionStyle, ...formCardStyle }}>
                    <h2 style={subHeaderStyle}>My Playlists</h2>

                    {playlists.length === 0 ? (
                        <div style={emptyStateStyle}>
                            You haven’t created any playlists yet.
                        </div>
                    ) : (
                        <div style={gridStyle}>
                            {playlists.map((playlist) => (
                                <Link
                                    key={playlist._id}
                                    to={`/playlists/${playlist._id}`}
                                    style={linkResetStyle}
                                >
                                    <div style={{ ...cardStyle, ...cardHoverStyle }}>
                                        <h3>{playlist.title}</h3>
                                        <p style={metaTextStyle}>
                                            {playlist.description || "No description"}
                                        </p>
                                        <p style={metaTextStyle}>
                                            {playlist.songs?.length || 0} songs
                                        </p>
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

export default LibraryPage;