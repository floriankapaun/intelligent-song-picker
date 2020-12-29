<template>
    <article v-if="recommendedTrack" id="spotify-player" class="p4">
        <section v-if="spotify.player.currentTrack && spotify.player.currentTrack.item">
            <h2>{{ getTrackName }}</h2>
            <h3>{{ getArtistsNames }}</h3>
            <div class="progress-bar" :style="{ '--progress': getCurrentPlayingProgress }"></div>
        </section>
        <section class="flex flex-row justify-between">
            <button class="btn btn-icon-only p0" type="button" @click="$emit('deleteSelfie')">
                <span class="icon" v-html="icons.photo"></span>
                <span class="sr-only"> Take a new Selfie</span>
            </button>
            <div class="flex flex-row">
                <button class="btn btn-icon-only p2" type="button" :disabled="isPlayerReady">
                    <span class="icon" v-html="icons.skipPrevious"></span>
                    <span class="sr-only"> Skip to previous track</span>
                </button>
                <button class="btn btn-icon-only p2" type="button" :disabled="isPlayerReady" @click="onPlayPause">
                    <span class="icon" v-html="isPlaying ? icons.pause : icons.play"></span>
                    <span class="sr-only"> Play/Pause track</span>
                </button>
                <button class="btn btn-icon-only p2" type="button" :disabled="isPlayerReady">
                    <span class="icon" v-html="icons.skipNext"></span>
                    <span class="sr-only"> Skip to next track</span>
                </button>
            </div>
            <button class="btn btn-icon-only p0" type="button" :disabled="!recommendedTrack">
                <span class="icon" v-html="icons.favorite"></span>
                <span class="sr-only"> Mark track as favorite</span>
            </button>
        </section>
    </article>
</template>

<script>
import c from '@/config/config.js';

export default {
    props: {
        recommendedTrack: Object, 
        spotify: Object,
    },
    data() {
        return {
            playbackState: undefined,
            icons: {
                photo: require('@/assets/img/icons/photo_camera-24px.svg').default,
                skipPrevious: require('@/assets/img/icons/skip_previous-24px.svg').default,
                play: require('@/assets/img/icons/play_arrow-24px.svg').default,
                pause: require('@/assets/img/icons/pause-24px.svg').default,
                skipNext: require('@/assets/img/icons/skip_next-24px.svg').default,
                favorite: require('@/assets/img/icons/favorite-24px.svg').default,
            }
        };
    },
    methods: {
        async playTrack(track) {
            if (track.uri && this.player && this.player.isReady()) {
                const response = await this.player.playTrack(track.uri);
                // If playing the track was successfull, fetch the currently
                // playing track data from spotify.
                if (response.status === 204) {
                    this.player.getCurrentTrack();
                // TODO: Error handling
                }
            } else {
                // TODO: Put Track in queue until player is ready and play afterwards
            }
        },
        updatePlayerProgress() {
            if (this.player && this.currentTrack && this.isPlaying) {
                this.currentTrack.progress_ms += 1000;
                setTimeout(() => { this.updatePlayerProgress(); }, 1000);
            }
        },
        onPlayPause() {
            if (!this.player) return;
            this.isPlaying ? this.player.pause() : this.player.play();
        },
    },
    computed: {
        player() {
            return this.spotify && this.spotify.player ? this.spotify.player : undefined;
        },
        currentTrack() {
            return this.player && this.player.currentTrack
                ? this.player.currentTrack
                : undefined;
        },
        isPlaying() {
            return this.spotify && this.spotify.player && this.spotify.player.state.playback && !this.spotify.player.state.playback.paused
                ? !this.spotify.player.state.playback.paused
                : false;
        },
        isPlayerReady() {
            this.player && this.player.state.connection && this.player.state.player ? true : false;
        },
        getTrackName() {
            if (this.currentTrack && this.currentTrack.item && this.currentTrack.item.name) {
                return this.currentTrack.item.name;
            } else {
                return null;
            }
        },
        getArtistsNames() {
            if (this.currentTrack && this.currentTrack.item && this.currentTrack.item.artists) {
                let artistsNames = '';
                for (const artist of this.currentTrack.item.artists) {
                    artistsNames += `${artist.name}, `;
                }
                // Remove the last ', '
                return artistsNames.slice(0, -2);
            } else {
                return null;
            }
        },
        getCurrentPlayingProgress() {
            if (this.currentTrack && "progress_ms" in this.currentTrack && this.currentTrack.item) {
                const duration_ms = this.currentTrack.item.duration_ms;
                const progress_ms = this.currentTrack.progress_ms;
                return `${(progress_ms / duration_ms) * 100}%`;
            } else {
                return null;
            }
        },
    },
    watch: {
        recommendedTrack() {
            this.playTrack(this.recommendedTrack);
        },
        playbackState() {
            if (this.isPlaying) this.updatePlayerProgress();
        },
    },
    mounted() {
        // Add listener for changes of the spotify players playbackState
        // TODO: Wait for player.player to exist
        // FIXME: Move that stuff into spotifyPlayer.js
        this.spotify.player.player.addListener('player_state_changed', (state) => {
            this.playbackState = state;
            this.spotify.player.state.playback = state;
        });
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