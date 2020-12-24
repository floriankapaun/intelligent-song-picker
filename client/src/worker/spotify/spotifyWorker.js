let accessToken = undefined;

addEventListener('message', async (event) => {
    // Make the accessToken globally accessible inside the worker
    accessToken = event.data.accessToken;

    const optimalAudioFeatures = {
        // danceability: 0.808, // based on tempo, rhythm stability, beat strength, and overall regularity
        energy: 0,
        // key: 7,
        // loudness: -12.733, // Values typical range between -60 and 0 db.
        // mode: 1, // 1 (major) or 0 (minor)
        speechiness: 0.66, // Values between 0.33 and 0.66 describe tracks that may contain both music and speech. Above 0.66 is probably only speech. Below 0.33 no speech.
        // acousticness: 0.00187, // 0 (non-acoustic) - 1 (acoustic)
        instrumentalness: 0, // tracks above 0.5 are treated as intrumentals with increasing confidence towards 1.0
        liveness: 0, // Detects the presence of an audience in the recording. Above 0.8 is probably live.
        valence: 0, // Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric)
        // tempo: 120.00, // bpm
        // duration_ms: 497493,
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
const toSquare = (arg) => arg * arg;

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
            error.push(toSquare(features[key] - optimalValue));
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