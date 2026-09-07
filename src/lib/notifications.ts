// Daily event notifications (today + tomorrow) using the Notification API
// + service worker registration so notifications work when installed as a PWA.

export interface NotifiableEvent {
  id: number;
  title: string | null;
  eventType: string;
  shamsiDate: string;
  gregorianDate: string;
  venue: string | null;
  status: string;
}

const LAST_NOTIFY_KEY = "djLastNotifyDate";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission === "granted") return "granted";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

async function showNotification(
  title: string,
  body: string,
  tag: string
): Promise<boolean> {
  if (!notificationsSupported() || Notification.permission !== "granted") {
    return false;
  }

  // Android Chrome ONLY supports notifications through a service worker
  // registration. `new Notification()` throws there, so try the SW first
  // and wait for it to become ready.
  try {
    if ("serviceWorker" in navigator) {
      const reg =
        (await navigator.serviceWorker.getRegistration()) ||
        (await navigator.serviceWorker.ready);
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(title, {
          body,
          tag,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          requireInteraction: false,
        });
        return true;
      }
    }
  } catch (err) {
    console.error("SW notification failed:", err);
  }

  // Desktop fallback
  try {
    new Notification(title, { body, tag, icon: "/icons/icon-192.png" });
    return true;
  } catch (err) {
    console.error("Notification fallback failed:", err);
    return false;
  }
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Fires a single test notification immediately.
 * Returns a status the UI can show to the user.
 */
export async function sendTestNotification(
  events: NotifiableEvent[],
  locale: "fa" | "en"
): Promise<"sent" | "denied" | "unsupported" | "failed"> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission !== "granted") {
    const perm = await requestNotificationPermission();
    if (perm !== "granted") return "denied";
  }

  const now = new Date();
  const todayStr = ymd(now);
  const tomorrowStr = ymd(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const active = (events || []).filter((e) => e.status !== "cancelled");
  const todayEvents = active.filter((e) => e.gregorianDate === todayStr);
  const tomorrowEvents = active.filter((e) => e.gregorianDate === tomorrowStr);

  const label = (e: NotifiableEvent) =>
    `${e.title || e.eventType}${e.venue ? ` — ${e.venue}` : ""}`;

  const lines: string[] = [];
  if (todayEvents.length > 0) {
    lines.push(
      (locale === "fa" ? "امروز: " : "Today: ") + todayEvents.map(label).join("، ")
    );
  }
  if (tomorrowEvents.length > 0) {
    lines.push(
      (locale === "fa" ? "فردا: " : "Tomorrow: ") + tomorrowEvents.map(label).join("، ")
    );
  }
  if (lines.length === 0) {
    lines.push(
      locale === "fa"
        ? "برای امروز و فردا برنامه‌ای ثبت نشده است."
        : "No events scheduled for today or tomorrow."
    );
  }

  const title = locale === "fa" ? "🎧 برنامه چیه" : "🎧 iGig";
  const ok = await showNotification(title, lines.join("\n"), "igig-test");
  return ok ? "sent" : "failed";
}

/**
 * Notify the user about today's and tomorrow's events.
 * Runs at most once per calendar day (tracked in localStorage).
 */
export async function runDailyEventNotifications(
  events: NotifiableEvent[],
  locale: "fa" | "en",
  opts: { force?: boolean } = {}
): Promise<{ notified: boolean; todayCount: number; tomorrowCount: number }> {
  const now = new Date();
  const todayStr = ymd(now);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = ymd(tomorrow);

  const active = (events || []).filter((e) => e.status !== "cancelled");
  const todayEvents = active.filter((e) => e.gregorianDate === todayStr);
  const tomorrowEvents = active.filter((e) => e.gregorianDate === tomorrowStr);

  const result = {
    notified: false,
    todayCount: todayEvents.length,
    tomorrowCount: tomorrowEvents.length,
    delivered: false as boolean,
  };

  if (!notificationsSupported() || Notification.permission !== "granted") return result;

  // Only once per day unless forced
  if (!opts.force) {
    try {
      if (localStorage.getItem(LAST_NOTIFY_KEY) === todayStr) return result;
    } catch {
      /* ignore */
    }
  }

  if (todayEvents.length === 0 && tomorrowEvents.length === 0) {
    try {
      localStorage.setItem(LAST_NOTIFY_KEY, todayStr);
    } catch {
      /* ignore */
    }
    return result;
  }

  const label = (e: NotifiableEvent) =>
    `${e.title || e.eventType}${e.venue ? ` — ${e.venue}` : ""}`;

  let delivered = false;

  if (todayEvents.length > 0) {
    const title = locale === "fa" ? "🎧 برنامه‌های امروز" : "🎧 Today's Events";
    const body = todayEvents.map(label).join("\n");
    delivered = (await showNotification(title, body, "igig-today")) || delivered;
  }

  if (tomorrowEvents.length > 0) {
    const title = locale === "fa" ? "📅 برنامه‌های فردا" : "📅 Tomorrow's Events";
    const body = tomorrowEvents.map(label).join("\n");
    delivered = (await showNotification(title, body, "igig-tomorrow")) || delivered;
  }

  result.delivered = delivered;

  try {
    localStorage.setItem(LAST_NOTIFY_KEY, todayStr);
  } catch {
    /* ignore */
  }

  result.notified = true;
  return result;
}
