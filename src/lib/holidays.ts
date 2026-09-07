// Iranian calendar occasions.
//  • Solar (Shamsi) national days are fixed to a Shamsi month/day.
//  • Religious days follow the lunar Hijri calendar, so they move every year
//    and are resolved dynamically for the requested Shamsi year.
//  • Gregorian occasions are fixed to a Gregorian month/day.

import { toJalaali } from "./jalaali";

/** Visual category — drives the colour + emblem shown in the calendar. */
export type HolidayCategory =
  | "martyrdom" // شهادت — red
  | "birth" // ولادت ائمه — pink
  | "eid" // عید — pink
  | "nowruz" // نوروز — green
  | "national" // ملی / سیاسی
  | "valentine" // ❤️ red + pink
  | "halloween" // 🦇 purple + red
  | "christmas" // 🧦 white + pink + red
  | "seasonal" // فصل‌ها
  | "observance"; // مناسبت‌های عمومی

export interface Holiday {
  month: number;
  day: number;
  faName: string;
  enName: string;
  isHoliday: boolean;
  category: HolidayCategory;
  emoji?: string;
}

export interface GregorianHoliday extends Holiday {}

/* ────────────────────────────────────────────────────────────
   Colour tokens per category (used by the calendar + popups)
   ──────────────────────────────────────────────────────────── */

export interface CategoryStyle {
  /** Calendar cell classes */
  cell: string;
  /** Small dot in the corner of the cell */
  dot: string;
  /** Text colour for names in lists/tooltips */
  text: string;
  /** Chip / banner background */
  chip: string;
}

const STYLES: Record<HolidayCategory, CategoryStyle> = {
  // شهادت — قرمز
  martyrdom: {
    cell: "!bg-red-500/25 !border-red-500/60 !text-red-300 font-bold",
    dot: "bg-red-500",
    text: "text-red-300",
    chip: "bg-red-500/15 border-red-500/30 text-red-300",
  },
  // ولادت ائمه — صورتی
  birth: {
    cell: "!bg-pink-500/25 !border-pink-400/60 !text-pink-200 font-bold",
    dot: "bg-pink-400",
    text: "text-pink-300",
    chip: "bg-pink-500/15 border-pink-400/30 text-pink-300",
  },
  // عیدها — صورتی
  eid: {
    cell: "!bg-pink-500/25 !border-pink-400/60 !text-pink-200 font-bold",
    dot: "bg-pink-400",
    text: "text-pink-300",
    chip: "bg-pink-500/15 border-pink-400/30 text-pink-300",
  },
  // نوروز — سبز
  nowruz: {
    cell: "!bg-emerald-500/25 !border-emerald-400/60 !text-emerald-200 font-bold",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    chip: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
  },
  // ملی — قرمز ملایم
  national: {
    cell: "!bg-red-500/20 !border-red-500/50 !text-red-300 font-bold",
    dot: "bg-red-500",
    text: "text-red-300",
    chip: "bg-red-500/15 border-red-500/30 text-red-300",
  },
  // ولنتاین — قرمز + صورتی
  valentine: {
    cell: "!bg-gradient-to-br !from-red-500/30 !to-pink-500/30 !border-pink-400/60 !text-pink-200 font-bold",
    dot: "bg-gradient-to-br from-red-500 to-pink-400",
    text: "text-pink-300",
    chip: "bg-gradient-to-r from-red-500/20 to-pink-500/20 border-pink-400/30 text-pink-200",
  },
  // هالووین — بنفش + قرمز
  halloween: {
    cell: "!bg-gradient-to-br !from-purple-600/35 !to-red-600/30 !border-purple-400/60 !text-purple-200 font-bold",
    dot: "bg-gradient-to-br from-purple-500 to-red-500",
    text: "text-purple-300",
    chip: "bg-gradient-to-r from-purple-600/20 to-red-600/20 border-purple-400/30 text-purple-200",
  },
  // کریسمس — سفید + صورتی + قرمز
  christmas: {
    cell: "!bg-gradient-to-br !from-white/25 !via-pink-400/25 !to-red-500/30 !border-white/60 !text-white font-bold",
    dot: "bg-gradient-to-br from-white via-pink-300 to-red-500",
    text: "text-pink-100",
    chip: "bg-gradient-to-r from-white/15 via-pink-400/20 to-red-500/20 border-white/30 text-pink-100",
  },
  seasonal: {
    cell: "!bg-amber-500/12 !border-amber-400/35 text-amber-200",
    dot: "bg-amber-400",
    text: "text-amber-300",
    chip: "bg-amber-500/15 border-amber-400/30 text-amber-300",
  },
  observance: {
    cell: "!bg-amber-500/10 !border-amber-400/30 text-amber-200",
    dot: "bg-amber-500",
    text: "text-amber-200",
    chip: "bg-amber-500/15 border-amber-400/30 text-amber-300",
  },
};

