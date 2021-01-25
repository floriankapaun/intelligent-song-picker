<template>
    <main v-if="recommendedTrack" id="spotify-player">
        <section id="player-info" v-if="currentTrack && currentTrack.item">
            <div class="w-limited pt4 px4">
                <h2 class="text-m">{{ getTrackName }}</h2>
                <h3 class="text-xs mb4">{{ getArtistsNames }}</h3>
                <div class="progress-bar" :style="{ '--progress': getCurrentPlayingProgress }"></div>
            </div>
        </section>
        <section id="player-controls">
            <div class="w-limited flex flex-row justify-between p4">
                <button class="btn btn-icon-only p0" type="button" @click="onNewSelfie">
                    <span class="icon" v-html="icons.photo"></span>
                    <span class="sr-only"> Take a new Selfie</span>
                </button>
                <div class="flex flex-row">
                    <button class="btn btn-icon-only px2 py0" type="button" :disabled="isPlayerReady" @click="onSkipPrevious">
                        <span class="icon" v-html="icons.skipPrevious"></span>
                        <span class="sr-only"> Skip to previous track</span>
                    </button>
                    <button class="btn btn-icon-only px2 py0" type="button" :disabled="isPlayerReady" @click="onPlayPause">
                        <span class="icon" v-html="isPlaying ? icons.pause : icons.play"></span>
                        <span class="sr-only"> Play/Pause track</span>
                    </button>
                    <button class="btn btn-icon-only px2 py0" type="button" :disabled="isPlayerReady" @click="onSkipNext">
                        <span class="icon" v-html="icons.skipNext"></span>
                        <span class="sr-only"> Skip to next track</span>
                    </button>
                </div>
                <button class="btn btn-icon-only p0" type="button" :disabled="!player || !currentTrack" @click="onSaveTrack">
                    <span class="icon" v-html="isCurrentTrackSaved ? icons.favorite : icons.makeFavorite"></span>
                    <span class="sr-only"> Save track in ‘Your Music’ library</span>
                </button>
            </div>
        </section>
    </main>
</template>

<script>
import c from '@/config/index.js';

export default {
    props: {
        recommendedTrack: Object, 
        spotify: Object,
    },
    data() {
        return {
            progressSimulationStart: undefined,
            progressSimulation: undefined,
            playbackState: undefined,
            icons: {
                photo: require('@/assets/img/icons/photo_camera-24px.svg').default,
                skipPrevious: require('@/assets/img/icons/skip_previous-24px.svg').default,
                play: require('@/assets/img/icons/play_arrow-24px.svg').default,
                pause: require('@/assets/img/icons/pause-24px.svg').default,
                skipNext: require('@/assets/img/icons/skip_next-24px.svg').default,
                favorite: require('@/assets/img/icons/favorite-24px.svg').default,
                makeFavorite: require('@/assets/img/icons/make_favorite-24px.svg').default,
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
                    await this.player.getCurrentTrack();
                // TODO: Error handling
                }
            } else {
                // TODO: Put Track in queue until player is ready and play afterwards
            }
        },
        updatePlayerProgress() {
            if (this.currentTrack && this.isPlaying) {
                const difference = Date.now() - this.progressSimulationStart;
                this.progressSimulationStart = Date.now();
                this.currentTrack.progress_ms += difference;
            } else {
                clearInterval(this.progressSimulation);
            }
        },
        onNewSelfie() {
            // Pause Spotify player
            if (this.player) this.player.pause();
            // Reset progress simulation
            clearInterval(this.progressSimulation);
            // Emit the event
            this.$emit('deleteSelfie');
        },
        onSkipPrevious() {
            if (this.player) this.player.skipPrevious();
        },
        onPlayPause() {
            if (!this.player) return;
            this.isPlaying ? this.player.pause() : this.player.play();
        },
        onSkipNext() {
            if (this.player) this.player.skipNext();
        },
        onSaveTrack() {
            if (this.isCurrentTrackSaved) {
                this.player.removeSavedTracks(this.currentTrack.item.id);
            } else {
                this.player.saveTracks(this.currentTrack.item.id);
            }
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
        isCurrentTrackSaved() {
            return this.currentTrack && this.currentTrack.isSaved
                ? this.currentTrack.isSaved
                : false;
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
            if (this.isPlaying && !this.progressSimulation) {
                this.progressSimulationStart = Date.now();
                this.progressSimulation = setInterval(() => {
                    this.updatePlayerProgress();
                }, 1000);
            }
        },
    },
    mounted() {
        // Add listener for changes of the spotify players playbackState
        if (this.player && this.player.player) {
            this.spotify.player.player.addListener('player_state_changed', (state) => {
                this.playbackState = state;
                this.player.state.playback = state;
            });
        }
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

#player-info {
    position: relative;
    padding-bottom: 0;
}

#player-info:before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 150%;
    background: linear-gradient(var(--paper_transparent), var(--paper_light));
    z-index: -1;
}

.progress-bar {
    --progress: 0%;
    position: relative;
    width: 100%;
    height: 3px;
    background-color: rgba(255, 255, 255, 0.2);
    overflow: hidden;
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

#player-controls {
    background-color: var(--paper_light)
}
</style>