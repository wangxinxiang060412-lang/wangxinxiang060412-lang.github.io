<template>
  <section
    id="toolkit"
    ref="outerEl"
    class="relative overflow-hidden px-6 md:px-12 lg:px-20"
  >
    <div
      ref="sectionTrackEl"
      class="pointer-events-none absolute top-1/2 left-[40px] z-[4] hidden -translate-y-1/2 select-none gap-3 lg:flex"
      aria-hidden="true"
    >
      <span class="toolkit-track-line">TOOLKIT / 02</span>
    </div>
    <div
      ref="revealEl"
      class="pointer-events-none absolute inset-0 z-50"
      style="background: #fdfcf8; clip-path: inset(0 0 0 0)"
    />
    <div
      ref="pinWrapperEl"
      class="toolkit-pin-wrapper relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#FDFCF8]"
      style="
        border-top: 1px solid rgba(92, 77, 73, 0.14);
        padding: 68px 28px 48px;
      "
    >
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
        class="pointer-events-none absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4"
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
          class="font-display font-bold tracking-tighter text-[#5C4D49]"
          style="font-size: clamp(13px, 1.3vw, 17px)"
        >
          {{ String(activeCard + 1).padStart(2, "0") }}&nbsp;/&nbsp;{{
            String(cards.length).padStart(2, "0")
          }}
        </p>
      </div>

      <div
        ref="stackEl"
        class="cards-stack relative z-10 flex h-full w-full max-w-[1440px] items-center justify-center"
        style="height: 74vh"
      >
        <div
          v-for="(card, i) in cards"
          :key="i"
          :ref="(el) => (cardEls[i] = el)"
          class="absolute w-full will-change-transform"
          :style="{
            top: '0',
            left: '0',
            height: '100%',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(255,176,133,0.16)',
            zIndex: cards.length - i,
          }"
        >
          <div
            class="card-surface card-face relative flex h-full w-full flex-col rounded-[20px] backdrop-blur-2xl"
            :class="[
              { 'card-surface-active': i === activeCard },
              isCardVisible(i) ? '' : 'opacity-85',
            ]"
            data-easter-card="1"
            :data-figma-url="card.figmaUrl || ''"
            :data-github-url="card.githubUrl || ''"
            :style="{
              background:
                'linear-gradient(160deg, rgba(255,249,243,0.95) 0%, rgba(255,240,230,0.85) 100%)',
              border: '1px solid rgba(74,59,50,0.12)',
              boxShadow:
                '0 2px 4px rgba(74,59,50,0.06), 0 12px 36px rgba(74,59,50,0.1), 0 24px 60px rgba(255,176,133,0.08)',
            }"
            @mouseenter="onCardEnter($event)"
            @mouseleave="onCardLeave($event)"
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
                style="font-size: clamp(27px, 3.5vw, 52px); font-weight: 500; max-width: 66%"
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
                ({{ String(i + 1).padStart(2, "0") }})
              </span>
            </div>

            <div class="flex min-h-0 flex-1">
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
                      v-for="t in card.keyTools"
                      :key="t"
                      class="rounded-md border border-[#5C4D49]/20 px-2.5 py-1 font-body text-[10px] font-medium uppercase tracking-wide text-[#2D2422] transition-all duration-300 hover:border-[#FF7E67]/50"
                      >{{ t }}</span
                    >
                  </div>
                </div>
              </div>

              <div class="grid flex-1 content-start grid-cols-2 gap-3 p-7">
                <div
                  v-for="tool in card.toolItems"
                  :key="tool.name"
                  class="tool-mini-card relative cursor-default overflow-hidden rounded-xl border border-[#5C4D49]/12 bg-[#FDFCF8]/70 py-4 px-4 hover:border-[#FFB085]/60"
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
          <div class="card-back" aria-hidden="true">
            <span class="card-back-label">← Turn the page</span>
            <div class="card-back-texture" />
          </div>
        </div>
      </div>

      <div class="absolute bottom-5 z-50 flex gap-2">
        <div
          v-for="(_, i) in cards"
          :key="i"
          class="page-bookmark relative overflow-hidden rounded-[2px] border border-[#5C4D49]/20 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.2,1)]"
          :class="
            i === activeCard
              ? 'bg-[#2D2422]/16 shadow-[0_8px_16px_rgba(45,36,34,0.2)]'
              : 'bg-[#5C4D49]/8'
          "
        >
          <div
            class="bookmark-current-line absolute top-[2px] bottom-[2px] left-[2px] w-[2px] rounded-full bg-[#FF7E67] transition-opacity duration-500"
            :class="i === activeCard ? 'opacity-100' : 'opacity-0'"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createNoise3D } from "simplex-noise";

