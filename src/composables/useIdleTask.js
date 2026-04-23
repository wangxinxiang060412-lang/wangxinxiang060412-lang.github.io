export function scheduleIdleTask(callback, timeout = 1200) {
  if (typeof window === "undefined") return null;

  if (typeof window.requestIdleCallback === "function") {
    return {
      type: "idle",
      id: window.requestIdleCallback(callback, { timeout }),
    };
  }

  return {
    type: "timeout",
    id: window.setTimeout(callback, Math.min(timeout, 320)),
  };
}

export function cancelIdleTask(task) {
  if (!task || typeof window === "undefined") return;

  if (task.type === "idle" && typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(task.id);
    return;
  }

  window.clearTimeout(task.id);
}
