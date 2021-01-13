import c from '@/config/index.js';

let accessToken = undefined;

addEventListener('message', async (event) => {
    if (!event.data.accessToken || !event.data.parameters) {
        const error = { message: 'SpotifyWorker wasn\'t provided with the required parameters.' };
        postMessage({ error });
        return { error };
    }
    // Make the accessToken globally accessible inside the worker
    accessToken = event.data.accessToken;

    const { brightness, colorfulness, contrast, mood } = event.data.parameters;

    const mean = (brightness + colorfulness + contrast) / 3;

    // Based on tempo, rhythm stability, beat strength, and overall regularity
    let danceability = 1 - contrast;
    // Perceived energy of a track 0 (log) - 1 (high)
    let energy = contrast;
    // 0 (minor) or 1 (major)
    let mode = Math.round(brightness);
    // Values between 0.33 and 0.66 describe tracks that may contain both music
    // and speech. Above 0.66 is probably only speech. Below 0.33 no speech.
    let speechiness = mean;
    // 0 (non-acoustic) - 1 (acoustic)
    let acousticness = 1 - colorfulness;
    // tracks above 0.5 are treated as intrumentals with increasing confidence
    // towards 1.0
    let instrumentalness = 1 - colorfulness;
    // Detects the presence of an audience in the recording. Above 0.8 is
    // probably live.
    let liveness = colorfulness;
    // Tracks with high valence sound more positive (e.g. happy, cheerful, ...)
    let valence = mean;

    // Calculate influence of mood on audio parameters
    switch(mood) {
        // angry
        case c.EMOTION[0]:
            danceability = clamp(1 - contrast + 0.4, 0, 1);
            energy = clamp(contrast + 0.4, 0, 1);
            speechiness = clamp(mean + 0.4, 0, 1);
            acousticness = clamp(1 - colorfulness - 0.5, 0, 1);
            instrumentalness = clamp(1 - colorfulness - 0.3, 0, 1);
            liveness = clamp(colorfulness + 0.4, 0, 1);
            valence = clamp(mean - 0.4, 0, 1);
            break;
        // disgust
        case c.EMOTION[1]:
            break;
        // fear
        case c.EMOTION[2]:
            mode = Math.round(brightness - 0.25);
            speechiness = clamp(mean - 0.4, 0, 1);
            instrumentalness = clamp(1 - colorfulness + 0.4, 0, 1);
            liveness = clamp(colorfulness - 0.4, 0, 1);
            break;
        // happy
        case c.EMOTION[3]:
            danceability = clamp(1 - contrast - 0.2, 0, 1);
            energy = clamp(contrast + 0.4, 0, 1);
            mode = Math.round(brightness + 0.25);
            instrumentalness = clamp(1 - colorfulness - 0.2, 0, 1);
            liveness = clamp(colorfulness + 0.2, 0, 1);
            valence = clamp(mean + 0.6, 0, 1);
            break;
        // sad
        case c.EMOTION[4]:
            energy = clamp(contrast - 0.4, 0, 1);
            mode = Math.round(brightness - 0.25);
            speechiness = clamp(mean + 0.3, 0, 1);
            acousticness = clamp(1 - colorfulness + 0.3, 0, 1);
            instrumentalness = clamp(1 - colorfulness + 0.2, 0, 1);
            liveness = clamp(colorfulness + 0.2, 0, 1);
            valence = clamp(mean - 0.4, 0, 1);
            break;
        // surprise
        case c.EMOTION[5]:
            danceability = clamp(1 - contrast + 0.3, 0, 1);
            energy = clamp(contrast + 0.4, 0, 1);
            mode = Math.round(brightness + 0.25);
            acousticness = clamp(1 - colorfulness - 0.4, 0, 1);
            instrumentalness = clamp(1 - colorfulness - 0.3, 0, 1);
            valence = clamp(mean + 0.3, 0, 1);
            break;
        // neutral
        case c.EMOTION[6]:
            break;
        default:
            console.error(`Mood of unknown content: ${mood}`);
            break;
    }

    const optimalAudioFeatures = {
        danceability,
        energy,
        mode,
        speechiness,
        acousticness,
        instrumentalness,
        liveness,
        valence,
    };

    const result = await getTrackReommendationFromSpotify(optimalAudioFeatures);

    postMessage(result);
});


/**
 * Fetch data from spotify
 */
