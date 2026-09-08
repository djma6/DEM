"use client";

import React from "react";
import { Plus, Trash2, Contact, ListPlus, Wallet } from "lucide-react";
import { translations, type Locale } from "@/lib/i18n";
import type { MusicianLine, ProviderLine, ColleagueLine } from "@/lib/eventLines";
import { EQUIPMENT_TYPES, equipmentLabel } from "./RosterSections";
import { COLLEAGUE_ROLES, roleLabel } from "./ColleagueParts";

type T = (typeof translations)["fa"] | (typeof translations)["en"];

const inputCls =
  "w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50 transition-all";
const labelCls = "block text-xs font-medium text-gray-300 mb-1.5";

/** Header shown above each row, with its index and a remove button. */
function RowHeader({
  index, accent, label, onRemove, t,
}: {
  index: number;
  accent: string;
  label: string;
  onRemove: () => void;
  t: T;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className={`text-[11px] font-bold ${accent}`}>
        {label} {index + 1}
      </span>
      <button
        type="button"
        onClick={onRemove}
        title={t.removeItem}
        className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-400/25 flex items-center justify-center text-red-300 hover:bg-red-500/25 transition-all"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

/** The two buttons under every list: pick from saved, or add a blank row. */
function AddRowButtons({
  savedCount, accentClasses, onPickSaved, onAddBlank, t,
}: {
  savedCount: number;
  accentClasses: string;
  onPickSaved: () => void;
  onAddBlank: () => void;
  t: T;
}) {
  return (
    <div className={`grid ${savedCount > 0 ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
      {savedCount > 0 && (
        <button
          type="button"
          onClick={onPickSaved}
          className={`py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all ${accentClasses}`}
        >
          <ListPlus size={14} />{t.addFromSaved}
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/15">{savedCount}</span>
        </button>
      )}
      <button
        type="button"
        onClick={onAddBlank}
        className="py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200 flex items-center justify-center gap-1.5 hover:bg-white/10 active:scale-[0.98] transition-all"
      >
        <Plus size={14} />{t.addManually}
      </button>
    </div>
  );
}

function TotalRow({ total, t }: { total: number; t: T }) {
  if (total <= 0) return null;
  return (
    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-400/25 rounded-xl px-3 py-2">
      <span className="text-[11px] text-amber-300 flex items-center gap-1">
        <Wallet size={11} />{t.totalCost}
      </span>
      <span className="text-sm font-bold text-amber-200" dir="ltr">{total.toLocaleString()}</span>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="text-center text-[11px] text-gray-500 py-3">{text}</p>
  );
}

/* ═══════════ Sound & light providers ═══════════ */

export function ProviderLinesEditor({
  locale, lines, savedCount, onChange, onPickSaved,
}: {
  locale: Locale;
  lines: ProviderLine[];
  savedCount: number;
  onChange: (next: ProviderLine[]) => void;
  onPickSaved: () => void;
}) {
  const t = translations[locale];
  const update = (i: number, patch: Partial<ProviderLine>) =>
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const remove = (i: number) => onChange(lines.filter((_, idx) => idx !== i));
  const total = lines.reduce((sum, l) => sum + (Number(l.cost) || 0), 0);

  return (
    <div className="space-y-3">
      {lines.length === 0 && <EmptyRow text={t.noItemsYet} />}

      {lines.map((line, i) => (
        <div key={i} className="bg-blue-500/8 border border-blue-400/25 rounded-2xl p-3 space-y-2.5">
          <RowHeader index={i} accent="text-blue-300" label={t.soundLightProvider} onRemove={() => remove(i)} t={t} />
          <div>
            <label className={labelCls}>{t.providerName}</label>
            <input type="text" value={line.name} onChange={e => update(i, { name: e.target.value })} className={inputCls} placeholder={t.providerName} />
          </div>
          <div>
            <label className={labelCls}>{t.equipmentType}</label>
            <select value={line.service} onChange={e => update(i, { service: e.target.value })} className={`${inputCls} appearance-none cursor-pointer`}>
              {EQUIPMENT_TYPES.map(key => (
                <option key={key} value={key} className="bg-[#1a1a2e]">{equipmentLabel(key, t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t.providerPhone}</label>
            <input type="tel" value={line.phone} onChange={e => update(i, { phone: e.target.value })} className={inputCls} placeholder="09123456789" dir="ltr" inputMode="tel" />
          </div>
          <div>
            <label className={labelCls}>{t.soundLightCost}</label>
            <input type="number" value={line.cost || ""} onChange={e => update(i, { cost: parseInt(e.target.value) || 0 })} className={inputCls} placeholder="0" dir="ltr" inputMode="numeric" />
          </div>
        </div>
      ))}

      <TotalRow total={total} t={t} />
      <AddRowButtons
        savedCount={savedCount}
        accentClasses="bg-gradient-to-r from-blue-600/25 to-purple-600/25 border-blue-400/40 text-blue-100"
        onPickSaved={onPickSaved}
        onAddBlank={() => onChange([...lines, { name: "", phone: "", service: "soundLight", cost: 0 }])}
        t={t}
      />
    </div>
  );
}

/* ═══════════ Musicians ═══════════ */

export function MusicianLinesEditor({
  locale, lines, savedCount, onChange, onPickSaved, onPickContact,
}: {
  locale: Locale;
  lines: MusicianLine[];
  savedCount: number;
  onChange: (next: MusicianLine[]) => void;
  onPickSaved: () => void;
  onPickContact: (index: number) => void;
}) {
  const t = translations[locale];
  const update = (i: number, patch: Partial<MusicianLine>) =>
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const remove = (i: number) => onChange(lines.filter((_, idx) => idx !== i));
  const total = lines.reduce((sum, l) => sum + (Number(l.fee) || 0), 0);

  return (
    <div className="space-y-3">
      {lines.length === 0 && <EmptyRow text={t.noItemsYet} />}

      {lines.map((line, i) => (
        <div key={i} className="bg-pink-500/8 border border-pink-400/25 rounded-2xl p-3 space-y-2.5">
          <RowHeader index={i} accent="text-pink-300" label={t.musicianName} onRemove={() => remove(i)} t={t} />
          <div>
            <label className={labelCls}>{t.musicianName}</label>
            <input type="text" value={line.name} onChange={e => update(i, { name: e.target.value })} className={inputCls} placeholder={t.musicianName} />
          </div>
          <div>
            <label className={labelCls}>{t.instrument}</label>
            <input type="text" value={line.instrument} onChange={e => update(i, { instrument: e.target.value })} className={inputCls} placeholder={locale === "fa" ? "مثلا: تنبک، ویولن" : "e.g. Violin"} />
          </div>
          <div>
            <label className={labelCls}>{t.musicianPhone}</label>
            <div className="flex gap-2">
              <input type="tel" value={line.phone} onChange={e => update(i, { phone: e.target.value })} className={inputCls} placeholder="09123456789" dir="ltr" inputMode="tel" />
              <button type="button" onClick={() => onPickContact(i)} className="px-4 rounded-2xl bg-white/5 border border-white/10 text-purple-300 hover:bg-white/10 active:scale-95 transition-all">
                <Contact size={18} />
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>{t.musicianFee}</label>
            <input type="number" value={line.fee || ""} onChange={e => update(i, { fee: parseInt(e.target.value) || 0 })} className={inputCls} placeholder="0" dir="ltr" inputMode="numeric" />
          </div>
        </div>
      ))}

      <TotalRow total={total} t={t} />
      <AddRowButtons
        savedCount={savedCount}
        accentClasses="bg-gradient-to-r from-pink-600/25 to-purple-600/25 border-pink-400/40 text-pink-100"
        onPickSaved={onPickSaved}
        onAddBlank={() => onChange([...lines, { name: "", instrument: "", phone: "", fee: 0 }])}
        t={t}
      />
    </div>
  );
}

/* ═══════════ DJs & colleagues ═══════════ */

export function ColleagueLinesEditor({
  locale, lines, savedCount, onChange, onPickSaved, onPickContact,
}: {
  locale: Locale;
  lines: ColleagueLine[];
  savedCount: number;
  onChange: (next: ColleagueLine[]) => void;
  onPickSaved: () => void;
  onPickContact: (index: number) => void;
}) {
  const t = translations[locale];
  const update = (i: number, patch: Partial<ColleagueLine>) =>
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const remove = (i: number) => onChange(lines.filter((_, idx) => idx !== i));
  const total = lines.reduce((sum, l) => sum + (Number(l.fee) || 0), 0);

  return (
    <div className="space-y-3">
      {lines.length === 0 && <EmptyRow text={t.noItemsYet} />}

      {lines.map((line, i) => (
        <div key={i} className="bg-indigo-500/8 border border-indigo-400/25 rounded-2xl p-3 space-y-2.5">
          <RowHeader index={i} accent="text-indigo-300" label={t.colleagueName} onRemove={() => remove(i)} t={t} />
          <div>
            <label className={labelCls}>{t.colleagueName}</label>
            <input type="text" value={line.name} onChange={e => update(i, { name: e.target.value })} className={inputCls} placeholder={t.colleagueName} />
          </div>
          <div>
            <label className={labelCls}>{t.colleagueRole}</label>
            <select value={line.role} onChange={e => update(i, { role: e.target.value })} className={`${inputCls} appearance-none cursor-pointer`}>
              {COLLEAGUE_ROLES.map(r => (
                <option key={r} value={r} className="bg-[#1a1a2e]">{roleLabel(r, t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t.colleaguePhone}</label>
            <div className="flex gap-2">
              <input type="tel" value={line.phone} onChange={e => update(i, { phone: e.target.value })} className={inputCls} placeholder="09123456789" dir="ltr" inputMode="tel" />
              <button type="button" onClick={() => onPickContact(i)} className="px-4 rounded-2xl bg-white/5 border border-white/10 text-purple-300 hover:bg-white/10 active:scale-95 transition-all">
                <Contact size={18} />
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>{t.colleagueFee}</label>
            <input type="number" value={line.fee || ""} onChange={e => update(i, { fee: parseInt(e.target.value) || 0 })} className={inputCls} placeholder="0" dir="ltr" inputMode="numeric" />
          </div>
        </div>
      ))}

      <TotalRow total={total} t={t} />
      <AddRowButtons
        savedCount={savedCount}
        accentClasses="bg-gradient-to-r from-indigo-600/25 to-purple-600/25 border-indigo-400/40 text-indigo-100"
        onPickSaved={onPickSaved}
        onAddBlank={() => onChange([...lines, { name: "", role: "dj", phone: "", fee: 0 }])}
        t={t}
      />
    </div>
  );
}
