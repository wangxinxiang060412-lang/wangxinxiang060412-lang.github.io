<template>
  <section
    ref="sectionEl"
    class="relative w-full overflow-hidden bg-[#FDFCF8] px-6 py-24 md:px-12"
    :class="{ 'portal-safari-lite': isSafariLike }"
    :style="{ '--mx': `${mouse.x}px`, '--my': `${mouse.y}px` }"
    @mousemove="onSectionMove"
  >
    <div
      class="pointer-events-none absolute inset-0"
      :class="isSafariLike ? 'safari-static-glow' : ''"
      :style="portalGlowStyle"
      aria-hidden="true"
    />

    <div
      class="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-10 lg:items-center"
    >
      <div ref="portalCopyEl" class="relative z-10 lg:col-span-4">
        <p class="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#4A3B32]/68">
          MOBILE PRODUCT
        </p>
        <h2
          class="font-display flex flex-wrap items-baseline text-4xl font-extrabold leading-[1.02] tracking-tight text-[#2D2422] md:text-5xl lg:text-6xl"
        >
          <span>轻旅</span>
          <span class="ml-4 whitespace-nowrap">LightTrip</span>
        </h2>
        <p
          class="mt-6 max-w-md text-sm leading-relaxed text-[#4A3B32]/88 md:text-base"
        >
          A minimalist iOS curation journey with spatial transitions, kinetic
          hierarchy, and holographic storytelling.
        </p>
        <button
          ref="ctaButton"
          type="button"
          class="relative mt-8 flex items-center gap-2.5 rounded-full bg-[#FFB085] px-8 py-3.5 text-sm font-medium tracking-[0.12em] text-[#2D2422] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.2,1)]"
          :class="
            isSafariLike
              ? 'safari-simple-transition safari-light-shadow'
              : 'hover:bg-[#FF9B6A] hover:shadow-[4px_4px_0px_#4A3B32] will-change-transform'
          "
          @mousemove="onCtaMouseMove"
          @mouseenter="onCtaEnter"
          @mouseleave="onCtaMouseLeave"
          @click.stop="handlePortalClick"
        >
          <span class="relative z-10 whitespace-nowrap">点击开始策展旅程</span>
          <span class="relative z-10" aria-hidden="true">→</span>
        </button>
      </div>

      <div class="relative z-10 lg:col-span-6">
        <div
          ref="deckEl"
          class="relative flex h-[600px] w-full items-center justify-center [perspective:1200px]"
          :class="isExploding ? '' : 'cursor-pointer'"
          @click="onDeckClick"
        >
          <div
            v-for="(card, i) in cards"
            :key="card.src"
            :ref="(el) => setCardRef(el, i)"
            class="origin-top absolute aspect-[1/2.1] w-[260px] rounded-[32px] border border-[#4A3B32]/10"
            :class="[
              cardClass(i),
              isSafariLike
                ? 'safari-light-shadow safari-simple-transition'
                : 'shadow-[0_10px_22px_rgba(74,59,50,0.12)] will-change-transform',
            ]"
            @mouseenter="onCardEnter(i)"
            @mouseleave="onCardLeave(i)"
          >
            <img
              :src="card.src"
              :alt="card.alt"
              class="h-full w-full rounded-[inherit] object-contain"
              width="880"
              height="1912"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      ref="warmTransitionEl"
      class="pointer-events-none fixed inset-0 z-[9998] bg-[#FDFCF8] opacity-0"
      :class="isSafariLike ? 'safari-webkit-layer' : ''"
      aria-hidden="true"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePointerEffects } from "../composables/usePointerEffects";
import { useIsSafari } from "../composables/useIsSafari";
import { preloadCuratorStudio } from "../composables/useStudioLoader";
import { isStudioOpen } from "../composables/useStudio";

gsap.registerPlugin(ScrollTrigger);

