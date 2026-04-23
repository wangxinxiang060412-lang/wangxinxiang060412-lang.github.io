import { markRaw } from "vue";

let studioComponent = null;
let studioPromise = null;

async function resolveStudioComponent() {
  const module = await import("../components/CuratorStudio.vue");
  studioComponent = markRaw(module.default);
  return studioComponent;
}

export function loadCuratorStudio() {
  if (studioComponent) return Promise.resolve(studioComponent);
  if (!studioPromise) {
    studioPromise = resolveStudioComponent().catch((error) => {
      studioPromise = null;
      throw error;
    });
  }
  return studioPromise;
}

export function preloadCuratorStudio() {
  return loadCuratorStudio();
}

export function getLoadedCuratorStudio() {
  return studioComponent;
}

export function resetCuratorStudioLoader() {
  studioComponent = null;
  studioPromise = null;
}
