<template>
  <section
    class="studio-root fixed inset-0 h-screen w-screen overflow-hidden bg-transparent"
    :style="{ '--mouse-x': `${mouse.x}px`, '--mouse-y': `${mouse.y}px` }"
    @mousemove="onShellMouseMove"
  >
    <canvas
      ref="canvasEl"
      class="studio-canvas fixed inset-0 h-full w-full touch-none outline-none"
      style="touch-action: none"
      role="application"
      :aria-label="canvasAriaLabel"
      aria-roledescription="可交互的3D卡片展示区域"
      tabindex="0"
      @keydown="onCanvasKeydown"
    />

    <!-- ✅ HOVER PREVIEW (clamped within viewport) -->
    <div
      v-show="hoverPreview.visible"
      ref="hoverPreviewEl"
      class="hover-preview pointer-events-none fixed z-[57] min-w-[212px] max-w-[280px] rounded-[8px] border border-[#4A3B32]/15 bg-[rgba(253,252,248,0.96)] px-[14px] py-[10px] text-[#2D2422] shadow-[0_20px_35px_rgba(45,36,34,0.18)]"
      :style="{
        left: `${hoverPreview.x}px`,
        top: `${hoverPreview.y}px`,
        transform: 'translate(-50%, 0)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }"
      aria-hidden="true"
    >
      <p class="hover-preview-title">
        {{ hoverPreview.idLabel }} · {{ hoverPreview.title }}
      </p>
      <p class="hover-preview-act mt-1">
        ACT {{ hoverPreview.actLabel }} · {{ hoverPreview.sceneLabel }}
      </p>
      <p class="hover-preview-hint mt-2">↗ 点击展开</p>
    </div>

    <!-- ✅ INTRO OVERLAY — now with proper dark backdrop so the text is readable -->
    <div
      v-if="showIntroOverlay"
      ref="introOverlayEl"
      class="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center px-8"
      aria-hidden="true"
    >
      <div
        class="absolute inset-0"
        style="
          background: radial-gradient(
              ellipse at center,
              rgba(10, 8, 6, 0.78) 0%,
              rgba(10, 8, 6, 0.92) 60%,
              rgba(10, 8, 6, 0.96) 100%
            );
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        "
      />
      <div class="relative z-10 text-center">
        <p class="intro-line-cn text-[#F5EFE5]">
          <span
            v-for="(char, i) in introLineChars[0]"
            :key="`intro-cn-${i}`"
            :ref="(node) => setIntroCharRef(node, 0, i)"
            class="intro-char"
          >
            {{ char === " " ? "\u00A0" : char }}
          </span>
        </p>
        <p class="intro-line-en mt-3 text-[#F5EFE5]/72">
          <span
            v-for="(char, i) in introLineChars[1]"
            :key="`intro-en-${i}`"
            :ref="(node) => setIntroCharRef(node, 1, i)"
            class="intro-char"
          >
            {{ char === " " ? "\u00A0" : char }}
          </span>
        </p>
        <p class="intro-skip mt-8 text-[#F5EFE5]/45">
          按任意键 / 点击 跳过
        </p>
      </div>
    </div>

    <!-- ✅ ERROR OVERLAY -->
    <div
      v-if="resourceErrorMessage"
      class="fixed inset-0 z-[120] flex items-center justify-center bg-[#120f0d]/82 px-6"
    >
      <div
        class="w-full max-w-[520px] rounded-2xl border border-[#FFB085]/40 bg-[#2A211D]/92 p-8 text-center shadow-[0_30px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        <p
          class="font-display text-[34px] leading-none tracking-[-0.02em] text-[#FDFCF8]"
        >
          资源加载异常
        </p>
        <p
          class="mt-3 font-body text-[15px] leading-relaxed text-[#FDFCF8]/80"
        >
          {{ resourceErrorMessage }}
        </p>
        <button
          type="button"
          class="mt-7 inline-flex items-center justify-center rounded-full border border-[#FFB085]/65 bg-[#FFB085]/18 px-6 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#FDFCF8] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.2,1)] hover:bg-[#FFB085]/28"
          @click="reloadScene"
        >
          刷新重试
        </button>
      </div>
    </div>

    <!-- ✅ BACK BUTTON -->
    <button
      ref="backBtnEl"
      type="button"
      class="fixed left-8 top-8 z-[60] flex items-center gap-2.5 rounded-full border border-[#5C4D49]/28 bg-[#FDFCF8]/85 px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#4A3B32] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.2,1)] hover:-translate-x-1 hover:bg-[#5C4D49]/6 hover:text-[#2D2422]"
      style="backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); opacity: 0;"
      @click="goBack"
      @mouseenter="setCursorHover(true, 'BACK')"
      @mouseleave="clearCursorHover"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>返回</span>
    </button>

    <!-- ✅ PROGRESS INDICATOR -->
    <div
      ref="progressWrapEl"
      class="pointer-events-none fixed left-1/2 top-8 z-[58] -translate-x-1/2"
      :class="focusedMesh ? 'opacity-35' : 'opacity-100'"
      style="opacity: 0; transition: opacity 500ms cubic-bezier(0.25,1,0.2,1);"
      aria-hidden="true"
    >
      <div class="studio-progress flex items-center gap-7">
        <div
          v-for="scene in progressScenes"
          :key="scene.label"
          class="flex items-center gap-2.5"
        >
          <div class="flex items-center gap-1">
            <span
              v-for="dotIndex in scene.count"
              :key="`${scene.label}-${dotIndex}`"
              class="studio-progress-dot"
              :class="{
                'studio-progress-dot-active':
                  scene.start + dotIndex - 1 === activeCardIndex,
              }"
            />
          </div>
          <span
            class="studio-progress-label"
            :class="
              activeSceneLabel === scene.label
                ? 'studio-progress-label-active'
                : 'studio-progress-label-idle'
            "
          >
            {{ scene.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- ✅ HINT TEXT -->
    <Transition name="hint-fade">
      <div
        v-if="!activeCard && !showIntroOverlay && hasKeyboardNavigation"
        ref="bottomHintEl"
        class="pointer-events-none fixed bottom-8 left-1/2 z-[55] flex -translate-x-1/2 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#4A3B32]/80"
        style="opacity: 0;"
      >
        <span class="flex items-center gap-1.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M8 12l-4-4m0 0l4-4m-4 4h16m0 0l-4-4m4 4l-4 4" />
          </svg>
          拖拽
        </span>
        <span class="h-3 w-px bg-[#5C4D49]/20"></span>
        <span>点击查看详情</span>
        <span class="h-3 w-px bg-[#5C4D49]/20"></span>
        <span>← → 翻卡 · Enter 聚焦 · Esc 返回</span>
      </div>
    </Transition>

    <!-- ✅ DETAIL HINT (focus-only, repositioned to avoid panel overlap) -->
    <div
      v-if="focusedMesh"
      class="pointer-events-none fixed bottom-6 left-1/2 z-[56] -translate-x-1/2 rounded-full border border-[#5C4D49]/20 bg-[#FDFCF8]/78 px-4 py-2 text-[#4A3B32]/72"
      style="backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);"
      aria-hidden="true"
    >
      <p class="detail-hint-label">滚轮放大 · 拖动平移 · Esc 返回</p>
    </div>

    <!-- ✅ DETAIL PANEL -->
    <Transition
      name="slide-fade"
      :css="false"
      @enter="onPanelEnter"
      @leave="onPanelLeave"
    >
      <div
        v-if="activeCard"
        class="pointer-events-none fixed inset-0 z-50 px-6 md:px-12 lg:px-20"
      >
        <div
          class="pointer-events-none relative mx-auto h-full w-full max-w-[1440px]"
        >
          <aside
            class="studio-panel pointer-events-auto absolute right-0 top-1/2 z-[100] max-h-[78vh] w-[90vw] -translate-y-1/2 overflow-y-auto rounded-3xl border border-[#5C4D49]/12 p-7 text-[#2D2422] shadow-[0_20px_45px_rgba(74,59,50,0.18)] will-change-[transform,backdrop-filter] md:w-[380px] md:p-8"
          >
            <div class="relative z-10">
              <button
                type="button"
                class="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-[#5C4D49]/20 bg-[#FDFCF8]/85 text-[18px] leading-none text-[#5C4D49] transition-all duration-500 hover:rotate-90 hover:bg-[#5C4D49]/8 hover:text-[#2D2422]"
                @click="resetCamera"
                @mouseenter="setCursorHover(true, 'CLOSE')"
                @mouseleave="clearCursorHover"
                @focus="setCursorHover(true, 'CLOSE')"
                @blur="clearCursorHover"
                aria-label="关闭详情面板"
              >
                ×
              </button>
              <p
                data-panel-fade
                class="panel-kicker mb-3 pr-12 text-[#5C4D49]/82"
              >
                ACT {{ String(activeCard.act).padStart(2, "0") }} ·
                {{ actLabelCn[activeCard.act] }}
              </p>
              <h3
                data-panel-fade
                class="font-display mb-4 flex flex-wrap items-baseline pr-12 text-[24px] leading-tight tracking-[-0.02em] text-[#2D2422]"
                style="font-weight: 600"
              >
                <span>{{ activeCard.title }}</span>
              </h3>

              <div data-panel-fade class="space-y-5">
                <section v-if="activeCard.intent">
                  <p class="panel-label mb-1.5 text-[#5C4D49]/75">
                    Intent / 目标
                  </p>
                  <p class="panel-body text-[#4A3B32]">
                    {{ activeCard.intent }}
                  </p>
                </section>

                <section v-if="activeCard.decision">
                  <p class="panel-label mb-1.5 text-[#5C4D49]/75">
                    Design decision / 设计决策
                  </p>
                  <p class="panel-body text-[#4A3B32]">
                    {{ activeCard.decision }}
                  </p>
                </section>

                <section v-if="activeCard.insight || activeCard.id === cardData.length">
                  <p class="panel-label mb-1.5 text-[#5C4D49]/75">
                    Outcome / 结果
                  </p>
                  <p
                    class="panel-body"
                    :class="
                      activeCard.insight
                        ? 'text-[#4A3B32]'
                        : 'panel-body-empty text-[#5C4D49]/55'
                    "
                  >
                    {{
                      activeCard.insight ||
                      "（可量化或可感知的结果，待补充）"
                    }}
                  </p>
                </section>
              </div>

              <div
                data-panel-fade
                class="mt-7 flex items-center justify-between border-t border-[#5C4D49]/12 pt-4"
              >
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="panel-nav-btn"
                    aria-label="上一张卡片"
                    @click="focusPrevCard"
                    @mouseenter="setCursorHover(true, 'PREV')"
                    @mouseleave="clearCursorHover"
                    @focus="setCursorHover(true, 'PREV')"
                    @blur="clearCursorHover"
                  >
                    ← 上一个
                  </button>
                  <button
                    type="button"
                    class="panel-nav-btn"
                    aria-label="下一张卡片"
                    @click="focusNextCard"
                    @mouseenter="setCursorHover(true, 'NEXT')"
                    @mouseleave="clearCursorHover"
                    @focus="setCursorHover(true, 'NEXT')"
                    @blur="clearCursorHover"
                  >
                    下一个 →
                  </button>
                </div>
                <p class="panel-label text-[#4A3B32]/82">
                  {{ String(activeCard.id).padStart(2, "0") }} /
                  {{ String(cardData.length).padStart(2, "0") }}
                </p>
              </div>

              <Transition name="epilogue-rise">
                <section
                  v-if="showEpilogueCard"
                  class="mt-5 rounded-2xl border border-[#5C4D49]/14 bg-[#FFB085]/[0.06] px-4 py-4"
                >
                  <p class="panel-label text-[#5C4D49]/75">
                    EPILOGUE · 终章
                  </p>
                  <h4
                    class="font-display mt-2 text-[20px] tracking-[-0.02em] text-[#2D2422]"
                    style="font-weight: 600"
                  >
                    从设计到落地
                  </h4>
                  <p class="panel-body mt-2 text-[#4A3B32]/92">
                    {{ epilogueSummary }}
                  </p>
                  <a
                    href="#contact"
                    class="panel-epilogue-cta mt-3 inline-flex items-center"
                    @click="goBack"
                    @mouseenter="setCursorHover(true, 'CONTACT')"
                    @mouseleave="clearCursorHover"
                    @focus="setCursorHover(true, 'CONTACT')"
                    @blur="clearCursorHover"
                  >
                    联系我聊聊 →
                  </a>
                </section>
              </Transition>
            </div>
          </aside>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  shallowRef,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { gsap } from "gsap";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { useCustomCursor } from "../composables/useCustomCursor";
import { isStudioOpen } from "../composables/useStudio";
import { useScrollLock } from "../composables/useScrollLock";

/* ───────────────────────────────────────────────────────────
   REFS / STATE
   ─────────────────────────────────────────────────────────── */
const canvasEl = ref(null);
const backBtnEl = ref(null);
const progressWrapEl = ref(null);
const bottomHintEl = ref(null);
const introOverlayEl = ref(null);
const hoverPreviewEl = ref(null);
const activeCard = ref(null);
const mouse = reactive({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
let mouseX = 0;
let mouseY = 0;
const showIntroOverlay = ref(true);
const hasKeyboardNavigation = ref(false);
const introLines = [
  "一段 LightTrip 的设计策展",
  "A curated journey through LightTrip",
];
const introLineChars = introLines.map((line) => Array.from(line));
const introCharRefs = ref(
  introLineChars.map((chars) => new Array(chars.length).fill(null)),
);
const showEpilogueCard = ref(false);
const hoverPreview = reactive({
  visible: false,
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5,
  idLabel: "01",
  actLabel: "01",
  sceneLabel: "Strategy",
  title: "",
});
const resourceErrorMessage = ref("");
const epilogueSummary =
  "这套设计的目标是把碎片化的旅行决策压缩到 10 分钟内完成。从战略到界面，每一个决策都围绕「少输入、少跳转、少冗余」展开。如果你也在思考类似问题，欢迎一起聊聊。";

const { setCursorEnabled, setCursorHover, clearCursorHover } = useCustomCursor();
const { lock, unlock, forceUnlock } = useScrollLock();
const router = useRouter();
const actLabelCn = { 1: "战略", 2: "规划", 3: "界面" };
const canvasAriaLabel = computed(() => {
  const total = cardData.length;
  const idx = ((activeCardIndex.value % total) + total) % total;
  const card = cardData[idx];
  return `策展空间，共 ${total} 张卡片，当前显示第 ${idx + 1} 张：${card?.title || "未命名"}`;
});

/* ───────────────────────────────────────────────────────────
   MOTION PREFERENCE
   ─────────────────────────────────────────────────────────── */
let prefersReducedMotion = false;
let reducedMotionMedia = null;
let onReducedMotionChange = null;
function detectReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ───────────────────────────────────────────────────────────
   CARD DATA — placeholder copy filled so the panel never looks empty
   ─────────────────────────────────────────────────────────── */
const cardData = [
  {
    id: 1,
    act: 1,
    title: "产品定位",
    intent: "锁定核心人群，定义「轻旅」的产品边界。",
    decision:
      "面向 18-30 岁的年轻用户，以「10 分钟完成一次高质量旅行决策」为单一目标，舍弃多日深度行程规划、社区话题流等会扩散注意力的功能。",
    insight: "",
    texture: "/lighttrip/lt-1.png",
    actTitle: "STRATEGY 战略",
  },
  {
    id: 2,
    act: 1,
    title: "需求与空白",
    intent: "找出现有市场的「未被满足」点。",
    decision:
      "对比 5 款主流旅行 App 的决策路径后，归纳出共性问题：信息过载、平台分散、表单冗长。轻旅的设计原则因此聚焦「少输入、少跳转、少冗余」。",
    insight: "",
    texture: "/lighttrip/lt-2.png",
    actTitle: "STRATEGY 战略",
  },
  {
    id: 3,
    act: 2,
    title: "产品功能脑图",
    intent: "把战略转译为可执行的功能矩阵。",
    decision:
      "梳理启动页、登录、首页、搜索、探索、详情、AI 助手、发布、消息、个人中心十大模块的关系与信息流。每个节点都标注「核心 / 支撑 / 可去除」三档优先级。",
    insight: "",
    texture: "/lighttrip/lt-3.png",
    actTitle: "BLUEPRINT 规划",
  },
  {
    id: 4,
    act: 2,
    title: "用户体验地图",
    intent: "看见用户在「规划前 → 规划中 → 执行中」的真实情绪曲线。",
    decision:
      "覆盖三个阶段的 12 个关键触点，标记情绪低谷（决策疲劳、信息冲突、临场焦虑）作为产品节奏与功能优先级的依据。",
    insight: "",
    texture: "/lighttrip/lt-4.png",
    actTitle: "BLUEPRINT 规划",
  },
  {
    id: 5,
    act: 2,
    title: "界面设计总览",
    intent: "建立跨场景一致的视觉语言与信息密度规范。",
    decision:
      "采用高可读分层 + 统一色彩 token + 三档信息密度（卡片 / 列表 / 详情）。不同场景调用同一套组件，保证操作效率与品牌一致性。",
    insight: "",
    texture: "/lighttrip/lt-5.png",
    actTitle: "BLUEPRINT 规划",
  },
  {
    id: 6,
    act: 3,
    title: "登录与注册",
    intent: "把首次进入路径压到最短。",
    decision:
      "支持验证码、密码两种轻量入口，并允许「先体验再登录」。账号体系保证后续个性化与成长能力，但不在第一秒拦住用户。",
    insight: "",
    texture: "/lighttrip/lt-6.png",
    actTitle: "INTERFACE 界面",
  },
  {
    id: 7,
    act: 3,
    title: "首页与探索",
    intent: "让用户在 3 秒内看到「下一步可以做什么」。",
    decision:
      "首页聚合目的地卡片、个性化推荐与探索入口。清晰分区 + 轻量交互反馈（点击预览、收藏微动画）提升浏览效率与发现质量。",
    insight: "",
    texture: "/lighttrip/lt-7.png",
    actTitle: "INTERFACE 界面",
  },
  {
    id: 8,
    act: 3,
    title: "AI 助手页",
    intent: "用尽量少的输入生成尽量可用的行程建议。",
    decision:
      "AI 助手以对话 + 卡片混合输出。生成结果同时呈现关键攻略要点与「为什么这么推荐」的解释，兼顾可执行性与可解释性。",
    insight: "",
    texture: "/lighttrip/lt-8.png",
    actTitle: "INTERFACE 界面",
  },
  {
    id: 9,
    act: 3,
    title: "详情页与交互",
    intent: "让用户在一屏内完成「了解 → 比较 → 决策」。",
    decision:
      "围绕收藏、评论、路线信息与时间轴四个动作组织内容。下方常驻的悬浮 CTA 让动作触达率提升，时间轴让用户对行程节奏有空间感。",
    insight: "",
    texture: "/lighttrip/lt-9.png",
    actTitle: "INTERFACE 界面",
  },
  {
    id: 10,
    act: 3,
    title: "发布与消息",
    intent: "形成「创作—反馈」的闭环，提升留存。",
    decision:
      "发布与消息复用同一套组件结构，让创作者和读者的视图保持一致。互动沉淀转化为通知与社区活跃，但不会无理由打扰。",
    insight: "",
    texture: "/lighttrip/lt-10.png",
    actTitle: "INTERFACE 界面",
  },
  {
    id: 11,
    act: 3,
    title: "个人中心",
    intent: "把「我的旅行资产」一站式呈现。",
    decision:
      "整合收藏、点赞、历史与行程资产到统一视图。用户对自己的内容有完整回看与管理权，也强化了对产品的归属感。",
    insight: "",
    texture: "/lighttrip/lt-11.png",
    actTitle: "INTERFACE 界面",
  },
];

const progressScenes = [
  { label: "STRATEGY", count: 2, start: 0 },
  { label: "BLUEPRINT", count: 3, start: 2 },
  { label: "INTERFACE", count: 6, start: 5 },
];
const activeCardIndex = ref(0);
const activeAct = ref(1);
const activeSceneLabel = ref(progressScenes[0].label);

/* ───────────────────────────────────────────────────────────
   THREE.JS STATE
   ─────────────────────────────────────────────────────────── */
let scene, camera, renderer, raycaster, ndc;
let cardsGroup;
let animationId = 0;
let dustParticles;
let dustBasePositions = null;
let inkSpriteCloud;
let floorMesh;
let topSpotLight;
let composer;
let bloomPass;
const particleMouseWorld = new THREE.Vector3();
const PARTICLE_MOUSE_FIELD_SCALE = 8;
const FLOOR_TEXTURE_PATH = "/textures/paper-floor.jpg";

const meshes = [];
const pivots = [];
const actLabelSprites = [];
const actAnchorSprites = [];
const ACT_HEADER_LIFT = 17;
const ACT_HEADER_RADIUS_OFFSET = 6;
const ACT_ANCHOR_RADIUS_OFFSET = 5;
const ACT_ANCHOR_LIFT = 7;
const ringLayout = {
  angleByIndex: [],
  ranges: [],
};

let targetRotation = 0;
let isDragging = false;
let isFocusAnimating = false; // 动画进程锁
let isReturning = false; // 返航状态锁
let focusAnimUnlockCall = null;
let returnUnlockCall = null;
let pendingFocusOffset = 0;
let lastPointerX = 0;
let pointerDownX = 0;
let pointerDownY = 0;
let pointerDownTime = 0;
let velocity = 0;
let springVelocity = 0;
let angularVelocity = 0;
let lastDragTime = 0;
const SPRING_STIFFNESS = 0.06;
const SPRING_DAMPING = 0.82;
const SPRING_MASS = 1.2;
const SNAP_SPRING_STIFFNESS = 0.04;
const SNAP_SPRING_DAMPING = 0.75;
const ANGULAR_FRICTION = 0.94;
const MIN_FLING_VELOCITY = 0.002;
const FLING_VELOCITY_FACTOR = 0.035;
const SNAP_OVERSHOOT_RAD = THREE.MathUtils.degToRad(4);
const SNAP_REACHED_EPS = THREE.MathUtils.degToRad(0.8);
let snapOvershootPending = false;
let snapReturnPending = false;
let snapFinalTarget = 0;
let settlingAfterDrag = false;
const dragVelocitySamples = [];

const resizeListenerOpts = { passive: true };
const pointerListenerOpts = { passive: true };

let resizeHandler,
  pointerDownHandler,
  pointerMoveHandler,
  pointerUpHandler,
  clickHandler,
  wheelHandler;
let resizeTimer = 0;
let lastViewportWidth = window.innerWidth;
let lastViewportHeight = window.innerHeight;

const focusedMesh = shallowRef(null);
let focusTiltEnabled = false;
let hoveredMesh = null;
let disposeRequested = false;
let onVisibilityChange = null;
let detailBaseScale = 1;
let detailCurrentScale = 1;
let detailLastPointer = null;
const DETAIL_MAX_SCALE = 2.4;
const DETAIL_PAN_SENSITIVITY = 0.032;
const KEY_ROTATION_STEP = (Math.PI * 2) / Math.max(1, cardData.length);
const rotationTweenState = { value: 0 };
let rotationTween = null;
let introTimeline = null;
let introRunning = true;
let epilogueTimer = null;
let epilogueManualReveal = false;
let hoverPreviewTimer = null;
let actTransitionRunning = false;
const hoverPreviewWorld = new THREE.Vector3();

let hoverStableFrames = 0;
let lastHoverCandidate = null;
const HOVER_STABILITY_FRAMES = 3;

const RING_RADIUS_DESKTOP = 38;
const RING_RADIUS_MOBILE = 28;
const CAMERA_FOV = 45;
const CAMERA_DEFAULT_Z = 85;
const CAMERA_PAN_X_FOCUS = -22;
const CAMERA_FOCUS_Z = 76;
let cameraDefaultZ = CAMERA_DEFAULT_Z;

const CARD_SCALE_DESKTOP = 0.01;
const CARD_SCALE_MOBILE = 0.007;

const HOVER_PREVIEW_PADDING = 16;
const HOVER_PREVIEW_HEIGHT = 92;

/* ───────────────────────────────────────────────────────────
   HELPERS
   ─────────────────────────────────────────────────────────── */
function formatSceneLabel(act) {
  const scene = progressScenes[act - 1];
  const label = (scene?.label || "ACT").toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function clearHoverPreviewTimer() {
  if (!hoverPreviewTimer) return;
  window.clearTimeout(hoverPreviewTimer);
  hoverPreviewTimer = null;
}

function clampHoverPreviewPosition() {
  const padding = HOVER_PREVIEW_PADDING;
  const minY = padding;
  const maxY = window.innerHeight - padding - HOVER_PREVIEW_HEIGHT;
  hoverPreview.y = Math.min(Math.max(hoverPreview.y, minY), maxY);
}

function updateHoverPreviewPosition(mesh) {
  if (!mesh || !camera || !renderer) return;
  mesh.getWorldPosition(hoverPreviewWorld);
  hoverPreviewWorld.project(camera);
  const rawX = (hoverPreviewWorld.x * 0.5 + 0.5) * window.innerWidth;
  // Tooltip 最大宽度约 280px，一半 140px + 20px 安全边距 = 160
  hoverPreview.x = Math.max(160, Math.min(window.innerWidth - 160, rawX));
  hoverPreview.y =
    (-hoverPreviewWorld.y * 0.5 + 0.5) * window.innerHeight + 24;
  clampHoverPreviewPosition();
}

function hideHoverPreview() {
  clearHoverPreviewTimer();
  const node = hoverPreviewEl.value;
  if (!hoverPreview.visible) return;
  if (!node) {
    hoverPreview.visible = false;
    return;
  }
  gsap.killTweensOf(node);
  gsap.to(node, {
    opacity: 0,
    duration: 0.15,
    ease: "power2.out",
    onComplete: () => {
      hoverPreview.visible = false;
    },
  });
}

function showHoverPreviewDelayed(mesh) {
  clearHoverPreviewTimer();
  if (prefersReducedMotion) return;
  hoverPreviewTimer = window.setTimeout(() => {
    if (
      !mesh ||
      hoveredMesh !== mesh ||
      focusedMesh.value ||
      isDragging
    )
      return;
    hoverPreview.idLabel = String(mesh.userData.id || 0).padStart(2, "0");
    hoverPreview.actLabel = String(mesh.userData.act || 1).padStart(2, "0");
    hoverPreview.sceneLabel = formatSceneLabel(mesh.userData.act || 1);
    hoverPreview.title = mesh.userData.title || "";
    updateHoverPreviewPosition(mesh);
    hoverPreview.visible = true;
    const node = hoverPreviewEl.value;
    if (!node) return;
    gsap.killTweensOf(node);
    gsap.fromTo(
      node,
      { opacity: 0, y: 8, scale: 0.92, transformOrigin: "50% 0%" },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.35,
        ease: "power3.out",
      },
    );
  }, 300);
}

function normalizeAngle(angle) {
  return ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
}

function shortestRotationTarget(current, desired) {
  const delta = Math.atan2(
    Math.sin(desired - current),
    Math.cos(desired - current),
  );
  return current + delta;
}

function animateTargetRotationTo(angle, duration = 0.58) {
  rotationTween?.kill();
  rotationTweenState.value = targetRotation;
  rotationTween = gsap.to(rotationTweenState, {
    value: angle,
    duration: prefersReducedMotion ? 0 : duration,
    ease: "power3.inOut",
    onUpdate: () => {
      targetRotation = rotationTweenState.value;
    },
  });
}

function lockFocusAnimating(timeoutSec = 1.3) {
  focusAnimUnlockCall?.kill();
  isFocusAnimating = true;
  focusAnimUnlockCall = gsap.delayedCall(timeoutSec, () => {
    isFocusAnimating = false;
    focusAnimUnlockCall = null;
  });
}

function unlockFocusAnimating() {
  focusAnimUnlockCall?.kill();
  focusAnimUnlockCall = null;
  isFocusAnimating = false;
  if (!pendingFocusOffset || !meshes.length) return;
  const queuedOffset = pendingFocusOffset;
  pendingFocusOffset = 0;
  // 下一帧执行，避免在当前 GSAP 回调栈内重入
  gsap.delayedCall(0, () => {
    if (!isFocusAnimating) focusCardByOffset(queuedOffset);
  });
}

function lockReturning(timeoutSec = 1.1) {
  returnUnlockCall?.kill();
  isReturning = true;
  returnUnlockCall = gsap.delayedCall(timeoutSec, () => {
    isReturning = false;
    returnUnlockCall = null;
  });
}

function rotateToCardIndex(index, duration = 0.62) {
  const normalizedIndex =
    ((index % cardData.length) + cardData.length) % cardData.length;
  const angle = ringLayout.angleByIndex[normalizedIndex];
  if (typeof angle !== "number") return;
  const desired = -angle;
  const nextTarget = shortestRotationTarget(targetRotation, desired);
  animateTargetRotationTo(nextTarget, duration);
}

function getCenterCardIndex() {
  if (!meshes.length || !cardsGroup) return 0;
  const totalAngle = Math.PI * 2;
  const cardCount = meshes.length;
  const anglePerCard = totalAngle / cardCount;
  const currentRot =
    ((-cardsGroup.rotation.y % totalAngle) + totalAngle) % totalAngle;
  return Math.round(currentRot / anglePerCard) % cardCount;
}

function getRotationForCenterIndex(index) {
  const count = Math.max(1, meshes.length);
  const normalizedIndex = ((index % count) + count) % count;
  const anglePerCard = (Math.PI * 2) / count;
  const desired = -normalizedIndex * anglePerCard;
  return shortestRotationTarget(targetRotation, desired);
}

function pulseCardEmissiveByIndex(index) {
  const mesh = meshes[index];
  if (!mesh) return;
  const frontMat = getFrontMaterial(mesh);
  if (!frontMat) return;
  gsap.killTweensOf(frontMat);
  frontMat.emissive.set(0xffb085);
  gsap.fromTo(
    frontMat,
    { emissiveIntensity: 0 },
    {
      emissiveIntensity: 0.2,
      duration: 0.15,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        frontMat.emissiveIntensity = 0;
      },
    },
  );
}

function getNearestCardRotation(currentRotation) {
  if (!ringLayout.angleByIndex.length) return currentRotation;
  const frontAngle = normalizeAngle(-currentRotation);
  let nearestAngle = ringLayout.angleByIndex[0] ?? 0;
  let nearestDist = Number.POSITIVE_INFINITY;
  ringLayout.angleByIndex.forEach((cardAngle) => {
    const diff = Math.atan2(
      Math.sin(frontAngle - cardAngle),
      Math.cos(frontAngle - cardAngle),
    );
    const dist = Math.abs(diff);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestAngle = cardAngle;
    }
  });
  return shortestRotationTarget(currentRotation, -nearestAngle);
}

function applyDragCompression() {
  const frontAngle = normalizeAngle(-cardsGroup.rotation.y);
  meshes.forEach((m) => {
    if (m === hoveredMesh) return;
    const base = getRingRestScale(m);
    const diff = Math.atan2(
      Math.sin(frontAngle - (m.userData.angle || 0)),
      Math.cos(frontAngle - (m.userData.angle || 0)),
    );
    const delay = Math.min(0.16, Math.abs(diff) / Math.PI * 0.16);
    gsap.to(m.scale, {
      x: base * 0.98,
      y: base * 0.98,
      z: base,
      duration: 0.22,
      delay,
      ease: "power2.out",
      overwrite: "auto",
    });
  });
}

function clearDragCompression() {
  meshes.forEach((m) => {
    if (m === hoveredMesh) return;
    const base = getRingRestScale(m);
    gsap.to(m.scale, {
      x: base,
      y: base,
      z: base,
      duration: 0.62,
      ease: "elastic.out(1, 0.55)",
      overwrite: "auto",
    });
  });
}

function focusCardByIndex(index) {
  const normalizedIndex =
    ((index % meshes.length) + meshes.length) % meshes.length;
  const mesh = meshes[normalizedIndex];
  if (!mesh) return;
  focusMesh(mesh);
}

function transitionFocusAcrossActs(targetIndex) {
  if (actTransitionRunning) return;
  actTransitionRunning = true;
  resetCamera(false);
  rotateToCardIndex(targetIndex, 0.6);
  gsap.delayedCall(0.7, () => {
    if (!disposeRequested && meshes[targetIndex]) {
      focusCardByIndex(targetIndex);
    }
    actTransitionRunning = false;
  });
}

function isAngleInRange(angle, start, end) {
  if (start <= end) return angle >= start && angle < end;
  return angle >= start || angle < end;
}

function updateActiveActByRotation() {
  if (!cardData.length) return;
  if (focusedMesh.value?.userData?.id) {
    activeCardIndex.value = focusedMesh.value.userData.id - 1;
  } else {
    const frontAngle = normalizeAngle(-targetRotation);
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    ringLayout.angleByIndex.forEach((cardAngle, index) => {
      const diff = Math.atan2(
        Math.sin(frontAngle - cardAngle),
        Math.cos(frontAngle - cardAngle),
      );
      const dist = Math.abs(diff);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestIndex = index;
      }
    });
    activeCardIndex.value = nearestIndex;
  }

  const frontAngle = normalizeAngle(-targetRotation);
  const activeRange = ringLayout.ranges.find((range) =>
    isAngleInRange(frontAngle, range.start, range.end),
  );
  activeAct.value =
    activeRange?.act || cardData[activeCardIndex.value]?.act || 1;
  activeSceneLabel.value =
    progressScenes.find((scene) => scene.label === activeRange?.label)?.label ||
    progressScenes[activeAct.value - 1]?.label ||
    progressScenes[0].label;
}

function clearCardHoverState() {
  clearCursorHover();
  if (!hoveredMesh) return;
  hideHoverPreview();
  const m = hoveredMesh;
  const frontMat = getFrontMaterial(m);
  hoveredMesh = null;
  hoverStableFrames = 0;
  lastHoverCandidate = null;
  gsap.killTweensOf(m.position);
  if (frontMat) gsap.killTweensOf(frontMat);
  gsap.killTweensOf(m.rotation);
  gsap.killTweensOf(m.scale);
  gsap.to(m.position, {
    z: m.userData.origPos.z,
    duration: 0.6,
    ease: "power2.out",
  });
  const rs = getRingRestScale(m);
  gsap.to(m.scale, { x: rs, y: rs, z: rs, duration: 0.5, ease: "power2.out" });
  gsap.to(m.rotation, {
    x: m.userData.origRot.x,
    y: m.userData.origRot.y,
    z: m.userData.origRot.z,
    duration: 0.6,
    ease: "power2.out",
  });
}

/* ───────────────────────────────────────────────────────────
   UI HELPERS
   ─────────────────────────────────────────────────────────── */
function goBack() {
  if (introRunning) {
    skipIntroAnimation();
    return;
  }
  if (focusedMesh.value) {
    unfocusMesh();
  } else {
    isStudioOpen.value = false;
    if (router.currentRoute.value.path.includes("/work/lighttrip")) {
      router.push("/");
    }
  }
}

function setIntroCharRef(node, lineIndex, charIndex) {
  if (!introCharRefs.value[lineIndex]) introCharRefs.value[lineIndex] = [];
  introCharRefs.value[lineIndex][charIndex] = node || null;
}

function clearEpilogueTimer() {
  if (!epilogueTimer) return;
  window.clearTimeout(epilogueTimer);
  epilogueTimer = null;
}

function unfocusMesh() {
  resetCamera(true);
}

function focusCardByOffset(offset) {
  if (!meshes.length) return;
  if (isFocusAnimating) {
    pendingFocusOffset = offset;
    return;
  }
  const current = focusedMesh.value?.userData?.id
    ? focusedMesh.value.userData.id - 1
    : activeCardIndex.value;
  const total = meshes.length;
  const nextIndex = (current + offset + total) % total;
  const target = meshes[nextIndex];
  if (target) focusMesh(target);
}

function focusPrevCard() {
  focusCardByOffset(-1);
}

function focusNextCard() {
  focusCardByOffset(1);
}

/* ───────────────────────────────────────────────────────────
   THREE INIT
   ─────────────────────────────────────────────────────────── */
function initThree() {
  scene = new THREE.Scene();
  scene.background = null;

  // ✅ 修复 1：加入全局环境光，提供基础明暗，消除绝对死黑
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  // ✅ 修复 2：在摄像机同侧（+Z方向）加入一盏正面补光，打亮卡片正面
  const frontLight = new THREE.DirectionalLight(0xfff1dd, 0.6);
  frontLight.position.set(0, 20, 100);
  scene.add(frontLight);

  const isMobile = window.innerWidth < 768;
  const aspect = window.innerWidth / window.innerHeight;
  const cameraZ = isMobile ? 90 : aspect < 1.2 ? 100 : CAMERA_DEFAULT_Z;
  cameraDefaultZ = cameraZ;

  camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    0.1,
    2000,
  );
  camera.position.set(0, 0, cameraZ);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl.value,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  raycaster = new THREE.Raycaster();
  ndc = new THREE.Vector2();

  cardsGroup = new THREE.Group();
  cardsGroup.position.set(0, 0, 0);
  scene.add(cardsGroup);

  createCuratorFloor();
  createTopSpotLight();
  initPostProcessing();
}

