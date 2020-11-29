require('dotenv').config();

import express from 'express';
import request from 'request';
import cors from 'cors';
import history from 'connect-history-api-fallback';
import querystring from 'querystring';
import cookieParser from 'cookie-parser';
import generateRandomString from './utils/generateRandomString.js';

const PORT = 3007;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const STATE_KEY = 'spotify_auth_state';

const app = express();

app.use(history())
    .use(express.static('../client/dist/'))
    .use(cors())
    .use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    res.cookie(STATE_KEY, state);
    // Request authorization
    const scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' + 
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            state: state,
        }));
});

app.get('/callback', (req, res) => {
    // Request refresh access tokens after checking the state parameter
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[STATE_KEY] : null;

    if (state === null || state !== storedState) {
        res.cookie('SPOTIFY_AUTH_ERROR', 'state mismatch');
        res.redirect('/');
    } else {
        res.clearCookie(STATE_KEY);
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
});

app.get('/refresh_token', (req, res) => {
    // Requesting access token from refresh token
    const refreshToken = req.query.refreshToken;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 
            Authorization: `Basic ${Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')}`,
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        },
        json: true,
    };

    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const accessToken = body.access_token;
            res.send({
                accessToken: accessToken,
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
})