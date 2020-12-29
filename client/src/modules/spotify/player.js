import c from '@/config/index.js';
import spotifyAuth from '@/modules/spotify/auth.js';

class SpotifyPlayer {
    constructor() {
        this.player = undefined;
        this.deviceId = undefined;
        this.state = {
            sdkLoaded: false,
            player: false,
            connection: undefined,
            playback: undefined,
        }
        this.currentTrack = undefined;
        this._init();
    }

    _init() {
        // Import Spotify Web Playback SDK via external script - there is no other way
        const spotifyScript = document.createElement('script');
        spotifyScript.id = c.SPOTIFY_WEB_PLAYBACK_SDK_SCRIPT_ID;
        spotifyScript.src = 'https://sdk.scdn.co/spotify-player.js';
        document.head.appendChild(spotifyScript);
        // Create player instace after script is ready
        window.onSpotifyWebPlaybackSDKReady = () => {
            this.state.sdkLoaded = true;
            this.player = new Spotify.Player({
                name: c.APP_NAME,
                getOAuthToken: (cb) => { cb(spotifyAuth.accessToken); },
            });
            // Add listeners for spotify player events
            this.addEventListeners(this.player);
            // Connect to the player!
            this.state.connection = this.player.connect();
        }
    }

    addEventListeners(player) {
        // TODO: Add functionality to those (error) listeners

        // Error handling
        player.addListener('initialization_error', ({ message }) => { console.error(message); });
        player.addListener('authentication_error', ({ message }) => { console.error(message); });
        player.addListener('account_error', ({ message }) => { console.error(message); });
        player.addListener('playback_error', ({ message }) => { console.error(message); });

        // Playback status updates
        // player.addListener('player_state_changed', state => this.state.playback = state);

        // Player ready
        player.addListener('ready', ({ device_id }) => {
            this.state.player = true;
            this.deviceId = device_id;
        });

        // Player not ready
        player.addListener('not_ready', ({ device_id }) => {
            this.state.player = false;
            this.deviceId = device_id;
        });
    }

    isReady() {
        const state = this.state.player && this.state.connection;
        return state ? true : false;
    }

    playTrack(uri) {
        return fetch(`${c.SPOTIFY_API_URL}/player/play?device_id=${this.deviceId}`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [uri] }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${spotifyAuth.accessToken}`,
            },
        })
            .catch((error) => console.error(error));
    }

    getCurrentTrack() {
        return fetch(`${c.SPOTIFY_API_URL}/player/currently-playing`, {
            headers: {
                'Authorization': `Bearer ${spotifyAuth.accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((data) => this.currentTrack = data)
            .catch((error) => console.error(error));
    }

    play() {
        return fetch(`${c.SPOTIFY_API_URL}/player/play`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${spotifyAuth.accessToken}`,
            }
        })
            .catch((error) => console.error(error));
    }

    pause() {
        return fetch(`${c.SPOTIFY_API_URL}/player/pause`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${spotifyAuth.accessToken}`,
            }
        })
            .catch((error) => console.error(error));
    }
}

export default new SpotifyPlayer();