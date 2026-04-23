<template>
  <section
    id="contact"
    ref="sectionEl"
    class="contact-section relative overflow-hidden px-6 py-24 md:px-12 lg:px-20"
    :class="isSent ? 'is-sent' : ''"
    style="
      --contact-ink: #4A3B32;
      --contact-text: #5C4D49;
      --contact-accent: #FF7E67;
      --contact-accent-soft: #FFB085;
      border-top: 1px solid rgba(74, 59, 50, 0.16);
    "
    @mousemove="onSectionMove"
    @mouseenter="setSectionHover(true)"
    @mouseleave="setSectionHover(false)"
  >
    <p
      ref="sectionWatermarkEl"
      class="contact-watermark pointer-events-none absolute right-[-20%] bottom-[-30%] z-0 hidden select-none font-display leading-none tracking-[-0.055em] lg:block"
      :class="isSectionHover ? 'is-hovered' : ''"
      aria-hidden="true"
      style="font-size: 40vw; font-weight: 500; color: rgba(74, 59, 50, 0.04)"
    >
      04
    </p>
    <div
      class="pointer-events-none absolute inset-0 z-0"
      style="
        background: radial-gradient(
          400px at var(--mx) var(--my),
          rgba(var(--accent-rgb), 0.12),
          transparent
        );
      "
    />

    <div
      class="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-16 lg:grid-cols-2"
    >
      <!-- Left -->
      <div>
        <div class="overflow-hidden">
          <p
            ref="talkTitleEl"
            class="font-display text-[12vw] leading-[0.84] tracking-[-0.045em] text-[#2D2422]"
            style="font-weight: 200"
          >
            LET'S TALK
          </p>
        </div>
        <div class="mt-4 overflow-hidden">
          <p
            ref="talkSubEl"
            class="font-body text-[15px] leading-relaxed text-[#5C4D49] md:text-[17px]"
          >
            一起构建有趣的产品，把灵感变成真正可用、可感知、可持续的体验。
          </p>
        </div>
        <div class="mt-10 flex flex-col gap-5">
          <div
            v-for="(r, ri) in rows"
            :key="r.label"
            :ref="(el) => (rowRefs[ri] = el)"
            class="flex items-start gap-5"
          >
            <span
              class="font-mono w-12 flex-shrink-0 pt-0.5 text-[#4A3B32]/72"
              style="
                font-size: 9px;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                font-weight: 500;
              "
              >{{ r.label }}</span
            >
            <a
              v-if="r.href"
              :href="r.href"
              class="mask-link font-body group relative inline-block text-[14px] leading-[1.9] text-[#5C4D49] no-underline md:text-[16px]"
            >
              <span class="mask-link-track">
                <span class="mask-link-current">{{ r.val }}</span>
                <span class="mask-link-next" aria-hidden="true">{{
                  r.val
                }}</span>
              </span>
            </a>
            <p
              v-else
              class="font-body text-[14px] leading-[1.9] text-[#5C4D49] md:text-[16px]"
            >
              {{ r.val }}
            </p>
          </div>
        </div>
      </div>
      <div class="lg:pt-4">
        <p
          ref="talkInfoEl"
          class="font-body max-w-[560px] text-[16px] leading-[2.05] text-[#5C4D49] md:text-[18px]"
        >
          保持简洁、直接与高密度信息传达。若你希望一起构建高质量 Web / App
          体验，欢迎随时联系我。
        </p>

        <form
          ref="formEl"
          class="paper-shell mt-10 max-w-[560px]"
          @submit.prevent="submitForm"
        >
          <div class="paper-noise" aria-hidden="true" />
          <div class="postal-stamp" aria-hidden="true">
            <span class="postal-stamp-inner">
              WXX<br />
              2026
            </span>
          </div>

          <div
            v-if="isSent"
            ref="sentStampEl"
            class="sent-stamp-mark"
            :class="sentStampVisible ? 'is-visible' : ''"
            aria-hidden="true"
          >
            <svg viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="50" />
              <circle cx="60" cy="60" r="38" />
              <path d="M20 60h80" />
              <text x="60" y="57">SENT</text>
              <text x="60" y="74">2026</text>
            </svg>
          </div>

          <div v-if="!isSent" class="paper-content">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label class="form-field block">
                <span class="form-floating-label" :class="isFieldRaised('name') ? 'is-raised' : ''">Name</span>
                <input
                  v-model.trim="formData.name"
                  type="text"
                  name="name"
                  required
                  autocomplete="name"
                  class="form-input w-full bg-transparent pb-3 pt-5 outline-none transition-colors duration-300"
                  @focus="setFocusedField('name')"
                  @blur="setFocusedField(null)"
                />
                <span class="form-line-base" />
                <span
                  class="form-line-active"
                  :class="focusedField === 'name' ? 'is-active is-scanning' : ''"
                />
              </label>

              <label class="form-field block">
                <span class="form-floating-label" :class="isFieldRaised('email') ? 'is-raised' : ''">Email</span>
                <input
                  v-model.trim="formData.email"
                  type="email"
                  name="email"
                  required
                  autocomplete="email"
                  class="form-input w-full bg-transparent pb-3 pt-5 outline-none transition-colors duration-300"
                  @focus="setFocusedField('email')"
                  @blur="setFocusedField(null)"
                />
                <span class="form-line-base" />
                <span
                  class="form-line-active"
                  :class="focusedField === 'email' ? 'is-active is-scanning' : ''"
                />
              </label>
            </div>

            <label class="form-field mt-6 block">
              <span class="form-floating-label" :class="isFieldRaised('message') ? 'is-raised' : ''">Message</span>
              <textarea
                v-model.trim="formData.message"
                name="message"
                required
                rows="4"
                class="form-input w-full resize-none bg-transparent pb-3 pt-5 leading-relaxed outline-none transition-colors duration-300"
                @focus="setFocusedField('message')"
                @blur="setFocusedField(null)"
              />
              <span class="form-line-base" />
              <span
                class="form-line-active"
                :class="focusedField === 'message' ? 'is-active is-scanning' : ''"
              />
            </label>

            <p v-if="submitError" class="mt-4 text-[12px] text-[#FF7E67]">
              {{ submitError }}
            </p>
            <p v-if="!endpointValid" class="mt-4 text-[12px] text-[#5C4D49]/78">
              表单服务未配置，请通过邮箱联系我 →
            </p>

            <div class="signature-line mt-7" :class="signatureStarted ? 'is-started' : ''">
              <svg
                class="signature-svg"
                viewBox="0 0 420 52"
                preserveAspectRatio="xMinYMid meet"
                aria-hidden="true"
              >
                <path
                  ref="signaturePathEl"
                  class="signature-path"
                  d="M8 33 C14 30, 21 27, 30 32 C38 36, 44 18, 53 19 C59 20, 58 35, 66 36 C73 37, 77 20, 86 19 C98 17, 99 40, 111 38 C124 36, 121 19, 133 17 C145 15, 145 37, 156 37 C167 37, 170 15, 183 15 C195 15, 199 40, 212 38 C226 36, 223 16, 236 15 C250 14, 250 39, 264 38 C279 37, 278 15, 292 15 C306 15, 308 39, 322 39 C336 39, 338 18, 351 18 C364 18, 366 38, 380 38 C392 38, 402 33, 412 29"
                />
              </svg>
              <p class="signature-name">— 王鑫翔</p>
            </div>

            <div class="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <button
                ref="submitBtnEl"
                type="submit"
                :disabled="isSubmitting || !endpointValid"
                data-cursor="view"
                class="stamp-submit relative inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#FFB085] px-8 text-[11px] font-medium uppercase tracking-[0.14em] text-[#2D2422] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.2,1)] hover:bg-[#FF9B6A] hover:shadow-[4px_4px_0px_var(--contact-ink)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{{ submitButtonText }}</span>
                <span class="wax-drop wax-drop-a" :class="waxBursting ? 'is-bursting' : ''" />
                <span class="wax-drop wax-drop-b" :class="waxBursting ? 'is-bursting' : ''" />
                <span class="wax-drop wax-drop-c" :class="waxBursting ? 'is-bursting' : ''" />
              </button>
              <a
                href="mailto:wangxinxiang060412@qq.com"
                class="send-direct-note inline-flex -rotate-[5deg] items-center text-[14px] leading-none text-[#A96654] no-underline transition-colors duration-300 hover:text-[#7A3F31]"
              >
                ↘ Or send me an email directly
              </a>
            </div>
          </div>

          <div v-else class="paper-content sent-note">
            <p class="sent-note-main">感谢来信。我会在 24 小时内回复你。</p>
            <p class="sent-note-sign">— Wang</p>
            <button
              type="button"
              class="sent-note-reset mt-7 inline-flex items-center rounded-full border border-[#4A3B32]/24 px-5 py-2 text-[12px] tracking-[0.09em] text-[#4A3B32]/86 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.2,1)] hover:border-[#4A3B32]/40 hover:bg-[#4A3B32]/[0.04]"
              @click="resetFormState"
            >
              发送另一条 →
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePointerEffects } from "../composables/usePointerEffects";
import { useMagnetic } from "../composables/useMagnetic";

