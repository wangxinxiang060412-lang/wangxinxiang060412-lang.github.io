<template>
  <section
    id="hero"
    ref="heroEl"
    class="relative h-screen w-full overflow-hidden bg-transparent font-antialiased tracking-tight"
  >
    <div
      class="pointer-events-none absolute inset-0 z-[1]"
      :style="heroWarmOverlayStyle"
      aria-hidden="true"
    />
    <canvas
      ref="floatCanvasEl"
      class="pointer-events-none absolute inset-0 z-[2]"
      aria-hidden="true"
    />
    <canvas
      ref="inkCanvasEl"
      class="pointer-events-none absolute inset-0 z-[3] opacity-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.25,1,0.2,1)]"
      aria-hidden="true"
    />

    <div
      ref="loaderWrapper"
      class="pointer-events-none absolute inset-0 z-[100] flex items-center justify-center"
    >
      <div
        ref="paperLayer1"
        class="paper-layer absolute inset-0 bg-[#FFDAB9] will-change-transform"
        style="transform-origin: top center"
      />
      <div
        ref="paperLayer2"
        class="paper-layer absolute inset-0 bg-[#FFE4E1] will-change-transform"
        style="transform-origin: top center"
      />
      <div
        ref="paperLayer3"
        class="paper-layer absolute inset-0 bg-[#FDFCF8] will-change-transform"
        style="transform-origin: top center"
      />
    </div>

    <div
      ref="heroContentWrapper"
      class="relative z-10 flex h-screen w-full flex-col items-center justify-center text-center px-6"
    >
      <p
        ref="introRowEl"
        class="hero-ui min-h-[14px] text-sm font-light leading-[14px] tracking-[0.3em] uppercase text-[#4A3B32]"
      >
        {{ heroGreeting }}
      </p>

      <div
        ref="nameLensHostEl"
        class="relative mt-4 w-full max-w-[1300px]"
        @mouseenter="onNameLensEnter"
        @mousemove="onNameLensMove"
        @mouseleave="onNameLensLeave"
      >
        <div ref="nameRowEl" class="hero-name-svg-wrap">
          <svg
            class="hero-name-svg"
            viewBox="0 0 1300 220"
            role="img"
            aria-label="WANG XINXIANG"
          >
            <defs>
              <filter id="hero-name-fluid-filter" x="-5%" y="-15%" width="110%" height="130%">
                <feTurbulence
                  ref="nameTurbulenceEl"
                  type="fractalNoise"
                  baseFrequency="0.015"
                  numOctaves="2"
                  seed="1"
                  result="nameNoise"
                />
                <feDisplacementMap
                  ref="nameDisplacementEl"
                  in="SourceGraphic"
                  in2="nameNoise"
                  scale="6"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
            <text
              class="hero-name-svg-text"
              x="50%"
              y="50%"
              text-anchor="middle"
              dominant-baseline="middle"
              fill="#2D2422"
              filter="url(#hero-name-fluid-filter)"
            >
              WANG XINXIANG
            </text>
          </svg>
        </div>
        <div
          ref="nameLensEl"
          class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[10px] bg-[#FF7E67]"
          :class="lensActive ? 'opacity-100' : 'opacity-0'"
          :style="{
            clipPath: `circle(70px at ${lensX}px ${lensY}px)`,
            WebkitClipPath: `circle(70px at ${lensX}px ${lensY}px)`,
            transition: 'opacity 0.3s',
          }"
        >
          <svg class="hero-name-svg" viewBox="0 0 1300 220" aria-hidden="true">
            <text
              class="hero-lens-svg-text"
              x="50%"
              y="50%"
              text-anchor="middle"
              dominant-baseline="middle"
              fill="#FFFFFF"
            >
              你好，我叫王鑫翔
            </text>
          </svg>
        </div>
      </div>

      <p
        ref="roleRowEl"
        class="hero-ui mt-4 min-h-[18px] text-base md:text-lg font-semibold leading-[18px] md:min-h-[20px] md:leading-[20px] tracking-wider uppercase text-[#4A3B32]/85"
      >
        CREATIVE DEVELOPER // ART ENGINEER
      </p>

      <div
        ref="scrollCtaWrapEl"
        class="mt-10 inline-flex flex-col items-center transition-opacity duration-500 ease-out"
        :class="hasScrolled ? 'pointer-events-none opacity-0' : 'opacity-100'"
      >
        <a
          ref="scrollCtaEl"
          href="#intro"
          data-cursor="view"
          class="group inline-flex flex-col items-center no-underline"
          @click="onScrollCtaClick"
        >
          <span
            class="font-mono mb-[20px] text-[8px] tracking-[0.5em] text-[#4A3B32]/30"
          >
            scroll to explore
          </span>
          <svg
            ref="scrollArrowEl"
            class="h-4 w-4 overflow-visible"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 8 L12 14 L18 8"
              stroke="rgba(74,59,50,0.5)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
    <div
      ref="stampEl"
      class="hero-stamp pointer-events-none absolute top-10 right-10 z-20"
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" width="84" height="84">
        <defs>
          <filter id="stamp-ink">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" />
            <feDisplacementMap in="SourceGraphic" scale="2" />
          </filter>
        </defs>
        <g filter="url(#stamp-ink)" stroke="#C03823" stroke-width="2" fill="none">
          <circle cx="60" cy="60" r="48" />
          <circle cx="60" cy="60" r="40" stroke-width="1" />
          <text
            x="60"
            y="54"
            text-anchor="middle"
            font-family="Clash Display"
            font-size="14"
            fill="#C03823"
            font-weight="700"
          >
            WX
          </text>
          <text
            x="60"
            y="72"
            text-anchor="middle"
            font-family="JetBrains Mono"
            font-size="7"
            fill="#C03823"
            letter-spacing="0.1em"
          >
            2026 · CRAFT
          </text>
        </g>
      </svg>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
  onErrorCaptured,
  nextTick,
} from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cancelIdleTask, scheduleIdleTask } from "../composables/useIdleTask";
import { useIsLowEndDevice } from "../composables/useIsLowEndDevice";
import { useLenis } from "../composables/useLenis";
import { useMagnetic } from "../composables/useMagnetic";
import { useReducedMotion } from "../composables/useReducedMotion";
import { useScrollLock } from "../composables/useScrollLock";