export function categoryStyle(category?: HolidayCategory): CategoryStyle {
  return STYLES[category ?? "observance"];
}

/* ────────────────────────────────────────────────────────────
   Fixed solar (Shamsi) occasions
   ──────────────────────────────────────────────────────────── */

export const shamsiHolidays: Holiday[] = [
  /* فروردین */
  { month: 1, day: 1, faName: "عید نوروز", enName: "Nowruz", isHoliday: true, category: "nowruz", emoji: "🌱" },
  { month: 1, day: 2, faName: "عید نوروز", enName: "Nowruz Holiday", isHoliday: true, category: "nowruz", emoji: "🌱" },
  { month: 1, day: 3, faName: "عید نوروز", enName: "Nowruz Holiday", isHoliday: true, category: "nowruz", emoji: "🌱" },
  { month: 1, day: 4, faName: "عید نوروز", enName: "Nowruz Holiday", isHoliday: true, category: "nowruz", emoji: "🌱" },
  { month: 1, day: 12, faName: "روز جمهوری اسلامی", enName: "Islamic Republic Day", isHoliday: true, category: "national" },
  { month: 1, day: 13, faName: "روز طبیعت (سیزده‌بدر)", enName: "Nature Day (Sizdah Bedar)", isHoliday: true, category: "nowruz", emoji: "🌿" },
  { month: 1, day: 19, faName: "روز هنر انقلاب اسلامی", enName: "Revolution Art Day", isHoliday: false, category: "observance" },
  { month: 1, day: 25, faName: "روز بزرگداشت عطار نیشابوری", enName: "Attar of Nishapur Day", isHoliday: false, category: "observance" },

  /* اردیبهشت */
  { month: 2, day: 1, faName: "روز بزرگداشت سعدی", enName: "Saadi Day", isHoliday: false, category: "observance" },
  { month: 2, day: 2, faName: "روز زمین پاک", enName: "Earth Day", isHoliday: false, category: "observance" },
  { month: 2, day: 3, faName: "روز بزرگداشت شیخ بهایی", enName: "Sheikh Baha'i Day", isHoliday: false, category: "observance" },
  { month: 2, day: 10, faName: "روز ملی خلیج فارس", enName: "National Persian Gulf Day", isHoliday: false, category: "observance" },
  { month: 2, day: 12, faName: "روز معلم", enName: "Teacher's Day", isHoliday: false, category: "observance" },
  { month: 2, day: 15, faName: "روز بزرگداشت شیخ صدوق", enName: "Sheikh Saduq Day", isHoliday: false, category: "observance" },
  { month: 2, day: 25, faName: "روز بزرگداشت فردوسی", enName: "Ferdowsi Day", isHoliday: false, category: "observance" },
  { month: 2, day: 27, faName: "روز ارتباطات و روابط عمومی", enName: "Communications Day", isHoliday: false, category: "observance" },
  { month: 2, day: 28, faName: "روز بزرگداشت حکیم عمر خیام", enName: "Omar Khayyam Day", isHoliday: false, category: "observance" },

  /* خرداد */
  { month: 3, day: 1, faName: "روز بهره‌وری", enName: "Productivity Day", isHoliday: false, category: "observance" },
  { month: 3, day: 3, faName: "فتح خرمشهر", enName: "Liberation of Khorramshahr", isHoliday: false, category: "national" },
  { month: 3, day: 4, faName: "روز دزفول", enName: "Dezful Day", isHoliday: false, category: "observance" },
  { month: 3, day: 14, faName: "رحلت امام خمینی", enName: "Passing of Imam Khomeini", isHoliday: true, category: "martyrdom" },
  { month: 3, day: 15, faName: "قیام ۱۵ خرداد", enName: "15 Khordad Uprising", isHoliday: true, category: "national" },
  { month: 3, day: 20, faName: "روز جهانی صنایع دستی", enName: "World Handicrafts Day", isHoliday: false, category: "observance" },
  { month: 3, day: 30, faName: "روز آvárز و صنعت", enName: "Industry Day", isHoliday: false, category: "observance" },

  /* تیر */
  { month: 4, day: 1, faName: "روز اصناف", enName: "Guilds Day", isHoliday: false, category: "observance" },
  { month: 4, day: 7, faName: "روز قوه قضاییه", enName: "Judiciary Day", isHoliday: false, category: "observance" },
  { month: 4, day: 8, faName: "روز مبارزه با سلاح‌های شیمیایی", enName: "Anti-Chemical Weapons Day", isHoliday: false, category: "observance" },
  { month: 4, day: 10, faName: "روز صنعت و معدن", enName: "Industry & Mining Day", isHoliday: false, category: "observance" },
  { month: 4, day: 13, faName: "جشن تیرگان", enName: "Tirgan Festival", isHoliday: false, category: "seasonal", emoji: "💧" },
  { month: 4, day: 14, faName: "روز قلم", enName: "Pen Day", isHoliday: false, category: "observance" },
  { month: 4, day: 25, faName: "روز بهزیستی و تأمین اجتماعی", enName: "Welfare Day", isHoliday: false, category: "observance" },

  /* مرداد */
  { month: 5, day: 6, faName: "روز کارآفرینی", enName: "Entrepreneurship Day", isHoliday: false, category: "observance" },
  { month: 5, day: 8, faName: "روز بزرگداشت شیخ شهاب‌الدین سهروردی", enName: "Suhrawardi Day", isHoliday: false, category: "observance" },
  { month: 5, day: 14, faName: "صدور فرمان مشروطیت", enName: "Constitutional Revolution Day", isHoliday: false, category: "national" },
  { month: 5, day: 17, faName: "روز خبرنگار", enName: "Journalist's Day", isHoliday: false, category: "observance" },
  { month: 5, day: 28, faName: "کودتای ۲۸ مرداد", enName: "28 Mordad Coup", isHoliday: false, category: "national" },
  { month: 5, day: 30, faName: "جشن مردادگان", enName: "Mordadgan Festival", isHoliday: false, category: "seasonal" },

  /* شهریور */
  { month: 6, day: 1, faName: "روز پزشک / بزرگداشت ابوعلی سینا", enName: "Doctor's Day (Avicenna)", isHoliday: false, category: "observance" },
  { month: 6, day: 4, faName: "جشن شهریورگان", enName: "Shahrivargan Festival", isHoliday: false, category: "seasonal" },
  { month: 6, day: 5, faName: "روز بزرگداشت محمد بن زکریای رازی", enName: "Rhazes Day", isHoliday: false, category: "observance" },
  { month: 6, day: 8, faName: "روز مبارزه با تروریسم", enName: "Anti-Terrorism Day", isHoliday: false, category: "observance" },
  { month: 6, day: 11, faName: "روز صنعت چاپ", enName: "Printing Industry Day", isHoliday: false, category: "observance" },
  { month: 6, day: 13, faName: "روز تعاون", enName: "Cooperation Day", isHoliday: false, category: "observance" },
  { month: 6, day: 17, faName: "قیام ۱۷ شهریور", enName: "17 Shahrivar Uprising", isHoliday: false, category: "national" },
  { month: 6, day: 19, faName: "روز بزرگداشت شهریار / شعر و ادب", enName: "Shahriar & Persian Poetry Day", isHoliday: false, category: "observance" },
  { month: 6, day: 27, faName: "روز شعر و ادب پارسی", enName: "Persian Poetry Day", isHoliday: false, category: "observance" },
  { month: 6, day: 31, faName: "آغاز هفته دفاع مقدس", enName: "Sacred Defense Week", isHoliday: false, category: "national" },

  /* مهر */
  { month: 7, day: 5, faName: "روز گردشگری", enName: "Tourism Day", isHoliday: false, category: "observance" },
  { month: 7, day: 7, faName: "روز آتش‌نشانی و ایمنی", enName: "Firefighter's Day", isHoliday: false, category: "observance" },
  { month: 7, day: 8, faName: "روز بزرگداشت مولوی", enName: "Rumi Day", isHoliday: false, category: "observance" },
  { month: 7, day: 13, faName: "روز نیروی انتظامی", enName: "Police Day", isHoliday: false, category: "observance" },
  { month: 7, day: 14, faName: "روز دامپزشکی", enName: "Veterinary Day", isHoliday: false, category: "observance" },
  { month: 7, day: 16, faName: "جشن مهرگان", enName: "Mehrgan Festival", isHoliday: false, category: "seasonal", emoji: "🍂" },
  { month: 7, day: 20, faName: "روز بزرگداشت حافظ", enName: "Hafez Day", isHoliday: false, category: "observance" },
  { month: 7, day: 24, faName: "روز ملی پارالمپیک", enName: "National Paralympic Day", isHoliday: false, category: "observance" },
  { month: 7, day: 26, faName: "روز تربیت بدنی و ورزش", enName: "Physical Education Day", isHoliday: false, category: "observance" },

  /* آبان */
  { month: 8, day: 1, faName: "روز آمار و برنامه‌ریزی", enName: "Statistics Day", isHoliday: false, category: "observance" },
  { month: 8, day: 8, faName: "روز نوجوان / شهادت فهمیده", enName: "Youth Day", isHoliday: false, category: "observance" },
  { month: 8, day: 10, faName: "جشن آبانگان", enName: "Abangan Festival", isHoliday: false, category: "seasonal" },
  { month: 8, day: 13, faName: "روز دانش‌آموز", enName: "Student Day", isHoliday: false, category: "national" },
  { month: 8, day: 14, faName: "روز فرهنگ عمومی", enName: "Public Culture Day", isHoliday: false, category: "observance" },
  { month: 8, day: 18, faName: "روز ملی کیفیت", enName: "National Quality Day", isHoliday: false, category: "observance" },
  { month: 8, day: 24, faName: "روز کتاب و کتاب‌خوانی", enName: "Book Day", isHoliday: false, category: "observance" },

  /* آذر */
  { month: 9, day: 5, faName: "روز بسیج مستضعفان", enName: "Basij Day", isHoliday: false, category: "observance" },
  { month: 9, day: 7, faName: "روز نیروی دریایی", enName: "Navy Day", isHoliday: false, category: "observance" },
  { month: 9, day: 9, faName: "جشن آذرگان", enName: "Azargan Festival", isHoliday: false, category: "seasonal" },
  { month: 9, day: 13, faName: "روز بیمه", enName: "Insurance Day", isHoliday: false, category: "observance" },
  { month: 9, day: 16, faName: "روز دانشجو", enName: "University Student Day", isHoliday: false, category: "national" },
  { month: 9, day: 20, faName: "روز جهانی کوهنوردی", enName: "Mountaineering Day", isHoliday: false, category: "observance" },
  { month: 9, day: 25, faName: "روز پژوهش", enName: "Research Day", isHoliday: false, category: "observance" },
  { month: 9, day: 26, faName: "روز حمل و نقل", enName: "Transportation Day", isHoliday: false, category: "observance" },
  { month: 9, day: 30, faName: "شب یلدا (چله)", enName: "Yalda Night", isHoliday: false, category: "seasonal", emoji: "🍉" },

  /* دی */
  { month: 10, day: 5, faName: "روز ایمنی در برابر زلزله", enName: "Earthquake Safety Day", isHoliday: false, category: "observance" },
  { month: 10, day: 7, faName: "روز بزرگداشت صائب تبریزی", enName: "Saeb Tabrizi Day", isHoliday: false, category: "observance" },
  { month: 10, day: 8, faName: "جشن دیگان", enName: "Deygan Festival", isHoliday: false, category: "seasonal" },
  { month: 10, day: 12, faName: "روز نیروی هوایی ارتش", enName: "Air Force Day", isHoliday: false, category: "observance" },
  { month: 10, day: 20, faName: "روز ثبت احوال", enName: "Civil Registry Day", isHoliday: false, category: "observance" },
  { month: 10, day: 22, faName: "روز بزرگداشت شهدای کرمان", enName: "Kerman Martyrs Day", isHoliday: false, category: "martyrdom" },
  { month: 10, day: 27, faName: "روز بزرگداشت حکیم ابوالقاسم فردوسی", enName: "Ferdowsi Commemoration", isHoliday: false, category: "observance" },

  /* بهمن */
  { month: 11, day: 5, faName: "روز بزرگداشت خوارزمی", enName: "Khwarizmi Day", isHoliday: false, category: "observance" },
  { month: 11, day: 12, faName: "بازگشت امام خمینی به ایران", enName: "Return of Imam Khomeini", isHoliday: false, category: "national" },
  { month: 11, day: 19, faName: "روز نیروی هوایی", enName: "Air Force Day", isHoliday: false, category: "observance" },
  { month: 11, day: 22, faName: "پیروزی انقلاب اسلامی", enName: "Islamic Revolution Victory", isHoliday: true, category: "national" },
  { month: 11, day: 29, faName: "روز اقتصاد مقاومتی", enName: "Resistance Economy Day", isHoliday: false, category: "observance" },
  { month: 11, day: 30, faName: "جشن سپندارمذگان (روز عشق ایرانی)", enName: "Sepandarmazgan (Persian Love Day)", isHoliday: false, category: "valentine", emoji: "❤️" },

  /* اسفند */
  { month: 12, day: 5, faName: "روز بزرگداشت خواجه نصیرالدین طوسی / مهندسی", enName: "Engineering Day", isHoliday: false, category: "observance" },
  { month: 12, day: 8, faName: "روز امور تربیتی", enName: "Education Affairs Day", isHoliday: false, category: "observance" },
  { month: 12, day: 14, faName: "روز احسان و نیکوکاری", enName: "Charity Day", isHoliday: false, category: "observance" },
  { month: 12, day: 15, faName: "روز درختکاری", enName: "Arbor Day", isHoliday: false, category: "seasonal", emoji: "🌳" },
  { month: 12, day: 18, faName: "روز بزرگداشت شهدای هسته‌ای", enName: "Nuclear Martyrs Day", isHoliday: false, category: "martyrdom" },
  { month: 12, day: 25, faName: "روز بزرگداشت پروین اعتصامی", enName: "Parvin Etesami Day", isHoliday: false, category: "observance" },
  { month: 12, day: 29, faName: "روز ملی شدن صنعت نفت", enName: "Oil Nationalization Day", isHoliday: true, category: "national" },
  { month: 12, day: 30, faName: "جشن چهارشنبه‌سوری (پایان سال)", enName: "Year-End Celebration", isHoliday: false, category: "nowruz", emoji: "🔥" },
];

