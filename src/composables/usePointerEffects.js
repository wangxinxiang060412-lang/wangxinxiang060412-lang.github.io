import { computed, readonly, ref } from "vue";
import { useIsLowEndDevice } from "./useIsLowEndDevice";
import { useReducedMotion } from "./useReducedMotion";

const supportsFinePointer = ref(false);
const supportsHover = ref(false);

let pointerQuery = null;
let hoverQuery = null;
let removePointerListener = null;
let removeHoverListener = null;

function bindMediaQuery(query, setter) {
  setter(query.matches);

  const onChange = (event) => {
    setter(event.matches);
  };

  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }

  query.addListener(onChange);
  return () => query.removeListener(onChange);
}

function ensurePointerQueries() {
  if (typeof window === "undefined" || pointerQuery || hoverQuery) return;

  pointerQuery = window.matchMedia("(pointer: fine)");
  hoverQuery = window.matchMedia("(hover: hover)");
  removePointerListener = bindMediaQuery(pointerQuery, (value) => {
    supportsFinePointer.value = value;
  });
  removeHoverListener = bindMediaQuery(hoverQuery, (value) => {
    supportsHover.value = value;
  });
}

export function usePointerEffects() {
  ensurePointerQueries();

  const { prefersReducedMotion } = useReducedMotion();
  const { isLowEndDevice } = useIsLowEndDevice();
  const supportsPointerEffects = computed(
    () =>
      supportsFinePointer.value &&
      supportsHover.value &&
      !prefersReducedMotion.value &&
      !isLowEndDevice.value,
  );

  return {
    supportsFinePointer: readonly(supportsFinePointer),
    supportsHover: readonly(supportsHover),
    supportsPointerEffects,
  };
}

export function resetPointerEffectsQueries() {
  removePointerListener?.();
  removeHoverListener?.();
  removePointerListener = null;
  removeHoverListener = null;
  pointerQuery = null;
  hoverQuery = null;
}