function createAmbientParticles() {
  const warmA = new THREE.Color(0xe6d3b8);
  const warmB = new THREE.Color(0xffb085);

  const dustCount = prefersReducedMotion ? 100 : 200;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustColors = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    dustPositions[i * 3] = gsap.utils.random(-500, 500);
    dustPositions[i * 3 + 1] = gsap.utils.random(-320, 360);
    dustPositions[i * 3 + 2] = gsap.utils.random(-500, 500);
    const col = i % 2 === 0 ? warmA : warmB;
    dustColors[i * 3] = col.r;
    dustColors[i * 3 + 1] = col.g;
    dustColors[i * 3 + 2] = col.b;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dustPositions, 3),
  );
  dustGeometry.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
  dustBasePositions = new Float32Array(dustPositions);
  const dustMaterial = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.6,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  dustParticles = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dustParticles);

  const inkTexture = createInkDotTexture(256);
  inkSpriteCloud = new THREE.Group();
  const inkCount = prefersReducedMotion ? 30 : 80;
  for (let i = 0; i < inkCount; i += 1) {
    const color = i % 2 === 0 ? 0xe6d3b8 : 0xffb085;
    const material = new THREE.SpriteMaterial({
      map: inkTexture,
      color,
      transparent: true,
      opacity: gsap.utils.random(0.12, 0.28),
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    const basePos = new THREE.Vector3(
      gsap.utils.random(-240, 240),
      gsap.utils.random(-25, 165),
      gsap.utils.random(-240, 240),
    );
    const scale = gsap.utils.random(3.8, 10.5);
    sprite.position.copy(basePos);
    sprite.scale.set(scale, scale, 1);
    sprite.userData = {
      basePos,
      driftAmp: gsap.utils.random(0.8, 2.6),
      phase: gsap.utils.random(0, Math.PI * 2),
      speed: gsap.utils.random(0.4, 1.2),
    };
    inkSpriteCloud.add(sprite);
  }
  scene.add(inkSpriteCloud);
}

function createPaperFloorTexture(size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) return null;

  const center = size / 2;
  const radial = ctx2d.createRadialGradient(
    center,
    center,
    size * 0.08,
    center,
    center,
    size * 0.54,
  );
  radial.addColorStop(0, "rgba(241, 226, 200, 0.72)");
  radial.addColorStop(0.6, "rgba(215, 190, 162, 0.5)");
  radial.addColorStop(1, "rgba(139, 112, 90, 0.08)");
  ctx2d.fillStyle = radial;
  ctx2d.fillRect(0, 0, size, size);

  const imageData = ctx2d.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 28;
    const fiber = Math.sin((i / 4 / size) * 0.05) * 6;
    data[i] = Math.min(255, Math.max(0, data[i] + grain + fiber));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain * 0.65));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.4));
    data[i + 3] = 255;
  }
  ctx2d.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.4, 1.4);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createCardBackNoiseTexture(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) return null;
  ctx2d.fillStyle = "#2D2422";
  ctx2d.fillRect(0, 0, size, size);
  const imageData = ctx2d.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n * 0.8));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n * 0.65));
    data[i + 3] = 255;
  }
  ctx2d.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createInkDotTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) return null;
  const c = size / 2;
  const r = size * 0.36;
  const grad = ctx2d.createRadialGradient(c, c, r * 0.06, c, c, r);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.85)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx2d.fillStyle = grad;
  ctx2d.fillRect(0, 0, size, size);

  for (let i = 0; i < 480; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * r;
    const x = c + Math.cos(angle) * dist;
    const y = c + Math.sin(angle) * dist;
    const d = Math.random() * 3 + 0.6;
    ctx2d.fillStyle = `rgba(255,255,255,${Math.random() * 0.38})`;
    ctx2d.beginPath();
    ctx2d.arc(x, y, d, 0, Math.PI * 2);
    ctx2d.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createCuratorFloor() {
  const floorGeometry = new THREE.PlaneGeometry(800, 800, 1, 1);
  const fallbackTexture = createPaperFloorTexture(1024);
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: fallbackTexture || undefined,
    color: 0xe8d8bf,
    transparent: true,
    opacity: 0.25,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -40;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  const loader = new THREE.TextureLoader();
  loader.load(
    FLOOR_TEXTURE_PATH,
    (loadedTexture) => {
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      loadedTexture.wrapS = THREE.RepeatWrapping;
      loadedTexture.wrapT = THREE.RepeatWrapping;
      loadedTexture.repeat.set(1.4, 1.4);
      floorMaterial.map = loadedTexture;
      floorMaterial.needsUpdate = true;
      if (fallbackTexture?.isTexture) fallbackTexture.dispose();
    },
    undefined,
    () => {
      // Keep fallbackTexture when external texture is unavailable.
    },
  );
}

function createTopSpotLight() {
  topSpotLight = new THREE.SpotLight(
    0xfff1dd,
    1.2,
    420,
    Math.PI / 5,
    0.3,
    1.2,
  );
  // 将光源稍微向观众方向（+Z）移动，形成侧前方的漂亮高光和自然向后的阴影
  topSpotLight.position.set(0, 120, 40);
  topSpotLight.target.position.set(0, 0, 0);
  topSpotLight.castShadow = true;
  topSpotLight.shadow.mapSize.set(512, 512);
  topSpotLight.shadow.bias = -0.0002;
  scene.add(topSpotLight);
  scene.add(topSpotLight.target);
}

function getFrontMaterial(mesh) {
  if (!mesh) return null;
  return mesh.userData?.frontMat || null;
}

function initPostProcessing() {
  composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.4, // 可以稍微提亮一点泛光强度
    0.4,
    1.1, // 阈值必须大于 1.0，保护白色的 UI 图片不被漂白
  );
  composer.addPass(bloomPass);
}

