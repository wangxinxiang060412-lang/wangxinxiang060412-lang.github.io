<template>
  <section
    id="toolkit"
    ref="outerEl"
    class="relative px-6 md:px-12 lg:px-20"
    :class="{
      'toolkit-safari-lite': useLiteStack,
      'toolkit-pointer-enabled': supportsToolkitPointerFx,
      'toolkit-stack-disabled': shouldDisableStack,
    }"
  >
    <div class="pointer-events-none absolute inset-y-0 left-[40px] z-[4] hidden lg:block">
      <div
        ref="sectionTrackEl"
        class="sticky top-[50vh] -translate-y-1/2 select-none"
        aria-hidden="true"
      >
        <span class="toolkit-track-line">TOOLKIT / 02</span>
      </div>
    </div>

    <div
      ref="stageEl"
      class="toolkit-stage relative mx-auto w-full max-w-[1440px]"
    >
      <div ref="panelEl" class="toolkit-panel relative z-10">
        <!-- 背景层放在 panel 内部，pin 时和卡片一起钉住，避免空白 -->
        <div class="toolkit-panel-bg pointer-events-none absolute inset-0 z-0" aria-hidden="true" />
        <canvas
          ref="topoCanvasEl"
          class="pointer-events-none absolute inset-0 z-[1] opacity-85"
          aria-hidden="true"
        />
        <div
          ref="topoStaticEl"
          class="pointer-events-none absolute inset-0 z-[1] hidden opacity-85"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px"
          style="background: rgba(92, 77, 73, 0.14)"
          aria-hidden="true"
        />
        <div
          class="toolkit-topbar relative z-30 flex items-center justify-between px-3 py-4 md:px-6"
          style="border-bottom: 1px solid rgba(92, 77, 73, 0.12)"
        >
          <p
            class="font-body font-medium text-[#5C4D49]"
            style="
              font-size: 10px;
              letter-spacing: 0.5em;
              text-transform: uppercase;
            "
          >
            Toolkit
          </p>
          <p
            class="toolkit-counter font-display font-bold tracking-tighter text-[#5C4D49]"
            style="font-size: clamp(13px, 1.3vw, 17px)"
          >
            <span class="counter-current" :data-num="String(activeCard + 1).padStart(2, '0')">{{
              String(activeCard + 1).padStart(2, "0")
            }}</span>
            &nbsp;/&nbsp;{{ String(cards.length).padStart(2, "0") }}
          </p>
        </div>

        <div ref="deckEl" class="toolkit-deck">
          <article
            v-for="(card, index) in cards"
            :key="card.title"
            :ref="(el) => setSlotRef(el, index)"
            class="toolkit-card-slot"
            :data-index="index"
            :data-figma-url="card.figmaUrl || ''"
            :data-github-url="card.githubUrl || ''"
            data-easter-card="1"
            :aria-hidden="!shouldDisableStack && index !== activeCard ? 'true' : null"
          >
            <div :ref="(el) => setCardRef(el, index)" class="toolkit-card">
              <div
                class="card-surface relative flex h-full w-full flex-col rounded-[20px]"
                :class="[
                  { 'card-surface-active': index === activeCard },
                  useLiteStack
                    ? 'safari-toolkit-surface safari-light-shadow'
                    : 'backdrop-blur-2xl',
                ]"
                :style="cardSurfaceStyle"
              >
                <div
                  class="active-accent-line absolute top-0 left-0 right-0 h-[2px]"
                  style="
                    background: linear-gradient(
                      90deg,
                      transparent,
                      rgba(255, 126, 103, 0.85),
                      transparent
                    );
                  "
                />
                <div
                  class="pointer-events-none absolute inset-[1px] rounded-[18px]"
                  style="
                    box-shadow:
                      inset 0 0 0 1px rgba(255, 255, 255, 0.82),
                      inset 0 1px 0 rgba(255, 255, 255, 0.52);
                  "
                />

                <div
                  class="flex items-start justify-between border-b border-[#5C4D49]/12 px-9 pt-8 pb-6"
                >
                  <h3
                    class="font-display leading-tight tracking-tighter text-[#2D2422]"
                    style="
                      font-size: clamp(27px, 3.5vw, 52px);
                      font-weight: 500;
                      max-width: 66%;
                    "
                  >
                    {{ card.title }}
                  </h3>
                  <span
                    class="mt-1 flex-shrink-0 font-mono font-medium text-[#5C4D49]/80"
                    style="
                      font-size: clamp(12px, 1.3vw, 17px);
                      letter-spacing: 0.04em;
                    "
                  >
                    ({{ String(index + 1).padStart(2, "0") }})
                  </span>
                </div>

                <div class="flex min-h-0 flex-1 toolkit-card-body">
                  <div
                    class="flex w-[38%] flex-col justify-between border-r border-[#5C4D49]/12 px-9 py-7"
                  >
                    <p
                      class="font-body leading-relaxed text-[#5C4D49]"
                      style="font-size: clamp(12px, 1.15vw, 14px); line-height: 1.8"
                    >
                      {{ card.desc }}
                    </p>

                    <div class="border-t border-[#5C4D49]/12 pt-4">
                      <p
                        class="font-body mb-3 font-medium text-[#5C4D49]"
                        style="
                          font-size: 9px;
                          letter-spacing: 0.45em;
                          text-transform: uppercase;
                        "
                      >
                        Key Tools
                      </p>
                      <div class="flex flex-wrap gap-1.5">
                        <span
                          v-for="tool in card.keyTools"
                          :key="tool"
                          class="rounded-md border border-[#5C4D49]/20 px-2.5 py-1 font-body text-[10px] font-medium uppercase tracking-wide text-[#2D2422]"
                        >
                          {{ tool }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="grid flex-1 content-start grid-cols-2 gap-3 p-7">
                    <div
                      v-for="tool in card.toolItems"
                      :key="tool.name"
                      class="tool-mini-card relative cursor-default overflow-hidden rounded-xl border border-[#5C4D49]/12 bg-[#FDFCF8]/70 px-4 py-4"
                    >
                      <p
                        class="font-display mb-1.5 leading-none tracking-tight text-[#2D2422]"
                        style="font-size: clamp(17px, 2.1vw, 28px)"
                      >
                        {{ tool.name }}
                      </p>
                      <p
                        class="font-body font-medium text-[#5C4D49]"
                        style="
                          font-size: 9px;
                          letter-spacing: 0.35em;
                          text-transform: uppercase;
                        "
                      >
                        {{ tool.role }}
                      </p>
                      <div
                        class="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-[#FF7E67]/70"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="absolute bottom-0 left-0 right-0 h-[1px]"
                  style="
                    background: linear-gradient(
                      90deg,
                      transparent,
                      rgba(255, 126, 103, 0.5),
                      transparent
                    );
                  "
                />
              </div>
            </div>
          </article>
        </div>

        <div
          class="toolkit-bookmarks relative z-30 flex justify-center gap-2 pt-2 pb-5"
        >
          <button
            v-for="(_, index) in cards"
            :key="index"
            type="button"
            class="page-bookmark relative cursor-pointer overflow-hidden rounded-[2px] border border-[#5C4D49]/20 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.2,1)]"
            :class="
              index === activeCard
                ? 'bg-[#2D2422]/16 shadow-[0_8px_16px_rgba(45,36,34,0.2)]'
                : 'bg-[#5C4D49]/8 hover:border-[#5C4D49]/40'
            "
            :aria-label="`查看第 ${index + 1} 张卡片`"
            :aria-current="index === activeCard ? 'true' : 'false'"
            data-cursor="view"
            @click="jumpToCard(index)"
          >
            <div
              class="bookmark-current-line absolute top-[2px] bottom-[2px] left-[2px] w-[2px] rounded-full bg-[#FF7E67] transition-opacity duration-500"
              :class="index === activeCard ? 'opacity-100' : 'opacity-0'"
            />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createNoise3D } from "simplex-noise";
