export const getHashParams = () => {
    const hashParams = {};
    const query = window.location.hash.substring(1);
    const r = /([^&;=]+)=?([^&;]*)/g;
    let e = r;
    while (e = r.exec(query)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
};
