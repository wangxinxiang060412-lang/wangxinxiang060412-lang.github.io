<template>
  <section
    class="flex flex-col items-center gap-5 bg-transparent p-4"
    aria-label="Pixel buddy gallery"
  >
    <div class="flex h-[140px] w-[140px] items-center justify-center">
      <button
        type="button"
        class="group flex h-full w-full items-center justify-center focus:outline-none"
        aria-label="Play cat bounce animation"
        @click="bounceCat"
      >
        <img
          ref="catSpriteRef"
          :src="currentFrame"
          :alt="`Pixel cat in ${currentState} state`"
          class="h-[112px] w-[112px] select-none object-contain"
          width="112"
          height="112"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          draggable="false"
        />
      </button>
    </div>

    <nav class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      <button
        v-for="state in stateButtons"
        :key="state"
        type="button"
        class="group relative pb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#F5EFE5]/40 transition-colors duration-500 ease-[cubic-bezier(0.25,1,0.2,1)]"
        :class="{ 'text-[#F5EFE5]': currentState === state }"
        @click="setState(state)"
      >
        {{ state }}
        <span
          class="pointer-events-none absolute inset-x-0 -bottom-[1px] h-[2px] origin-center bg-[#ff7e67] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.2,1)]"
          :class="currentState === state ? 'scale-x-100' : 'scale-x-0'"
        />
      </button>
    </nav>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import gsap from "gsap";

const currentState = ref("idle");
const frameIndex = ref(0);
const catSpriteRef = ref(null);
let frameTimer = null;

const spriteFrames = {
  idle: [
    "/sprites/cat_idle_1.png",
    "/sprites/cat_idle_2.png",
    "/sprites/cat_idle_3.png",
    "/sprites/cat_idle_4.png",
  ],
  walk: [
    "/sprites/cat_walk_1.png",
    "/sprites/cat_walk_2.png",
    "/sprites/cat_walk_3.png",
    "/sprites/cat_walk_4.png",
  ],
  sleep: ["/sprites/cat_sleep_1.png", "/sprites/cat_sleep_2.png"],
  happy: [
    "/sprites/cat_happy_1.png",
    "/sprites/cat_happy_2.png",
    "/sprites/cat_happy_3.png",
  ],
  sick: ["/sprites/cat_sick_1.png", "/sprites/cat_sick_2.png"],
};

const stateButtons = ["idle", "walk", "happy", "sleep", "sick"];

const currentFrame = computed(() => {
  const frames = spriteFrames[currentState.value];
  return frames[frameIndex.value % frames.length];
});

const tickFrame = () => {
  const frames = spriteFrames[currentState.value];
  frameIndex.value = (frameIndex.value + 1) % frames.length;
};

const startAnimationLoop = () => {
  if (frameTimer) clearInterval(frameTimer);
  frameTimer = setInterval(tickFrame, 380);
};

const setState = (state) => {
  if (currentState.value === state) return;
  currentState.value = state;
  frameIndex.value = 0;
  // Restart the loop so the new state's first frame plays for the full
  // tick interval instead of being cut short by the previous schedule.
  startAnimationLoop();
};

const bounceCat = () => {
  if (!catSpriteRef.value) return;
  gsap.killTweensOf(catSpriteRef.value);
  gsap.fromTo(
    catSpriteRef.value,
    { y: 0, scaleX: 1, scaleY: 1 },
    {
      keyframes: [
        { y: -10, scaleX: 0.93, scaleY: 1.08, duration: 0.12 },
        { y: 3, scaleX: 1.06, scaleY: 0.94, duration: 0.14 },
        { y: 0, scaleX: 1, scaleY: 1, duration: 0.22 },
      ],
      ease: "power2.out",
    },
  );
};

onMounted(() => {
  startAnimationLoop();
});

onUnmounted(() => {
  if (frameTimer) clearInterval(frameTimer);
  if (catSpriteRef.value) gsap.killTweensOf(catSpriteRef.value);
});
</script>

<style scoped>
img {
  image-rendering: pixelated;
}
</style>
