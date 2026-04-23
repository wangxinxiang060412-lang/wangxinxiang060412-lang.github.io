import { readonly, ref } from "vue";

const isLowEndDevice = ref(false);

let hasInitialized = false;
let connection = null;
let removeConnectionListener = null;

function detectLowEndDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  const network = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = network?.effectiveType || "";
  const saveData = Boolean(network?.saveData);
  const slowNetwork = /(^|-)2g|3g/.test(effectiveType);
  const smallViewport = window.innerWidth < 768;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;

  const score =
    (cores <= 4 ? 1 : 0) +
    (memory <= 4 ? 1 : 0) +
    (slowNetwork ? 1 : 0) +
    (saveData ? 2 : 0) +
    (smallViewport && coarsePointer && cores <= 6 ? 1 : 0);

  return score >= 2;
}

function ensureLowEndListener() {
  if (typeof window === "undefined" || hasInitialized) return;

  hasInitialized = true;
  isLowEndDevice.value = detectLowEndDevice();

  connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  if (!connection) return;

  const onConnectionChange = () => {
    isLowEndDevice.value = detectLowEndDevice();
  };

  if (typeof connection.addEventListener === "function") {
    connection.addEventListener("change", onConnectionChange);
    removeConnectionListener = () =>
      connection?.removeEventListener("change", onConnectionChange);
  } else if (typeof connection.addListener === "function") {
    connection.addListener(onConnectionChange);
    removeConnectionListener = () => connection?.removeListener(onConnectionChange);
  }
}

export function useIsLowEndDevice() {
  ensureLowEndListener();

  return {
    isLowEndDevice: readonly(isLowEndDevice),
  };
}

export function resetLowEndDeviceListener() {
  removeConnectionListener?.();
  removeConnectionListener = null;
  connection = null;
  hasInitialized = false;
}