import { useIsLowEndDevice } from "../composables/useIsLowEndDevice";
import { useIsSafari } from "../composables/useIsSafari";
import { useLenis } from "../composables/useLenis";
import { usePointerEffects } from "../composables/usePointerEffects";
import { useReducedMotion } from "../composables/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const { isSafariLike } = useIsSafari();
const { isLowEndDevice } = useIsLowEndDevice();
const { prefersReducedMotion } = useReducedMotion();
const { supportsPointerEffects } = usePointerEffects();

const outerEl = ref(null);
const sectionTrackEl = ref(null);
const stageEl = ref(null);
const panelEl = ref(null);
const deckEl = ref(null);
const topoCanvasEl = ref(null);
const topoStaticEl = ref(null);
const activeCard = ref(0);
const slotRefs = ref([]);
const cardRefs = ref([]);
const isCompactViewport = ref(false);

function setSlotRef(el, index) {
  if (el) slotRefs.value[index] = el;
}

function setCardRef(el, index) {
  if (el) cardRefs.value[index] = el;
}

function syncViewportMode() {
  isCompactViewport.value = window.innerWidth < 1024;
}

const shouldDisableStack = computed(() => prefersReducedMotion.value);
const useLiteStack = computed(
  () => isSafariLike.value || isLowEndDevice.value,
);
const supportsToolkitPointerFx = computed(
  () =>
    supportsPointerEffects.value &&
    !useLiteStack.value &&
    !shouldDisableStack.value,
);

