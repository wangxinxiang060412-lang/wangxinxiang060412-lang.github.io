<template>
  <section
    ref="heroEl"
    class="relative min-h-screen overflow-hidden bg-[#120e0b] text-[#F5EFE5]"
  >
    <div class="pointer-events-none absolute inset-0 dark-leather-overlay" aria-hidden="true" />
    <div
      class="pointer-events-none absolute inset-0 opacity-35"
      style="
        background:
          radial-gradient(900px 500px at 78% 28%, rgba(255, 126, 103, 0.2), transparent 70%),
          radial-gradient(700px 460px at 14% 84%, rgba(255, 200, 170, 0.14), transparent 75%);
      "
      aria-hidden="true"
    />

    <div class="relative z-10 mx-auto grid min-h-screen w-full max-w-[1480px] items-center gap-16 px-6 py-20 md:px-12 lg:grid-cols-12 lg:gap-10 lg:px-20">
      <div class="lg:col-span-5">
        <p
          ref="kickerEl"
          class="font-mono text-[11px] uppercase tracking-[0.34em] text-[#ff7e67]"
        >
          02 — iOS Application
        </p>
        <h1
          ref="titleEl"
          class="font-display mt-7 text-[clamp(64px,8vw,132px)] font-extrabold leading-[0.88] tracking-[-0.04em] text-[#F5EFE5]"
        >
          Pixel Buddy
        </h1>
        <p
          ref="descEl"
          class="font-body mt-8 max-w-[560px] text-[16px] leading-[1.9] text-[#F5EFE5]/78 md:text-[18px]"
        >
          打破屏幕边界的生命感。这不仅是一款 App，而是活在灵动岛、锁屏和小组件里的像素伙伴。
        </p>
        <div ref="tagsEl" class="mt-10 flex flex-wrap gap-3">
          <span
            v-for="tag in techTags"
            :key="tag"
            class="font-mono rounded-full border border-white/14 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#F5EFE5]/88 backdrop-blur-xl"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="relative flex items-center justify-center lg:col-span-7">
        <div ref="phoneStageEl" class="phone-stage w-full max-w-[620px]">
          <div
            ref="phoneEl"
            class="iphone-shell relative mx-auto aspect-[555/1206] w-[300px] rounded-[50px] border-[12px] border-[#1a1a1c] bg-black md:w-[320px] md:rounded-[56px]"
          >
            <div
              class="pointer-events-none absolute left-1/2 top-[12px] z-20 h-[32px] w-[110px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_4px_rgba(255,255,255,0.05)] md:top-[14px]"
              aria-hidden="true"
            />
            <span
              class="pointer-events-none absolute -left-[16px] top-[124px] h-[40px] w-[6px] rounded-full bg-[#2f2f33]"
              aria-hidden="true"
            />
            <span
              class="pointer-events-none absolute -left-[16px] top-[182px] h-[76px] w-[6px] rounded-full bg-[#2f2f33]"
              aria-hidden="true"
            />
            <span
              class="pointer-events-none absolute -left-[16px] top-[272px] h-[76px] w-[6px] rounded-full bg-[#2f2f33]"
              aria-hidden="true"
            />
            <span
              class="pointer-events-none absolute -right-[16px] top-[202px] h-[120px] w-[6px] rounded-full bg-[#2f2f33]"
              aria-hidden="true"
            />
            <div
              class="absolute inset-[6px] overflow-hidden rounded-[38px] border border-white/10 bg-[#09090c] md:rounded-[44px]"
            >
              <video
                class="h-full w-full object-cover"
                src="/video/4月23日.webm"
                autoplay
                loop
                muted
                playsinline
                preload="auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";

const heroEl = ref(null);
const kickerEl = ref(null);
const titleEl = ref(null);
const descEl = ref(null);
const tagsEl = ref(null);
const phoneStageEl = ref(null);
const phoneEl = ref(null);

const techTags = ["SwiftUI", "ActivityKit", "WidgetKit", "App Group"];

let ctx;

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.set(phoneEl.value, {
      rotateX: 5,
      rotateY: -15,
      rotateZ: 0.8,
      transformPerspective: 1200,
      transformOrigin: "50% 50%",
    });

    const textNodes = [kickerEl.value, titleEl.value, descEl.value, tagsEl.value].filter(Boolean);

    gsap.fromTo(
      textNodes,
      { y: 48, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.05,
        stagger: 0.12,
        ease: "power3.out",
      },
    );

    gsap.fromTo(
      phoneEl.value,
      {
        y: 120,
        opacity: 0,
        rotateX: 16,
        rotateY: -28,
        scale: 0.88,
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 5,
        rotateY: -15,
        scale: 1,
        duration: 1.45,
        ease: "expo.out",
        delay: 0.12,
      },
    );
  }, heroEl.value);
});

onUnmounted(() => {
  ctx?.revert();
});
</script>

<style scoped>
.dark-leather-overlay {
  background-color: #120e0b;
  background-image:
    radial-gradient(circle at 52% 46%, #2a211c 0%, #0f0a08 82%),
    url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.12' /%3E%3C/svg%3E");
  background-size:
    cover,
    180px 180px;
  background-repeat: no-repeat, repeat;
}

.phone-stage {
  perspective: 1200px;
}

.iphone-shell {
  box-shadow:
    0 44px 90px rgba(0, 0, 0, 0.62),
    0 22px 42px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  transform-style: preserve-3d;
  will-change: transform, opacity;
}
</style>
