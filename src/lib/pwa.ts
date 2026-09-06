// PWA install detection + install prompt helper

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/** True when the app is running as an installed PWA (standalone window). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia?.("(display-mode: standalone)")?.matches;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const androidRef = document.referrer?.startsWith("android-app://");
  return Boolean(mm || iosStandalone || androidRef);
}

/** Rough mobile / tablet detection (phones & tablets require install). */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isTouchMac =
    /Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document; // iPadOS
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile|Silk/i.test(ua) || isTouchMac;
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isTouchMac = /Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document;
  return /iPad|iPhone|iPod/.test(ua) || isTouchMac;
}

export function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
}
