"use client";

import React, { useState } from "react";
import {
  Users, Music2, Speaker, Disc3, Plus, Trash2, Edit3,
  Phone, Store, Wallet, ChevronUp, ChevronDown, X, List,
} from "lucide-react";
import { translations, type Locale } from "@/lib/i18n";
import type {
  LocalCustomer, LocalMusician, LocalSoundProvider, LocalColleague,
} from "@/lib/localStore";
import { categoryLabel } from "./CustomersSection";
import { equipmentLabel } from "./RosterSections";
import { roleLabel } from "./ColleagueParts";

type T = (typeof translations)["fa"] | (typeof translations)["en"];
type DirKind = "customers" | "musicians" | "providers" | "colleagues";

const CATEGORY_COLORS: Record<string, string> = {
  ceremony: "bg-pink-500/15 border-pink-400/30 text-pink-300",
  restaurant: "bg-amber-500/15 border-amber-400/30 text-amber-300",
  club: "bg-purple-500/15 border-purple-400/30 text-purple-300",
  dj: "bg-blue-500/15 border-blue-400/30 text-blue-300",
  other: "bg-white/10 border-white/20 text-gray-300",
};

const ROLE_COLORS: Record<string, string> = {
  dj: "bg-blue-500/15 border-blue-400/30 text-blue-300",
  showman: "bg-orange-500/15 border-orange-400/30 text-orange-300",
  singer: "bg-pink-500/15 border-pink-400/30 text-pink-300",
  vipMusic: "bg-purple-500/15 border-purple-400/30 text-purple-300",
};

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button onClick={onEdit} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-300 hover:bg-white/10 transition-all">
        <Edit3 size={11} />
      </button>
      <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-400/25 flex items-center justify-center text-red-300 hover:bg-red-500/25 transition-all">
        <Trash2 size={11} />
      </button>
    </div>
  );
}

/** One category card: title, count, add button and a list popup trigger. */
function CategoryCard({
  icon, title, count, accent, addLabel, emptyText, onAdd, onOpenList, t,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  accent: string;
  addLabel: string;
  emptyText: string;
  onAdd: () => void;
  onOpenList: () => void;
  t: T;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
      <div className="flex items-center gap-2 mb-2.5">
        <span className={accent}>{icon}</span>
        <span className="text-sm font-bold text-white flex-1">{title}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{count}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onAdd}
          className="py-2.5 rounded-xl bg-gradient-to-r from-purple-500/25 to-blue-500/25 border border-purple-400/40 text-[11px] font-bold text-purple-100 flex items-center justify-center gap-1 active:scale-[0.98] transition-all"
        >
          <Plus size={13} />{addLabel}
        </button>
        <button
          onClick={onOpenList}
          disabled={count === 0}
          title={count === 0 ? emptyText : t.viewList}
          className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-gray-200 flex items-center justify-center gap-1 hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-40"
        >
          <List size={13} />{t.viewList}
        </button>
      </div>
    </div>
  );
}