const spotifyFetch = (path) => {
    return fetch(`https://api.spotify.com/v1/${path}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    })
        .then((response) => response.json())
        .catch((error) => console.error(error));
};

const getTopTracks = () => {
    return spotifyFetch('me/top/tracks?limit=50');
};

const getAudioFeaturesOf = (tracks) => {
    let ids = '';
    for (const track of tracks) {
        ids += `${track.id},`;
    }
    return spotifyFetch(`audio-features/?ids=${ids}`);
};

const getRecommendationsBasedOn = (track) => {
    return spotifyFetch(`recommendations?seed_tracks=${track.id}&limit=50`);
};


/**
 * Utilities
 */

// Returns a number whose value is limited to the given range.
const clamp = (number, min, max) => Math.min(Math.max(number, min), max);

const getBestFittingTrack = (tracks, receivedTracksAudioFeatures, optimalAudioFeatures) => {
    // audioFeatures[i] contains the audio feature info for tracks[i]
    const audioFeatures = receivedTracksAudioFeatures.audio_features;
    // Calculate error for each tracks features compared to the optimal features
    // Error function: E = Σ (x[i] - y[i])^2
    // TODO: Improve error calculation. Its not quite good now because some parameters range from 0 to 1 
    // and others from 0 to 200 and therefore cause a lot higher errors.
    const errors = audioFeatures.map((features) => {
        let error = [];
        for (const [key, optimalValue] of Object.entries(optimalAudioFeatures)) {
            error.push(Math.pow(features[key] - optimalValue, 2));
        }
        return error.reduce((previous, current) => previous + current);
    })
    const indexOfMinError = errors.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);
    
    return tracks[indexOfMinError];
};


/**
 * 1. Get favorite tracks
 * 2. Filter out the best fitting
 * 3. Get spotify recommendations based on that track
 * 4. Filter out the best fitting recommendation
 * 5. Return that one
 */
const getTrackReommendationFromSpotify = async (optimalAudioFeatures) => {
    // For error logging
    const error = {
        status: undefined,
        message: undefined,
    };
    // Get the users top 50 tracks
    const topTracks = await getTopTracks();
    if (!topTracks) {
        error.message = 'Unable to receive Top Tracks from Spotify.';
        return { error };
    } else if (topTracks.error) {
        error.status = topTracks.error.status;
        error.message = topTracks.error.message;
        return { error };
    }
    // Fetch the top tracks audio features
    const topTracksAudioFeatures = await getAudioFeaturesOf(topTracks.items);
    if (!topTracksAudioFeatures) {
        error.message = 'Unable to receive audio features of Top Tracks from Spotify.';
        return { error };
    } else if (topTracksAudioFeatures.error) {
        error.status = topTracksAudioFeatures.error.status;
        error.message = topTracksAudioFeatures.error.message;
        return { error };
    }
    // Get the top track that fits best to the provided optimal audio features
    const bestFittingTopTrack = await getBestFittingTrack(
        topTracks.items, 
        topTracksAudioFeatures, 
        optimalAudioFeatures,
    );
    if (!bestFittingTopTrack || !bestFittingTopTrack.id || !bestFittingTopTrack.name) {
        error.message = 'Unable to detect the best fitting Top Track.';
        return { error };
    }
    // Get recommendations based on the best fitting top track
    const recommendations = await getRecommendationsBasedOn(bestFittingTopTrack);
    if (!recommendations) {
        error.message = 'Unable to receive recommendations from Spotify.';
        return { error };
    } else if (recommendations.error) {
        error.status = recommendations.error.status;
        error.message = recommendations.error.message;
        return { error };
    }
    // Fetch the recommendations audio features
    const recommendationsAudioFeatures = await getAudioFeaturesOf(recommendations.tracks);
    if (!recommendationsAudioFeatures) {
        error.message = 'Unable to receive audio features of recommendations from Spotify.';
        return { error };
    } else if (recommendationsAudioFeatures.error) {
        error.status = recommendationsAudioFeatures.error.status;
        error.message = recommendationsAudioFeatures.error.message;
        return { error };
    }
    // Get the recommendation that fits best to the provided optimal audio features
    const bestFittingRecommendation = await getBestFittingTrack(
        recommendations.tracks,
        recommendationsAudioFeatures,
        optimalAudioFeatures,
    );
    if (!bestFittingRecommendation || !bestFittingRecommendation.id || !bestFittingRecommendation.name) {
        error.message = 'Unable to detect the best fitting recommendation.';
        return { error };
    }

    return { result: bestFittingRecommendation };
}