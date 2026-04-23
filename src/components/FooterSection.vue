<template>
  <div>
    <div
      ref="bigTextWrap"
      class="footer-scan-wrap relative cursor-pointer overflow-hidden px-1"
      style="border-top: 1px solid rgba(74, 59, 50, 0.16)"
      @mousemove="onSpotlightMove"
      @mouseleave="onSpotlightLeave"
      @click="scrollToTop"
    >
      <p
        class="font-display font-extrabold tracking-tighter w-full text-center leading-none select-none"
        style="
          font-size: clamp(60px, 15vw, 220px);
          letter-spacing: -0.04em;
          line-height: 0.82;
          color: rgba(74, 59, 50, 0.16);
        "
      >
        <span
          v-for="(char, index) in brandChars"
          :key="`base-${index}`"
          class="spot-char inline-block"
          :style="letterLiftStyle(index)"
        >
          {{ char }}
        </span>
      </p>
      <p
        ref="spotlightEl"
        class="auto-spotlight font-display font-extrabold tracking-tighter w-full text-center leading-none select-none absolute inset-0 pointer-events-none"
        style="
          font-size: clamp(60px, 15vw, 220px);
          letter-spacing: -0.04em;
          line-height: 0.82;
          color: rgba(45, 36, 34, 0.45);
          clip-path: circle(0px at 50% 50%);
        "
      >
        <span
          v-for="(char, index) in brandChars"
          :key="`spot-${index}`"
          class="spot-char spot-char-glow inline-block"
          :style="letterLiftStyle(index)"
        >
          {{ char }}
        </span>
      </p>
      <span
        v-show="spotlightActive"
        class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[.3em] text-[#5C4D49] transition-opacity duration-500"
      >
        ↑ Back to top
      </span>
    </div>
    <footer
      ref="footerEl"
      class="relative flex flex-col items-start justify-between gap-2 px-10 py-5 md:flex-row md:items-center"
      style="border-top: 1px solid rgba(74, 59, 50, 0.16)"
    >
      <div class="flex flex-col gap-2">
        <p
          class="font-body font-medium text-[#5C4D49]"
          style="font-size: 10px; letter-spacing: 0.2em"
        >
          © 2026 王鑫翔 · WangXinxiang
        </p>
        <div class="companionship-wrap">
          <div class="companionship-bar">
            <span class="companionship-progress" :style="{ width: `${timeProgress}%` }" />
          </div>
          <p class="companionship-copy">已陪伴 {{ timeMinutes }}min {{ timeSeconds }}s</p>
        </div>
      </div>
      <div class="flex gap-5 flex-wrap">
        <a
          v-for="l in links"
          :key="l.label"
          :href="l.href"
          class="relative group font-body font-medium text-[10px] tracking-[.3em] uppercase text-[#5C4D49] no-underline transition-colors duration-300 hover:text-[#2D2422]"
        >
          {{ l.label }}
          <span
            class="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-400 bg-[rgba(var(--accent-rgb),0.4)]"
          />
        </a>
        <button
          type="button"
          class="relative group font-body font-medium text-[10px] tracking-[.3em] uppercase text-[#5C4D49] transition-colors duration-300 hover:text-[#2D2422]"
          @click.stop="toggleSound"
        >
          Sound: {{ soundEnabled ? "ON" : "OFF" }}
          <span
            class="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-400 bg-[rgba(var(--accent-rgb),0.4)]"
          />
        </button>
      </div>

      <button
        ref="pixelPetEl"
        type="button"
        class="pixel-pet absolute right-6 bottom-4 cursor-pointer border-0 bg-transparent p-0"
        aria-label="Pixel smiley easter egg"
        @mouseenter="onPetEnter"
        @mouseleave="onPetLeave"
        @click.stop="onPetClick"
      >
        <span class="pixel-face" :class="isDogMode ? 'is-dog' : ''">
          <span class="eye eye-left"></span>
          <span class="eye eye-right"></span>
          <span class="mouth"></span>
        </span>
        <span v-if="showPetBubble" class="pet-bubble">嘿，你找到我了！</span>
      </button>
      <button
        type="button"
        class="paper-plane-btn"
        :class="planeLaunching ? 'is-launching' : ''"
        aria-label="Back to top"
        @click.stop="launchToTop"
      >
        <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <path d="M14 62 L103 17 L74 101 L56 71 L14 62 Z" />
          <path d="M56 71 L78 40" />
        </svg>
      </button>
    </footer>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import { usePointerEffects } from "../composables/usePointerEffects";

const bigTextWrap = ref(null);
const footerEl = ref(null);
const spotlightEl = ref(null);
const spotlightActive = ref(false);
const pixelPetEl = ref(null);
const showPetBubble = ref(false);
const isDogMode = ref(false);
const planeLaunching = ref(false);
const soundEnabled = ref(false);
const timeMinutes = ref(0);
const timeSeconds = ref(0);
const timeProgress = ref(0);
const spotRatio = ref(0.5);
const reducedMotion = ref(false);
const brandChars = "xinxiang".split("");
const { supportsPointerEffects } = usePointerEffects();
let petTween = null;
let petPatrolTween = null;
let bubbleTimer = null;
let clickWindow = [];
let mobileScanTimer = null;
let elapsedTimer = null;
let pageLoadTime = performance.now();

const scanRadius = computed(() => (window.innerWidth < 768 ? 98 : 120));

function letterLiftStyle(index) {
  const ratio = spotRatio.value;
  const center = index / Math.max(1, brandChars.length - 1);
  const falloff = Math.max(0, 1 - Math.abs(ratio - center) * 2.1);
  const lift = -22 * falloff;
  return {
    transform: `translateY(${lift.toFixed(2)}px)`,
  };
}

function setSpotlightAt(x, y, duration = 0.45) {
  if (!spotlightEl.value) return;
  gsap.to(spotlightEl.value, {
    clipPath: `circle(${scanRadius.value}px at ${x}px ${y}px)`,
    duration: reducedMotion.value ? 0 : duration,
    ease: "power3.out",
    overwrite: true,
  });
}

function onSpotlightMove(e) {
  if (!supportsPointerEffects.value) return;
  spotlightActive.value = true;
  const el = bigTextWrap.value;
  if (!el || !spotlightEl.value) return;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  spotRatio.value = Math.min(1, Math.max(0, x / rect.width));
  setSpotlightAt(x, y, 0.45);
}

function onSpotlightLeave() {
  if (!supportsPointerEffects.value) return;
  spotlightActive.value = false;
  spotRatio.value = 0.5;
  if (!spotlightEl.value) return;
  gsap.to(spotlightEl.value, {
    clipPath: "circle(0px at 50% 50%)",
    duration: reducedMotion.value ? 0 : 0.7,
    ease: "power3.inOut",
    overwrite: true,
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function onPetEnter() {
  if (!pixelPetEl.value) return;
  if (isDogMode.value) return;
  petTween?.kill();
  petTween = gsap.to(pixelPetEl.value, {
    y: -10,
    repeat: -1,
    yoyo: true,
    duration: 0.28,
    ease: "steps(4)",
  });
}

function onPetLeave() {
  petTween?.kill();
  petTween = null;
  if (!pixelPetEl.value) return;
  gsap.to(pixelPetEl.value, {
    y: 0,
    duration: 0.45,
    ease: "steps(4)",
  });
}

function startDogPatrol() {
  if (!pixelPetEl.value || !footerEl.value || reducedMotion.value) return;
  const footerWidth = footerEl.value.clientWidth;
  petPatrolTween?.kill();
  petPatrolTween = gsap
    .timeline()
    .to(pixelPetEl.value, {
      x: -(footerWidth - 120),
      duration: 2.1,
      ease: "steps(16)",
    })
    .to(pixelPetEl.value, {
      x: 0,
      duration: 2.1,
      ease: "steps(16)",
    });
}

function onPetClick() {
  const now = performance.now();
  if (isDogMode.value) {
    isDogMode.value = false;
    showPetBubble.value = false;
    petPatrolTween?.kill();
    if (pixelPetEl.value) {
      gsap.to(pixelPetEl.value, { x: 0, duration: 0.2, ease: "power1.out" });
    }
    clickWindow = [];
    return;
  }

  clickWindow = [...clickWindow.filter((t) => now - t < 1300), now];
  if (clickWindow.length < 5) return;

  clickWindow = [];
  isDogMode.value = true;
  showPetBubble.value = true;
  bubbleTimer && clearTimeout(bubbleTimer);
  bubbleTimer = window.setTimeout(() => {
    showPetBubble.value = false;
  }, 3000);
  startDogPatrol();
}

function launchToTop() {
  if (planeLaunching.value) return;
  planeLaunching.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
  const finish = () => {
    planeLaunching.value = false;
  };
  window.setTimeout(finish, reducedMotion.value ? 150 : 1150);
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value;
  window.audioEnabled = soundEnabled.value;
}

function startMobileAutoScan() {
  if (!bigTextWrap.value || !spotlightEl.value || reducedMotion.value) return;
  const runSweep = () => {
    if (!bigTextWrap.value || !spotlightEl.value) return;
    const rect = bigTextWrap.value.getBoundingClientRect();
    const y = rect.height * 0.52;
    spotlightActive.value = true;
    gsap.fromTo(
      { x: 0 },
      { x: rect.width, duration: 1.55, ease: "power2.inOut", onUpdate() {
        const x = this.targets()[0].x;
        spotRatio.value = Math.min(1, Math.max(0, x / rect.width));
        setSpotlightAt(x, y, 0.12);
      } },
    );
    gsap.to(spotlightEl.value, {
      clipPath: `circle(0px at ${rect.width}px ${y}px)`,
      delay: 1.6,
      duration: 0.45,
      ease: "power2.out",
    });
    gsap.delayedCall(2.2, () => {
      spotlightActive.value = false;
      spotRatio.value = 0.5;
    });
  };
  runSweep();
  mobileScanTimer = window.setInterval(runSweep, 8000);
}

const links = [
  { label: "Phone", href: "tel:15258851884" },
  { label: "Email", href: "mailto:wangxinxiang060412@qq.com" },
  { label: "GitHub", href: "https://github.com" },
];

onMounted(() => {
  reducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  soundEnabled.value = window.audioEnabled === true;
  pageLoadTime = performance.now();
  elapsedTimer = window.setInterval(() => {
    const elapsedSec = Math.floor((performance.now() - pageLoadTime) / 1000);
    timeMinutes.value = Math.floor(elapsedSec / 60);
    timeSeconds.value = elapsedSec % 60;
    timeProgress.value = Math.min(100, (elapsedSec % 60) * (100 / 60));
  }, 1000);

  if (window.matchMedia("(hover: none)").matches) {
    startMobileAutoScan();
  }
});

onUnmounted(() => {
  petTween?.kill();
  petPatrolTween?.kill();
  bubbleTimer && clearTimeout(bubbleTimer);
  mobileScanTimer && clearInterval(mobileScanTimer);
  elapsedTimer && clearInterval(elapsedTimer);
});
</script>
<style scoped>
.spot-char {
  transition: transform 360ms cubic-bezier(0.25, 1, 0.2, 1);
  will-change: transform;
}

.spot-char-glow {
  text-shadow: 0 0 24px rgba(255, 126, 103, 0.4);
}

.companionship-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.companionship-bar {
  position: relative;
  width: 80px;
  height: 1px;
  background: rgba(92, 77, 73, 0.2);
  overflow: hidden;
}

.companionship-progress {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  background: rgba(255, 126, 103, 0.46);
  transition: width 500ms ease-out;
}

.companionship-copy {
  margin: 0;
  font-family: "JetBrains Mono", "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 9px;
  color: rgba(92, 77, 73, 0.6);
}

.pixel-face {
  position: relative;
  display: block;
  width: 24px;
  height: 24px;
  background: #ffb085;
  box-shadow:
    4px 0 #ffb085,
    0 4px #ffb085,
    4px 4px #ffb085,
    8px 4px #ffb085,
    4px 8px #ffb085;
}

.pixel-face.is-dog {
  width: 22px;
  height: 14px;
  background: #ffb085;
  box-shadow:
    4px 0 #ffb085,
    8px 0 #ffb085,
    12px 0 #ffb085,
    16px 0 #ffb085,
    20px 0 #ffb085,
    4px 4px #ffb085,
    8px 4px #ffb085,
    12px 4px #ffb085,
    16px 4px #ffb085,
    20px 4px #ffb085,
    -4px 8px #ffb085,
    0 8px #ffb085,
    8px 8px #ffb085,
    12px 8px #ffb085,
    20px 8px #ffb085,
    24px 8px #ffb085,
    4px 12px #ffb085,
    16px 12px #ffb085;
}

.eye {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #2d2422;
  top: 8px;
  transform-origin: center center;
  animation: blink 4.2s steps(1, end) infinite;
}

.eye-left {
  left: 6px;
}

.eye-right {
  left: 16px;
}

.pixel-face.is-dog .eye-left {
  left: 14px;
  top: 4px;
}

.pixel-face.is-dog .eye-right {
  left: 20px;
  top: 4px;
}

.mouth {
  position: absolute;
  left: 10px;
  top: 16px;
  width: 8px;
  height: 4px;
  background: #ff7e67;
}

.pixel-face.is-dog .mouth {
  left: 24px;
  top: 8px;
  width: 4px;
  height: 4px;
  background: #2d2422;
}

.pet-bubble {
  position: absolute;
  right: 24px;
  bottom: 26px;
  white-space: nowrap;
  border: 1px solid rgba(74, 59, 50, 0.2);
  border-radius: 999px;
  background: #fff9f3;
  padding: 4px 9px;
  font-family: "JetBrains Mono", "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 9px;
  color: #5c4d49;
  animation: bubbleFade 3s ease forwards;
}

.paper-plane-btn {
  position: absolute;
  right: 2rem;
  bottom: 6rem;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(74, 59, 50, 0.22);
  background: rgba(255, 249, 243, 0.96);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6f544a;
  transition:
    box-shadow 420ms cubic-bezier(0.25, 1, 0.2, 1),
    transform 420ms cubic-bezier(0.25, 1, 0.2, 1);
}

.paper-plane-btn svg {
  width: 22px;
  height: 22px;
}

.paper-plane-btn path {
  stroke: currentColor;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.paper-plane-btn:hover {
  box-shadow: 0 14px 30px rgba(74, 59, 50, 0.18);
  animation: planeJitter 620ms steps(2) infinite;
}

.paper-plane-btn.is-launching {
  animation: planeLaunch 1.1s cubic-bezier(0.2, 0.82, 0.17, 1) forwards;
}

@keyframes blink {
  0%,
  86%,
  100% {
    transform: scaleY(1);
  }
  88%,
  90% {
    transform: scaleY(0.25);
  }
}

@keyframes bubbleFade {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  12% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-2px);
  }
}

@keyframes planeJitter {
  0%,
  100% {
    transform: rotate(0deg) translateY(0);
  }
  50% {
    transform: rotate(-8deg) translateY(-1px);
  }
}

@keyframes planeLaunch {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  86% {
    opacity: 1;
    transform: translate(-100vw, -120vh) scale(0.2) rotate(20deg);
  }
  100% {
    opacity: 0;
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
}

@media (max-width: 768px) {
  .paper-plane-btn {
    right: 1rem;
    bottom: 5.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spot-char,
  .companionship-progress,
  .paper-plane-btn,
  .pet-bubble {
    transition: none !important;
    animation: none !important;
  }
}
</style>
