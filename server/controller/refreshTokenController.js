import request from 'request';

import { CLIENT_ID, CLIENT_SECRET } from '../config.js';

export const refreshTokenController = (req, res) => {
    // Requesting new access token from refresh token
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
}