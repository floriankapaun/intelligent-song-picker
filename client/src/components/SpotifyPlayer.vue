<template>
    <article id="spotify-player" class="p6">
        <section v-if="this.currentPlaying && this.currentPlaying.item">
            <h2>{{ getTrackName }}</h2>
            <h3>{{ getArtistsNames }}</h3>
            <div class="progress-bar" :style="{ '--progress': getCurrentPlayingProgress }"></div>
        </section>
        <section v-if="this.player && this.playerConnected && this.playerReady" class="flex flex-row justify-between">
            <button type="button" @click="$emit('deleteSelfie')">
                <span class="icon" v-html="icons.photo"></span>
                <span class="sr-only"> Take a new Selfie</span>
            </button>
            <div class="flex flex-row">
                <button type="button">
                    <span class="icon" v-html="icons.skipPrevious"></span>
                    <span class="sr-only"> Skip to previous track</span>
                </button>
                <button type="button" @click="onPlayPause">
                    <span class="icon" v-html="isPlaying ? icons.pause : icons.play"></span>
                    <span class="sr-only"> Play/Pause track</span>
                </button>
                <button type="button">
                    <span class="icon" v-html="icons.skipNext"></span>
                    <span class="sr-only"> Skip to next track</span>
                </button>
            </div>
            <button type="button">
                <span class="icon" v-html="icons.favorite"></span>
                <span class="sr-only"> Mark track as favorite</span>
            </button>
        </section>
    </article>
</template>

<script>
import c from '@/config/config.js';
import { spotifyController } from '@/utils/SpotifyController.js';

export default {
    data() {
        return {
            currentPlaying: undefined,
            player: undefined,
            playerState: undefined,
            playerConnected: undefined,
            playerReady: undefined,
            deviceId: undefined,
            icons: {
                photo: require('@/assets/img/photo_camera-24px.svg').default,
                skipPrevious: require('@/assets/img/skip_previous-24px.svg').default,
                play: require('@/assets/img/play_arrow-24px.svg').default,
                pause: require('@/assets/img/pause-24px.svg').default,
                skipNext: require('@/assets/img/skip_next-24px.svg').default,
                favorite: require('@/assets/img/favorite-24px.svg').default,
            }
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
            getOAuthToken((access_token) => {
                fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ uris: [spotifyURI] }),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${access_token}`,
                    },
                })
                    .then((response) => {
                        if (response.status === 204) {
                            this.getCurrentPlaying();
                        }
                    })
                    .catch((error) => console.error(error));
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
        getCurrentPlaying() {
            fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${spotifyController.accessToken}`,
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    this.currentPlaying = data;
                    this.updateCurrentPlayingProgress();
                })
                .catch((error) => console.error(error));
        },
        updateCurrentPlayingProgress() {
            if (this.isPlaying) {
                this.currentPlaying.progress_ms += 1000;
                setTimeout(() => { this.updateCurrentPlayingProgress(); }, 1000);
            }
        },
        async playerPlay() {
            return fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${spotifyController.accessToken}`,
                }
            })
                .then((response) => console.log(response))
                .catch((error) => console.error(error));
        },
        async playerPause() {
            return fetch('https://api.spotify.com/v1/me/player/pause', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${spotifyController.accessToken}`,
                }
            })
                .then((response) => console.log(response))
                .catch((error) => console.error(error));
        },
        onPlayPause() {
            this.isPlaying
                ? this.playerPause()
                : this.playerPlay();
        },
    },
    computed: {
        isPlaying() {
            if (this.playerState && !this.playerState.paused) return true;
            return false;
        },
        getArtistsNames() {
            if (this.currentPlaying && this.currentPlaying.item && this.currentPlaying.item.artists) {
                let artistsNames = '';
                for (const artist of this.currentPlaying.item.artists) {
                    artistsNames += `${artist.name}, `;
                }
                // Remove the last ', '
                return artistsNames.slice(0, -2);
            } else {
                return null;
            }
        },
        getTrackName() {
            if (this.currentPlaying && this.currentPlaying.item && this.currentPlaying.item.name) {
                return this.currentPlaying.item.name;
            } else {
                return null;
            }
        },
        getCurrentPlayingProgress() {
            if (this.currentPlaying && "progress_ms" in this.currentPlaying && this.currentPlaying.item) {
                const duration_ms = this.currentPlaying.item.duration_ms;
                const progress_ms = this.currentPlaying.progress_ms;
                return `${(progress_ms / duration_ms) * 100}%`;
            } else {
                return null;
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

<style>
#spotify-player {
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
}

.progress-bar {
    --progress: 0%;
    position: relative;
    width: 100%;
    height: 5px;
    background-color: rgba(255, 255, 255, 0.2);
}

.progress-bar:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: var(--progress);
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
}
</style>