"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar, Plus, X, ChevronLeft, ChevronRight, Music, MapPin, DollarSign,
  Users, Phone, FileText, Trash2, Edit3, AlertCircle, Clock, CreditCard,
  Globe, Speaker, Lightbulb, PartyPopper, LayoutDashboard, List, Settings,
  Download, Upload, RefreshCw, User, CheckCircle, Copy, QrCode, Contact,
  Bell, Share2, Mail, CreditCard as CardIcon, LogOut,
} from "lucide-react";
import { translations, type Locale } from "@/lib/i18n";
import { toJalaali, toGregorian, jalaaliMonthLength, formatJalaaliDate, formatGregorianDate, todayJalaali } from "@/lib/jalaali";
import { getShamsiHoliday, getGregorianHoliday, type Holiday, type GregorianHoliday } from "@/lib/holidays";
import QRCode from "qrcode";

import {
  isGoogleConfigured,
  requestAccessToken,
  fetchGoogleUser,
  uploadBackupToDrive,
  downloadBackupFromDrive,
  type GoogleUser,
} from "@/lib/google";
import InstallGate from "./InstallGate";
import { isStandalone, isMobileDevice } from "@/lib/pwa";
import {
  notificationsSupported,
  notificationPermission,
  requestNotificationPermission,
  runDailyEventNotifications,
} from "@/lib/notifications";

// ── Types ──
interface EventData { id: number; eventType: string; title: string | null; shamsiDate: string; gregorianDate: string; venue: string | null; location: string | null; fee: number; deposit: number; equipmentNeeded: string | null; soundLightProvider: string | null; soundLightProviderPhone: string | null; soundLightRequirements: string | null; soundLightCost: number; description: string | null; customerName: string | null; customerPhone: string | null; guestCount: number; status: string; createdAt: string | null; updatedAt: string | null; }
interface Stats { totalEvents: number; unsettledEvents: number; totalRevenue: number; upcomingCount: number; upcomingEvents: EventData[]; }
interface ReminderData { id: number; title: string; shamsiDate: string; gregorianDate: string; time: string | null; notifyBefore: string | null; contactName: string | null; contactPhone: string | null; description: string | null; completed: number; }
interface BankCardData { id: number; title: string; cardNumber: string; }
interface CalendarDay { day: number; isToday: boolean; hasEvents: boolean; holiday: Holiday | null; gregorianHoliday: GregorianHoliday | null; jy: number; jm: number; jd: number; gy: number; gm: number; gd: number; }
interface UserProfile { name: string; phone: string; email: string; instagram: string; }

const EVENT_TYPES = ["wedding", "birthday", "conference", "concert", "corporate", "festival", "club", "private", "other"] as const;
const STATUSES = ["confirmed", "pending", "depositPaid", "settled", "cancelled"] as const;
const STATUS_COLORS: Record<string, string> = { confirmed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", pending: "bg-amber-500/20 text-amber-400 border-amber-500/30", depositPaid: "bg-blue-500/20 text-blue-400 border-blue-500/30", settled: "bg-purple-500/20 text-purple-400 border-purple-500/30", cancelled: "bg-red-500/20 text-red-400 border-red-500/30" };
const EVENT_TYPE_ICONS: Record<string, React.ReactNode> = { wedding: <PartyPopper size={14} />, birthday: <PartyPopper size={14} />, conference: <Users size={14} />, concert: <Music size={14} />, corporate: <LayoutDashboard size={14} />, festival: <PartyPopper size={14} />, club: <Music size={14} />, private: <Users size={14} />, other: <FileText size={14} /> };

function GlassButton({ children, onClick, variant = "default", size = "md", className = "", disabled = false, onMouseEnter, onMouseLeave }: { children: React.ReactNode; onClick?: () => void; variant?: "default" | "primary" | "danger" | "success"; size?: "sm" | "md" | "lg"; className?: string; disabled?: boolean; onMouseEnter?: () => void; onMouseLeave?: () => void; }) {
  const b = "backdrop-blur-xl border transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const v: Record<string, string> = { default: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20", primary: "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/30 hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-400/50", danger: "bg-red-500/20 border-red-400/30 hover:bg-red-500/30 hover:border-red-400/50", success: "bg-emerald-500/20 border-emerald-400/30 hover:bg-emerald-500/30 hover:border-emerald-400/50" };
  const s: Record<string, string> = { sm: "px-3 py-2 text-xs rounded-xl", md: "px-4 py-3 text-sm rounded-2xl", lg: "px-6 py-4 text-base rounded-2xl" };
  return <button onClick={onClick} disabled={disabled} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={`${b} ${v[variant]} ${s[size]} ${className}`}>{children}</button>;
}

function formatCardNumber(num: string): string { return num.replace(/(\d{4})/g, "$1-").slice(0, -1); }