gsap.registerPlugin(ScrollTrigger);

const emit = defineEmits(["intro-complete"]);
const props = defineProps({
  startIntro: { type: Boolean, default: true },
  skipIntro: { type: Boolean, default: false },
});
const { prefersReducedMotion } = useReducedMotion();
const { isLowEndDevice } = useIsLowEndDevice();
const shouldReduceHeroMotion = computed(
  () => prefersReducedMotion.value || isLowEndDevice.value,
);

const heroEl = ref(null);
const loaderWrapper = ref(null);
const paperLayer1 = ref(null);
const paperLayer2 = ref(null);
const paperLayer3 = ref(null);
const heroContentWrapper = ref(null);
const introRowEl = ref(null);
const nameRowEl = ref(null);
const roleRowEl = ref(null);
const scrollCtaWrapEl = ref(null);
const scrollCtaEl = ref(null);
const scrollArrowEl = ref(null);
const stampEl = ref(null);
const nameLensHostEl = ref(null);
const nameLensEl = ref(null);
const nameTurbulenceEl = ref(null);
const nameDisplacementEl = ref(null);
const floatCanvasEl = ref(null);
const inkCanvasEl = ref(null);
const lensActive = ref(false);
const lensX = ref(-1000);
const lensY = ref(-1000);
const hasScrolled = ref(false);
const currentHour = new Date().getHours();

function getDayPhase(hour) {
  if (hour >= 6 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 17) return "afternoon";
  if (hour >= 18 && hour <= 22) return "evening";
  return "night";
}

const dayPhase = getDayPhase(currentHour);

const greetingByPhase = {
  morning: "GOOD MORNING, I AM",
  afternoon: "GOOD AFTERNOON, I AM",
  evening: "GOOD EVENING, I AM",
  night: "STILL CODING, I AM",
};

const warmthByPhase = {
  morning: "rgba(255,220,180,0.06)",
  afternoon: "transparent",
  evening: "rgba(255,160,120,0.08)",
  night: "rgba(180,160,200,0.06)",
};

const BASE_DISPLACEMENT_SCALE = 6;
const ACTIVE_DISPLACEMENT_SCALE = 14;
const heroGreeting = greetingByPhase[dayPhase];
const heroWarmOverlayStyle = {
  background: `linear-gradient(180deg, ${warmthByPhase[dayPhase]} 0%, transparent 68%)`,
};
const { forceUnlock } = useScrollLock();

/** Cached host rect: avoid layout thrash on every mousemove */
const lensHostRect = { left: 0, top: 0 };
let lensPendingClientX = 0;
let lensPendingClientY = 0;
let lensMoveRafId = 0;

function refreshLensHostRect() {
  const host = nameLensHostEl.value;
  if (!host) return;
  const r = host.getBoundingClientRect();
  lensHostRect.left = r.left;
  lensHostRect.top = r.top;
}

function flushLensPosition() {
  lensMoveRafId = 0;
  lensX.value = lensPendingClientX - lensHostRect.left;
  lensY.value = lensPendingClientY - lensHostRect.top;
}

function scheduleLensMove(clientX, clientY) {
  lensPendingClientX = clientX;
  lensPendingClientY = clientY;
  if (lensMoveRafId) return;
  lensMoveRafId = window.requestAnimationFrame(flushLensPosition);
}

function onNameLensEnter(e) {
  refreshLensHostRect();
  lensActive.value = true;
  if (motionAllowed) {
    tweenDisplacementScale(ACTIVE_DISPLACEMENT_SCALE, 0.6, "sine.inOut");
  }
  scheduleLensMove(e.clientX, e.clientY);
}

function onNameLensMove(e) {
  if (!nameLensHostEl.value) return;
  scheduleLensMove(e.clientX, e.clientY);
}

