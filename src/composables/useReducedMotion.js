import { readonly, ref } from "vue";

const prefersReducedMotion = ref(false);

let motionQuery = null;
let removeMotionListener = null;

function ensureReducedMotionListener() {
  if (typeof window === "undefined" || motionQuery) return;

  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  prefersReducedMotion.value = motionQuery.matches;

  const onChange = (event) => {
    prefersReducedMotion.value = event.matches;
  };

  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", onChange);
    removeMotionListener = () =>
      motionQuery?.removeEventListener("change", onChange);
  } else {
    motionQuery.addListener(onChange);
    removeMotionListener = () => motionQuery?.removeListener(onChange);
  }
}

export function useReducedMotion() {
  ensureReducedMotionListener();

  return {
    prefersReducedMotion: readonly(prefersReducedMotion),
  };
}

export function resetReducedMotionListener() {
  removeMotionListener?.();
  removeMotionListener = null;
  motionQuery = null;
}
