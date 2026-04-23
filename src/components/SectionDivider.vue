<template>
  <section
    ref="dividerEl"
    class="section-divider relative flex h-[30vh] min-h-[220px] w-full items-center overflow-hidden bg-[#FDFCF8]"
    aria-hidden="true"
  >
    <div class="divider-track mx-auto flex w-full max-w-[1440px] items-center px-6 md:px-12 lg:px-20">
      <p class="divider-flow-text">
        <span ref="leftTextEl" class="divider-flow-chunk">from 01 Intro</span>
        <span class="divider-flow-arrow">→</span>
        <span ref="rightTextEl" class="divider-flow-chunk">02 Toolkit</span>
      </p>
    </div>
    <div
      ref="wedgeEl"
      class="pointer-events-none absolute inset-0 will-change-[clip-path,opacity]"
      style="
        background: linear-gradient(
          130deg,
          #fdfcf8 0%,
          rgba(255, 176, 133, 0.52) 36%,
          rgba(255, 126, 103, 0.44) 56%,
          #fdfcf8 100%
        );
        clip-path: polygon(0% 0%, 100% 0%, 100% 86%, 0% 100%);
      "
    />
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const dividerEl = ref(null);
const wedgeEl = ref(null);
const leftTextEl = ref(null);
const rightTextEl = ref(null);
let ctx;

onMounted(() => {
  ctx = gsap.context(() => {
    if (!dividerEl.value || !wedgeEl.value) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      gsap.set(wedgeEl.value, {
        clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
        opacity: 0.92,
      });
      gsap.set([leftTextEl.value, rightTextEl.value].filter(Boolean), {
        color: "rgba(74, 59, 50, 0.62)",
      });
      return;
    }

    gsap
      .timeline({
        scrollTrigger: {
          trigger: dividerEl.value,
          start: "top 85%",
          end: "bottom 15%",
          scrub: 1,
        },
      })
      .fromTo(
        wedgeEl.value,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 86%, 0% 100%)",
          opacity: 1,
        },
        {
          clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
          opacity: 0.92,
          ease: "none",
          duration: 1,
        },
        0,
      )
      .fromTo(leftTextEl.value, { color: "rgba(74, 59, 50, 0.3)" }, { color: "rgba(74, 59, 50, 0.82)", ease: "none", duration: 0.5 }, 0)
      .fromTo(rightTextEl.value, { color: "rgba(74, 59, 50, 0.3)" }, { color: "rgba(255, 126, 103, 0.88)", ease: "none", duration: 0.5 }, 0.5);
  }, dividerEl.value);
});

onUnmounted(() => {
  ctx?.revert();
});
</script>

<style scoped>
.divider-flow-text {
  width: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: "JetBrains Mono", "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(74, 59, 50, 0.52);
}

.divider-flow-chunk {
  transition: color 400ms cubic-bezier(0.25, 1, 0.2, 1);
}

.divider-flow-arrow {
  color: rgba(255, 126, 103, 0.6);
}
</style>
