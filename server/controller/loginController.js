import querystring from 'querystring';

import { SPOTIFY_LOGIN_STATE_KEY, SPOTIFY_AUTH_SCOPE, CLIENT_ID, REDIRECT_URI } from '../config.js';
import generateRandomString from '../utils/generateRandomString.js';

export const loginController = (req, res) => {
    const state = generateRandomString(16);
    res.cookie(SPOTIFY_LOGIN_STATE_KEY, state);
    // Request authorization
    res.redirect('https://accounts.spotify.com/authorize?' + 
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: SPOTIFY_AUTH_SCOPE,
            redirect_uri: REDIRECT_URI,
            state: state,
        }));
}