gsap.registerPlugin(ScrollTrigger);

const sectionEl = ref(null);
const sectionWatermarkEl = ref(null);
const rowRefs = ref([]);
const talkTitleEl = ref(null);
const talkSubEl = ref(null);
const talkInfoEl = ref(null);
const formEl = ref(null);
const submitBtnEl = ref(null);
const sentStampEl = ref(null);
const signaturePathEl = ref(null);
const focusedField = ref(null);
const isSubmitting = ref(false);
const isSent = ref(false);
const sentStampVisible = ref(false);
const submitError = ref("");
const submitButtonText = ref("发送消息");
const waxBursting = ref(false);
const signatureStarted = ref(false);
const prefersReducedMotion = ref(false);
const isSectionHover = ref(false);
const { supportsPointerEffects } = usePointerEffects();
const formData = reactive({
  name: "",
  email: "",
  message: "",
});

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || "";
const endpointValid = computed(() => !!FORMSPREE_ENDPOINT);

let mxTo = null;
let myTo = null;
let firstMove = true;

function onSectionMove(e) {
  if (!supportsPointerEffects.value) return;
  if (!sectionEl.value || !mxTo || !myTo) return;
  const rect = sectionEl.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (firstMove) {
    firstMove = false;
    sectionEl.value.style.setProperty("--mx", `${x}px`);
    sectionEl.value.style.setProperty("--my", `${y}px`);
    return;
  }

  mxTo(x);
  myTo(y);
}

