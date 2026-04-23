import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const KONAMI = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

function createToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    top: "18px",
    left: "50%",
    transform: "translateX(-50%) translateY(-8px)",
    zIndex: "9999",
    padding: "9px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(74,59,50,0.18)",
    background: "#FFF9F3",
    color: "#4A3B32",
    fontFamily:
      '"JetBrains Mono","SFMono-Regular",ui-monospace,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
    fontSize: "10px",
    letterSpacing: "0.08em",
    opacity: "0",
    pointerEvents: "none",
  });
  document.body.appendChild(toast);
  gsap
    .timeline()
    .to(toast, { opacity: 1, y: 8, duration: 0.3, ease: "power2.out" })
    .to(toast, { opacity: 0, y: -4, duration: 0.32, delay: 1.15, ease: "power2.in" })
    .call(() => toast.remove());
}

function getSectionNumberNodes() {
  const nodes = [...document.querySelectorAll("p, span, div")]
    .filter((el) => /^\d{2}$/.test((el.textContent || "").trim()))
    .filter((el) => {
      const style = window.getComputedStyle(el);
      const size = Number.parseFloat(style.fontSize || "0");
      return size >= 42 || style.fontFamily.toLowerCase().includes("display");
    });
  return [...new Set(nodes)];
}

function runRainbowFlash() {
  const nodes = getSectionNumberNodes();
  if (!nodes.length) return;
  nodes.forEach((el) => {
    const original = el.style.color;
    const glow = el.style.textShadow;
    gsap.fromTo(
      el,
      {
        color: "#ff7e67",
        textShadow: "0 0 0 rgba(255,126,103,0)",
      },
      {
        color: "hsl(360, 82%, 58%)",
        textShadow: "0 0 18px rgba(255,126,103,0.4)",
        duration: 0.25,
        repeat: 3,
        yoyo: true,
        ease: "none",
        onRepeat() {
          const hue = Math.floor(Math.random() * 360);
          el.style.color = `hsl(${hue}, 82%, 58%)`;
        },
        onComplete() {
          el.style.color = original;
          el.style.textShadow = glow;
        },
      },
    );
  });
}

function createShortcutOverlay() {
  const overlay = document.createElement("div");
  overlay.setAttribute("data-easter-overlay", "1");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9998",
    background: "rgba(255,249,243,0.95)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: "0",
    pointerEvents: "none",
  });

  const panel = document.createElement("div");
  Object.assign(panel.style, {
    width: "min(620px, calc(100vw - 40px))",
    border: "1px solid rgba(74,59,50,0.18)",
    borderRadius: "18px",
    background: "#FFF9F3",
    boxShadow: "0 24px 60px rgba(74,59,50,0.12)",
    padding: "20px 22px",
    color: "#4A3B32",
  });
  panel.innerHTML = `
    <p style="margin:0 0 12px;font:600 18px/1.2 'Instrument Serif',serif;">Keyboard Shortcuts</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;font:500 10px/1.6 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;">
      <span>Esc</span><span>Close overlays</span>
      <span>← / →</span><span>Flip sections or cards</span>
      <span>1..4</span><span>Quick jump sections</span>
      <span>G</span><span>Go to target section</span>
      <span>Shift + ?</span><span>Toggle this panel</span>
      <span>Konami</span><span>Rainbow chapter flash</span>
    </div>
  `;
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  return overlay;
}

function createContextMenu() {
  const menu = document.createElement("div");
  menu.setAttribute("data-easter-context", "1");
  Object.assign(menu.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    zIndex: "9997",
    minWidth: "198px",
    border: "1px solid rgba(74,59,50,0.18)",
    borderRadius: "12px",
    background: "#FFF9F3",
    boxShadow: "0 16px 34px rgba(74,59,50,0.14)",
    padding: "6px",
    display: "none",
  });
  const items = [
    { label: "复制联系邮箱", action: "copy-email" },
    { label: "跳到 LightTrip 案例", action: "jump-lighttrip" },
    { label: "切换音效", action: "toggle-sound" },
    { label: "查看源代码", action: "view-source" },
  ];
  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = item.label;
    btn.dataset.action = item.action;
    Object.assign(btn.style, {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "7px 10px",
      border: "0",
      background: "transparent",
      borderRadius: "8px",
      color: "#4A3B32",
      fontFamily:
        '"JetBrains Mono","SFMono-Regular",ui-monospace,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
      fontSize: "10px",
      letterSpacing: "0.04em",
      cursor: "pointer",
    });
    btn.addEventListener("mouseenter", () => {
      btn.style.background = "rgba(255,176,133,0.2)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "transparent";
    });
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  return menu;
}

