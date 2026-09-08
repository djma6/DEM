"use client";

import React, { useState } from "react";
import {
  Music2, Speaker, Plus, X, Contact, Trash2, Edit3, CheckCircle,
  ChevronUp, ChevronDown, Phone, Search, Wallet,
} from "lucide-react";
import { translations, type Locale } from "@/lib/i18n";
import type { LocalMusician, LocalSoundProvider } from "@/lib/localStore";

type T = (typeof translations)["fa"] | (typeof translations)["en"];

export interface MusicianDraft {
  fullName: string;
  instrument: string;
  phone: string;
  fee: number;
}
export const EMPTY_MUSICIAN: MusicianDraft = {
  fullName: "",
  instrument: "",
  phone: "",
  fee: 0,
};

/** Service types a sound & light provider can offer. */
export const EQUIPMENT_TYPES = [
  "sound", "light", "soundLight", "cityTv", "danceFloor", "dutchStage",
  "balloons", "barServing", "djRental", "ceremony", "services",
  "operator", "artGroup",
] as const;
export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

export function equipmentLabel(key: string, t: T): string {
  switch (key) {
    case "sound": return t.eqSound;
    case "light": return t.eqLight;
    case "soundLight": return t.eqSoundLight;
    case "cityTv": return t.eqCityTv;
    case "danceFloor": return t.eqDanceFloor;
    case "dutchStage": return t.eqDutchStage;
    case "balloons": return t.eqBalloons;
    case "barServing": return t.eqBarServing;
    case "djRental": return t.eqDjRental;
    case "ceremony": return t.eqCeremony;
    case "services": return t.eqServices;
    case "operator": return t.eqOperator;
    case "artGroup": return t.eqArtGroup;
    default: return key;
  }
}

export interface ProviderDraft {
  name: string;
  phone: string;
  /** Service type key from EQUIPMENT_TYPES */
  equipment: string;
}
export const EMPTY_PROVIDER: ProviderDraft = {
  name: "",
  phone: "",
  equipment: "soundLight",
};

const inputCls =
  "w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50 transition-all";
const labelCls = "block text-sm font-medium text-gray-300 mb-1.5";

/* ═══════════════ Musicians ═══════════════ */

