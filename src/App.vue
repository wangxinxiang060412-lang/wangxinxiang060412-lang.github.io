<template>
  <AsyncCustomCursor v-if="shouldRenderCustomCursor" />

  <div
    id="global-ambient"
    ref="globalAmbientEl"
    :class="{ 'ambient-lite': isPerformanceLite }"
    class="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
    style="background: var(--bg-warm)"
  >
    <div
      class="ambient-orb ambient-orb-1 absolute -top-[15%] -left-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] opacity-60 mix-blend-multiply"
      style="
        background: radial-gradient(
          circle,
          rgba(255, 209, 179, 1) 0%,
          transparent 70%
        );
      "
    />
    <div
      class="ambient-orb ambient-orb-2 absolute -bottom-[15%] -right-[10%] w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full blur-[120px] opacity-50 mix-blend-multiply"
      style="
        background: radial-gradient(
          circle,
          rgba(255, 228, 225, 1) 0%,
          transparent 70%
        );
      "
    />
  </div>
  <div
    ref="paperEdgeLeftEl"
    :class="{ 'paper-edge-lite': isPerformanceLite }"
    class="paper-edge paper-edge-left pointer-events-none fixed left-0 top-0 z-[12] h-screen w-[20px]"
    aria-hidden="true"
  />
  <div
    ref="paperEdgeRightEl"
    :class="{ 'paper-edge-lite': isPerformanceLite }"
    class="paper-edge paper-edge-right pointer-events-none fixed right-0 top-0 z-[12] h-screen w-[20px]"
    aria-hidden="true"
  />

  <button
    type="button"
    class="progress-inkwell fixed top-6 left-6 z-[998] text-[#4A3B32]/82"
    aria-label="回到顶部"
    @click="scrollToTop"
  >
    <svg width="32" height="40" viewBox="0 0 32 40" aria-hidden="true">
      <path
        d="M6 14 L6 34 Q 6 38 10 38 L22 38 Q 26 38 26 34 L26 14 Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      />
      <rect x="9" y="10" width="14" height="4" fill="currentColor" />
      <rect
        ref="inkFillEl"
        x="7"
        y="14"
        width="18"
        height="24"
        fill="var(--accent)"
        style="transform: scaleY(0); transform-origin: 16px 38px"
      />
    </svg>
    <span class="sr-only">阅读进度：{{ Math.round(scrollProgress * 100) }}%</span>
  </button>

  <div
    :class="{ 'noise-lite': isPerformanceLite }"
    class="global-noise-overlay fixed inset-0 z-[1] pointer-events-none"
  />
  <div
    ref="routeCurtainEl"
    class="pointer-events-none fixed inset-0 z-[8500]"
    style="background: var(--bg-warm); clip-path: inset(100% 0 0 0); opacity: 0"
  />

  <main
    :inert="isStudioOpen"
    :class="{ 'opacity-0 pointer-events-none': isStudioOpen }"
    class="transition-opacity duration-700 ease-in-out"
  >
    <router-view v-slot="{ Component, route }">
      <Transition
        :name="route.meta.transition || 'page-wipe'"
        mode="out-in"
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @leave="onLeave"
      >
        <component :is="Component" :key="route.path" />
      </Transition>
    </router-view>
  </main>

  <Transition name="studio-fade">
    <CuratorStudioHost v-if="isStudioOpen" />
  </Transition>
</template>

