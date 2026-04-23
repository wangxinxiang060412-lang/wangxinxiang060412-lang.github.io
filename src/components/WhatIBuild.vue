<template>
  <section
    id="what-i-build"
    ref="sectionEl"
    class="what-i-build-section relative w-full overflow-hidden"
    style="background: var(--bg-warm); perspective: 2000px"
  >
    <div
      ref="darkBgOverlayEl"
      class="dark-leather-overlay pointer-events-none absolute inset-0 z-0"
      style="
        transform: rotateX(-90deg);
        transform-origin: top center;
        opacity: 0.5;
      "
      aria-hidden="true"
    />
    <svg
      ref="sectionGlyphEl"
      class="pointer-events-none absolute -top-[190px] -left-[165px] z-[1] hidden select-none lg:block"
      width="560"
      height="560"
      viewBox="0 0 560 560"
      aria-hidden="true"
      style="transform: rotate(-8deg)"
    >
      <text
        x="32"
        y="428"
        class="font-display"
        style="
          fill: none;
          stroke: rgba(253, 252, 248, 0.12);
          stroke-width: 1.6;
          font-size: 500px;
          font-weight: 400;
          letter-spacing: -0.04em;
        "
      >
        W
      </text>
    </svg>
    <article
      class="project-section relative z-10 flex min-h-[100vh] items-center px-6 py-24 md:px-12 lg:px-20 lg:py-28"
    >
      <div class="mx-auto w-full max-w-[1440px]">
        <KineticDeckPortal />
      </div>
    </article>

    <article
      v-for="(project, index) in projects"
      :key="project.title"
      class="project-section relative z-10 flex min-h-[96vh] items-center overflow-hidden px-6 py-24 md:px-12 lg:px-20 lg:py-28"
    >
      <div class="mx-auto w-full max-w-[1440px]">
        <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div class="max-w-xl">
            <div class="overflow-hidden">
              <p
                :ref="(node) => setRevealRef(node, `kicker-${index}`)"
                class="font-mono mb-5 text-[10px] uppercase tracking-[0.35em]"
                style="
                  color: color-mix(in srgb, var(--accent) 80%, transparent);
                "
              >
                {{ project.kicker }}
              </p>
            </div>
            <div class="overflow-hidden">
              <h3
                :ref="(node) => setRevealRef(node, `title-${index}`)"
                class="font-display font-extrabold leading-[0.92] tracking-[-0.03em] text-[#F5EFE5]"
                style="font-size: clamp(38px, 6.5vw, 84px)"
              >
                {{ project.title }}
              </h3>
            </div>
            <div class="overflow-hidden">
              <p
                :ref="(node) => setRevealRef(node, `desc-${index}`)"
                class="font-body mt-6 text-[14px] leading-relaxed text-[#F5EFE5]/74 md:text-[16px]"
              >
                {{ project.desc }}
              </p>
            </div>
            <div class="overflow-hidden">
              <p
                :ref="(node) => setRevealRef(node, `meta-${index}`)"
                class="font-mono mt-8 text-[10px] uppercase tracking-[0.28em]"
                style="
                  color: color-mix(in srgb, var(--accent) 80%, transparent);
                "
              >
                {{ project.meta }}
              </p>
            </div>
            <router-link
              :to="
                project.projectKey === 'lighttrip'
                  ? '/lighttrip'
                  : project.projectKey === 'pixel-buddy'
                    ? '/pixel-buddy'
                    : '/'
              "
              class="warm-link font-mono mt-7 inline-flex text-[11px] uppercase tracking-[0.22em] text-[#F5EFE5] no-underline"
            >
              View Details
            </router-link>
          </div>

          <div
            :ref="(node) => setVisualRef(node, index)"
            class="project-visual relative overflow-hidden rounded-[32px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]"
            data-easter-card="1"
            :data-project="project.projectKey || ''"
            :data-figma-url="project.figmaUrl || ''"
            :data-github-url="project.githubUrl || ''"
          >
            <div
              class="pointer-events-none absolute inset-0"
              style="
                background: radial-gradient(
                  420px 220px at 75% 20%,
                  rgba(255, 176, 133, 0.26),
                  transparent 70%
                );
              "
            />
            <div
              :ref="(node) => setContentRef(node, index)"
              class="relative z-10 aspect-[4/3] w-full p-7 md:p-9"
            >
              <div
                class="h-full w-full rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]"
                :class="
                  project.projectKey === 'pixel-buddy'
                    ? 'flex items-center justify-center p-0'
                    : 'p-7'
                "
              >
                <div
                  v-if="project.projectKey === 'pixel-buddy'"
                  class="flex h-full w-full items-center justify-center"
                >
                  <PixelBuddyGallery />
                </div>
                <div v-else>
                  <p
                    class="font-mono text-[10px] uppercase tracking-[0.28em]"
                    style="
                      color: color-mix(in srgb, var(--accent) 80%, transparent);
                    "
                  >
                    {{ project.kicker }}
                  </p>
                  <h4
                    class="font-display mt-4 text-[clamp(24px,3.2vw,42px)] leading-[0.98] tracking-[-0.02em] text-[#F5EFE5]"
                  >
                    {{ project.title }}
                  </h4>
                  <div class="mt-6 flex flex-wrap gap-2">
                    <span
                      v-for="(token, tokenIndex) in project.tokens"
                      :key="token"
                      :ref="(node) => setTokenRef(node, index, tokenIndex)"
                      class="font-mono rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-[#F5EFE5]"
                      style="
                        border-color: color-mix(
                          in srgb,
                          var(--accent) 50%,
                          transparent
                        );
                      "
                    >
                      {{ token }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import KineticDeckPortal from "./KineticDeckPortal.vue";
import PixelBuddyGallery from "./PixelBuddyGallery.vue";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    kicker: "01 — This Site",
    title: "个人作品集",
    desc: "你正在看的这个网站。从零用 Vue 3 + GSAP 手写每一帧动画，不用模板，不用组件库。三层纸张揭开动画、3D 策展空间、逐字符透镜——每个细节都是手工打磨。",
    meta: "Vue 3 / GSAP / Three.js / 2026",
    tokens: ["Vue 3", "GSAP", "ScrollTrigger"],
    projectKey: "lighttrip",
    figmaUrl: "https://www.figma.com/",
    githubUrl: "https://github.com/",
  },
  {
    kicker: "02 — 像素伙伴",
    title: "Pixel Buddy",
    desc: "一款像素风电子宠物 iOS App。支持 Dynamic Island 实时活动、桌面小组件一键互动、5种宠物 ×5种动画状态 = 75帧逐帧手绘。",
    meta: "Swift / WidgetKit / ActivityKit / 2026",
    tokens: ["Cursor", "Claude", "Automation"],
    projectKey: "pixel-buddy",
    figmaUrl: "https://www.figma.com/",
    githubUrl: "https://github.com/",
  },
];

