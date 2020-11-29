import request from 'request';

import { SPOTIFY_LOGIN_STATE_KEY, REDIRECT_URI, CLIENT_ID, CLIENT_SECRET } from '../config.js';

export const callbackController = (req, res) => {
    // Request refresh access tokens after checking the state parameter
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[SPOTIFY_LOGIN_STATE_KEY] : null;

    if (state === null || state !== storedState) {
        res.cookie('SPOTIFY_AUTH_ERROR', 'state mismatch');
        res.redirect('/');
    } else {
        res.clearCookie(SPOTIFY_LOGIN_STATE_KEY);
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            },
            headers: {
                Authorization: `Basic ${Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')}`,
            },
            json: true,
        };

        request.post(authOptions, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const accessToken = body.access_token;
                const refreshToken = body.refresh_token;
                const options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { Authorization: `Bearer ${accessToken}` },
                    json: true,
                };
                // Pass the token to the browser to make requests from there
                res.cookie('SPOTIFY_ACCESS_TOKEN', accessToken);
                res.cookie('SPOTIFY_REFRESH_TOKEN', refreshToken);
                res.redirect('/');
            } else {
                res.cookie('SPOTIFY_AUTH_ERROR', 'invalid token');
                res.redirect('/');
            }
        });
    }
};