<script setup>
import {
  computed,
  defineAsyncComponent,
  onErrorCaptured,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CuratorStudioHost from "./components/CuratorStudioHost.vue";
import { cancelIdleTask, scheduleIdleTask } from "./composables/useIdleTask";
import { useIsLowEndDevice } from "./composables/useIsLowEndDevice";
import { useIsSafari } from "./composables/useIsSafari";
import { initLenis, destroyLenis, useLenis } from "./composables/useLenis";
import { useCustomCursor } from "./composables/useCustomCursor";
import { usePointerEffects } from "./composables/usePointerEffects";
import { useReducedMotion } from "./composables/useReducedMotion";
import { isStudioOpen } from "./composables/useStudio";
import { useScrollLock } from "./composables/useScrollLock";

gsap.registerPlugin(ScrollTrigger);

const AsyncCustomCursor = defineAsyncComponent({
  loader: () => import("./components/CustomCursor.vue"),
  suspensible: false,
});

const inkFillEl = ref(null);
const routeCurtainEl = ref(null);
const paperEdgeLeftEl = ref(null);
const paperEdgeRightEl = ref(null);
const globalAmbientEl = ref(null);
const {
  setCursorEnabled,
  setCursorMode,
  setCursorMagneticTarget,
  clearCursorHover,
} = useCustomCursor();
const { isSafari, isIOS, isWebKit } = useIsSafari();
const { prefersReducedMotion } = useReducedMotion();
const { isLowEndDevice } = useIsLowEndDevice();
const { supportsPointerEffects } = usePointerEffects();
const { lock, unlock, forceUnlock } = useScrollLock();
const isPerformanceLite = computed(
  () => prefersReducedMotion.value || isLowEndDevice.value,
);
const cursorComponentReady = ref(false);
const shouldRenderCustomCursor = computed(
  () => cursorComponentReady.value && supportsPointerEffects.value,
);

let appScrollTrigger = null;
let pointerMoveHandler = null;
let pointerMoveRafId = 0;
let queuedPointerTarget = null;
let activeCursorTarget = null;
let removeStudioWatch = null;
let routeTransitionDepth = 0;
const rootStyle = document.documentElement.style;
let blankClickRippleHandler = null;
let activeRippleCount = 0;
let lenisIdleTask = null;
let cursorIdleTask = null;
let easterEggsIdleTask = null;
let edgeYToLeft = null;
let edgeYToRight = null;
let edgeWideScreenMedia = null;
let ambientVisibilityHandler = null;
let pendingProgress = null;
let warmthRafId = 0;
let disposeEasterEggs = null;
const scrollProgress = ref(0);

function interpolateThreeStops(progress, c0, c1, c2) {
  if (progress <= 0.5) {
    return gsap.utils.interpolate(c0, c1, progress / 0.5);
  }
  return gsap.utils.interpolate(c1, c2, (progress - 0.5) / 0.5);
}

function applyGlobalWarmth(progress) {
  const accent = interpolateThreeStops(
    progress,
    "#FFB085",
    "#FF9B6A",
    "#FF7E67",
  );
  const bgWarm = interpolateThreeStops(
    progress,
    "#FDFCF8",
    "#FDF8F2",
    "#FBF3EB",
  );
  const [r, g, b] = gsap.utils.splitColor(accent);
  rootStyle.setProperty("--accent", accent);
  rootStyle.setProperty("--bg-warm", bgWarm);
  rootStyle.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
}

function scheduleGlobalWarmth(progress) {
  pendingProgress = progress;
  if (warmthRafId) return;
  warmthRafId = requestAnimationFrame(() => {
    applyGlobalWarmth(pendingProgress ?? 0);
    warmthRafId = 0;
  });
}

function scrollToTop() {
  const currentLenis = useLenis().lenis;
  if (currentLenis) {
    currentLenis.scrollTo(0, {
      duration: 1.05,
      easing: gsap.parseEase("cubic-bezier(0.76, 0, 0.24, 1)"),
    });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupBlankClickRipple() {
  if (
    blankClickRippleHandler ||
    !supportsPointerEffects.value ||
    prefersReducedMotion.value ||
    isLowEndDevice.value
  ) {
    return;
  }

  blankClickRippleHandler = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("a, button, input, textarea")) return;
    if (activeRippleCount >= 3) return;

    const accentColor =
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
      "rgba(74,59,50,0.12)";
    const ripple = document.createElement("span");
    ripple.setAttribute("aria-hidden", "true");
    ripple.style.position = "fixed";
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    ripple.style.width = "0px";
    ripple.style.height = "0px";
    ripple.style.borderRadius = "999px";
    ripple.style.border = `1px solid ${accentColor}`;
    ripple.style.background = "transparent";
    ripple.style.opacity = "0.4";
    ripple.style.pointerEvents = "none";
    ripple.style.transform = "translate(-50%, -50%)";
    ripple.style.zIndex = "9996";

    document.body.appendChild(ripple);
    activeRippleCount += 1;
    gsap.to(ripple, {
      width: 120,
      height: 120,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => {
        ripple.remove();
        activeRippleCount = Math.max(0, activeRippleCount - 1);
      },
    });
  };

  document.addEventListener("click", blankClickRippleHandler, { passive: true });
}

function teardownBlankClickRipple() {
  if (!blankClickRippleHandler) return;
  document.removeEventListener("click", blankClickRippleHandler);
  blankClickRippleHandler = null;
}

function lockRouteTransitionScroll() {
  routeTransitionDepth += 1;
  lock();
}

function unlockRouteTransitionScroll() {
  routeTransitionDepth = Math.max(0, routeTransitionDepth - 1);
  if (routeTransitionDepth > 0 || isStudioOpen.value) return;
  unlock();
}

function getModeFromAttr(value) {
  const mode = String(value || "").toLowerCase();
  if (
    mode === "view" ||
    mode === "explore" ||
    mode === "text" ||
    mode === "drag"
  )
    return mode;
  return "default";
}

function updateCursorFromTarget(target) {
  if (!target) {
    activeCursorTarget = null;
    setCursorMagneticTarget(null);
    setCursorMode("default", "");
    return;
  }

  const attrMode = target.getAttribute("data-cursor");
  const attrLabel = target.getAttribute("data-cursor-label") || "";
  const mode = getModeFromAttr(attrMode || "view");
  setCursorMode(mode, attrLabel);

  const magnetic =
    target.hasAttribute("data-cursor-magnetic") ||
    target.matches(
      "button, a, [role='button'], [data-cursor='view'], [data-cursor='explore'], [data-cursor='drag']",
    );

  activeCursorTarget = magnetic ? target : null;
  if (activeCursorTarget) {
    setCursorMagneticTarget(activeCursorTarget);
  } else {
    setCursorMagneticTarget(null);
  }
}

function flushPointerTarget() {
  pointerMoveRafId = 0;
  const target = queuedPointerTarget;

  if (!target) {
    activeCursorTarget = null;
    clearCursorHover();
    return;
  }

  if (target.matches?.("input, textarea, [contenteditable='true']")) {
    activeCursorTarget = null;
    setCursorMagneticTarget(null);
    setCursorMode("text", "");
    return;
  }

  if (target.hasAttribute?.("data-cursor")) {
    updateCursorFromTarget(target);
    return;
  }

  updateCursorFromTarget(target);
}

function attachPointerEnhancements() {
  if (pointerMoveHandler || !supportsPointerEffects.value) return;

  setupBlankClickRipple();

  pointerMoveHandler = (event) => {
    queuedPointerTarget = event.target?.closest?.(
      "[data-cursor], button, a, [role='button'], input, textarea, [contenteditable='true']",
    ) || null;

    if (pointerMoveRafId) return;
    pointerMoveRafId = window.requestAnimationFrame(flushPointerTarget);
  };

  window.addEventListener("pointermove", pointerMoveHandler, { passive: true });
}

function detachPointerEnhancements() {
  if (pointerMoveHandler) {
    window.removeEventListener("pointermove", pointerMoveHandler);
  }
  pointerMoveHandler = null;
  queuedPointerTarget = null;

  if (pointerMoveRafId) {
    window.cancelAnimationFrame(pointerMoveRafId);
    pointerMoveRafId = 0;
  }

  teardownBlankClickRipple();
}

function scheduleCursorMount() {
  if (cursorComponentReady.value || !supportsPointerEffects.value) return;
  cancelIdleTask(cursorIdleTask);
  cursorIdleTask = scheduleIdleTask(() => {
    cursorComponentReady.value = true;
  }, 900);
}

watch(
  supportsPointerEffects,
  (enabled) => {
    if (enabled) {
      scheduleCursorMount();
      attachPointerEnhancements();
      return;
    }

    detachPointerEnhancements();
    clearCursorHover();
    setCursorMagneticTarget(null);
    setCursorMode("default", "");
  },
  { immediate: true },
);

watch(
  shouldRenderCustomCursor,
  (enabled) => {
    setCursorEnabled(enabled);
    if (!enabled) {
      clearCursorHover();
      setCursorMagneticTarget(null);
    }
  },
  { immediate: true },
);

watch(
  [isSafari, isIOS, isWebKit],
  ([safari, ios, webkit]) => {
    document.documentElement.classList.toggle("is-safari", safari);
    document.documentElement.classList.toggle("is-ios", ios);
    document.documentElement.classList.toggle("is-webkit", webkit);
  },
  { immediate: true },
);

watch(
  isPerformanceLite,
  (lite) => {
    document.documentElement.classList.toggle("perf-lite", lite);
  },
  { immediate: true },
);

onMounted(() => {
  rootStyle.setProperty("--scroll-progress", "0");
  scheduleGlobalWarmth(0);
  lenisIdleTask = scheduleIdleTask(() => {
    initLenis();
  }, 700);

  if (supportsPointerEffects.value) {
    scheduleCursorMount();
  }

  removeStudioWatch = watch(
    isStudioOpen,
    (isOpen) => {
      const currentLenis = useLenis().lenis;
      if (isOpen) {
        currentLenis?.stop();
        lock();
      } else {
        currentLenis?.start();
        unlock();
      }
    },
    { immediate: true },
  );

  appScrollTrigger = ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate(self) {
      rootStyle.setProperty("--scroll-progress", self.progress.toFixed(4));
      scrollProgress.value = self.progress;
      scheduleGlobalWarmth(self.progress);
      if (
        edgeYToLeft &&
        edgeYToRight &&
        edgeWideScreenMedia?.matches &&
        !isPerformanceLite.value
      ) {
        const edgeY = self.scroll() * 0.05;
        edgeYToLeft(edgeY);
        edgeYToRight(edgeY);
      }
      if (inkFillEl.value) {
        inkFillEl.value.style.transform = `scaleY(${self.progress})`;
      }
    },
  });

  edgeWideScreenMedia = window.matchMedia("(min-width: 1600px)");
  if (paperEdgeLeftEl.value && paperEdgeRightEl.value && !isPerformanceLite.value) {
    edgeYToLeft = gsap.quickTo(paperEdgeLeftEl.value, "y", {
      duration: 0.45,
      ease: "power2.out",
    });
    edgeYToRight = gsap.quickTo(paperEdgeRightEl.value, "y", {
      duration: 0.45,
      ease: "power2.out",
    });
  }

  ambientVisibilityHandler = () => {
    globalAmbientEl.value?.classList.toggle("ambient-paused", document.hidden);
  };
  ambientVisibilityHandler();
  document.addEventListener("visibilitychange", ambientVisibilityHandler);

  if (!isPerformanceLite.value && !prefersReducedMotion.value) {
    easterEggsIdleTask = scheduleIdleTask(async () => {
      try {
        const { useEasterEggs } = await import("./composables/useEasterEggs");
        disposeEasterEggs = useEasterEggs();
      } catch {
        disposeEasterEggs = null;
      }
    }, 2200);
  }
});

