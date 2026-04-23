<template>
  <div class="min-h-screen">
    <a
      href="#intro"
      class="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-[#FDFCF8] focus:px-4 focus:py-2 focus:text-[#2D2422] focus:border focus:border-[#4A3B32]/30"
    >
      跳过导航到主内容
    </a>
    <div>
      <Nav />

      <Loader v-if="!loaderDone" @done="onLoaderDone" />
      <Hero
        :start-intro="loaderDone && !skipEntranceAnimation"
        :skip-intro="skipEntranceAnimation"
        @intro-complete="onHeroIntroComplete"
      />
      <Marquee />
      <Intro />
      <SectionDivider />
      <ToolkitCards />
      <WhatIBuild />
      <Contact />
      <FooterSection />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onErrorCaptured, nextTick } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero from "../components/Hero.vue";
import Loader from "../components/Loader.vue";
import Marquee from "../components/Marquee.vue";
import Intro from "../components/Intro.vue";
import WhatIBuild from "../components/WhatIBuild.vue";
import ToolkitCards from "../components/ToolkitCards.vue";
import SectionDivider from "../components/SectionDivider.vue";
import Contact from "../components/Contact.vue";
import FooterSection from "../components/FooterSection.vue";
import Nav from "../components/Nav.vue";
import { isInitialLoaded } from "../composables/useStudio";
import { useScrollLock } from "../composables/useScrollLock";

const loaderDone = ref(isInitialLoaded.value);
const skipEntranceAnimation = ref(isInitialLoaded.value);
const { lock, unlock, forceUnlock } = useScrollLock();
const SCROLLTRIGGER_REFRESH_DELAY = 0.5;

async function onHeroIntroComplete() {
  unlock();
  isInitialLoaded.value = true;
  await nextTick();
  gsap.delayedCall(SCROLLTRIGGER_REFRESH_DELAY, () => ScrollTrigger.refresh());
}

function onLoaderDone() {
  loaderDone.value = true;
  isInitialLoaded.value = true;
}

onMounted(async () => {
  await nextTick();
  if (!isInitialLoaded.value) {
    lock();
  } else {
    unlock();
  }
  gsap.delayedCall(SCROLLTRIGGER_REFRESH_DELAY, () => ScrollTrigger.refresh());
});

onUnmounted(() => {
  forceUnlock();
});

onErrorCaptured(() => {
  forceUnlock();
  return false;
});
</script>
