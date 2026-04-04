import { useEffect, useState } from "react";
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
    dangerButtonStyle,
    inputStyle,
    selectStyle,
    metaTextStyle
} from "../styles/ui";

const AdminDashboard = () => {
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [reviews, setReviews] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("track");
    const [results, setResults] = useState([]);

    const [message, setMessage] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [importingId, setImportingId] = useState("");

    const loadData = async () => {
        try
        {
            const requests = [
                api.get("/songs/admin/all"),
                api.get("/albums"),
                api.get("/playlists/admin/all"),
                api.get("/reviews/admin/all")
            ];

            const [songsRes, albumsRes, playlistsRes, reviewsRes] = await Promise.allSettled(requests);

            setSongs(songsRes.status === "fulfilled" ? songsRes.value.data : []);
            setAlbums(albumsRes.status === "fulfilled" ? albumsRes.value.data : []);
            setPlaylists(playlistsRes.status === "fulfilled" ? playlistsRes.value.data : []);
            setReviews(reviewsRes.status === "fulfilled" ? reviewsRes.value.data : []);
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to load admin data");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSpotifySearch = async () => {
        if (!searchQuery.trim())
        {
            setMessage("Enter a song or album name to search");
            return;
        }

        try
        {
            setSearchLoading(true);
            setMessage("");

            const res = await api.get("/spotify/search", {
                params: {
                    q: searchQuery.trim(),
                    type: searchType
                }
            });

            setResults(res.data || []);

            if (!res.data?.length)
            {
                setMessage("No Spotify results found");
            }
        }
        catch (error)
        {
            console.error(error);
            setResults([]);
            setMessage(error.response?.data?.message || "Spotify search failed");
        }
        finally
        {
            setSearchLoading(false);
        }
    };

    const handleImport = async (item) => {
        try
        {
            setImportingId(item.spotifyId);
            setMessage("");

            if (item.type === "track")
            {
                await api.post("/songs/import", {
                    title: item.title,
                    artist: item.subtitle,
                    album: item.album,
                    duration: item.duration,
                    coverImage: item.image,
                    spotifyTrackId: item.spotifyId,
                    spotifyUrl: item.spotifyUrl
                });

                setMessage(`Added "${item.title}" to featured songs`);
            }
            else
            {
                const albumRes = await api.get(`/spotify/album/${item.spotifyId}`);

                const albumData = albumRes.data;

                await api.post("/albums/import", {
                    title: item.title,
                    artist: item.subtitle,
                    coverImage: item.image,
                    spotifyAlbumId: item.spotifyId,
                    spotifyUrl: item.spotifyUrl,
                    releaseDate: albumData.releaseDate || albumData.release_date || "",
                    totalTracks: item.totalTracks,

                    tracks: (albumData.tracks || []).map((track) => ({
                        title: track.title,
                        artist: track.artist || item.subtitle,
                        duration: track.duration,
                        spotifyId: track.spotifyId,
                        spotifyUrl: track.spotifyUrl || "",
                        coverImage: item.image
                    }))
                });

                setMessage(`Added "${item.title}" to featured albums`);
            }
            await loadData();
        }
        catch (error)
        {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to import item");
        }
        finally
        {
            setImportingId("");
        }
    };

    const handleDelete = async (type, id) => {
        try
        {
            await api.delete(`/${type}/${id}`);
            setMessage(`${type.slice(0, -1)} deleted successfully`);
            await loadData();
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || `Failed to delete ${type}`);
        }
    };

    const handleToggleSongFeatured = async (song) => {
        try
        {
            await api.put(`/songs/${song._id}`, {
                isFeatured: !song.isFeatured
            });

            setMessage(
                !song.isFeatured
                    ? `"${song.title}" added to featured songs`
                    : `"${song.title}" removed from featured songs`
            );

            await loadData();
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to update featured song");
        }
    };

    const handleToggleAlbumFeatured = async (album) => {
        try
        {
            await api.put(`/albums/${album._id}`, {
                isFeatured: !album.isFeatured
            });

            setMessage(
                !album.isFeatured
                    ? `"${album.title}" added to featured albums`
                    : `"${album.title}" removed from featured albums`
            );

            await loadData();
        }
        catch (error)
        {
            setMessage(error.response?.data?.message || "Failed to update featured album");
        }
    };

    return (
        <div style={pageStyle}>
            <div style={contentStyle}>
                <h1 style={sectionHeaderStyle}>Admin Dashboard</h1>
                <p>Use Spotify search to add featured songs and albums to Browse.</p>

                {message && <div style={messageStyle}>{message}</div>}

                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>Search Spotify</h2>

                    <input
                        type="text"
                        placeholder={searchType === "track" ? "Search for a song..." : "Search for an album..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={inputStyle}
                    />
                    <br />

                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="track">Songs</option>
                        <option value="album">Albums</option>
                    </select>

                    <button
                        onClick={handleSpotifySearch}
                        style={buttonStyle}
                        disabled={searchLoading}
                    >
                        {searchLoading ? "Searching..." : "Search Spotify"}
                    </button>

                    <div style={{ marginTop: "1.5rem", ...gridStyle }}>
                        {results.map((item) => (
                            <div key={item.spotifyId} style={cardStyle}>
                                {item.image && (
                                    <img src={item.image} alt={item.title} style={imageStyle} />
                                )}

                                <h3>{item.title}</h3>
                                <p style={metaTextStyle}><strong>Artist:</strong> {item.subtitle}</p>

                                {item.type === "track" && (
                                    <p style={metaTextStyle}><strong>Album:</strong> {item.album || "N/A"}</p>
                                )}

                                {item.type === "album" && (
                                    <p style={metaTextStyle}><strong>Total Tracks:</strong> {item.totalTracks || 0}</p>
                                )}

                                <button
                                    style={buttonStyle}
                                    onClick={() => handleImport(item)}
                                    disabled={importingId === item.spotifyId}
                                >
                                    {importingId === item.spotifyId ? "Adding..." : "Add to Browse"}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>All Songs</h2>
                    <div style={gridStyle}>
                        {songs.map((song) => (
                            <div key={song._id} style={cardStyle}>
                                <h3>{song.title}</h3>
                                <p style={metaTextStyle}><strong>Artist:</strong> {song.artist}</p>
                                <p style={metaTextStyle}><strong>Album:</strong> {song.album || "N/A"}</p>
                                <p style={metaTextStyle}><strong>Featured:</strong> {song.isFeatured ? "Yes" : "No"}</p>

                                <button
                                    style={buttonStyle}
                                    onClick={() => handleToggleSongFeatured(song)}
                                >
                                    {song.isFeatured ? "Remove from Featured" : "Add to Featured"}
                                </button>

                                <button
                                    style={dangerButtonStyle}
                                    onClick={() => handleDelete("songs", song._id)}
                                >
                                    Delete Song
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>All Albums</h2>
                    <div style={gridStyle}>
                        {albums.map((album) => (
                            <div key={album._id} style={cardStyle}>
                                {album.coverImage && (
                                    <img src={album.coverImage} alt={album.title} style={imageStyle} />
                                )}

                                <h3>{album.title}</h3>
                                <p style={metaTextStyle}><strong>Artist:</strong> {album.artist}</p>
                                <p style={metaTextStyle}><strong>Featured:</strong> {album.isFeatured ? "Yes" : "No"}</p>

                                <button
                                    style={buttonStyle}
                                    onClick={() => handleToggleAlbumFeatured(album)}
                                >
                                    {album.isFeatured ? "Remove from Featured" : "Add to Featured"}
                                </button>

                                <button
                                    style={dangerButtonStyle}
                                    onClick={() => handleDelete("albums", album._id)}
                                >
                                    Delete Album
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>All Playlists</h2>
                    <div style={gridStyle}>
                        {playlists.map((playlist) => (
                            <div key={playlist._id} style={cardStyle}>
                                <h3>{playlist.title}</h3>
                                <p style={metaTextStyle}>Owner: {playlist.owner?.username || "Unknown"}</p>

                                <button
                                    style={dangerButtonStyle}
                                    onClick={() => handleDelete("playlists", playlist._id)}
                                >
                                    Delete Playlist
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={sectionStyle}>
                    <h2 style={subHeaderStyle}>All Reviews</h2>
                    <div style={gridStyle}>
                        {reviews.map((review) => (
                            <div key={review._id} style={cardStyle}>
                                <p style={metaTextStyle}><strong>Song:</strong> {review.song?.title || "Unknown Song"}</p>
                                <p style={metaTextStyle}><strong>User:</strong> {review.user?.username || "Unknown User"}</p>
                                <p style={metaTextStyle}><strong>Rating:</strong> {review.rating}/5</p>
                                <p style={metaTextStyle}><strong>Comment:</strong> {review.comment || "No comment"}</p>

                                <button
                                    style={dangerButtonStyle}
                                    onClick={() => handleDelete("reviews", review._id)}
                                >
                                    Delete Review
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;