function planeSizeFromTexture(texture, layoutScale) {
  const w = texture.image?.width || 1170;
  const h = texture.image?.height || 2532;
  const scale =
    layoutScale ??
    (window.innerWidth < 768 ? CARD_SCALE_MOBILE : CARD_SCALE_DESKTOP);
  return { width: w * scale, height: h * scale };
}

/** 环上静止态缩放（与 onResize 一致），避免 hover/聚焦 用 1 导致返回后尺寸错乱 */
function getRingRestScale(mesh) {
  const isMobile = window.innerWidth < 768;
  const newBaseScale = isMobile ? CARD_SCALE_MOBILE : CARD_SCALE_DESKTOP;
  const geoScale =
    mesh.userData.cardGeometryScale ??
    (mesh.userData.texturePixelW
      ? mesh.userData.width / mesh.userData.texturePixelW
      : newBaseScale);
  return newBaseScale / geoScale;
}

function buildRingLayout() {
  const n = Math.max(1, cardData.length);
  const slotArc = (Math.PI * 2) / n;
  ringLayout.angleByIndex = [];
  ringLayout.ranges = [];

  for (let i = 0; i < n; i += 1) {
    ringLayout.angleByIndex[i] = normalizeAngle(i * slotArc);
  }

  const grouped = progressScenes.map((scene) => ({
    ...scene,
    cards: cardData.filter(
      (item) => item.act === progressScenes.indexOf(scene) + 1,
    ),
  }));

  grouped.forEach((group, groupIndex) => {
    const act = groupIndex + 1;
    const cardsInAct = group.cards;
    if (!cardsInAct.length) return;

    const startIndex = cardsInAct[0].id - 1;
    const spanCards = cardsInAct.length;
    const actSpan = spanCards * slotArc;
    const rangeStart = ringLayout.angleByIndex[startIndex];
    const rangeEnd = normalizeAngle(
      ringLayout.angleByIndex[startIndex + spanCards - 1] + slotArc,
    );

    ringLayout.ranges.push({
      act,
      label: group.label,
      start: rangeStart,
      end: rangeEnd,
      center: normalizeAngle(rangeStart + actSpan / 2),
      span: actSpan,
      count: spanCards,
      startIndex,
    });
  });
}

