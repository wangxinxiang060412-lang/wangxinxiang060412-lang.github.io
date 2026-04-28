import { markRaw } from "vue";

let studioComponent = null;
let studioPromise = null;

function waitForDelay(delayMs) {
  if (typeof window === "undefined" || delayMs <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}

function waitForNextFrame() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

async function resolveStudioComponent(options = {}) {
  if (options.deferToNextFrame) {
    await waitForNextFrame();
  }
  if (options.delayMs) {
    await waitForDelay(options.delayMs);
  }
  const module = await import("../components/CuratorStudio.vue");
  studioComponent = markRaw(module.default);
  return studioComponent;
}

export function loadCuratorStudio(options = {}) {
  if (studioComponent) return Promise.resolve(studioComponent);
  if (!studioPromise) {
    studioPromise = resolveStudioComponent(options).catch((error) => {
      studioPromise = null;
      throw error;
    });
  }
  return studioPromise;
}

export function preloadCuratorStudio(options = {}) {
  return loadCuratorStudio(options);
}

export function getLoadedCuratorStudio() {
  return studioComponent;
}

export function resetCuratorStudioLoader() {
  studioComponent = null;
  studioPromise = null;
}
