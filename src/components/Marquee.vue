<template>
  <div
    ref="rootEl"
    aria-hidden="true"
    class="marquee-surface group cursor-default overflow-hidden border-y border-[#5C4D49]/10 py-4"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <div
      v-if="isReducedMotion"
      class="marquee-reduced-keyword font-mono text-[13px] font-semibold uppercase tracking-[0.34em] text-[#2D2422]"
    >
      Creative Stack
    </div>
    <div
      ref="trackTop"
      class="flex whitespace-nowrap will-change-transform mb-2"
      :class="isReducedMotion ? 'opacity-25' : ''"
    >
      <span v-for="n in 2" :key="'top-' + n" class="flex items-center">
        <template v-for="entry in topEntries" :key="`top-item-${n}-${entry.key}`">
          <span
            v-if="entry.type === 'token'"
            class="marquee-token marquee-token-top font-mono text-[13px] font-semibold uppercase text-[#2D2422]"
            :class="[isSerifAccent(entry.label) ? 'font-serif italic tracking-[0.2em]' : 'tracking-[0.28em]', tokenClass('top', entry.index)]"
            @mouseenter="onTokenEnter('top', entry.index)"
            @mouseleave="onTokenLeave"
          >
            <span v-if="getReplacementWord('top', entry.index)" class="token-flip" :class="{ 'is-flipping': isFlipping('top', entry.index) }">
              <span class="token-layer token-base">
                {{ entry.label }}<span class="mx-3 text-[#2D2422]/90">{{ getSeparator(entry.index) }}</span>
              </span>
              <span class="token-layer token-next" aria-hidden="true">
                {{ getReplacementWord('top', entry.index) }}<span class="mx-3 text-[#2D2422]/90">{{ getSeparator(entry.index) }}</span>
              </span>
            </span>
            <template v-else>
              {{ entry.label }}<span class="mx-3 text-[#2D2422]/90">{{ getSeparator(entry.index) }}</span>
            </template>
          </span>
          <span
            v-else
            class="marquee-marker mx-3 inline-flex h-[14px] w-[14px] items-center justify-center text-[#2D2422]/65"
            aria-hidden="true"
          >
            <svg v-if="entry.variant === 'feather'" viewBox="0 0 14 14" class="h-[14px] w-[14px]">
              <path d="M2 11c4-1 7-4 10-9-1 5-3 8-7 10H2z" fill="currentColor" opacity="0.6" />
              <path d="M4 9l3-3" stroke="currentColor" stroke-width="1" fill="none" />
            </svg>
            <svg v-else-if="entry.variant === 'stamp'" viewBox="0 0 14 14" class="h-[14px] w-[14px]">
              <circle cx="7" cy="7" r="5.2" stroke="currentColor" stroke-width="1" fill="none" />
              <circle cx="7" cy="7" r="3.5" stroke="currentColor" stroke-width="0.8" fill="none" opacity="0.7" />
            </svg>
            <svg v-else viewBox="0 0 14 14" class="h-[14px] w-[14px]">
              <path d="M1 7h12" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" />
              <circle cx="7" cy="7" r="1.2" fill="currentColor" />
            </svg>
          </span>
        </template>
      </span>
    </div>

    <div
      ref="trackBottom"
      class="flex whitespace-nowrap will-change-transform"
      :class="isReducedMotion ? 'opacity-25' : ''"
    >
      <span v-for="n in 2" :key="'bottom-' + n" class="flex items-center">
        <template v-for="entry in bottomEntries" :key="`bottom-item-${n}-${entry.key}`">
          <span
            v-if="entry.type === 'token'"
            class="marquee-token marquee-token-bottom font-mono text-[9px] font-normal uppercase text-[#2D2422]"
            :class="[isSerifAccent(entry.label) ? 'font-serif italic tracking-[0.43em]' : 'tracking-[0.5em]', tokenClass('bottom', entry.index)]"
            @mouseenter="onTokenEnter('bottom', entry.index)"
            @mouseleave="onTokenLeave"
          >
            <span
              v-if="getReplacementWord('bottom', entry.index)"
              class="token-flip"
              :class="{ 'is-flipping': isFlipping('bottom', entry.index) }"
            >
              <span class="token-layer token-base">
                {{ entry.label }}<span class="mx-3 text-[#2D2422]/90">{{ getSeparator(entry.index + 1) }}</span>
              </span>
              <span class="token-layer token-next" aria-hidden="true">
                {{ getReplacementWord('bottom', entry.index) }}<span class="mx-3 text-[#2D2422]/90">{{ getSeparator(entry.index + 1) }}</span>
              </span>
            </span>
            <template v-else>
              {{ entry.label }}<span class="mx-3 text-[#2D2422]/90">{{ getSeparator(entry.index + 1) }}</span>
            </template>
          </span>
          <span
            v-else
            class="marquee-marker mx-3 inline-flex h-[14px] w-[14px] items-center justify-center text-[#2D2422]/65"
            aria-hidden="true"
          >
            <svg v-if="entry.variant === 'feather'" viewBox="0 0 14 14" class="h-[14px] w-[14px]">
              <path d="M2 11c4-1 7-4 10-9-1 5-3 8-7 10H2z" fill="currentColor" opacity="0.6" />
              <path d="M4 9l3-3" stroke="currentColor" stroke-width="1" fill="none" />
            </svg>
            <svg v-else-if="entry.variant === 'stamp'" viewBox="0 0 14 14" class="h-[14px] w-[14px]">
              <circle cx="7" cy="7" r="5.2" stroke="currentColor" stroke-width="1" fill="none" />
              <circle cx="7" cy="7" r="3.5" stroke="currentColor" stroke-width="0.8" fill="none" opacity="0.7" />
            </svg>
            <svg v-else viewBox="0 0 14 14" class="h-[14px] w-[14px]">
              <path d="M1 7h12" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" />
              <circle cx="7" cy="7" r="1.2" fill="currentColor" />
            </svg>
          </span>
        </template>
      </span>
    </div>
  </div>
  <p class="sr-only">{{ itemsAlt.join(', ') }}</p>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { gsap } from 'gsap'

