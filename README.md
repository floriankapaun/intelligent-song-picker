# ISP – intelligent song picker

Have you ever felt overwhelmed when choosing a song from Spotify?

This is the moment when ISP will help you.

All you need to do is take a selfie. ISP will do the rest of the magic and provide you with a song that fits your musical taste, feeling and environment.

Don't worry, the picture stays on your device.

## Try now

> :boom: Try it out right now at [intelligent-song-picker.com](https://intelligent-song-picker.com)!

## Background

I developed this project during the course [Interaction/Programming](https://glossar.hs-augsburg.de/Lehrveranstaltung:IAM_2006:Interaktion/Programmierung) by [Prof. Dr. Thomas Rist](https://www.hs-augsburg.de/Informatik/Thomas-Rist.html) at the [University of Applied Sciences Augsburg](https://www.hs-augsburg.de/).

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
- [tfjs-emotion-classification](https://github.com/floriankapaun/tfjs-emotion-classification)
    - [Blazeface detector](https://github.com/tensorflow/tfjs-models/tree/master/blazeface)
    - [Emotion classification (CNN Model)](https://github.com/oarriaga/face_classification)
- [webpack](https://webpack.js.org/)

### Server

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)