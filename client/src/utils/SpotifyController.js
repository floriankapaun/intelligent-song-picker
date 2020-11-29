import c from '../config/config.js';
import { getCookie } from './utility.js';

class SpotifyController {
    constructor() {
        this.accessToken = undefined;
        this.refreshToken = undefined;
        this.error = undefined;
        this.user = undefined;
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
            // Fetch user data
            await this.getUserData();
        } else {
            this.loggedIn = false;
            console.warn('AccessToken undefined. User must be logged out.')
        }
    }

    async getUserData() {
        return fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.user = data;
            })
            .catch((error) => console.error(error));
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

export const spotifyController = new SpotifyController();
