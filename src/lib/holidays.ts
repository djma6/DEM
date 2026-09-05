// Iranian Shamsi holidays and occasions
// Key: "month/day" format (Shamsi)
export interface Holiday {
  month: number;
  day: number;
  faName: string;
  enName: string;
  isHoliday: boolean; // true = official holiday (closed), false = occasion/observance
}

export const shamsiHolidays: Holiday[] = [
  // فروردین - Nowruz season
  { month: 1, day: 1, faName: "نوروز", enName: "Nowruz", isHoliday: true },
  { month: 1, day: 2, faName: "عید نوروز", enName: "Nowruz Holiday", isHoliday: true },
  { month: 1, day: 3, faName: "عید نوروز", enName: "Nowruz Holiday", isHoliday: true },
  { month: 1, day: 4, faName: "عید نوروز", enName: "Nowruz Holiday", isHoliday: true },
  { month: 1, day: 12, faName: "روز جمهوری اسلامی", enName: "Islamic Republic Day", isHoliday: true },
  { month: 1, day: 13, faName: "سیزده‌بدر", enName: "Sizdah Bedar", isHoliday: true },

  // اردیبهشت
  { month: 2, day: 1, faName: "روز بزرگداشت سعدی", enName: "Saadi Day", isHoliday: false },
  { month: 2, day: 2, faName: "روز زمین", enName: "Earth Day", isHoliday: false },
  { month: 2, day: 10, faName: "روز بزرگداشت فردوسی", enName: "Ferdowsi Day", isHoliday: false },
  { month: 2, day: 15, faName: "روز بزرگداشت شیخ بهایی", enName: "Sheikh Baha'i Day", isHoliday: false },

  // خرداد
  { month: 3, day: 1, faName: "روز بزرگداشت ابوسعید ابوالخیر", enName: "Abu Sa'id Abul-Khayr Day", isHoliday: false },
  { month: 3, day: 3, faName: "روز بزرگداشت خواجه نصیر", enName: "Nasir al-Din Tusi Day", isHoliday: false },
  { month: 3, day: 14, faName: "رحلت امام خمینی", enName: "Death of Imam Khomeini", isHoliday: true },
  { month: 3, day: 15, faName: "قیام ۱۵ خرداد", enName: "15 Khordad Uprising", isHoliday: true },

  // تیر
  { month: 4, day: 1, faName: "روز بزرگداشت دکتر علی شریعتی", enName: "Dr. Ali Shariati Day", isHoliday: false },
  { month: 4, day: 7, faName: "روز صنعت و معدن", enName: "Industry & Mining Day", isHoliday: false },
  { month: 4, day: 12, faName: "روز بزرگداشت عطار نیشابوری", enName: "Attar of Nishapur Day", isHoliday: false },
  { month: 4, day: 13, faName: "روز تعاون", enName: "Cooperation Day", isHoliday: false },
  { month: 4, day: 16, faName: "روز مالیات", enName: "Tax Day", isHoliday: false },
  { month: 4, day: 31, faName: "آخرین روز تیرماه (جشن تیرگان)", enName: "Tirgan Festival", isHoliday: false },

  // مرداد
  { month: 5, day: 6, faName: "روز خبرنگار", enName: "Reporter's Day", isHoliday: false },
  { month: 5, day: 7, faName: "روز بزرگداشت محمود دولت‌آبادی", enName: "Mahmoud Dowlatabadi Day", isHoliday: false },
  { month: 5, day: 14, faName: "صدور فرمان مشروطیت", enName: "Constitutional Revolution Day", isHoliday: false },
  { month: 5, day: 28, faName: "روز بزرگداشت علامه امینی", enName: "Allameh Amini Day", isHoliday: false },

  // شهریور
  { month: 6, day: 1, faName: "روز بزرگداشت شهید باهنر", enName: "Martyr Bahonar Day", isHoliday: false },
  { month: 6, day: 5, faName: "روز بزرگداشت محمد ابراهیم همت", enName: "Mohammad Ebrahim Hemmat Day", isHoliday: false },
  { month: 6, day: 8, faName: "روز بزرگداشت شهید فهمیده", enName: "Martyr Fahmideh Day", isHoliday: false },
  { month: 6, day: 11, faName: "روز صنعت چاپ", enName: "Print Industry Day", isHoliday: false },
  { month: 6, day: 14, faName: "روز تعاون", enName: "Cooperatives Day", isHoliday: false },
  { month: 6, day: 17, faName: "روز سینمای ایران", enName: "Iranian Cinema Day", isHoliday: false },
  { month: 6, day: 27, faName: "روز شعر و ادب فارسی", enName: "Persian Poetry & Literature Day", isHoliday: false },
  { month: 6, day: 31, faName: "آخرین روز شهریور (جشن مهرگان)", enName: "Mehrgan Festival", isHoliday: false },

  // مهر
  { month: 7, day: 1, faName: "روز بزرگداشت مولوی", enName: "Rumi Day", isHoliday: false },
  { month: 7, day: 5, faName: "روز بزرگداشت کمال‌الملک", enName: "Kamal-ol-Molk Day", isHoliday: false },
  { month: 7, day: 7, faName: "روز بزرگداشت حافظ", enName: "Hafez Day", isHoliday: false },
  { month: 7, day: 8, faName: "روز بزرگداشت میرزا کوچک خان", enName: "Mirza Kuchak Khan Day", isHoliday: false },
  { month: 7, day: 13, faName: "روز نیروی انتظامی", enName: "Police Day", isHoliday: false },
  { month: 7, day: 20, faName: "روز بزرگداشت حیدر عموغلی", enName: "Heydar Amoughli Day", isHoliday: false },

  // آبان
  { month: 8, day: 1, faName: "روز بزرگداشت استاد سید محمدحسین طباطبایی", enName: "Allameh Tabataba'i Day", isHoliday: false },
  { month: 8, day: 4, faName: "روز بزرگداشت آیت‌الله سعیدی", enName: "Ayatollah Saeedi Day", isHoliday: false },
  { month: 8, day: 5, faName: "روز بزرگداشت خواجوی کرمانی", enName: "Khwaju Kermani Day", isHoliday: false },
  { month: 8, day: 10, faName: "روز بزرگداشت شیخ بهایی", enName: "Sheikh Baha'i Day", isHoliday: false },
  { month: 8, day: 13, faName: "روز دانشجو", enName: "Student Day", isHoliday: false },
  { month: 8, day: 18, faName: "روز کیفیت", enName: "Quality Day", isHoliday: false },

  // آذر
  { month: 9, day: 1, faName: "روز بزرگداشت ابوعلی سینا", enName: "Avicenna Day", isHoliday: false },
  { month: 9, day: 5, faName: "روز بزرگداشت محمد بن زکریای رازی", enName: "Rhazes Day", isHoliday: false },
  { month: 9, day: 7, faName: "روز دانش‌آموز", enName: "Student Day", isHoliday: false },
  { month: 9, day: 10, faName: "روز بزرگدشت صائب تبریزی", enName: "Saeb Tabrizi Day", isHoliday: false },
  { month: 9, day: 13, faName: "روز بیمه", enName: "Insurance Day", isHoliday: false },
  { month: 9, day: 16, faName: "روز دانشجو", enName: "University Student Day", isHoliday: false },
  { month: 9, day: 21, faName: "روز فلسفه", enName: "Philosophy Day", isHoliday: false },
  { month: 9, day: 30, faName: "شب یلدا", enName: "Yalda Night", isHoliday: false },

  // دی
  { month: 10, day: 1, faName: "روز بزرگداشت ابوالقاسم فردوسی", enName: "Ferdowsi Day", isHoliday: false },
  { month: 10, day: 5, faName: "روز ایثار", enName: "Devotion Day", isHoliday: false },
  { month: 10, day: 14, faName: "روز علم و فناوری", enName: "Science & Technology Day", isHoliday: false },
  { month: 10, day: 19, faName: "روز بزرگداشت شهدای قزوین", enName: "Qazvin Martyrs Day", isHoliday: false },

  // بهمن
  { month: 11, day: 2, faName: "روز بزرگداشت شهید فاطمی", enName: "Martyr Fatemi Day", isHoliday: false },
  { month: 11, day: 5, faName: "روز بزرگداشت خوارزمی", enName: "Khwarizmi Day", isHoliday: false },
  { month: 11, day: 7, faName: "روز بزرگداشت سید حسن طائب", enName: "Seyyed Hassan Taib Day", isHoliday: false },
  { month: 11, day: 12, faName: "روز ادبیات کودک و نوجوان", enName: "Children's Literature Day", isHoliday: false },
  { month: 11, day: 19, faName: "روز نیروی هوایی", enName: "Air Force Day", isHoliday: false },
  { month: 11, day: 22, faName: "پیروزی انقلاب اسلامی", enName: "Islamic Revolution Victory", isHoliday: true },

  // اسفند
  { month: 12, day: 5, faName: "روز بزرگداشت خواجه نظام‌الملک", enName: "Nizam al-Mulk Day", isHoliday: false },
  { month: 12, day: 7, faName: "روز مهندسی", enName: "Engineering Day", isHoliday: false },
  { month: 12, day: 9, faName: "روز بزرگداشت شیخ صفی‌الدین اردبیلی", enName: "Sheikh Safi Day", isHoliday: false },
  { month: 12, day: 14, faName: "روز بزرگداشت ملی صنعت نفت", enName: "National Oil Industry Day", isHoliday: false },
  { month: 12, day: 15, faName: "روز درختکاری", enName: "Arbor Day", isHoliday: false },
  { month: 12, day: 19, faName: "روز بزرگداشت شهید مطهری", enName: "Martyr Motahhari Day", isHoliday: false },
  { month: 12, day: 20, faName: "روز بزرگداشت شهید چمران", enName: "Martyr Chamran Day", isHoliday: false },
  { month: 12, day: 29, faName: "روز ملی شدن صنعت نفت", enName: "Oil Nationalization Day", isHoliday: true },
];

