import { useEffect, useState } from "react";
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
    gridStyle,
    buttonStyle,
    dangerButtonStyle,
    inputStyle,
    textareaStyle,
    checkboxRowStyle,
    metaTextStyle,
    listStackStyle,
    pageIntroStyle,
    emptyStateStyle,
    formCardStyle,
    actionRowStyle,
    cardHoverStyle
} from "../styles/ui";

const MyPlaylistsPage = () => {
    const { user } = useAuth();

    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [message, setMessage] = useState("");
    const [form, setForm] = useState({ title: "", description: "", songs: [] });
    const [editingPlaylistId, setEditingPlaylistId] = useState(null);
    const [editForm, setEditForm] = useState({ title: "", description: "" });

    const fetchSongs = async () => {
        try
        {
            const response = await api.get("/songs");
            setSongs(response.data);
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to load songs");
        }
    };

    const fetchPlaylists = async () => {
        try
        {
            const response = await api.get("/playlists");
            setPlaylists(response.data);
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to load playlists");
        }
    };

    useEffect(() => {
        fetchSongs();
        fetchPlaylists();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSongToggle = (songId) => {
        const alreadySelected = form.songs.includes(songId);

        if (alreadySelected)
        {
            setForm({ ...form, songs: form.songs.filter((id) => id !== songId) });
        }
        else
        {
            setForm({ ...form, songs: [...form.songs, songId] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try
        {
            await api.post("/playlists", {
                title: form.title,
                description: form.description,
                songs: form.songs
            });

            setForm({ title: "", description: "", songs: [] });
            setMessage("Playlist created successfully");
            fetchPlaylists();
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to create playlist");
        }
    };

    const myPlaylists = playlists.filter((playlist) => {
        if (!playlist.owner) return false;
        return playlist.owner._id === user?._id;
    });

    const handleDelete = async (playlistId) => {
        try
        {
            await api.delete(`/playlists/${playlistId}`);
            setMessage("Playlist deleted successfully");
            fetchPlaylists();
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to delete playlist");
        }
    };

    const handleEditClick = (playlist) => {
        setEditingPlaylistId(playlist._id);
        setEditForm({
            title: playlist.title || "",
            description: playlist.description || ""
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSave = async (playlistId) => {
        try
        {
            await api.put(`/playlists/${playlistId}`, {
                title: editForm.title,
                description: editForm.description
            });

            setMessage("Playlist updated successfully");
            setEditingPlaylistId(null);
            fetchPlaylists();
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to update playlist");
        }
    };

    const handleEditCancel = () => {
        setEditingPlaylistId(null);
        setEditForm({ title: "", description: "" });
    };

    const handleUpvote = async (playlistId) => {
        try
        {
            await api.post(`/playlists/${playlistId}/upvote`);
            setMessage("Playlist upvoted successfully");
            fetchPlaylists();
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to upvote playlist");
        }
    };

    return (
        <div style={pageStyle}>
            <div style={contentStyle}>
                <h1 style={sectionHeaderStyle}>Playlists</h1>
                <p style={pageIntroStyle}>
                    Build your own playlists, manage what you created, and explore what everyone else has shared.
                </p>

                {message && <div style={messageStyle}>{message}</div>}

                <section style={{ ...sectionStyle, ...formCardStyle }}>
                    <h2 style={subHeaderStyle}>Create Playlist</h2>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="title"
                            placeholder="Playlist title"
                            value={form.title}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        <textarea
                            name="description"
                            placeholder="Playlist description"
                            value={form.description}
                            onChange={handleChange}
                            style={textareaStyle}
                        />

                        <div style={{ marginBottom: "1rem" }}>
                            <h3 style={subHeaderStyle}>Select Songs</h3>
                            <p style={metaTextStyle}>
                                <strong>Selected Songs:</strong> {form.songs.length}
                            </p>

                            {songs.length === 0 ? (
                                <div style={emptyStateStyle}>No songs available yet.</div>
                            ) : (
                                <div style={listStackStyle}>
                                    {songs.map((song) => (
                                        <label key={song._id} style={checkboxRowStyle}>
                                            <input
                                                type="checkbox"
                                                checked={form.songs.includes(song._id)}
                                                onChange={() => handleSongToggle(song._id)}
                                            />
                                            <span>{song.title} - {song.artist}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={actionRowStyle}>
                            <button
                                type="submit"
                                style={buttonStyle}
                                disabled={!form.title.trim() || form.songs.length === 0}
                            >
                                Create Playlist
                            </button>
                        </div>
                    </form>
                </section>

                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>My Playlists</h2>

                    {myPlaylists.length === 0 ? (
                        <div style={emptyStateStyle}>
                            You have not created any playlists yet.
                        </div>
                    ) : (
                        <div style={gridStyle}>
                            {myPlaylists.map((playlist) => (
                                <div
                                    key={playlist._id}
                                    style={{ ...cardStyle, ...cardHoverStyle }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.02)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                    }}
                                >
                                    {editingPlaylistId === playlist._id ? (
                                        <>
                                            <h3>Edit Playlist</h3>

                                            <input
                                                type="text"
                                                name="title"
                                                value={editForm.title}
                                                onChange={handleEditChange}
                                                style={inputStyle}
                                            />

                                            <textarea
                                                name="description"
                                                value={editForm.description}
                                                onChange={handleEditChange}
                                                style={textareaStyle}
                                            />

                                            <div style={actionRowStyle}>
                                                <button
                                                    onClick={() => handleEditSave(playlist._id)}
                                                    style={buttonStyle}
                                                >
                                                    Save Changes
                                                </button>

                                                <button
                                                    onClick={handleEditCancel}
                                                    style={dangerButtonStyle}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3>{playlist.title}</h3>
                                            <p style={metaTextStyle}>
                                                {playlist.description || "No description"}
                                            </p>
                                            <p style={metaTextStyle}>
                                                <strong>Upvotes:</strong> {playlist.upvotes ?? 0}
                                            </p>

                                            <div style={actionRowStyle}>
                                                <button
                                                    onClick={() => handleEditClick(playlist)}
                                                    style={buttonStyle}
                                                >
                                                    Edit Playlist
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(playlist._id)}
                                                    style={dangerButtonStyle}
                                                >
                                                    Delete Playlist
                                                </button>

                                                <button
                                                    onClick={() => handleUpvote(playlist._id)}
                                                    style={buttonStyle}
                                                >
                                                    Upvote
                                                </button>
                                            </div>

                                            <h4 style={subHeaderStyle}>Songs</h4>
                                            {playlist.songs && playlist.songs.length > 0 ? (
                                                <ul>
                                                    {playlist.songs.map((song) => (
                                                        <li key={song._id}>
                                                            {song.title} - {song.artist}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>No songs in this playlist.</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>All Playlists</h2>

                    {playlists.length === 0 ? (
                        <div style={emptyStateStyle}>No playlists available.</div>
                    ) : (
                        <div style={gridStyle}>
                            {playlists.map((playlist) => (
                                <div
                                    key={playlist._id}
                                    style={{ ...cardStyle, ...cardHoverStyle }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.02)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                    }}
                                >
                                    <h3>{playlist.title}</h3>
                                    <p style={metaTextStyle}>
                                        {playlist.description || "No description"}
                                    </p>
                                    <p style={metaTextStyle}>
                                        <strong>Owner:</strong> {playlist.owner?.username || "Unknown"}
                                    </p>
                                    <p style={metaTextStyle}>
                                        <strong>Upvotes:</strong> {playlist.upvotes ?? 0}
                                    </p>

                                    <div style={actionRowStyle}>
                                        <button
                                            onClick={() => handleUpvote(playlist._id)}
                                            style={buttonStyle}
                                        >
                                            Upvote
                                        </button>
                                    </div>

                                    <h4 style={subHeaderStyle}>Songs</h4>
                                    {playlist.songs && playlist.songs.length > 0 ? (
                                        <ul>
                                            {playlist.songs.map((song) => (
                                                <li key={song._id}>
                                                    {song.title} - {song.artist}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No songs in this playlist.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MyPlaylistsPage;