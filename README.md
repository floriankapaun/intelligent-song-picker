# facial-spotify-controller
A facial controller for the spotify web player

## Using
- [Tensorflow.js model face landmarks detection](https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection)
- [webpack](https://webpack.js.org/)

## Setup

### Client

Install dependencies

    cd client
    yarn install

Run local server

    yarn serve

### Server

Install dependencies

    cd server
    yarn install

Run local server

    node -r esm main.js

Or install nodemon for hot reloading and run

    nodemon -r esm main.js