const rootEl = ref(null)
const trackTop = ref(null)
const trackBottom = ref(null)
const hoveredToken = ref({ line: null, index: -1 })
const isReducedMotion = ref(false)

const items = ['Creative','Vue 3','Swift','iOS Dev','Python','Figma','GSAP','Tailwind','Claude Code','Cursor','AI Dev','UI/UX','Prompt Engineering','Vibe Coding','数字媒体技术']
const itemsBottom = ['Motion Design','Three.js','Lenis','WidgetKit','SwiftUI','Dynamic Island','Composition API','Vite','Web3Forms','ScrollTrigger','Adobe Animate','达芬奇','MATLAB']
const itemsAlt = ['Coffee', 'Midnight Code', 'Late Night', 'Ink & Pixel', 'SF Pro', '云南', '浙江']
const markerCycle = ['feather', 'stamp', 'line']
const serifAccents = new Set(['Creative', 'Motion Design', 'Prompt Engineering', 'Vibe Coding'])

const replacementWordsTop = ref({})
const replacementWordsBottom = ref({})
const flippingMap = ref({})

let tweenTop
let tweenBottom
let timeScaleProxies = []
let motionQuery = null
let removeMotionQueryListener = null
let replaceTimer = 0
let flipCleanupTimers = []

const topEntries = computed(() => buildEntries(items, 'top'))
const bottomEntries = computed(() => buildEntries(itemsBottom, 'bottom'))

function buildEntries(arr, line) {
  const out = []
  arr.forEach((label, index) => {
    out.push({ type: 'token', line, index, label, key: `${line}-${index}` })
    const isGroupBoundary = (index + 1) % 4 === 0 && index < arr.length - 1
    if (isGroupBoundary) {
      const variant = markerCycle[Math.floor(index / 4) % markerCycle.length]
      out.push({ type: 'marker', key: `${line}-m-${index}`, variant })
    }
  })
  return out
}

function getSeparator(index) {
  return index % 2 === 0 ? '✦' : '/'
}

