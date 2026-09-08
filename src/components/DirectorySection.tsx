"use client";

import React, { useState } from "react";
import {
  Users, Music2, Speaker, Disc3, Plus, Trash2, Edit3,
  Phone, Store, Wallet, ChevronDown, Check,
} from "lucide-react";
import { translations, type Locale } from "@/lib/i18n";
import type {
  LocalCustomer, LocalMusician, LocalSoundProvider, LocalColleague,
} from "@/lib/localStore";
import { categoryLabel } from "./CustomersSection";
import { equipmentLabel } from "./RosterSections";
import { roleLabel } from "./ColleagueParts";

type T = (typeof translations)["fa"] | (typeof translations)["en"];
type DirTab = "customers" | "musicians" | "providers" | "colleagues";

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

/** Small edit + delete pair used by every row. */
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        onClick={onEdit}
        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-300 hover:bg-white/10 transition-all"
      >
        <Edit3 size={11} />
      </button>
      <button
        onClick={onDelete}
        className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-400/25 flex items-center justify-center text-red-300 hover:bg-red-500/25 transition-all"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-6">
      <div className="mx-auto mb-2 text-gray-600 flex justify-center">{icon}</div>
      <p className="text-xs text-gray-500">{text}</p>
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
  const [tab, setTab] = useState<DirTab>("customers");
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs: { id: DirTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "customers", label: t.dirCustomers, icon: <Users size={15} />, count: customers.length },
    { id: "musicians", label: t.dirMusicians, icon: <Music2 size={15} />, count: musicians.length },
    { id: "providers", label: t.dirProviders, icon: <Speaker size={15} />, count: providers.length },
    { id: "colleagues", label: t.dirColleagues, icon: <Disc3 size={15} />, count: colleagues.length },
  ];
  const active = tabs.find(x => x.id === tab)!;

  const addLabel =
    tab === "customers" ? t.addCustomer
    : tab === "musicians" ? t.addMusician
    : tab === "providers" ? t.addProvider
    : t.addColleague;

  const onAdd =
    tab === "customers" ? onAddCustomer
    : tab === "musicians" ? onAddMusician
    : tab === "providers" ? onAddProvider
    : onAddColleague;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <h3 className="text-base font-bold text-purple-300 flex items-center gap-2 mb-1">
        <Users size={18} />{t.directory}
      </h3>
      <p className="text-[11px] text-gray-400 mb-3">{t.directoryDesc}</p>

      {/* Dropdown selector */}
      <div className="relative mb-3">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-purple-100">
            {active.icon}{active.label}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/25 text-purple-200">
              {active.count}
            </span>
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div className="absolute z-20 top-full inset-x-0 mt-1.5 bg-[#1a1a2e] border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl">
            {tabs.map(x => (
              <button
                key={x.id}
                onClick={() => { setTab(x.id); setMenuOpen(false); }}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-sm transition-all ${
                  x.id === tab ? "bg-purple-600/25 text-purple-100" : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2">
                  {x.icon}{x.label}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300">
                    {x.count}
                  </span>
                </span>
                {x.id === tab && <Check size={14} className="text-purple-300 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add button for the active list */}
      <button
        onClick={onAdd}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500/25 to-blue-500/25 border border-purple-400/40 text-xs font-bold text-purple-100 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
      >
        <Plus size={14} />{addLabel}
      </button>

      {/* Active list */}
      <div className="mt-3 space-y-2">
        {tab === "customers" && (
          customers.length === 0
            ? <EmptyState icon={<Users size={26} />} text={t.noCustomers} />
            : customers.map(c => (
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
                  <RowActions onEdit={() => onEditCustomer(c)} onDelete={() => onDeleteCustomer(c.id)} />
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
            ))
        )}

        {tab === "musicians" && (
          musicians.length === 0
            ? <EmptyState icon={<Music2 size={26} />} text={t.noMusicians} />
            : musicians.map(m => (
              <div key={m.id} className="bg-gradient-to-r from-purple-900/25 to-pink-900/20 border border-purple-500/20 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{m.fullName}</p>
                    <p className="text-[11px] text-pink-300 truncate mt-0.5">{m.instrument}</p>
                  </div>
                  <RowActions onEdit={() => onEditMusician(m)} onDelete={() => onDeleteMusician(m.id)} />
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
            ))
        )}

        {tab === "providers" && (
          providers.length === 0
            ? <EmptyState icon={<Speaker size={26} />} text={t.noProviders} />
            : providers.map(pv => (
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
                  <RowActions onEdit={() => onEditProvider(pv)} onDelete={() => onDeleteProvider(pv.id)} />
                </div>
                <a href={`tel:${pv.phone}`} className="text-[11px] text-emerald-300 flex items-center gap-1" dir="ltr">
                  <Phone size={10} />{pv.phone}
                </a>
              </div>
            ))
        )}

        {tab === "colleagues" && (
          colleagues.length === 0
            ? <EmptyState icon={<Disc3 size={26} />} text={t.noColleagues} />
            : colleagues.map(c => (
              <div key={c.id} className="bg-gradient-to-r from-indigo-900/25 to-purple-900/20 border border-indigo-500/20 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{c.fullName}</p>
                    <span className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full border ${ROLE_COLORS[c.role]}`}>
                      {roleLabel(c.role, t)}
                    </span>
                  </div>
                  <RowActions onEdit={() => onEditColleague(c)} onDelete={() => onDeleteColleague(c.id)} />
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
            ))
        )}
      </div>
    </div>
  );
}