onUnmounted(() => {
  removeStudioWatch?.();
  forceUnlock();
  cancelIdleTask(lenisIdleTask);
  cancelIdleTask(cursorIdleTask);
  cancelIdleTask(easterEggsIdleTask);
  appScrollTrigger?.kill();
  if (warmthRafId) {
    cancelAnimationFrame(warmthRafId);
    warmthRafId = 0;
  }
  pendingProgress = null;
  rootStyle.setProperty("--scroll-progress", "0");
  scrollProgress.value = 0;
  applyGlobalWarmth(0);
  detachPointerEnhancements();
  edgeYToLeft = null;
  edgeYToRight = null;
  edgeWideScreenMedia = null;
  if (ambientVisibilityHandler) {
    document.removeEventListener("visibilitychange", ambientVisibilityHandler);
    ambientVisibilityHandler = null;
  }
  disposeEasterEggs?.();
  disposeEasterEggs = null;
  globalAmbientEl.value?.classList.remove("ambient-paused");
  document.documentElement.classList.remove("perf-lite");
  document.documentElement.classList.remove("is-safari", "is-ios", "is-webkit");
  setCursorMagneticTarget(null);
  setCursorEnabled(false);
  destroyLenis();
});

onErrorCaptured(() => {
  forceUnlock();
  return false;
});

