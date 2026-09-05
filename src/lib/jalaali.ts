import * as jalaali from "jalaali-js";

export function toJalaali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number };
export function toJalaali(date: Date): { jy: number; jm: number; jd: number };
export function toJalaali(a: number | Date, b?: number, c?: number): { jy: number; jm: number; jd: number } {
  if (a instanceof Date) {
    return jalaali.toJalaali(a.getFullYear(), a.getMonth() + 1, a.getDate());
  }
  return jalaali.toJalaali(a, b!, c!);
}

export function toGregorian(
  jy: number,
  jm: number,
  jd: number
): { gy: number; gm: number; gd: number } {
  return jalaali.toGregorian(jy, jm, jd);
}

export function jalaaliMonthLength(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm);
}

export function isLeapJalaaliYear(jy: number): boolean {
  return jalaali.isLeapJalaaliYear(jy);
}

export function formatJalaaliDate(jy: number, jm: number, jd: number): string {
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

export function formatGregorianDate(gy: number, gm: number, gd: number): string {
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

export function todayJalaali(): { jy: number; jm: number; jd: number } {
  const now = new Date();
  return toJalaali(now);
}

export function todayGregorianStr(): string {
  const now = new Date();
  return formatGregorianDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function jalaaliToDate(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

export function dateToJalaaliStr(dateStr: string): string {
  const parts = dateStr.split("-");
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const { jy, jm, jd } = toJalaali(d);
  return formatJalaaliDate(jy, jm, jd);
}

export function formatNumber(num: number): string {
  return num.toLocaleString("fa-IR");
}

export function formatToman(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}