const sectionEl = ref(null);
const deckEl = ref(null);
const portalCopyEl = ref(null);
const ctaButton = ref(null);
const warmTransitionEl = ref(null);
const cardRefs = ref([]);
const isExploding = ref(false);
const { supportsPointerEffects } = usePointerEffects();
const { isSafariLike } = useIsSafari();
const mouse = ref({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
const portalGlowStyle = computed(() => ({
  background: isSafariLike.value
    ? "radial-gradient(420px 420px at 50% 24%, rgba(255, 176, 133, 0.12), rgba(255, 176, 133, 0) 68%)"
    : "radial-gradient(560px 560px at var(--mx) var(--my), rgba(255, 176, 133, 0.16), rgba(255, 176, 133, 0) 64%)",
  filter: isSafariLike.value ? "none" : "blur(48px)",
}));

const cards = [
  { src: "/deck-1.webp", alt: "Deck card left" },
  { src: "/deck-2.webp", alt: "Deck card center" },
  { src: "/deck-3.webp", alt: "Deck card right" },
];
const defaultCardTransforms = [
  { x: -90, y: 0, rotation: -8 },
  { x: 0, y: -15, rotation: 0 },
  { x: 90, y: 0, rotation: 8 },
];

function setCardRef(el, i) {
  if (el) cardRefs.value[i] = el;
}

function cardClass(i) {
  const tone =
    i === 0
      ? "z-10"
      : i === 1
        ? "z-20"
        : "z-30";
  return tone;
}

function applyDefaultCardState() {
  cardRefs.value.forEach((cardEl, i) => {
    if (!cardEl) return;
    gsap.set(cardEl, {
      ...defaultCardTransforms[i],
      scale: 1,
      opacity: 1,
      zIndex: 10 + i * 10,
      boxShadow: "0 10px 22px rgba(74,59,50,0.12)",
    });
  });
}

function rollbackPortalTransition() {
  isExploding.value = false;
  applyDefaultCardState();
  if (portalCopyEl.value && deckEl.value && warmTransitionEl.value) {
    gsap.to([portalCopyEl.value, deckEl.value], {
      opacity: 1,
      duration: 0.3,
      overwrite: "auto",
    });
    gsap.to(warmTransitionEl.value, {
      opacity: 0,
      duration: 0.3,
      overwrite: "auto",
    });
  }
}

function triggerPortalTransition() {
  if (isExploding.value) return;
  const copy = portalCopyEl.value;
  const warmTransition = warmTransitionEl.value;
  const [c1, c2, c3] = cardRefs.value;
  if (!copy || !warmTransition || !c1 || !c2 || !c3) return;

  isExploding.value = true;
  schedulePortalImport();
  const tl = gsap.timeline({
    defaults: { overwrite: "auto" },
    onComplete: () => {
      isStudioOpen.value = true;
    },
  });
  if (isSafariLike.value) {
    tl.to(
      [c1, c3],
      {
        y: (index) => (index === 0 ? -24 : 24),
        scale: 0.92,
        opacity: 0,
        transformOrigin: "center center",
        duration: 0.42,
        ease: "power2.inOut",
      },
      0,
    )
      .to(
        c2,
        {
          scale: 2.35,
          rotation: 0,
          opacity: 0,
          transformOrigin: "center center",
          duration: 0.64,
          ease: "power3.inOut",
        },
        0,
      )
      .to(
        copy,
        {
          opacity: 0,
          y: -10,
          duration: 0.28,
          ease: "power2.out",
        },
        0,
      )
      .to(
        warmTransition,
        {
          opacity: 1,
          duration: 0.42,
          ease: "power2.out",
        },
        0.12,
      );
    return;
  }

  tl.to(
    c1,
    {
      scaleY: 0,
      opacity: 0,
      transformOrigin: "top center",
      duration: 0.5,
      ease: "power3.inOut",
    },
    0,
  )
    .to(
      c2,
      {
        scale: 4.5,
        rotation: 0,
        opacity: 0,
        transformOrigin: "center center",
        duration: 0.8,
        ease: "expo.inOut",
      },
      0,
    )
    .to(
      c3,
      {
        scaleY: 0,
        opacity: 0,
        transformOrigin: "top center",
        duration: 0.5,
        ease: "power3.inOut",
      },
      0,
    )
    .to(
      copy,
      {
        opacity: 0,
        duration: 0.32,
        ease: "power2.out",
      },
      0,
    )
    .to(
      warmTransition,
      {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
      },
      0.2,
    );
}

function onDeckClick() {
  if (isExploding.value) return;
  triggerPortalTransition();
}

function handlePortalClick() {
  if (isExploding.value) return;
  triggerPortalTransition();
}

function onSectionMove(e) {
  if (!supportsPointerEffects.value || isSafariLike.value) return;
  pendingSectionMouseX = e.clientX;
  pendingSectionMouseY = e.clientY;
  if (sectionMoveRafId) return;
  sectionMoveRafId = window.requestAnimationFrame(flushSectionMouseMove);
}

let ctaXTo;
let ctaYTo;
let cardBreathTimelines = [];
let ctaBreathTween = null;
let sectionMoveRafId = 0;
let pendingSectionMouseX = 0;
let pendingSectionMouseY = 0;
let portalImportTimer = 0;

function flushSectionMouseMove() {
  sectionMoveRafId = 0;
  mouse.value = {
    x: pendingSectionMouseX,
    y: pendingSectionMouseY,
  };
}

function schedulePortalImport() {
  if (portalImportTimer) {
    window.clearTimeout(portalImportTimer);
  }
  window.requestAnimationFrame(() => {
    portalImportTimer = window.setTimeout(() => {
      void preloadCuratorStudio({
        deferToNextFrame: true,
        delayMs: isSafariLike.value ? 90 : 0,
      });
      portalImportTimer = 0;
    }, isSafariLike.value ? 70 : 0);
  });
}

function onCtaMouseMove(e) {
  if (!supportsPointerEffects.value || isSafariLike.value) return;
  const el = ctaButton.value;
  if (!el || !ctaXTo || !ctaYTo) return;
  const r = el.getBoundingClientRect();
  const nx = gsap.utils.clamp(
    -1,
    1,
    (e.clientX - (r.left + r.width / 2)) / (r.width / 2 || 1),
  );
  const ny = gsap.utils.clamp(
    -1,
    1,
    (e.clientY - (r.top + r.height / 2)) / (r.height / 2 || 1),
  );
  ctaXTo(nx * 8);
  ctaYTo(ny * 8);
}

function startCardBreath(index) {
  const card = cardRefs.value[index];
  if (!card) return;
  cardBreathTimelines[index]?.kill();
  if (isSafariLike.value) {
    gsap.set(card, { boxShadow: "0 10px 22px rgba(74,59,50,0.12)" });
    return;
  }
  gsap.set(card, { boxShadow: "0 8px 20px rgba(74,59,50,0.1)" });
  cardBreathTimelines[index] = gsap.to(card, {
    boxShadow: "0 14px 32px rgba(74,59,50,0.16)",
    duration: 3,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    delay: index * 0.8,
  });
}

function startCtaBreath() {
  if (!ctaButton.value) return;
  ctaBreathTween?.kill();
  if (isSafariLike.value) {
    gsap.set(ctaButton.value, { boxShadow: "none", y: 0 });
    return;
  }
  gsap.set(ctaButton.value, { boxShadow: "none" });
  ctaBreathTween = gsap.to(ctaButton.value, {
    boxShadow: "3px 3px 0px #4A3B32",
    duration: 2,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
}

function onCardEnter(index) {
  if (isExploding.value) return;
  cardRefs.value.forEach((cardEl, i) => {
    if (!cardEl) return;
    const isHovered = i === index;
    const offsetX = isHovered ? 0 : i < index ? -10 : 10;
    const target = defaultCardTransforms[i];
    cardBreathTimelines[i]?.kill();
    gsap.to(cardEl, {
      x: target.x + offsetX,
      y: isHovered ? target.y - 20 : target.y,
      rotation: target.rotation,
      scale: isHovered ? 1.05 : 1,
      zIndex: isHovered ? 80 : 10 + i * 10,
      ...(isSafariLike.value
        ? {}
        : {
            boxShadow: isHovered
              ? "0 18px 40px rgba(74,59,50,0.22)"
              : "0 10px 22px rgba(74,59,50,0.12)",
          }),
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto",
    });
  });
}

function onCardLeave() {
  if (isExploding.value) return;
  cardRefs.value.forEach((cardEl, i) => {
    if (!cardEl) return;
    const target = defaultCardTransforms[i];
    gsap.to(cardEl, {
      x: target.x,
      y: target.y,
      rotation: target.rotation,
      scale: 1,
      zIndex: 10 + i * 10,
      ...(isSafariLike.value
        ? {}
        : { boxShadow: "0 10px 22px rgba(74,59,50,0.12)" }),
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto",
      onComplete: () => startCardBreath(i),
    });
  });
}

function createDeckEntranceTimeline() {
  if (!sectionEl.value || !deckEl.value || cardRefs.value.length !== cards.length) return;
  cardRefs.value.forEach((cardEl) => {
    if (!cardEl) return;
    gsap.set(cardEl, {
      x: 0,
      y: 30,
      rotation: 0,
      scale: 0.85,
      opacity: 0,
    });
  });
  entranceTimeline = gsap.timeline({
    paused: true,
    defaults: { overwrite: "auto" },
    onComplete: () => {
      startDeckBreath();
    },
  });
  entranceTimeline
    .to(
      cardRefs.value,
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "back.out(1.4)",
      },
      0,
    )
    .to(
      cardRefs.value,
      {
        x: (i) => defaultCardTransforms[i].x,
        y: (i) => defaultCardTransforms[i].y,
        rotation: (i) => defaultCardTransforms[i].rotation,
        duration: 0.7,
        ease: "elastic.out(0.8, 0.35)",
        stagger: 0.08,
      },
      0.3,
    );
  entranceTrigger = ScrollTrigger.create({
    trigger: sectionEl.value,
    start: "top 70%",
    once: true,
    onEnter: () => entranceTimeline?.play(0),
  });
}

function startDeckBreath() {
  if (!deckEl.value) return;
  breatheTween?.kill();
  if (isSafariLike.value) return;
  breatheTween = gsap.to(deckEl.value, {
    y: -8,
    duration: 2.1,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
}

let breatheTween;
let entranceTimeline = null;
let entranceTrigger = null;

watch(isStudioOpen, (open) => {
  if (!open) rollbackPortalTransition();
});

onMounted(() => {
  nextTick(() => {
    if (!deckEl.value) return;
    createDeckEntranceTimeline();
    if (ctaButton.value) {
      ctaXTo = gsap.quickTo(ctaButton.value, "x", {
        duration: 0.26,
        ease: "power3.out",
      });
      ctaYTo = gsap.quickTo(ctaButton.value, "y", {
        duration: 0.26,
        ease: "power3.out",
      });
      startCtaBreath();
    }
    cardRefs.value.forEach((_, i) => startCardBreath(i));
  });
});

onUnmounted(() => {
  entranceTrigger?.kill();
  entranceTrigger = null;
  entranceTimeline?.kill();
  entranceTimeline = null;
  breatheTween?.kill();
  cardBreathTimelines.forEach((tl) => tl?.kill());
  cardBreathTimelines = [];
  ctaBreathTween?.kill();
  if (sectionMoveRafId) {
    window.cancelAnimationFrame(sectionMoveRafId);
    sectionMoveRafId = 0;
  }
  if (portalImportTimer) {
    window.clearTimeout(portalImportTimer);
    portalImportTimer = 0;
  }
});
function onCtaEnter() {
  if (!ctaButton.value) return;
  ctaBreathTween?.kill();
  if (isSafariLike.value) {
    gsap.to(ctaButton.value, {
      y: -1,
      duration: 0.2,
      ease: "power3.out",
      overwrite: "auto",
    });
    return;
  }
  gsap.to(ctaButton.value, {
    boxShadow: "4px 4px 0px #4A3B32",
    duration: 0.2,
    ease: "power3.out",
    overwrite: "auto",
  });
}

function onCtaMouseLeave() {
  const el = ctaButton.value;
  if (!el) return;
  gsap.to(el, {
    x: 0,
    y: 0,
    duration: 0.52,
    ease: "power3.out",
    overwrite: "auto",
  });
  startCtaBreath();
}
</script>

<style scoped>
.portal-safari-lite .safari-simple-transition {
  transition-property: transform, opacity, border-color, background-color;
}
</style>
