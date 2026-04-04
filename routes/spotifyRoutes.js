import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

let spotifyAccessToken = "";
let spotifyTokenExpiresAt = 0;

console.log("SPOTIFY ROUTES FILE LOADED");
async function spotifyFetch(url, options = {}, retryCount = 1) 
{
    console.log("spotifyFetch START:", url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try 
    {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        console.log("spotifyFetch RESPONSE STATUS:", response.status, url);

        const text = await response.text();
        console.log("spotifyFetch RAW TEXT PREVIEW:", text.slice(0, 300));

        let data;
        try 
        {
            data = JSON.parse(text);
        } 
        catch 
        {
            data = { message: text };
        }

       if (response.status === 429) 
        {
            const retryAfter = Number(response.headers.get("retry-after") || 1);

            console.log("spotifyFetch RATE LIMITED:", retryAfter, "seconds");

            throw new Error(
                `Spotify rate limited this request. Retry after ${retryAfter} seconds.`
            );
        }

        if (!response.ok) 
        {
            throw new Error(
                data?.error?.message ||
                data?.error_description ||
                data?.message ||
                "Spotify request failed"
            );
        }

        return data;
    } 
    catch (error) 
    {
        console.error("spotifyFetch ERROR:", error.name, error.message, url);
        throw error;
    } 
    finally 
    {
        clearTimeout(timeout);
    }
}

async function getSpotifyAccessToken() 
{
    if (spotifyAccessToken && Date.now() < spotifyTokenExpiresAt) 
    {
        return spotifyAccessToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const data = await spotifyFetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "client_credentials"
        })
    });

    spotifyAccessToken = data.access_token;
    spotifyTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    console.log("Spotify token acquired");
    return spotifyAccessToken;
}

async function spotifySearch(query, type = "track", limit = 8, offset = 0, market = "US") 
{
    if (!query || !query.trim()) 
    {
        throw new Error("Spotify search query is missing");
    }

    const token = await getSpotifyAccessToken();

    console.log("spotifySearch CALLING SEARCH:", { query, type, limit, offset, market });

    const data = await spotifyFetch(
        `https://api.spotify.com/v1/search?${new URLSearchParams({
            q: query,
            type,
            limit: String(limit),
            offset: String(offset),
            market
        }).toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    console.log("SPOTIFY SEARCH:", { query, type, limit, offset, market });
    console.log("SPOTIFY DATA KEYS:", Object.keys(data || {}));
    console.log("TRACK ITEMS:", data?.tracks?.items?.length || 0);
    console.log("ALBUM ITEMS:", data?.albums?.items?.length || 0);

    if (type === "track") 
    {
        return (data.tracks?.items || []).map((track) => ({
            spotifyId: track.id,
            type: "track",
            title: track.name,
            subtitle: track.artists?.map((artist) => artist.name).join(", ") || "",
            album: track.album?.name || "",
            image: track.album?.images?.[0]?.url || "",
            spotifyUrl: track.external_urls?.spotify || "",
            duration: track.duration_ms || 0
        }));
    }

    if (type === "album") 
    {
        return (data.albums?.items || []).map((album) => ({
            spotifyId: album.id,
            type: "album",
            title: album.name,
            subtitle: album.artists?.map((artist) => artist.name).join(", ") || "",
            image: album.images?.[0]?.url || "",
            spotifyUrl: album.external_urls?.spotify || "",
            totalTracks: album.total_tracks || 0,
            albumType: album.album_type || ""
        }));
    }

    return [];
}

async function getSpotifyTrackById(trackId) 
{
    const token = await getSpotifyAccessToken();

    const data = await spotifyFetch(
        `https://api.spotify.com/v1/tracks/${trackId}?${new URLSearchParams({ market: "US" }).toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return {
        spotifyId: data.id,
        type: "track",
        title: data.name,
        subtitle: data.artists?.map((artist) => artist.name).join(", ") || "",
        album: data.album?.name || "",
        image: data.album?.images?.[0]?.url || "",
        spotifyUrl: data.external_urls?.spotify || "",
        duration: data.duration_ms || 0
    };
}

async function getSpotifyAlbumById(albumId) 
{
    const token = await getSpotifyAccessToken();

    const data = await spotifyFetch(
        `https://api.spotify.com/v1/albums/${albumId}?${new URLSearchParams({ market: "US" }).toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return {
        spotifyId: data.id,
        type: "album",
        title: data.name,
        subtitle: data.artists?.map((artist) => artist.name).join(", ") || "",
        image: data.images?.[0]?.url || "",
        spotifyUrl: data.external_urls?.spotify || "",
        totalTracks: data.total_tracks || 0,
        tracks: (data.tracks?.items || []).map((track) => ({
            spotifyId: track.id,
            title: track.name,
            duration: track.duration_ms || 0,
            trackNumber: track.track_number || 0
        }))
    };
}

function shuffleArray(array) 
{
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) 
    {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function uniqueBySpotifyId(items) 
{
    const seen = new Set();

    return items.filter((item) => {
        if (seen.has(item.spotifyId)) 
        {
            return false;
        }

        seen.add(item.spotifyId);
        return true;
    });
}

function getSuccessfulResults(results) 
{
    return results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)
        .flat();
}

async function getMixedFeaturedTracks() 
{
    const results = await spotifySearch("The Weeknd", "track", 5, 0, "US");
    console.log("TRACK RESULTS LENGTH:", results.length);
    console.log("FIRST TRACK:", results[0]);
    return results.slice(0, 8);
}

async function getMixedFeaturedAlbums() 
{
    const results = await spotifySearch("Taylor Swift", "album", 5, 0, "US");

    console.log("ALBUM RAW RESULTS LENGTH:", results.length);
    console.log("FIRST ALBUM BEFORE FILTER:", results[0]);

    const filtered = results.filter((album) =>
        album.albumType === "album" && album.totalTracks >= 5
    );

    console.log("ALBUM FILTERED LENGTH:", filtered.length);
    console.log("FIRST FILTERED ALBUM:", filtered[0]);

    return filtered.slice(0, 8);
}

function logSettledResults(label, queries, results) 
{
    results.forEach((result, index) => {
        if (result.status === "rejected") 
        {
            console.error(`${label} failed for query "${queries[index]}":`, result.reason.message);
        } 
        else 
        {
            console.log(`${label} success for query "${queries[index]}":`, result.value.length);
        }
    });
}

router.get("/browse-home", protect, async (req, res) => {
    res.json({
        featuredTracks: [],
        popularAlbums: []
    });
});

router.get("/search", protect, async (req, res) => {
    try 
    {
        const query = req.query.q;
        const type = req.query.type || "track";

        if (!query) 
        {
            return res.status(400).json({ message: "Search query is required" });
        }

        const results = await spotifySearch(query, type, 10, 0, "US");
        res.json(results);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.get("/track/:id", protect, async (req, res) => {
    try 
    {
        const track = await getSpotifyTrackById(req.params.id);
        res.json(track);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

router.get("/album/:id", protect, async (req, res) => {
    try 
    {
        const album = await getSpotifyAlbumById(req.params.id);
        res.json(album);
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
});

export default router;