/* ───────────────────────────────────────────────────────────
   3D TEXT SPRITE — CJK-safe font stack, no more 方框 / mojibake
   ─────────────────────────────────────────────────────────── */
const SPRITE_FONT_STACK =
  "'JetBrains Mono', 'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif";

function createTextSprite(text, options = {}) {
  const {
    fontSize = 36,
    weight = 500,
    color = "rgba(253,252,248,0.5)",
    paddingX = 36,
    paddingY = 18,
    minWidth = 380,
    align = "center",
  } = options;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) return null;

  // measure
  ctx2d.font = `${weight} ${fontSize}px ${SPRITE_FONT_STACK}`;
  const textWidth = ctx2d.measureText(text).width;
  const cssWidth = Math.max(minWidth, Math.ceil(textWidth + paddingX * 2));
  const cssHeight = Math.ceil(fontSize + paddingY * 2);

  // hi-dpi backing
  canvas.width = Math.ceil(cssWidth * dpr);
  canvas.height = Math.ceil(cssHeight * dpr);

  const painter = canvas.getContext("2d");
  if (!painter) return null;
  painter.scale(dpr, dpr);
  painter.font = `${weight} ${fontSize}px ${SPRITE_FONT_STACK}`;
  painter.fillStyle = color;
  painter.textAlign = align;
  painter.textBaseline = "middle";
  const x = align === "center" ? cssWidth / 2 : paddingX;
  painter.fillText(text, x, cssHeight / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  const scale = 0.015;
  sprite.scale.set(cssWidth * scale, cssHeight * scale, 1);
  return sprite;
}

function createActDecorations(radius) {
  ringLayout.ranges.forEach((range) => {
    const labelSprite = createTextSprite(
      `ACT ${String(range.act).padStart(2, "0")} · ${range.label}`,
      {
        fontSize: 34,
        weight: 500,
        color: "rgba(253,252,248,0.5)",
        minWidth: 460,
      },
    );
    if (labelSprite) {
      labelSprite.userData = { act: range.act, isActLabel: true };
      labelSprite.position.set(
        Math.sin(range.center) * (radius + ACT_HEADER_RADIUS_OFFSET),
        ACT_HEADER_LIFT,
        Math.cos(range.center) * (radius + ACT_HEADER_RADIUS_OFFSET),
      );
      cardsGroup.add(labelSprite);
      actLabelSprites.push(labelSprite);
    }

    const anchorSprite = createTextSprite(
      String(range.act).padStart(2, "0"),
      {
        fontSize: 98,
        weight: 700,
        color: "rgba(255,176,133,0.9)",
        minWidth: 180,
      },
    );
    if (anchorSprite) {
      anchorSprite.userData = { act: range.act, isActAnchor: true };
      const anchorAngle =
        ringLayout.angleByIndex[range.startIndex] || range.start;
      anchorSprite.position.set(
        Math.sin(anchorAngle - 0.04) * (radius + ACT_ANCHOR_RADIUS_OFFSET),
        ACT_ANCHOR_LIFT,
        Math.cos(anchorAngle - 0.04) * (radius + ACT_ANCHOR_RADIUS_OFFSET),
      );
      cardsGroup.add(anchorSprite);
      actAnchorSprites.push(anchorSprite);
    }
  });
}

function createCardFromTexture(texture, item, index, count = cardData.length) {
  const safeCount = Math.max(1, count);
  const normalizedIndex = ((index % safeCount) + safeCount) % safeCount;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(
    8,
    renderer.capabilities.getMaxAnisotropy?.() || 8,
  );

  const angle = ringLayout.angleByIndex[normalizedIndex] ?? 0;
  const pivot = new THREE.Group();
  pivot.rotation.y = angle;

  const isMobile = window.innerWidth < 768;
  const cardGeometryScale = isMobile ? CARD_SCALE_MOBILE : CARD_SCALE_DESKTOP;
  const { width, height } = planeSizeFromTexture(texture, cardGeometryScale);
  // 极薄：视觉上接近 2D 平面，仍保留正反面与材质索引
  const geometry = new THREE.BoxGeometry(width, height, 0.001);
  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x3a2e28,
    metalness: 0,
    roughness: 0.95,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
  const frontMat = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1,
    metalness: 0,
    roughness: 0.92,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
  const backMat = new THREE.MeshStandardMaterial({
    color: 0x2d2422,
    map: createCardBackNoiseTexture(512) || undefined,
    metalness: 0,
    roughness: 0.96,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
  const materials = [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];

  const mesh = new THREE.Mesh(geometry, materials);
  const radius = isMobile ? RING_RADIUS_MOBILE : RING_RADIUS_DESKTOP;
  mesh.position.set(0, 0, radius);
  mesh.castShadow = true;
  mesh.receiveShadow = false;

  mesh.userData = {
    ...item,
    angle,
    origPos: mesh.position.clone(),
    origRot: mesh.rotation.clone(),
    width,
    height,
    texturePixelW: texture.image?.width || 1170,
    texturePixelH: texture.image?.height || 2532,
    cardGeometryScale,
    frontMat,
    backMat,
  };

  pivot.add(mesh);
  return { pivot, mesh };
}

async function createCardWithTexture(loader, item, index, count = cardData.length) {
  // 修复 Vite base: "./" 导致的 Three.js 纹理加载 404 问题
  const basePath = import.meta.env.BASE_URL || "/";
  // 如果路径以 / 开头，剥离它并拼上正确的 base 前缀
  const resolvedPath = item.texture.startsWith("/")
    ? basePath + item.texture.slice(1)
    : item.texture;

  // 加载修复后的路径
  const texture = await loader.loadAsync(resolvedPath);
  return createCardFromTexture(texture, item, index, count);
}

function createFallbackCard(item, index, count = cardData.length) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = 400;
  const cssH = 800;
  const canvas = document.createElement("canvas");
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) return null;
  ctx2d.scale(dpr, dpr);

  ctx2d.fillStyle = "#3A2E28";
  ctx2d.fillRect(0, 0, cssW, cssH);
  ctx2d.fillStyle = "#8A7770";
  ctx2d.textAlign = "center";
  const cjkStack =
    "'JetBrains Mono', 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
  ctx2d.font = `600 42px ${cjkStack}`;
  ctx2d.fillText("加载失败", cssW / 2, cssH / 2 - 20);
  ctx2d.font = `500 24px ${cjkStack}`;
  ctx2d.fillText(item.title || "Untitled", cssW / 2, cssH / 2 + 34);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return createCardFromTexture(texture, item, index, count);
}

function showErrorOverlay(msg) {
  resourceErrorMessage.value = msg;
}

function reloadScene() {
  window.location.reload();
}

async function createSpatialImages() {
  const loader = new THREE.TextureLoader();
  const count = cardData.length;
  resourceErrorMessage.value = "";
  buildRingLayout();
  const isMobile = window.innerWidth < 768;
  const radius = isMobile ? RING_RADIUS_MOBILE : RING_RADIUS_DESKTOP;
  const results = await Promise.all(
    cardData.map(async (item, index) => {
      try {
        return await createCardWithTexture(loader, item, index, count);
      } catch (err) {
        console.error(
          `[CuratorStudio] Failed to load ${item.texture}`,
          err,
        );
        return createFallbackCard(item, index, count);
      }
    }),
  );
  const validResults = results.filter(Boolean);
  validResults.forEach(({ pivot, mesh }) => {
    meshes.push(mesh);
    cardsGroup.add(pivot);
    pivots.push(pivot);
  });
  if (meshes.length) {
    createActDecorations(radius);
    return;
  }
  showErrorOverlay("无法加载案例资源，请刷新重试");
}