function setSectionHover(active) {
  if (!supportsPointerEffects.value) {
    isSectionHover.value = false;
    return;
  }
  isSectionHover.value = active;
}

const rows = [
  { label: "Phone", val: "152 5885 1884", href: "tel:15258851884" },
  {
    label: "Email",
    val: "wangxinxiang060412@qq.com",
    href: "mailto:wangxinxiang060412@qq.com",
  },
  {
    label: "School",
    val: "浙江科技大学 · 数字媒体技术 (2024–2028)",
    href: null,
  },
];

useMagnetic(submitBtnEl, {
  maxOffset: 20,
  duration: 0.24,
  cursorLabel: "SEND",
});

function setFocusedField(field) {
  focusedField.value = field;
  if (field === "name" && !signatureStarted.value) {
    signatureStarted.value = true;
  }
}

function isFieldRaised(field) {
  return focusedField.value === field || !!formData[field];
}

function resetFormState() {
  isSent.value = false;
  submitError.value = "";
  sentStampVisible.value = false;
  submitButtonText.value = "发送消息";
  waxBursting.value = false;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function playStampSound() {
  if (prefersReducedMotion.value) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(130, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(64, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.16);
  osc.onended = () => {
    ctx.close();
  };
}

async function runWaxSealAnimation() {
  if (prefersReducedMotion.value) {
    submitButtonText.value = "✓ 已寄出";
    return;
  }
  submitButtonText.value = "封缄中...";
  waxBursting.value = true;
  await wait(640);
  waxBursting.value = false;
  submitButtonText.value = "✓ 已寄出";
  await wait(460);
}

function animateSentStamp() {
  if (!formEl.value) return;
  sentStampVisible.value = true;
  if (prefersReducedMotion.value || !sentStampEl.value) return;

  gsap.fromTo(
    sentStampEl.value,
    { scale: 2, rotation: -25, opacity: 0 },
    {
      scale: 1,
      rotation: -8,
      opacity: 1,
      duration: 0.82,
      ease: "elastic.out(1, 0.52)",
    },
  );
  gsap.fromTo(
    formEl.value,
    { y: 0 },
    {
      y: 2,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power1.out",
      delay: 0.62,
    },
  );
}

async function submitForm() {
  submitError.value = "";
  if (!FORMSPREE_ENDPOINT) {
    submitError.value = "请先在环境变量中配置 VITE_FORMSPREE_ENDPOINT。";
    return;
  }
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  isSent.value = false;
  sentStampVisible.value = false;
  submitButtonText.value = "发送消息";
  try {
    await runWaxSealAnimation();
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      }),
    });
    if (!response.ok) throw new Error("submit_failed");
    isSent.value = true;
    animateSentStamp();
    playStampSound();
    formData.name = "";
    formData.email = "";
    formData.message = "";
  } catch {
    submitError.value = "发送失败，请稍后重试或直接通过邮箱联系我。";
    submitButtonText.value = "发送消息";
  } finally {
    waxBursting.value = false;
    isSubmitting.value = false;
  }
}

