import c from '@/config/index.js';
import { getCookie } from '@/utils/index.js';

class SpotifyAuth {
    constructor() {
        this.accessToken = undefined;
        this.refreshToken = undefined;
        this.error = undefined;
        this.loggedIn = false;
        this._init();
    }

    async _init() {
        // Get cookies
        this.accessToken = getCookie('SPOTIFY_ACCESS_TOKEN');
        this.refreshToken = getCookie('SPOTIFY_REFRESH_TOKEN');
        this.error = getCookie('SPOTIFY_AUTH_ERROR');

        if (this.error) {
            console.error(error);
            return false;
        }

        if (this.accessToken) {
            this.loggedIn = true;
            console.info('Successfully authenticated with Spotify.');
        } else {
            this.loggedIn = false;
            console.warn('AccessToken undefined. User must be logged out.')
        }
    }

    async refreshAccessToken() {
        return fetch(`${c.API_URL}refresh_token?refreshToken=${this.refreshToken}`)
            .then((response) => response.json())
            .then((data) => {
                this.accessToken = data.accessToken;
                console.info('Updated AccessToken: \n', this.accessToken);
            })
            .catch((error) => console.error(error));
    }
}

export default new SpotifyAuth();