function restoreSiblings() {
  meshes.forEach((m) => {
    const frontMat = getFrontMaterial(m);
    if (!frontMat) return;
    gsap.killTweensOf(frontMat);
    gsap.killTweensOf(frontMat.color);
    gsap.to(frontMat, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(frontMat.color, {
      r: 1,
      g: 1,
      b: 1,
      duration: 0.8,
      ease: "power2.out",
    });
    gsap.to(frontMat, {
      emissiveIntensity: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  });
}

function isDetailZoomActive() {
  return focusedMesh.value && detailCurrentScale > detailBaseScale + 0.001;
}

function clampFocusedMeshToViewport(mesh) {
  if (!camera || !mesh) return;
  const positionCam = mesh.position
    .clone()
    .applyMatrix4(camera.matrixWorldInverse);
  const depth = Math.max(4, Math.abs(positionCam.z));
  const vFov = THREE.MathUtils.degToRad(camera.fov || CAMERA_FOV);
  const halfViewHeight = Math.tan(vFov / 2) * depth;
  const halfViewWidth = halfViewHeight * (camera.aspect || 1);
  const meshHalfWidth = ((mesh.userData.width || 10) * mesh.scale.x) / 2;
  const meshHalfHeight = ((mesh.userData.height || 18) * mesh.scale.y) / 2;
  const maxX = Math.max(0, meshHalfWidth * 0.98 - halfViewWidth);
  const maxY = Math.max(0, meshHalfHeight * 0.98 - halfViewHeight);
  positionCam.x = THREE.MathUtils.clamp(positionCam.x, -maxX, maxX);
  positionCam.y = THREE.MathUtils.clamp(positionCam.y, -maxY, maxY);
  mesh.position.copy(positionCam.applyMatrix4(camera.matrixWorld));
}

function onFocusWheel(event) {
  if (introRunning) return;
  if (!focusedMesh.value) return;
  // Only intercept wheel when the cursor is over the canvas
  const path = event.composedPath ? event.composedPath() : [];
  const onCanvas =
    !path.length ||
    path.some((el) => el === canvasEl.value || el?.tagName === "CANVAS");
  if (!onCanvas) return;
  event.preventDefault();
  const mesh = focusedMesh.value;
  const nextScale =
    event.deltaY < 0
      ? Math.min(DETAIL_MAX_SCALE, detailCurrentScale + 0.18)
      : Math.max(detailBaseScale, detailCurrentScale - 0.18);
  detailCurrentScale = nextScale;
  gsap.killTweensOf(mesh.scale);
  gsap.to(mesh.scale, {
    x: nextScale,
    y: nextScale,
    z: nextScale,
    duration: 0.3,
    ease: "power2.out",
    onUpdate: () => clampFocusedMeshToViewport(mesh),
  });
  if (nextScale <= detailBaseScale + 0.001) {
    gsap.to(mesh.position, {
      x: mesh.userData.focusBasePos?.x ?? mesh.position.x,
      y: mesh.userData.focusBasePos?.y ?? 0,
      duration: 0.3,
      ease: "power2.out",
      onUpdate: () => clampFocusedMeshToViewport(mesh),
    });
  }
}

/* ───────────────────────────────────────────────────────────
   INTRO SEQUENCE
   ─────────────────────────────────────────────────────────── */
function applyIntroEndState() {
  introTimeline?.kill();
  introTimeline = null;
  introRunning = false;
  showIntroOverlay.value = false;
  unlock();

  if (dustParticles?.material) {
    dustParticles.material.opacity = 0.34;
  }
  inkSpriteCloud?.children?.forEach((sprite) => {
    if (!sprite.material) return;
    sprite.material.opacity = 0.22;
  });
  meshes.forEach((mesh) => {
    gsap.killTweensOf(mesh.position);
    mesh.position.set(
      mesh.userData.origPos.x,
      mesh.userData.origPos.y,
      mesh.userData.origPos.z,
    );
  });

  // ✅ FORCE UI elements to their final state — no more lingering opacity:0
  [backBtnEl.value, progressWrapEl.value, bottomHintEl.value]
    .filter(Boolean)
    .forEach((el) => {
      gsap.killTweensOf(el);
      gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
    });
  if (introOverlayEl.value) {
    gsap.killTweensOf(introOverlayEl.value);
  }
}

function skipIntroAnimation() {
  applyIntroEndState();
}

function playEntranceSequence() {
  // Reduced motion → skip the whole show
  if (prefersReducedMotion) {
    applyIntroEndState();
    return;
  }

  lock();
  showIntroOverlay.value = true;
  introRunning = true;

  const introChars = introCharRefs.value.flat().filter(Boolean);
  const uiTargets = [
    backBtnEl.value,
    progressWrapEl.value,
    bottomHintEl.value,
  ].filter(Boolean);

  // ✅ Fully initialize transform + opacity (avoid NaN snap on first tween)
  uiTargets.forEach((el) => {
    gsap.set(el, { opacity: 0, y: -8 });
  });
  if (introOverlayEl.value) {
    gsap.set(introOverlayEl.value, { opacity: 1, y: 0, filter: "blur(0px)" });
  }
  gsap.set(introChars, { yPercent: 120, opacity: 0, filter: "blur(4px)" });

  meshes.forEach((mesh) => {
    gsap.killTweensOf(mesh.position);
    mesh.position.set(mesh.userData.origPos.x, mesh.userData.origPos.y, 200);
  });

  if (dustParticles?.material) {
    dustParticles.material.opacity = 0;
  }
  inkSpriteCloud?.children?.forEach((sprite) => {
    if (!sprite.material) return;
    sprite.material.opacity = 0;
  });

  const tl = gsap.timeline({
    defaults: { ease: "expo.out" },
    onComplete: () => applyIntroEndState(),
  });
  introTimeline = tl;

  if (dustParticles?.material) {
    tl.to(
      dustParticles.material,
      { opacity: 0.34, duration: 0.8, ease: "power2.out" },
      0,
    );
  }
  if (inkSpriteCloud?.children?.length) {
    tl.to(
      inkSpriteCloud.children
        .map((sprite) => sprite.material)
        .filter(Boolean),
      { opacity: 0.22, duration: 0.8, ease: "power2.out" },
      0.05,
    );
  }

  tl.to(
    introChars,
    {
      yPercent: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.9,
      stagger: 0.028,
      ease: "power3.out",
    },
    0.3,
  );

  tl.to(
    meshes.map((mesh) => mesh.position),
    {
      z: (index) => meshes[index]?.userData?.origPos?.z ?? 0,
      duration: 1.3,
      stagger: 0.08,
      ease: "expo.out",
    },
    1.5,
  );

  tl.to(
    introOverlayEl.value,
    {
      y: -28,
      opacity: 0,
      filter: "blur(10px)",
      duration: 0.7,
      ease: "power2.inOut",
    },
    2.5,
  );

  tl.to(
    uiTargets,
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.12,
      ease: "power2.out",
    },
    3.0,
  );
}

/* ───────────────────────────────────────────────────────────
   FOCUS / RESET
   ─────────────────────────────────────────────────────────── */
function focusMesh(mesh) {
  if (!cardsGroup || !camera) return;
  lockFocusAnimating(1.3);

  clearCardHoverState();
  hideHoverPreview();

  const previousFocused =
    focusedMesh.value && focusedMesh.value !== mesh ? focusedMesh.value : null;

  focusedMesh.value = mesh;
  focusTiltEnabled = false;
  // 已在聚焦态中翻页时，保留旧内容直到新卡到位，避免面板闪空
  if (!previousFocused) activeCard.value = null;

  const currentPhysicalRotation = cardsGroup.rotation.y;
  let diff = -mesh.userData.angle - currentPhysicalRotation;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  const nextTarget = currentPhysicalRotation + diff;
  // 与物理角对齐，避免弹簧/拖拽滞后时 rotationTween 从错误的 targetRotation 起步
  targetRotation = currentPhysicalRotation;
  animateTargetRotationTo(nextTarget, 0.5);

  const others = meshes.filter((m) => m !== mesh);
  others.forEach((m) => {
    const frontMat = getFrontMaterial(m);
    if (!frontMat) return;
    gsap.killTweensOf(frontMat);
    gsap.killTweensOf(frontMat.color);
  });
  gsap.killTweensOf(mesh.position);
  gsap.killTweensOf(mesh.rotation);
  const meshFrontMat = getFrontMaterial(mesh);
  if (meshFrontMat) {
    gsap.killTweensOf(meshFrontMat);
    gsap.killTweensOf(meshFrontMat.color);
    // 目标卡片必须先回到亮态，避免沿用上一轮 sibling 的压暗状态
    gsap.set(meshFrontMat, { opacity: 1, overwrite: "auto" });
    gsap.set(meshFrontMat.color, { r: 1, g: 1, b: 1 });
  }
  gsap.killTweensOf(mesh.scale);

  if (previousFocused) {
    gsap.killTweensOf(previousFocused.position);
    gsap.killTweensOf(previousFocused.rotation);
    gsap.killTweensOf(previousFocused.scale);
    const prevFrontMat = getFrontMaterial(previousFocused);
    if (prevFrontMat) {
      gsap.killTweensOf(prevFrontMat);
      gsap.killTweensOf(prevFrontMat.color);
    }
    const ringS = getRingRestScale(previousFocused);
    gsap.to(previousFocused.position, {
      x: previousFocused.userData.origPos.x,
      y: previousFocused.userData.origPos.y,
      z: previousFocused.userData.origPos.z,
      duration: 0.52,
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(previousFocused.rotation, {
      x: previousFocused.userData.origRot.x,
      y: previousFocused.userData.origRot.y,
      z: previousFocused.userData.origRot.z,
      duration: 0.52,
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(previousFocused.scale, {
      x: ringS,
      y: ringS,
      z: ringS,
      duration: 0.52,
      ease: "power3.out",
      overwrite: "auto",
    });
  }
  if (dustParticles?.material) gsap.killTweensOf(dustParticles.material);
  if (inkSpriteCloud?.children?.length) {
    const mats = inkSpriteCloud.children
      .map((sprite) => sprite.material)
      .filter(Boolean);
    gsap.killTweensOf(mats);
  }
  if (camera) gsap.killTweensOf(camera.position);
  if (floorMesh?.material) gsap.killTweensOf(floorMesh.material);
  if (topSpotLight) {
    gsap.killTweensOf(topSpotLight);
    gsap.killTweensOf(topSpotLight.target.position);
  }
  if (floorMesh?.material) gsap.killTweensOf(floorMesh.material);
  if (topSpotLight) {
    gsap.killTweensOf(topSpotLight);
    gsap.killTweensOf(topSpotLight.target.position);
  }

  const isMobile = window.innerWidth < 768;
  const focusCameraZ = isMobile ? CAMERA_FOCUS_Z - 4 : 64;
  const targetZ = 30;

  // ─── COMPUTE finalScale based on real pixel target ──────────────
  const targetCardWidthPx = isMobile
    ? window.innerWidth * 0.7
    : Math.min(window.innerWidth * 0.48, 720);

  // Maximum allowed height before clipping vertical viewport
  const maxAllowedHeightPx = isMobile
    ? window.innerHeight * 0.62
    : window.innerHeight * 0.78;

  const worldWidth = mesh.userData.width || 1;
  const worldHeight = mesh.userData.height || 1;
  const aspectRatio = worldHeight / Math.max(worldWidth, 1e-6);

  const vFov = ((camera.fov || CAMERA_FOV) * Math.PI) / 180;
  const projectedHeight =
    2 * Math.tan(vFov / 2) * Math.abs(focusCameraZ - targetZ);
  const projectedWidth = projectedHeight * (camera.aspect || 1);
  const worldToPixelRatio =
    window.innerWidth / Math.max(projectedWidth, 1e-6);

  // 1. Try targeting requested width
  const desiredWorldWidth =
    targetCardWidthPx / Math.max(worldToPixelRatio, 1e-6);
  let finalScale = desiredWorldWidth / Math.max(worldWidth, 1e-6);

  // 2. ✅ Cap scale so card height never overflows viewport
  const projectedHeightPx =
    finalScale * worldWidth * aspectRatio * worldToPixelRatio;
  if (projectedHeightPx > maxAllowedHeightPx) {
    const heightCap = maxAllowedHeightPx / projectedHeightPx;
    finalScale *= heightCap;
  }

  // 3. ✅ Sanity floor / ceiling
  finalScale = Math.max(0.6, Math.min(finalScale, 4));

  const targetX = isMobile
    ? -0.35
    : (window.innerWidth * 0.24 - window.innerWidth * 0.5) /
      Math.max(worldToPixelRatio, 1e-6);

  const otherMats = others.map((m) => getFrontMaterial(m)).filter(Boolean);
  const otherColors = otherMats.map((mat) => mat.color);

  const tl = gsap.timeline({
    onComplete: () => {
      if (focusedMesh.value === mesh) focusTiltEnabled = true;
      unlockFocusAnimating();
    },
  });

  // Beat 1: pull camera + fade siblings
  tl.to(
    otherMats,
    {
      opacity: 0.04,
      duration: 0.45,
      stagger: 0.02,
      ease: "power2.inOut",
      overwrite: "auto",
    },
    0,
  );
  tl.to(
    otherColors,
    {
      r: 0.176,
      g: 0.141,
      b: 0.133,
      duration: 0.45,
      stagger: 0.02,
      ease: "power2.inOut",
    },
    0,
  );
  tl.to(
    others,
    {
      scaleX: (i) => getRingRestScale(others[i]) * 0.82,
      scaleY: (i) => getRingRestScale(others[i]) * 0.82,
      scaleZ: (i) => getRingRestScale(others[i]) * 0.82,
      duration: 0.45,
      stagger: 0.02,
      ease: "power2.inOut",
    },
    0,
  );
  tl.to(
    camera.position,
    {
      x: isMobile ? 0 : CAMERA_PAN_X_FOCUS,
      z: focusCameraZ,
      duration: 0.5,
      ease: "power3.inOut",
    },
    0,
  );
  if (floorMesh?.material) {
    tl.to(
      floorMesh.material,
      { opacity: 0.05, duration: 0.55, ease: "power2.inOut" },
      0,
    );
  }
  if (topSpotLight) {
    tl.to(
      topSpotLight,
      { intensity: 1.8, duration: 0.55, ease: "power2.inOut" },
      0,
    );
    tl.to(
      topSpotLight.target.position,
      { x: targetX, y: 0, z: targetZ, duration: 0.55, ease: "power2.inOut" },
      0,
    );
  }
  if (dustParticles?.material) {
    tl.to(
      dustParticles.material,
      { opacity: 0.12, size: 0.42, duration: 0.55, ease: "power2.inOut" },
      0,
    );
  }
  if (inkSpriteCloud?.children?.length) {
    tl.to(
      inkSpriteCloud.children.map((sprite) => sprite.material).filter(Boolean),
      { opacity: 0.08, duration: 0.55, ease: "power2.inOut" },
      0,
    );
  }
  if (floorMesh?.material) {
    gsap.to(floorMesh.material, {
      opacity: 0.25,
      duration: 0.9,
      ease: "power2.out",
    });
  }
  if (topSpotLight) {
    const lightTl = gsap.timeline();
    lightTl
      .to(topSpotLight, {
        intensity: 1.2,
        duration: 0.35,
        ease: "power2.out",
      })
      .to(
        topSpotLight.target.position,
        { x: 0, y: -20, z: 0, duration: 0.32, ease: "power2.in" },
        0,
      )
      .to(
        topSpotLight.target.position,
        { x: 0, y: 0, z: 0, duration: 0.48, ease: "power2.out" },
        0.32,
      );
  }

  // Beat 2: card rises to foreground + panel enters
  tl.call(
    () => {
      // 放弃比对对象引用，直接比对底层的 uuid
      if (focusedMesh.value && focusedMesh.value.uuid === mesh.uuid) {
        activeCard.value = mesh.userData;
      }
    },
    null,
    0.5,
  );
  tl.call(
    () => {
      if (focusedMesh.value !== mesh) return;
      detailBaseScale = finalScale;
      detailCurrentScale = finalScale;
      detailLastPointer = null;
      mesh.userData.focusBasePos = { x: targetX, y: 0, z: targetZ };
    },
    null,
    0.5,
  );
  tl.to(
    mesh.position,
    { x: targetX, y: 0, z: targetZ, duration: 0.72, ease: "power3.inOut" },
    0.5,
  );
  tl.to(
    mesh.rotation,
    { x: -0.05, y: 0, z: 0, duration: 0.72, ease: "power3.inOut" },
    0.5,
  );
  tl.to(
    mesh.scale,
    {
      x: finalScale,
      y: finalScale,
      z: finalScale,
      duration: 0.72,
      ease: "power3.inOut",
    },
    0.5,
  );
}

function resetCamera(clearState = true) {
  lockFocusAnimating(1.3);
  lockReturning(1.1);

  focusTiltEnabled = false;
  detailLastPointer = null;
  detailBaseScale = 1;
  detailCurrentScale = 1;
  clearEpilogueTimer();
  epilogueManualReveal = false;
  showEpilogueCard.value = false;

  meshes.forEach((m) => {
    gsap.killTweensOf(m.position);
    gsap.killTweensOf(m.rotation);
    const frontMat = getFrontMaterial(m);
    if (frontMat) {
      gsap.killTweensOf(frontMat);
      gsap.killTweensOf(frontMat.color);
    }
    gsap.killTweensOf(m.scale);
  });
  const focused = focusedMesh.value;
  meshes.forEach((m) => {
    if (focused && m === focused) return;
    const s = getRingRestScale(m);
    m.scale.set(s, s, s);
  });
  if (dustParticles?.material) gsap.killTweensOf(dustParticles.material);
  if (inkSpriteCloud?.children?.length) {
    const mats = inkSpriteCloud.children
      .map((sprite) => sprite.material)
      .filter(Boolean);
    gsap.killTweensOf(mats);
  }
  if (camera) gsap.killTweensOf(camera.position);

  if (dustParticles?.material) {
    gsap.to(dustParticles.material, {
      opacity: 0.34,
      size: 0.6,
      duration: 0.9,
      ease: "power2.out",
    });
  }
  if (inkSpriteCloud?.children?.length) {
    gsap.to(
      inkSpriteCloud.children
        .map((sprite) => sprite.material)
        .filter(Boolean),
      {
        opacity: 0.22,
        duration: 0.9,
        ease: "power2.out",
      },
    );
  }
  if (camera) {
    gsap.to(camera.position, {
      x: 0,
      y: 0,
      z: cameraDefaultZ,
      duration: 0.85,
      ease: "power2.out",
    });
  }

  if (focusedMesh.value) {
    const m = focusedMesh.value;
    gsap.killTweensOf(m.position);
    gsap.killTweensOf(m.rotation);
    gsap.killTweensOf(m.scale);

    const { origPos, origRot } = m.userData;
    const ringS = getRingRestScale(m);

    const tl = gsap.timeline({
      onComplete: () => {
        unlockFocusAnimating();
      },
    });
    tl.to(m.rotation, { x: 0, y: 0, duration: 0.34, ease: "power2.inOut" })
      .to(
        m.rotation,
        {
          x: origRot.x,
          y: origRot.y,
          z: origRot.z,
          duration: 0.82,
          ease: "power3.inOut",
        },
        "-=0.12",
      )
      .to(
        m.position,
        {
          x: origPos.x,
          y: origPos.y,
          z: origPos.z,
          duration: 1.0,
          ease: "power3.inOut",
        },
        0,
      )
      .to(
        m.scale,
        { x: ringS, y: ringS, z: ringS, duration: 0.9, ease: "power3.inOut" },
        0,
      );
  } else {
    unlockFocusAnimating();
  }

  restoreSiblings();
  focusedMesh.value = null;
  if (clearState) activeCard.value = null;
}

/* ───────────────────────────────────────────────────────────
   PANEL TRANSITIONS
   ─────────────────────────────────────────────────────────── */
function onPanelEnter(el, done) {
  const panel = el.querySelector("aside");
  if (!panel) {
    done();
    return;
  }
  const children = panel.querySelectorAll("[data-panel-fade]");
  gsap.killTweensOf(panel);
  gsap.killTweensOf(children);
  gsap.set(panel, { transformOrigin: "right center" });

  const tl = gsap.timeline({ onComplete: done });
  tl.fromTo(
    panel,
    {
      x: 60,
      scale: 0.92,
      opacity: 0,
      backdropFilter: "blur(0px)",
    },
    {
      x: 0,
      scale: 1,
      opacity: 1,
      backdropFilter: "blur(40px)",
      duration: 0.75,
      ease: "power3.out",
    },
  );
  tl.fromTo(
    children,
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: "power2.out" },
    "-=0.35",
  );
}

function onPanelLeave(el, done) {
  const panel = el.querySelector("aside");
  if (!panel) {
    done();
    return;
  }
  const children = panel.querySelectorAll("[data-panel-fade]");
  gsap.killTweensOf(panel);
  gsap.killTweensOf(children);
  gsap.set(panel, { transformOrigin: "right center" });

  const tl = gsap.timeline({ onComplete: done });
  tl.to(children, {
    y: 14,
    opacity: 0,
    duration: 0.25,
    stagger: { each: 0.05, from: "end" },
    ease: "power2.in",
  });
  tl.to(
    panel,
    {
      scale: 0.92,
      x: 60,
      opacity: 0,
      backdropFilter: "blur(0px)",
      duration: 0.5,
      ease: "power3.in",
    },
    "<0.06",
  );
}

/* ───────────────────────────────────────────────────────────
   POINTER / CLICK
   ─────────────────────────────────────────────────────────── */
function onCanvasClick(event) {
  if (introRunning) {
    skipIntroAnimation();
    return;
  }
  if (!renderer || !camera || !raycaster || !meshes.length) return;

  const dx = Math.abs(event.clientX - pointerDownX);
  const dy = Math.abs(event.clientY - pointerDownY);
  const dt = Date.now() - pointerDownTime;
  if (dx > 6 || dy > 6 || dt > 300) return;

  const rect = renderer.domElement.getBoundingClientRect();
  ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(meshes, false);
  if (!hits.length) {
    if (focusedMesh.value) resetCamera(true);
    return;
  }
  focusMesh(hits[0].object);
}

function onPointerDown(event) {
  if (introRunning) {
    event.preventDefault();
    skipIntroAnimation();
    return;
  }
  if (focusedMesh.value) {
    if (isDetailZoomActive()) {
      detailLastPointer = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    }
    return;
  }

  event.preventDefault();
  try {
    renderer?.domElement?.setPointerCapture?.(event.pointerId);
  } catch {}

  isDragging = true;
  settlingAfterDrag = false;
  snapOvershootPending = false;
  snapReturnPending = false;
  angularVelocity = 0;
  clearCardHoverState();
  setCursorHover(true, "DRAG");
  velocity = 0;
  springVelocity = 0;
  dragVelocitySamples.length = 0;
  pointerDownX = event.clientX;
  pointerDownY = event.clientY;
  pointerDownTime = Date.now();
  lastPointerX = event.clientX ?? 0;
  lastDragTime = performance.now();
  applyDragCompression();
}

function onPointerMove(event) {
  /* Safari: lost pointerup while isDragging — force end after 5s with buttons released */
  if (
    isDragging &&
    pointerDownTime > 0 &&
    Date.now() - pointerDownTime > 5000 &&
    !event.buttons
  ) {
    onPointerUp(event);
    return;
  }

  if (focusedMesh.value) {
    const mesh = focusedMesh.value;
    if (!mesh || !isDetailZoomActive()) {
      detailLastPointer = { x: event.clientX, y: event.clientY };
      return;
    }
    const prev = detailLastPointer || { x: event.clientX, y: event.clientY };
    const dx = event.clientX - prev.x;
    const dy = event.clientY - prev.y;
    detailLastPointer = { x: event.clientX, y: event.clientY };
    mesh.position.x += dx * DETAIL_PAN_SENSITIVITY;
    mesh.position.y -= dy * DETAIL_PAN_SENSITIVITY;
    clampFocusedMeshToViewport(mesh);
    return;
  }
  if (!isDragging) return;
  const x = event.clientX;
  const now = performance.now();
  const dt = now - lastDragTime || 16;
  const deltaX = x - lastPointerX;
  velocity = deltaX / dt;
  dragVelocitySamples.push({ t: now, v: velocity });
  while (dragVelocitySamples.length && now - dragVelocitySamples[0].t > 120) {
    dragVelocitySamples.shift();
  }
  const deltaRot = deltaX * 0.01;
  cardsGroup.rotation.y += deltaRot;
  targetRotation = cardsGroup.rotation.y;
  lastPointerX = x;
  lastDragTime = now;
}

function onPointerUp(event) {
  if (event?.pointerId !== undefined) {
    try {
      renderer?.domElement?.releasePointerCapture?.(event.pointerId);
    } catch {}
  }

  isDragging = false;
  detailLastPointer = null;

  if (focusedMesh.value) {
    clearCursorHover();
    return;
  }

  clearCursorHover();
  clearDragCompression();
  const now = performance.now();
  const cutoff = now - 80;
  const recent = dragVelocitySamples.filter((s) => s.t >= cutoff);
  const avgVelocity = recent.length
    ? recent.reduce((sum, s) => sum + s.v, 0) / recent.length
    : velocity;
  angularVelocity = avgVelocity * FLING_VELOCITY_FACTOR;
  settlingAfterDrag = true;
  snapOvershootPending = false;
  snapReturnPending = false;
  dragVelocitySamples.length = 0;
  targetRotation = cardsGroup.rotation.y;
}

function onShellMouseMove(event) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  const rw = rect.width || 1;
  const rh = rect.height || 1;
  mouseX = ((event.clientX - rect.left) / rw) * 2 - 1;
  mouseY = -((event.clientY - rect.top) / rh) * 2 + 1;

  if (focusedMesh.value) return;

  if (renderer?.domElement && ndc) {
    const cnv = renderer.domElement.getBoundingClientRect();
    const cw = cnv.width || 1;
    const ch = cnv.height || 1;
    ndc.x = ((event.clientX - cnv.left) / cw) * 2 - 1;
    ndc.y = -((event.clientY - cnv.top) / ch) * 2 + 1;
  }
}

/* ───────────────────────────────────────────────────────────
   KEYBOARD
   ─────────────────────────────────────────────────────────── */
function onCanvasKeydown(e) {
  hasKeyboardNavigation.value = true;
  // ✅ Allow skipping intro with any key
  if (introRunning) {
    if (
      e.key === "Escape" ||
      e.key === "Enter" ||
      e.key === " " ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight"
    ) {
      e.preventDefault();
      skipIntroAnimation();
    }
    return;
  }

  const key = e.key;
  const isFocus = Boolean(focusedMesh.value);
  const cardCount = meshes.length;
  if (!cardCount) return;

  const focusCenterCard = () => {
    const centerIndex = getCenterCardIndex();
    const centerMesh = meshes[centerIndex];
    if (centerMesh) focusMesh(centerMesh);
  };
  const jumpToIndex = (index) => {
    const normalized = ((index % cardCount) + cardCount) % cardCount;
    pulseCardEmissiveByIndex(normalized);
    if (isFocus) {
      focusCardByIndex(normalized);
    } else {
      animateTargetRotationTo(getRotationForCenterIndex(normalized), 0.52);
    }
  };

  switch (key) {
    case "ArrowLeft":
    case "a":
    case "A":
      jumpToIndex(getCenterCardIndex() - 1);
      e.preventDefault();
      break;
    case "ArrowRight":
    case "d":
    case "D":
      jumpToIndex(getCenterCardIndex() + 1);
      e.preventDefault();
      break;
    case "Home":
      jumpToIndex(0);
      e.preventDefault();
      break;
    case "End":
      jumpToIndex(cardCount - 1);
      e.preventDefault();
      break;
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      jumpToIndex(Number(key) - 1);
      e.preventDefault();
      break;
    case "0":
      jumpToIndex(9);
      e.preventDefault();
      break;
    case "-":
      jumpToIndex(10);
      e.preventDefault();
      break;
    case "Enter":
    case " ":
    case "f":
    case "F":
      focusCenterCard();
      e.preventDefault();
      break;
    case "b":
    case "B":
      goBack();
      e.preventDefault();
      break;
    case "e":
    case "E":
      epilogueManualReveal = true;
      if (isFocus) {
        clearEpilogueTimer();
        showEpilogueCard.value = true;
      } else {
        focusCenterCard();
        gsap.delayedCall(0.72, () => {
          clearEpilogueTimer();
          showEpilogueCard.value = true;
        });
      }
      e.preventDefault();
      break;
    case "Escape":
      if (focusedMesh.value) unfocusMesh();
      else isStudioOpen.value = false;
      e.preventDefault();
      break;
    default:
      break;
  }
}

/* ───────────────────────────────────────────────────────────
   HOVER (with hysteresis)
   ─────────────────────────────────────────────────────────── */
function applyHoverEnter(mesh) {
  if (hoveredMesh === mesh) return;
  if (hoveredMesh) applyHoverLeave(hoveredMesh);

  // 悬停即冻结环形转盘，避免底层微动导致卡片左右抖
  angularVelocity = 0;
  springVelocity = 0;
  settlingAfterDrag = false;
  snapOvershootPending = false;
  snapReturnPending = false;
  targetRotation = cardsGroup?.rotation?.y ?? targetRotation;

  hoveredMesh = mesh;
  const frontMat = getFrontMaterial(mesh);

  gsap.killTweensOf(mesh.position);
  if (frontMat) gsap.killTweensOf(frontMat);
  gsap.killTweensOf(mesh.rotation);
  gsap.killTweensOf(mesh.scale);
  const tl = gsap.timeline();
  tl.to(
    mesh.rotation,
    {
      y: mesh.userData.origRot.y + THREE.MathUtils.degToRad(3),
      duration: 0.15,
      ease: "power2.out",
    },
    0,
  );
  tl.to(
    mesh.position,
    {
      z: mesh.userData.origPos.z + 12,
      duration: 0.42,
      ease: "power3.out",
    },
    0.1,
  );
  tl.to(
    mesh.rotation,
    {
      x: mesh.userData.origRot.x + THREE.MathUtils.degToRad(-6),
      duration: 0.42,
      ease: "power3.out",
    },
    0.1,
  );
  const rs = getRingRestScale(mesh);
  gsap.to(mesh.scale, {
    x: rs * 1.06,
    y: rs * 1.06,
    z: rs,
    duration: 0.5,
    ease: "back.out(1.8)",
  });
  showHoverPreviewDelayed(mesh);
  setCursorHover(true, "VIEW");
}

function applyHoverLeave(mesh) {
  if (!mesh) return;
  hideHoverPreview();
  const frontMat = getFrontMaterial(mesh);
  gsap.killTweensOf(mesh.position);
  if (frontMat) gsap.killTweensOf(frontMat);
  gsap.killTweensOf(mesh.rotation);
  gsap.killTweensOf(mesh.scale);
  const tl = gsap.timeline();
  tl.to(
    mesh.position,
    {
      z: mesh.userData.origPos.z,
      duration: 0.34,
      ease: "power2.inOut",
    },
    0,
  );
  tl.to(
    mesh.rotation,
    {
      x: mesh.userData.origRot.x,
      y: mesh.userData.origRot.y,
      duration: 0.44,
      ease: "power3.out",
    },
    0.18,
  );
  const rs = getRingRestScale(mesh);
  gsap.to(mesh.scale, { x: rs, y: rs, z: rs, duration: 0.5, ease: "power2.out" });
  if (hoveredMesh === mesh) {
    hoveredMesh = null;
    clearCursorHover();
  }
}

/* ───────────────────────────────────────────────────────────
   ANIMATE
   ─────────────────────────────────────────────────────────── */
function animate() {
  if (
    disposeRequested ||
    document.hidden ||
    !renderer ||
    !scene ||
    !camera ||
    !cardsGroup
  ) {
    animationId = 0;
    return;
  }

  const isFocusLocked = Boolean(focusedMesh.value);

  if (isFocusLocked) {
    isDragging = false;
    springVelocity = 0;
    cardsGroup.rotation.y = targetRotation;

    if (focusTiltEnabled && focusedMesh.value) {
      const targetRotX = mouseY * 0.03;
      const targetRotY = mouseX * 0.05;
      focusedMesh.value.rotation.x +=
        (targetRotX - focusedMesh.value.rotation.x) * 0.1;
      focusedMesh.value.rotation.y +=
        (targetRotY - focusedMesh.value.rotation.y) * 0.1;
    }
  }

  if (!isFocusLocked) {
    if (hoveredMesh && !isDragging) {
      angularVelocity = 0;
      springVelocity = 0;
      settlingAfterDrag = false;
      snapOvershootPending = false;
      snapReturnPending = false;
      targetRotation = cardsGroup.rotation.y;
    } else if (isDragging) {
      springVelocity = 0;
      targetRotation = cardsGroup.rotation.y;
    } else if (settlingAfterDrag && Math.abs(angularVelocity) > MIN_FLING_VELOCITY) {
      cardsGroup.rotation.y += angularVelocity;
      angularVelocity *= ANGULAR_FRICTION;
      springVelocity = 0;
      targetRotation = cardsGroup.rotation.y;
    } else if (settlingAfterDrag) {
      angularVelocity = 0;
      if (!snapOvershootPending && !snapReturnPending) {
        snapFinalTarget = getNearestCardRotation(cardsGroup.rotation.y);
        const delta = snapFinalTarget - cardsGroup.rotation.y;
        const dir = Math.sign(delta) || 1;
        targetRotation = snapFinalTarget + dir * SNAP_OVERSHOOT_RAD;
        snapOvershootPending = true;
      }

      const displacement = cardsGroup.rotation.y - targetRotation;
      const springForce = -SNAP_SPRING_STIFFNESS * displacement;
      const dampingForce = -SNAP_SPRING_DAMPING * springVelocity;
      springVelocity += (springForce + dampingForce) / SPRING_MASS;
      cardsGroup.rotation.y += springVelocity;

      if (
        snapOvershootPending &&
        Math.abs(cardsGroup.rotation.y - targetRotation) < SNAP_REACHED_EPS
      ) {
        targetRotation = snapFinalTarget;
        snapOvershootPending = false;
        snapReturnPending = true;
      } else if (
        snapReturnPending &&
        Math.abs(cardsGroup.rotation.y - targetRotation) < 0.0008 &&
        Math.abs(springVelocity) < 0.0008
      ) {
        cardsGroup.rotation.y = targetRotation;
        springVelocity = 0;
        snapReturnPending = false;
        settlingAfterDrag = false;
      }
    } else {
      const displacement = cardsGroup.rotation.y - targetRotation;
      const springForce = -SPRING_STIFFNESS * displacement;
      const dampingForce = -SPRING_DAMPING * springVelocity;
      springVelocity += (springForce + dampingForce) / SPRING_MASS;
      cardsGroup.rotation.y += springVelocity;
    }
  }

  if (
    !isFocusLocked &&
    !isDragging &&
    !hoveredMesh &&
    !snapOvershootPending &&
    !snapReturnPending &&
    Math.abs(angularVelocity) < MIN_FLING_VELOCITY &&
    Math.abs(springVelocity) < 1e-4 &&
    !prefersReducedMotion
  ) {
    targetRotation -= 0.002;
  }

  updateActiveActByRotation();
  actLabelSprites.forEach((sprite) => {
    if (!sprite.material) return;
    sprite.material.opacity =
      sprite.userData.act === activeAct.value ? 1 : 0.3;
  });

  if (dustParticles?.geometry?.attributes?.position && dustBasePositions) {
    dustParticles.rotation.y -= 0.00024;
    dustParticles.rotation.x -= 0.00008;

    const posAttr = dustParticles.geometry.attributes.position;
    const positions = posAttr.array;
    const base = dustBasePositions;
    particleMouseWorld.set(
      mouseX * 50 * PARTICLE_MOUSE_FIELD_SCALE,
      mouseY * 30 * PARTICLE_MOUSE_FIELD_SCALE,
      0,
    );
    const repelR = 80 * PARTICLE_MOUSE_FIELD_SCALE;
    const repelRSq = repelR * repelR;

    for (let i = 0; i < positions.length; i += 3) {
      let x = base[i],
        y = base[i + 1],
        z = base[i + 2];
      const dx = x - particleMouseWorld.x;
      const dy = y - particleMouseWorld.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > 1e-12 && distSq < repelRSq) {
        const ratio = distSq / repelRSq;
        const force = (1 - ratio) * 0.25;
        const invDist = 1 / Math.sqrt(distSq);
        x += dx * invDist * force;
        y += dy * invDist * force;
      }
      positions[i] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;
    }
    posAttr.needsUpdate = true;
  }
  if (inkSpriteCloud?.children?.length) {
    const t = performance.now() * 0.001;
    inkSpriteCloud.rotation.y -= 0.00018;
    inkSpriteCloud.children.forEach((sprite) => {
      const data = sprite.userData;
      if (!data?.basePos) return;
      const wave = t * data.speed + data.phase;
      sprite.position.x = data.basePos.x + Math.cos(wave * 0.7) * data.driftAmp;
      sprite.position.y =
        data.basePos.y + Math.sin(wave) * data.driftAmp * 0.7;
      sprite.position.z =
        data.basePos.z + Math.sin(wave * 0.55) * data.driftAmp;
    });
  }
  if (
    hoverPreview.visible &&
    hoveredMesh &&
    !focusedMesh.value &&
    !isDragging
  ) {
    updateHoverPreviewPosition(hoveredMesh);
  }

  const isMovingFast =
    Math.abs(springVelocity) > 0.005 ||
    Math.abs(angularVelocity) > MIN_FLING_VELOCITY ||
    isDragging;

  if (isDragging || isFocusLocked || isMovingFast || isReturning) {
    if (hoveredMesh) applyHoverLeave(hoveredMesh);
    hoverStableFrames = 0;
    lastHoverCandidate = null;
  } else if (raycaster && ndc && meshes.length) {
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(meshes, false);
    const candidate = hits.length ? hits[0].object : null;

    if (candidate === lastHoverCandidate) {
      hoverStableFrames += 1;
    } else {
      hoverStableFrames = 0;
      lastHoverCandidate = candidate;
    }

    if (hoverStableFrames >= HOVER_STABILITY_FRAMES) {
      if (candidate !== hoveredMesh) {
        if (candidate) applyHoverEnter(candidate);
        else if (hoveredMesh) applyHoverLeave(hoveredMesh);
      }
      if (hoveredMesh && hoveredMesh === candidate) {
        const tx = hoveredMesh.userData.origRot.x - ndc.y * 0.035;
        const ty = hoveredMesh.userData.origRot.y + ndc.x * 0.055;
        hoveredMesh.rotation.x +=
          (tx - hoveredMesh.rotation.x) * 0.1;
        hoveredMesh.rotation.y +=
          (ty - hoveredMesh.rotation.y) * 0.1;
      }
    }
  }

  camera.lookAt(0, 0, 0);
  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }

  if (!disposeRequested) {
    animationId = requestAnimationFrame(animate);
  }
}

function onResize() {
  if (!camera || !renderer) return;
  const nextWidth = window.innerWidth;
  const nextHeight = window.innerHeight;
  const widthDelta = Math.abs(nextWidth - lastViewportWidth);
  const heightDelta = Math.abs(nextHeight - lastViewportHeight);

  // iOS Safari address bar expand/collapse
  if (widthDelta === 0 && heightDelta > 0 && heightDelta < 140) return;

  lastViewportWidth = nextWidth;
  lastViewportHeight = nextHeight;

  const aspect = window.innerWidth / window.innerHeight;
  const isMobile = window.innerWidth < 768;
  camera.aspect = aspect;
  cameraDefaultZ = isMobile ? 90 : aspect < 1.2 ? 100 : CAMERA_DEFAULT_Z;
  if (!activeCard.value) {
    camera.position.z = cameraDefaultZ;
  }
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer?.setSize(window.innerWidth, window.innerHeight);
  bloomPass?.setSize?.(window.innerWidth, window.innerHeight);

  const newRadius = isMobile ? RING_RADIUS_MOBILE : RING_RADIUS_DESKTOP;

  if (focusedMesh.value && !introRunning) {
    clampFocusedMeshToViewport(focusedMesh.value);
  } else if (meshes.length > 0 && !introRunning) {
    meshes.forEach((mesh) => {
      const uniform = getRingRestScale(mesh);
      mesh.userData.origPos.set(0, 0, newRadius);
      gsap.killTweensOf(mesh.scale);
      gsap.killTweensOf(mesh.position);
      const hoverLift = hoveredMesh === mesh ? 12 : 0;
      mesh.position.set(0, 0, newRadius + hoverLift);
      gsap.to(mesh.scale, {
        x: uniform,
        y: uniform,
        z: uniform,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  }
}

/* ───────────────────────────────────────────────────────────
   EPILOGUE WATCH
   ─────────────────────────────────────────────────────────── */
watch(
  [activeCardIndex, focusedMesh],
  ([idx, focused]) => {
    clearEpilogueTimer();
    if (!focused) {
      epilogueManualReveal = false;
      showEpilogueCard.value = false;
      return;
    }
    if (epilogueManualReveal) {
      showEpilogueCard.value = true;
      return;
    }
    if (idx === cardData.length - 1) {
      epilogueTimer = window.setTimeout(() => {
        showEpilogueCard.value = true;
      }, 2000);
    } else {
      showEpilogueCard.value = false;
    }
  },
  { immediate: true },
);

/* ───────────────────────────────────────────────────────────
   DISPOSAL
   ─────────────────────────────────────────────────────────── */
function cleanMaterial(mat) {
  if (!mat || !mat.isMaterial) return;
  const textureKeys = [
    "map",
    "lightMap",
    "bumpMap",
    "normalMap",
    "specularMap",
    "envMap",
    "alphaMap",
    "aoMap",
    "displacementMap",
    "emissiveMap",
    "roughnessMap",
    "metalnessMap",
    "clearcoatMap",
    "clearcoatNormalMap",
    "clearcoatRoughnessMap",
    "transmissionMap",
    "thicknessMap",
    "specularIntensityMap",
    "specularColorMap",
    "iridescenceMap",
    "iridescenceThicknessMap",
    "sheenColorMap",
    "sheenRoughnessMap",
  ];
  textureKeys.forEach((key) => {
    const tex = mat[key];
    if (tex && tex.isTexture) tex.dispose();
  });
  mat.dispose();
}

/* ───────────────────────────────────────────────────────────
   LIFECYCLE
   ─────────────────────────────────────────────────────────── */
onMounted(async () => {
  prefersReducedMotion = detectReducedMotion();
  reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  onReducedMotionChange = (event) => {
    prefersReducedMotion = event.matches;
  };
  reducedMotionMedia.addEventListener?.("change", onReducedMotionChange);

  setCursorEnabled(true);
  disposeRequested = false;
  initThree();
  createAmbientParticles();
  await createSpatialImages();

  clickHandler = (event) => onCanvasClick(event);
  resizeHandler = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => onResize(), 80);
  };
  pointerDownHandler = (e) => onPointerDown(e);
  pointerMoveHandler = (e) => onPointerMove(e);
  // ✅ FIX: pass event so setPointerCapture can be released
  pointerUpHandler = (e) => onPointerUp(e);
  wheelHandler = (e) => onFocusWheel(e);

  window.addEventListener("resize", resizeHandler, resizeListenerOpts);

  const canvas = renderer.domElement;
  canvas.addEventListener("click", clickHandler);
  canvas.addEventListener("pointerdown", pointerDownHandler);
  // ✅ wheel attached to the canvas only — never hijacks panel scroll
  canvas.addEventListener("wheel", wheelHandler, { passive: false });
  window.addEventListener(
    "pointermove",
    pointerMoveHandler,
    pointerListenerOpts,
  );
  window.addEventListener("pointerup", pointerUpHandler, pointerListenerOpts);
  window.addEventListener(
    "pointercancel",
    pointerUpHandler,
    pointerListenerOpts,
  );

  // Focus the canvas so keyboard shortcuts work without an extra click
  requestAnimationFrame(() => {
    canvasEl.value?.focus?.({ preventScroll: true });
  });

  playEntranceSequence();
  animate();

  onVisibilityChange = () => {
    if (!document.hidden && !disposeRequested && animationId === 0) {
      animate();
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
});

onUnmounted(() => {
  introTimeline?.kill();
  introTimeline = null;
  rotationTween?.kill();
  rotationTween = null;
  forceUnlock();
  clearEpilogueTimer();
  clearHoverPreviewTimer();
  hideHoverPreview();
  disposeRequested = true;
  clearCardHoverState();
  clearCursorHover();
  setCursorEnabled(false);
  cancelAnimationFrame(animationId);
  animationId = 0;
  clearTimeout(resizeTimer);
  resizeTimer = 0;

  if (reducedMotionMedia && onReducedMotionChange) {
    reducedMotionMedia.removeEventListener?.("change", onReducedMotionChange);
  }
  reducedMotionMedia = null;
  onReducedMotionChange = null;

  if (onVisibilityChange) {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    onVisibilityChange = null;
  }

  window.removeEventListener("resize", resizeHandler, resizeListenerOpts);
  window.removeEventListener(
    "pointermove",
    pointerMoveHandler,
    pointerListenerOpts,
  );
  window.removeEventListener(
    "pointerup",
    pointerUpHandler,
    pointerListenerOpts,
  );
  window.removeEventListener(
    "pointercancel",
    pointerUpHandler,
    pointerListenerOpts,
  );

  const canvas = renderer?.domElement;
  if (canvas) {
    canvas.removeEventListener("click", clickHandler);
    canvas.removeEventListener("pointerdown", pointerDownHandler);
    canvas.removeEventListener("wheel", wheelHandler);
  }

  meshes.forEach((mesh) => {
    gsap.killTweensOf(mesh.position);
    gsap.killTweensOf(mesh.rotation);
    gsap.killTweensOf(mesh.scale);
    const mats = mesh.material;
    if (Array.isArray(mats)) {
      mats.forEach((m) => {
        gsap.killTweensOf(m);
        gsap.killTweensOf(m.color);
      });
    } else if (mats) {
      gsap.killTweensOf(mats);
      gsap.killTweensOf(mats.color);
    }
  });

  if (scene) {
    scene.traverse((object) => {
      if (object.isMesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material))
            object.material.forEach(cleanMaterial);
          else cleanMaterial(object.material);
        }
      } else if (
        object.isPoints ||
        object.isLine ||
        object.isLineSegments
      ) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material))
            object.material.forEach(cleanMaterial);
          else cleanMaterial(object.material);
        }
      } else if (object.isSprite) {
        if (object.material?.map?.isTexture) object.material.map.dispose();
        if (object.material) cleanMaterial(object.material);
      }
    });
    scene.clear();
  }

  pivots.length = 0;
  meshes.length = 0;
  actLabelSprites.length = 0;
  actAnchorSprites.length = 0;
  cardsGroup = null;
  dustParticles = null;
  dustBasePositions = null;
  inkSpriteCloud = null;
  floorMesh = null;
  topSpotLight = null;

  composer?.dispose();
  composer = null;
  bloomPass = null;

  const domEl = renderer?.domElement;
  renderer?.dispose();
  if (domEl) {
    domEl.width = 1;
    domEl.height = 1;
  }

  renderer = null;
  scene = null;
  camera = null;
});
</script>