/* ────────────────────────────────────────────────────────────
   Lunar (Hijri) religious occasions — resolved per year
   ──────────────────────────────────────────────────────────── */

interface LunarHoliday {
  hMonth: number;
  hDay: number;
  faName: string;
  enName: string;
  isHoliday: boolean;
  category: HolidayCategory;
  emoji?: string;
}

const LUNAR_HOLIDAYS: LunarHoliday[] = [
  // محرم
  { hMonth: 1, hDay: 9, faName: "تاسوعای حسینی", enName: "Tasua", isHoliday: true, category: "martyrdom" },
  { hMonth: 1, hDay: 10, faName: "عاشورای حسینی", enName: "Ashura", isHoliday: true, category: "martyrdom" },
  // صفر
  { hMonth: 2, hDay: 20, faName: "اربعین حسینی", enName: "Arbaeen", isHoliday: true, category: "martyrdom" },
  { hMonth: 2, hDay: 28, faName: "رحلت پیامبر و شهادت امام حسن مجتبی", enName: "Passing of the Prophet & Martyrdom of Imam Hasan", isHoliday: true, category: "martyrdom" },
  { hMonth: 2, hDay: 30, faName: "شهادت امام رضا (ع)", enName: "Martyrdom of Imam Reza", isHoliday: true, category: "martyrdom" },
  // ربیع‌الاول
  { hMonth: 3, hDay: 8, faName: "شهادت امام حسن عسکری (ع)", enName: "Martyrdom of Imam Hasan Askari", isHoliday: true, category: "martyrdom" },
  { hMonth: 3, hDay: 17, faName: "ولادت پیامبر اکرم و امام صادق (ع)", enName: "Birth of the Prophet & Imam Sadiq", isHoliday: true, category: "birth", emoji: "🌸" },
  // جمادی‌الثانی
  { hMonth: 6, hDay: 3, faName: "شهادت حضرت فاطمه زهرا (س)", enName: "Martyrdom of Fatimah Zahra", isHoliday: true, category: "martyrdom" },
  { hMonth: 6, hDay: 20, faName: "ولادت حضرت فاطمه زهرا (س) / روز زن", enName: "Birth of Fatimah Zahra (Women's Day)", isHoliday: false, category: "birth", emoji: "🌸" },
  // رجب
  { hMonth: 7, hDay: 1, faName: "ولادت امام باقر (ع)", enName: "Birth of Imam Baqir", isHoliday: false, category: "birth", emoji: "🌸" },
  { hMonth: 7, hDay: 13, faName: "ولادت امام علی (ع) / روز پدر", enName: "Birth of Imam Ali (Father's Day)", isHoliday: true, category: "birth", emoji: "🌸" },
  { hMonth: 7, hDay: 27, faName: "مبعث رسول اکرم (ص)", enName: "Prophet's Mission (Mab'ath)", isHoliday: true, category: "eid", emoji: "✨" },
  // شعبان
  { hMonth: 8, hDay: 3, faName: "ولادت امام حسین (ع)", enName: "Birth of Imam Hussein", isHoliday: false, category: "birth", emoji: "🌸" },
  { hMonth: 8, hDay: 15, faName: "ولادت حضرت قائم (عج) — نیمه شعبان", enName: "Birth of Imam Mahdi", isHoliday: true, category: "birth", emoji: "🌸" },
  // رمضان
  { hMonth: 9, hDay: 1, faName: "آغاز ماه رمضان", enName: "Start of Ramadan", isHoliday: false, category: "observance", emoji: "🌙" },
  { hMonth: 9, hDay: 15, faName: "ولادت امام حسن مجتبی (ع)", enName: "Birth of Imam Hasan", isHoliday: false, category: "birth", emoji: "🌸" },
  { hMonth: 9, hDay: 21, faName: "شهادت حضرت علی (ع)", enName: "Martyrdom of Imam Ali", isHoliday: true, category: "martyrdom" },
  // شوال
  { hMonth: 10, hDay: 1, faName: "عید سعید فطر", enName: "Eid al-Fitr", isHoliday: true, category: "eid", emoji: "🌙" },
  { hMonth: 10, hDay: 2, faName: "تعطیل به مناسبت عید فطر", enName: "Eid al-Fitr Holiday", isHoliday: true, category: "eid", emoji: "🌙" },
  { hMonth: 10, hDay: 25, faName: "شهادت امام جعفر صادق (ع)", enName: "Martyrdom of Imam Sadiq", isHoliday: true, category: "martyrdom" },
  // ذی‌القعده
  { hMonth: 11, hDay: 11, faName: "ولادت امام رضا (ع)", enName: "Birth of Imam Reza", isHoliday: false, category: "birth", emoji: "🌸" },
  { hMonth: 11, hDay: 30, faName: "ولادت امام محمد تقی (ع)", enName: "Birth of Imam Jawad", isHoliday: false, category: "birth", emoji: "🌸" },
  // ذی‌الحجه
  { hMonth: 12, hDay: 10, faName: "عید سعید قربان", enName: "Eid al-Adha", isHoliday: true, category: "eid", emoji: "🕋" },
  { hMonth: 12, hDay: 18, faName: "عید سعید غدیر خم", enName: "Eid al-Ghadir", isHoliday: true, category: "eid", emoji: "✨" },
];

