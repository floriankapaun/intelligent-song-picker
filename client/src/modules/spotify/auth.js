import c from '@/config/index.js';
import { getCookie, setCookie } from '@/utils/index.js';

class SpotifyAuth {
    constructor() {
        this.accessToken = undefined;
        this.refreshToken = undefined;
        this.error = undefined;
        this.loggedIn = false;
        this._init();
    }

    _init() {
        // Get cookies
        this.accessToken = getCookie(c.COOKIE_NAME_SPOTIFY_ACCESS_TOKEN);
        this.refreshToken = getCookie(c.COOKIE_NAME_SPOTIFY_REFRESH_TOKEN);
        this.error = getCookie(c.COOKIE_NAME_SPOTIFY_AUTH_ERROR);

        if (this.error) {
            console.error(error);
            return false;
        }

        if (this.accessToken) {
            this.loggedIn = true;
            console.info('Successfully authenticated with Spotify.');
        } else {
            this.loggedIn = false;
            console.warn('Spotify AccessToken undefined. User seems to be logged out.')
        }
    }

    refreshAccessToken() {
        return fetch(`${c.API_URL}refresh_token?refreshToken=${this.refreshToken}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.accessToken) {
                    this.accessToken = data.accessToken;
                    setCookie(c.COOKIE_NAME_SPOTIFY_ACCESS_TOKEN, this.accessToken);
                    console.info('Successfully updated Spotify AccessToken.', this.refreshToken);
                    return this.accessToken;
                } else if (data.error) {
                    throw('Received an error while trying to refresh access token: ', data.error);
                } else if (data.errorMessage) {
                    throw('Refreshing access token did not work: ', data.errorMessage, data.statusCode, data.statusMessage, data.body);
                }
            })
            .catch((error) => console.error(error));
    }
}

export default new SpotifyAuth();
