<template>
  <div
    ref="el"
    class="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-[#FDFCF8]"
  >
    <div class="relative z-10 flex w-full max-w-[720px] select-none flex-col items-center px-8">
      <div class="relative w-full max-w-[560px] pt-8">
        <div
          class="absolute left-0 right-0 top-[46px] h-px bg-[#4A3B32]/15"
          aria-hidden="true"
        />
        <div
          ref="trailEl"
          class="absolute left-0 top-[46px] h-[2px] w-0 rounded-full"
          style="background: linear-gradient(90deg, #FFB085 0%, #FF7E67 100%)"
          aria-hidden="true"
        />
        <div class="pixel-pet absolute left-0 top-[30px]" ref="petEl" aria-hidden="true">
        <span class="pet-eye pet-eye-left"></span>
        <span class="pet-eye pet-eye-right"></span>
        <span class="pet-mouth"></span>
        </div>
      </div>
      <p
        ref="storyTextEl"
        aria-live="polite"
        aria-atomic="true"
        class="mt-20 inline-grid h-[14px] w-[14ch] place-items-center font-mono text-[9px] leading-[14px] tracking-[0.28em] text-[#5C4D49]/70"
      >
        <span class="col-start-1 row-start-1 invisible" aria-hidden="true">找到画笔了...</span>
        <span class="col-start-1 row-start-1">{{ storyText || "\u00A0" }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";

const emit = defineEmits(["done"]);
const el = ref(null);
const petEl = ref(null);
const trailEl = ref(null);
const storyText = ref("");
let tl = null;
let storyTimer = 0;
let storyFrameIndex = 0;

const storyFrames = [
  "找到画笔了...",
  "正在铺纸...",
  "调墨水中...",
  "差不多了!",
  "",
];

onMounted(() => {
  const host = petEl.value?.parentElement;
  if (!host || !petEl.value || !trailEl.value) return;
  const travelWidth = Math.max(0, host.clientWidth - petEl.value.offsetWidth);
  const progressState = { x: 0 };

  storyFrameIndex = 0;
  storyText.value = storyFrames[storyFrameIndex];
  storyTimer = window.setInterval(() => {
    storyFrameIndex = Math.min(storyFrames.length - 1, storyFrameIndex + 1);
    storyText.value = storyFrames[storyFrameIndex] ?? "";
  }, 800);

  const syncTrail = () => {
    if (trailEl.value) {
      trailEl.value.style.width = `${progressState.x + petEl.value.offsetWidth * 0.5}px`;
    }
  };

  tl = gsap.timeline();
  tl.fromTo(
    [petEl.value, trailEl.value],
    { opacity: 0 },
    { opacity: 1, duration: 0.25, ease: "power2.out" },
  )
    .to(progressState, {
      x: travelWidth,
      duration: 1.85,
      ease: "none",
      onUpdate: () => {
        gsap.set(petEl.value, { x: progressState.x });
        syncTrail();
      },
    })
    .to(
      petEl.value,
      {
        y: -15,
        duration: 0.16,
        ease: "power2.out",
      },
      "-=0.02",
    )
    .to(petEl.value, {
      y: 0,
      duration: 0.22,
      ease: "bounce.out",
    })
    .to(
      storyText,
      {
        value: "",
        duration: 0.16,
        ease: "none",
      },
      "-=0.06",
    )
    .to(el.value, {
      clipPath: "inset(50% 0 50% 0)",
      opacity: 0,
      duration: 0.52,
      ease: "power3.inOut",
      onComplete: () => emit("done"),
    });
});

onUnmounted(() => {
  if (storyTimer) {
    window.clearInterval(storyTimer);
    storyTimer = 0;
  }
  storyFrameIndex = 0;
  tl?.kill();
});
</script>

<style scoped>
.pixel-pet {
  position: relative;
  width: 20px;
  height: 20px;
  background: #ffb085;
  box-shadow:
    4px 0 #ffb085,
    0 4px #ffb085,
    4px 4px #ffb085,
    8px 4px #ffb085,
    4px 8px #ffb085;
  animation: pet-step 0.3s steps(2, end) infinite;
}

.pet-eye {
  position: absolute;
  top: 7px;
  width: 3px;
  height: 3px;
  background: #2d2422;
}

.pet-eye-left {
  left: 5px;
}

.pet-eye-right {
  left: 13px;
}

.pet-mouth {
  position: absolute;
  left: 8px;
  top: 13px;
  width: 6px;
  height: 3px;
  background: #ff7e67;
}

@keyframes pet-step {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>
