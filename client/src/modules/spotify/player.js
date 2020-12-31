import c from '@/config/index.js';
import spotifyAuth from '@/modules/spotify/auth.js';

const defaultHeaders = {
    headers: {
        Authorization: `Bearer ${spotifyAuth.accessToken}`,
    },
};

class SpotifyPlayer {
    constructor() {
        this._reset();
    }

    _reset() {
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
        const scriptExists = document.getElementById(c.SPOTIFY_WEB_PLAYBACK_SDK_SCRIPT_ID);
        if (scriptExists) document.head.removeChild(scriptExists);
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
        player.addListener('initialization_error', ({ message }) => {
            // FIXME: Spotify Web Playback SDK is not supported on any mobile devices
            // Either use links to the spotify App or a Spotify Widget or a device selection and try to play on that device
            console.error('INIT', message);
        });
        player.addListener('authentication_error', async ({ message }) => {
            // If the authentication of the spotify WebPlaybackSDK failed, its probably due to
            // an expired accessToken. In that case, refresh the accessToken provided by spotifyAuth
            // and reset the initialization.
            console.error(message);
            await spotifyAuth.refreshAccessToken();
            this._init();
        });
        player.addListener('account_error', ({ message }) => { console.error('ACC', message); });
        player.addListener('playback_error', ({ message }) => { console.error('PLAYB', message); });

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
        return fetch(`${c.SPOTIFY_API_URL}/player/currently-playing`, { ...defaultHeaders })
            .then((response) => response.json())
            .then(async (data) => {
                this.currentTrack = data;
                // Check if the currentTrack is already saved to users library.
                const isSaved = await this.isCurrentTrackSaved();
                // Save that info to the currentTrack Object
                this.currentTrack.isSaved = isSaved;
                return this.currentTrack;
            })
            .catch((error) => console.error(error));
    }

    isCurrentTrackSaved() {
        return fetch(`${c.SPOTIFY_API_URL}/tracks/contains?ids=${this.currentTrack.item.id}`, { ...defaultHeaders })
            .then((response) => response.json())
            .then((data) => data[0])
            .catch((error) => console.error(error));
    }

    saveTracks(ids) {
        return fetch(`${c.SPOTIFY_API_URL}/tracks?ids=${ids}`, {
            method: 'PUT',
            ...defaultHeaders,
        })
            .then(async (response) => {
                if (response.ok) {
                    // Updated saved state for currentTrack
                    const isSaved = await this.isCurrentTrackSaved();
                    this.currentTrack.isSaved = isSaved;
                    // Return save state
                    return this.currentTrack.isSaved;
                } else {
                    console.error('Saving this track caused an error', response);
                }
            })
            .catch((error) => console.error(error));
    }

    removeSavedTracks(ids) {
        return fetch(`${c.SPOTIFY_API_URL}/tracks?ids=${ids}`, {
            method: 'DELETE',
            ...defaultHeaders,
        })
            .then(async (response) => {
                if (response.ok) {
                    // Updated saved state for currentTrack
                    const isSaved = await this.isCurrentTrackSaved();
                    this.currentTrack.isSaved = isSaved;
                    // Return save state
                    return this.currentTrack.isSaved;
                } else {
                    console.error('Removing this track from Spotify library caused an error', response);
                }
            })
            .catch((error) => console.error(error));
    }

    play() {
        return fetch(`${c.SPOTIFY_API_URL}/player/play`, {
            method: 'PUT',
            ...defaultHeaders,
        })
            .catch((error) => console.error(error));
    }

    pause() {
        return fetch(`${c.SPOTIFY_API_URL}/player/pause`, {
            method: 'PUT',
            ...defaultHeaders,
        })
            .catch((error) => console.error(error));
    }

    skipPrevious() {
        return fetch(`${c.SPOTIFY_API_URL}/player/previous?device_id=${this.deviceId}`, {
            method: 'POST',
            ...defaultHeaders,
        })
            .then((response) => {
                // FIXME: Not doing anything because there currently is no previous/next track
                console.log(response);
                return response;
            })
            .catch((error) => console.error(error));
    }

    skipNext() {
        return fetch(`${c.SPOTIFY_API_URL}/player/next?device_id=${this.deviceId}`, {
            method: 'POST',
            ...defaultHeaders,
        })
            .then((response) => {
                console.log(response);
                return response;
            })
            .catch((error) => console.error(error));
    }
}

export default new SpotifyPlayer();