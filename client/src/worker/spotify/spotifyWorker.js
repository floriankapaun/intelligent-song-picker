addEventListener('message', async (event) => {
    const { accessToken, imageData } = event.data;

    fetch('https://api.spotify.com/v1/me/top/tracks', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            })
            .catch((error) => console.error(error));

    postMessage({
        accessToken,
        imageData,
    });
});