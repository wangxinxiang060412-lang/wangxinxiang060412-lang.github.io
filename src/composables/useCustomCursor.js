import { readonly, reactive } from "vue";

const cursorState = reactive({
  isEnabled: false,
  cursorMode: "default", // default | text | view | drag | close
  cursorLabel: "",
  magneticTarget: null,
});

function setCursorEnabled(value) {
  cursorState.isEnabled = Boolean(value);
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle(
      "has-custom-cursor",
      cursorState.isEnabled,
    );
  }
}

function setCursorMode(mode = "default", label = "") {
  const sourceMode = mode === "explore" ? "view" : mode;
  const normalized =
    sourceMode === "view" ||
    sourceMode === "text" ||
    sourceMode === "drag" ||
    sourceMode === "close"
      ? sourceMode
      : "default";
  cursorState.cursorMode = normalized;
  cursorState.cursorLabel = label || "";
}

function setCursorMagneticTarget(target = null) {
  cursorState.magneticTarget = target instanceof Element ? target : null;
}

function setCursorHover(value, label = "") {
  // Backward-compatible API used across components.
  cursorState.cursorMode = value ? "view" : "default";
  cursorState.cursorLabel = value ? label || "VIEW" : "";
  if (!value) cursorState.magneticTarget = null;
}

function clearCursorHover() {
  cursorState.cursorMode = "default";
  cursorState.cursorLabel = "";
  cursorState.magneticTarget = null;
}

export function useCustomCursor() {
  return {
    cursorState: readonly(cursorState),
    setCursorEnabled,
    setCursorMode,
    setCursorMagneticTarget,
    setCursorHover,
    clearCursorHover,
  };
}