const revealMap = new Map();
const visualRefs = ref([]);
const contentRefs = ref([]);
const tokenRefs = ref([]);
const sectionEl = ref(null);
const darkBgOverlayEl = ref(null);
const sectionGlyphEl = ref(null);

function setRevealRef(node, key) {
  if (node) revealMap.set(key, node);
  else revealMap.delete(key);
}

function setVisualRef(node, index) {
  if (node) visualRefs.value[index] = node;
}

function setContentRef(node, index) {
  if (node) contentRefs.value[index] = node;
}

function setTokenRef(node, index, tokenIndex) {
  if (!tokenRefs.value[index]) tokenRefs.value[index] = [];
  tokenRefs.value[index][tokenIndex] = node || null;
}

function playBookCloseSound() {
  if (typeof window === "undefined") return;
  const audioEnabled = window.audioEnabled === true;
  if (!audioEnabled || typeof window.playOnce !== "function") return;
  window.playOnce("book-close");
}

let ctx;

onMounted(() => {
  ctx = gsap.context(() => {
    if (sectionEl.value && darkBgOverlayEl.value) {
      let passedMidpoint = false;
      gsap.fromTo(
        darkBgOverlayEl.value,
        {
          rotateX: -90,
          opacity: 0.5,
          transformOrigin: "top center",
        },
        {
          rotateX: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionEl.value,
            start: "top bottom-=200",
            end: "top top+=120",
            scrub: 1,
            onUpdate: (self) => {
              const isBeyondMid = self.progress >= 0.5;
              if (isBeyondMid !== passedMidpoint) {
                playBookCloseSound();
                passedMidpoint = isBeyondMid;
              }
            },
          },
        },
      );

      ScrollTrigger.create({
        trigger: sectionEl.value,
        start: "top bottom-=200",
        end: "bottom top+=200",
        onEnter: () => document.body.classList.add("what-i-build-dark"),
        onEnterBack: () => document.body.classList.add("what-i-build-dark"),
        onLeave: () => document.body.classList.remove("what-i-build-dark"),
        onLeaveBack: () => document.body.classList.remove("what-i-build-dark"),
      });
    }

    if (sectionEl.value && sectionGlyphEl.value) {
      gsap.fromTo(
        sectionGlyphEl.value,
        { yPercent: -8, xPercent: -4 },
        {
          yPercent: 10,
          xPercent: 2,
          ease: "none",
          scrollTrigger: {
            trigger: sectionEl.value,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    }

    gsap.utils.toArray(".project-section").forEach((articleEl) => {
      gsap.fromTo(
        articleEl,
        {
          clipPath: "polygon(100% 92%, 100% 100%, 92% 100%, 98% 94%)",
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1.5,
          ease: "expo.out",
          scrollTrigger: {
            trigger: articleEl,
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        },
      );
    });

    projects.forEach((_, index) => {
      const title = revealMap.get(`title-${index}`);
      const desc = revealMap.get(`desc-${index}`);
      const kicker = revealMap.get(`kicker-${index}`);
      const meta = revealMap.get(`meta-${index}`);
      const visual = visualRefs.value[index];
      const content = contentRefs.value[index];
      const tokens = tokenRefs.value[index] || [];

      const textTargets = [kicker, title, desc, meta].filter(Boolean);
      if (textTargets.length) {
        gsap.fromTo(
          textTargets,
          { yPercent: 108, rotation: 10, opacity: 0 },
          {
            yPercent: 0,
            rotation: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: title || textTargets[0],
              start: "top 82%",
              end: "bottom 15%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      }

      if (visual) {
        gsap.fromTo(
          visual,
          {
            clipPath: "inset(20% 20% 20% 20% round 32px)",
            scale: 0.9,
          },
          {
            clipPath: "inset(0% 0% 0% 0% round 32px)",
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: visual,
              start: "top 88%",
              end: "top 30%",
              scrub: 1,
              toggleActions: "play reverse play reverse",
            },
          },
        );

        if (content) {
          gsap.fromTo(
            content,
            { y: 40 },
            {
              y: -40,
              ease: "none",
              scrollTrigger: {
                trigger: visual,
                scrub: 1,
                start: "top bottom",
                end: "bottom top",
                toggleActions: "play reverse play reverse",
              },
            },
          );
        }

        if (tokens.length) {
          gsap.fromTo(
            tokens,
            { y: 15, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.82,
              stagger: 0.1,
              ease: "back.out(1.6)",
              scrollTrigger: {
                trigger: visual,
                start: "top 82%",
                end: "bottom 15%",
                toggleActions: "play reverse play reverse",
              },
            },
          );
        }
      }
    });
  });
});

onUnmounted(() => {
  document.body.classList.remove("what-i-build-dark");
  ctx?.revert();
});
</script>

<style scoped>
.dark-leather-overlay {
  background-color: #120e0b;
  background-image:
    radial-gradient(circle at 52% 46%, #2a211c 0%, #0f0a08 82%),
    url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.12' /%3E%3C/svg%3E");
  background-size:
    cover,
    180px 180px;
  background-repeat: no-repeat, repeat;
}

.warm-link {
  position: relative;
}

.warm-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 2px;
  background: #ff7e67;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.45s cubic-bezier(0.25, 1, 0.2, 1);
}

.warm-link:hover::after {
  transform: scaleX(1);
}
</style>
