<template>
  <div>
    <h1 class="sr-only">Take a selfie</h1>
    <div class="fullscreen-background_wrapper">
      <video ref ="video" src=""></video>
    </div>
    <button @click="this.$refs.video.play()">Play Video</button>
    <button @click="takeSelfie">Take a picture</button>
    <canvas ref="canvas" class="hidden"></canvas>
  </div>
</template>

<script>
import { setupCamera } from '@/utils/utility';

export default {
  data() {
    return {
      selfie: undefined,
    };
  },
  methods: {
    takeSelfie() {
      const video = this.$refs.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const canvas = this.$refs.canvas;
      const context = canvas.getContext('2d');
      if (video && videoWidth && videoHeight && canvas && context) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        context.drawImage(video, 0, 0, videoWidth, videoHeight);
        this.$emit('tookSelfie', context.getImageData(0, 0, videoWidth, videoHeight));
      }
    },
  },
  mounted() {
    setupCamera(this.$refs.video);
  },
}
</script>