function onLeave(el, done) {
  const curtain = routeCurtainEl.value;
  lockRouteTransitionScroll();
  gsap.killTweensOf(el);
  gsap.killTweensOf(curtain);
  gsap
    .timeline({
      defaults: { overwrite: "auto" },
      onComplete: done,
    })
    .set(curtain, {
      opacity: 1,
      clipPath: "inset(0 0 0 0)",
    })
    .to(el, {
      opacity: 0,
      y: -40,
      duration: 0.38,
      ease: "power4.out",
    })
    .to(curtain, {
      clipPath: "inset(100% 0 0 0)",
      duration: 0.42,
      ease: "power4.inOut",
    });
}

function onBeforeEnter(el) {
  gsap.set(el, {
    opacity: 0,
    scale: 0.96,
    transformOrigin: "50% 50%",
  });
}

function onEnter(el, done) {
  const curtain = routeCurtainEl.value;
  gsap.killTweensOf(el);
  gsap.killTweensOf(curtain);
  gsap
    .timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        gsap.set(curtain, {
          opacity: 0,
          clipPath: "inset(100% 0 0 0)",
        });
        gsap.set(el, { clearProps: "transform" });
        unlockRouteTransitionScroll();
        ScrollTrigger.refresh();
        done();
      },
    })
    .set(curtain, {
      opacity: 1,
      clipPath: "inset(0 0 100% 0)",
    })
    .to(curtain, {
      clipPath: "inset(0 0 0 0)",
      duration: 0.6,
      ease: "power4.inOut",
    })
    .to(
      el,
      {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: "power3.out",
      },
      "-=0.03",
    )
    .to(
      curtain,
      {
        clipPath: "inset(100% 0 0 0)",
        duration: 0.48,
        ease: "power4.inOut",
      },
      "<+0.08",
    );
}
</script>