function createLongPressMenu() {
  const menu = document.createElement("div");
  menu.setAttribute("data-easter-longpress", "1");
  Object.assign(menu.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    zIndex: "9997",
    minWidth: "172px",
    border: "1px solid rgba(74,59,50,0.16)",
    borderRadius: "10px",
    background: "#FFF9F3",
    boxShadow: "0 14px 30px rgba(74,59,50,0.12)",
    padding: "6px",
    display: "none",
  });
  document.body.appendChild(menu);
  return menu;
}

export function useEasterEggs() {
  const cleanups = [];
  const titleTriggers = [];
  let konamiBuffer = [];
  let typingBuffer = "";
  let overlayVisible = false;
  const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const contextMenu = createContextMenu();
  const longPressMenu = createLongPressMenu();
  const shortcutOverlay = createShortcutOverlay();

  function closeContextMenu() {
    contextMenu.style.display = "none";
  }

  function closeLongPressMenu() {
    longPressMenu.style.display = "none";
  }

  function toggleOverlay(force) {
    overlayVisible = typeof force === "boolean" ? force : !overlayVisible;
    gsap.to(shortcutOverlay, {
      opacity: overlayVisible ? 1 : 0,
      pointerEvents: overlayVisible ? "auto" : "none",
      duration: reduceMotion ? 0 : 0.22,
      ease: "power2.out",
    });
  }

  function openContextMenu(x, y) {
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = "block";
  }

  function performContextAction(action) {
    try {
      if (action === "copy-email") {
        navigator.clipboard?.writeText?.("wangxinxiang060412@qq.com");
        createToast("已复制邮箱");
      } else if (action === "jump-lighttrip") {
        const target =
          document.querySelector("#lighttrip") ||
          document.querySelector("[data-project='lighttrip']") ||
          document.querySelector("#what-i-build");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (action === "toggle-sound") {
        window.audioEnabled = !(window.audioEnabled === true);
        createToast(`Sound: ${window.audioEnabled ? "ON" : "OFF"}`);
      } else if (action === "view-source") {
        window.open("https://github.com", "_blank", "noopener,noreferrer");
      }
    } catch {
      // graceful degrade
    }
  }

  const menuClickHandler = (event) => {
    const action = event.target?.dataset?.action;
    if (!action) return;
    performContextAction(action);
    closeContextMenu();
  };
  contextMenu.addEventListener("click", menuClickHandler);
  cleanups.push(() => contextMenu.removeEventListener("click", menuClickHandler));

  const globalPointerDown = (event) => {
    const inContext = event.target?.closest?.("[data-easter-context='1']");
    const inLongPress = event.target?.closest?.("[data-easter-longpress='1']");
    if (!inContext) closeContextMenu();
    if (!inLongPress) closeLongPressMenu();
  };
  document.addEventListener("pointerdown", globalPointerDown, { passive: true });
  cleanups.push(() => document.removeEventListener("pointerdown", globalPointerDown));

  const onContextMenu = (event) => {
    event.preventDefault();
    openContextMenu(event.clientX, event.clientY);
  };
  window.addEventListener("contextmenu", onContextMenu);
  cleanups.push(() => window.removeEventListener("contextmenu", onContextMenu));

  const onKeyup = (event) => {
    const key = String(event.key || "").toLowerCase();
    konamiBuffer.push(key);
    if (konamiBuffer.length > KONAMI.length) konamiBuffer.shift();
    if (konamiBuffer.join(",") === KONAMI.join(",")) {
      runRainbowFlash();
      createToast("🎮 You found the cheat code");
      konamiBuffer = [];
    }

    if (key.length === 1) {
      typingBuffer = (typingBuffer + key).slice(-5);
      if (typingBuffer.toLowerCase() === "hello") {
        window.dispatchEvent(new CustomEvent("easter:hero-hello"));
        typingBuffer = "";
      }
    }

    if (event.key === "?") {
      event.preventDefault();
      toggleOverlay();
    }
    if (event.key === "Escape" && overlayVisible) {
      toggleOverlay(false);
    }
  };
  window.addEventListener("keyup", onKeyup);
  cleanups.push(() => window.removeEventListener("keyup", onKeyup));

  const titleMap = [
    { selector: "#hero", title: "王鑫翔 · Hero" },
    { selector: "#intro", title: "王鑫翔 · About" },
    { selector: "#toolkit", title: "王鑫翔 · Toolkit" },
    { selector: "#what-i-build", title: "王鑫翔 · Work" },
    { selector: "#contact", title: "王鑫翔 · Contact" },
  ];
  titleMap.forEach((item) => {
    const section = document.querySelector(item.selector);
    if (!section) return;
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 45%",
      end: "bottom 45%",
      onEnter: () => {
        document.title = item.title;
      },
      onEnterBack: () => {
        document.title = item.title;
      },
    });
    titleTriggers.push(trigger);
  });

  if (isDesktop) {
    let longPressTimer = null;
    let longPressTarget = null;

    const showLongPressMenu = (target, x, y) => {
      const figma = target.getAttribute("data-figma-url") || "";
      const github = target.getAttribute("data-github-url") || "";
      const fallback = github || figma || window.location.href;
      const items = [
        { label: "View on Figma", href: figma },
        { label: "View on GitHub", href: github },
        { label: "Copy Link", href: fallback, copy: true },
      ];
      longPressMenu.innerHTML = "";
      items.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = item.label;
        Object.assign(btn.style, {
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "7px 10px",
          border: "0",
          background: "transparent",
          borderRadius: "8px",
          color: "#4A3B32",
          fontFamily:
            '"JetBrains Mono","SFMono-Regular",ui-monospace,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
          fontSize: "10px",
          letterSpacing: "0.04em",
          cursor: "pointer",
          opacity: item.href ? "1" : "0.45",
        });
        btn.disabled = !item.href;
        btn.addEventListener("click", () => {
          if (!item.href) return;
          if (item.copy) {
            navigator.clipboard?.writeText?.(item.href);
            createToast("Link copied");
          } else {
            window.open(item.href, "_blank", "noopener,noreferrer");
          }
          closeLongPressMenu();
        });
        longPressMenu.appendChild(btn);
      });
      longPressMenu.style.left = `${x}px`;
      longPressMenu.style.top = `${y}px`;
      longPressMenu.style.display = "block";
    };

    const onPointerDown = (event) => {
      const card = event.target?.closest?.("[data-easter-card='1']");
      if (!card) return;
      longPressTarget = card;
      const x = event.clientX;
      const y = event.clientY;
      longPressTimer = window.setTimeout(() => {
        if (!longPressTarget) return;
        showLongPressMenu(longPressTarget, x, y);
      }, 600);
    };
    const clearLongPress = () => {
      longPressTarget = null;
      if (!longPressTimer) return;
      clearTimeout(longPressTimer);
      longPressTimer = null;
    };
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointerup", clearLongPress, { passive: true });
    document.addEventListener("pointercancel", clearLongPress, { passive: true });
    document.addEventListener("pointermove", clearLongPress, { passive: true });
    cleanups.push(() => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", clearLongPress);
      document.removeEventListener("pointercancel", clearLongPress);
      document.removeEventListener("pointermove", clearLongPress);
      clearLongPress();
    });
  }

  return () => {
    cleanups.forEach((fn) => fn());
    titleTriggers.forEach((t) => t.kill());
    contextMenu.remove();
    longPressMenu.remove();
    shortcutOverlay.remove();
  };
}
