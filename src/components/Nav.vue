<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-4 z-[900] flex justify-center"
  >
    <nav
      ref="navEl"
      class="nav-pill pointer-events-auto flex items-center gap-7 rounded-full px-6 py-3 backdrop-blur-md"
    >
      <div ref="logoMedalEl" class="logo-medal">
        <a
          ref="logoEl"
          href="/"
          class="logo-link font-mono text-[13px] uppercase tracking-[0.24em] text-[#2D2422] no-underline"
          @click.prevent="scrollToTop"
        >
          <span class="logo-roller">
            <span class="logo-face logo-en">WANG XINXIANG</span>
            <span class="logo-face logo-zh" aria-hidden="true">王鑫翔 WX</span>
          </span>
        </a>
      </div>

      <div
        ref="linksWrapEl"
        class="gooey-wrap relative flex items-center gap-2"
        @mouseleave="onLinksLeave"
      >
        <div
          ref="indicatorEl"
          class="nav-indicator pointer-events-none absolute left-0 top-1/2 h-7 -translate-y-1/2 rounded-full"
          style="background: var(--accent)"
        />
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.href"
          :ref="(el) => setLinkRef(el, link.id)"
          class="nav-link relative z-10 rounded-full px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.2em] no-underline"
          :class="activeId === link.id ? 'text-[#2D2422]' : 'text-[#5C4D49]'"
          :data-emoji="link.emoji"
          @click.prevent="scrollToSection(link.href)"
          @mouseenter="onLinkEnter(link.id)"
        >
          <span
            :ref="(el) => setSpanRef(el, link.id)"
            class="inline-block will-change-transform"
            data-cursor="view"
          >
            {{ link.label }}
          </span>
        </a>
      </div>
    </nav>
  </div>

  <svg class="pointer-events-none absolute h-0 w-0" aria-hidden="true">
    <defs>
      <filter id="gooey">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
          result="goo"
        />
        <feBlend in="SourceGraphic" in2="goo" />
      </filter>
    </defs>
  </svg>

  <div ref="bookmarkBarEl" class="bookmark-bar" aria-hidden="true" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMagnetic } from "../composables/useMagnetic";
import { useLenis } from "../composables/useLenis";

gsap.registerPlugin(ScrollTrigger);

const navEl = ref(null);
const logoEl = ref(null);
const logoMedalEl = ref(null);
const aboutEl = ref(null);
const skillsEl = ref(null);
const workEl = ref(null);
const contactEl = ref(null);
const aboutSpanEl = ref(null);
const skillsSpanEl = ref(null);
const workSpanEl = ref(null);
const contactSpanEl = ref(null);
const linksWrapEl = ref(null);
const indicatorEl = ref(null);
const bookmarkBarEl = ref(null);
let navTrigger = null;
let navCompactTrigger = null;
let sectionTriggers = [];
let navElevated = false;
const activeId = ref("about");
let bookmarkTimeline = null;
let resizeIndicatorHandler = null;
let resizeIndicatorTimer = 0;

const links = [
  {
    id: "about",
    label: "About",
    href: "#intro-anchor",
    rangeEndHref: "#toolkit",
    emoji: "📌",
  },
  {
    id: "skills",
    label: "Skills",
    href: "#toolkit",
    rangeEndHref: "#what-i-build-anchor",
    emoji: "✦",
  },
  {
    id: "work",
    label: "Work",
    href: "#what-i-build-anchor",
    rangeEndHref: "#contact-anchor",
    emoji: "➜",
  },
  { id: "contact", label: "Contact", href: "#contact-anchor", emoji: "✹" },
];

function setLinkRef(el, id) {
  if (id === "about") aboutEl.value = el;
  if (id === "skills") skillsEl.value = el;
  if (id === "work") workEl.value = el;
  if (id === "contact") contactEl.value = el;
}

function setSpanRef(el, id) {
  if (id === "about") aboutSpanEl.value = el;
  if (id === "skills") skillsSpanEl.value = el;
  if (id === "work") workSpanEl.value = el;
  if (id === "contact") contactSpanEl.value = el;
}

