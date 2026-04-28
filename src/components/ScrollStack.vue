<template>
  <div ref="rootEl" class="scroll-stack-wrapper">
    <div ref="innerEl" class="scroll-stack-inner">
      <slot />
      <div ref="endEl" class="scroll-stack-end" aria-hidden="true" />
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps({
  itemDistance: { type: Number, default: 96 },
  itemScale: { type: Number, default: 0.025 },
  itemStackDistance: { type: Number, default: 28 },
  stackPosition: { type: String, default: "22%" },
  scaleEndPosition: { type: String, default: "12%" },
  baseScale: { type: Number, default: 0.88 },
  rotationAmount: { type: Number, default: 0 },
  blurAmount: { type: Number, default: 0 },
  useWindowScroll: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["active-index-change", "stack-complete"]);

const rootEl = ref(null);
const innerEl = ref(null);
const endEl = ref(null);

let cards = [];
let metrics = [];
let endTop = 0;
let containerHeight = 0;
let stackPositionPx = 0;
let scaleEndPositionPx = 0;
let lastActiveIndex = 0;
let stackCompleted = false;
let scrollRaf = 0;
let resizeObserver = null;
let fontReadyCancelled = false;
let needsCollection = true;
let needsMeasurement = true;
const lastTransforms = new Map();

function calculateProgress(scrollTop, start, end) {
  if (scrollTop < start) return 0;
  if (scrollTop > end) return 1;
  return (scrollTop - start) / Math.max(1, end - start);
}

function parsePercentage(value, targetHeight) {
  if (typeof value === "string" && value.includes("%")) {
    return (parseFloat(value) / 100) * targetHeight;
  }
  return parseFloat(value);
}

function getScrollTop() {
  if (props.useWindowScroll) {
    return window.scrollY || window.pageYOffset || 0;
  }

  return rootEl.value?.scrollTop ?? 0;
}

function getContainerHeight() {
  if (props.useWindowScroll) {
    return window.innerHeight;
  }

  return rootEl.value?.clientHeight ?? window.innerHeight;
}

function getElementOffset(element) {
  if (!element) return 0;

  if (props.useWindowScroll) {
    const rect = element.getBoundingClientRect();
    return rect.top + (window.scrollY || window.pageYOffset || 0);
  }

  const root = rootEl.value;
  if (!root) return element.offsetTop;
  const rootRect = root.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return rect.top - rootRect.top + root.scrollTop;
}

function resetCardStyles() {
  cards.forEach((card) => {
    card.style.transform = "";
    card.style.filter = "";
    card.style.marginBottom = "";
    card.style.zIndex = "";
    card.style.transformOrigin = "";
    card.style.backfaceVisibility = "";
    card.style.webkitBackfaceVisibility = "";
    card.style.transformStyle = "";
    card.style.contain = "";
    card.style.position = "";
  });

  if (endEl.value) {
    endEl.value.style.height = "";
  }

  lastTransforms.clear();
}

function emitActiveIndex(index) {
  if (index === lastActiveIndex) return;
  lastActiveIndex = index;
  emit("active-index-change", index);
}

function collectCards() {
  if (!rootEl.value) {
    cards = [];
    metrics = [];
    return;
  }

  cards = Array.from(rootEl.value.querySelectorAll(".scroll-stack-card"));

  cards.forEach((card, index) => {
    card.style.marginBottom =
      index < cards.length - 1 ? `${props.itemDistance}px` : "0px";
    card.style.transformOrigin = "top center";
    card.style.backfaceVisibility = "hidden";
    card.style.webkitBackfaceVisibility = "hidden";
    card.style.transformStyle = "preserve-3d";
    card.style.contain = "layout paint";
    card.style.position = "relative";
    card.style.zIndex = String(cards.length + index);
  });

  needsCollection = false;
}

function measureLayout() {
  containerHeight = getContainerHeight();
  stackPositionPx = parsePercentage(props.stackPosition, containerHeight);
  scaleEndPositionPx = parsePercentage(props.scaleEndPosition, containerHeight);

  if (endEl.value) {
    const spacerHeight = props.disabled
      ? 0
      : Math.max(
          containerHeight * 0.8,
          props.itemDistance + props.itemStackDistance * (cards.length + 1),
        );
    endEl.value.style.height = `${Math.round(spacerHeight)}px`;
  }

  endTop = endEl.value ? getElementOffset(endEl.value) : 0;
  metrics = cards.map((card) => ({
    top: getElementOffset(card),
    height: card.offsetHeight || card.getBoundingClientRect().height,
  }));
  needsMeasurement = false;
}

function updateDisabledState(scrollTop) {
  cards.forEach((card, index) => {
    if (lastTransforms.has(index)) {
      card.style.transform = "";
      card.style.filter = "";
      lastTransforms.delete(index);
    }
  });

  if (!metrics.length) {
    emitActiveIndex(0);
    return;
  }

  const focusLine = scrollTop + containerHeight * 0.35;
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  metrics.forEach((metric, index) => {
    const distance = Math.abs(metric.top - focusLine);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  emitActiveIndex(nearestIndex);
}

function updateCardTransforms() {
  if (!rootEl.value) return;

  if (needsCollection) {
    collectCards();
  }
  if (!cards.length) {
    emitActiveIndex(0);
    return;
  }

  if (needsMeasurement) {
    measureLayout();
  }

  const scrollTop = getScrollTop();
  if (props.disabled) {
    updateDisabledState(scrollTop);
    stackCompleted = false;
    return;
  }

  let topCardIndex = 0;
  const pinEnd = endTop - containerHeight / 2;

  metrics.forEach((metric, index) => {
    const triggerStart =
      metric.top - stackPositionPx - props.itemStackDistance * index;
    if (scrollTop >= triggerStart) {
      topCardIndex = index;
    }
  });

  cards.forEach((card, index) => {
    const metric = metrics[index];
    if (!metric) return;

    const triggerStart =
      metric.top - stackPositionPx - props.itemStackDistance * index;
    const triggerEnd = metric.top - scaleEndPositionPx;
    const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
    const targetScale = Math.min(1, props.baseScale + index * props.itemScale);
    const scale = 1 - scaleProgress * (1 - targetScale);
    const rotation = props.rotationAmount
      ? index * props.rotationAmount * scaleProgress
      : 0;

    let blur = 0;
    if (props.blurAmount && index < topCardIndex) {
      blur = (topCardIndex - index) * props.blurAmount;
    }

    let translateY = 0;
    const isPinned = scrollTop >= triggerStart && scrollTop <= pinEnd;

    if (isPinned) {
      translateY =
        scrollTop -
        metric.top +
        stackPositionPx +
        props.itemStackDistance * index;
    } else if (scrollTop > pinEnd) {
      translateY =
        pinEnd - metric.top + stackPositionPx + props.itemStackDistance * index;
    }

    const nextTransform = {
      translateY: Math.round(translateY * 100) / 100,
      scale: Math.round(scale * 1000) / 1000,
      rotation: Math.round(rotation * 100) / 100,
      blur: Math.round(blur * 100) / 100,
    };

    const lastTransform = lastTransforms.get(index);
    const hasChanged =
      !lastTransform ||
      Math.abs(lastTransform.translateY - nextTransform.translateY) > 0.1 ||
      Math.abs(lastTransform.scale - nextTransform.scale) > 0.001 ||
      Math.abs(lastTransform.rotation - nextTransform.rotation) > 0.1 ||
      Math.abs(lastTransform.blur - nextTransform.blur) > 0.1;

    if (!hasChanged) return;

    card.style.transform = `translate3d(0, ${nextTransform.translateY}px, 0) scale(${nextTransform.scale}) rotate(${nextTransform.rotation}deg)`;

    if (props.blurAmount) {
      card.style.filter =
        nextTransform.blur > 0 ? `blur(${nextTransform.blur}px)` : "";
    } else if (lastTransform?.blur) {
      card.style.filter = "";
    }

    lastTransforms.set(index, nextTransform);
  });

  emitActiveIndex(topCardIndex);

  const lastMetric = metrics[metrics.length - 1];
  if (!lastMetric) return;

  const lastPinStart =
    lastMetric.top -
    stackPositionPx -
    props.itemStackDistance * (metrics.length - 1);
  const isComplete = scrollTop >= lastPinStart && scrollTop <= pinEnd;

  if (isComplete && !stackCompleted) {
    stackCompleted = true;
    emit("stack-complete");
  } else if (!isComplete && stackCompleted) {
    stackCompleted = false;
  }
}

function requestUpdate() {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0;
    updateCardTransforms();
  });
}

function requestRefresh() {
  needsCollection = true;
  needsMeasurement = true;
  requestUpdate();
}

function bindListeners() {
  const scrollTarget = props.useWindowScroll ? window : rootEl.value;
  if (!scrollTarget) return;

  scrollTarget.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestRefresh, { passive: true });

  resizeObserver = new ResizeObserver(() => {
    needsMeasurement = true;
    requestUpdate();
  });

  if (rootEl.value) {
    resizeObserver.observe(rootEl.value);
  }
  if (innerEl.value) {
    resizeObserver.observe(innerEl.value);
  }
  cards.forEach((card) => resizeObserver?.observe(card));

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      if (!fontReadyCancelled) {
        needsMeasurement = true;
        requestUpdate();
      }
    });
  }
}

