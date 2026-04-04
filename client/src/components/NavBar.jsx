import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navStyle = {
    background: "linear-gradient(90deg, #11161f 0%, #0f1724 100%)",
    borderBottom: "1px solid #2b3445",
    padding: "0.9rem 2rem",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(8px)"
};

const navInnerStyle = {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    flexWrap: "wrap",
    color: "#f5f7fa"
};

const navLinksWrapStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1.1rem",
    flexWrap: "wrap"
};

const navRightStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
    flexWrap: "wrap"
};

const navLinkStyle = {
    color: "#c7d0dd",
    textDecoration: "none",
    fontWeight: "600",
    padding: "0.45rem 0.1rem",
    borderBottom: "2px solid transparent",
    transition: "color 0.15s ease, border-color 0.15s ease"
};

const activeNavLinkStyle = {
    ...navLinkStyle,
    color: "#ffffff",
    borderBottom: "2px solid #9ecbff"
};

const usernameStyle = {
    color: "#f5f7fa",
    fontWeight: "500"
};

const logoutButtonStyle = {
    padding: "0.55rem 0.9rem",
    borderRadius: "10px",
    border: "1px solid #3b475c",
    backgroundColor: "#222a36",
    color: "#f5f7fa",
    cursor: "pointer",
    transition: "background-color 0.15s ease, transform 0.1s ease"
};

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const getLinkStyle = (path) =>
        location.pathname.startsWith(path) ? activeNavLinkStyle : navLinkStyle;

    return (
        <nav style={navStyle}>
            <div style={navInnerStyle}>
                <div style={navLinksWrapStyle}>
                    <Link to="/browse" style={getLinkStyle("/browse")}>Browse</Link>
                    <Link to="/library" style={getLinkStyle("/library")}>Library</Link>
                    <Link to="/reviews" style={getLinkStyle("/reviews")}>Reviews</Link>
                    <Link to="/spotify" style={getLinkStyle("/spotify")}>Spotify</Link>

                    {user.role === "admin" && (
                        <Link to="/admin" style={getLinkStyle("/admin")}>Admin</Link>
                    )}
                </div>

                <div style={navRightStyle}>
                    <span style={usernameStyle}>Logged in as: {user.username}</span>
                    <button
                        onClick={logout}
                        style={logoutButtonStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;