const cardSurfaceStyle = computed(() => ({
  background:
    "linear-gradient(160deg, rgba(255,249,243,0.95) 0%, rgba(255,240,230,0.85) 100%)",
  border: "1px solid rgba(74,59,50,0.12)",
  boxShadow: useLiteStack.value
    ? "0 2px 4px rgba(74,59,50,0.05), 0 10px 26px rgba(74,59,50,0.08)"
    : "0 2px 4px rgba(74,59,50,0.06), 0 12px 36px rgba(74,59,50,0.1), 0 24px 60px rgba(255,176,133,0.08)",
}));

const TOPO_CELL = 28;
const TOPO_LEVEL_COUNT = 10;
const TOPO_STROKE = "rgba(74,59,50,0.08)";
const TOPO_MOUSE_RADIUS = 200;
const TOPO_MOUSE_BOOST = 0.3;

const noise3D = createNoise3D();

let topoCtx = null;
let topoDpr = 1;
let topoWidth = 0;
let topoHeight = 0;
let topoGridX = 0;
let topoGridY = 0;
let topoField = [];
let topoProgress = 0;
let topoFrame = 0;
let topoNeedsRender = false;
let topoActive = true;
let topoIsMobile = false;
let topoMouse = { x: -9999, y: -9999, active: false };
let detachTopoListeners = null;
let topoScrollTrigger = null;
let topoVisibilityHandler = null;
let refreshResizeHandler = null;
let refreshTimer = 0;
let ctx = null;

const cards = [
  {
    title: "前端开发核心",
    desc: "熟练掌握 HTML5、CSS3、JavaScript，深入理解 Vue 3 框架。擅长构建前后端分离架构，能快速输出高还原度、高交互性的前端页面，具备完整的动效设计与实现能力。",
    keyTools: ["Vue 3", "Vite", "Tailwind", "GSAP", "Lenis"],
    toolItems: [
      { name: "Vue 3", role: "Core Framework" },
      { name: "Vite", role: "Build Tool" },
      { name: "GSAP", role: "Animation Engine" },
      { name: "Tailwind", role: "CSS Framework" },
    ],
    figmaUrl: "https://www.figma.com/",
    githubUrl: "https://github.com/",
  },
  {
    title: "AI 驱动开发",
    desc: "极度熟练使用 Cursor、Claude Code、Gemini 等 AI 辅助编程工具，精通 Prompt Engineering。能利用大模型快速搭建项目骨架、编写复杂前端组件及实现全栈逻辑，大幅提升交付效率。",
    keyTools: ["Cursor", "Claude Code", "Gemini", "Prompt Eng"],
    toolItems: [
      { name: "Cursor", role: "AI IDE" },
      { name: "Claude Code", role: "Dev Assistant" },
      { name: "Gemini", role: "AI Model" },
      { name: "Prompt Eng", role: "LLM Technique" },
    ],
    figmaUrl: "https://www.figma.com/",
    githubUrl: "https://github.com/",
  },
  {
    title: "跨平台 & 后端",
    desc: "熟悉苹果生态，能结合 Xcode 及 AI 代码辅助进行 iOS / macOS 应用开发。具备扎实的 Python 编程功底，掌握 MATLAB 数值计算与图像处理，能独立完成算法实验与分析。",
    keyTools: ["Swift", "SwiftUI", "Xcode", "Python", "MATLAB"],
    toolItems: [
      { name: "Swift", role: "iOS Language" },
      { name: "SwiftUI", role: "UI Framework" },
      { name: "Python", role: "Scripting" },
      { name: "MATLAB", role: "Computation" },
    ],
    figmaUrl: "https://www.figma.com/",
    githubUrl: "https://github.com/",
  },
  {
    title: "UI/UX & 视觉创作",
    desc: "熟练使用 Figma 进行界面交互设计，能独立完成从低保真原型到高保真 UI 的全流程设计，具备优秀的审美与 UX 优化能力，兼具 Adobe Animate 帧动画与数字视频剪辑制作能力。",
    keyTools: ["Figma", "Photoshop", "Adobe Animate", "达芬奇"],
    toolItems: [
      { name: "Figma", role: "UI/UX Design" },
      { name: "Animate", role: "Frame-by-Frame" },
      { name: "PS", role: "Visual Edit" },
      { name: "达芬奇", role: "Video Edit" },
    ],
    figmaUrl: "https://www.figma.com/",
    githubUrl: "https://github.com/",
  },
];

/* ───────────────────────────────────────────────────────────
   Topo background — preserved
   ─────────────────────────────────────────────────────────── */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function ensureTopoFieldSize() {
  topoField = Array.from(
    { length: topoGridY + 1 },
    () => new Float32Array(topoGridX + 1),
  );
}

function updateTopoField() {
  const z = topoProgress * 1.8;
  const scale = 0.0065;

  for (let gy = 0; gy <= topoGridY; gy += 1) {
    const y = gy * TOPO_CELL;
    for (let gx = 0; gx <= topoGridX; gx += 1) {
      const x = gx * TOPO_CELL;
      let value = noise3D(x * scale, y * scale, z);
      if (topoMouse.active) {
        const dx = x - topoMouse.x;
        const dy = y - topoMouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < TOPO_MOUSE_RADIUS) {
          const strength = 1 - dist / TOPO_MOUSE_RADIUS;
          value += TOPO_MOUSE_BOOST * strength * strength;
        }
      }
      topoField[gy][gx] = value;
    }
  }
}

