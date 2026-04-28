import { readonly, ref } from "vue";

const isSafari = ref(false);
const isIOS = ref(false);
const isWebKit = ref(false);
const isSafariLike = ref(false);

let hasInitialized = false;

export function getBrowserPlatformSnapshot() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      isSafari: false,
      isIOS: false,
      isWebKit: false,
      isSafariLike: false,
    };
  }

  const ua = navigator.userAgent || "";
  const vendor = navigator.vendor || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  const iosPlatform = /iP(ad|hone|od)/i.test(ua);
  const ipadOSDesktopMode = platform === "MacIntel" && maxTouchPoints > 1;
  const isIOSDevice = iosPlatform || ipadOSDesktopMode;
  const isAndroid = /Android/i.test(ua);
  const webkit = /AppleWebKit/i.test(ua);

  const isChromeLike =
    /(Chrome|CriOS|Chromium|Edg|EdgiOS|OPR|OPiOS|SamsungBrowser)/i.test(ua) ||
    Boolean(navigator.brave);
  const isFirefoxLike = /(Firefox|FxiOS)/i.test(ua);
  const isDuckDuckGo = /DuckDuckGo/i.test(ua);
  const isAppleVendor = /Apple/i.test(vendor);

  const safariBrowser =
    webkit &&
    isAppleVendor &&
    !isAndroid &&
    !isChromeLike &&
    !isFirefoxLike &&
    !isDuckDuckGo;
  const safariLikeBrowser =
    safariBrowser ||
    (isIOSDevice && webkit && !isChromeLike && !isFirefoxLike);

  return {
    isSafari: safariBrowser,
    isIOS: isIOSDevice,
    isWebKit: webkit,
    isSafariLike: safariLikeBrowser,
  };
}

function ensureSafariFlags() {
  if (hasInitialized) return;
  hasInitialized = true;

  const snapshot = getBrowserPlatformSnapshot();
  isSafari.value = snapshot.isSafari;
  isIOS.value = snapshot.isIOS;
  isWebKit.value = snapshot.isWebKit;
  isSafariLike.value = snapshot.isSafariLike;
}

export function useIsSafari() {
  ensureSafariFlags();

  return {
    isSafari: readonly(isSafari),
    isIOS: readonly(isIOS),
    isWebKit: readonly(isWebKit),
    isSafariLike: readonly(isSafariLike),
  };
}
