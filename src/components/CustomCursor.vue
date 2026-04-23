<template>
  <div v-if="isActive" class="pointer-events-none fixed inset-0 z-[9999]">
    <div
      v-for="dotIndex in trailCount"
      :key="`trail-dot-${dotIndex - 1}`"
      :ref="(node) => setTrailDotRef(node, dotIndex - 1)"
      class="trail-dot pointer-events-none fixed left-0 top-0 z-[9998] h-[4px] w-[4px] rounded-full"
      aria-hidden="true"
    />
    <div
      ref="cursorEl"
      class="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full"
    >
      <span
        ref="labelEl"
        class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] font-mono font-medium uppercase tracking-[0.2em] text-[#2D2422]"
      >
        {{ centerLabel }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { gsap } from "gsap";
import { useCustomCursor } from "../composables/useCustomCursor";

const { cursorState } = useCustomCursor();

const cursorEl = ref(null);
const labelEl = ref(null);
const supportsFinePointer = ref(false);
const trailDotRefs = ref([]);
const trailCount = 8;
const trailOpacities = [0.6, 0.5, 0.4, 0.3, 0.22, 0.15, 0.1, 0.05];
const trailScales = [1, 0.9, 0.8, 0.7, 0.58, 0.48, 0.38, 0.3];
const trailLerpFactors = [0.35, 0.32, 0.29, 0.26, 0.23, 0.2, 0.18, 0.15];

let removePointerQueryListener = null;
let removeMoveListener = null;
let removeResizeListener = null;
let removeMotionQueryListener = null;
let xTo = null;
let yTo = null;
let shapeTween = null;
let labelTween = null;
let currentPointerX = window.innerWidth / 2;
let currentPointerY = window.innerHeight / 2;
let trailRaf = 0;
let trailNodes = [];
let trailState = [];
let trailVisibility = 1;
let trailTargetVisibility = 1;
let reducedMotion = false;

const isActive = computed(
  () => supportsFinePointer.value && cursorState.isEnabled,
);
const centerLabel = computed(() => {
  if (cursorState.cursorLabel) return cursorState.cursorLabel;
  if (cursorState.cursorMode === "view") return "VIEW";
  if (cursorState.cursorMode === "drag") return "DRAG";
  if (cursorState.cursorMode === "close") return "CLOSE";
  return "";
});
const shouldShowLabel = computed(() =>
  ["view", "drag", "close"].includes(cursorState.cursorMode),
);

function getShape(mode) {
  const interactive = {
    width: 64,
    height: 64,
    borderRadius: "50%",
    backgroundColor: "color-mix(in srgb, var(--accent) 85%, transparent)",
    backdropFilter: "blur(4px)",
  };
  if (mode === "text") {
    return {
      width: 2,
      height: 20,
      borderRadius: "0%",
      backgroundColor: "#5C4D49",
      backdropFilter: "blur(0px)",
    };
  }
  if (mode === "view" || mode === "drag" || mode === "close") return interactive;
  return {
    width: 12,
    height: 12,
    borderRadius: "50%",
    backgroundColor: "var(--accent)",
    backdropFilter: "blur(0px)",
  };
}

function animateCursorMode() {
  if (!cursorEl.value) return;
  const shape = getShape(cursorState.cursorMode);
  shapeTween?.kill();
  shapeTween = gsap.to(cursorEl.value, {
    width: shape.width,
    height: shape.height,
    borderRadius: shape.borderRadius,
    backgroundColor: shape.backgroundColor,
    backdropFilter: shape.backdropFilter,
    duration: 0.7,
    ease: "elastic.out(1, 0.4)",
    overwrite: "auto",
  });
  if (labelEl.value) {
    labelTween?.kill();
    labelTween = gsap.to(labelEl.value, {
      opacity: shouldShowLabel.value ? 1 : 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.4)",
      overwrite: "auto",
    });
  }
  const enlargedModes = ["hover", "view", "drag"];
  trailTargetVisibility = enlargedModes.includes(cursorState.cursorMode) ? 0 : 1;
}

function setTrailDotRef(node, index) {
  trailDotRefs.value[index] = node || null;
}

function startTrailLoop() {
  if (trailRaf || reducedMotion || !isActive.value) return;
  trailNodes = trailDotRefs.value.filter(Boolean);
  if (!trailNodes.length) return;
  if (!trailState.length) {
    trailState = Array.from({ length: trailCount }, () => ({
      x: currentPointerX,
      y: currentPointerY,
    }));
  }

  const tickTrail = () => {
    trailVisibility += (trailTargetVisibility - trailVisibility) * 0.18;
    let prevX = currentPointerX;
    let prevY = currentPointerY;

    for (let i = 0; i < trailState.length; i += 1) {
      const dot = trailState[i];
      const lerp = trailLerpFactors[i];
      dot.x += (prevX - dot.x) * lerp;
      dot.y += (prevY - dot.y) * lerp;
      prevX = dot.x;
      prevY = dot.y;

      const node = trailNodes[i];
      if (!node) continue;
      const scale = trailScales[i] * trailVisibility;
      const opacity = trailOpacities[i] * trailVisibility;
      node.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      node.style.opacity = `${opacity}`;
    }

    trailRaf = window.requestAnimationFrame(tickTrail);
  };

  trailRaf = window.requestAnimationFrame(tickTrail);
}

function stopTrailLoop() {
  if (trailRaf) {
    window.cancelAnimationFrame(trailRaf);
    trailRaf = 0;
  }
  trailNodes.forEach((node) => {
    node.style.opacity = "0";
  });
}

function mountTracking() {
  if (!cursorEl.value || removeMoveListener) return;
  xTo = gsap.quickTo(cursorEl.value, "x", {
    duration: 0.15,
    ease: "power3.out",
  });
  yTo = gsap.quickTo(cursorEl.value, "y", {
    duration: 0.15,
    ease: "power3.out",
  });

  const clamp = gsap.utils.clamp;
  const onMove = (event) => {
    currentPointerX = event.clientX;
    currentPointerY = event.clientY;
    let targetX = event.clientX;
    let targetY = event.clientY;

    const magnetic = cursorState.magneticTarget;
    if (magnetic) {
      const rect = magnetic.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radius = Math.max(rect.width, rect.height) * 1.1 + 56;
      const dxCenter = centerX - event.clientX;
      const dyCenter = centerY - event.clientY;
      const centerDist = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
      const edgeX = clamp(rect.left, rect.right, event.clientX);
      const edgeY = clamp(rect.top, rect.bottom, event.clientY);
      const edgeDx = edgeX - event.clientX;
      const edgeDy = edgeY - event.clientY;

      if (centerDist < radius) {
        const pull = 1 - centerDist / radius;
        targetX = event.clientX + edgeDx * pull * 0.82 + dxCenter * pull * 0.18;
        targetY = event.clientY + edgeDy * pull * 0.82 + dyCenter * pull * 0.18;
      }
    }

    xTo(targetX);
    yTo(targetY);
  };

  window.addEventListener("mousemove", onMove, { passive: true });
  removeMoveListener = () => {
    window.removeEventListener("mousemove", onMove);
    removeMoveListener = null;
  };

  xTo(currentPointerX);
  yTo(currentPointerY);
  if (trailState.length) {
    for (let i = 0; i < trailState.length; i += 1) {
      trailState[i].x = currentPointerX;
      trailState[i].y = currentPointerY;
    }
  }
  trailTargetVisibility = ["hover", "view", "drag"].includes(cursorState.cursorMode)
    ? 0
    : 1;
  trailVisibility = trailTargetVisibility;
  startTrailLoop();
}

function unmountTracking() {
  removeMoveListener?.();
  xTo = null;
  yTo = null;
  stopTrailLoop();
  shapeTween?.kill();
  labelTween?.kill();
  shapeTween = null;
  labelTween = null;
}

watch(
  () => isActive.value,
  async (active) => {
    if (!active) {
      unmountTracking();
      return;
    }
    await nextTick();
    mountTracking();
    animateCursorMode();
  },
  { immediate: true },
);

watch(
  () => [cursorState.cursorMode, cursorState.cursorLabel, isActive.value],
  () => {
    if (!isActive.value) return;
    animateCursorMode();
  },
  { immediate: true },
);

onMounted(() => {
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  supportsFinePointer.value = mq.matches;
  const onQueryChange = (event) => {
    supportsFinePointer.value = event.matches;
  };
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onQueryChange);
    removePointerQueryListener = () => mq.removeEventListener("change", onQueryChange);
  } else {
    mq.addListener(onQueryChange);
    removePointerQueryListener = () => mq.removeListener(onQueryChange);
  }

  const onResize = () => {
    currentPointerX = window.innerWidth / 2;
    currentPointerY = window.innerHeight / 2;
  };
  window.addEventListener("resize", onResize, { passive: true });
  removeResizeListener = () => window.removeEventListener("resize", onResize);

  const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion = motionMq.matches;
  const onMotionChange = (event) => {
    reducedMotion = event.matches;
    if (reducedMotion) {
      stopTrailLoop();
    } else if (isActive.value) {
      startTrailLoop();
    }
  };
  if (typeof motionMq.addEventListener === "function") {
    motionMq.addEventListener("change", onMotionChange);
    removeMotionQueryListener = () =>
      motionMq.removeEventListener("change", onMotionChange);
  } else {
    motionMq.addListener(onMotionChange);
    removeMotionQueryListener = () => motionMq.removeListener(onMotionChange);
  }
});

onUnmounted(() => {
  removePointerQueryListener?.();
  removeResizeListener?.();
  removeMotionQueryListener?.();
  unmountTracking();
});
</script>

<style scoped>
.liquid-cursor-label {
  opacity: 0;
}

.trail-dot {
  background: var(--accent);
  will-change: transform, opacity;
}
</style>