onMounted(async () => {
  await nextTick();
  prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (signaturePathEl.value) {
    const signatureLength = signaturePathEl.value.getTotalLength();
    signaturePathEl.value.style.strokeDasharray = `${signatureLength}`;
    signaturePathEl.value.style.strokeDashoffset = `${signatureLength}`;
    if (prefersReducedMotion.value) {
      signaturePathEl.value.style.strokeDashoffset = "0";
    }
  }

  if (sectionEl.value) {
    sectionEl.value.style.setProperty("--mx", `${window.innerWidth / 2}px`);
    sectionEl.value.style.setProperty("--my", `${window.innerHeight / 2}px`);
    mxTo = gsap.quickTo(sectionEl.value, "--mx", {
      duration: 0.45,
      ease: "power3.out",
    });
    myTo = gsap.quickTo(sectionEl.value, "--my", {
      duration: 0.45,
      ease: "power3.out",
    });
  }

  const revealTargets = [
    talkTitleEl.value,
    talkSubEl.value,
    talkInfoEl.value,
    formEl.value,
    ...rowRefs.value,
  ].filter(Boolean);
  if (revealTargets.length) {
    gsap.fromTo(
      revealTargets,
      { yPercent: 110, rotation: 9, opacity: 0 },
      {
        yPercent: 0,
        rotation: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionEl.value,
          start: "top 78%",
        },
      },
    );
  }

  if (sectionWatermarkEl.value) {
    gsap.fromTo(
      sectionWatermarkEl.value,
      { yPercent: -8, xPercent: 4 },
      {
        yPercent: 10,
        xPercent: -4,
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
});
onUnmounted(() => {
  mxTo = null;
  myTo = null;
});
</script>

<style scoped>
.form-field {
  position: relative;
}

.contact-section {
  background: #fdfcf8;
  transition: background-color 700ms cubic-bezier(0.25, 1, 0.2, 1);
}

.contact-watermark {
  opacity: 0.04;
  transition: opacity 420ms cubic-bezier(0.25, 1, 0.2, 1);
}

.contact-watermark.is-hovered {
  opacity: 0.08;
}

.contact-section.is-sent {
  background: #fbf6ee;
}

.paper-shell {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(122, 97, 82, 0.16);
  background: #fff9f3;
  box-shadow: 0 20px 60px rgba(74, 59, 50, 0.08);
}

.paper-noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.8'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
}

.paper-content {
  position: relative;
  z-index: 2;
  padding: 44px 34px 34px;
}

.sent-stamp-mark {
  position: absolute;
  left: 30px;
  top: 28px;
  z-index: 5;
  width: 114px;
  opacity: 0;
  transform: rotate(-8deg);
  transform-origin: center;
  color: rgba(210, 64, 54, 0.92);
}

.sent-stamp-mark.is-visible {
  opacity: 1;
}

.sent-stamp-mark svg {
  display: block;
  width: 100%;
  height: auto;
}

.sent-stamp-mark circle,
.sent-stamp-mark path {
  stroke: currentColor;
  stroke-width: 1.8;
}

.sent-stamp-mark text {
  fill: currentColor;
  text-anchor: middle;
  font-family: "JetBrains Mono", "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  letter-spacing: 0.11em;
}

.postal-stamp {
  position: absolute;
  top: 76px;
  left: 76px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border: 1.5px solid rgba(255, 126, 103, 0.72);
  border-radius: 999px;
  transform: rotate(-12deg);
  color: rgba(255, 126, 103, 0.82);
}

.postal-stamp-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: 1.5px solid rgba(255, 126, 103, 0.92);
  border-radius: 999px;
  font-family: "JetBrains Mono", "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.11em;
  line-height: 1.2;
  text-align: center;
}