function onNameLensLeave() {
  if (lensMoveRafId) {
    window.cancelAnimationFrame(lensMoveRafId);
    lensMoveRafId = 0;
  }
  lensActive.value = false;
  tweenDisplacementScale(
    motionAllowed ? BASE_DISPLACEMENT_SCALE : 0,
    1,
    "elastic.out(1, 0.45)",
  );
}

function playHelloLensSweep() {
  const host = nameLensHostEl.value;
  if (!host) return;
  const rect = host.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  lensHostRect.left = rect.left;
  lensHostRect.top = rect.top;
  lensActive.value = true;
  if (motionAllowed) {
    tweenDisplacementScale(ACTIVE_DISPLACEMENT_SCALE, 0.6, "sine.inOut");
  }
  gsap.fromTo(
    { x: 0 },
    {
      x: rect.width,
      duration: 2,
      ease: "power2.inOut",
      onUpdate() {
        const x = this.targets()[0].x;
        lensX.value = x;
        lensY.value = rect.height * 0.52;
      },
    },
  );
  gsap.delayedCall(2.05, () => {
    lensActive.value = false;
  });
}

useMagnetic(scrollCtaEl, {
  wrapperRef: scrollCtaWrapEl,
  maxOffset: 24,
  duration: 0.24,
  cursorLabel: "VIEW",
});

function onScrollCtaClick(event) {
  const target = document.getElementById("intro");
  if (!target) return;
  event.preventDefault();
  const y = target.getBoundingClientRect().top + window.scrollY - 48;
  const { lenis } = useLenis();
  if (lenis) {
    lenis.scrollTo(y, {
      duration: 1.05,
      easing: gsap.parseEase("cubic-bezier(0.76, 0, 0.24, 1)"),
    });
    return;
  }
  window.scrollTo({ top: y, behavior: "smooth" });
}

let ctx;
let runIntro = null;
let introStarted = false;
let postIntroEnhancementsReady = false;
let postIntroIdleTask = null;
let bootPostIntroSystems = null;
let noiseAnimFrame = 0;
let floaters = [];
let canvasCtx = null;
let canvasWidth = 0;
let canvasHeight = 0;
let motionAllowed = !shouldReduceHeroMotion.value;
let motionMedia = null;
let canvasVisibilityHandler = null;
let targetParallaxX = 0;
let targetParallaxY = 0;
let currentParallaxX = 0;
let currentParallaxY = 0;
let detachCanvasListeners = null;
let arrowBreathTween = null;
let detachScrollHintListener = null;
let nameFluidTween = null;
let nameSeedFrame = 0;
let nameSeedValue = 1;
let detachNameMotionListener = null;
let detachHelloListener = null;
let inkCtx = null;
let inkWidth = 0;
let inkHeight = 0;
let inkDpr = 1;
let inkFrame = 0;
let inkBlobs = [];
let inkActive = false;
let inkCanGrow = false;
let tearAudioCtx = null;
let detachInkListeners = null;
let inkViewportTrigger = null;
let forceHeroReplay = false;

const INK_COLOR = "rgba(255,176,133,0.055)";
const INK_POINTS = 12;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createFloaters() {
  const count = Math.floor(rand(15, 21));
  const shapes = ["circle", "triangle", "cross"];
  const colors = ["rgba(255,176,133,0.08)", "rgba(255,126,103,0.06)"];
  return Array.from({ length: count }, (_, i) => {
    const size = rand(4, 20);
    const depth = rand(0.35, 1);
    return {
      id: i,
      shape: shapes[Math.floor(rand(0, shapes.length))],
      color: colors[Math.floor(rand(0, colors.length))],
      size,
      x: rand(0, canvasWidth),
      y: rand(0, canvasHeight),
      driftY: rand(-0.16, -0.04),
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.0018, 0.0018),
      depth,
      parallaxStrength: rand(2, 10) * depth,
      wobblePhase: rand(0, Math.PI * 2),
      wobbleSpeed: rand(0.003, 0.009),
      wobbleAmp: rand(0.06, 0.28),
    };
  });
}

function drawShape(ctx2d, fl) {
  const s = fl.size;
  if (fl.shape === "circle") {
    ctx2d.beginPath();
    ctx2d.arc(0, 0, s * 0.5, 0, Math.PI * 2);
    ctx2d.fill();
    return;
  }
  if (fl.shape === "triangle") {
    ctx2d.beginPath();
    ctx2d.moveTo(0, -s * 0.58);
    ctx2d.lineTo(s * 0.5, s * 0.45);
    ctx2d.lineTo(-s * 0.5, s * 0.45);
    ctx2d.closePath();
    ctx2d.fill();
    return;
  }
  ctx2d.fillRect(-s * 0.5, -s * 0.13, s, s * 0.26);
  ctx2d.fillRect(-s * 0.13, -s * 0.5, s * 0.26, s);
}