function edgePoint(x1, y1, v1, x2, y2, v2, level) {
  const delta = v2 - v1;
  const t = Math.abs(delta) < 1e-6 ? 0.5 : (level - v1) / delta;
  return { x: lerp(x1, x2, t), y: lerp(y1, y2, t) };
}

function drawSegment(p1, p2) {
  if (!topoCtx || !p1 || !p2) return;
  topoCtx.moveTo(p1.x, p1.y);
  topoCtx.lineTo(p2.x, p2.y);
}

function drawCellContours(x, y, v00, v10, v11, v01, level) {
  const bits =
    (v00 >= level ? 1 : 0) |
    (v10 >= level ? 2 : 0) |
    (v11 >= level ? 4 : 0) |
    (v01 >= level ? 8 : 0);
  if (bits === 0 || bits === 15) return;

  const top = edgePoint(x, y, v00, x + TOPO_CELL, y, v10, level);
  const right = edgePoint(
    x + TOPO_CELL,
    y,
    v10,
    x + TOPO_CELL,
    y + TOPO_CELL,
    v11,
    level,
  );
  const bottom = edgePoint(
    x,
    y + TOPO_CELL,
    v01,
    x + TOPO_CELL,
    y + TOPO_CELL,
    v11,
    level,
  );
  const left = edgePoint(x, y, v00, x, y + TOPO_CELL, v01, level);

  switch (bits) {
    case 1:
    case 14:
      drawSegment(left, top);
      break;
    case 2:
    case 13:
      drawSegment(top, right);
      break;
    case 3:
    case 12:
      drawSegment(left, right);
      break;
    case 4:
    case 11:
      drawSegment(right, bottom);
      break;
    case 5:
      drawSegment(left, top);
      drawSegment(right, bottom);
      break;
    case 6:
    case 9:
      drawSegment(top, bottom);
      break;
    case 7:
    case 8:
      drawSegment(left, bottom);
      break;
    case 10:
      drawSegment(top, right);
      drawSegment(left, bottom);
      break;
  }
}

function drawTopoContours() {
  if (!topoCtx) return;
  topoCtx.clearRect(0, 0, topoWidth, topoHeight);
  topoCtx.strokeStyle = TOPO_STROKE;
  topoCtx.lineWidth = 0.95;
  topoCtx.beginPath();
  for (let levelIndex = 0; levelIndex < TOPO_LEVEL_COUNT; levelIndex += 1) {
    const level = -0.9 + (1.8 * levelIndex) / (TOPO_LEVEL_COUNT - 1);
    for (let gy = 0; gy < topoGridY; gy += 1) {
      for (let gx = 0; gx < topoGridX; gx += 1) {
        const x = gx * TOPO_CELL;
        const y = gy * TOPO_CELL;
        const v00 = topoField[gy][gx];
        const v10 = topoField[gy][gx + 1];
        const v11 = topoField[gy + 1][gx + 1];
        const v01 = topoField[gy + 1][gx];
        drawCellContours(x, y, v00, v10, v11, v01, level);
      }
    }
  }
  topoCtx.stroke();
}

function requestTopoRender() {
  if (!topoCtx) return;
  topoNeedsRender = true;
}

function renderTopo() {
  if (
    !topoCtx ||
    topoIsMobile ||
    prefersReducedMotion.value ||
    useLiteStack.value ||
    !topoActive
  ) {
    return;
  }
  if (!topoNeedsRender) return;
  topoNeedsRender = false;
  updateTopoField();
  drawTopoContours();
}

function topoTick() {
  if (
    document.hidden ||
    topoIsMobile ||
    prefersReducedMotion.value ||
    useLiteStack.value
  ) {
    topoFrame = 0;
    return;
  }
  renderTopo();
  topoFrame = window.requestAnimationFrame(topoTick);
}

function resizeTopoCanvas() {
  const canvas = topoCanvasEl.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  topoDpr = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
  topoWidth = Math.max(1, Math.round(rect.width));
  topoHeight = Math.max(1, Math.round(rect.height));
  canvas.width = Math.max(1, Math.round(topoWidth * topoDpr));
  canvas.height = Math.max(1, Math.round(topoHeight * topoDpr));
  if (topoCtx) {
    topoCtx.setTransform(topoDpr, 0, 0, topoDpr, 0, 0);
  }
  topoGridX = Math.ceil(topoWidth / TOPO_CELL);
  topoGridY = Math.ceil(topoHeight / TOPO_CELL);
  ensureTopoFieldSize();
  requestTopoRender();
}