.form-input {
  font-family: "Satoshi", "Avenir Next", "PingFang SC", "Hiragino Sans GB", sans-serif;
  font-size: 15px;
  color: var(--contact-ink);
  caret-color: var(--contact-accent);
}

.form-input:focus {
  color: #2d2422;
}

.form-floating-label {
  position: absolute;
  left: 0;
  top: 19px;
  pointer-events: none;
  font-family: "JetBrains Mono", "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 10px;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--contact-ink) 66%, transparent);
  transform-origin: left center;
  transition:
    transform 420ms cubic-bezier(0.25, 1, 0.2, 1),
    color 420ms cubic-bezier(0.25, 1, 0.2, 1);
}

.form-floating-label.is-raised {
  color: color-mix(in srgb, var(--contact-ink) 92%, transparent);
  transform: translateY(-16px) scale(0.9);
}

.form-line-base,
.form-line-active {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
}

.form-line-base {
  background: color-mix(in srgb, var(--contact-ink) 28%, transparent);
}

.form-line-active {
  background: linear-gradient(
    90deg,
    rgba(255, 126, 103, 0) 0%,
    rgba(255, 126, 103, 1) 30%,
    rgba(255, 126, 103, 1) 70%,
    rgba(255, 126, 103, 0) 100%
  );
  background-size: 200% 100%;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 520ms cubic-bezier(0.25, 1, 0.2, 1);
}

.form-line-active.is-active {
  transform: scaleX(1);
}

.form-line-active.is-scanning {
  animation: formLineScan 1.15s linear infinite;
}

.stamp-submit::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: -1;
  width: 112%;
  height: 134%;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 126, 103, 0.46) 0%, rgba(255, 126, 103, 0) 70%);
  transform: translate(-50%, -50%) scale(0.75);
  opacity: 0;
  transition:
    opacity 420ms ease-out,
    transform 420ms ease-out;
}

.stamp-submit span {
  position: relative;
  z-index: 3;
}