// ── Main App ──
export default function DJApp() {
  const [locale, setLocale] = useState<Locale>("fa");
  const [profile, setProfile] = useState<UserProfile>({ name: "", phone: "", email: "", instagram: "" });
  const [showSetup, setShowSetup] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [bankCards, setBankCards] = useState<BankCardData[]>([]);
  const [stats, setStats] = useState<Stats>({ totalEvents: 0, unsettledEvents: 0, totalRevenue: 0, upcomingCount: 0, upcomingEvents: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "calendar" | "events" | "settings">("dashboard");
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showBankCardModal, setShowBankCardModal] = useState(false);
  const [showCardQR, setShowCardQR] = useState(false);
  const [cardQrUrl, setCardQrUrl] = useState("");
  const [shareQrUrl, setShareQrUrl] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [needsInstall, setNeedsInstall] = useState<boolean | null>(null);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | "unsupported">("default");
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [calendarType, setCalendarType] = useState<"shamsi" | "gregorian">("shamsi");
  const [shamsiMonth, setShamsiMonth] = useState(() => { const t = todayJalaali(); return { year: t.jy, month: t.jm }; });
  const [gregMonth, setGregMonth] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() + 1 }; });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formStep, setFormStep] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [holidayTooltip, setHolidayTooltip] = useState<{ name: string; isHoliday: boolean } | null>(null);
  const [reminderDate, setReminderDate] = useState<string>("");

  const [formData, setFormData] = useState({ eventType: "wedding", title: "", shamsiDate: "", gregorianDate: "", venue: "", location: "", fee: 0, deposit: 0, equipmentNeeded: "", soundLightProvider: "", soundLightProviderPhone: "", soundLightRequirements: "", soundLightCost: 0, soundLightEnabled: false, description: "", customerName: "", customerPhone: "", guestCount: 0, status: "pending" });
  const [reminderForm, setReminderForm] = useState({ title: "", shamsiDate: "", gregorianDate: "", time: "", notifyBefore: "0", contactName: "", contactPhone: "", description: "" });
  const [bankCardForm, setBankCardForm] = useState({ title: "", cardNumber: "" });

  const t = translations[locale];
  const isRtl = locale === "fa";

  // Install gate: mobile browsers must install the PWA first (desktop exempt)
  useEffect(() => {
    let bypass = false;
    try { bypass = localStorage.getItem("djInstallBypass") === "1"; } catch { /* ignore */ }
    const mustInstall = isMobileDevice() && !isStandalone() && !bypass;
    setNeedsInstall(mustInstall);
  }, []);

  // Notification permission state
  useEffect(() => {
    setNotifPerm(notificationPermission());
  }, []);

  // Init
  useEffect(() => {
    try {
      const savedGoogle = localStorage.getItem("djGoogleUser");
      if (savedGoogle) setGoogleUser(JSON.parse(savedGoogle));
    } catch { /* ignore */ }
    try {
      const saved = localStorage.getItem("djProfile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          setProfile(parsed);
          setShowSetup(false);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to parse djProfile from localStorage", e);
    }
    setShowSetup(true);
  }, []);

  const handleSetupSubmit = () => {
    if (profile.name.trim()) {
      localStorage.setItem("djProfile", JSON.stringify(profile));
      setShowSetup(false);
    }
  };

  const fetchEvents = useCallback(async () => {
    try {
      const r = await fetch("/api/events");
      if (r.ok) {
        const d = await r.json();
        setEvents(Array.isArray(d.events) ? d.events : []);
        if (d.stats) setStats(d.stats);
      } else {
        setEvents([]);
      }
    } catch (e) {
      console.error("Fetch events failed:", e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReminders = useCallback(async () => {
    try {
      const r = await fetch("/api/reminders");
      if (r.ok) {
        const data = await r.json();
        setReminders(Array.isArray(data) ? data : []);
      } else {
        setReminders([]);
      }
    } catch (e) {
      console.error("Fetch reminders failed:", e);
      setReminders([]);
    }
  }, []);

  const fetchBankCards = useCallback(async () => {
    try {
      const r = await fetch("/api/bank-cards");
      if (r.ok) {
        const data = await r.json();
        setBankCards(Array.isArray(data) ? data : []);
      } else {
        setBankCards([]);
      }
    } catch (e) {
      console.error("Fetch bank cards failed:", e);
      setBankCards([]);
    }
  }, []);

  useEffect(() => { if (!showSetup) { fetchEvents(); fetchReminders(); fetchBankCards(); } }, [fetchEvents, fetchReminders, fetchBankCards, showSetup]);

  // Daily notifications for today's + tomorrow's events (once per day)
  useEffect(() => {
    if (showSetup || needsInstall !== false) return;
    if (!Array.isArray(events) || events.length === 0) return;
    if (notifPerm !== "granted") return;
    runDailyEventNotifications(events, locale).catch(() => { /* ignore */ });
  }, [events, locale, showSetup, needsInstall, notifPerm]);

  const handleEnableNotifications = async () => {
    if (!notificationsSupported()) { alert(t.notificationsUnsupported); return; }
    const perm = await requestNotificationPermission();
    setNotifPerm(perm);
    if (perm === "granted") {
      await runDailyEventNotifications(events, locale, { force: true });
    } else if (perm === "denied") {
      alert(t.notificationsBlocked);
    }
  };

  const handleTestNotification = async () => {
    if (notifPerm !== "granted") { await handleEnableNotifications(); return; }
    await runDailyEventNotifications(events, locale, { force: true });
  };

  const generateQRCode = async (data: string): Promise<string> => {
    return await QRCode.toDataURL(data, { width: 300, margin: 2, color: { dark: "#1a1a2e", light: "#FFFFFF" } });
  };

  const generateEventQR = async (event: EventData) => {
    try {
      const url = await generateQRCode(JSON.stringify({ id: event.id, type: event.eventType, title: event.title || t[event.eventType as keyof typeof t], date: event.shamsiDate, venue: event.venue, customer: event.customerName, phone: event.customerPhone, guests: event.guestCount }));
      setQrCodeUrl(url); setSelectedEvent(event); setShowQRModal(true);
    } catch (e) { console.error(e); }
  };

  const generateShareQR = async () => {
    try {
      const url = await generateQRCode(JSON.stringify({ name: profile.name, phone: profile.phone, email: profile.email, instagram: profile.instagram }));
      setShareQrUrl(url);
    } catch (e) { console.error(e); }
  };

  const generateCardQR = async (card: BankCardData) => {
    try {
      const url = await generateQRCode(card.cardNumber);
      setCardQrUrl(url); setSelectedCardQR(card); setShowCardQR(true);
    } catch (e) { console.error(e); }
  };
  const [selectedCardQR, setSelectedCardQR] = useState<BankCardData | null>(null);

  // Calendar
  const today = todayJalaali(); const todayStr = formatJalaaliDate(today.jy, today.jm, today.jd);
  const now = new Date(); const todayGStr = formatGregorianDate(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const getShamsiCalendarDays = (): { days: CalendarDay[]; startDayOfWeek: number } => {
    const { year, month } = shamsiMonth; const ml = jalaaliMonthLength(year, month);
    const fg = toGregorian(year, month, 1); let sd = (new Date(fg.gy, fg.gm - 1, fg.gd).getDay() + 1) % 7;
    const days: CalendarDay[] = [];
    const evList = Array.isArray(events) ? events : [];
    for (let d = 1; d <= ml; d++) { const ds = formatJalaaliDate(year, month, d); const g = toGregorian(year, month, d);
      days.push({ day: d, isToday: ds === todayStr, hasEvents: evList.some(e => e.shamsiDate === ds), holiday: getShamsiHoliday(month, d), gregorianHoliday: getGregorianHoliday(g.gm, g.gd), jy: year, jm: month, jd: d, gy: g.gy, gm: g.gm, gd: g.gd }); }
    return { days, startDayOfWeek: sd };
  };
  const getGregorianCalendarDays = (): { days: CalendarDay[]; startDayOfWeek: number } => {
    const { year, month } = gregMonth; const ml = new Date(year, month, 0).getDate();
    let sd = (new Date(year, month - 1, 1).getDay() + 1) % 7;
    const days: CalendarDay[] = [];
    const evList = Array.isArray(events) ? events : [];
    for (let d = 1; d <= ml; d++) { const gs = formatGregorianDate(year, month, d); let j; try { j = toJalaali(year, month, d); } catch { continue; }
      days.push({ day: d, isToday: gs === todayGStr, hasEvents: evList.some(e => e.gregorianDate === gs), holiday: getShamsiHoliday(j.jm, j.jd), gregorianHoliday: getGregorianHoliday(month, d), jy: j.jy, jm: j.jm, jd: j.jd, gy: year, gm: month, gd: d }); }
    return { days, startDayOfWeek: sd };
  };
  const prevMonth = () => { if (calendarType === "shamsi") setShamsiMonth(p => { let y = p.year, m = p.month - 1; if (m < 1) { m = 12; y--; } return { year: y, month: m }; }); else setGregMonth(p => { let y = p.year, m = p.month - 1; if (m < 1) { m = 12; y--; } return { year: y, month: m }; }); };
  const nextMonth = () => { if (calendarType === "shamsi") setShamsiMonth(p => { let y = p.year, m = p.month + 1; if (m > 12) { m = 1; y++; } return { year: y, month: m }; }); else setGregMonth(p => { let y = p.year, m = p.month + 1; if (m > 12) { m = 1; y++; } return { year: y, month: m }; }); };
  const goToToday = () => { const jt = todayJalaali(); setShamsiMonth({ year: jt.jy, month: jt.jm }); const n = new Date(); setGregMonth({ year: n.getFullYear(), month: n.getMonth() + 1 }); };
  const switchCalendarType = (nt: "shamsi" | "gregorian") => { if (nt === "gregorian") { const g = toGregorian(shamsiMonth.year, shamsiMonth.month, 15); setGregMonth({ year: g.gy, month: g.gm }); } else { const j = toJalaali(gregMonth.year, gregMonth.month, 15); setShamsiMonth({ year: j.jy, month: j.jm }); } setCalendarType(nt); };
  const handleMonthPick = (m: number) => { if (calendarType === "shamsi") setShamsiMonth(p => ({ ...p, month: m })); else setGregMonth(p => ({ ...p, month: m })); setShowMonthPicker(false); };
  const handleYearChange = (d: number) => { if (calendarType === "shamsi") setShamsiMonth(p => ({ ...p, year: p.year + d })); else setGregMonth(p => ({ ...p, year: p.year + d })); };
  const handleDayClick = (di: CalendarDay) => { const ds = calendarType === "shamsi" ? formatJalaaliDate(di.jy, di.jm, di.jd) : formatGregorianDate(di.gy, di.gm, di.gd); const evList = Array.isArray(events) ? events : []; const de = evList.filter(e => e.shamsiDate === ds || e.gregorianDate === ds); if (de.length === 1) { setSelectedEvent(de[0]); setShowDetailModal(true); } else setSelectedDate(ds); };
  const getMonthEvents = (): EventData[] => { const evList = Array.isArray(events) ? events : []; if (calendarType === "shamsi") { const p = `${shamsiMonth.year}/${String(shamsiMonth.month).padStart(2, "0")}/`; return evList.filter(e => e.shamsiDate.startsWith(p) && e.status !== "cancelled").sort((a, b) => a.shamsiDate.localeCompare(b.shamsiDate)); } else { const p = `${gregMonth.year}-${String(gregMonth.month).padStart(2, "0")}-`; return evList.filter(e => e.gregorianDate.startsWith(p) && e.status !== "cancelled").sort((a, b) => a.gregorianDate.localeCompare(b.gregorianDate)); } };

  // Form
  const openNewEventForm = (date?: string) => { setEditingEvent(null); const sd = date || todayStr; const p = sd.split("/"); const g = toGregorian(parseInt(p[0]), parseInt(p[1]), parseInt(p[2])); setFormData({ eventType: "wedding", title: "", shamsiDate: sd, gregorianDate: formatGregorianDate(g.gy, g.gm, g.gd), venue: "", location: "", fee: 0, deposit: 0, equipmentNeeded: "", soundLightProvider: "", soundLightProviderPhone: "", soundLightRequirements: "", soundLightCost: 0, soundLightEnabled: false, description: "", customerName: "", customerPhone: "", guestCount: 0, status: "pending" }); setFormStep(0); setShowEventModal(true); };
  const openEditEventForm = (ev: EventData) => { setEditingEvent(ev); setFormData({ eventType: ev.eventType, title: ev.title || "", shamsiDate: ev.shamsiDate, gregorianDate: ev.gregorianDate, venue: ev.venue || "", location: ev.location || "", fee: ev.fee, deposit: ev.deposit, equipmentNeeded: ev.equipmentNeeded || "", soundLightProvider: ev.soundLightProvider || "", soundLightProviderPhone: "", soundLightRequirements: ev.soundLightRequirements || "", soundLightCost: ev.soundLightCost, soundLightEnabled: !!(ev.soundLightProvider || ev.soundLightRequirements || ev.soundLightCost), description: ev.description || "", customerName: ev.customerName || "", customerPhone: ev.customerPhone || "", guestCount: ev.guestCount || 0, status: ev.status }); setFormStep(0); setShowEventModal(true); };
  const handleShamsiDateChange = (val: string) => { const p = val.split("/"); if (p.length === 3) { const jy = parseInt(p[0]), jm = parseInt(p[1]), jd = parseInt(p[2]); if (!isNaN(jy) && !isNaN(jm) && !isNaN(jd) && jm >= 1 && jm <= 12 && jd >= 1 && jd <= 31) { try { const g = toGregorian(jy, jm, jd); setFormData(prev => ({ ...prev, shamsiDate: val, gregorianDate: formatGregorianDate(g.gy, g.gm, g.gd) })); return; } catch {} } } setFormData(prev => ({ ...prev, shamsiDate: val })); };
  const handleSave = async () => { try { if (editingEvent) await fetch(`/api/events/${editingEvent.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) }); else await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) }); setShowEventModal(false); setEditingEvent(null); fetchEvents(); } catch (e) { console.error(e); } };
  const handleDelete = async () => { if (!selectedEvent) return; try { await fetch(`/api/events/${selectedEvent.id}`, { method: "DELETE" }); setShowDeleteConfirm(false); setShowDetailModal(false); setSelectedEvent(null); fetchEvents(); } catch (e) { console.error(e); } };
  const handleReset = async () => { try { await fetch("/api/reset", { method: "DELETE" }); localStorage.clear(); setShowResetConfirm(false); window.location.reload(); } catch (e) { console.error(e); } };

  const handleContactPicker = async (target: "customer" | "provider" | "reminder") => { try { if ("contacts" in navigator) { const c = await (navigator as any).contacts.select(["name", "tel"], { multiple: false }); if (c.length > 0) { const name = c[0].name?.[0] || ""; const tel = c[0].tel?.[0] || ""; if (target === "customer") setFormData(p => ({ ...p, customerName: name || p.customerName, customerPhone: tel || p.customerPhone })); else if (target === "provider") setFormData(p => ({ ...p, soundLightProvider: name || p.soundLightProvider, soundLightProviderPhone: tel || p.soundLightProviderPhone })); else if (target === "reminder") setReminderForm(p => ({ ...p, contactName: name || p.contactName, contactPhone: tel || p.contactPhone })); } } else alert(t.contactPickerNotSupported); } catch { alert(t.contactPickerFailed); } };

  // Reminder
  const openReminderForm = (dateStr: string) => {
    let shamsi = dateStr;
    if (dateStr.includes("-")) { const p = dateStr.split("-"); const j = toJalaali(parseInt(p[0]), parseInt(p[1]), parseInt(p[2])); shamsi = formatJalaaliDate(j.jy, j.jm, j.jd); }
    const parts = shamsi.split("/"); const g = toGregorian(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
    setReminderForm({ title: "", shamsiDate: shamsi, gregorianDate: formatGregorianDate(g.gy, g.gm, g.gd), time: "", notifyBefore: "0", contactName: "", contactPhone: "", description: "" });
    setReminderDate(shamsi); setShowReminderModal(true);
  };
  const handleSaveReminder = async () => { try { await fetch("/api/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reminderForm) }); setShowReminderModal(false); fetchReminders(); } catch (e) { console.error(e); } };
  const handleDeleteReminder = async (id: number) => { try { await fetch(`/api/reminders/${id}`, { method: "DELETE" }); fetchReminders(); } catch (e) { console.error(e); } };

  // ── Google ──
  const handleGoogleSignIn = async () => {
    if (!isGoogleConfigured()) { alert(t.googleNotConfigured); return; }
    setGoogleBusy(true);
    try {
      const token = await requestAccessToken();
      const user = await fetchGoogleUser(token);
      setGoogleToken(token);
      setGoogleUser(user);
      localStorage.setItem("djGoogleUser", JSON.stringify(user));
      // Prefill profile from Google, keep anything user already typed
      setProfile(p => ({
        ...p,
        name: p.name || user.name || "",
        email: user.email || p.email || "",
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "NOT_CONFIGURED") alert(t.googleNotConfigured);
      else if (msg === "POPUP_CLOSED") alert(t.signInCancelled);
      else if (msg === "access_denied") alert(t.googleAccessDenied);
      else if (msg === "idpiframe_initialization_failed" || msg === "GIS_UNAVAILABLE") alert(t.googleOriginMismatch);
      else alert(t.driveFailed + (msg ? `\n(${msg})` : ""));
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleGoogleDisconnect = () => {
    setGoogleUser(null);
    setGoogleToken(null);
    localStorage.removeItem("djGoogleUser");
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setGoogleUser(null);
    setGoogleToken(null);
    localStorage.removeItem("djGoogleUser");
    localStorage.removeItem("djProfile");
    setProfile({ name: "", phone: "", email: "", instagram: "" });
    setShowSetup(true);
  };

  const ensureGoogleToken = async (): Promise<string | null> => {
    if (googleToken) return googleToken;
    try {
      const token = await requestAccessToken();
      setGoogleToken(token);
      if (!googleUser) {
        const user = await fetchGoogleUser(token);
        setGoogleUser(user);
        localStorage.setItem("djGoogleUser", JSON.stringify(user));
      }
      return token;
    } catch {
      return null;
    }
  };

  const handleDriveBackup = async () => {
    if (!isGoogleConfigured()) { alert(t.googleNotConfigured); return; }
    setGoogleBusy(true);
    try {
      const token = await ensureGoogleToken();
      if (!token) { alert(t.signInCancelled); return; }
      const r = await fetch("/api/backup");
      const data = await r.json();
      // Only backup events + reminders + profile (not bank cards)
      await uploadBackupToDrive(token, {
        version: data.version || "2.0",
        exportDate: data.exportDate,
        profile,
        events: Array.isArray(data.events) ? data.events : [],
        reminders: Array.isArray(data.reminders) ? data.reminders : [],
      });
      alert(t.driveBackupSuccess);
    } catch (e: unknown) {
      console.error("Drive backup error:", e);
      const msg = e instanceof Error ? e.message : "";
      if (msg === "DRIVE_API_NOT_ENABLED") {
        alert(t.driveApiNotEnabled);
      } else if (msg === "DRIVE_PERMISSION_DENIED") {
        setGoogleToken(null);
        alert(t.drivePermissionDenied);
      } else if (msg === "TOKEN_EXPIRED") {
        setGoogleToken(null);
        alert(t.tokenExpired);
      } else {
        alert(t.driveFailed + (msg ? `\n(${msg})` : ""));
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleDriveRestore = async () => {
    if (!isGoogleConfigured()) { alert(t.googleNotConfigured); return; }
    setGoogleBusy(true);
    try {
      const token = await ensureGoogleToken();
      if (!token) { alert(t.signInCancelled); return; }
      const data = await downloadBackupFromDrive(token);
      if (!data) { alert(t.driveNoBackup); return; }
      const payload = data as { profile?: UserProfile };
      await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (payload.profile?.name) {
        setProfile(payload.profile);
        localStorage.setItem("djProfile", JSON.stringify(payload.profile));
      }
      fetchEvents(); fetchReminders(); fetchBankCards();
      alert(t.driveRestoreSuccess);
    } catch (e: unknown) {
      console.error("Drive restore error:", e);
      const msg = e instanceof Error ? e.message : "";
      if (msg === "DRIVE_API_NOT_ENABLED") {
        alert(t.driveApiNotEnabled);
      } else if (msg === "DRIVE_PERMISSION_DENIED") {
        setGoogleToken(null);
        alert(t.drivePermissionDenied);
      } else if (msg === "TOKEN_EXPIRED") {
        setGoogleToken(null);
        alert(t.tokenExpired);
      } else {
        alert(t.driveFailed + (msg ? `\n(${msg})` : ""));
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  // Bank card
  const handleSaveCard = async () => { try { await fetch("/api/bank-cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bankCardForm) }); setShowBankCardModal(false); setBankCardForm({ title: "", cardNumber: "" }); fetchBankCards(); } catch (e) { console.error(e); } };
  const handleDeleteCard = async (id: number) => { try { await fetch(`/api/bank-cards/${id}`, { method: "DELETE" }); fetchBankCards(); } catch (e) { console.error(e); } };

  const evList = Array.isArray(events) ? events : [];
  const remList = Array.isArray(reminders) ? reminders : [];
  const filteredEvents = filterStatus === "all" ? evList : evList.filter(e => e.status === filterStatus);
  const formSteps = [ { title: locale === "fa" ? "اطلاعات اصلی" : "Basic Info", icon: <FileText size={18} /> }, { title: locale === "fa" ? "مشتری" : "Customer", icon: <Users size={18} /> }, { title: locale === "fa" ? "مالی" : "Financial", icon: <DollarSign size={18} /> }, { title: locale === "fa" ? "صوت و نور" : "Sound & Light", icon: <Speaker size={18} /> }, { title: locale === "fa" ? "توضیحات" : "Notes", icon: <Edit3 size={18} /> } ];
  const selectedDateEvents = selectedDate ? evList.filter(e => e.shamsiDate === selectedDate || e.gregorianDate === selectedDate) : [];
  const selectedDateReminders = selectedDate ? remList.filter(r => r.shamsiDate === selectedDate || r.gregorianDate === selectedDate) : [];
  const calData = calendarType === "shamsi" ? getShamsiCalendarDays() : getGregorianCalendarDays();
  const monthName = calendarType === "shamsi" ? `${t.shamsiMonths[shamsiMonth.month - 1]} ${shamsiMonth.year}` : `${t.gregorianMonths[gregMonth.month - 1]} ${gregMonth.year}`;
  const weekDayLabels = [t.sat, t.sun, t.mon, t.tue, t.wed, t.thu, t.fri];
  const ic = "w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30 transition-all";
  const lc = "block text-sm font-medium text-gray-300 mb-1.5";
  const sc = "w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30 transition-all appearance-none";
  const getDayHoliday = (di: CalendarDay) => { if (calendarType === "shamsi" && di.holiday) return { name: locale === "fa" ? di.holiday.faName : di.holiday.enName, isHoliday: di.holiday.isHoliday }; if (calendarType === "gregorian" && di.gregorianHoliday) return { name: locale === "fa" ? di.gregorianHoliday.faName : di.gregorianHoliday.enName, isHoliday: di.gregorianHoliday.isHoliday }; if (calendarType === "shamsi" && di.gregorianHoliday?.isHoliday) return { name: locale === "fa" ? di.gregorianHoliday.faName : di.gregorianHoliday.enName, isHoliday: true }; if (calendarType === "gregorian" && di.holiday?.isHoliday) return { name: locale === "fa" ? di.holiday.faName : di.holiday.enName, isHoliday: true }; return null; };

  // ── Install gate (mobile only) ──
  if (needsInstall === null) {
    return <div className="min-h-screen bg-[#0a0a1a]" />;
  }
  if (needsInstall) {
    return (
      <InstallGate
        locale={locale}
        onLocaleToggle={() => setLocale(locale === "fa" ? "en" : "fa")}
        onSkip={() => {
          try { localStorage.setItem("djInstallBypass", "1"); } catch { /* ignore */ }
          setNeedsInstall(false);
        }}
      />
    );
  }

  // ── Setup ──
  if (showSetup) {
    const googleDone = !!googleUser;
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Language toggle */}
          <div className="flex justify-end mb-3">
            <button
              onClick={() => setLocale(locale === "fa" ? "en" : "fa")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-xs text-purple-300 hover:bg-white/10 hover:border-purple-400/40 transition-all active:scale-95"
            >
              <Globe size={14} />
              {locale === "fa" ? "English" : "فارسی"}
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/50"><Music size={40} className="text-white" /></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent mb-1">{t.appName}</h1>
            <p className="text-gray-400 text-sm">{googleDone ? t.completeProfileDesc : t.enterDJName}</p>
          </div>

          {/* Google account card (after sign-in) */}
          {googleDone && (
            <div className="mb-4 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-4 py-3">
              {googleUser?.picture ? (
                <img src={googleUser.picture} alt="" className="w-9 h-9 rounded-full" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center"><User size={16} className="text-emerald-300" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{googleUser?.name}</p>
                <p className="text-[11px] text-emerald-300 truncate" dir="ltr">{googleUser?.email}</p>
              </div>
              <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
            </div>
          )}

          {/* Google sign-in button (before sign-in) */}
          {!googleDone && (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={googleBusy}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white text-[#1f1f1f] font-semibold text-sm shadow-lg hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.56Z" />
                  <path fill="#34A853" d="M12 24c3.1 0 5.7-1.03 7.6-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.88 1.1-2.99 0-5.52-2.02-6.43-4.73H1.73v2.98A11.99 11.99 0 0 0 12 24Z" />
                  <path fill="#FBBC05" d="M5.57 14.69a7.2 7.2 0 0 1 0-4.6V7.11H1.73a12 12 0 0 0 0 10.56l3.84-2.98Z" />
                  <path fill="#EA4335" d="M12 4.75c1.68 0 3.19.58 4.38 1.72l3.28-3.28C17.7 1.24 15.1 0 12 0 7.3 0 3.25 2.7 1.73 7.11l3.84 2.98C6.48 6.77 9.01 4.75 12 4.75Z" />
                </svg>
                {googleBusy ? "..." : t.signInWithGoogle}
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-gray-500">{t.orEnterManually}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </>
          )}

          {/* Profile fields */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
              <User size={16} className="text-purple-400 flex-shrink-0" />
              <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none" placeholder={`${t.djName} *`} />
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
              <Phone size={16} className="text-blue-400 flex-shrink-0" />
              <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none" placeholder={`${t.phone} *`} dir="ltr" />
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
              <Mail size={16} className="text-emerald-400 flex-shrink-0" />
              <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none" placeholder={t.email} dir="ltr" />
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 flex-shrink-0"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="5" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              <input type="text" value={profile.instagram} onChange={e => setProfile(p => ({ ...p, instagram: e.target.value }))} className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none" placeholder={t.instagram} dir="ltr" />
            </div>

            <GlassButton onClick={handleSetupSubmit} variant="primary" size="lg" className="w-full font-bold" disabled={!profile.name.trim() || !profile.phone.trim()}>
              <CheckCircle size={20} className="inline ml-2" />{googleDone ? t.completeProfile : t.start}
            </GlassButton>

            {(!profile.name.trim() || !profile.phone.trim()) && (
              <p className="text-center text-[10px] text-gray-500">
                * {t.required}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center shadow-lg shadow-purple-500/30"><Music size={18} className="text-white" /></div>
            <div><h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">{t.appName}</h1>{profile.name && <p className="text-[10px] text-gray-400 -mt-0.5">DJ {profile.name}</p>}</div>
          </div>
          <GlassButton onClick={() => setLocale(locale === "fa" ? "en" : "fa")} size="sm"><Globe size={14} className="text-purple-400" /></GlassButton>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-24">
        {/* ═══ DASHBOARD ═══ */}
        {activeTab === "dashboard" && (
          <>
            {/* Clock */}
            <DashboardClock locale={locale} t={t} />
            {/* Today's Holiday/Occasion */}
            {(() => {
              const n = new Date();
              const jt = toJalaali(n.getFullYear(), n.getMonth() + 1, n.getDate());
              const sh = getShamsiHoliday(jt.jm, jt.jd);
              const gh = getGregorianHoliday(n.getMonth() + 1, n.getDate());
              const todayHoliday = sh || gh;
              if (!todayHoliday) return null;
              const name = locale === "fa" ? (sh ? sh.faName : gh!.faName) : (sh ? sh.enName : gh!.enName);
              const isH = todayHoliday.isHoliday;
              return (
                <div className={`mt-3 rounded-2xl p-3 flex items-center gap-2 ${isH ? "bg-red-500/10 border border-red-500/20" : "bg-amber-500/10 border border-amber-500/20"}`}>
                  <span className="text-base">{isH ? "🔴" : "🟡"}</span>
                  <span className={`text-sm font-semibold ${isH ? "text-red-300" : "text-amber-300"}`}>{name}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full ${isH ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>{isH ? t.holiday : t.occasion}</span>
                </div>
              );
            })()}
            {/* Stats */}
            <section className="mt-4 grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-3 text-center"><Calendar size={14} className="text-purple-400 mx-auto mb-1" /><p className="text-xl font-bold text-purple-200">{stats.totalEvents}</p><p className="text-[9px] text-purple-400">{t.totalEvents}</p></div>
              <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-3 text-center"><AlertCircle size={14} className="text-amber-400 mx-auto mb-1" /><p className="text-xl font-bold text-amber-200">{stats.unsettledEvents}</p><p className="text-[9px] text-amber-400">{t.unsettledEvents}</p></div>
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-3 text-center"><Clock size={14} className="text-blue-400 mx-auto mb-1" /><p className="text-xl font-bold text-blue-200">{stats.upcomingCount}</p><p className="text-[9px] text-blue-400">{t.upcomingEvents}</p></div>
            </section>
            {/* Share Button */}
            <GlassButton onClick={() => { generateShareQR(); setShowShareCard(true); }} variant="primary" className="w-full mt-4">
              <Share2 size={16} className="inline ml-2" />{t.share}
            </GlassButton>
            {/* Upcoming Events Box */}
            <section className="mt-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2"><Clock size={14} className="text-purple-400" /><h2 className="text-sm font-bold text-purple-300">{t.upcomingEvents}</h2></div>
                {(!stats?.upcomingEvents || stats.upcomingEvents.length === 0) ? (<div className="p-6 text-center"><Music size={28} className="mx-auto mb-2 text-gray-600" /><p className="text-xs text-gray-500">{t.noEvents}</p></div>) : (
                  <div className="divide-y divide-white/5">{(stats.upcomingEvents || []).slice(0, 2).map(ev => {
                    const ep = ev.gregorianDate.split("-"); const ed = new Date(parseInt(ep[0]), parseInt(ep[1]) - 1, parseInt(ep[2]));
                    const dayOfWeekShamsi = locale === "fa" ? ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"] : ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                    const eDayName = dayOfWeekShamsi[(ed.getDay() + 1) % 7];
                    return (<button key={ev.id} onClick={() => { setSelectedEvent(ev); setShowDetailModal(true); }} className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-all text-right">
                      <div className="w-14 flex-shrink-0 text-center"><p className="text-lg font-bold text-purple-300" dir="ltr">{ev.shamsiDate.split("/").pop()}</p><p className="text-[9px] text-gray-400">{locale === "fa" ? t.shamsiMonths[parseInt(ev.shamsiDate.split("/")[1]) - 1] : t.shamsiMonths[parseInt(ev.shamsiDate.split("/")[1]) - 1]}</p></div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{ev.title || t[ev.eventType as keyof typeof t]}</p><div className="flex items-center gap-2 mt-1 flex-wrap"><span className="text-[10px] text-gray-400">{eDayName}</span><span className="text-[10px] text-purple-400" dir="ltr">{ev.shamsiDate}</span></div>{ev.venue && <div className="flex items-center gap-1 mt-0.5"><MapPin size={10} className="text-red-400 flex-shrink-0" /><span className="text-[10px] text-gray-400 truncate">{ev.venue}</span></div>}</div>
                      <span className={`text-[9px] px-2 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[ev.status] || ""}`}>{t[ev.status as keyof typeof t]}</span>
                    </button>);
                  })}</div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ═══ CALENDAR ═══ */}
        {activeTab === "calendar" && (<section className="mt-4">
            <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><GlassButton onClick={() => switchCalendarType(calendarType === "shamsi" ? "gregorian" : "shamsi")} size="sm"><Calendar size={12} className="inline" /> {calendarType === "shamsi" ? t.shamsiDate : t.gregorianDate}</GlassButton><GlassButton onClick={goToToday} size="sm" variant="primary">{t.today}</GlassButton></div></div>
            <div className="flex items-center gap-4 mb-3 text-[10px]"><div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-gray-400">{t.holiday}</span></div><div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-gray-400">{t.occasion}</span></div><div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-400" /><span className="text-gray-400">{locale === "fa" ? "ایونت" : "Event"}</span></div></div>
            <div className="flex items-center justify-between mb-3"><GlassButton onClick={prevMonth} size="sm"><ChevronLeft size={18} /></GlassButton><button onClick={() => setShowMonthPicker(true)} className="text-base font-bold text-purple-300 hover:text-purple-200 transition-colors cursor-pointer active:scale-95">{monthName}</button><GlassButton onClick={nextMonth} size="sm"><ChevronRight size={18} /></GlassButton></div>
            {calendarType === "gregorian" && <p className="text-center text-[10px] text-gray-500 mb-2">{t.shamsiMonths[shamsiMonth.month - 1]} {shamsiMonth.year}</p>}
            {calendarType === "shamsi" && <p className="text-center text-[10px] text-gray-500 mb-2">{t.gregorianMonths[gregMonth.month - 1]} {gregMonth.year}</p>}
            <div className="grid grid-cols-7 gap-1 mb-1">{weekDayLabels.map((d, i) => <div key={i} className="text-center text-[10px] font-medium text-gray-500 py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: calData.startDayOfWeek }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
              {calData.days.map(di => { const dh = getDayHoliday(di); const isH = dh?.isHoliday; const isO = dh && !dh.isHoliday; let dc = "text-gray-400"; if (di.isToday) dc = "!bg-gradient-to-br !from-purple-600 !to-red-600 !border-purple-400/50 text-white font-bold shadow-lg shadow-purple-500/30"; else if (isH) dc = "!bg-red-500/15 !border-red-400/40 text-red-300"; else if (isO) dc = "!bg-amber-500/10 !border-amber-400/30 text-amber-200"; else if (di.hasEvents) dc = "!border-purple-500/40 text-purple-200";
                return (<div key={di.day} className="relative"><GlassButton onClick={() => handleDayClick(di)} size="sm" className={`aspect-square !rounded-xl flex flex-col items-center justify-center text-sm relative p-0 ${dc}`} onMouseEnter={() => dh && setHolidayTooltip(dh)} onMouseLeave={() => setHolidayTooltip(null)}>
                  <span className="text-[11px] leading-none">{di.day}</span>
                  {calendarType === "shamsi" && <span className="text-[7px] leading-none text-gray-500 mt-0.5" dir="ltr">{di.gd}</span>}
                  {calendarType === "gregorian" && <span className="text-[7px] leading-none text-gray-500 mt-0.5" dir="ltr">{di.jd}</span>}
                  {di.hasEvents && !di.isToday && <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-purple-400" />}
                  {isH && !di.isToday && <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-red-500" />}
                  {isO && !di.isToday && !isH && <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-amber-500" />}
                </GlassButton>{holidayTooltip && dh && holidayTooltip.name === dh.name && (<div className="absolute z-50 bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1a1a2e] border border-white/20 rounded-lg px-2 py-1 text-[9px] shadow-xl"><span className={dh.isHoliday ? "text-red-400" : "text-amber-400"}>{dh.isHoliday ? "🔴 " : "🟡 "}</span>{dh.name}</div>)}</div>); })}
            </div>
            {/* Month Events */}
            {getMonthEvents().length > 0 && (<div className="mt-5"><h3 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2"><List size={12} />{t.thisMonthEvents} ({getMonthEvents().length})</h3><div className="space-y-2">{getMonthEvents().map(ev => (<GlassButton key={ev.id} onClick={() => { setSelectedEvent(ev); setShowDetailModal(true); }} className="w-full !rounded-xl p-3 text-right"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600/30 to-red-600/30 flex items-center justify-center flex-shrink-0">{EVENT_TYPE_ICONS[ev.eventType] || <Music size={14} />}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{ev.title || t[ev.eventType as keyof typeof t]}</p><div className="flex items-center gap-3 mt-0.5"><span className="text-[10px] text-purple-300 flex items-center gap-1"><Calendar size={9} />{ev.shamsiDate}</span>{ev.venue && <span className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={9} />{ev.venue}</span>}</div></div><span className={`text-[9px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${STATUS_COLORS[ev.status] || ""}`}>{t[ev.status as keyof typeof t]}</span></div></GlassButton>))}</div></div>)}
          </section>
        )}

        {/* ═══ EVENTS ═══ */}
        {activeTab === "events" && (<section className="mt-4"><div className="flex items-center gap-2 mb-3"><span className="text-xs text-gray-400">{t.filterByStatus}:</span><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`${sc} text-xs !py-1.5 !px-3`}><option value="all">{t.allStatuses}</option>{STATUSES.map(s => <option key={s} value={s}>{t[s as keyof typeof t]}</option>)}</select></div><div className="space-y-2">{filteredEvents.length === 0 ? <div className="text-center py-12 text-gray-500"><Music size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm">{t.noEvents}</p></div> : filteredEvents.map(ev => (<GlassButton key={ev.id} onClick={() => { setSelectedEvent(ev); setShowDetailModal(true); }} className="w-full !rounded-xl p-3 flex items-center gap-3 text-right"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-red-600/30 flex items-center justify-center flex-shrink-0">{EVENT_TYPE_ICONS[ev.eventType] || <Music size={16} />}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{ev.title || t[ev.eventType as keyof typeof t]}</p><p className="text-xs text-gray-400">{ev.shamsiDate} · {ev.venue || ""}</p></div><span className={`text-[10px] px-2 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[ev.status] || ""}`}>{t[ev.status as keyof typeof t]}</span></GlassButton>))}</div></section>)}

        {/* ═══ SETTINGS ═══ */}
        {activeTab === "settings" && (<section className="mt-4 space-y-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"><h3 className="text-base font-bold text-purple-300 mb-4 flex items-center gap-2"><User size={18} />{t.profile}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2"><User size={14} className="text-purple-400" /><input type="text" value={profile.name} onChange={e => { setProfile(p => ({ ...p, name: e.target.value })); localStorage.setItem("djProfile", JSON.stringify({ ...profile, name: e.target.value })); }} className="flex-1 bg-transparent text-white text-sm focus:outline-none" /></div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2"><Phone size={14} className="text-blue-400" /><input type="tel" value={profile.phone} onChange={e => { setProfile(p => ({ ...p, phone: e.target.value })); localStorage.setItem("djProfile", JSON.stringify({ ...profile, phone: e.target.value })); }} className="flex-1 bg-transparent text-white text-sm focus:outline-none" dir="ltr" /></div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2"><Mail size={14} className="text-emerald-400" /><input type="email" value={profile.email} onChange={e => { setProfile(p => ({ ...p, email: e.target.value })); localStorage.setItem("djProfile", JSON.stringify({ ...profile, email: e.target.value })); }} className="flex-1 bg-transparent text-white text-sm focus:outline-none" dir="ltr" /></div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2"><Globe size={14} className="text-pink-400" /><input type="text" value={profile.instagram} onChange={e => { setProfile(p => ({ ...p, instagram: e.target.value })); localStorage.setItem("djProfile", JSON.stringify({ ...profile, instagram: e.target.value })); }} className="flex-1 bg-transparent text-white text-sm focus:outline-none" dir="ltr" /></div>
              </div>
            </div>
            {/* Google Account + Drive */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 className="text-base font-bold text-purple-300 mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.56Z" /><path fill="#34A853" d="M12 24c3.1 0 5.7-1.03 7.6-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.88 1.1-2.99 0-5.52-2.02-6.43-4.73H1.73v2.98A11.99 11.99 0 0 0 12 24Z" /><path fill="#FBBC05" d="M5.57 14.69a7.2 7.2 0 0 1 0-4.6V7.11H1.73a12 12 0 0 0 0 10.56l3.84-2.98Z" /><path fill="#EA4335" d="M12 4.75c1.68 0 3.19.58 4.38 1.72l3.28-3.28C17.7 1.24 15.1 0 12 0 7.3 0 3.25 2.7 1.73 7.11l3.84 2.98C6.48 6.77 9.01 4.75 12 4.75Z" /></svg>
                {t.googleAccount}
              </h3>
              {googleUser ? (
                <>
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2.5 mb-3">
                    {googleUser.picture ? <img src={googleUser.picture} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><User size={14} className="text-emerald-300" /></div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{googleUser.name}</p>
                      <p className="text-[10px] text-emerald-300 truncate" dir="ltr">{googleUser.email}</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex-shrink-0">{t.connected}</span>
                  </div>
                  <div className="space-y-2">
                    <GlassButton onClick={handleDriveBackup} variant="primary" className="w-full" disabled={googleBusy}>
                      <Upload size={15} className="inline ml-2" />{t.backupToDrive}
                    </GlassButton>
                    <GlassButton onClick={handleDriveRestore} variant="success" className="w-full" disabled={googleBusy}>
                      <Download size={15} className="inline ml-2" />{t.restoreFromDrive}
                    </GlassButton>
                    <GlassButton onClick={handleGoogleDisconnect} className="w-full">
                      <X size={15} className="inline ml-2" />{t.disconnectGoogle}
                    </GlassButton>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] text-gray-400 mb-3">{t.notConnected}</p>
                  <button onClick={handleGoogleSignIn} disabled={googleBusy}
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white text-[#1f1f1f] font-semibold text-sm hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-60">
                    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.56Z" /><path fill="#34A853" d="M12 24c3.1 0 5.7-1.03 7.6-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.88 1.1-2.99 0-5.52-2.02-6.43-4.73H1.73v2.98A11.99 11.99 0 0 0 12 24Z" /><path fill="#FBBC05" d="M5.57 14.69a7.2 7.2 0 0 1 0-4.6V7.11H1.73a12 12 0 0 0 0 10.56l3.84-2.98Z" /><path fill="#EA4335" d="M12 4.75c1.68 0 3.19.58 4.38 1.72l3.28-3.28C17.7 1.24 15.1 0 12 0 7.3 0 3.25 2.7 1.73 7.11l3.84 2.98C6.48 6.77 9.01 4.75 12 4.75Z" /></svg>
                    {googleBusy ? "..." : t.connectGoogle}
                  </button>
                </>
              )}
            </div>

            {/* Notifications */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 className="text-base font-bold text-purple-300 mb-3 flex items-center gap-2">
                <Bell size={18} />{t.notifications}
              </h3>
              <p className="text-[11px] text-gray-400 mb-3">{t.notificationsDesc}</p>
              {notifPerm === "granted" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2.5">
                    <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-xs text-emerald-300">{t.notificationsEnabled}</span>
                  </div>
                  <GlassButton onClick={handleTestNotification} className="w-full">
                    <Bell size={15} className="inline ml-2" />{t.testNotification}
                  </GlassButton>
                </div>
              ) : notifPerm === "denied" ? (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2.5">
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-red-300 leading-relaxed">{t.notificationsBlocked}</span>
                </div>
              ) : notifPerm === "unsupported" ? (
                <p className="text-[11px] text-gray-500">{t.notificationsUnsupported}</p>
              ) : (
                <GlassButton onClick={handleEnableNotifications} variant="primary" className="w-full">
                  <Bell size={15} className="inline ml-2" />{t.enableNotifications}
                </GlassButton>
              )}
            </div>

            {/* Backup (Google Drive only) */}
            {googleUser ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <h3 className="text-base font-bold text-purple-300 mb-4 flex items-center gap-2">
                  <Download size={18} />{t.backup}
                </h3>
                <p className="text-[11px] text-gray-400 mb-3">{locale === "fa" ? "بک‌آپ آنلاین در گوگل درایو — داده‌ها روی گوشی و فضای ابری ذخیره می‌شوند" : "Online backup to Google Drive — data stored on phone and cloud"}</p>
                <div className="space-y-2">
                  <GlassButton onClick={handleDriveBackup} variant="primary" className="w-full" disabled={googleBusy}>
                    <Upload size={15} className="inline ml-2" />{t.backupToDrive}
                  </GlassButton>
                  <GlassButton onClick={handleDriveRestore} variant="success" className="w-full" disabled={googleBusy}>
                    <Download size={15} className="inline ml-2" />{t.restoreFromDrive}
                  </GlassButton>
                </div>
              </div>
            ) : null}

            {/* Bank Cards */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"><h3 className="text-base font-bold text-purple-300 mb-4 flex items-center gap-2"><CardIcon size={18} />{t.bankCards}</h3>
              <div className="space-y-2 mb-3">{bankCards.map(card => (<div key={card.id} className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2"><span className="text-xs font-medium text-purple-300">{card.title}</span><div className="flex items-center gap-1"><GlassButton onClick={() => generateCardQR(card)} size="sm" className="!px-2 !py-1"><QrCode size={12} /></GlassButton><GlassButton onClick={() => { navigator.clipboard.writeText(card.cardNumber); alert(t.copied); }} size="sm" className="!px-2 !py-1"><Copy size={12} /></GlassButton><GlassButton onClick={() => handleDeleteCard(card.id)} size="sm" variant="danger" className="!px-2 !py-1"><Trash2 size={12} /></GlassButton></div></div>
                <p className="text-lg font-mono text-white tracking-widest" dir="ltr">{formatCardNumber(card.cardNumber)}</p>
              </div>))}</div>
              <GlassButton onClick={() => { setBankCardForm({ title: "", cardNumber: "" }); setShowBankCardModal(true); }} variant="primary" className="w-full"><Plus size={14} className="inline ml-1" />{t.addCard}</GlassButton>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"><h3 className="text-base font-bold text-red-300 mb-4 flex items-center gap-2"><AlertCircle size={18} />{t.dangerZone}</h3><GlassButton onClick={() => setShowResetConfirm(true)} variant="danger" className="w-full"><RefreshCw size={16} className="inline ml-2" />{t.resetApp}</GlassButton></div>

            {/* Logout */}
            <GlassButton onClick={() => setShowLogoutConfirm(true)} variant="danger" className="w-full !bg-red-600/25 !border-red-500/40">
              <LogOut size={16} className="inline ml-2" />{t.logout}
            </GlassButton>
          </section>
        )}
      </main>

      {/* ═══ MODALS ═══ */}

      {/* Share Card */}
      {showShareCard && (<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-gradient-to-br from-[#1a0a2e] via-[#1a1a2e] to-[#2e0a1a] rounded-3xl border border-purple-500/30 p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-purple-300">{t.shareCard}</h3><GlassButton onClick={() => setShowShareCard(false)} size="sm"><X size={16} /></GlassButton></div>
          <div className="bg-gradient-to-br from-purple-900/60 to-red-900/40 rounded-2xl p-6 text-center border border-purple-400/20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/40"><Music size={28} className="text-white" /></div>
            <h2 className="text-2xl font-extrabold text-white mb-3">DJ {profile.name}</h2>
            {profile.phone && <p className="text-base font-semibold text-purple-200 flex items-center justify-center gap-2"><Phone size={16} />{profile.phone}</p>}
            {profile.email && <p className="text-base font-semibold text-blue-200 flex items-center justify-center gap-2 mt-2"><Mail size={16} />{profile.email}</p>}
            {profile.instagram && <p className="text-base font-semibold text-pink-200 flex items-center justify-center gap-2 mt-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>@{profile.instagram}</p>}
            {shareQrUrl && <div className="mt-5 bg-white rounded-xl p-3 inline-block"><img src={shareQrUrl} alt="QR" className="w-32 h-32" /></div>}
          </div>
          <div className="flex gap-2 mt-4">
            <GlassButton onClick={() => { navigator.clipboard.writeText(`DJ ${profile.name}\n${profile.phone}\n${profile.email}\n@${profile.instagram}`); alert(t.copied); }} className="flex-1"><Copy size={14} className="inline ml-1" />{t.copyInfo}</GlassButton>
            <GlassButton onClick={() => setShowShareCard(false)} variant="primary" className="flex-1">{t.close}</GlassButton>
          </div>
        </div>
      </div>)}

      {/* Bank Card Modal */}
      {showBankCardModal && (<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#1a1a2e]/90 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-purple-300">{t.addCard}</h3><GlassButton onClick={() => setShowBankCardModal(false)} size="sm"><X size={16} /></GlassButton></div>
          <div className="space-y-3">
            <div><label className={lc}>{t.cardTitle}</label><input type="text" value={bankCardForm.title} onChange={e => setBankCardForm(p => ({ ...p, title: e.target.value }))} className={ic} placeholder={locale === "fa" ? "مثلا: کارت ملی" : "e.g. Main Card"} /></div>
            <div><label className={lc}>{t.cardNumber}</label><input type="text" value={bankCardForm.cardNumber} onChange={e => setBankCardForm(p => ({ ...p, cardNumber: e.target.value.replace(/\D/g, "") }))} className={ic} placeholder="6037************" dir="ltr" maxLength={16} /></div>
            <GlassButton onClick={handleSaveCard} variant="success" className="w-full" disabled={!bankCardForm.title || bankCardForm.cardNumber.length < 16}><CheckCircle size={16} className="inline ml-2" />{t.save}</GlassButton>
          </div>
        </div>
      </div>)}

      {/* Card QR */}
      {showCardQR && selectedCardQR && (<div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-xs bg-[#1a1a2e]/90 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-5 text-center">
          <h3 className="text-base font-bold text-purple-300 mb-2">{selectedCardQR.title}</h3>
          <p className="text-lg font-mono text-white tracking-widest mb-3" dir="ltr">{formatCardNumber(selectedCardQR.cardNumber)}</p>
          <div className="bg-white rounded-xl p-3 inline-block"><img src={cardQrUrl} alt="QR" className="w-36 h-36" /></div>
          <div className="flex gap-2 mt-4"><GlassButton onClick={() => { navigator.clipboard.writeText(selectedCardQR.cardNumber); alert(t.copied); }} className="flex-1"><Copy size={14} className="inline ml-1" />{t.copyCard}</GlassButton><GlassButton onClick={() => setShowCardQR(false)} variant="primary" className="flex-1">{t.close}</GlassButton></div>
        </div>
      </div>)}

      {/* Reminder Modal */}
      {showReminderModal && (<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
        <div className="w-full max-w-lg bg-[#1a1a2e]/90 backdrop-blur-xl rounded-t-3xl border-t border-purple-500/30 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-purple-300"><Bell size={18} className="inline ml-2" />{t.addReminder}</h3><GlassButton onClick={() => setShowReminderModal(false)} size="sm"><X size={16} /></GlassButton></div>
          <div className="space-y-3">
            <div><label className={lc}>{t.reminderTitle}</label><input type="text" value={reminderForm.title} onChange={e => setReminderForm(p => ({ ...p, title: e.target.value }))} className={ic} placeholder={locale === "fa" ? "عنوان قرار" : "Appointment title"} /></div>
            <div><label className={lc}>{t.shamsiDate}</label><input type="text" value={reminderForm.shamsiDate} readOnly className={`${ic} opacity-60`} dir="ltr" /></div>
            <div><label className={lc}>{t.reminderTime}</label><input type="time" value={reminderForm.time} onChange={e => setReminderForm(p => ({ ...p, time: e.target.value }))} className={ic} /></div>
            <div><label className={lc}>{t.notifyBefore}</label><select value={reminderForm.notifyBefore} onChange={e => setReminderForm(p => ({ ...p, notifyBefore: e.target.value }))} className={sc}><option value="0">{locale === "fa" ? "بدون یادآوری" : "No notification"}</option><option value="15">{t.min15}</option><option value="30">{t.min30}</option><option value="60">{t.hour1}</option><option value="120">{t.hour2}</option><option value="1440">{t.day1}</option></select></div>
            <div><label className={lc}>{t.contactName}</label><div className="flex gap-2"><input type="text" value={reminderForm.contactName} onChange={e => setReminderForm(p => ({ ...p, contactName: e.target.value }))} className={ic} placeholder={locale === "fa" ? "نام فرد" : "Contact name"} /><GlassButton onClick={() => handleContactPicker("reminder")} size="md"><Contact size={18} /></GlassButton></div></div>
            <div><label className={lc}>{t.contactPhoneR}</label><input type="tel" value={reminderForm.contactPhone} onChange={e => setReminderForm(p => ({ ...p, contactPhone: e.target.value }))} className={ic} placeholder="09123456789" dir="ltr" /></div>
            <GlassButton onClick={handleSaveReminder} variant="success" className="w-full" disabled={!reminderForm.title}><Bell size={16} className="inline ml-2" />{t.save}</GlassButton>
          </div>
        </div>
      </div>)}

      {/* Month Picker */}
      {showMonthPicker && (<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#1a1a2e]/90 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-purple-300">{t.selectMonth}</h3><GlassButton onClick={() => setShowMonthPicker(false)} size="sm"><X size={16} /></GlassButton></div>
          <div className="flex items-center justify-between mb-4"><GlassButton onClick={() => handleYearChange(-1)} size="sm"><ChevronLeft size={18} /></GlassButton><span className="text-lg font-bold text-white">{calendarType === "shamsi" ? shamsiMonth.year : gregMonth.year}</span><GlassButton onClick={() => handleYearChange(1)} size="sm"><ChevronRight size={18} /></GlassButton></div>
          <div className="grid grid-cols-3 gap-2">{(calendarType === "shamsi" ? t.shamsiMonths : t.gregorianMonths).map((name, i) => { const isC = calendarType === "shamsi" ? shamsiMonth.month === i + 1 : gregMonth.month === i + 1; return <GlassButton key={i} onClick={() => handleMonthPick(i + 1)} variant={isC ? "primary" : "default"} className={`!rounded-xl py-3 ${isC ? "ring-2 ring-purple-400/50" : ""}`}><span className={`text-sm font-medium ${isC ? "text-purple-200" : "text-gray-300"}`}>{name}</span></GlassButton>; })}</div>
        </div>
      </div>)}

      {/* Selected Date Popup */}
      {selectedDate && !showDetailModal && (<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={() => setSelectedDate(null)}>
        <div className="w-full max-w-lg bg-[#1a1a2e]/90 backdrop-blur-xl rounded-t-3xl border-t border-white/10 p-5 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-purple-300">{t.eventsOn} {selectedDate}</h3><GlassButton onClick={() => setSelectedDate(null)} size="sm"><X size={16} /></GlassButton></div>
          {/* Reminders for this date */}
          {selectedDateReminders.length > 0 && (<div className="mb-3"><h4 className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1"><Bell size={12} />{t.reminder}</h4><div className="space-y-1">{selectedDateReminders.map(r => (<div key={r.id} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2"><Bell size={12} className="text-amber-400 flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs font-medium text-amber-200">{r.title}</p>{r.time && <p className="text-[10px] text-gray-400">{r.time}</p>}{r.contactName && <p className="text-[10px] text-gray-400">{r.contactName} · {r.contactPhone}</p>}</div><GlassButton onClick={() => handleDeleteReminder(r.id)} size="sm" variant="danger" className="!px-2 !py-1"><Trash2 size={10} /></GlassButton></div>))}</div></div>)}
          {/* Events */}
          {selectedDateEvents.length === 0 ? <p className="text-sm text-gray-400 text-center py-3">{t.noEvents}</p> : (<div className="space-y-2">{selectedDateEvents.map(ev => (<GlassButton key={ev.id} onClick={() => { setSelectedEvent(ev); setSelectedDate(null); setShowDetailModal(true); }} className="w-full !rounded-xl p-3 flex items-center gap-3 text-right"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-red-600/30 flex items-center justify-center flex-shrink-0">{EVENT_TYPE_ICONS[ev.eventType] || <Music size={16} />}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{ev.title || t[ev.eventType as keyof typeof t]}</p><p className="text-xs text-gray-400">{ev.customerName} · {ev.venue}</p></div></GlassButton>))}</div>)}
          <div className="flex gap-2 mt-3">
            <GlassButton onClick={() => { openNewEventForm(selectedDate); setSelectedDate(null); }} variant="primary" className="flex-1"><Plus size={16} className="inline ml-1" />{t.addEvent}</GlassButton>
            <GlassButton onClick={() => { openReminderForm(selectedDate); setSelectedDate(null); }} className="flex-1"><Bell size={16} className="inline ml-1" />{t.addReminder}</GlassButton>
          </div>
        </div>
      </div>)}

      {/* Event Detail */}
      {showDetailModal && selectedEvent && (<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
        <div className="w-full max-w-lg bg-[#1a1a2e]/90 backdrop-blur-xl rounded-t-3xl border-t border-purple-500/30 max-h-[85vh] overflow-y-auto">
          <div className="sticky top-0 bg-[#1a1a2e]/90 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between z-10"><h3 className="text-lg font-bold text-purple-300">{t.eventDetails}</h3><GlassButton onClick={() => { setShowDetailModal(false); setSelectedEvent(null); }} size="sm"><X size={16} /></GlassButton></div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/40 to-red-600/40 flex items-center justify-center">{EVENT_TYPE_ICONS[selectedEvent.eventType] || <Music size={20} />}</div><div className="flex-1"><p className="text-lg font-bold text-white">{selectedEvent.title || t[selectedEvent.eventType as keyof typeof t]}</p><span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[selectedEvent.status] || ""}`}>{t[selectedEvent.status as keyof typeof t]}</span></div></div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 space-y-2"><div className="flex items-center gap-2 text-sm"><Calendar size={14} className="text-purple-400" /><span className="text-gray-400">{t.shamsiDate}:</span><span className="text-white font-medium">{selectedEvent.shamsiDate}</span></div><div className="flex items-center gap-2 text-sm"><Calendar size={14} className="text-blue-400" /><span className="text-gray-400">{t.gregorianDate}:</span><span className="text-white font-medium">{selectedEvent.gregorianDate}</span></div></div>
            {(selectedEvent.venue || selectedEvent.location) && <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 space-y-2">{selectedEvent.venue && <div className="flex items-center gap-2 text-sm"><MapPin size={14} className="text-red-400" /><span className="text-gray-400">{t.venue}:</span><span className="text-white">{selectedEvent.venue}</span></div>}{selectedEvent.location && <div className="flex items-center gap-2 text-sm"><MapPin size={14} className="text-red-400" /><span className="text-gray-400">{t.location}:</span><span className="text-white">{selectedEvent.location}</span></div>}</div>}
            {(selectedEvent.customerName || selectedEvent.customerPhone || selectedEvent.guestCount > 0) && <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 space-y-2">{selectedEvent.customerName && <div className="flex items-center gap-2 text-sm"><Users size={14} className="text-blue-400" /><span className="text-gray-400">{t.customerName}:</span><span className="text-white">{selectedEvent.customerName}</span></div>}{selectedEvent.customerPhone && <div className="flex items-center gap-2 text-sm"><Phone size={14} className="text-emerald-400" /><span className="text-gray-400">{t.customerPhone}:</span><span className="text-white" dir="ltr">{selectedEvent.customerPhone}</span></div>}{selectedEvent.guestCount > 0 && <div className="flex items-center gap-2 text-sm"><Users size={14} className="text-amber-400" /><span className="text-gray-400">{t.guestCount}:</span><span className="text-white">{selectedEvent.guestCount.toLocaleString()}</span></div>}</div>}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 space-y-2"><div className="flex items-center gap-2 text-sm"><DollarSign size={14} className="text-emerald-400" /><span className="text-gray-400">{t.fee}:</span><span className="text-emerald-300 font-medium">{selectedEvent.fee.toLocaleString()}</span></div><div className="flex items-center gap-2 text-sm"><CreditCard size={14} className="text-blue-400" /><span className="text-gray-400">{t.deposit}:</span><span className="text-blue-300 font-medium">{selectedEvent.deposit.toLocaleString()}</span></div>{selectedEvent.fee - selectedEvent.deposit > 0 && <div className="flex items-center gap-2 text-sm"><AlertCircle size={14} className="text-amber-400" /><span className="text-gray-400">{t.remaining}:</span><span className="text-amber-300 font-bold">{(selectedEvent.fee - selectedEvent.deposit).toLocaleString()}</span></div>}</div>
            {(selectedEvent.soundLightProvider || selectedEvent.soundLightRequirements || selectedEvent.equipmentNeeded) && <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 space-y-2">{selectedEvent.soundLightProvider && <div className="flex items-start gap-2 text-sm"><Speaker size={14} className="text-purple-400 mt-0.5" /><span className="text-gray-400 flex-shrink-0">{t.soundLightProvider}:</span><span className="text-white">{selectedEvent.soundLightProvider}</span></div>}{selectedEvent.soundLightProviderPhone && <div className="flex items-start gap-2 text-sm"><Phone size={14} className="text-blue-400 mt-0.5" /><span className="text-gray-400 flex-shrink-0">{locale === "fa" ? "شماره تامین‌کننده" : "Provider Phone"}:</span><span className="text-white" dir="ltr">{selectedEvent.soundLightProviderPhone}</span></div>}{selectedEvent.soundLightRequirements && <div className="flex items-start gap-2 text-sm"><Lightbulb size={14} className="text-amber-400 mt-0.5" /><span className="text-gray-400 flex-shrink-0">{t.soundLightRequirements}:</span><span className="text-white">{selectedEvent.soundLightRequirements}</span></div>}{selectedEvent.equipmentNeeded && <div className="flex items-start gap-2 text-sm"><Music size={14} className="text-red-400 mt-0.5" /><span className="text-gray-400 flex-shrink-0">{t.equipmentNeeded}:</span><span className="text-white">{selectedEvent.equipmentNeeded}</span></div>}</div>}
            {selectedEvent.description && <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4"><div className="flex items-start gap-2 text-sm"><FileText size={14} className="text-gray-400 mt-0.5" /><p className="text-gray-300 whitespace-pre-wrap">{selectedEvent.description}</p></div></div>}
            <div className="flex gap-3 pt-2"><GlassButton onClick={() => generateEventQR(selectedEvent)} variant="primary" className="flex-1"><QrCode size={16} className="inline ml-2" />QR</GlassButton><GlassButton onClick={() => { setShowDetailModal(false); openEditEventForm(selectedEvent); }} className="flex-1"><Edit3 size={16} className="inline ml-2" />{t.editEvent}</GlassButton><GlassButton onClick={() => setShowDeleteConfirm(true)} variant="danger" className="flex-1"><Trash2 size={16} className="inline ml-2" />{t.delete}</GlassButton></div>
          </div>
        </div>
      </div>)}

      {/* QR Modal */}
      {showQRModal && qrCodeUrl && selectedEvent && (<div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-sm bg-[#1a1a2e]/90 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-6"><div className="text-center mb-4"><h3 className="text-lg font-bold text-purple-300 mb-2">QR Code</h3><p className="text-sm text-gray-400">{selectedEvent.title || t[selectedEvent.eventType as keyof typeof t]}</p></div><div className="bg-white rounded-2xl p-4 mb-4"><img src={qrCodeUrl} alt="QR" className="w-full h-auto" /></div><div className="flex gap-3"><GlassButton onClick={() => { navigator.clipboard.writeText(JSON.stringify({ event: selectedEvent.title, date: selectedEvent.shamsiDate, venue: selectedEvent.venue }, null, 2)); alert(t.copied); }} className="flex-1"><Copy size={16} className="inline ml-2" />{t.copyInfo}</GlassButton><GlassButton onClick={() => setShowQRModal(false)} variant="primary" className="flex-1">{t.close}</GlassButton></div></div></div>)}

      {/* Delete Confirm */}
      {showDeleteConfirm && (<div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-sm bg-[#1a1a2e]/90 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6"><div className="text-center"><div className="w-14 h-14 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-400" /></div><h3 className="text-lg font-bold text-white mb-2">{t.deleteConfirm}</h3><div className="flex gap-3 mt-6"><GlassButton onClick={handleDelete} variant="danger" className="flex-1">{t.yes}</GlassButton><GlassButton onClick={() => setShowDeleteConfirm(false)} className="flex-1">{t.no}</GlassButton></div></div></div></div>)}

      {/* Reset Confirm */}
      {showResetConfirm && (<div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-sm bg-[#1a1a2e]/90 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6"><div className="text-center"><div className="w-14 h-14 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4"><RefreshCw size={24} className="text-red-400" /></div><h3 className="text-lg font-bold text-white mb-2">{t.areYouSure}</h3><p className="text-sm text-gray-400 mb-6">{t.allDataWillBeLost}</p><div className="flex gap-3"><GlassButton onClick={handleReset} variant="danger" className="flex-1">{t.yes}</GlassButton><GlassButton onClick={() => setShowResetConfirm(false)} className="flex-1">{t.no}</GlassButton></div></div></div></div>)}

      {/* Logout Confirm */}
      {showLogoutConfirm && (<div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-sm bg-[#1a1a2e]/90 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6"><div className="text-center"><div className="w-14 h-14 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4"><LogOut size={24} className="text-red-400" /></div><h3 className="text-lg font-bold text-white mb-2">{t.logoutConfirm}</h3><p className="text-sm text-gray-400 mb-6">{t.logoutDesc}</p><div className="flex gap-3"><GlassButton onClick={handleLogout} variant="danger" className="flex-1">{t.yes}</GlassButton><GlassButton onClick={() => setShowLogoutConfirm(false)} className="flex-1">{t.no}</GlassButton></div></div></div></div>)}

      {/* Event Form */}
      {showEventModal && (<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
        <div className="w-full max-w-lg bg-[#1a1a2e]/90 backdrop-blur-xl rounded-t-3xl border-t border-purple-500/30 max-h-[90vh] flex flex-col">
          <div className="sticky top-0 bg-[#1a1a2e]/90 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between z-10"><h3 className="text-lg font-bold text-purple-300">{editingEvent ? t.editEvent : t.newEvent}</h3><GlassButton onClick={() => { setShowEventModal(false); setEditingEvent(null); }} size="sm"><X size={16} /></GlassButton></div>
          <div className="px-4 pt-3 pb-2 flex gap-1.5">{formSteps.map((_, i) => <button key={i} onClick={() => setFormStep(i)} className={`flex-1 h-1.5 rounded-full transition-all ${i === formStep ? "bg-gradient-to-r from-purple-500 to-red-500" : i < formStep ? "bg-purple-600/50" : "bg-white/10"}`} />)}</div>
          <div className="px-4 py-2 flex items-center gap-2"><span className="text-purple-400">{formSteps[formStep].icon}</span><span className="text-sm font-medium text-gray-300">{formSteps[formStep].title}</span></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {formStep === 0 && (<><div><label className={lc}>{t.eventType}</label><select value={formData.eventType} onChange={e => setFormData(p => ({ ...p, eventType: e.target.value }))} className={sc}>{EVENT_TYPES.map(tp => <option key={tp} value={tp}>{t[tp as keyof typeof t]}</option>)}</select></div><div><label className={lc}>{t.title}</label><input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className={ic} placeholder={locale === "fa" ? "عنوان ایونت" : "Event title"} /></div><div><label className={lc}>{t.shamsiDate}</label><input type="text" value={formData.shamsiDate} onChange={e => handleShamsiDateChange(e.target.value)} className={ic} placeholder="1404/03/15" dir="ltr" /></div><div><label className={lc}>{t.gregorianDate}</label><input type="text" value={formData.gregorianDate} onChange={e => setFormData(p => ({ ...p, gregorianDate: e.target.value }))} className={ic} placeholder="2025-06-05" dir="ltr" /></div><div><label className={lc}>{t.venue}</label><input type="text" value={formData.venue} onChange={e => setFormData(p => ({ ...p, venue: e.target.value }))} className={ic} placeholder={locale === "fa" ? "محل برگزاری" : "Venue"} /></div><div><label className={lc}>{t.location}</label><input type="text" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} className={ic} placeholder={locale === "fa" ? "آدرس" : "Address"} /></div><div><label className={lc}>{t.status}</label><select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} className={sc}>{STATUSES.map(s => <option key={s} value={s}>{t[s as keyof typeof t]}</option>)}</select></div></>)}
            {formStep === 1 && (<><div><label className={lc}>{t.customerName}</label><input type="text" value={formData.customerName} onChange={e => setFormData(p => ({ ...p, customerName: e.target.value }))} className={ic} placeholder={locale === "fa" ? "نام مشتری" : "Customer name"} /></div><div><label className={lc}>{t.customerPhone}</label><div className="flex gap-2"><input type="tel" value={formData.customerPhone} onChange={e => setFormData(p => ({ ...p, customerPhone: e.target.value }))} className={ic} placeholder="09123456789" dir="ltr" /><GlassButton onClick={() => handleContactPicker("customer")} size="md"><Contact size={18} /></GlassButton></div></div><div><label className={lc}>{t.guestCount}</label><input type="number" value={formData.guestCount || ""} onChange={e => setFormData(p => ({ ...p, guestCount: parseInt(e.target.value) || 0 }))} className={ic} placeholder={locale === "fa" ? "تعداد مهمان" : "Guest count"} dir="ltr" /></div></>)}
            {formStep === 2 && (<><div><label className={lc}>{t.fee}</label><input type="number" value={formData.fee || ""} onChange={e => setFormData(p => ({ ...p, fee: parseInt(e.target.value) || 0 }))} className={ic} placeholder={locale === "fa" ? "مبلغ (تومان)" : "Fee (Toman)"} dir="ltr" /></div><div><label className={lc}>{t.deposit}</label><input type="number" value={formData.deposit || ""} onChange={e => setFormData(p => ({ ...p, deposit: parseInt(e.target.value) || 0 }))} className={ic} placeholder={locale === "fa" ? "بیعانه (تومان)" : "Deposit (Toman)"} dir="ltr" /></div><div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 rounded-xl p-4"><div className="flex items-center gap-2 text-sm"><AlertCircle size={14} className="text-amber-400" /><span className="text-amber-300">{t.remaining}:</span><span className="text-amber-200 font-bold">{(formData.fee - formData.deposit).toLocaleString()} {locale === "fa" ? "تومان" : "Toman"}</span></div></div></>)}
            {formStep === 3 && (<>
              {/* Toggle */}
              <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2"><Speaker size={16} className="text-purple-400" /><span className="text-sm font-medium text-gray-200">{locale === "fa" ? "نیاز به صوت و نور" : "Need Sound & Light"}</span></div>
                <button type="button" onClick={() => setFormData(p => ({ ...p, soundLightEnabled: !p.soundLightEnabled }))}
                  className={`relative w-12 h-7 rounded-full transition-all duration-300 ${formData.soundLightEnabled ? "bg-purple-600" : "bg-gray-600"}`}>
                  <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${formData.soundLightEnabled ? (isRtl ? "right-0.5" : "left-[22px]") : (isRtl ? "right-[22px]" : "left-0.5")}`} />
                </button>
              </div>
              {formData.soundLightEnabled && (<>
                <div><label className={lc}>{t.soundLightProvider}</label><div className="flex gap-2"><input type="text" value={formData.soundLightProvider} onChange={e => setFormData(p => ({ ...p, soundLightProvider: e.target.value }))} className={ic} placeholder={locale === "fa" ? "نام تامین‌کننده" : "Provider name"} /><GlassButton onClick={() => handleContactPicker("provider")} size="md"><Contact size={18} /></GlassButton></div></div>
                <div><label className={lc}>{locale === "fa" ? "شماره تامین‌کننده" : "Provider Phone"}</label><input type="tel" value={formData.soundLightProviderPhone} onChange={e => setFormData(p => ({ ...p, soundLightProviderPhone: e.target.value }))} className={ic} placeholder="09123456789" dir="ltr" /></div>
                <div><label className={lc}>{t.soundLightRequirements}</label><textarea value={formData.soundLightRequirements} onChange={e => setFormData(p => ({ ...p, soundLightRequirements: e.target.value }))} className={`${ic} min-h-[80px] resize-none`} placeholder={locale === "fa" ? "نیازهای صوت و نور" : "Sound & light requirements"} /></div>
                <div><label className={lc}>{t.equipmentNeeded}</label><textarea value={formData.equipmentNeeded} onChange={e => setFormData(p => ({ ...p, equipmentNeeded: e.target.value }))} className={`${ic} min-h-[80px] resize-none`} placeholder={locale === "fa" ? "لوازم دی‌جی" : "DJ equipment"} /></div>
                <div><label className={lc}>{t.soundLightCost}</label><input type="number" value={formData.soundLightCost || ""} onChange={e => setFormData(p => ({ ...p, soundLightCost: parseInt(e.target.value) || 0 }))} className={ic} placeholder={locale === "fa" ? "هزینه (تومان)" : "Cost (Toman)"} dir="ltr" /></div>
              </>)}
              {!formData.soundLightEnabled && (<div className="text-center py-6"><Speaker size={32} className="mx-auto mb-2 text-gray-600" /><p className="text-xs text-gray-500">{locale === "fa" ? "این برنامه نیاز به تامین‌کننده صوت و نور ندارد" : "This event doesn't need sound & light provider"}</p></div>)}
            </>)}
            {formStep === 4 && (<><div><label className={lc}>{t.description}</label><textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className={`${ic} min-h-[200px] resize-none`} placeholder={locale === "fa" ? "توضیحات..." : "Notes..."} /></div><div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 space-y-2"><h4 className="text-sm font-bold text-purple-300 mb-3">{locale === "fa" ? "خلاصه" : "Summary"}</h4><div className="flex justify-between text-xs"><span className="text-gray-400">{t.eventType}:</span><span className="text-white">{t[formData.eventType as keyof typeof t]}</span></div><div className="flex justify-between text-xs"><span className="text-gray-400">{t.shamsiDate}:</span><span className="text-white" dir="ltr">{formData.shamsiDate}</span></div>{formData.venue && <div className="flex justify-between text-xs"><span className="text-gray-400">{t.venue}:</span><span className="text-white">{formData.venue}</span></div>}{formData.customerName && <div className="flex justify-between text-xs"><span className="text-gray-400">{t.customerName}:</span><span className="text-white">{formData.customerName}</span></div>}<div className="flex justify-between text-xs"><span className="text-gray-400">{t.fee}:</span><span className="text-emerald-300">{formData.fee.toLocaleString()}</span></div><div className="flex justify-between text-xs"><span className="text-gray-400">{t.status}:</span><span className={`px-2 py-0.5 rounded-full text-[10px] border ${STATUS_COLORS[formData.status] || ""}`}>{t[formData.status as keyof typeof t]}</span></div></div></>)}
          </div>
          <div className="sticky bottom-0 bg-[#1a1a2e]/90 backdrop-blur-xl border-t border-white/5 p-4 flex gap-3">
            <GlassButton onClick={() => { setShowEventModal(false); setEditingEvent(null); }} className="flex-1"><ChevronRight size={16} className="inline ml-1" />{locale === "fa" ? "بازگشت" : "Back"}</GlassButton>
            {formStep > 0 && <GlassButton onClick={() => setFormStep(formStep - 1)} className="flex-1"><ChevronRight size={16} className="inline ml-1" />{locale === "fa" ? "قبلی" : "Prev"}</GlassButton>}
            {formStep < formSteps.length - 1 ? <GlassButton onClick={() => setFormStep(formStep + 1)} variant="primary" className="flex-1">{locale === "fa" ? "بعدی" : "Next"}<ChevronLeft size={16} className="inline mr-1" /></GlassButton> : <GlassButton onClick={handleSave} variant="success" className="flex-1"><CheckCircle size={16} className="inline ml-2" />{t.save}</GlassButton>}
          </div>
        </div>
      </div>)}

      {/* FAB */}
      {!showEventModal && !showDetailModal && !showDeleteConfirm && !showResetConfirm && !showLogoutConfirm && !selectedDate && !showQRModal && !showMonthPicker && !showReminderModal && !showBankCardModal && !showShareCard && !showCardQR && activeTab !== "settings" && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30"><GlassButton onClick={() => openNewEventForm()} variant="primary" size="lg" className="shadow-2xl shadow-purple-500/50"><Plus size={22} className="inline ml-2" />{t.newEvent}</GlassButton></div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a1a]/80 backdrop-blur-xl border-t border-white/5 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-around">
          {[{ id: "dashboard", icon: LayoutDashboard, label: t.dashboard }, { id: "calendar", icon: Calendar, label: t.calendar }, { id: "events", icon: List, label: t.allEvents }, { id: "settings", icon: Settings, label: locale === "fa" ? "تنظیمات" : "Settings" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? "text-purple-400" : "text-gray-500"}`}><tab.icon size={20} /><span className="text-[10px]">{tab.label}</span></button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ── Dashboard Clock Component ──
function DashboardClock({ locale, t }: { locale: Locale; t: (typeof translations.fa) | (typeof translations.en); }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const jt = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const shamsiStr = formatJalaaliDate(jt.jy, jt.jm, jt.jd);
  const gregorianStr = formatGregorianDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const dayOfWeekShamsi = locale === "fa" ? ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"] : ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayName = dayOfWeekShamsi[(now.getDay() + 1) % 7];
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return (
    <section className="mt-4">
      <div className="bg-gradient-to-br from-purple-900/50 via-[#1a1a2e] to-red-900/30 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-5 text-center">
        <p className="text-5xl font-extralight tracking-widest text-white mb-1" dir="ltr">{hours}<span className="text-purple-400 animate-pulse">:</span>{minutes}<span className="text-purple-400/50 text-3xl">:{seconds}</span></p>
        <p className="text-sm font-semibold text-purple-300 mb-2">{dayName}</p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5"><Calendar size={12} className="text-purple-400" /><span className="text-xs text-purple-200" dir="ltr">{shamsiStr}</span><span className="text-[9px] text-purple-500">{locale === "fa" ? "شمسی" : "SH"}</span></div>
          <div className="w-px h-3 bg-purple-500/30" />
          <div className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-400" /><span className="text-xs text-blue-200" dir="ltr">{gregorianStr}</span><span className="text-[9px] text-blue-500">{locale === "fa" ? "میلادی" : "GR"}</span></div>
        </div>
      </div>
    </section>
  );
}
