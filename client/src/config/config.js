module.exports = {
    appDOM: document.getElementById('app'),
    videoDOM: document.getElementById('video'),
    canvasDOM: document.getElementById('output'),
    refreshTokenDOM: document.getElementById('refresh-token'),
    greetingDOM: document.getElementById('greeting'),
    routes: [
        { path: '/', name: 'start', accessWithoutAuth: true },
        { path: '/app', name: 'app', accessWithoutAuth: false },
        { path: '/about', name: 'about', accessWithoutAuth: true },
        { path: '/404', name: 'error', accessWithoutAuth: true },
    ],
    router: {
        loginViewPath: '/',
        errorViewPath: '/404',
    },
}