function resizeCanvas() {
  const canvas = floatCanvasEl.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = rect.width;
  canvasHeight = rect.height;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  if (canvasCtx) {
    canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  floaters = createFloaters();
}

function renderFloaters() {
  if (!canvasCtx || !motionAllowed) return;
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  currentParallaxX += (targetParallaxX - currentParallaxX) * 0.055;
  currentParallaxY += (targetParallaxY - currentParallaxY) * 0.055;

  for (let i = 0; i < floaters.length; i += 1) {
    const fl = floaters[i];
    fl.y += fl.driftY * fl.depth;
    fl.rotation += fl.rotationSpeed;
    fl.wobblePhase += fl.wobbleSpeed;
    fl.x += Math.sin(fl.wobblePhase) * fl.wobbleAmp;

    if (fl.y < -28) {
      fl.y = canvasHeight + rand(8, 36);
      fl.x = rand(0, canvasWidth);
    }
    if (fl.x < -32) fl.x = canvasWidth + rand(6, 20);
    if (fl.x > canvasWidth + 32) fl.x = -rand(6, 20);

    canvasCtx.save();
    canvasCtx.translate(
      fl.x + currentParallaxX * fl.parallaxStrength,
      fl.y + currentParallaxY * fl.parallaxStrength,
    );
    canvasCtx.rotate(fl.rotation);
    canvasCtx.fillStyle = fl.color;
    drawShape(canvasCtx, fl);
    canvasCtx.restore();
  }
}

function tickFloaters() {
  if (document.hidden || !motionAllowed) {
    noiseAnimFrame = 0;
    return;
  }
  renderFloaters();
  noiseAnimFrame = window.requestAnimationFrame(tickFloaters);
}

function stopFloaters() {
  if (noiseAnimFrame) {
    window.cancelAnimationFrame(noiseAnimFrame);
    noiseAnimFrame = 0;
  }
  if (canvasCtx) {
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  }
}

function setupFloatCanvas() {
  const canvas = floatCanvasEl.value;
  const section = heroEl.value;
  if (!canvas || !section) return;

  canvasCtx = canvas.getContext("2d");
  if (!canvasCtx) return;

  motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionAllowed = !shouldReduceHeroMotion.value;

  const onPointerMove = (event) => {
    const rect = section.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
    const ny = ((event.clientY - rect.top) / (rect.height || 1)) * 2 - 1;
    targetParallaxX = nx * 0.8;
    targetParallaxY = ny * 0.8;
  };

  const onPointerLeave = () => {
    targetParallaxX = 0;
    targetParallaxY = 0;
  };

  const onMediaChange = (event) => {
    motionAllowed = !event.matches && !isLowEndDevice.value;
    if (motionAllowed) {
      resizeCanvas();
      if (!noiseAnimFrame) tickFloaters();
      heroEl.value?.style.removeProperty("background-image");
      heroEl.value?.style.removeProperty("background-size");
      heroEl.value?.style.removeProperty("background-position");
      heroEl.value?.style.removeProperty("background-repeat");
      if (inkCanvasEl.value) {
        gsap.set(inkCanvasEl.value, { opacity: 0 });
      }
      startInkLoop();
    } else {
      stopFloaters();
      stopInkLoop();
      if (inkCanvasEl.value) {
        gsap.set(inkCanvasEl.value, { opacity: 0 });
      }
      const staticInkUrl = createStaticInkPng();
      if (staticInkUrl && heroEl.value) {
        heroEl.value.style.backgroundImage = `url("${staticInkUrl}")`;
        heroEl.value.style.backgroundSize = "cover";
        heroEl.value.style.backgroundPosition = "center";
        heroEl.value.style.backgroundRepeat = "no-repeat";
      }
    }
  };
  let floatResizeTimer = 0;
  const onFloatResize = () => {
    clearTimeout(floatResizeTimer);
    floatResizeTimer = window.setTimeout(() => resizeCanvas(), 80);
  };

  resizeCanvas();
  if (motionAllowed) tickFloaters();

  window.addEventListener("resize", onFloatResize, { passive: true });
  section.addEventListener("pointermove", onPointerMove, { passive: true });
  section.addEventListener("pointerleave", onPointerLeave, { passive: true });
  motionMedia.addEventListener("change", onMediaChange);
  canvasVisibilityHandler = () => {
    if (document.hidden) {
      stopFloaters();
      return;
    }
    if (motionAllowed && !noiseAnimFrame) {
      tickFloaters();
    }
  };
  document.addEventListener("visibilitychange", canvasVisibilityHandler);

  detachCanvasListeners = () => {
    window.removeEventListener("resize", onFloatResize);
    clearTimeout(floatResizeTimer);
    floatResizeTimer = 0;
    section.removeEventListener("pointermove", onPointerMove);
    section.removeEventListener("pointerleave", onPointerLeave);
    motionMedia?.removeEventListener("change", onMediaChange);
    if (canvasVisibilityHandler) {
      document.removeEventListener("visibilitychange", canvasVisibilityHandler);
      canvasVisibilityHandler = null;
    }
  };
}

function setupScrollHintDismiss() {
  const onScroll = () => {
    if (hasScrolled.value || window.scrollY < 8) return;
    hasScrolled.value = true;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  detachScrollHintListener = () => {
    window.removeEventListener("scroll", onScroll);
    detachScrollHintListener = null;
  };
}

function startArrowBreath() {
  if (!scrollArrowEl.value || !motionAllowed || arrowBreathTween) return;
  gsap.set(scrollArrowEl.value, { y: 0, opacity: 0.7 });
  arrowBreathTween = gsap.to(scrollArrowEl.value, {
    y: 8,
    opacity: 0.3,
    duration: 2,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
}

function createInkBlob() {
  const cx = rand(inkWidth * 0.2, inkWidth * 0.8);
  const cy = rand(inkHeight * 0.2, inkHeight * 0.8);
  const maxRadius = rand(300, 500);
  const points = Array.from({ length: INK_POINTS }, (_, i) => {
    const angle = (Math.PI * 2 * i) / INK_POINTS;
    const jitter = rand(-15, 15);
    return {
      angle,
      offset: jitter,
      targetOffset: rand(-15, 15),
    };
  });
  return {
    cx,
    cy,
    radius: 0,
    maxRadius,
    growthRate: 0.15,
    points,
  };
}

function updateInkBlob(blob) {
  if (inkCanGrow && blob.radius < blob.maxRadius) {
    blob.radius = Math.min(blob.maxRadius, blob.radius + blob.growthRate);
  }
  for (let i = 0; i < blob.points.length; i += 1) {
    const point = blob.points[i];
    point.offset += (point.targetOffset - point.offset) * 0.002;
    if (Math.abs(point.targetOffset - point.offset) < 0.2) {
      point.targetOffset = rand(-15, 15);
    }
  }
}

function getBlobPoint(blob, index) {
  const point = blob.points[index];
  const r = blob.radius + point.offset;
  return {
    x: blob.cx + Math.cos(point.angle) * r,
    y: blob.cy + Math.sin(point.angle) * r,
  };
}

function drawInkBlob(blob) {
  if (!inkCtx || blob.radius <= 0) return;
  const gradient = inkCtx.createRadialGradient(
    blob.cx,
    blob.cy,
    blob.radius * 0.08,
    blob.cx,
    blob.cy,
    blob.radius,
  );
  gradient.addColorStop(0, INK_COLOR);
  gradient.addColorStop(1, "rgba(255,176,133,0.014)");

  inkCtx.save();
  inkCtx.fillStyle = gradient;
  inkCtx.beginPath();
  const first = getBlobPoint(blob, 0);
  inkCtx.moveTo(first.x, first.y);
  for (let i = 0; i < blob.points.length; i += 1) {
    const current = getBlobPoint(blob, i);
    const next = getBlobPoint(blob, (i + 1) % blob.points.length);
    const cp1 = {
      x: current.x + (next.x - current.x) * 0.38,
      y: current.y + (next.y - current.y) * 0.38,
    };
    const cp2 = {
      x: current.x + (next.x - current.x) * 0.72,
      y: current.y + (next.y - current.y) * 0.72,
    };
    inkCtx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, next.x, next.y);
  }
  inkCtx.closePath();
  inkCtx.fill();
  inkCtx.restore();
}

function renderInkFrame() {
  if (!inkCtx || !inkActive || !motionAllowed) return;
  inkCtx.clearRect(0, 0, inkWidth, inkHeight);
  inkCtx.globalCompositeOperation = "source-over";
  for (let i = 0; i < inkBlobs.length; i += 1) {
    const blob = inkBlobs[i];
    updateInkBlob(blob);
    drawInkBlob(blob);
  }
}

function tickInk() {
  renderInkFrame();
  if (inkActive && motionAllowed) {
    inkFrame = window.requestAnimationFrame(tickInk);
  } else {
    inkFrame = 0;
  }
}

function stopInkLoop() {
  if (inkFrame) {
    window.cancelAnimationFrame(inkFrame);
    inkFrame = 0;
  }
}

function startInkLoop() {
  if (!motionAllowed || !inkActive || inkFrame) return;
  tickInk();
}

function createStaticInkPng() {
  if (typeof document === "undefined") return "";
  const pngCanvas = document.createElement("canvas");
  pngCanvas.width = 1600;
  pngCanvas.height = 900;
  const ctx2d = pngCanvas.getContext("2d");
  if (!ctx2d) return "";
  for (let i = 0; i < 3; i += 1) {
    const x = rand(280, 1320);
    const y = rand(180, 720);
    const radius = rand(180, 360);
    const gradient = ctx2d.createRadialGradient(x, y, radius * 0.15, x, y, radius);
    gradient.addColorStop(0, "rgba(255,176,133,0.06)");
    gradient.addColorStop(1, "rgba(255,176,133,0.015)");
    ctx2d.fillStyle = gradient;
    ctx2d.beginPath();
    ctx2d.arc(x, y, radius, 0, Math.PI * 2);
    ctx2d.fill();
  }
  return pngCanvas.toDataURL("image/png");
}

function resizeInkCanvas() {
  const canvas = inkCanvasEl.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  inkDpr = Math.min(window.devicePixelRatio || 1, 2);
  inkWidth = rect.width;
  inkHeight = rect.height;
  canvas.width = Math.max(1, Math.round(rect.width * inkDpr));
  canvas.height = Math.max(1, Math.round(rect.height * inkDpr));
  if (inkCtx) {
    inkCtx.setTransform(inkDpr, 0, 0, inkDpr, 0, 0);
  }
  inkBlobs = Array.from({ length: Math.floor(rand(2, 4)) }, createInkBlob);
}

function setupInkCanvas() {
  const canvas = inkCanvasEl.value;
  const section = heroEl.value;
  if (!canvas || !section) return;

  inkCtx = canvas.getContext("2d");
  if (!inkCtx) return;
  resizeInkCanvas();
  renderInkFrame();

  if (!motionAllowed) {
    const staticInkUrl = createStaticInkPng();
    if (staticInkUrl) {
      section.style.backgroundImage = `url("${staticInkUrl}")`;
      section.style.backgroundSize = "cover";
      section.style.backgroundPosition = "center";
      section.style.backgroundRepeat = "no-repeat";
    }
    return;
  }

  gsap.set(canvas, { opacity: 0 });
}

function activateInkViewportLifecycle() {
  const section = heroEl.value;
  if (!section || !motionAllowed || inkViewportTrigger) return;

  inkViewportTrigger = ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      inkActive = self.isActive;
      if (inkActive) {
        startInkLoop();
      } else {
        stopInkLoop();
      }
    },
  });

  let inkResizeTimer = 0;
  const onInkResize = () => {
    clearTimeout(inkResizeTimer);
    inkResizeTimer = window.setTimeout(() => {
      resizeInkCanvas();
      renderInkFrame();
    }, 80);
  };
  window.addEventListener("resize", onInkResize, { passive: true });
  detachInkListeners = () => {
    window.removeEventListener("resize", onInkResize);
    clearTimeout(inkResizeTimer);
    inkResizeTimer = 0;
    inkViewportTrigger?.kill();
    inkViewportTrigger = null;
    detachInkListeners = null;
  };
}

