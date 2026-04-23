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
      <LazyMount
        :is="MarqueeSection"
        min-height="170px"
        root-margin="240px 0px"
        @mounted="scheduleScrollRefresh"
      />
      <LazyMount
        :is="IntroSection"
        min-height="980px"
        root-margin="420px 0px"
        @mounted="scheduleScrollRefresh"
      />
      <LazyMount
        :is="SectionDividerSection"
        min-height="140px"
        root-margin="260px 0px"
        @mounted="scheduleScrollRefresh"
      />
      <ToolkitCards />
      <LazyMount
        :is="WhatIBuildSection"
        min-height="3100px"
        root-margin="720px 0px"
        @mounted="scheduleScrollRefresh"
      />
      <LazyMount
        :is="ContactSection"
        min-height="1120px"
        root-margin="520px 0px"
        @mounted="scheduleScrollRefresh"
      />
      <LazyMount
        :is="FooterSectionAsync"
        min-height="420px"
        root-margin="320px 0px"
        @mounted="scheduleScrollRefresh"
      />
    </div>
  </div>
</template>

<script setup>
import {
  defineAsyncComponent,
  nextTick,
  onErrorCaptured,
  onMounted,
  onUnmounted,
  ref,
} from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero from "../components/Hero.vue";
import Loader from "../components/Loader.vue";
import Nav from "../components/Nav.vue";
import ToolkitCards from "../components/ToolkitCards.vue";
import LazyMount from "../components/LazyMount.vue";
import { isInitialLoaded } from "../composables/useStudio";
import { useScrollLock } from "../composables/useScrollLock";

const loaderDone = ref(isInitialLoaded.value);
const skipEntranceAnimation = ref(isInitialLoaded.value);
const { lock, unlock, forceUnlock } = useScrollLock();
const SCROLLTRIGGER_REFRESH_DELAY = 0.5;
let refreshCall = null;

const IntroSection = defineAsyncComponent({
  loader: () => import("../components/Intro.vue"),
  suspensible: false,
});
const MarqueeSection = defineAsyncComponent({
  loader: () => import("../components/Marquee.vue"),
  suspensible: false,
});
const SectionDividerSection = defineAsyncComponent({
  loader: () => import("../components/SectionDivider.vue"),
  suspensible: false,
});
const WhatIBuildSection = defineAsyncComponent({
  loader: () => import("../components/WhatIBuild.vue"),
  suspensible: false,
});
const ContactSection = defineAsyncComponent({
  loader: () => import("../components/Contact.vue"),
  suspensible: false,
});
const FooterSectionAsync = defineAsyncComponent({
  loader: () => import("../components/FooterSection.vue"),
  suspensible: false,
});

function scheduleScrollRefresh() {
  refreshCall?.kill();
  refreshCall = gsap.delayedCall(SCROLLTRIGGER_REFRESH_DELAY, () => {
    ScrollTrigger.refresh();
  });
}

async function onHeroIntroComplete() {
  unlock();
  isInitialLoaded.value = true;
  await nextTick();
  scheduleScrollRefresh();
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
  scheduleScrollRefresh();
});

onUnmounted(() => {
  refreshCall?.kill();
  refreshCall = null;
  forceUnlock();
});

onErrorCaptured(() => {
  forceUnlock();
  return false;
});
</script>