gsap.registerPlugin(ScrollTrigger);

const outerEl = ref(null);
const revealEl = ref(null);
const pinWrapperEl = ref(null);
const stackEl = ref(null);
const cardEls = ref([]);
const activeCard = ref(0);
const sectionTrackEl = ref(null);
const cardFxMap = new WeakMap();
const topoCanvasEl = ref(null);
const topoStaticEl = ref(null);

const TOPO_CELL = 28;
const TOPO_LEVEL_COUNT = 10;
const TOPO_STROKE = "rgba(74,59,50,0.08)";
const TOPO_MOUSE_RADIUS = 200;
const TOPO_MOUSE_BOOST = 0.3;
const TOPO_FLIP_BOOST = 2;

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
let topoIsReduced = false;
let topoIsMobile = false;
let topoMouse = { x: -9999, y: -9999, active: false };
let detachTopoListeners = null;
let topoScrollTrigger = null;
let topoVisibilityHandler = null;
let refreshTimer = 0;
let refreshResizeHandler = null;
let topoMouseBoost = TOPO_MOUSE_BOOST;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

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
    accentColor: "#00B4D8",
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
    accentColor: "#00829B",
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
    accentColor: "#00B4D8",
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
    accentColor: "#00829B",
  },
];

function onCardEnter(event) {
  const card = event.currentTarget;
  if (!card) return;
  let restoreTween = cardFxMap.get(card);
  restoreTween?.kill();
  gsap.to(card, {
    scale: 0.97,
    duration: 0.2,
    ease: "power3.out",
    overwrite: "auto",
  });
}

function onCardLeave(event) {
  const card = event.currentTarget;
  if (!card) return;
  const restoreTween = gsap.to(card, {
    scale: 1,
    duration: 0.7,
    ease: "elastic.out(1, 0.4)",
    overwrite: "auto",
  });
  cardFxMap.set(card, restoreTween);
}

function isCardVisible(index) {
  return Math.abs(index - activeCard.value) <= 1;
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
      let v = noise3D(x * scale, y * scale, z);
      if (topoMouse.active) {
        const dx = x - topoMouse.x;
        const dy = y - topoMouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < TOPO_MOUSE_RADIUS) {
          const t = 1 - dist / TOPO_MOUSE_RADIUS;
          v += topoMouseBoost * t * t;
        }
      }
      topoField[gy][gx] = v;
    }
  }
}

