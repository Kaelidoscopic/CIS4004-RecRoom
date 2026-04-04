import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BrowsePage from "./pages/BrowsePage";
import AdminDashboard from "./pages/AdminDashboard";
import MyPlaylistsPage from "./pages/MyPlaylistsPage";
import ReviewsPage from "./pages/ReviewsPage";
import SpotifyPage from "./pages/SpotifyPage";
import SpotifyCallbackPage from "./pages/SpotifyCallbackPage";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import SongDetailPage from "./pages/SongDetailPage";
import SpotifyTrackDetailPage from "./pages/SpotifyTrackDetailPage";
import SpotifyAlbumDetailPage from "./pages/SpotifyAlbumDetailPage";
import LibraryPage from "./pages/LibraryPage";
import AlbumDetailPage from "./pages/AlbumDetailPage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={user ? "/browse" : "/login"} replace />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <BrowsePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <MyPlaylistsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/spotify"
          element={
            <ProtectedRoute>
              <SpotifyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spotify/callback"
          element={
            <ProtectedRoute>
              <SpotifyCallbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute role="admin">
                <AdminDashboard  />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/songs/:id"
          element={
            <ProtectedRoute>
              <SongDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spotify/track/:id"
          element={
            <ProtectedRoute>
              <SpotifyTrackDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/spotify/album/:id"
          element={
            <ProtectedRoute>
              <SpotifyAlbumDetailPage />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/library" 
          element={
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/reviews" 
          element={
            <ProtectedRoute>
              <ReviewsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route
          path="/albums/:id"
          element={
            <ProtectedRoute>
              <AlbumDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/playlists/:id"
          element={
            <ProtectedRoute>
              <PlaylistDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

function App() 
{
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;