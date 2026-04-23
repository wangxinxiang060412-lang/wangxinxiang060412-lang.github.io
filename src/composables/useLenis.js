import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ref } from "vue";

let lenis = null;
let gsapTicker = null;
const velocity = ref(0);

export function initLenis() {
  if (lenis) return lenis;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsapTicker = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(gsapTicker);
  gsap.ticker.lagSmoothing(0);

  lenis.on("scroll", ({ velocity: v }) => {
    velocity.value = v;
  });

  return lenis;
}

export function useLenis() {
  return { lenis, velocity };
}

export function destroyLenis() {
  if (!lenis) return;
  lenis.destroy();
  lenis = null;
  if (gsapTicker) {
    gsap.ticker.remove(gsapTicker);
    gsapTicker = null;
  }
}
