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
const LEAD_DAYS_KEY = "djReminderLeadDays";

/** How many days ahead of an event the user wants to be reminded. */
export type LeadDays = 0 | 1 | 2 | 3 | 7;

export function getLeadDays(): LeadDays {
  try {
    const raw = parseInt(localStorage.getItem(LEAD_DAYS_KEY) || "1", 10);
    return ([0, 1, 2, 3, 7] as number[]).includes(raw) ? (raw as LeadDays) : 1;
  } catch {
    return 1;
  }
}

export function setLeadDays(days: LeadDays): void {
  try {
    localStorage.setItem(LEAD_DAYS_KEY, String(days));
  } catch {
    /* ignore */
  }
}

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
  const leadDays = getLeadDays();
  const active = (events || []).filter((e) => e.status !== "cancelled");
  const todayEvents = active.filter((e) => e.gregorianDate === todayStr);

  const windowDates: string[] = [];
  for (let i = 1; i <= leadDays; i++) {
    windowDates.push(ymd(new Date(now.getTime() + i * 86400000)));
  }
  const upcomingEvents = active
    .filter((e) => windowDates.includes(e.gregorianDate))
    .sort((a, b) => a.gregorianDate.localeCompare(b.gregorianDate));

  const label = (e: NotifiableEvent) =>
    `${e.title || e.eventType}${e.venue ? ` — ${e.venue}` : ""}`;

  const lines: string[] = [];
  if (todayEvents.length > 0) {
    lines.push(
      (locale === "fa" ? "امروز: " : "Today: ") + todayEvents.map(label).join("، ")
    );
  }
  if (upcomingEvents.length > 0) {
    const prefix =
      locale === "fa"
        ? leadDays === 1 ? "فردا: " : `${leadDays} روز آینده: `
        : leadDays === 1 ? "Tomorrow: " : `Next ${leadDays} days: `;
    lines.push(prefix + upcomingEvents.map(label).join("، "));
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
): Promise<{ notified: boolean; todayCount: number; upcomingCount: number; delivered: boolean }> {
  const now = new Date();
  const todayStr = ymd(now);
  const leadDays = getLeadDays();

  const active = (events || []).filter((e) => e.status !== "cancelled");
  const todayEvents = active.filter((e) => e.gregorianDate === todayStr);

  // Every event inside the user's chosen lead window (excluding today).
  const windowDates: string[] = [];
  for (let i = 1; i <= leadDays; i++) {
    windowDates.push(ymd(new Date(now.getTime() + i * 86400000)));
  }
  const upcomingEvents = active
    .filter((e) => windowDates.includes(e.gregorianDate))
    .sort((a, b) => a.gregorianDate.localeCompare(b.gregorianDate));

  const result = {
    notified: false,
    todayCount: todayEvents.length,
    upcomingCount: upcomingEvents.length,
    delivered: false,
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

  if (todayEvents.length === 0 && upcomingEvents.length === 0) {
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

  if (upcomingEvents.length > 0) {
    const title =
      locale === "fa"
        ? leadDays === 1
          ? "📅 برنامه‌های فردا"
          : `📅 برنامه‌های ${leadDays} روز آینده`
        : leadDays === 1
        ? "📅 Tomorrow's Events"
        : `📅 Next ${leadDays} Days`;
    const body = upcomingEvents
      .map((e) => `${e.shamsiDate} · ${label(e)}`)
      .join("\n");
    delivered = (await showNotification(title, body, "igig-upcoming")) || delivered;
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
