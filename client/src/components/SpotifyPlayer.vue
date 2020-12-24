<template>
    <div>PLAYER</div>
</template>

<script>
import c from '@/config/config.js';
import { spotifyController } from '@/utils/SpotifyController.js';

export default {
    data() {
        return {
            player: undefined,
            playerState: undefined,
            playerConnected: undefined,
            playerReady: undefined,
            deviceId: undefined,
        };
    },
    methods: {
        onSpotifyWebPlaybackSDKReady() {
            const player = new Spotify.Player({
                name: c.APP_NAME,
                getOAuthToken: cb => { cb(spotifyController.accessToken); },
            });
            this.player = player;

            // TODO: Add functionality to those (error) listeners

            // Error handling
            player.addListener('initialization_error', ({ message }) => { console.error(message); });
            player.addListener('authentication_error', ({ message }) => { console.error(message); });
            player.addListener('account_error', ({ message }) => { console.error(message); });
            player.addListener('playback_error', ({ message }) => { console.error(message); });

            // Playback status updates
            player.addListener('player_state_changed', state => this.playerState = state);

            // Ready
            player.addListener('ready', ({ device_id }) => {
                this.playerReady = true;
                this.deviceId = device_id;
            });

            // Not Ready
            player.addListener('not_ready', ({ device_id }) => {
                this.playerReady = false;
                this.deviceId = device_id;
            });
            // Connect to the player!
            this.playerConnected = player.connect();
        },
        playTrack({
            spotifyURI,
            playerInstance: {
                _options: {
                    getOAuthToken,
                    id,
                },
            },
        }) {
            getOAuthToken(access_token => {
                fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ uris: [spotifyURI] }),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${access_token}`,
                    },
                });
            });
        },
        play(track) {
            if (this.playerConnected && this.playerReady) {
                this.playTrack({
                    playerInstance: this.player,
                    spotifyURI: track.uri,
                });
            } else {
                // TODO: Put Track in queue until player is ready and play afterwards
            }
        },
    },
    mounted() {
        // Import Spotify Web Playback SDK - must be loaded from spotify source
        const spotifyWebPlaybackSDK = document.createElement('script');
        spotifyWebPlaybackSDK.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js');
        document.head.appendChild(spotifyWebPlaybackSDK);

        window.onSpotifyWebPlaybackSDKReady = this.onSpotifyWebPlaybackSDKReady;
    },
}
</script>