// Fixed Gregorian holidays/occasions
export interface GregorianHoliday {
  month: number;
  day: number;
  faName: string;
  enName: string;
  isHoliday: boolean;
}

export const gregorianHolidays: GregorianHoliday[] = [
  { month: 1, day: 1, faName: "سال نو میلادی", enName: "New Year's Day", isHoliday: true },
  { month: 2, day: 14, faName: "روز ولنتاین", enName: "Valentine's Day", isHoliday: false },
  { month: 3, day: 8, faName: "روز زن", enName: "International Women's Day", isHoliday: false },
  { month: 3, day: 21, faName: "نوروز (آغاز بهار)", enName: "Nowruz / Spring Equinox", isHoliday: true },
  { month: 4, day: 1, faName: "روز اول آوریل", enName: "April Fools' Day", isHoliday: false },
  { month: 5, day: 1, faName: "روز کارگر", enName: "International Workers' Day", isHoliday: true },
  { month: 6, day: 21, faName: "جشن تابستان", enName: "Summer Solstice", isHoliday: false },
  { month: 9, day: 22, faName: "جشن پاییز", enName: "Autumn Equinox", isHoliday: false },
  { month: 10, day: 31, faName: "هالووین", enName: "Halloween", isHoliday: false },
  { month: 12, day: 21, faName: "جشن زمستان", enName: "Winter Solstice", isHoliday: false },
  { month: 12, day: 25, faName: "کریسمس", enName: "Christmas", isHoliday: true },
  { month: 12, day: 31, faName: "شب سال نو", enName: "New Year's Eve", isHoliday: false },
];

export function getShamsiHoliday(month: number, day: number): Holiday | null {
  return shamsiHolidays.find((h) => h.month === month && h.day === day) ?? null;
}

export function getShamsiHolidaysForMonth(month: number): Holiday[] {
  return shamsiHolidays.filter((h) => h.month === month);
}

export function getGregorianHoliday(month: number, day: number): GregorianHoliday | null {
  return gregorianHolidays.find((h) => h.month === month && h.day === day) ?? null;
}

export function getGregorianHolidaysForMonth(month: number): GregorianHoliday[] {
  return gregorianHolidays.filter((h) => h.month === month);
}