export default function DirectorySection({
  locale,
  customers, musicians, providers, colleagues,
  onAddCustomer, onEditCustomer, onDeleteCustomer,
  onAddMusician, onEditMusician, onDeleteMusician,
  onAddProvider, onEditProvider, onDeleteProvider,
  onAddColleague, onEditColleague, onDeleteColleague,
}: {
  locale: Locale;
  customers: LocalCustomer[];
  musicians: LocalMusician[];
  providers: LocalSoundProvider[];
  colleagues: LocalColleague[];
  onAddCustomer: () => void;
  onEditCustomer: (c: LocalCustomer) => void;
  onDeleteCustomer: (id: number) => void;
  onAddMusician: () => void;
  onEditMusician: (m: LocalMusician) => void;
  onDeleteMusician: (id: number) => void;
  onAddProvider: () => void;
  onEditProvider: (p: LocalSoundProvider) => void;
  onDeleteProvider: (id: number) => void;
  onAddColleague: () => void;
  onEditColleague: (c: LocalColleague) => void;
  onDeleteColleague: (id: number) => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";
  const [open, setOpen] = useState(false);
  const [listKind, setListKind] = useState<DirKind | null>(null);

  const totalCount = customers.length + musicians.length + providers.length + colleagues.length;

  const listTitle =
    listKind === "customers" ? t.dirCustomers
    : listKind === "musicians" ? t.dirMusicians
    : listKind === "providers" ? t.dirProviders
    : t.dirColleagues;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
      >
        <div className="text-right">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            <Users size={18} />{t.directory}
            {totalCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                {totalCount}
              </span>
            )}
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">{t.directoryDesc}</p>
        </div>
        {open
          ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
          : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-white/5 pt-4">
          <CategoryCard
            icon={<Users size={15} />} title={t.dirCustomers} count={customers.length}
            accent="text-purple-300" addLabel={t.addCustomer} emptyText={t.noCustomers}
            onAdd={onAddCustomer} onOpenList={() => setListKind("customers")} t={t}
          />
          <CategoryCard
            icon={<Music2 size={15} />} title={t.dirMusicians} count={musicians.length}
            accent="text-pink-300" addLabel={t.addMusician} emptyText={t.noMusicians}
            onAdd={onAddMusician} onOpenList={() => setListKind("musicians")} t={t}
          />
          <CategoryCard
            icon={<Speaker size={15} />} title={t.dirProviders} count={providers.length}
            accent="text-blue-300" addLabel={t.addProvider} emptyText={t.noProviders}
            onAdd={onAddProvider} onOpenList={() => setListKind("providers")} t={t}
          />
          <CategoryCard
            icon={<Disc3 size={15} />} title={t.dirColleagues} count={colleagues.length}
            accent="text-indigo-300" addLabel={t.addColleague} emptyText={t.noColleagues}
            onAdd={onAddColleague} onOpenList={() => setListKind("colleagues")} t={t}
          />
        </div>
      )}

      {/* List popup */}
      {listKind && (
        <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-purple-500/30 p-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-purple-300">{listTitle}</h3>
              <button onClick={() => setListKind(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {listKind === "customers" && customers.map(c => (
                <div key={c.id} className="bg-gradient-to-r from-purple-900/25 to-blue-900/20 border border-purple-500/20 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{c.fullName}</p>
                      {c.businessName && (
                        <p className="text-[11px] text-gray-300 truncate flex items-center gap-1 mt-0.5">
                          <Store size={10} className="flex-shrink-0" />{c.businessName}
                        </p>
                      )}
                    </div>
                    <RowActions onEdit={() => { setListKind(null); onEditCustomer(c); }} onDelete={() => onDeleteCustomer(c.id)} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href={`tel:${c.phone}`} className="text-[11px] text-emerald-300 flex items-center gap-1" dir="ltr">
                      <Phone size={10} />{c.phone}
                    </a>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[c.category]}`}>
                      {categoryLabel(c.category, t)}
                    </span>
                  </div>
                </div>
              ))}

              {listKind === "musicians" && musicians.map(m => (
                <div key={m.id} className="bg-gradient-to-r from-purple-900/25 to-pink-900/20 border border-purple-500/20 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{m.fullName}</p>
                      <p className="text-[11px] text-pink-300 truncate mt-0.5">{m.instrument}</p>
                    </div>
                    <RowActions onEdit={() => { setListKind(null); onEditMusician(m); }} onDelete={() => onDeleteMusician(m.id)} />
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <a href={`tel:${m.phone}`} className="text-[11px] text-emerald-300 flex items-center gap-1" dir="ltr">
                      <Phone size={10} />{m.phone}
                    </a>
                    {m.fee > 0 && (
                      <span className="text-[11px] text-amber-300 flex items-center gap-1">
                        <Wallet size={10} />{m.fee.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {listKind === "providers" && providers.map(pv => (
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
                    <RowActions onEdit={() => { setListKind(null); onEditProvider(pv); }} onDelete={() => onDeleteProvider(pv.id)} />
                  </div>
                  <a href={`tel:${pv.phone}`} className="text-[11px] text-emerald-300 flex items-center gap-1" dir="ltr">
                    <Phone size={10} />{pv.phone}
                  </a>
                </div>
              ))}

              {listKind === "colleagues" && colleagues.map(c => (
                <div key={c.id} className="bg-gradient-to-r from-indigo-900/25 to-purple-900/20 border border-indigo-500/20 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{c.fullName}</p>
                      <span className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full border ${ROLE_COLORS[c.role]}`}>
                        {roleLabel(c.role, t)}
                      </span>
                    </div>
                    <RowActions onEdit={() => { setListKind(null); onEditColleague(c); }} onDelete={() => onDeleteColleague(c.id)} />
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <a href={`tel:${c.phone}`} className="text-[11px] text-emerald-300 flex items-center gap-1" dir="ltr">
                      <Phone size={10} />{c.phone}
                    </a>
                    {c.fee > 0 && (
                      <span className="text-[11px] text-amber-300 flex items-center gap-1">
                        <Wallet size={10} />{c.fee.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
