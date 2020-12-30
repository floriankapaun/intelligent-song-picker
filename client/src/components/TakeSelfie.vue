<template>
  <main class="m4">
    <h1 class="sr-only">Take a selfie</h1>
    <article v-if="!error" class="fullscreen-background_wrapper">
      <section class="loading-animation">
        <div class="dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p class="text-xs color-ink_light mt2">Starting Camera</p>
      </section>
      <video ref="video" tabindex="-1" autoplay playsinline muted></video>
    </article>

    <article v-else-if="error" class="error">
      <h1 class="mb4">Oh oh. 😲</h1>
      <p class="mb3">Looks like you're using an iPhone.</p>
      <p class="mb3">Apple is very restrictive when it comes to accessing the camera in browsers other than Safari.</p>
      <p>That's why this app works only in Safari for now.</p>
    </article>

    <article id="selfie-controls" class="flex flex-row justify-between p4">
      <span class="spacing-size_button"></span>
      <button type="button" class="btn btn-icon-only p0" :disabled="!isVideoPlaying" @click="takeSelfie">
        <span id="take-selfie-icon" class="icon" v-html="icons.takePhoto"></span>
        <span class="sr-only"> Take a Selfie</span>
      </button>
      <button id="info-button" ref="openInfoModal" type="button" class="btn btn-icon-only p0" aria-label="Open Info Modal" :aria-expanded="isInfoModalOpen" @click="openInfoModal">
        <span class="icon" v-html="icons.info"></span>
        <span class="sr-only"> Info</span>
      </button>
    </article>

    <article ref="infoModal" class="modal p4" :class="isInfoModalOpen ? 'open' : null" aria-label="Info Modal content">
      <section class="flex flex-row justify-between mb8">
        <button ref="closeInfoModal" class="btn btn-icon-only p0" aria-label="Hide Info Modal" :tabindex="isInfoModalOpen ? 0 : -1" @click="closeInfoModal">
          <span class="sr-only">Close </span>
          <span class="icon" v-html="icons.close"></span>
        </button>
        <h2 class="text-m">Take a Selfie</h2>
        <span class="spacing-size_button"></span>
      </section>
      <p>Based on your photo, we will play the perfect song for you. Don't worry, the picture stays on your device. Click the photo button now to get started.</p>
    </article>
  </main>
</template>

<script>
import { createFocusTrap } from 'focus-trap';
import { setupCamera } from '@/utils/index.js';

export default {
  data() {
    return {
      selfie: undefined,
      focusTrap: undefined,
      isInfoModalOpen: false,
      isVideoPlaying: false,
      stream: undefined,
      error: false,
      icons: {
        takePhoto: require('@/assets/img/icons/take_photo-24px.svg').default,
        info: require('@/assets/img/icons/info-24px.svg').default,
        close: require('@/assets/img/icons/close-24px.svg').default,
      }
    };
  },
  methods: {
    takeSelfie() {
      const video = this.$refs.video;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      if (video && canvas && context && videoWidth && videoHeight && windowWidth && windowHeight) {
        // Set Canvas size to "fullscreen"
        canvas.width = windowWidth;
        canvas.height = windowHeight;
        // The image has to "fill" the canvas
        // Calculate the scale factor to achieve this effect
        const scale = Math.max(windowWidth / videoWidth, windowHeight / videoHeight);
        // Calculate the top left position of the image on the canvas
        const x = (windowWidth / 2) - (videoWidth / 2) * scale;
        const y = (windowHeight / 2) - (videoHeight / 2) * scale;
        // Draw the scaled image onto the canvas
        context.drawImage(video, x, y, videoWidth * scale, videoHeight * scale);
        // Calculate img and base64 url
        const img = context.getImageData(0, 0, windowWidth, windowHeight);
        const url = canvas.toDataURL('image/png');
        // Stop stream
        this.stream.getTracks().forEach(track => track.stop());
        // Emit img properties to parent
        this.$emit('tookSelfie', img, url);
      }
    },
    openInfoModal() {
      this.isInfoModalOpen = true;
      this.$nextTick(() => {
        this.focusTrap.activate();
        this.$refs.closeInfoModal.focus();
      })
    },
    closeInfoModal() {
      this.isInfoModalOpen = false;
      this.focusTrap.deactivate();
      this.$refs.openInfoModal.focus();
    },
  },
  async mounted() {
    // Setup focus trap for info modal
    this.focusTrap = createFocusTrap(this.$refs.infoModal, {
      onDeactivate: () => {
        if (this.isInfoModalOpen) this.closeInfoModal();
      },
    });
    const { video, stream, error } = await setupCamera(this.$refs.video);
    if (video instanceof HTMLElement) {
      this.isVideoPlaying = true;
      this.stream = stream;
    } else if (error) {
      this.error = error;
    }
  },
}
</script>

<style lang="css" scoped>
#selfie-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: auto;
}

.spacing-size_button {
  font-size: var(--font-size_s);
  display: inline-block;
  width: 1.5em;
}

#take-selfie-icon {
  width: 4.5em;
}

#info-button {
  align-self: center;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.loading-animation .dots {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.loading-animation .dots span {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  margin: 0.4rem;
  background-color: var(--ink);
  border-radius: 100%;
  animation: float 1.8s infinite;
}

.loading-animation .dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-animation .dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes float {
	0%, 100% {
		transform: translateY(4px);
	}
	50% {
		transform: translateY(-4px);
	}
}
</style>