function playPaperTearSound() {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!tearAudioCtx) tearAudioCtx = new AudioCtx();
  if (tearAudioCtx.state === "suspended") {
    tearAudioCtx.resume().catch(() => {});
  }
  const now = tearAudioCtx.currentTime;
  const duration = 0.28;
  const bufferSize = Math.floor(tearAudioCtx.sampleRate * duration);
  const buffer = tearAudioCtx.createBuffer(1, bufferSize, tearAudioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    const t = i / bufferSize;
    const envelope = Math.exp(-t * 8.2);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }
  const source = tearAudioCtx.createBufferSource();
  source.buffer = buffer;
  const filter = tearAudioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1850;
  filter.Q.value = 0.8;
  const gain = tearAudioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(tearAudioCtx.destination);
  source.start(now);
  source.stop(now + duration + 0.03);
}

function playStampThud() {
  if (typeof window === "undefined") return;
  const audioEnabled = window.audioEnabled === true;
  if (!audioEnabled || typeof window.playOnce !== "function") return;
  window.playOnce("stamp-thud");
}

function stopNameSeedLoop() {
  if (nameSeedFrame) {
    window.cancelAnimationFrame(nameSeedFrame);
    nameSeedFrame = 0;
  }
}

function tweenDisplacementScale(scale, duration, ease) {
  if (!nameDisplacementEl.value) return;
  gsap.to(nameDisplacementEl.value, {
    attr: { scale },
    duration,
    ease,
    overwrite: true,
  });
}

