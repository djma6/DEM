"use client";

import React, { useState } from "react";
import { Disc3, X, Contact, CheckCircle, Search } from "lucide-react";
import { translations, type Locale } from "@/lib/i18n";
import type { ColleagueRole, LocalColleague } from "@/lib/localStore";

type T = (typeof translations)["fa"] | (typeof translations)["en"];

export const COLLEAGUE_ROLES: ColleagueRole[] = ["dj", "showman", "singer", "vipMusic"];

export function roleLabel(role: string, t: T): string {
  switch (role) {
    case "dj": return t.roleDj;
    case "showman": return t.roleShowman;
    case "singer": return t.roleSinger;
    case "vipMusic": return t.roleVipMusic;
    default: return t.roleDj;
  }
}

export interface ColleagueDraft {
  fullName: string;
  role: ColleagueRole;
  phone: string;
  fee: number;
}

export const EMPTY_COLLEAGUE: ColleagueDraft = {
  fullName: "",
  role: "dj",
  phone: "",
  fee: 0,
};

const inputCls =
  "w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50 transition-all";
const labelCls = "block text-sm font-medium text-gray-300 mb-1.5";

export function ColleagueFormModal({
  locale, draft, setDraft, isEditing, busy, onPickContact, onSave, onClose,
}: {
  locale: Locale;
  draft: ColleagueDraft;
  setDraft: React.Dispatch<React.SetStateAction<ColleagueDraft>>;
  isEditing: boolean;
  busy?: boolean;
  onPickContact: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";
  const canSave = draft.fullName.trim().length > 0 && draft.phone.trim().length > 0;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-purple-500/30 p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            <Disc3 size={17} />{isEditing ? t.editColleague : t.addColleague}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelCls}>{t.colleagueName} *</label>
            <input
              type="text"
              value={draft.fullName}
              onChange={e => setDraft(p => ({ ...p, fullName: e.target.value }))}
              className={inputCls}
              placeholder={t.colleagueName}
            />
          </div>

          <div>
            <label className={labelCls}>{t.colleaguePhone} *</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={draft.phone}
                onChange={e => setDraft(p => ({ ...p, phone: e.target.value }))}
                className={inputCls}
                placeholder="09123456789"
                dir="ltr"
                inputMode="tel"
              />
              <button
                onClick={onPickContact}
                title={t.chooseFromContacts}
                className="px-4 rounded-2xl bg-white/5 border border-white/10 text-purple-300 hover:bg-white/10 active:scale-95 transition-all"
              >
                <Contact size={18} />
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>{t.colleagueRole}</label>
            <div className="grid grid-cols-2 gap-1.5">
              {COLLEAGUE_ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setDraft(p => ({ ...p, role: r }))}
                  className={`py-2.5 rounded-xl text-[11px] font-medium border transition-all ${
                    draft.role === r
                      ? "bg-purple-600/30 border-purple-400/50 text-purple-100"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {roleLabel(r, t)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>{t.colleagueFee}</label>
            <input
              type="number"
              value={draft.fee || ""}
              onChange={e => setDraft(p => ({ ...p, fee: parseInt(e.target.value) || 0 }))}
              className={inputCls}
              placeholder="0"
              dir="ltr"
              inputMode="numeric"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all">
              {t.cancel}
            </button>
            <button
              onClick={onSave}
              disabled={!canSave || busy}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <CheckCircle size={15} />{busy ? "..." : t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ColleaguePickerModal({
  locale, colleagues, onSelect, onClose,
}: {
  locale: Locale;
  colleagues: LocalColleague[];
  onSelect: (c: LocalColleague) => void;
  onClose: () => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";
  const [query, setQuery] = useState("");

  const filtered = colleagues.filter(c => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      roleLabel(c.role, t).toLowerCase().includes(q)
    );
  });

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-purple-500/30 p-5 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            <Disc3 size={17} />{t.chooseColleague}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <X size={15} />
          </button>
        </div>

        {colleagues.length > 0 && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5 mb-3">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.searchCustomer}
              className="flex-1 bg-transparent text-white text-sm focus:outline-none"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <Disc3 size={26} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">{t.noColleagues}</p>
            </div>
          ) : (
            filtered.map(c => (
              <button
                key={c.id}
                onClick={() => { onSelect(c); onClose(); }}
                className="w-full text-right bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{c.fullName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-indigo-300">{roleLabel(c.role, t)}</span>
                      <span className="text-[11px] text-emerald-300" dir="ltr">{c.phone}</span>
                    </div>
                  </div>
                  {c.fee > 0 && (
                    <span className="text-[10px] text-amber-300 flex-shrink-0" dir="ltr">
                      {c.fee.toLocaleString()}
                    </span>
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
