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

async function showNotification(title: string, body: string, tag: string) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg && "showNotification" in reg) {
      await reg.showNotification(title, {
        body,
        tag,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
      });
      return;
    }
  } catch {
    /* fall through to plain Notification */
  }
  try {
    new Notification(title, { body, tag, icon: "/icons/icon-192.png" });
  } catch {
    /* ignore */
  }
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

  if (todayEvents.length > 0) {
    const title = locale === "fa" ? "🎧 برنامه‌های امروز" : "🎧 Today's Events";
    const body = todayEvents.map(label).join("\n");
    await showNotification(title, body, "igig-today");
  }

  if (tomorrowEvents.length > 0) {
    const title = locale === "fa" ? "📅 برنامه‌های فردا" : "📅 Tomorrow's Events";
    const body = tomorrowEvents.map(label).join("\n");
    await showNotification(title, body, "igig-tomorrow");
  }

  try {
    localStorage.setItem(LAST_NOTIFY_KEY, todayStr);
  } catch {
    /* ignore */
  }

  result.notified = true;
  return result;
}
