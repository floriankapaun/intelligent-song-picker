import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT;
export const API_ROUTE = process.env.API_ROUTE;
export const REDIRECT_URI = process.env.PRODUCTION
    ? `https://intelligent-song-picker.com${API_ROUTE}/callback`
    : `http://localhost:${PORT}${API_ROUTE}/callback`;
export const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
export const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
export const SPOTIFY_LOGIN_STATE_KEY = process.env.SPOTIFY_LOGIN_STATE_KEY;
export const SPOTIFY_AUTH_SCOPE = process.env.SPOTIFY_AUTH_SCOPE;
export const CLIENT_DIR = process.env.CLIENT_DIR;