.stamp-submit:active {
  transform: scale(0.96);
}

.stamp-submit:active::after {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.06);
}

.send-direct-note {
  font-family: "Instrument Serif", Georgia, "Times New Roman", serif;
  font-style: italic;
}

.signature-line {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  min-height: 36px;
  opacity: 0.82;
}

.signature-svg {
  width: 186px;
  height: 28px;
}

.signature-path {
  fill: none;
  stroke: #8b5b4e;
  stroke-width: 2.1;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.signature-line.is-started .signature-path {
  animation: signatureWrite 1.5s cubic-bezier(0.17, 0.67, 0.29, 1) forwards;
}

.signature-name {
  margin: 0;
  font-family: "Instrument Serif", "Playfair Display", "Caveat", Georgia, "Times New Roman", serif;
  font-style: italic;
  font-size: 18px;
  color: #6d5147;
  transform: translateY(3px);
}

.wax-drop {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #ff875f;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
}

.wax-drop-a {
  --dx: -18px;
  --dy: -14px;
}

.wax-drop-b {
  --dx: 21px;
  --dy: -10px;
}

.wax-drop-c {
  --dx: 8px;
  --dy: 18px;
}

.wax-drop.is-bursting {
  animation: waxDropBurst 1.1s cubic-bezier(0.25, 1, 0.2, 1) both;
}

.stamp-submit:not(:disabled) {
  animation: none;
}

.stamp-submit:disabled {
  animation: waxSealPress 1.1s cubic-bezier(0.25, 1, 0.2, 1);
}

.sent-note {
  min-height: 292px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: noteFadeIn 700ms cubic-bezier(0.25, 1, 0.2, 1) both;
}

.sent-note-main,
.sent-note-sign {
  font-family: "Instrument Serif", Georgia, "Times New Roman", serif;
  font-style: italic;
  color: #4a3b32;
}

.sent-note-main {
  font-size: 20px;
  line-height: 1.65;
}

.sent-note-sign {
  margin-top: 12px;
  font-size: 21px;
  opacity: 0.85;
}

.sent-note-reset {
  background: transparent;
}

@keyframes formLineScan {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -30% 0;
  }
}

@keyframes noteFadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes signatureWrite {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes waxSealPress {
  0% {
    transform: scale(1);
  }
  22% {
    transform: scale(0.94);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes waxDropBurst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  24% {
    opacity: 1;
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1);
  }
  74% {
    opacity: 1;
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.94);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.22);
  }
}

@media (prefers-reduced-motion: reduce) {
  .contact-section,
  .form-floating-label,
  .form-line-active,
  .stamp-submit,
  .sent-note {
    transition: none !important;
    animation: none !important;
  }

  .form-line-active.is-scanning {
    animation: none;
  }

  .signature-line.is-started .signature-path {
    animation: none;
    stroke-dashoffset: 0 !important;
  }

  .wax-drop.is-bursting {
    animation: none;
    opacity: 0;
  }
}

.mask-link {
  overflow: hidden;
}

.mask-link-track {
  position: relative;
  display: inline-block;
  overflow: hidden;
  line-height: 1.9;
}

.mask-link-current,
.mask-link-next {
  display: block;
  transition:
    transform 700ms cubic-bezier(0.45, 0, 0.2, 1),
    opacity 700ms cubic-bezier(0.45, 0, 0.2, 1);
}

.mask-link-current {
  color: var(--contact-text);
  transform: translateY(0%);
  opacity: 1;
}

.mask-link-next {
  position: absolute;
  top: 0;
  left: 0;
  color: var(--contact-accent);
  transform: translateY(100%);
  opacity: 0.94;
}

.mask-link:hover .mask-link-current,
.mask-link:focus-visible .mask-link-current {
  transform: translateY(-105%);
  opacity: 0;
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.mask-link:hover .mask-link-next,
.mask-link:focus-visible .mask-link-next {
  transform: translateY(0%);
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