/** Convert a Gregorian date to the Umm al-Qura Hijri calendar. */
function gregorianToHijri(date: Date): { hy: number; hm: number; hd: number } | null {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      timeZone: "UTC",
    }).formatToParts(date);
    const get = (type: string) =>
      parseInt(parts.find((p) => p.type === type)?.value.replace(/\D/g, "") || "0", 10);
    const hy = get("year");
    const hm = get("month");
    const hd = get("day");
    if (!hy || !hm || !hd) return null;
    return { hy, hm, hd };
  } catch {
    return null;
  }
}

/** Cache of resolved lunar holidays keyed by Shamsi year. */
const lunarCache = new Map<number, Map<string, LunarHoliday>>();

/**
 * Walks every day of the given Shamsi year, converts it to Hijri and records
 * which Shamsi day each lunar occasion falls on that year.
 */
function buildLunarMap(jy: number): Map<string, LunarHoliday> {
  const cached = lunarCache.get(jy);
  if (cached) return cached;

  const map = new Map<string, LunarHoliday>();
  // Shamsi new year always begins around 20/21 March.
  const start = Date.UTC(jy + 621, 2, 20);
  for (let i = 0; i < 366; i++) {
    const date = new Date(start + i * 86400000);
    const hijri = gregorianToHijri(date);
    if (!hijri) continue;

    let jal: { jy: number; jm: number; jd: number };
    try {
      jal = toJalaali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    } catch {
      continue;
    }
    if (jal.jy !== jy) continue;

    for (const lh of LUNAR_HOLIDAYS) {
      if (lh.hMonth === hijri.hm && lh.hDay === hijri.hd) {
        const key = `${jal.jm}/${jal.jd}`;
        if (!map.has(key)) map.set(key, lh);
      }
    }
  }

  lunarCache.set(jy, map);
  return map;
}

