import { spotifyController } from './SpotifyController.js';
import { router, pageHistory } from './router.js';

import { faceLandmarksDetection } from './FaceLandmarksDetection.js';

// faceLandmarksDetection.init();


window.addEventListener('load', router);
window.addEventListener('hashchange', router);

document.addEventListener('click', () => {
    console.log(pageHistory);
})