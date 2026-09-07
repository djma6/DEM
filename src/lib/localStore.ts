// Local-only storage used when the user did NOT sign in with Google.
// Also stores per-Gmail profiles, bank cards and the Sheba/IBAN number.

export interface LocalEvent {
  id: number;
  eventType: string;
  title: string | null;
  shamsiDate: string;
  gregorianDate: string;
  venue: string | null;
  location: string | null;
  fee: number;
  deposit: number;
  equipmentNeeded: string | null;
  soundLightProvider: string | null;
  soundLightProviderPhone: string | null;
  soundLightRequirements: string | null;
  soundLightCost: number;
  description: string | null;
  customerName: string | null;
  customerPhone: string | null;
  guestCount: number;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface LocalReminder {
  id: number;
  title: string;
  shamsiDate: string;
  gregorianDate: string;
  time: string | null;
  notifyBefore: string | null;
  contactName: string | null;
  contactPhone: string | null;
  description: string | null;
  completed: number;
}

export interface LocalBankCard {
  id: number;
  title: string;
  cardNumber: string;
  /** Optional IBAN/Sheba attached to this specific card */
  sheba?: string;
}

export type CustomerCategory = "ceremony" | "restaurant" | "club" | "dj" | "other";

export interface LocalCustomer {
  id: number;
  fullName: string;
  phone: string;
  category: CustomerCategory;
  businessName?: string | null;
  notes?: string | null;
}

export interface StoredProfile {
  name: string;
  phone: string;
  email: string;
  instagram: string;
}

const EVENTS_KEY = "djLocalEvents";
const REMINDERS_KEY = "djLocalReminders";
const CARDS_KEY = "djBankCards";
const SHEBA_KEY = "djSheba";
const CUSTOMERS_KEY = "djLocalCustomers";
const SEQ_KEY = "djLocalSeq";
const LEGACY_PROFILE_KEY = "djProfile";

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

function nextId(): number {
  try {
    const current = parseInt(localStorage.getItem(SEQ_KEY) || "0", 10);
    const next = (isNaN(current) ? 0 : current) + 1;
    localStorage.setItem(SEQ_KEY, String(next));
    return next;
  } catch {
    return Date.now();
  }
}

/* ── Profile (per Gmail address) ── */

export function profileKeyFor(email?: string | null): string {
  const clean = email?.trim().toLowerCase();
  return clean ? `djProfile:${clean}` : LEGACY_PROFILE_KEY;
}

export function loadProfile(email?: string | null): StoredProfile | null {
  try {
    const raw = localStorage.getItem(profileKeyFor(email));
    if (raw) {
      const parsed = JSON.parse(raw) as StoredProfile;
      if (parsed && parsed.name) return parsed;
    }
    if (email) {
      // Migrate an older single-profile install to the per-email key
      const legacy = localStorage.getItem(LEGACY_PROFILE_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy) as StoredProfile;
        if (parsed && parsed.name) {
          saveProfile(parsed, email);
          return parsed;
        }
      }
    }
  } catch {
    /* ignore malformed json */
  }
  return null;
}

export function saveProfile(profile: StoredProfile, email?: string | null): void {
  try {
    localStorage.setItem(profileKeyFor(email), JSON.stringify(profile));
    localStorage.setItem(LEGACY_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

/* ── Events ── */

export function getLocalEvents(): LocalEvent[] {
  return read<LocalEvent>(EVENTS_KEY);
}

export function upsertLocalEvent(
  data: Partial<LocalEvent>,
  id?: number
): LocalEvent {
  const list = getLocalEvents();
  const now = new Date().toISOString();
  if (id) {
    const idx = list.findIndex((e) => e.id === id);
    if (idx !== -1) {
      const updated = { ...list[idx], ...data, id, updatedAt: now } as LocalEvent;
      list[idx] = updated;
      write(EVENTS_KEY, list);
      return updated;
    }
  }
  const created = {
    ...(data as LocalEvent),
    id: id ?? nextId(),
    createdAt: now,
    updatedAt: now,
  } as LocalEvent;
  list.push(created);
  write(EVENTS_KEY, list);
  return created;
}

export function deleteLocalEvent(id: number): void {
  write(EVENTS_KEY, getLocalEvents().filter((e) => e.id !== id));
}

/* ── Reminders ── */

export function getLocalReminders(): LocalReminder[] {
  return read<LocalReminder>(REMINDERS_KEY);
}

export function addLocalReminder(data: Partial<LocalReminder>): LocalReminder {
  const list = getLocalReminders();
  const created = { ...(data as LocalReminder), id: nextId(), completed: 0 };
  list.push(created);
  write(REMINDERS_KEY, list);
  return created;
}

export function deleteLocalReminder(id: number): void {
  write(REMINDERS_KEY, getLocalReminders().filter((r) => r.id !== id));
}

/* ── Bank cards (always local, never uploaded) ── */

export function getBankCards(): LocalBankCard[] {
  return read<LocalBankCard>(CARDS_KEY);
}

export function addBankCard(
  title: string,
  cardNumber: string,
  sheba?: string
): LocalBankCard {
  const list = getBankCards();
  const created: LocalBankCard = {
    id: nextId(),
    title,
    cardNumber,
    sheba: sheba?.trim() ? sheba.trim().toUpperCase() : undefined,
  };
  list.push(created);
  write(CARDS_KEY, list);
  return created;
}

export function deleteBankCard(id: number): void {
  write(CARDS_KEY, getBankCards().filter((c) => c.id !== id));
}

/* ── Customers (local mirror when signed out) ── */

export function getLocalCustomers(): LocalCustomer[] {
  return read<LocalCustomer>(CUSTOMERS_KEY);
}

export function addLocalCustomer(data: Omit<LocalCustomer, "id">): LocalCustomer {
  const list = getLocalCustomers();
  const created: LocalCustomer = { ...data, id: nextId() };
  list.push(created);
  write(CUSTOMERS_KEY, list);
  return created;
}

export function updateLocalCustomer(
  id: number,
  data: Partial<Omit<LocalCustomer, "id">>
): void {
  const list = getLocalCustomers();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...data, id };
  write(CUSTOMERS_KEY, list);
}

export function deleteLocalCustomer(id: number): void {
  write(CUSTOMERS_KEY, getLocalCustomers().filter((c) => c.id !== id));
}

/* ── Sheba / IBAN (always local) ── */

export function getSheba(): string {
  try {
    return localStorage.getItem(SHEBA_KEY) || "";
  } catch {
    return "";
  }
}

export function saveSheba(value: string): void {
  try {
    localStorage.setItem(SHEBA_KEY, value);
  } catch {
    /* ignore */
  }
}

/* ── Stats helper (used in local mode) ── */

export function computeStats(events: LocalEvent[]) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const totalEvents = events.length;
  const unsettledEvents = events.filter(
    (e) => e.status !== "settled" && e.status !== "cancelled"
  ).length;
  const totalRevenue = events.reduce((sum, e) => sum + (Number(e.fee) || 0), 0);
  const upcoming = events
    .filter((e) => e.gregorianDate >= todayStr && e.status !== "cancelled")
    .sort((a, b) => a.gregorianDate.localeCompare(b.gregorianDate));
  return {
    totalEvents,
    unsettledEvents,
    totalRevenue,
    upcomingCount: upcoming.length,
    upcomingEvents: upcoming.slice(0, 5),
  };
}
