let lockDepth = 0;
let savedScrollY = 0;

function applyLockStyles() {
  // Preserve current scroll position so the page doesn't jump on iOS Safari
  // (which loses position when overflow:hidden is set on body mid-scroll).
  savedScrollY =
    window.scrollY || document.documentElement.scrollTop || 0;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function clearLockStyles() {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  // Restore in case the browser shifted layout while locked.
  if (savedScrollY > 0) {
    window.scrollTo(0, savedScrollY);
  }
  savedScrollY = 0;
}

export function useScrollLock() {
  function lock() {
    lockDepth += 1;
    if (lockDepth === 1) applyLockStyles();
  }

  function unlock() {
    lockDepth = Math.max(0, lockDepth - 1);
    if (lockDepth === 0) clearLockStyles();
  }

  function forceUnlock() {
    lockDepth = 0;
    clearLockStyles();
  }

  return { lock, unlock, forceUnlock };
}