/* ────────────────────────────────────────────────────────────
   Fixed Gregorian occasions
   ──────────────────────────────────────────────────────────── */

export const gregorianHolidays: GregorianHoliday[] = [
  { month: 1, day: 1, faName: "سال نو میلادی", enName: "New Year's Day", isHoliday: true, category: "eid", emoji: "🎉" },
  { month: 2, day: 14, faName: "روز ولنتاین", enName: "Valentine's Day", isHoliday: false, category: "valentine", emoji: "❤️" },
  { month: 3, day: 8, faName: "روز جهانی زن", enName: "International Women's Day", isHoliday: false, category: "observance" },
  { month: 3, day: 21, faName: "نوروز (آغاز بهار)", enName: "Nowruz / Spring Equinox", isHoliday: true, category: "nowruz", emoji: "🌱" },
  { month: 4, day: 22, faName: "روز جهانی زمین", enName: "Earth Day", isHoliday: false, category: "observance" },
  { month: 5, day: 1, faName: "روز جهانی کارگر", enName: "International Workers' Day", isHoliday: true, category: "national" },
  { month: 6, day: 21, faName: "انقلاب تابستانی", enName: "Summer Solstice", isHoliday: false, category: "seasonal", emoji: "☀️" },
  { month: 9, day: 22, faName: "اعتدال پاییزی", enName: "Autumn Equinox", isHoliday: false, category: "seasonal", emoji: "🍂" },
  { month: 10, day: 31, faName: "هالووین", enName: "Halloween", isHoliday: false, category: "halloween", emoji: "🦇" },
  { month: 12, day: 21, faName: "انقلاب زمستانی", enName: "Winter Solstice", isHoliday: false, category: "seasonal", emoji: "❄️" },
  { month: 12, day: 24, faName: "شب کریسمس", enName: "Christmas Eve", isHoliday: false, category: "christmas", emoji: "🧦" },
  { month: 12, day: 25, faName: "کریسمس", enName: "Christmas", isHoliday: true, category: "christmas", emoji: "🧦" },
  { month: 12, day: 31, faName: "شب سال نو میلادی", enName: "New Year's Eve", isHoliday: false, category: "eid", emoji: "🎉" },
];