<style scoped>
.studio-root::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 176, 133, 0.06),
    transparent 70%
  );
  transition: background 80ms linear;
}

.studio-root::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.08;
  background-image: radial-gradient(
    circle at 1px 1px,
    rgba(92, 77, 73, 0.18) 1px,
    transparent 0
  );
  background-size: 22px 22px;
}

/* Hint text fade */
.hint-fade-enter-active,
.hint-fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}
.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

/* Slide-fade for the panel container */
.slide-fade-enter-active,
.slide-fade-leave-active {
  pointer-events: none;
}

/* Panel surface */
.studio-panel {
  background: rgba(253, 252, 248, 0.92);
  -webkit-backdrop-filter: blur(40px);
  backdrop-filter: blur(40px);
}

.studio-root aside::-webkit-scrollbar {
  display: none;
}

.studio-root aside {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.intro-line-cn {
  font-family:
    "Clash Display", "PingFang SC", "Noto Sans SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
  font-size: clamp(28px, 4.5vw, 64px);
  line-height: 1.08;
  letter-spacing: -0.02em;
  font-weight: 600;
}

.intro-line-en {
  font-family: "Instrument Serif", "Times New Roman", serif;
  font-style: italic;
  font-size: clamp(20px, 2vw, 32px);
  letter-spacing: 0.01em;
}

.intro-skip {
  font-family:
    "JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
}

.intro-char {
  display: inline-block;
  will-change: transform, opacity, filter;
}

.studio-canvas:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px rgba(255, 176, 133, 0.55);
}