function buildStaticTopoSvg() {
  if (!topoStaticEl.value) return;
  const rows = Array.from({ length: 10 }, (_, index) => {
    const y = 10 + index * 12;
    const wobble = index % 2 === 0 ? 2 : -2;
    return `<path d="M-5 ${y} C 15 ${y + wobble}, 35 ${y - wobble}, 55 ${y} S 95 ${y + wobble}, 105 ${y}" />`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><g fill="none" stroke="rgba(74,59,50,0.1)" stroke-width="0.9">${rows}</g></svg>`;
  topoStaticEl.value.style.backgroundImage = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  topoStaticEl.value.style.backgroundSize = "cover";
  topoStaticEl.value.style.backgroundRepeat = "no-repeat";
}

function updateTopoMode() {
  topoIsMobile = window.innerWidth < 768;
  const useStatic =
    topoIsMobile || prefersReducedMotion.value || useLiteStack.value;
  if (topoCanvasEl.value) {
    topoCanvasEl.value.style.display = useStatic ? "none" : "";
  }
  if (topoStaticEl.value) {
    topoStaticEl.value.style.display = useStatic ? "" : "none";
  }
  if (useStatic && topoFrame) {
    window.cancelAnimationFrame(topoFrame);
    topoFrame = 0;
  } else if (!useStatic && topoFrame === 0 && !document.hidden) {
    topoTick();
  }
  requestTopoRender();
}

function setupTopoBackground() {
  const canvas = topoCanvasEl.value;
  // 关键修复：用 panel 作为 topo 的 wrapper —— 这样 pin 时背景和卡片一起钉住，
  // 不会出现「panel 钉在视窗顶端但 topo 已经滚走」的空白。
  const wrapper = panelEl.value || stageEl.value;
  if (!canvas || !wrapper) return;
  topoCtx = canvas.getContext("2d");
  if (!topoCtx) return;
  buildStaticTopoSvg();
  updateTopoMode();
  resizeTopoCanvas();

  let topoResizeTimer = 0;
  const onPointerMove = (event) => {
    if (useLiteStack.value || prefersReducedMotion.value) return;
    const rect = wrapper.getBoundingClientRect();
    topoMouse.x = event.clientX - rect.left;
    topoMouse.y = event.clientY - rect.top;
    topoMouse.active = true;
    requestTopoRender();
  };
  const onPointerLeave = () => {
    topoMouse.active = false;
    requestTopoRender();
  };
  const onResize = () => {
    clearTimeout(topoResizeTimer);
    topoResizeTimer = window.setTimeout(() => {
      updateTopoMode();
      resizeTopoCanvas();
    }, 80);
  };
  wrapper.addEventListener("pointermove", onPointerMove, { passive: true });
  wrapper.addEventListener("pointerleave", onPointerLeave, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  topoScrollTrigger = ScrollTrigger.create({
    trigger: outerEl.value,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      topoProgress = self.progress;
      requestTopoRender();
    },
    onToggle: (self) => {
      topoActive = self.isActive;
      requestTopoRender();
    },
  });

  topoVisibilityHandler = () => {
    if (!document.hidden && topoFrame === 0) {
      requestTopoRender();
      topoTick();
    }
  };
  document.addEventListener("visibilitychange", topoVisibilityHandler);
  detachTopoListeners = () => {
    wrapper.removeEventListener("pointermove", onPointerMove);
    wrapper.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", topoVisibilityHandler);
    clearTimeout(topoResizeTimer);
    topoResizeTimer = 0;
    detachTopoListeners = null;
    topoVisibilityHandler = null;
  };
}

/* ───────────────────────────────────────────────────────────
   Deck mechanic — Apple/Awwwards style depth-shuffle
   ─────────────────────────────────────────────────────────── */
let deckPinTrigger = null;
let staticObserver = null;
let lastAppliedKey = "";

function getStackScrollDistance() {
  const segmentVh = isCompactViewport.value ? 118 : useLiteStack.value ? 105 : 128;
  const totalSegments = Math.max(1, cards.length - 1);
  return Math.round(totalSegments * window.innerHeight * (segmentVh / 100));
}

function applyCardTransform(el, signedDistance) {
  if (!el) return;
  const d = signedDistance;
  const ad = Math.abs(d);
  const lite = useLiteStack.value;
  const compact = isCompactViewport.value;

  // 渐隐曲线：保留明显的前后层级，但避免两张卡片同时太淡导致“空白感”
  const opacityFloor = compact ? 0.3 : 0.22;
  const opacity = ad >= 1.5 ? 0 : Math.max(opacityFloor, 1 - ad * 0.72);
  // 缩放：当前 1，远处的稍小，给「退到第二排」的感觉
  const scale = Math.max(compact ? 0.9 : 0.86, 1 - ad * (compact ? 0.055 : 0.07));
  // 上一张往上漂走得更远，下一张从下方略低位置浮起 — 不对称更有「翻页」感
  const y = d > 0 ? -d * (compact ? 28 : 38) - 8 : -d * (compact ? 16 : 22);
  // 景深：两侧都退后
  const z = lite ? 0 : -ad * (compact ? 52 : 80);
  // 微微旋转一点，避免完全工整、显得机械
  const rotZ = lite ? 0 : d * (compact ? -0.65 : -1.2);
  // 模糊：远离中心时轻微虚焦
  const blur = lite ? 0 : Math.min(compact ? 3.25 : 5, Math.max(0, (ad - 0.18) * (compact ? 2.7 : 4.2)));

  el.style.opacity = opacity.toFixed(3);
  el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
  el.style.transform = lite
    ? `translate3d(0, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`
    : `translate3d(0, ${y.toFixed(1)}px, ${z.toFixed(1)}px) scale(${scale.toFixed(3)}) rotate(${rotZ.toFixed(2)}deg)`;
  el.style.zIndex = String(100 - Math.round(ad * 10));
  el.style.pointerEvents = ad < 0.4 ? "auto" : "none";
}

function clearCardTransform(el) {
  if (!el) return;
  el.style.transform = "";
  el.style.opacity = "";
  el.style.filter = "";
  el.style.zIndex = "";
  el.style.pointerEvents = "";
}

function updateDeck(progress) {
  const N = cards.length;
  if (N === 0) return;
  // progress (0..1) → 实数索引 (0..N-1)
  const idx = progress * (N - 1);
  const newActive = Math.min(N - 1, Math.max(0, Math.round(idx)));
  if (newActive !== activeCard.value) activeCard.value = newActive;

  // 用一个 key 跳过重复帧（scrub 平滑下相邻帧 progress 变化极小）
  const key = idx.toFixed(3);
  if (key === lastAppliedKey) return;
  lastAppliedKey = key;

  for (let i = 0; i < cardRefs.value.length; i += 1) {
    const el = cardRefs.value[i];
    if (!el) continue;
    applyCardTransform(el, idx - i);
  }
}

function setupDeckPin() {
  if (!outerEl.value || !panelEl.value || shouldDisableStack.value) return;

  // 进入前，先把所有非首张推到「等待入场」位置
  cardRefs.value.forEach((el, i) => applyCardTransform(el, -i));
  applyCardTransform(cardRefs.value[0], 0);
  lastAppliedKey = "";

  const scrollDistance = getStackScrollDistance();
  outerEl.value.style.minHeight = `${Math.ceil(panelEl.value.offsetHeight + scrollDistance)}px`;

  deckPinTrigger = ScrollTrigger.create({
    trigger: outerEl.value,
    pin: panelEl.value,
    start: "top top",
    end: () => `+=${getStackScrollDistance()}`,
    pinSpacing: false,
    // scrub 提到 1.2（轻量 0.8）—— 卡片切换跟随滚动但保留明显的「重量感」/惯性，
    // 用户在两张卡片之间会感觉到柔软的阻尼，不会一滑就过。
    scrub: isCompactViewport.value ? 0.68 : useLiteStack.value ? 0.88 : 1.08,
    invalidateOnRefresh: true,
    anticipatePin: 1,
    onUpdate: (self) => updateDeck(self.progress),
    onRefresh: () => {
      if (deckPinTrigger) updateDeck(deckPinTrigger.progress);
    },
  });
}

function teardownDeckPin() {
  deckPinTrigger?.kill();
  deckPinTrigger = null;
  if (outerEl.value) outerEl.value.style.minHeight = "";
  cardRefs.value.forEach(clearCardTransform);
  lastAppliedKey = "";
}

function setupStaticObserver() {
  if (!shouldDisableStack.value) return;
  if (typeof IntersectionObserver === "undefined") return;
  staticObserver?.disconnect();
  staticObserver = new IntersectionObserver(
    (entries) => {
      let bestEl = null;
      let bestRatio = 0;
      entries.forEach((entry) => {
        if (entry.intersectionRatio > bestRatio) {
          bestRatio = entry.intersectionRatio;
          bestEl = entry.target;
        }
      });
      if (bestEl) {
        const idxAttr = bestEl.getAttribute("data-index");
        const idx = idxAttr ? Number(idxAttr) : 0;
        if (!Number.isNaN(idx) && idx !== activeCard.value) {
          activeCard.value = idx;
        }
      }
    },
    { threshold: [0, 0.4, 0.7, 1] },
  );
  slotRefs.value.forEach((el) => el && staticObserver.observe(el));
}

function teardownStaticObserver() {
  staticObserver?.disconnect();
  staticObserver = null;
}

function jumpToCard(index) {
  const N = cards.length;
  const safeIndex = Math.min(N - 1, Math.max(0, index));
  if (deckPinTrigger) {
    const targetProgress = N > 1 ? safeIndex / (N - 1) : 0;
    const start = deckPinTrigger.start;
    const end = deckPinTrigger.end;
    const targetScroll = start + (end - start) * targetProgress;
    const { lenis } = useLenis();
    if (lenis) {
      lenis.scrollTo(targetScroll, {
        duration: 0.95,
        easing: gsap.parseEase("cubic-bezier(0.76, 0, 0.24, 1)"),
      });
      return;
    }
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
    return;
  }
  // 静态模式：直接把对应卡片滚到视窗中央
  const slot = slotRefs.value[safeIndex];
  if (!slot) return;
  const rect = slot.getBoundingClientRect();
  const y = rect.top + window.scrollY - window.innerHeight / 2 + rect.height / 2;
  const { lenis } = useLenis();
  if (lenis) {
    lenis.scrollTo(y, {
      duration: 0.9,
      easing: gsap.parseEase("cubic-bezier(0.76, 0, 0.24, 1)"),
    });
    return;
  }
  window.scrollTo({ top: y, behavior: "smooth" });
}

function scheduleScrollRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    ScrollTrigger.refresh();
  }, 80);
}

watch(
  [shouldDisableStack, useLiteStack, isCompactViewport],
  async () => {
    await nextTick();
    teardownDeckPin();
    teardownStaticObserver();
    if (shouldDisableStack.value) {
      setupStaticObserver();
    } else {
      setupDeckPin();
    }
    updateTopoMode();
    requestTopoRender();
    scheduleScrollRefresh();
  },
);

onMounted(async () => {
  await nextTick();
  syncViewportMode();
  setupTopoBackground();

  ctx = gsap.context(() => {
    if (sectionTrackEl.value) {
      gsap.fromTo(
        sectionTrackEl.value,
        { yPercent: -14 },
        {
          yPercent: 14,
          ease: "none",
          scrollTrigger: {
            trigger: outerEl.value,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    }

    refreshResizeHandler = () => {
      syncViewportMode();
      scheduleScrollRefresh();
    };
    window.addEventListener("resize", refreshResizeHandler, { passive: true });
  }, outerEl.value);

  if (shouldDisableStack.value) {
    setupStaticObserver();
  } else {
    setupDeckPin();
  }
  scheduleScrollRefresh();
});

onUnmounted(() => {
  if (topoFrame) {
    window.cancelAnimationFrame(topoFrame);
    topoFrame = 0;
  }
  topoScrollTrigger?.kill();
  topoScrollTrigger = null;
  detachTopoListeners?.();

  teardownDeckPin();
  teardownStaticObserver();

  if (refreshResizeHandler) {
    window.removeEventListener("resize", refreshResizeHandler);
    refreshResizeHandler = null;
  }

  clearTimeout(refreshTimer);
  refreshTimer = 0;
  topoNeedsRender = false;
  topoCtx = null;
  topoMouse = { x: -9999, y: -9999, active: false };
  topoField = [];
  ctx?.revert();
  ctx = null;
});
</script>

<style scoped>
.toolkit-stage {
  position: relative;
}

.toolkit-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  /* 用 dvh 让移动端浏览器地址栏伸缩时高度稳定，回退到 vh 兼容旧浏览器 */
  height: 100vh;
  height: 100dvh;
  min-height: 720px;
  padding: 0 28px;
  isolation: isolate; /* 让 panel 内部形成独立的 stacking context，避免 fixed 时 z 错乱 */
}

.toolkit-panel-bg {
  /* 不透明底色 —— 确保 pin 时面板始终覆盖底部空白区域 */
  background: #fdfcf8;
}

.toolkit-stack-disabled .toolkit-panel {
  height: auto;
  min-height: 0;
  padding-bottom: 32px;
}

.toolkit-topbar {
  background:
    linear-gradient(
      180deg,
      rgba(253, 252, 248, 0.98) 0%,
      rgba(253, 252, 248, 0.9) 100%
    );
  flex-shrink: 0;
}

.toolkit-counter .counter-current {
  display: inline-block;
  min-width: 1.6em;
  text-align: right;
  transition: color 420ms cubic-bezier(0.25, 1, 0.2, 1);
  color: #2d2422;
}

.toolkit-deck {
  position: relative;
  flex: 1;
  min-height: 0;
  perspective: 1400px;
  perspective-origin: 50% 35%;
}

.toolkit-safari-lite .toolkit-deck {
  perspective: none;
}

.toolkit-stack-disabled .toolkit-deck {
  perspective: none;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px 0 8px;
}

/* Stacked / pinned mode — cards overlap */
.toolkit-card-slot {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 0 24px;
  pointer-events: none;
  transform-style: preserve-3d;
}

.toolkit-stack-disabled .toolkit-card-slot {
  position: relative;
  inset: auto;
  padding: 0;
  pointer-events: auto;
  transform-style: flat;
}

/*
  卡片尺寸：用 width 的三重夹紧来保证卡片在任何视窗都不会变得「特别扁」。
    - 第 1 项：不超过 slot 宽度
    - 第 2 项：设计上限 1180px
    - 第 3 项：基于可用高度反推的最大宽度 —— 让卡片宽高比始终接近 14:9
              (slot 高度 ≈ panel 高度 - topbar - bookmarks - slot padding ≈ 100dvh - 200px)
  height 用 auto + aspect-ratio，由 width 反推出高度，保证比例。
*/
.toolkit-card {
  width: min(100%, 1180px, calc((100dvh - 200px) * 14 / 9));
  height: auto;
  aspect-ratio: 14 / 9;
  pointer-events: auto;
  will-change: transform, opacity, filter;
  transform-origin: 50% 55%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.toolkit-stack-disabled .toolkit-card {
  position: relative;
  width: min(100%, 1180px);
  height: auto;
  aspect-ratio: auto;
  min-height: clamp(540px, 74vh, 760px);
  will-change: auto;
}

.card-surface {
  min-height: inherit;
  /* 确保卡片表面始终铺满 .toolkit-card（aspect-ratio 推导出来的高度） */
  height: 100%;
  width: 100%;
  transition:
    border-color 620ms cubic-bezier(0.25, 1, 0.2, 1),
    box-shadow 620ms cubic-bezier(0.25, 1, 0.2, 1);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-surface-active {
  border-color: rgba(255, 126, 103, 0.26) !important;
  box-shadow:
    0 2px 4px rgba(74, 59, 50, 0.08),
    0 16px 42px rgba(74, 59, 50, 0.14),
    0 28px 72px rgba(255, 176, 133, 0.15) !important;
}

.toolkit-pointer-enabled .tool-mini-card {
  transition-property: border-color, background-color, transform;
  transition-duration: 280ms;
  transition-timing-function: cubic-bezier(0.25, 1, 0.2, 1);
}

.toolkit-pointer-enabled .tool-mini-card:hover {
  border-color: rgba(255, 176, 133, 0.6);
  transform: translate3d(0, -2px, 0);
}

.toolkit-safari-lite .card-surface,
.toolkit-safari-lite .tool-mini-card {
  transition-property: border-color, opacity;
  transition-duration: 220ms;
}

.toolkit-safari-lite .safari-toolkit-surface {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.toolkit-safari-lite .card-surface-active {
  box-shadow:
    0 2px 4px rgba(74, 59, 50, 0.08),
    0 12px 30px rgba(74, 59, 50, 0.12) !important;
}

.toolkit-bookmarks {
  flex-shrink: 0;
}

.page-bookmark {
  width: 18px;
  height: 24px;
  background-color: rgba(92, 77, 73, 0.08);
}

.active-accent-line {
  filter: drop-shadow(0 0 8px rgba(255, 126, 103, 0.5));
}

.toolkit-safari-lite .active-accent-line {
  filter: none;
  opacity: 0.85;
}

.toolkit-track-line {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-family:
    "JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: rgba(74, 59, 50, 0.26);
}

/* 平板：略竖一点的宽高比，单列布局后内容更舒展 */
@media (max-width: 1023px) {
  .toolkit-stack-disabled .toolkit-panel {
    padding-right: 20px;
    padding-left: 20px;
  }

  .toolkit-card {
    width: min(100%, calc((100dvh - 220px) * 11 / 12));
    aspect-ratio: 11 / 12;
  }

  .toolkit-stack-disabled .toolkit-card {
    min-height: auto;
    aspect-ratio: auto;
  }

  .toolkit-card-body {
    flex-direction: column;
  }

  .toolkit-card-body > :first-child {
    width: 100% !important;
    border-right: 0 !important;
    border-bottom: 1px solid rgba(92, 77, 73, 0.12);
  }

  .toolkit-stack-disabled .toolkit-card-slot {
    display: block;
  }
}

/* 移动端：竖屏卡片，宽高接近 4:5，配合单列内容更耐看 */
@media (max-width: 767px) {
  .toolkit-stage {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }

  .toolkit-panel {
    padding: 0 16px;
    min-height: 580px;
  }

  .toolkit-stack-disabled .toolkit-panel {
    padding: 0 16px 24px;
  }

  .toolkit-topbar {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .toolkit-card {
    width: min(100%, calc((100dvh - 200px) * 4 / 5));
    aspect-ratio: 4 / 5;
  }

  .toolkit-stack-disabled .toolkit-card {
    aspect-ratio: auto;
  }

  .toolkit-card-slot {
    padding: 18px 0 14px;
  }

  .toolkit-stack-disabled .toolkit-card-slot {
    padding: 0;
  }

  .toolkit-stack-disabled .toolkit-card h3 {
    max-width: none !important;
  }

  .toolkit-stack-disabled .toolkit-card-body > :last-child {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 0.75rem;
  }

  .toolkit-stack-disabled .page-bookmark {
    width: 20px;
    height: 26px;
  }
}
</style>