function setupNameFluidMotion(reduced) {
  const turbulenceEl = nameTurbulenceEl.value;
  const displacementEl = nameDisplacementEl.value;
  if (!turbulenceEl || !displacementEl) return;

  nameFluidTween?.kill();
  nameFluidTween = null;
  stopNameSeedLoop();

  const restingScale = reduced ? 0 : BASE_DISPLACEMENT_SCALE;
  turbulenceEl.setAttribute("baseFrequency", "0.015");
  turbulenceEl.setAttribute("seed", "1");
  displacementEl.setAttribute("scale", `${restingScale}`);

  if (reduced) return;

  nameFluidTween = gsap.fromTo(
    turbulenceEl,
    { attr: { baseFrequency: 0.012 } },
    {
      attr: { baseFrequency: 0.018 },
      duration: 4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    },
  );

  const evolveSeed = () => {
    nameSeedValue += 0.003;
    turbulenceEl.setAttribute("seed", nameSeedValue.toFixed(3));
    nameSeedFrame = window.requestAnimationFrame(evolveSeed);
  };
  evolveSeed();
}

function initPostIntroSystems() {
  if (postIntroEnhancementsReady) return;
  postIntroEnhancementsReady = true;

  setupFloatCanvas();
  setupScrollHintDismiss();
  activateInkViewportLifecycle();
  startArrowBreath();

  const nameMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  setupNameFluidMotion(nameMotionMedia.matches || isLowEndDevice.value);
  const onNameMotionChange = (event) => {
    const reduced = event.matches || isLowEndDevice.value;
    setupNameFluidMotion(reduced);
    if (reduced) onNameLensLeave();
  };
  if (typeof nameMotionMedia.addEventListener === "function") {
    nameMotionMedia.addEventListener("change", onNameMotionChange);
    detachNameMotionListener = () =>
      nameMotionMedia.removeEventListener("change", onNameMotionChange);
  } else {
    nameMotionMedia.addListener(onNameMotionChange);
    detachNameMotionListener = () =>
      nameMotionMedia.removeListener(onNameMotionChange);
  }

  const onHello = () => {
    playHelloLensSweep();
  };
  window.addEventListener("easter:hero-hello", onHello);
  detachHelloListener = () =>
    window.removeEventListener("easter:hero-hello", onHello);
}

