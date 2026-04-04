import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { fetchSpotifyProfile, getAccessToken } from "../services/spotify";
import {
    authWrapStyle,
    authCardStyle,
    sectionHeaderStyle,
    messageStyle
} from "../styles/ui";

const SpotifyCallbackPage = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState("Connecting your Spotify account...");

    useEffect(() => {
        const connectSpotify = async () => {
            try
            {
                const params = new URLSearchParams(window.location.search);
                const code = params.get("code");

                if (!code)
                {
                    setMessage("No Spotify code found.");
                    return;
                }

                const accessToken = await getAccessToken(code);
                const profile = await fetchSpotifyProfile(accessToken);

                await api.post("/auth/link-spotify", {
                    spotifyId: profile.id || "",
                    spotifyDisplayName: profile.display_name || "",
                    spotifyEmail: profile.email || "",
                    spotifyUrl: profile.external_urls?.spotify || "",
                    spotifyImage: profile.images?.[0]?.url || ""
                });

                localStorage.removeItem("spotify_verifier");
                setMessage("Spotify connected successfully. Redirecting...");

                setTimeout(() => {
                    navigate("/spotify");
                }, 1200);
            }
            catch (error)
            {
                console.error(error);
                setMessage(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to connect Spotify"
                );
            }
        };

        connectSpotify();
    }, [navigate]);

    return (
        <div style={authWrapStyle}>
            <div style={authCardStyle}>
                <h1 style={sectionHeaderStyle}>Spotify Callback</h1>
                <div style={messageStyle}>{message}</div>
            </div>
        </div>
    );
};

export default SpotifyCallbackPage;