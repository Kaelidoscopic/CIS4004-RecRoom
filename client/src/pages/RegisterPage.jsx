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

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");

        try
        {
            await register(username, password);
            navigate("/browse");
        }
        catch (err)
        {
            setMessage(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div style={authWrapStyle}>
            <div style={authCardStyle}>
                <h1 style={sectionHeaderStyle}>Register</h1>

                {message && <div style={messageStyle}>{message}</div>}

                <form onSubmit={handleRegister}>
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

                    <button type="submit" style={buttonStyle}>Register</button>
                </form>

                <p style={{ marginTop: "1rem" }}>
                    Already have an account?{" "}
                    <Link to="/login" style={linkResetStyle}>
                        <span style={{ color: "#9ecbff" }}>Login</span>
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;