function schedulePostIntroSystems() {
  if (postIntroEnhancementsReady) return;
  cancelIdleTask(postIntroIdleTask);
  postIntroIdleTask = scheduleIdleTask(() => {
    postIntroIdleTask = null;
    window.requestAnimationFrame(() => {
      bootPostIntroSystems?.();
    });
  }, 900);
}

onMounted(async () => {
  await nextTick();
  forceHeroReplay = window.location.search.includes("debugHero=1");
  setupInkCanvas();
  ctx = gsap.context(() => {
    const layer1 = paperLayer1.value;
    const layer2 = paperLayer2.value;
    const layer3 = paperLayer3.value;
    const wrap = loaderWrapper.value;
    const heroWrap = heroContentWrapper.value;
    if (!layer1 || !layer2 || !layer3 || !wrap || !heroWrap) return;

    const setupScrollFade = () => {
      const fadeTargets = stampEl.value ? [heroWrap, stampEl.value] : [heroWrap];
      gsap.to(fadeTargets, {
        scale: 0.9,
        opacity: 0,
        filter: "blur(15px)",
        y: -90,
        ease: "none",
        scrollTrigger: {
          trigger: heroEl.value,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    };

    gsap.set(loaderWrapper.value, { transformPerspective: 1200 });
    gsap.set([layer1, layer2, layer3], {
      rotateX: 0,
      scaleX: 1,
      transformOrigin: "top center",
      force3D: true,
      "--shadow-alpha": 0,
      "--shadow-y": "10px",
    });
    gsap.set([introRowEl.value, roleRowEl.value, scrollCtaWrapEl.value], {
      y: 40,
      opacity: 0,
      filter: "blur(10px)",
    });
    gsap.set(nameRowEl.value, {
      y: 40,
      opacity: 0,
      filter: "blur(10px)",
    });
    gsap.set(stampEl.value, {
      scale: 0,
      rotation: -25,
      opacity: 0,
      transformOrigin: "center center",
    });

    runIntro = () => {
      if (introStarted) return;
      introStarted = true;
      const stampInkGroup = stampEl.value?.querySelector("g");

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap.set(wrap, { visibility: "hidden", pointerEvents: "none" });
          setupScrollFade();
          schedulePostIntroSystems();
          emit("intro-complete");
        },
      });

      playPaperTearSound();

      const updatePaperShadow = (target) => {
        const rx = Math.abs(gsap.getProperty(target, "rotateX") || 0);
        const strength = gsap.utils.clamp(0, 1, rx / 95);
        target.style.setProperty("--shadow-alpha", `${(strength * 0.22).toFixed(3)}`);
        target.style.setProperty("--shadow-y", `${(12 + strength * 22).toFixed(1)}px`);
      };

      tl.to(layer1, {
        rotateX: -95,
        scaleX: 0.97,
        duration: 0.9,
        ease: "power3.inOut",
        onUpdate: () => updatePaperShadow(layer1),
      })
        .to(
          layer2,
          {
            rotateX: -95,
            scaleX: 0.97,
            duration: 1,
            ease: "power4.inOut",
            onUpdate: () => updatePaperShadow(layer2),
          },
          0.12,
        )
        .to(
          layer3,
          {
            rotateX: -95,
            scaleX: 0.97,
            duration: 1.1,
            ease: "expo.inOut",
            onUpdate: () => updatePaperShadow(layer3),
          },
          0.22,
        )
        .to(
          inkCanvasEl.value,
          {
            opacity: motionAllowed ? 1 : 0,
            duration: 1.1,
            ease: "power2.out",
          },
          0.24,
        )
        .call(
          () => {
            inkCanGrow = true;
            if (motionAllowed) startInkLoop();
          },
          null,
          0.95,
        )
        .to(
          introRowEl.value,
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.05,
            ease: "power3.out",
          },
          "-=0.2",
        )
        .to(
          nameRowEl.value,
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.05,
            ease: "power3.out",
          },
          "-=0.75",
        )
        .to(
          roleRowEl.value,
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.05,
            ease: "power3.out",
          },
          "-=0.82",
        )
        .to(
          scrollCtaWrapEl.value,
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.72",
        )
        .to(
          stampEl.value,
          {
            scale: 1.15,
            rotation: -8,
            opacity: 1,
            duration: 0.18,
            ease: "power3.out",
            onStart: playStampThud,
          },
          "+=0.3",
        )
        .to(stampEl.value, {
          scale: 1,
          rotation: -12,
          duration: 0.4,
          ease: "elastic.out(1, 0.5)",
        });
      if (stampInkGroup) {
        tl.from(
          stampInkGroup,
          {
            strokeWidth: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          "<",
        );
      }
    };

    if (props.skipIntro && !forceHeroReplay) {
      introStarted = true;
      inkCanGrow = true;
      gsap.set([layer1, layer2, layer3], {
        rotateX: -95,
        scaleX: 0.97,
        "--shadow-alpha": 0,
      });
      if (inkCanvasEl.value) {
        gsap.to(inkCanvasEl.value, {
          opacity: motionAllowed ? 1 : 0,
          duration: 0.8,
          ease: "power2.out",
        });
      }
      gsap.set([introRowEl.value, roleRowEl.value, scrollCtaWrapEl.value], {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
      });
      gsap.set(nameRowEl.value, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
      });
      gsap.set(stampEl.value, {
        scale: 1,
        rotation: -12,
        opacity: 1,
        transformOrigin: "center center",
      });
      gsap.set(wrap, { visibility: "hidden", pointerEvents: "none" });
      setupScrollFade();
      schedulePostIntroSystems();
      emit("intro-complete");
      return;
    }

    if (props.startIntro || forceHeroReplay) runIntro();
  }, heroEl.value);
  bootPostIntroSystems = initPostIntroSystems;
});

