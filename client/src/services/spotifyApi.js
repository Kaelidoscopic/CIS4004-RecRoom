import api from "./api";

export async function searchSpotifyTracks(query) 
{
    const response = await api.get(`/spotify/search?q=${encodeURIComponent(query)}`);
    return response.data;
}

export async function saveSpotifyTrack(track) 
{
    const response = await api.post("/songs", 
    {
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        coverImage: track.coverImage,
        spotifyTrackId: track.spotifyTrackId,
        spotifyUrl: track.spotifyUrl
    });

    return response.data;
}