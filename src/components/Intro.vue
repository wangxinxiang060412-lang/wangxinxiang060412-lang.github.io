<template>
  <section
    id="intro"
    ref="el"
    class="relative overflow-hidden bg-transparent px-6 pt-24 pb-20 md:px-12 lg:px-20"
    style="border-top: 1px solid rgba(74, 59, 50, 0.14)"
    @mousemove="onHeadlineMove"
    @mouseleave="onHeadlineLeave"
  >
    <div
      ref="sectionDecoEl"
      class="pointer-events-none absolute top-1 left-0 z-0 hidden select-none items-end gap-4 lg:flex"
      aria-hidden="true"
    >
      <p
        class="font-display leading-none tracking-[-0.03em] text-[rgba(74,59,50,0.055)]"
        style="font-size: clamp(140px, 14vw, 220px); font-weight: 500"
      >
        01
      </p>
      <p
        class="font-mono pb-6 text-[11px] uppercase tracking-[0.2em] text-[rgba(74,59,50,0.42)]"
      >
        Section · 01 / About
      </p>
    </div>
    <div
      class="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-0"
    >
      <!-- Left: headline -->
      <div class="lg:col-span-7">
        <div class="mb-6 overflow-hidden">
          <p
            ref="lblEl"
            class="hero-label flex items-center gap-2 text-[#5C4D49]/95"
            style="
              font-size: 10px;
              letter-spacing: 0.4em;
              text-transform: uppercase;
              font-weight: 500;
            "
          >
            <span class="inline-block h-px w-5 bg-[#4A3B32]/35"></span>
            About / 关于我
          </p>
        </div>
        <div
          v-for="(l, i) in lines"
          :key="i"
          class="line-stack"
          :class="{ 'line-tight': i > 0 }"
        >
          <div class="overflow-hidden">
            <p
              :ref="(el) => (lRefs[i] = el)"
              class="intro-reveal-line font-display leading-[0.92] tracking-[-0.03em] text-[#2D2422]"
              style="font-size: clamp(36px, 5.6vw, 88px); font-weight: 600"
            >
              <span
                v-for="(char, ci) in lineChars[i]"
                :key="`line-${i}-char-${ci}`"
                :ref="(node) => setLineWrapRef(node, i, ci)"
                class="char-wrap"
              >
                <span
                  :ref="(node) => setLineInkRef(node, i, ci)"
                  class="char-inkdot"
                  aria-hidden="true"
                />
                <span
                  :ref="(node) => setLineGlyphRef(node, i, ci)"
                  class="intro-char char-glyph"
                  :class="isSerifAccentChar(i, ci) ? 'intro-char-serif-accent' : ''"
                >
                  {{ char === " " ? "\u00A0" : char }}
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="hidden lg:flex lg:col-span-1 justify-center">
        <div class="h-full w-px bg-[#4A3B32]/10" aria-hidden="true" />
      </div>

      <!-- Right: bio + stats -->
      <div class="lg:col-span-4 lg:col-start-9 lg:mt-24">
        <div
          ref="tagsEl"
          class="mb-8 flex flex-wrap gap-2"
          style="opacity: 0; transform: translateY(16px)"
        >
          <span
            v-for="(t, ti) in tags"
            :key="t"
            :ref="(el) => (tagRefs[ti] = el)"
            class="intro-tag cursor-default px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#5C4D49]/95 hover:border-[#4A3B32]/35 hover:bg-[#4A3B32]/6 hover:text-[#2D2422]"
            style="
              border: 1px solid rgba(74, 59, 50, 0.22);
              border-radius: 8px;
              font-weight: 500;
            "
            >{{ t }}</span
          >
        </div>
        <div v-for="(l, i) in bio" :key="i" class="overflow-hidden">
          <p
            :ref="(el) => (bRefs[i] = el)"
            class="intro-reveal-line font-body leading-relaxed text-[#5C4D49]/95"
            style="font-size: clamp(13px, 1.15vw, 15px); font-weight: 400"
          >
            {{ l }}
          </p>
        </div>
        <div ref="metaEl" class="mt-6" style="opacity: 0">
          <div class="mb-3 h-px w-8 bg-[#4A3B32]/35" />
          <p
            class="font-mono text-[#5C4D49]/95"
            style="
              font-size: 10px;
              letter-spacing: 0.35em;
              text-transform: uppercase;
              font-weight: 500;
            "
          >
            浙江科技大学 · 数字媒体技术 · 2024–2028
          </p>
        </div>

        <div
          ref="statsEl"
          class="grid grid-cols-2 gap-3 mt-10"
          style="opacity: 0"
        >
          <div
            v-for="(s, i) in stats"
            :key="s.l"
            class="group relative cursor-default overflow-hidden rounded-2xl border border-[#4A3B32]/16 bg-[#FFF9F3] py-5 px-5 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.2,1)] hover:border-[#4A3B32]/30 hover:bg-[#FFF4EA]"
            :ref="(el) => (nRefs[i] = el)"
            @mousemove="onStatMove($event)"
            @mouseleave="onStatLeave($event)"
          >
            <div
              class="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style="
                background: radial-gradient(
                  circle 180px at calc(var(--mx, 50) * 1%)
                    calc(var(--my, 50) * 1%),
                  rgba(255, 176, 133, 0.28),
                  transparent
                );
              "
            />
            <p
              class="relative z-10 font-display tracking-[-0.02em] text-[#2D2422]"
              :ref="(el) => (valRefs[i] = el)"
              style="
                font-size: clamp(22px, 2.6vw, 34px);
                line-height: 1;
                font-weight: 600;
              "
            >
              {{ s.v }}
            </p>
            <p
              class="relative z-10 mt-2 font-mono text-[#5C4D49]/95"
              style="
                font-size: 9px;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                font-weight: 500;
              "
            >
              {{ s.l }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const el = ref(null),
  lblEl = ref(null),
  lRefs = ref([]),
  bRefs = ref([]);
const tagsEl = ref(null),
  tagRefs = ref([]),
  metaEl = ref(null),
  statsEl = ref(null);
const nRefs = ref([]),
  valRefs = ref([]);
const lineWrapRefs = ref([]);
const lineInkRefs = ref([]);
const lineGlyphRefs = ref([]);
const sectionDecoEl = ref(null);
const lineCharQuickTos = [];
const supportsHover = ref(false);
const headlineReady = ref(false);
let removeHoverQueryListener = null;

const lines = ["Creative Developer", "& Designer —", "building the future."];
const lineChars = lines.map((line) => line.split(""));
const bio = [
  "会一点后端的前端开发者，擅长将创新的 UI/UX 设想",
  "快速转化为高质量 Web/App 产品。精通 Vue 3，",
  "掌握 Vibe Coding 开发范式，熟练运用 Claude Code、",
  "Cursor 等 AI 工具极大提升开发效率。",
];
const tags = [
  "Vue 3",
  "Swift · iOS",
  "Python",
  "Figma",
  "AI Dev",
  "GSAP",
  "Tailwind",
];
const yearsCoding = 2;
const projectsShipped = 5;
const stats = [
  { v: `${yearsCoding}`, l: "Years Coding" },
  { v: "iOS · Web", l: "Core Skills" },
  { v: "AI Dev", l: "Cursor & Claude" },
  { v: `${projectsShipped}`, l: "Projects Shipped" },
];
nRefs.value = new Array(stats.length);
valRefs.value = new Array(stats.length);
tagRefs.value = new Array(tags.length);
lineWrapRefs.value = lines.map((line) => new Array(line.length).fill(null));
lineInkRefs.value = lines.map((line) => new Array(line.length).fill(null));
lineGlyphRefs.value = lines.map((line) => new Array(line.length).fill(null));

function setLineWrapRef(node, lineIndex, charIndex) {
  if (!lineWrapRefs.value[lineIndex]) lineWrapRefs.value[lineIndex] = [];
  lineWrapRefs.value[lineIndex][charIndex] = node || null;
}

function setLineInkRef(node, lineIndex, charIndex) {
  if (!lineInkRefs.value[lineIndex]) lineInkRefs.value[lineIndex] = [];
  lineInkRefs.value[lineIndex][charIndex] = node || null;
}

function setLineGlyphRef(node, lineIndex, charIndex) {
  if (!lineGlyphRefs.value[lineIndex]) lineGlyphRefs.value[lineIndex] = [];
  lineGlyphRefs.value[lineIndex][charIndex] = node || null;
}

function isSerifAccentChar(lineIndex, charIndex) {
  // "building the future." -> only "the" uses serif italic accent.
  return lineIndex === 2 && charIndex >= 9 && charIndex <= 11;
}

function onStatMove(e) {
  const el = e.currentTarget;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  el.style.setProperty(
    "--mx",
    `${((e.clientX - rect.left) / (rect.width || 1)) * 100}`,
  );
  el.style.setProperty(
    "--my",
    `${((e.clientY - rect.top) / (rect.height || 1)) * 100}`,
  );
}

function onStatLeave(e) {
  const el = e.currentTarget;
  if (!el) return;
  el.style.setProperty("--mx", "50");
  el.style.setProperty("--my", "50");
}

function setupHeadlineElastic() {
  lineGlyphRefs.value.forEach((row, li) => {
    if (!lineCharQuickTos[li]) lineCharQuickTos[li] = [];
    row?.forEach((charEl, ci) => {
      if (!charEl) return;
      lineCharQuickTos[li][ci] = {
        yTo: gsap.quickTo(charEl, "y", {
          duration: 0.4,
          ease: "elastic.out(1, 0.3)",
        }),
        scaleTo: gsap.quickTo(charEl, "scale", {
          duration: 0.4,
          ease: "elastic.out(1, 0.3)",
        }),
      };
    });
  });
}

function onHeadlineMove(event) {
  if (!supportsHover.value || !headlineReady.value) return;
  const influenceRadius = 150;
  const maxShift = 12;
  const maxScaleBoost = 0.08;

  lineGlyphRefs.value.forEach((row, li) => {
    row?.forEach((charEl, ci) => {
      const driver = lineCharQuickTos[li]?.[ci];
      if (!charEl || !driver) return;
      const rect = charEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > influenceRadius) {
        driver.yTo(0);
        driver.scaleTo(1);
        return;
      }
      const strength = 1 - dist / influenceRadius;
      const yOffset = gsap.utils.clamp(
        -maxShift,
        maxShift,
        (dx / influenceRadius) * maxShift * strength,
      );
      const scale = 1 + maxScaleBoost * strength;
      driver.yTo(yOffset);
      driver.scaleTo(scale);
    });
  });
}

