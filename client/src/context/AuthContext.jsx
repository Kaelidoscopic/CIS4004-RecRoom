import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (!token) 
            {
                setLoading(false);
                return;
            }

            try 
            {
                const response = await api.get("/auth/me", {
                    headers: 
                    {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUser(response.data);
            } 
            catch (error) 
            {
                localStorage.removeItem("token");
                setToken("");
                setUser(null);
            } 
            finally 
            {
                setLoading(false);
            }
        };

        loadUser();
    }, [token]);

    const login = async (username, password) => {
        const response = await api.post("/auth/login", { username, password });
        const newToken = response.data.token;

        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser({
            _id: response.data._id,
            username: response.data.username,
            role: response.data.role,
            spotifyId: response.data.spotifyId || "",
            spotifyDisplayName: response.data.spotifyDisplayName || "",
            spotifyEmail: response.data.spotifyEmail || "",
            spotifyUrl: response.data.spotifyUrl || "",
            spotifyImage: response.data.spotifyImage || ""
        });
    };

    const register = async (username, password) => {
        const response = await api.post("/auth/register", { username, password });
        const newToken = response.data.token;

        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser({
            _id: response.data._id,
            username: response.data.username,
            role: response.data.role,
            spotifyId: response.data.spotifyId || "",
            spotifyDisplayName: response.data.spotifyDisplayName || "",
            spotifyEmail: response.data.spotifyEmail || "",
            spotifyUrl: response.data.spotifyUrl || "",
            spotifyImage: response.data.spotifyImage || ""
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);