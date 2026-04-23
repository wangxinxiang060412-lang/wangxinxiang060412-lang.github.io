let lockDepth = 0;

export function useScrollLock() {
  function lock() {
    lockDepth += 1;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function unlock() {
    lockDepth = Math.max(0, lockDepth - 1);
    if (lockDepth === 0) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  }

  function forceUnlock() {
    lockDepth = 0;
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  return { lock, unlock, forceUnlock };
}