function onHeadlineLeave() {
  lineCharQuickTos.forEach((row) => {
    row?.forEach((driver) => {
      driver?.yTo(0);
      driver?.scaleTo(1);
    });
  });
}

let ctx;
onMounted(() => {
  const hoverMq = window.matchMedia("(hover: hover)");
  supportsHover.value = hoverMq.matches;
  const onHoverChange = (event) => {
    supportsHover.value = event.matches;
    if (!supportsHover.value) onHeadlineLeave();
  };
  if (typeof hoverMq.addEventListener === "function") {
    hoverMq.addEventListener("change", onHoverChange);
    removeHoverQueryListener = () =>
      hoverMq.removeEventListener("change", onHoverChange);
  } else {
    hoverMq.addListener(onHoverChange);
    removeHoverQueryListener = () => hoverMq.removeListener(onHoverChange);
  }

  ctx = gsap.context(() => {
    const mainRefs = lRefs.value.filter(Boolean);
    const inkRows = lineInkRefs.value.map((row) => row.filter(Boolean));
    const glyphRows = lineGlyphRefs.value.map((row) => row.filter(Boolean));
    const bodyRefs = bRefs.value.filter(Boolean);
    const tagList = tagRefs.value.filter(Boolean);
    const statCards = nRefs.value.filter(Boolean);
    gsap.fromTo(
      lblEl.value,
      { yPercent: 100, opacity: 0, rotation: 8 },
      {
        yPercent: 0,
        opacity: 1,
        rotation: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el.value,
          start: "top 82%",
          end: "bottom 15%",
          toggleActions: "play reverse play reverse",
        },
      },
    );

    gsap.set(mainRefs, { opacity: 1, yPercent: 0, rotation: 0 });
    gsap.set(inkRows.flat(), {
      scale: 0,
      opacity: 1,
      transformOrigin: "center center",
    });
    gsap.set(glyphRows.flat(), {
      opacity: 0,
      y: 12,
      transformOrigin: "center center",
    });
    const headlineTl = gsap.timeline({
      scrollTrigger: {
        trigger: el.value,
        start: "top 78%",
        end: "bottom 15%",
        toggleActions: "play reverse play reverse",
      },
      onStart: () => {
        headlineReady.value = false;
      },
      onReverseComplete: () => {
        headlineReady.value = false;
        onHeadlineLeave();
      },
      onComplete: () => {
        headlineReady.value = true;
      },
    });
    inkRows.forEach((inkdots, lineIndex) => {
      if (!inkdots.length) return;
      const glyphs = glyphRows[lineIndex] || [];
      const lineAt = lineIndex * 0.11;
      headlineTl
        .to(
          inkdots,
          {
            scale: 1,
            duration: 0.08,
            stagger: { each: 0.015, from: "start" },
            ease: "power4.out",
          },
          lineAt,
        )
        .to(
          inkdots,
          {
            scale: 3.2,
            opacity: 0,
            duration: 0.35,
            stagger: { each: 0.015, from: "start" },
            ease: "power2.out",
          },
          lineAt + 0.06,
        )
        .to(
          glyphs,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: { each: 0.015, from: "start" },
            ease: "power3.out",
          },
          lineAt + 0.11,
        );
    });

    gsap.fromTo(
      bodyRefs,
      { yPercent: 110, opacity: 0, rotation: 8 },
      {
        yPercent: 0,
        opacity: 1,
        rotation: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el.value,
          start: "top 72%",
          end: "bottom 15%",
          toggleActions: "play reverse play reverse",
        },
      },
    );

    gsap.fromTo(
      [
        tagsEl.value,
        ...tagList,
        metaEl.value,
        statsEl.value,
        ...statCards,
      ].filter(Boolean),
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.08,
        ease: "back.out(1.6)",
        scrollTrigger: {
          trigger: el.value,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play reverse play reverse",
        },
      },
    );

    ScrollTrigger.create({
      trigger: el.value,
      start: "top 85%",
      end: () =>
        `+=${Math.max(el.value?.offsetHeight * 1.8, window.innerHeight * 1.5)}`,
      scrub: 1,
      toggleActions: "play reverse play reverse",
      onUpdate: (self) => {
        const p = gsap.utils.clamp(0, 1, (self.progress - 0.15) / 0.55);
        const years = Math.round(yearsCoding * p);
        const shipped = Math.round(projectsShipped * p);
        if (valRefs.value[0]) valRefs.value[0].textContent = `${years}`;
        if (valRefs.value[3]) valRefs.value[3].textContent = `${shipped}`;
      },
    });

    if (sectionDecoEl.value) {
      gsap.fromTo(
        sectionDecoEl.value,
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: el.value,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    }
  }, el.value);
  setupHeadlineElastic();
});
onUnmounted(() => {
  removeHoverQueryListener?.();
  headlineReady.value = false;
  onHeadlineLeave();
  ctx?.revert();
});
</script>

<style scoped>
.hero-label {
  font-family: "JetBrains Mono", ui-monospace, monospace;
}

.intro-reveal-line {
  will-change: transform, opacity;
  font-variant-numeric: lining-nums;
}

.line-tight {
  margin-top: -0.03em;
}

.char-wrap {
  position: relative;
  display: inline-block;
}

.char-inkdot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff7e67;
  transform: translate(-50%, -50%) scale(0);
  opacity: 1;
  pointer-events: none;
}

.intro-char,
.char-glyph {
  display: inline-block;
  will-change: transform, opacity;
}

.char-glyph {
  opacity: 0;
}

.intro-char-serif-accent {
  font-family: "Instrument Serif", "Times New Roman", serif;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.01em;
}

.intro-tag {
  transition-property: border-color, background-color, color;
  transition-duration: 600ms;
  transition-timing-function: cubic-bezier(0.25, 1, 0.2, 1);
}

.intro-tag:hover {
  transition-duration: 200ms;
}
</style>
