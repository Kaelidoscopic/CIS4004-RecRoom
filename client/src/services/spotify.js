const clientId = "ae5e9efcba7e46279e23d32b160e2242";
const redirectUri = "http://127.0.0.1:5173/spotify/callback";
export async function redirectToAuthCodeFlow() 
{
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("spotify_verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri);
    params.append("scope", "user-read-private user-read-email");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(code) 
{
    const verifier = localStorage.getItem("spotify_verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", 
    {
        method: "POST",
        headers: {
        "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    });

    const data = await result.json();

    if (!result.ok) 
    {
        throw new Error(data.error_description || "Failed to get Spotify access token");
    }

    return data.access_token;
}

export async function fetchSpotifyProfile(token) 
{
    const result = await fetch("https://api.spotify.com/v1/me", {
        headers: {
        Authorization: `Bearer ${token}`
        }
    });

    const data = await result.json();

    if (!result.ok) 
    {
        throw new Error(data.error?.message || "Failed to fetch Spotify profile");
    }

    return data;
}

function generateCodeVerifier(length) 
{
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) 
    {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

async function generateCodeChallenge(codeVerifier) 
{
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}