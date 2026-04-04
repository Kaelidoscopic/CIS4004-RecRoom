import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const saveSpotifyTrack = async (trackData) => {
  const response = await api.post("/songs/import-spotify", trackData);
  return response.data;
};

export const saveSongToLibrary = async (songId) => {
  const response = await api.post("/library/save", { songId });
  return response.data;
};

export const getLibrarySongs = async () => {
  const response = await api.get("/library");
  return response.data;
};

export const removeSongFromLibrary = async (songId) => {
  const response = await api.delete(`/library/${songId}`);
  return response.data;
};

export default api;