function getLinkEl(id) {
  if (id === "about") return aboutEl.value;
  if (id === "skills") return skillsEl.value;
  if (id === "work") return workEl.value;
  if (id === "contact") return contactEl.value;
  return null;
}

function moveIndicatorTo(id, immediate = false) {
  const linkEl = getLinkEl(id);
  const wrapEl = linksWrapEl.value;
  const indicator = indicatorEl.value;
  if (!linkEl || !wrapEl || !indicator) return;
  const x = linkEl.offsetLeft;
  const width = linkEl.offsetWidth;
  const currentX = Number(gsap.getProperty(indicator, "x")) || 0;
  const currentWidth = Number(gsap.getProperty(indicator, "width")) || width;
  if (immediate) {
    gsap.set(indicator, { x, width });
    return;
  }

  const currentRight = currentX + currentWidth;
  const targetRight = x + width;
  const leftEdge = Math.min(currentX, x);
  const rightEdge = Math.max(currentRight, targetRight);
  const span = rightEdge - leftEdge;
  const distance = Math.abs(x - currentX);
  const stretchFactor = gsap.utils.clamp(0.35, 1, distance / 110);
  const phaseOneWidth = currentWidth + (span - currentWidth) * stretchFactor;
  const phaseOneX = currentX <= x ? currentX : currentRight - phaseOneWidth;

  gsap
    .timeline({ defaults: { overwrite: "auto" } })
    .to(indicator, {
      x: phaseOneX,
      width: phaseOneWidth,
      duration: 0.35,
      ease: "power3.out",
    })
    .to(
      indicator,
      {
        x,
        width,
        duration: 0.45,
        ease: "expo.out",
      },
      0.22,
    );
}

function onLinkEnter(id) {
  moveIndicatorTo(id);
}

function onLinksLeave() {
  moveIndicatorTo(activeId.value);
}

