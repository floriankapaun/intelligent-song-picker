# ISP – intelligent song picker

Have you ever felt overwhelmed when choosing a song from Spotify?

This is the moment when ISP will help you.

All you need to do is take a selfie. ISP will do the rest of the magic* and provide you with a song that fits your musical taste, feeling and environment.

Don't worry, the picture stays on your device.

<sub><sup>*Machine learning for face recognition, emotion classification, fancy song search algorithms and other lovely stuff</sup></sub>

## Demo

[![Click to watch a demo of this project](./docs/vimeo-teaser.png)](https://vimeo.com/506056145 "ISP demo")

## Try now

> :boom: Try it out right now at [intelligent-song-picker.com](https://intelligent-song-picker.com)!

## Background

I developed this project during the course [Interaction/Programming](https://glossar.hs-augsburg.de/Lehrveranstaltung:IAM_2006:Interaktion/Programmierung) by [Prof. Dr. Thomas Rist](https://www.hs-augsburg.de/Informatik/Thomas-Rist.html) at the [University of Applied Sciences Augsburg](https://www.hs-augsburg.de/). In addition to the web application I wrote a [paper](./docs/intelligent_song_picker_florian_kapaun.pdf) about this project.

## Setup

Create a local running copy of this project

### Client

1. Install dependencies

    ```
    cd client
    yarn install
    ```

2. Start local development server

    ```
    yarn serve
    ```

3. Or create a build for deployment in production

    ```
    yarn build
    ```

### Server

1. Install dependencies

    ```
    cd server
    yarn install
    ```

2. Run local nodemon server with hotreloading

    ```
    yarn serve
    ```

3. Or run production server on node only

    ```
    yarn production
    ```

## Find out more

This is a list of the core dependencies used in this project for your further reference.

### Client

- [vue.js](https://vuejs.org/)
- [tensorflow.js](https://www.tensorflow.org/js)
- [tfjs-emotion-classification](https://github.com/floriankapaun/tfjs-emotion-classification) (not a "real" dependecy but implemented)
    - [Blazeface detector](https://github.com/tensorflow/tfjs-models/tree/master/blazeface)
    - [Emotion classification (CNN Model)](https://github.com/oarriaga/face_classification)
- [webpack](https://webpack.js.org/)

### Server

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)

## ToDo

- Improve stability
- Add Autoplay function to go on playing songs after the first one is finished
- Handle Spotify non-premium users
- Add contenthash to js files for improved caching
- Create robust mobile version (currently a very bad workaround is in place here)
- Reduce own queries to spotify and instead leverage the capabilities of the Spotify Web Playback SDK