<style>
:root {
  --accent-soft: color-mix(in srgb, var(--accent) 50%, #ffd7c7);
  --accent-20: color-mix(in srgb, var(--accent) 20%, transparent);
  --accent-40: color-mix(in srgb, var(--accent) 40%, transparent);
}

@keyframes ambientDrift1 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(4vw, 3vh) scale(1.05);
  }
}

@keyframes ambientDrift2 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(-4vw, -3vh) scale(1.08);
  }
}

.ambient-orb-1 {
  animation: ambientDrift1 28s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
}

.ambient-orb-2 {
  animation: ambientDrift2 35s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
}

#global-ambient.ambient-paused .ambient-orb-1,
#global-ambient.ambient-paused .ambient-orb-2 {
  animation: none !important;
}

body.what-i-build-dark .ambient-orb-1,
body.what-i-build-dark .ambient-orb-2 {
  mix-blend-mode: screen;
  opacity: 0.3;
}

#global-ambient.ambient-lite .ambient-orb-1,
#global-ambient.ambient-lite .ambient-orb-2 {
  opacity: 0.42;
  animation-duration: 42s;
  filter: blur(78px);
}

.global-noise-overlay {
  opacity: 0.03;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
  background-repeat: repeat;
}

.global-noise-overlay.noise-lite {
  opacity: 0.018;
}

@media (prefers-reduced-motion: reduce) {
  .ambient-orb-1,
  .ambient-orb-2 {
    animation: none !important;
  }

  .global-noise-overlay {
    display: block;
  }
}

.studio-fade-enter-active,
.studio-fade-leave-active {
  transition:
    opacity 0.6s,
    backdrop-filter 0.6s;
}

.studio-fade-enter-from,
.studio-fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.paper-edge {
  display: none;
  background: rgba(74, 59, 50, 0.03);
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='420' viewBox='0 0 20 420'%3E%3Cdefs%3E%3Cfilter id='tear' x='-60%25' y='-5%25' width='220%25' height='110%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.018 0.9' numOctaves='2' seed='8' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='5' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M0 0H12Q16 14 12 28T12 56T12 84T12 112T12 140T12 168T12 196T12 224T12 252T12 280T12 308T12 336T12 364T12 392T12 420H0Z' fill='black' filter='url(%23tear)'/%3E%3C/svg%3E");
  mask-size: 20px 420px;
  mask-repeat: repeat-y;
  mask-position: left top;
  will-change: transform;
}

.paper-edge-right {
  transform: scaleX(-1);
  transform-origin: center center;
}

.paper-edge.paper-edge-lite {
  opacity: 0.55;
}

.progress-inkwell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 48px;
  border: 1px solid rgba(74, 59, 50, 0.15);
  border-radius: 14px;
  background: rgba(253, 252, 248, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition:
    color 360ms cubic-bezier(0.25, 1, 0.2, 1),
    border-color 360ms cubic-bezier(0.25, 1, 0.2, 1),
    background-color 360ms cubic-bezier(0.25, 1, 0.2, 1),
    transform 360ms cubic-bezier(0.25, 1, 0.2, 1);
  transform-origin: 50% 82%;
}

.progress-inkwell:hover,
.progress-inkwell:focus-visible {
  color: #2d2422;
  border-color: rgba(74, 59, 50, 0.28);
  background: rgba(253, 252, 248, 0.88);
  animation: inkwellWobble 560ms cubic-bezier(0.65, 0, 0.35, 1);
}

@keyframes inkwellWobble {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
  75% {
    transform: rotate(-2deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@media (min-width: 1280px) {
  .paper-edge {
    display: block;
  }
}
</style>
