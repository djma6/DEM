"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle, Calendar } from "lucide-react";
import { translations, type Locale } from "@/lib/i18n";
import {
  toJalaali,
  toGregorian,
  jalaaliMonthLength,
  formatJalaaliDate,
  formatGregorianDate,
  todayJalaali,
} from "@/lib/jalaali";
import { getShamsiHoliday, getGregorianHoliday } from "@/lib/holidays";

interface PickerDay {
  day: number;
  jy: number; jm: number; jd: number;
  gy: number; gm: number; gd: number;
  isToday: boolean;
  isSelected: boolean;
  isHoliday: boolean;
  isOccasion: boolean;
  holidayName: string | null;
}

export default function DatePicker({
  locale,
  initialShamsi,
  onSelect,
  onClose,
}: {
  locale: Locale;
  /** "1404/03/15" */
  initialShamsi?: string;
  onSelect: (shamsi: string, gregorian: string) => void;
  onClose: () => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";

  // Parse initial date, fall back to today
  const parseInitial = () => {
    if (initialShamsi) {
      const p = initialShamsi.split("/");
      const jy = parseInt(p[0]), jm = parseInt(p[1]), jd = parseInt(p[2]);
      if (!isNaN(jy) && !isNaN(jm) && !isNaN(jd) && jm >= 1 && jm <= 12) {
        return { jy, jm, jd };
      }
    }
    return todayJalaali();
  };

  const init = parseInitial();
  const [view, setView] = useState<"shamsi" | "gregorian">("shamsi");
  const [sMonth, setSMonth] = useState({ year: init.jy, month: init.jm });
  const [gMonth, setGMonth] = useState(() => {
    const g = toGregorian(init.jy, init.jm, 1);
    return { year: g.gy, month: g.gm };
  });
  const [selected, setSelected] = useState<{ jy: number; jm: number; jd: number }>(init);
  const [showMonthList, setShowMonthList] = useState(false);

  const today = todayJalaali();
  const todayStr = formatJalaaliDate(today.jy, today.jm, today.jd);

  const buildShamsi = (): { days: PickerDay[]; start: number } => {
    const { year, month } = sMonth;
    const len = jalaaliMonthLength(year, month);
    const fg = toGregorian(year, month, 1);
    const start = (new Date(fg.gy, fg.gm - 1, fg.gd).getDay() + 1) % 7;
    const days: PickerDay[] = [];
    for (let d = 1; d <= len; d++) {
      const g = toGregorian(year, month, d);
      const sh = getShamsiHoliday(month, d);
      const gh = getGregorianHoliday(g.gm, g.gd);
      const h = sh || gh;
      days.push({
        day: d,
        jy: year, jm: month, jd: d,
        gy: g.gy, gm: g.gm, gd: g.gd,
        isToday: formatJalaaliDate(year, month, d) === todayStr,
        isSelected: selected.jy === year && selected.jm === month && selected.jd === d,
        isHoliday: Boolean(h?.isHoliday),
        isOccasion: Boolean(h && !h.isHoliday),
        holidayName: h ? (locale === "fa" ? h.faName : h.enName) : null,
      });
    }
    return { days, start };
  };

  const buildGregorian = (): { days: PickerDay[]; start: number } => {
    const { year, month } = gMonth;
    const len = new Date(year, month, 0).getDate();
    const start = (new Date(year, month - 1, 1).getDay() + 1) % 7;
    const days: PickerDay[] = [];
    for (let d = 1; d <= len; d++) {
      let j;
      try { j = toJalaali(year, month, d); } catch { continue; }
      const sh = getShamsiHoliday(j.jm, j.jd);
      const gh = getGregorianHoliday(month, d);
      const h = sh || gh;
      days.push({
        day: d,
        jy: j.jy, jm: j.jm, jd: j.jd,
        gy: year, gm: month, gd: d,
        isToday: formatJalaaliDate(j.jy, j.jm, j.jd) === todayStr,
        isSelected: selected.jy === j.jy && selected.jm === j.jm && selected.jd === j.jd,
        isHoliday: Boolean(h?.isHoliday),
        isOccasion: Boolean(h && !h.isHoliday),
        holidayName: h ? (locale === "fa" ? h.faName : h.enName) : null,
      });
    }
    return { days, start };
  };

  const data = view === "shamsi" ? buildShamsi() : buildGregorian();

  const prev = () => {
    if (view === "shamsi") {
      setSMonth(p => { let y = p.year, m = p.month - 1; if (m < 1) { m = 12; y--; } return { year: y, month: m }; });
    } else {
      setGMonth(p => { let y = p.year, m = p.month - 1; if (m < 1) { m = 12; y--; } return { year: y, month: m }; });
    }
  };
  const next = () => {
    if (view === "shamsi") {
      setSMonth(p => { let y = p.year, m = p.month + 1; if (m > 12) { m = 1; y++; } return { year: y, month: m }; });
    } else {
      setGMonth(p => { let y = p.year, m = p.month + 1; if (m > 12) { m = 1; y++; } return { year: y, month: m }; });
    }
  };

  const switchView = (v: "shamsi" | "gregorian") => {
    if (v === "gregorian") {
      const g = toGregorian(sMonth.year, sMonth.month, 15);
      setGMonth({ year: g.gy, month: g.gm });
    } else {
      const j = toJalaali(gMonth.year, gMonth.month, 15);
      setSMonth({ year: j.jy, month: j.jm });
    }
    setView(v);
  };

  const goToday = () => {
    const jt = todayJalaali();
    setSMonth({ year: jt.jy, month: jt.jm });
    const n = new Date();
    setGMonth({ year: n.getFullYear(), month: n.getMonth() + 1 });
    setSelected(jt);
  };

  const confirm = () => {
    const s = formatJalaaliDate(selected.jy, selected.jm, selected.jd);
    const g = toGregorian(selected.jy, selected.jm, selected.jd);
    onSelect(s, formatGregorianDate(g.gy, g.gm, g.gd));
    onClose();
  };

  const monthLabel = view === "shamsi"
    ? `${t.shamsiMonths[sMonth.month - 1]} ${sMonth.year}`
    : `${t.gregorianMonths[gMonth.month - 1]} ${gMonth.year}`;
  const subLabel = view === "shamsi"
    ? `${t.gregorianMonths[gMonth.month - 1]} ${gMonth.year}`
    : `${t.shamsiMonths[sMonth.month - 1]} ${sMonth.year}`;

  const weekDays = [t.sat, t.sun, t.mon, t.tue, t.wed, t.thu, t.fri];

  // Selected date preview (both calendars)
  const selShamsi = formatJalaaliDate(selected.jy, selected.jm, selected.jd);
  const selG = toGregorian(selected.jy, selected.jm, selected.jd);
  const selGregorian = formatGregorianDate(selG.gy, selG.gm, selG.gd);

  const monthNames = view === "shamsi" ? t.shamsiMonths : t.gregorianMonths;
  const activeYear = view === "shamsi" ? sMonth.year : gMonth.year;
  const activeMonth = view === "shamsi" ? sMonth.month : gMonth.month;
  const setYear = (delta: number) => {
    if (view === "shamsi") setSMonth(p => ({ ...p, year: p.year + delta }));
    else setGMonth(p => ({ ...p, year: p.year + delta }));
  };
  const pickMonth = (m: number) => {
    if (view === "shamsi") setSMonth(p => ({ ...p, month: m }));
    else setGMonth(p => ({ ...p, month: m }));
    setShowMonthList(false);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            <Calendar size={17} />{t.selectDate}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <X size={15} />
          </button>
        </div>

        {/* Calendar type toggle — Shamsi first (priority) */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => switchView("shamsi")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              view === "shamsi"
                ? "bg-gradient-to-r from-purple-600 to-red-600 border-purple-400/50 text-white shadow-lg shadow-purple-500/30"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
            }`}
          >
            {locale === "fa" ? "شمسی" : "Shamsi"}
          </button>
          <button
            onClick={() => switchView("gregorian")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              view === "gregorian"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400/50 text-white shadow-lg shadow-blue-500/30"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
            }`}
          >
            {locale === "fa" ? "میلادی" : "Gregorian"}
          </button>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-1">
          <button onClick={prev} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <ChevronLeft size={17} />
          </button>
          <button onClick={() => setShowMonthList(v => !v)} className="text-sm font-bold text-purple-300 hover:text-purple-200 active:scale-95 transition-all px-3 py-1">
            {monthLabel}
          </button>
          <button onClick={next} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <ChevronRight size={17} />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-500 mb-3">{subLabel}</p>

        {/* Month list dropdown */}
        {showMonthList && (
          <div className="mb-3 bg-white/5 border border-white/10 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setYear(-1)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><ChevronLeft size={14} /></button>
              <span className="text-sm font-bold text-white">{activeYear}</span>
              <button onClick={() => setYear(1)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><ChevronRight size={14} /></button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {monthNames.map((name, i) => (
                <button
                  key={i}
                  onClick={() => pickMonth(i + 1)}
                  className={`py-2 rounded-lg text-[11px] font-medium transition-all ${
                    activeMonth === i + 1
                      ? "bg-purple-600/40 border border-purple-400/50 text-purple-100"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Week days */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-gray-500 py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: data.start }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
          {data.days.map(d => {
            let cls = "text-gray-300 bg-white/5 border-white/10 hover:bg-white/10";
            if (d.isSelected) {
              cls = "bg-gradient-to-br from-purple-600 to-red-600 border-purple-400/60 text-white font-bold shadow-lg shadow-purple-500/40 scale-105";
            } else if (d.isToday) {
              cls = "bg-purple-500/20 border-purple-400/50 text-purple-200 font-bold";
            } else if (d.isHoliday) {
              cls = "bg-red-500/12 border-red-400/30 text-red-300";
            } else if (d.isOccasion) {
              cls = "bg-amber-500/10 border-amber-400/25 text-amber-200";
            }
            return (
              <button
                key={`${d.jy}-${d.jm}-${d.jd}`}
                onClick={() => setSelected({ jy: d.jy, jm: d.jm, jd: d.jd })}
                title={d.holidayName || undefined}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all active:scale-95 ${cls}`}
              >
                <span className="text-[12px] leading-none">{d.day}</span>
                <span className="text-[7px] leading-none opacity-60 mt-0.5" dir="ltr">
                  {view === "shamsi" ? d.gd : d.jd}
                </span>
              </button>
            );
          })}
        </div>

        {/* Today button */}
        <button onClick={goToday} className="w-full mt-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-purple-300 hover:bg-white/10 transition-all">
          {t.today}
        </button>

        {/* Selected preview — Shamsi priority */}
        <div className="mt-3 bg-gradient-to-br from-purple-900/40 to-blue-900/25 border border-purple-400/25 rounded-2xl p-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Calendar size={13} className="text-purple-300" />
            <span className="text-base font-extrabold text-purple-100" dir="ltr">{selShamsi}</span>
            <span className="text-[9px] text-purple-400">{locale === "fa" ? "شمسی" : "SH"}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Calendar size={11} className="text-blue-300" />
            <span className="text-xs font-medium text-blue-200" dir="ltr">{selGregorian}</span>
            <span className="text-[9px] text-blue-400">{locale === "fa" ? "میلادی" : "GR"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all">
            {t.cancel}
          </button>
          <button onClick={confirm} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <CheckCircle size={16} />{t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