function scrollToTop() {
  const { lenis } = useLenis();
  if (lenis) {
    lenis.scrollTo(0, {
      duration: 1.1,
      easing: gsap.parseEase("cubic-bezier(0.76, 0, 0.24, 1)"),
    });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToSection(href) {
  if (href === "#") {
    scrollToTop();
    return;
  }
  const target = document.querySelector(href);
  if (target) {
    const y = target.getBoundingClientRect().top + window.scrollY - 48;
    const { lenis } = useLenis();
    bookmarkTimeline?.kill();
    bookmarkTimeline = gsap
      .timeline({ defaults: { overwrite: "auto" } })
      .set(bookmarkBarEl.value, {
        opacity: 1,
        scaleX: 0,
        xPercent: 0,
        transformOrigin: "left center",
      })
      .to(bookmarkBarEl.value, {
        scaleX: 1,
        duration: 0.42,
        ease: "power3.out",
      })
      .add(() => {
        if (lenis) {
          lenis.scrollTo(y, {
            duration: 1.1,
            easing: gsap.parseEase("cubic-bezier(0.76, 0, 0.24, 1)"),
            onComplete: () => {
              gsap.to(bookmarkBarEl.value, {
                opacity: 0,
                xPercent: 100,
                scaleX: 0,
                transformOrigin: "right center",
                duration: 0.46,
                ease: "power2.inOut",
                overwrite: "auto",
              });
            },
          });
          return;
        }
        window.scrollTo({ top: y, behavior: "smooth" });
        gsap.to(bookmarkBarEl.value, {
          opacity: 0,
          duration: 0.32,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
  }
}

function updateNavSurface(elevated) {
  if (!navEl.value || navElevated === elevated) return;
  navElevated = elevated;
  gsap.to(navEl.value, {
    borderColor: elevated ? "rgba(92,77,73,0.16)" : "rgba(92,77,73,0.08)",
    boxShadow: elevated
      ? "0 8px 32px rgba(74,59,50,0.14)"
      : "0 8px 32px rgba(74,59,50,0.08)",
    backgroundColor: "rgba(253,252,248,0)",
    duration: 0.4,
    ease: "power3.out",
    overwrite: "auto",
  });
}

useMagnetic(logoMedalEl, { maxOffset: 12, duration: 0.3 });
useMagnetic(aboutSpanEl, {
  maxOffset: 16,
  duration: 0.3,
  hoverScale: 1.06,
  cursorLabel: "VIEW",
});
useMagnetic(skillsSpanEl, {
  maxOffset: 16,
  duration: 0.3,
  hoverScale: 1.06,
  cursorLabel: "VIEW",
});
useMagnetic(workSpanEl, {
  maxOffset: 16,
  duration: 0.3,
  hoverScale: 1.06,
  cursorLabel: "VIEW",
});
useMagnetic(contactSpanEl, {
  maxOffset: 16,
  duration: 0.3,
  hoverScale: 1.06,
  cursorLabel: "VIEW",
});

onMounted(() => {
  if (!navEl.value) return;

  gsap.set(navEl.value, { y: -16, opacity: 0 });
  gsap.set(navEl.value, {
    backgroundColor: "rgba(253,252,248,0)",
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: "rgba(92,77,73,0.08)",
    boxShadow: "0 8px 32px rgba(74,59,50,0.08)",
  });
  gsap.set(indicatorEl.value, { width: 0, x: 0 });
  gsap.set(bookmarkBarEl.value, { opacity: 0, scaleX: 0, xPercent: 0 });
  requestAnimationFrame(() => {
    moveIndicatorTo(activeId.value, true);
  });

  sectionTriggers = links
    .map((link) => {
      const target = document.querySelector(link.href);
      if (!target) return null;
      const rangeEndTarget = link.rangeEndHref
        ? document.querySelector(link.rangeEndHref)
        : null;
      return ScrollTrigger.create({
        trigger: target,
        start: "top 45%",
        endTrigger: rangeEndTarget || target,
        end: rangeEndTarget ? "top 45%" : "bottom 45%",
        onEnter: () => {
          activeId.value = link.id;
          moveIndicatorTo(link.id);
        },
        onEnterBack: () => {
          activeId.value = link.id;
          moveIndicatorTo(link.id);
        },
      });
    })
    .filter(Boolean);

  navCompactTrigger = ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "+=220",
    scrub: true,
    onUpdate: (self) => {
      if (!navEl.value) return;
      const compactProgress = gsap.utils.clamp(0, 1, self.progress);
      navEl.value.style.setProperty(
        "--compact-progress",
        compactProgress.toFixed(4),
      );
      navEl.value.classList.toggle("is-compact", self.scroll() > 120);
    },
  });

  navTrigger = ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    onUpdate: (self) => {
      updateNavSurface(self.scroll() > window.innerHeight * 0.5);
    },
  });
  updateNavSurface(window.scrollY > window.innerHeight * 0.5);

  gsap.to(navEl.value, {
    y: 0,
    opacity: 1,
    duration: 0.7,
    ease: "power3.out",
  });

  resizeIndicatorHandler = () => {
    if (resizeIndicatorTimer) window.clearTimeout(resizeIndicatorTimer);
    resizeIndicatorTimer = window.setTimeout(() => {
      moveIndicatorTo(activeId.value, true);
      resizeIndicatorTimer = 0;
    }, 120);
  };
  window.addEventListener("resize", resizeIndicatorHandler, { passive: true });
});

onUnmounted(() => {
  navTrigger?.kill();
  navCompactTrigger?.kill();
  sectionTriggers.forEach((trigger) => trigger?.kill());
  sectionTriggers = [];
  bookmarkTimeline?.kill();
  if (resizeIndicatorHandler) {
    window.removeEventListener("resize", resizeIndicatorHandler);
    resizeIndicatorHandler = null;
  }
  if (resizeIndicatorTimer) {
    window.clearTimeout(resizeIndicatorTimer);
    resizeIndicatorTimer = 0;
  }
  gsap.killTweensOf(navEl.value);
  gsap.killTweensOf(indicatorEl.value);
  gsap.killTweensOf(bookmarkBarEl.value);
});
</script>

<style scoped>
.nav-pill {
  --compact-progress: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding-left: calc(24px - 8px * var(--compact-progress));
  padding-right: calc(24px - 8px * var(--compact-progress));
  padding-top: calc(12px - 2px * var(--compact-progress));
  padding-bottom: calc(12px - 2px * var(--compact-progress));
  font-size: calc(1em - 0.06em * var(--compact-progress));
}

.nav-pill.is-compact {
  box-shadow: 0 10px 30px rgba(74, 59, 50, 0.12);
}

.gooey-wrap {
  filter: url(#gooey);
}

.nav-indicator {
  will-change: transform, width;
}

.nav-link {
  transition: color 0.35s cubic-bezier(0.25, 1, 0.2, 1);
}

.nav-link::before {
  content: attr(data-emoji);
  position: absolute;
  left: 50%;
  top: -20px;
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: rgba(255, 176, 133, 0.12);
  border: 1px solid rgba(255, 176, 133, 0.45);
  transform: translate(-50%, 4px);
  opacity: 0;
  font-size: 9px;
  line-height: 1;
  transition:
    opacity 0.3s cubic-bezier(0.25, 1, 0.2, 1),
    transform 0.4s cubic-bezier(0.25, 1, 0.2, 1);
  pointer-events: none;
}

.nav-link:hover::before,
.nav-link:focus-visible::before {
  opacity: 1;
  transform: translate(-50%, 0);
}

.nav-link:not(:hover):not(:focus-visible)::before {
  transform: translate(-50%, -8px);
}

.nav-link:hover,
.nav-link:focus-visible {
  transition-duration: 0.15s;
}

.logo-medal {
  display: inline-flex;
  align-items: center;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(253, 252, 248, 0.72);
  border: 1px solid rgba(255, 176, 133, 0.25);
  line-height: 1.1;
}

.logo-roller {
  position: relative;
  display: block;
  height: 1.18em;
  overflow: hidden;
}

.logo-face {
  display: block;
  white-space: nowrap;
  transition: transform 400ms cubic-bezier(0.65, 0, 0.35, 1);
}

.logo-en {
  transform: translateY(0);
}

.logo-zh {
  position: absolute;
  inset: 0 auto auto 0;
  transform: translateY(100%);
}

.logo-link:hover .logo-en,
.logo-link:focus-visible .logo-en {
  transform: translateY(-100%);
}

.logo-link:hover .logo-zh,
.logo-link:focus-visible .logo-zh {
  transform: translateY(0);
}

.bookmark-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 905;
  width: 100vw;
  height: 1px;
  transform-origin: left center;
  background: linear-gradient(
    90deg,
    rgba(255, 176, 133, 0.9),
    rgba(255, 176, 133, 0.35)
  );
  pointer-events: none;
}

:global(body.what-i-build-dark) .nav-pill {
  background: rgba(26, 22, 20, 0.85) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.32) !important;
}

:global(body.what-i-build-dark) .nav-pill a,
:global(body.what-i-build-dark) .nav-pill .nav-link {
  color: #fdfcf8 !important;
}

@media (max-width: 767px) {
  .nav-pill {
    width: calc(100vw - 16px);
    max-width: calc(100vw - 16px);
    gap: 0.55rem;
    padding: 0.55rem 0.7rem;
    justify-content: space-between;
  }

  .logo-link {
    min-height: 34px;
    padding: 6px 10px;
    font-size: 10px !important;
    letter-spacing: 0.16em !important;
  }

  .gooey-wrap {
    gap: 0.2rem;
    flex: 1;
    justify-content: flex-end;
  }

  .nav-link {
    padding: 0.45rem 0.6rem;
    font-size: 9px !important;
    letter-spacing: 0.14em !important;
  }

  .nav-link::before {
    display: none;
  }
}

@media (max-width: 420px) {
  .nav-pill {
    gap: 0.4rem;
    padding-right: 0.55rem;
    padding-left: 0.55rem;
  }

  .logo-link {
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    font-size: 9px !important;
    letter-spacing: 0.1em !important;
  }

  .nav-link {
    padding: 0.42rem 0.5rem;
    letter-spacing: 0.1em !important;
  }
}
</style>