watch(
  () => props.startIntro,
  (ready) => {
    if (ready && !props.skipIntro) runIntro?.();
  },
  { immediate: true },
);

onUnmounted(() => {
  if (lensMoveRafId) {
    window.cancelAnimationFrame(lensMoveRafId);
    lensMoveRafId = 0;
  }
  forceUnlock();
  cancelIdleTask(postIntroIdleTask);
  postIntroIdleTask = null;
  stopFloaters();
  stopInkLoop();
  inkActive = false;
  detachInkListeners?.();
  detachInkListeners = null;
  stopNameSeedLoop();
  nameFluidTween?.kill();
  nameFluidTween = null;
  arrowBreathTween?.kill();
  arrowBreathTween = null;
  detachCanvasListeners?.();
  detachCanvasListeners = null;
  detachNameMotionListener?.();
  detachNameMotionListener = null;
  detachHelloListener?.();
  detachHelloListener = null;
  detachScrollHintListener?.();
  tearAudioCtx?.close?.();
  tearAudioCtx = null;
  ctx?.revert();
});

onErrorCaptured(() => {
  forceUnlock();
  return false;
});
</script>

<style scoped>
.hero-name {
  font-family: "Clash Display", system-ui, sans-serif;
}

.paper-layer {
  position: relative;
  overflow: hidden;
  backface-visibility: hidden;
}

.paper-layer::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  background-image:
    radial-gradient(rgba(74, 59, 50, 0.28) 0.5px, transparent 0.5px),
    radial-gradient(rgba(255, 255, 255, 0.22) 0.5px, transparent 0.5px);
  background-position:
    0 0,
    7px 5px;
  background-size:
    11px 11px,
    13px 13px;
  mix-blend-mode: multiply;
}

.paper-layer::after {
  content: "";
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: -30px;
  height: 64px;
  pointer-events: none;
  border-radius: 9999px;
  opacity: var(--shadow-alpha, 0);
  transform: translateY(var(--shadow-y, 10px));
  background: radial-gradient(
    circle at center,
    rgba(74, 59, 50, 0.32) 0%,
    rgba(74, 59, 50, 0.12) 36%,
    transparent 75%
  );
  filter: blur(24px);
  transition: opacity 0.15s linear, transform 0.15s linear;
}

.hero-name-svg-wrap {
  width: min(100%, 1300px);
}

.hero-name-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.hero-ui {
  font-family: "Clash Display", system-ui, sans-serif;
  font-weight: 400;
}

.hero-label {
  font-family: "JetBrains Mono", ui-monospace, monospace;
}

.hero-name-svg-text,
.hero-lens-svg-text {
  font-family: "Clash Display", system-ui, sans-serif;
  font-size: clamp(40px, 10vw, 120px);
  letter-spacing: -0.04em;
  line-height: 1;
  white-space: pre;
}

.hero-name-svg-text {
  font-weight: 600;
}

.hero-lens-svg-text {
  font-weight: 600;
}

.hero-lens-text {
  display: none;
}

.hero-stamp {
  mix-blend-mode: multiply;
  will-change: transform, opacity, filter;
  filter: drop-shadow(0 14px 26px rgba(118, 34, 21, 0.22));
}

@media (prefers-reduced-motion: reduce) {
  canvas[aria-hidden="true"] {
    display: none;
  }
}
</style>
