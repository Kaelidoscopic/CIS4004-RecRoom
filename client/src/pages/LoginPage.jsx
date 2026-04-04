import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    authWrapStyle,
    authCardStyle,
    sectionHeaderStyle,
    messageStyle,
    inputStyle,
    buttonStyle,
    linkResetStyle
} from "../styles/ui";

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");

        try
        {
            await login(username, password);
            navigate("/browse");
        }
        catch (err)
        {
            setMessage(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div style={authWrapStyle}>
            <div style={authCardStyle}>
                <h1 style={sectionHeaderStyle}>Login</h1>

                {message && <div style={messageStyle}>{message}</div>}

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                    />

                    <button type="submit" style={buttonStyle}>Login</button>
                </form>

                <p style={{ marginTop: "1rem" }}>
                    Don&apos;t have an account?{" "}
                    <Link to="/register" style={linkResetStyle}>
                        <span style={{ color: "#9ecbff" }}>Register</span>
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;