/* ────────────────────────────────────────────────────────────
   Public lookups
   ──────────────────────────────────────────────────────────── */

/**
 * Returns the occasion for a Shamsi date.
 * Pass `jy` to also resolve moving religious (lunar) occasions.
 */
export function getShamsiHoliday(
  month: number,
  day: number,
  jy?: number
): Holiday | null {
  const fixed = shamsiHolidays.find((h) => h.month === month && h.day === day) ?? null;

  // Official national days (Nowruz, Revolution Day, …) win over a moving
  // lunar occasion that happens to land on the same Shamsi day.
  if (fixed?.isHoliday) return fixed;

  if (jy) {
    const lunar = buildLunarMap(jy).get(`${month}/${day}`);
    if (lunar) {
      return {
        month,
        day,
        faName: lunar.faName,
        enName: lunar.enName,
        isHoliday: lunar.isHoliday,
        category: lunar.category,
        emoji: lunar.emoji,
      };
    }
  }

  return fixed;
}

export function getShamsiHolidaysForMonth(month: number): Holiday[] {
  return shamsiHolidays.filter((h) => h.month === month);
}

export function getGregorianHoliday(
  month: number,
  day: number
): GregorianHoliday | null {
  return gregorianHolidays.find((h) => h.month === month && h.day === day) ?? null;
}

export function getGregorianHolidaysForMonth(month: number): GregorianHoliday[] {
  return gregorianHolidays.filter((h) => h.month === month);
}
