<template>
  <div class="ai-animation" ref="animationContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import lottie from 'lottie-web';
import animationData from '../assets/ai-animation.json';

const animationContainer = ref<HTMLElement | null>(null);
let animationInstance: any = null;

onMounted(() => {
  if (animationContainer.value) {
    animationInstance = lottie.loadAnimation({
      container: animationContainer.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationData
    });
  }
});

onBeforeUnmount(() => {
  if (animationInstance) {
    animationInstance.destroy();
  }
});
</script>

<style scoped>
.ai-animation {
  width: 50px;
  height: 50px;
  display: inline-block;
}
</style>
