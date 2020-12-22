let accessToken = undefined;

addEventListener('message', async (event) => {
    accessToken = event.data.accessToken;

    const { imageData } = event.data;

    const optimalFeatures = {
        // danceability: 0.808, // based on tempo, rhythm stability, beat strength, and overall regularity
        energy: 0.8,
        // key: 7,
        // loudness: -12.733, // Values typical range between -60 and 0 db.
        // mode: 1, // 1 (major) or 0 (minor)
        speechiness: 0.3, // Values between 0.33 and 0.66 describe tracks that may contain both music and speech. Above 0.66 is probably only speech. Below 0.33 no speech.
        // acousticness: 0.00187, // 0 (non-acoustic) - 1 (acoustic)
        instrumentalness: 0.2, // tracks above 0.5 are treated as intrumentals with increasing confidence towards 1.0
        liveness: 0.45, // Detects the presence of an audience in the recording. Above 0.8 is probably live.
        valence: 0.7, // Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric)
        tempo: 120.00, // bpm
        // duration_ms: 497493,
    };

    /**
     * TODO:
     * 1. Get favorite tracks
     * 2. Filter out the best fitting
     * 3. Get recommendations based on that track
     * 4. Filter out the best fitting
     * 5. Start playing
     */

    const favorites = {
        artists: [],
        tracks: [],
    };

    // Get the users top 20 tracks
    const topTracks = await getTopTracks();

    // Fetch the top tracks audio features
    const topTracksAudioFeatures = await getAudioFeaturesOf(topTracks.items);

    const bestFittingTopTrack = await getBestFittingTrack(topTracks.items, topTracksAudioFeatures, optimalFeatures);

    const recommendations = await getRecommendationsBasedOn(bestFittingTopTrack);

    const recommendationsAudioFeatures = await getAudioFeaturesOf(recommendations.tracks);

    const bestFittingRecommendations = await getBestFittingTrack(recommendations.tracks, recommendationsAudioFeatures, optimalFeatures);

    console.log(bestFittingRecommendations.name, bestFittingRecommendations);


    postMessage({
        accessToken,
        recommendations,
    });
});

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
    return spotifyFetch('me/top/tracks');
};

const getAudioFeaturesOf = (tracks) => {
    let ids = '';
    for (const track of tracks) {
        ids += `${track.id},`;
    }
    return spotifyFetch(`audio-features/?ids=${ids}`);
};

const toSquare = (arg) => arg * arg;

const getBestFittingTrack = (tracks, receivedTracksAudioFeatures, optimalFeatures) => {
    // audioFeatures[i] contains the audio feature info for tracks[i]
    const audioFeatures = receivedTracksAudioFeatures.audio_features;
    // Calculate error for each tracks features compared to the optimal features
    // TODO: Improve error calculation. Its not quite good now because some parameters range from 0 to 1 
    // and others from 0 to 200 and therefore cause a lot higher errors.
    const errors = audioFeatures.map((features) => {
        let error = [];
        for (const [key, optimalValue] of Object.entries(optimalFeatures)) {
            error.push(toSquare(features[key] - optimalValue));
        }
        return error.reduce((previous, current) => previous + current);
    })
    const indexOfMinError = errors.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);
    
    return tracks[indexOfMinError];
};

const getRecommendationsBasedOn = (track) => {
    return spotifyFetch(`recommendations?seed_tracks=${track.id}`);
};