function edgePoint(x1, y1, v1, x2, y2, v2, level) {
  const d = v2 - v1;
  const t = Math.abs(d) < 1e-6 ? 0.5 : (level - v1) / d;
  return {
    x: lerp(x1, x2, t),
    y: lerp(y1, y2, t),
  };
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

  for (let li = 0; li < TOPO_LEVEL_COUNT; li += 1) {
    const level = -0.9 + (1.8 * li) / (TOPO_LEVEL_COUNT - 1);
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

function renderTopo() {
  if (!topoCtx || topoIsReduced || topoIsMobile || !topoActive) return;
  if (!topoNeedsRender) return;
  topoNeedsRender = false;
  updateTopoField();
  drawTopoContours();
}

function topoTick() {
  if (document.hidden) {
    topoFrame = 0;
    return;
  }
  renderTopo();
  topoFrame = window.requestAnimationFrame(topoTick);
}

function requestTopoRender() {
  topoNeedsRender = true;
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
  if (topoCtx) topoCtx.setTransform(topoDpr, 0, 0, topoDpr, 0, 0);
  topoGridX = Math.ceil(topoWidth / TOPO_CELL);
  topoGridY = Math.ceil(topoHeight / TOPO_CELL);
  ensureTopoFieldSize();
  requestTopoRender();
}

function buildStaticTopoSvg() {
  if (!topoStaticEl.value) return;
  const rows = Array.from({ length: 10 }, (_, idx) => {
    const y = 10 + idx * 12;
    const wobble = idx % 2 === 0 ? 2 : -2;
    return `<path d="M-5 ${y} C 15 ${y + wobble}, 35 ${y - wobble}, 55 ${y} S 95 ${y + wobble}, 105 ${y}" />`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><g fill="none" stroke="rgba(74,59,50,0.1)" stroke-width="0.9">${rows}</g></svg>`;
  topoStaticEl.value.style.backgroundImage = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  topoStaticEl.value.style.backgroundSize = "cover";
  topoStaticEl.value.style.backgroundRepeat = "no-repeat";
}

function updateTopoMode() {
  topoIsMobile = window.innerWidth < 768;
  topoIsReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const useStatic = topoIsMobile || topoIsReduced;
  if (topoCanvasEl.value)
    topoCanvasEl.value.style.display = useStatic ? "none" : "";
  if (topoStaticEl.value)
    topoStaticEl.value.style.display = useStatic ? "" : "none";
  requestTopoRender();
}

function setupTopoBackground() {
  const canvas = topoCanvasEl.value;
  const wrapper = pinWrapperEl.value;
  if (!canvas || !wrapper) return;
  topoCtx = canvas.getContext("2d");
  if (!topoCtx) return;

  buildStaticTopoSvg();
  updateTopoMode();
  resizeTopoCanvas();

  const onPointerMove = (event) => {
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
  let topoResizeTimer = 0;
  const reduceMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onReduceChange = () => {
    updateTopoMode();
    requestTopoRender();
  };
  if (typeof reduceMedia.addEventListener === "function") {
    reduceMedia.addEventListener("change", onReduceChange);
  } else {
    reduceMedia.addListener(onReduceChange);
  }

  wrapper.addEventListener("pointermove", onPointerMove, { passive: true });
  wrapper.addEventListener("pointerleave", onPointerLeave, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  topoScrollTrigger = ScrollTrigger.create({
    trigger: wrapper,
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

  topoActive = true;
  requestTopoRender();
  topoTick();

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
    clearTimeout(topoResizeTimer);
    topoResizeTimer = 0;
    if (typeof reduceMedia.removeEventListener === "function") {
      reduceMedia.removeEventListener("change", onReduceChange);
    } else {
      reduceMedia.removeListener(onReduceChange);
    }
    if (topoVisibilityHandler) {
      document.removeEventListener("visibilitychange", topoVisibilityHandler);
      topoVisibilityHandler = null;
    }
    detachTopoListeners = null;
  };
}

function playFlipSound() {
  if (typeof window === "undefined") return;
  const audioEnabled = window.audioEnabled === true;
  if (!audioEnabled || typeof window.playOnce !== "function") return;
  window.playOnce("paper-flip");
}

function setTopoBoost(boost) {
  topoMouseBoost = boost;
  requestTopoRender();
}

let ctx;
onMounted(() => {
  setupTopoBackground();
  ctx = gsap.context(() => {
    if (revealEl.value) {
      gsap.to(revealEl.value, {
        clipPath: "inset(0 0 100% 0)",
        ease: "none",
        scrollTrigger: {
          trigger: outerEl.value,
          start: "top 60%",
          end: "top 10%",
          scrub: 1,
        },
      });
    }

    if (stackEl.value) {
      stackEl.value.style.perspective = "2000px";
      stackEl.value.style.transformStyle = "preserve-3d";
    }

    gsap.set(cardEls.value, {
      rotationY: 0,
      z: -160,
      scale: 0.96,
      opacity: 0.3,
      filter: "brightness(0.86)",
      transformOrigin: "left center",
      transformStyle: "preserve-3d",
    });
    gsap.set(cardEls.value[0], {
      z: 0,
      rotationY: 0,
      scale: 1,
      opacity: 1,
      filter: "brightness(1)",
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".toolkit-pin-wrapper",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        start: "top top",
        end: () => "+=" + cards.length * window.innerHeight,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const seg = 1 / cards.length;
          activeCard.value = Math.min(
            cards.length - 1,
            Math.floor(self.progress / seg),
          );
        },
      },
    });

    cardEls.value.forEach((card, index) => {
      if (index === cardEls.value.length - 1) return;
      const nextCard = cardEls.value[index + 1];
      tl.call(() => {
        playFlipSound();
        setTopoBoost(TOPO_FLIP_BOOST);
      });
      tl.to(card, {
        rotationY: -112,
        z: -120,
        transformOrigin: "left center",
        ease: "power4.inOut",
        duration: 0.84,
      });
      tl.to(
        card,
        {
          rotationY: -105,
          ease: "power2.out",
          duration: 0.28,
        },
        ">-0.03",
      );
      tl.to(
        card,
        {
          filter: "brightness(0.85)",
          duration: 0.42,
          ease: "power2.in",
        },
        "<",
      );
      tl.to(card, {
        filter: "brightness(0.3)",
        duration: 0.58,
        ease: "power2.out",
      });
      tl.to(
        nextCard,
        {
          z: 0,
          scale: 1.018,
          opacity: 1,
          filter: "brightness(1)",
          ease: "power4.out",
          duration: 0.8,
        },
        "<+0.05",
      );
      tl.to(
        nextCard,
        {
          scale: 1,
          ease: "power2.out",
          duration: 0.28,
        },
        ">-0.06",
      );
      tl.call(() => setTopoBoost(TOPO_MOUSE_BOOST));
    });

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
      clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    };
    window.addEventListener("resize", refreshResizeHandler, { passive: true });
  }, outerEl.value);
});

onUnmounted(() => {
  if (topoFrame) {
    window.cancelAnimationFrame(topoFrame);
    topoFrame = 0;
  }
  topoScrollTrigger?.kill();
  topoScrollTrigger = null;
  detachTopoListeners?.();
  if (refreshResizeHandler) {
    window.removeEventListener("resize", refreshResizeHandler);
    refreshResizeHandler = null;
  }
  clearTimeout(refreshTimer);
  refreshTimer = 0;
  topoMouseBoost = TOPO_MOUSE_BOOST;
  ctx?.revert();
});
</script>

<style scoped>
.cards-stack {
  perspective: 2000px;
  transform-style: preserve-3d;
}

.page-bookmark {
  width: 12px;
  height: 18px;
}

.card-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-back {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  overflow: hidden;
  transform: rotateY(180deg);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background:
    linear-gradient(
      132deg,
      rgba(55, 44, 38, 0.92) 0%,
      rgba(34, 27, 24, 0.9) 44%,
      rgba(27, 22, 19, 0.95) 100%
    );
  border: 1px solid rgba(255, 176, 133, 0.24);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 12px 0 30px rgba(0, 0, 0, 0.26);
}

.card-back-label {
  position: relative;
  z-index: 2;
  font-family: "JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.36em;
  text-transform: uppercase;
  color: rgba(255, 233, 214, 0.78);
}

.card-back-texture {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 12% 24%,
      rgba(255, 176, 133, 0.24) 0%,
      transparent 44%
    ),
    repeating-linear-gradient(
      118deg,
      rgba(255, 255, 255, 0.04) 0px,
      rgba(255, 255, 255, 0.04) 2px,
      rgba(255, 255, 255, 0.01) 2px,
      rgba(255, 255, 255, 0.01) 6px
    );
  mix-blend-mode: screen;
  opacity: 0.65;
}

.card-surface {
  transition:
    box-shadow 620ms cubic-bezier(0.25, 1, 0.2, 1),
    border-color 620ms cubic-bezier(0.25, 1, 0.2, 1),
    filter 620ms cubic-bezier(0.25, 1, 0.2, 1);
}

.card-surface-active {
  border-color: rgba(255, 126, 103, 0.26) !important;
  box-shadow:
    0 2px 4px rgba(74, 59, 50, 0.08),
    0 16px 42px rgba(74, 59, 50, 0.14),
    0 28px 72px rgba(255, 176, 133, 0.15) !important;
}

.active-accent-line {
  filter: drop-shadow(0 0 8px rgba(255, 126, 103, 0.5));
}

.tool-mini-card {
  transition-property: border-color, background-color;
  transition-duration: 800ms;
  transition-timing-function: cubic-bezier(0.25, 1, 0.2, 1);
}

.tool-mini-card:hover {
  transition-duration: 200ms;
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
</style>
