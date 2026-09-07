"use client";

import React, { useState } from "react";
import {
  Users, Plus, X, Contact, Trash2, Edit3, CheckCircle,
  ChevronUp, ChevronDown, Phone, Store, Search,
} from "lucide-react";
import { translations, type Locale } from "@/lib/i18n";
import type { CustomerCategory, LocalCustomer } from "@/lib/localStore";

export const CUSTOMER_CATEGORIES: CustomerCategory[] = [
  "ceremony",
  "restaurant",
  "club",
  "dj",
  "other",
];

type T = (typeof translations)["fa"] | (typeof translations)["en"];

export function categoryLabel(cat: CustomerCategory, t: T): string {
  switch (cat) {
    case "ceremony": return t.catCeremony;
    case "restaurant": return t.catRestaurant;
    case "club": return t.catClub;
    case "dj": return t.catDj;
    default: return t.catOther;
  }
}

/** The business-name label changes with the selected category. */
export function businessLabel(cat: CustomerCategory, t: T): string {
  switch (cat) {
    case "ceremony": return t.ceremonyName;
    case "restaurant": return t.restaurantBizName;
    case "club": return t.clubName;
    case "dj": return t.djName2;
    default: return t.otherName;
  }
}

const CATEGORY_COLORS: Record<CustomerCategory, string> = {
  ceremony: "bg-pink-500/15 border-pink-400/30 text-pink-300",
  restaurant: "bg-amber-500/15 border-amber-400/30 text-amber-300",
  club: "bg-purple-500/15 border-purple-400/30 text-purple-300",
  dj: "bg-blue-500/15 border-blue-400/30 text-blue-300",
  other: "bg-white/10 border-white/20 text-gray-300",
};

export interface CustomerDraft {
  fullName: string;
  phone: string;
  category: CustomerCategory;
  businessName: string;
}

export const EMPTY_CUSTOMER: CustomerDraft = {
  fullName: "",
  phone: "",
  category: "ceremony",
  businessName: "",
};

/* ───────────── Settings section ───────────── */

export default function CustomersSection({
  locale,
  customers,
  onAdd,
  onEdit,
  onDelete,
}: {
  locale: Locale;
  customers: LocalCustomer[];
  onAdd: () => void;
  onEdit: (c: LocalCustomer) => void;
  onDelete: (id: number) => void;
}) {
  const t = translations[locale];
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
          <Users size={18} />{t.customers}
          {customers.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              {customers.length}
            </span>
          )}
        </h3>
      </div>
      <p className="text-[11px] text-gray-400 mb-3">{t.customersDesc}</p>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onAdd}
          className="py-3 rounded-2xl bg-gradient-to-r from-purple-500/25 to-blue-500/25 border border-purple-400/40 text-xs font-bold text-purple-100 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <Plus size={14} />{t.addCustomer}
        </button>
        <button
          onClick={() => setOpen(v => !v)}
          className="py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200 flex items-center justify-center gap-1.5 hover:bg-white/10 active:scale-[0.98] transition-all"
        >
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {open ? t.hideCustomers : t.showCustomers}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          {customers.length === 0 ? (
            <div className="text-center py-6">
              <Users size={26} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">{t.noCustomers}</p>
            </div>
          ) : (
            customers.map(c => (
              <div
                key={c.id}
                className="bg-gradient-to-r from-purple-900/25 to-blue-900/20 border border-purple-500/20 rounded-xl p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{c.fullName}</p>
                    {c.businessName && (
                      <p className="text-[11px] text-gray-300 truncate flex items-center gap-1 mt-0.5">
                        <Store size={10} className="flex-shrink-0" />{c.businessName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEdit(c)}
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-300 hover:bg-white/10 transition-all"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-400/25 flex items-center justify-center text-red-300 hover:bg-red-500/25 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`tel:${c.phone}`}
                    className="text-[11px] text-emerald-300 flex items-center gap-1 hover:text-emerald-200"
                    dir="ltr"
                  >
                    <Phone size={10} />{c.phone}
                  </a>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[c.category]}`}>
                    {categoryLabel(c.category, t)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────── Create / edit modal ───────────── */

export function CustomerFormModal({
  locale,
  draft,
  setDraft,
  isEditing,
  busy,
  onPickContact,
  onSave,
  onClose,
}: {
  locale: Locale;
  draft: CustomerDraft;
  setDraft: React.Dispatch<React.SetStateAction<CustomerDraft>>;
  isEditing: boolean;
  busy?: boolean;
  onPickContact: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";
  const ic =
    "w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50 transition-all";
  const lc = "block text-sm font-medium text-gray-300 mb-1.5";
  const canSave = draft.fullName.trim().length > 0 && draft.phone.trim().length > 0;

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-purple-500/30 p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            <Users size={17} />{isEditing ? t.editCustomer : t.addCustomer}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className={lc}>{t.fullName} *</label>
            <input
              type="text"
              value={draft.fullName}
              onChange={e => setDraft(p => ({ ...p, fullName: e.target.value }))}
              className={ic}
              placeholder={t.fullName}
            />
          </div>

          <div>
            <label className={lc}>{t.customerPhone} *</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={draft.phone}
                onChange={e => setDraft(p => ({ ...p, phone: e.target.value }))}
                className={ic}
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
            <label className={lc}>{t.customerCategory}</label>
            <div className="grid grid-cols-3 gap-1.5">
              {CUSTOMER_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setDraft(p => ({ ...p, category: cat }))}
                  className={`py-2.5 rounded-xl text-[11px] font-medium border transition-all ${
                    draft.category === cat
                      ? "bg-purple-600/30 border-purple-400/50 text-purple-100"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {categoryLabel(cat, t)}
                </button>
              ))}
            </div>
          </div>

          {/* Label adapts to the chosen category */}
          <div>
            <label className={lc}>{businessLabel(draft.category, t)}</label>
            <input
              type="text"
              value={draft.businessName}
              onChange={e => setDraft(p => ({ ...p, businessName: e.target.value }))}
              className={ic}
              placeholder={businessLabel(draft.category, t)}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all"
            >
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

/* ───────────── Picker used inside the event form ───────────── */

export function CustomerPickerModal({
  locale,
  customers,
  onSelect,
  onClose,
}: {
  locale: Locale;
  customers: LocalCustomer[];
  onSelect: (c: LocalCustomer) => void;
  onClose: () => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";
  const [query, setQuery] = useState("");

  const filtered = customers.filter(c => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.businessName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-purple-500/30 p-5 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            <Users size={17} />{t.chooseCustomer}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {customers.length > 0 && (
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
              <Users size={26} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">{t.noCustomers}</p>
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
                      <span className="text-[11px] text-emerald-300" dir="ltr">{c.phone}</span>
                      {c.businessName && (
                        <span className="text-[10px] text-gray-400 truncate">· {c.businessName}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border flex-shrink-0 ${CATEGORY_COLORS[c.category]}`}>
                    {categoryLabel(c.category, t)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