function isSerifAccent(item) {
  return serifAccents.has(item)
}

function keyFor(line, index) {
  return `${line}-${index}`
}

function getReplacementWord(line, index) {
  const key = String(index)
  if (line === 'top') return replacementWordsTop.value[key] || ''
  return replacementWordsBottom.value[key] || ''
}

function isFlipping(line, index) {
  return Boolean(flippingMap.value[keyFor(line, index)])
}

function tokenClass(line, index) {
  const hoveredLine = hoveredToken.value.line
  const hoveredIndex = hoveredToken.value.index
  if (!hoveredLine || hoveredIndex < 0) return ''
  if (line === hoveredLine && index === hoveredIndex) return 'is-hovered'
  if (line === hoveredLine && Math.abs(index - hoveredIndex) === 1) return 'is-neighbor'
  return 'is-dimmed'
}

function onTokenEnter(line, index) {
  hoveredToken.value = { line, index }
}

function onTokenLeave() {
  hoveredToken.value = { line: null, index: -1 }
}

function pickUniqueSlots() {
  const slots = []
  for (let i = 0; i < items.length; i += 1) slots.push({ line: 'top', index: i, original: items[i] })
  for (let i = 0; i < itemsBottom.length; i += 1) slots.push({ line: 'bottom', index: i, original: itemsBottom[i] })
  const first = slots.splice(Math.floor(Math.random() * slots.length), 1)[0]
  const second = slots.splice(Math.floor(Math.random() * slots.length), 1)[0]
  return [first, second]
}

function pickAltWord(original) {
  const pool = itemsAlt.filter((word) => word !== original)
  return pool[Math.floor(Math.random() * pool.length)] || original
}

function scheduleReplacements() {
  if (isReducedMotion.value) return
  const targets = pickUniqueSlots()
  const nextTop = { ...replacementWordsTop.value }
  const nextBottom = { ...replacementWordsBottom.value }

  targets.forEach(({ line, index, original }) => {
    const nextWord = pickAltWord(original)
    if (line === 'top') nextTop[String(index)] = nextWord
    if (line === 'bottom') nextBottom[String(index)] = nextWord

    const k = keyFor(line, index)
    flippingMap.value = { ...flippingMap.value, [k]: true }
    const timer = window.setTimeout(() => {
      const { [k]: _removed, ...rest } = flippingMap.value
      flippingMap.value = rest
      // 移除已完成的 timer，防止数组无限增长
      const idx = flipCleanupTimers.indexOf(timer)
      if (idx !== -1) flipCleanupTimers.splice(idx, 1)
    }, 420)
    flipCleanupTimers.push(timer)
  })

  replacementWordsTop.value = nextTop
  replacementWordsBottom.value = nextBottom
}

function setupReplacementTimer() {
  clearInterval(replaceTimer)
  replaceTimer = window.setInterval(scheduleReplacements, 1500)
}

function clearFlipCleanupTimers() {
  flipCleanupTimers.forEach((timer) => window.clearTimeout(timer))
  flipCleanupTimers = []
}

function tweenTimeScaleTo(target) {
  // gsap.to([tweenA, tweenB], { timeScale }) treats tweens as plain
  // objects and can fail to animate the getter/setter cleanly across
  // versions. Animate via a stable proxy and apply with the official API.
  ;[tweenTop, tweenBottom].filter(Boolean).forEach((tween, idx) => {
    if (!timeScaleProxies[idx]) {
      timeScaleProxies[idx] = { value: tween.timeScale() }
    }
    const proxy = timeScaleProxies[idx]
    proxy.value = tween.timeScale()
    gsap.to(proxy, {
      value: target,
      duration: 0.7,
      ease: target < proxy.value ? 'power3.out' : 'power3.inOut',
      overwrite: true,
      onUpdate: () => tween.timeScale(proxy.value),
    })
  })
}

function onEnter() {
  tweenTimeScaleTo(0.15)
}

function onLeave() {
  onTokenLeave()
  tweenTimeScaleTo(1)
}