function unbindListeners() {
  const scrollTarget = props.useWindowScroll ? window : rootEl.value;
  scrollTarget?.removeEventListener("scroll", requestUpdate);
  window.removeEventListener("resize", requestRefresh);
  resizeObserver?.disconnect();
  resizeObserver = null;
}

onMounted(async () => {
  await nextTick();
  needsCollection = true;
  needsMeasurement = true;
  updateCardTransforms();
  bindListeners();
  requestRefresh();
});

watch(
  () => [
    props.itemDistance,
    props.itemScale,
    props.itemStackDistance,
    props.stackPosition,
    props.scaleEndPosition,
    props.baseScale,
    props.rotationAmount,
    props.blurAmount,
    props.useWindowScroll,
    props.disabled,
  ],
  async () => {
    await nextTick();
    requestRefresh();
  },
);

onUnmounted(() => {
  fontReadyCancelled = true;
  if (scrollRaf) {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = 0;
  }
  unbindListeners();
  resetCardStyles();
  cards = [];
  metrics = [];
  stackCompleted = false;
  needsCollection = true;
  needsMeasurement = true;
});
</script>

<style scoped>
.scroll-stack-wrapper {
  position: relative;
  width: 100%;
}

.scroll-stack-inner {
  position: relative;
  min-height: 100vh;
}

.scroll-stack-end {
  width: 100%;
  height: 1px;
}
</style>