export function MusiciansSection({
  locale, musicians, onAdd, onEdit, onDelete,
}: {
  locale: Locale;
  musicians: LocalMusician[];
  onAdd: () => void;
  onEdit: (m: LocalMusician) => void;
  onDelete: (id: number) => void;
}) {
  const t = translations[locale];
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <h3 className="text-base font-bold text-purple-300 flex items-center gap-2 mb-1">
        <Music2 size={18} />{t.musicians}
        {musicians.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
            {musicians.length}
          </span>
        )}
      </h3>
      <p className="text-[11px] text-gray-400 mb-3">{t.musiciansDesc}</p>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onAdd}
          className="py-3 rounded-2xl bg-gradient-to-r from-purple-500/25 to-blue-500/25 border border-purple-400/40 text-xs font-bold text-purple-100 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <Plus size={14} />{t.addMusician}
        </button>
        <button
          onClick={() => setOpen(v => !v)}
          className="py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200 flex items-center justify-center gap-1.5 hover:bg-white/10 active:scale-[0.98] transition-all"
        >
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {open ? t.hideCustomers : t.showMusicians}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          {musicians.length === 0 ? (
            <div className="text-center py-6">
              <Music2 size={26} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">{t.noMusicians}</p>
            </div>
          ) : (
            musicians.map(m => (
              <div key={m.id} className="bg-gradient-to-r from-purple-900/25 to-pink-900/20 border border-purple-500/20 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{m.fullName}</p>
                    <p className="text-[11px] text-pink-300 truncate mt-0.5">{m.instrument}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onEdit(m)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-300 hover:bg-white/10 transition-all">
                      <Edit3 size={11} />
                    </button>
                    <button onClick={() => onDelete(m.id)} className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-400/25 flex items-center justify-center text-red-300 hover:bg-red-500/25 transition-all">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <a href={`tel:${m.phone}`} className="text-[11px] text-emerald-300 flex items-center gap-1 hover:text-emerald-200" dir="ltr">
                    <Phone size={10} />{m.phone}
                  </a>
                  {m.fee > 0 && (
                    <span className="text-[11px] text-amber-300 flex items-center gap-1">
                      <Wallet size={10} />{m.fee.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function MusicianFormModal({
  locale, draft, setDraft, isEditing, busy, onPickContact, onSave, onClose,
}: {
  locale: Locale;
  draft: MusicianDraft;
  setDraft: React.Dispatch<React.SetStateAction<MusicianDraft>>;
  isEditing: boolean;
  busy?: boolean;
  onPickContact: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";
  const canSave =
    draft.fullName.trim().length > 0 &&
    draft.instrument.trim().length > 0 &&
    draft.phone.trim().length > 0;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-purple-500/30 p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            <Music2 size={17} />{isEditing ? t.editMusician : t.addMusician}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelCls}>{t.musicianName} *</label>
            <input type="text" value={draft.fullName} onChange={e => setDraft(p => ({ ...p, fullName: e.target.value }))} className={inputCls} placeholder={t.musicianName} />
          </div>
          <div>
            <label className={labelCls}>{t.instrument} *</label>
            <input type="text" value={draft.instrument} onChange={e => setDraft(p => ({ ...p, instrument: e.target.value }))} className={inputCls} placeholder={locale === "fa" ? "مثلا: تنبک، ویولن، سنتور" : "e.g. Violin, Percussion"} />
          </div>
          <div>
            <label className={labelCls}>{t.musicianPhone} *</label>
            <div className="flex gap-2">
              <input type="tel" value={draft.phone} onChange={e => setDraft(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="09123456789" dir="ltr" inputMode="tel" />
              <button onClick={onPickContact} title={t.chooseFromContacts} className="px-4 rounded-2xl bg-white/5 border border-white/10 text-purple-300 hover:bg-white/10 active:scale-95 transition-all">
                <Contact size={18} />
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>{t.musicianFee}</label>
            <input type="number" value={draft.fee || ""} onChange={e => setDraft(p => ({ ...p, fee: parseInt(e.target.value) || 0 }))} className={inputCls} placeholder="0" dir="ltr" inputMode="numeric" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all">{t.cancel}</button>
            <button onClick={onSave} disabled={!canSave || busy} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50">
              <CheckCircle size={15} />{busy ? "..." : t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MusicianPickerModal({
  locale, musicians, onSelect, onClose,
}: {
  locale: Locale;
  musicians: LocalMusician[];
  onSelect: (m: LocalMusician) => void;
  onClose: () => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";
  const [query, setQuery] = useState("");

  const filtered = musicians.filter(m => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return m.fullName.toLowerCase().includes(q) || m.instrument.toLowerCase().includes(q) || m.phone.includes(q);
  });

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-purple-500/30 p-5 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            <Music2 size={17} />{t.chooseMusician}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <X size={15} />
          </button>
        </div>

        {musicians.length > 0 && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5 mb-3">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={t.searchCustomer} className="flex-1 bg-transparent text-white text-sm focus:outline-none" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <Music2 size={26} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">{t.noMusicians}</p>
            </div>
          ) : (
            filtered.map(m => (
              <button key={m.id} onClick={() => { onSelect(m); onClose(); }} className="w-full text-right bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 active:scale-[0.99] transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{m.fullName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-pink-300">{m.instrument}</span>
                      <span className="text-[11px] text-emerald-300" dir="ltr">{m.phone}</span>
                    </div>
                  </div>
                  {m.fee > 0 && (
                    <span className="text-[10px] text-amber-300 flex-shrink-0" dir="ltr">{m.fee.toLocaleString()}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Sound & light providers ═══════════════ */

export function ProvidersSection({
  locale, providers, onAdd, onEdit, onDelete,
}: {
  locale: Locale;
  providers: LocalSoundProvider[];
  onAdd: () => void;
  onEdit: (p: LocalSoundProvider) => void;
  onDelete: (id: number) => void;
}) {
  const t = translations[locale];
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <h3 className="text-base font-bold text-purple-300 flex items-center gap-2 mb-1">
        <Speaker size={18} />{t.savedProviders}
        {providers.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
            {providers.length}
          </span>
        )}
      </h3>
      <p className="text-[11px] text-gray-400 mb-3">{t.savedProvidersDesc}</p>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onAdd} className="py-3 rounded-2xl bg-gradient-to-r from-purple-500/25 to-blue-500/25 border border-purple-400/40 text-xs font-bold text-purple-100 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
          <Plus size={14} />{t.addProvider}
        </button>
        <button onClick={() => setOpen(v => !v)} className="py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200 flex items-center justify-center gap-1.5 hover:bg-white/10 active:scale-[0.98] transition-all">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {open ? t.hideCustomers : t.showProviders}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          {providers.length === 0 ? (
            <div className="text-center py-6">
              <Speaker size={26} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">{t.noProviders}</p>
            </div>
          ) : (
            providers.map(pv => (
              <div key={pv.id} className="bg-gradient-to-r from-blue-900/25 to-purple-900/20 border border-blue-500/20 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{pv.name}</p>
                    {pv.equipment && (
                      <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full border bg-blue-500/15 border-blue-400/30 text-blue-300">
                        {equipmentLabel(pv.equipment, t)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onEdit(pv)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-300 hover:bg-white/10 transition-all">
                      <Edit3 size={11} />
                    </button>
                    <button onClick={() => onDelete(pv.id)} className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-400/25 flex items-center justify-center text-red-300 hover:bg-red-500/25 transition-all">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <a href={`tel:${pv.phone}`} className="text-[11px] text-emerald-300 flex items-center gap-1 hover:text-emerald-200" dir="ltr">
                  <Phone size={10} />{pv.phone}
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function ProviderFormModal({
  locale, draft, setDraft, isEditing, busy, onPickContact, onSave, onClose,
}: {
  locale: Locale;
  draft: ProviderDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProviderDraft>>;
  isEditing: boolean;
  busy?: boolean;
  onPickContact: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";
  const canSave = draft.name.trim().length > 0 && draft.phone.trim().length > 0;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-purple-500/30 p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            <Speaker size={17} />{isEditing ? t.editProvider : t.addProvider}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelCls}>{t.providerName} *</label>
            <input type="text" value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder={t.providerName} />
          </div>
          <div>
            <label className={labelCls}>{t.providerPhone} *</label>
            <div className="flex gap-2">
              <input type="tel" value={draft.phone} onChange={e => setDraft(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="09123456789" dir="ltr" inputMode="tel" />
              <button onClick={onPickContact} title={t.chooseFromContacts} className="px-4 rounded-2xl bg-white/5 border border-white/10 text-purple-300 hover:bg-white/10 active:scale-95 transition-all">
                <Contact size={18} />
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>{t.equipmentType}</label>
            <div className="relative">
              <select
                value={draft.equipment}
                onChange={e => setDraft(p => ({ ...p, equipment: e.target.value }))}
                className={`${inputCls} appearance-none cursor-pointer`}
              >
                {EQUIPMENT_TYPES.map(key => (
                  <option key={key} value={key} className="bg-[#1a1a2e]">
                    {equipmentLabel(key, t)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all">{t.cancel}</button>
            <button onClick={onSave} disabled={!canSave || busy} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50">
              <CheckCircle size={15} />{busy ? "..." : t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProviderPickerModal({
  locale, providers, onSelect, onClose,
}: {
  locale: Locale;
  providers: LocalSoundProvider[];
  onSelect: (p: LocalSoundProvider) => void;
  onClose: () => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";
  const [query, setQuery] = useState("");

  const filtered = providers.filter(pv => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return pv.name.toLowerCase().includes(q) || pv.phone.includes(q) || equipmentLabel(pv.equipment || "", t).toLowerCase().includes(q);
  });

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-purple-500/30 p-5 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            <Speaker size={17} />{t.chooseProvider}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <X size={15} />
          </button>
        </div>

        {providers.length > 0 && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5 mb-3">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={t.searchCustomer} className="flex-1 bg-transparent text-white text-sm focus:outline-none" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <Speaker size={26} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">{t.noProviders}</p>
            </div>
          ) : (
            filtered.map(pv => (
              <button key={pv.id} onClick={() => { onSelect(pv); onClose(); }} className="w-full text-right bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 active:scale-[0.99] transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{pv.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-emerald-300" dir="ltr">{pv.phone}</span>
                      {pv.equipment && (
                        <span className="text-[10px] text-blue-300">· {equipmentLabel(pv.equipment, t)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