onMounted(() => {
  if (!trackTop.value || !trackBottom.value) return
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  isReducedMotion.value = reducedMotion

  if (reducedMotion) {
    gsap.set(trackTop.value, { x: '0%' })
    gsap.set(trackBottom.value, { x: '0%' })
  } else {
    tweenTop = gsap.to(trackTop.value, {
      x: '-=50%',
      repeat: -1,
      ease: 'none',
      duration: 24,
    })

    gsap.set(trackBottom.value, { x: '-50%' })
    tweenBottom = gsap.to(trackBottom.value, {
      x: '+=50%',
      repeat: -1,
      ease: 'none',
      duration: 24,
    })
    scheduleReplacements()
    setupReplacementTimer()
  }

  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const onChange = (e) => {
    isReducedMotion.value = e.matches
    if (e.matches) {
      clearInterval(replaceTimer)
      replaceTimer = 0
      clearFlipCleanupTimers()
      tweenTop?.timeScale(0)
      tweenBottom?.timeScale(0)
      gsap.set(trackTop.value, { x: '0%' })
      gsap.set(trackBottom.value, { x: '0%' })
    } else {
      if (!tweenTop && trackTop.value) {
        tweenTop = gsap.to(trackTop.value, {
          x: '-=50%',
          repeat: -1,
          ease: 'none',
          duration: 24,
        })
      }
      if (!tweenBottom && trackBottom.value) {
        gsap.set(trackBottom.value, { x: '-50%' })
        tweenBottom = gsap.to(trackBottom.value, {
          x: '+=50%',
          repeat: -1,
          ease: 'none',
          duration: 24,
        })
      }
      tweenTop?.timeScale(1)
      tweenBottom?.timeScale(1)
      scheduleReplacements()
      setupReplacementTimer()
    }
  }
  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', onChange)
    removeMotionQueryListener = () =>
      motionQuery?.removeEventListener('change', onChange)
  } else {
    motionQuery.addListener(onChange)
    removeMotionQueryListener = () => motionQuery?.removeListener(onChange)
  }
})

onUnmounted(() => {
  timeScaleProxies.forEach((p) => p && gsap.killTweensOf(p))
  timeScaleProxies = []
  tweenTop?.kill()
  tweenBottom?.kill()
  clearInterval(replaceTimer)
  replaceTimer = 0
  clearFlipCleanupTimers()
  removeMotionQueryListener?.()
  removeMotionQueryListener = null
  motionQuery = null
})
</script>

<style scoped>
.marquee-surface {
  position: relative;
  background: linear-gradient(90deg, #FFB085, #FF9B6A, #FFB085);
  background-size: 200% 100%;
  animation: marqueeGlowShift 16s ease-in-out infinite;
}

.marquee-surface::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.055;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
  background-repeat: repeat;
}

.marquee-reduced-keyword {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  transform: translate(-50%, -50%);
  white-space: nowrap;
  opacity: 0.95;
}

.marquee-token {
  display: inline-flex;
  align-items: center;
  transform-origin: center center;
  transition:
    transform 300ms ease-out,
    opacity 300ms ease-out,
    color 300ms ease-out,
    letter-spacing 300ms ease-out;
}

.marquee-token.is-hovered {
  transform: scale(1.12);
  color: #2D2422;
  opacity: 1;
}

.marquee-token.is-neighbor {
  transform: scale(0.96);
  opacity: 0.5;
}

.marquee-token.is-dimmed {
  opacity: 0.56;
}

.token-flip {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.token-layer {
  display: block;
  transition: transform 400ms cubic-bezier(0.65, 0, 0.35, 1);
}

.token-base {
  transform: translateY(0);
}

.token-next {
  position: absolute;
  left: 0;
  top: 0;
  transform: translateY(-100%);
}

.token-flip.is-flipping .token-base {
  transform: translateY(100%);
}

.token-flip.is-flipping .token-next {
  transform: translateY(0);
}

.marquee-marker {
  transform: translateY(0);
  opacity: 0.75;
}

@keyframes marqueeGlowShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-surface {
    animation: none;
  }

  .marquee-token {
    transition: none;
  }
}
</style>