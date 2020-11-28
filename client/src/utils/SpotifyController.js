import { getHashParams } from './utility.js';
import c from '../config/config.js';

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
        // Get hash params
        const params = getHashParams();
        this.accessToken = params.accessToken;
        this.refreshToken = params.refreshToken;
        this.error = params.error;

        if (this.error) {
            console.error(error);
            return false;
        }

        if (this.accessToken) {
            this.loggedIn = true;
            console.info('Successfully authenticated with Spotify.');
            // Fetch user data
            await this.getUserData();
            this.setGreeting();
            // Only create eventlistener if accessToken is set
            c.refreshTokenDOM.addEventListener('click', (e) => this.refreshAccessToken(e))
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
        return fetch(`refresh_token?refreshToken=${this.refreshToken}`)
            .then((response) => response.json())
            .then((data) => {
                this.accessToken = data.accessToken;
                console.info('Updated AccessToken: \n', this.accessToken);
            })
            .catch((error) => console.error(error));
    }

    setGreeting() {
        c.greetingDOM.innerHTML = `Hey ${this.user.display_name}.`;
    }
}

export const spotifyController = new SpotifyController();