.studio-progress {
  border: 1px solid rgba(92, 77, 73, 0.2);
  border-radius: 999px;
  background: rgba(253, 252, 248, 0.82);
  padding: 7px 14px;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.studio-progress-label {
  font-family:
    "JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  transition: color 420ms cubic-bezier(0.25, 1, 0.2, 1);
}

.studio-progress-label-active {
  color: #2d2422;
}

.studio-progress-label-idle {
  color: rgba(74, 59, 50, 0.5);
}

.studio-progress-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(74, 59, 50, 0.3);
  transition:
    width 420ms cubic-bezier(0.25, 1, 0.2, 1),
    background-color 420ms cubic-bezier(0.25, 1, 0.2, 1);
}

.studio-progress-dot-active {
  width: 8px;
  background: #ffb085;
}

.panel-kicker,
.panel-label {
  font-family:
    "JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  line-height: 1.4;
}

.panel-body {
  font-family:
    "Satoshi", "PingFang SC", "Noto Sans SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
  font-size: 13px;
  line-height: 1.65;
}

.panel-body-empty {
  font-style: italic;
}

.panel-nav-btn {
  border: 1px solid rgba(92, 77, 73, 0.2);
  border-radius: 999px;
  padding: 7px 12px;
  background: rgba(253, 252, 248, 0.7);
  font-family:
    "JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #4a3b32;
  transition:
    border-color 300ms cubic-bezier(0.25, 1, 0.2, 1),
    background-color 300ms cubic-bezier(0.25, 1, 0.2, 1),
    color 300ms cubic-bezier(0.25, 1, 0.2, 1);
}

