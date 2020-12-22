let accessToken = undefined;

addEventListener('message', async (event) => {
    accessToken = event.data.accessToken;

    const { imageData } = event.data;

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

    const topTracks = await getTopTracks();

    for (const item of topTracks.items) {
        favorites.artists.push(item.artists[0].id);
        favorites.tracks.push(item.id);
    }
    
    const recommendations = await getRecommendationsBasedOn(favorites);

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
};

const getTopTracks = async () => {
    return spotifyFetch('me/top/tracks')
        .then((response) => response.json())
        .catch((error) => console.error(error));
}

const getRecommendationsBasedOn = async (selection) => {
    return spotifyFetch(`recommendations?seed_artists=${selection.artists[0]},${selection.artists[1]}`)
        .then((response) => response.json())
        .catch((error) => console.error(error));
};