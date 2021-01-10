<template>
  <main id="home" class="w-limited p4">
      <h1 class="mb4">Not in the mood for endless choice?</h1>
      <p class="mb3">We try to play the perfect song for you personally, your mood and environment.</p>
      <a href="/api/v1/login" class="inline-block no-decoration">
          <button class="btn" type="button" tabindex="-1">
              <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="226.733" width="226.733" viewBox="0 0 226.773 226.773"><path d="M179.416 100.696c-35.992-21.375-95.36-23.34-129.72-12.912-5.517 1.675-11.352-1.441-13.023-6.957-1.672-5.522 1.439-11.352 6.96-13.03 39.442-11.972 105.008-9.66 146.443 14.936 4.963 2.947 6.59 9.356 3.65 14.31-2.945 4.963-9.36 6.6-14.31 3.653zm-1.179 31.659c-2.525 4.097-7.882 5.382-11.974 2.866C136.256 116.777 90.5 111.433 55 122.21c-4.604 1.392-9.467-1.204-10.865-5.8a8.718 8.718 0 015.805-10.856c40.554-12.306 90.968-6.346 125.432 14.833 4.092 2.52 5.38 7.88 2.864 11.969zm-13.662 30.404a6.953 6.953 0 01-9.57 2.316c-26.22-16.026-59.223-19.644-98.09-10.767a6.955 6.955 0 01-8.332-5.233 6.95 6.95 0 015.234-8.332c42.533-9.724 79.018-5.539 108.448 12.445a6.96 6.96 0 012.31 9.57zM113.367 1.709C51.701 1.71 1.71 51.7 1.71 113.365c0 61.672 49.992 111.659 111.658 111.659 61.668 0 111.657-49.987 111.657-111.659 0-61.665-49.99-111.656-111.657-111.656" fill="#fff"/></svg>
              Connect with Spotify
          </button>
      </a>
      <p class="text-xs color-ink_light mt1">Premium required</p>
      <div class="fullscreen-background_wrapper">
        <!-- <img src="@/assets/img/spotify-top-75-album-covers-2020.png" alt="The 75 most streamed albums covers on Spotify"> -->
        <div id="bg"></div>
      </div>
  </main>
</template>

<style lang="css" scoped>
  #bg {
    width: 100%;
    height: 100%;
    background-image: url('@/assets/img/spotify-top-75-album-covers-2020.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }
</style>