.panel-nav-btn:hover,
.panel-nav-btn:focus-visible {
  border-color: rgba(74, 59, 50, 0.45);
  background: rgba(255, 176, 133, 0.22);
  color: #2d2422;
}

.panel-epilogue-cta {
  font-family:
    "JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #4a3b32;
  text-decoration: none;
  transition: color 320ms cubic-bezier(0.25, 1, 0.2, 1);
}

.panel-epilogue-cta:hover,
.panel-epilogue-cta:focus-visible {
  color: #2d2422;
}

.epilogue-rise-enter-active,
.epilogue-rise-leave-active {
  transition:
    opacity 420ms cubic-bezier(0.25, 1, 0.2, 1),
    transform 420ms cubic-bezier(0.25, 1, 0.2, 1),
    filter 420ms cubic-bezier(0.25, 1, 0.2, 1);
}

.epilogue-rise-enter-from,
.epilogue-rise-leave-to {
  opacity: 0;
  transform: translateY(18px);
  filter: blur(6px);
}

.detail-hint-label {
  font-family:
    "JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hover-preview-title {
  font-family:
    "Clash Display", "PingFang SC", "Noto Sans SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
  font-size: 12px;
  line-height: 1.25;
  letter-spacing: -0.01em;
  font-weight: 600;
}

.hover-preview-act,
.hover-preview-hint {
  font-family:
    "JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 10px;
  line-height: 1.3;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hover-preview-act {
  color: rgba(74, 59, 50, 0.78);
}

.hover-preview-hint {
  color: rgba(45, 36, 34, 0.86);
  letter-spacing: 0.14em;
}

@media (prefers-reduced-motion: reduce) {
  .studio-progress-dot,
  .studio-progress-label,
  .panel-nav-btn,
  .panel-epilogue-cta {
    transition: none !important;
  }
  .epilogue-rise-enter-active,
  .epilogue-rise-leave-active,
  .hint-fade-enter-active,
  .hint-fade-leave-active {
    transition: none !important;
  }
  .studio-root::before {
    display: none;
  }
}

/* Mobile tweaks: panel becomes bottom sheet at narrow widths */
@media (max-width: 640px) {
  .studio-panel {
    top: auto !important;
    bottom: 16px;
    left: 16px !important;
    right: 16px !important;
    width: auto !important;
    max-width: none !important;
    transform: none !important;
    max-height: 64vh;
  }
}
</style>