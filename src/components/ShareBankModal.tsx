"use client";

import React, { useState } from "react";
import { X, Contact, Send, Copy, CreditCard, Landmark } from "lucide-react";
import { translations, type Locale } from "@/lib/i18n";
import type { LocalBankCard } from "@/lib/localStore";

export type ShareKind = "card" | "sheba";

function formatCard(num: string): string {
  return (num.match(/\d{1,4}/g) || []).join("-");
}

/** Builds the SMS text in the active app language. */
export function buildShareMessage(
  locale: Locale,
  djName: string,
  kind: ShareKind,
  value: string,
  cardTitle?: string
): string {
  const name = djName?.trim() || (locale === "fa" ? "دی‌جی" : "DJ");
  if (locale === "fa") {
    const label = kind === "card" ? "شماره کارت" : "شماره شبا";
    const pretty = kind === "card" ? formatCard(value) : value;
    const owner = cardTitle ? `\n${cardTitle}` : "";
    return `${name}${owner}\n${label}: ${pretty}\nبا تشکر از شما`;
  }
  const label = kind === "card" ? "Card Number" : "IBAN (Sheba)";
  const pretty = kind === "card" ? formatCard(value) : value;
  const owner = cardTitle ? `\n${cardTitle}` : "";
  return `${name}${owner}\n${label}: ${pretty}\nThank you`;
}

function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default function ShareBankModal({
  locale,
  djName,
  kind,
  cards,
  sheba,
  onClose,
}: {
  locale: Locale;
  djName: string;
  kind: ShareKind;
  cards: LocalBankCard[];
  sheba: string;
  onClose: () => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";

  const [cardIndex, setCardIndex] = useState(0);
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");

  const activeCard = cards[cardIndex];
  // For IBAN we prefer the Sheba attached to the selected card,
  // falling back to the standalone one saved in Settings.
  const value =
    kind === "card"
      ? activeCard?.cardNumber || ""
      : activeCard?.sheba || sheba || "";
  const title = activeCard?.title;
  const message = buildShareMessage(locale, djName, kind, value, title);
  const canSend = value.trim().length > 0 && phone.trim().length > 0;

  const pickContact = async () => {
    try {
      if ("contacts" in navigator) {
        const picked = await (
          navigator as unknown as {
            contacts: {
              select: (
                props: string[],
                opts: { multiple: boolean }
              ) => Promise<{ name?: string[]; tel?: string[] }[]>;
            };
          }
        ).contacts.select(["name", "tel"], { multiple: false });
        if (picked.length > 0) {
          setContactName(picked[0].name?.[0] || "");
          setPhone((picked[0].tel?.[0] || "").replace(/\s/g, ""));
        }
      } else {
        alert(t.contactPickerNotSupported);
      }
    } catch {
      alert(t.contactPickerFailed);
    }
  };

  const sendSms = () => {
    if (!canSend) return;
    const sep = isIOSDevice() ? "&" : "?";
    const target = phone.replace(/\s/g, "");
    window.location.href = `sms:${target}${sep}body=${encodeURIComponent(message)}`;
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      alert(t.copied);
    } catch {
      /* ignore */
    }
  };

  const missing = value.trim().length === 0;

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 z-[75] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-purple-500/30 p-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            {kind === "card" ? <CreditCard size={17} /> : <Landmark size={17} />}
            {kind === "card" ? t.sendBankCard : t.sendSheba}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {missing ? (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 text-center">
            <p className="text-xs text-amber-200 leading-relaxed">
              {kind === "card" ? t.noCardYet : t.noShebaYet}
            </p>
          </div>
        ) : (
          <>
            {/* Card selector when several cards exist */}
            {cards.length > 1 && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  {t.cardTitle}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {cards.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => setCardIndex(i)}
                      className={`w-full text-right px-3 py-2.5 rounded-xl border transition-all ${
                        i === cardIndex
                          ? "bg-purple-600/25 border-purple-400/50 text-purple-100"
                          : "bg-white/5 border-white/10 text-gray-300"
                      }`}
                    >
                      <span className="text-xs font-medium">{c.title}</span>
                      <span className="block text-[10px] opacity-70 font-mono" dir="ltr">
                        {kind === "card" ? formatCard(c.cardNumber) : c.sheba || "—"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recipient */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t.recipientNumber}
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  dir="ltr"
                  inputMode="tel"
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50 transition-all"
                />
                <button
                  onClick={pickContact}
                  title={t.chooseFromContacts}
                  className="px-4 rounded-2xl bg-white/5 border border-white/10 text-purple-300 hover:bg-white/10 transition-all active:scale-95"
                >
                  <Contact size={18} />
                </button>
              </div>
              {contactName && (
                <p className="text-[10px] text-emerald-300 mt-1">{contactName}</p>
              )}
            </div>

            {/* Message preview */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {t.messagePreview}
              </label>
              <pre className="bg-black/30 border border-white/10 rounded-2xl p-3 text-[11px] text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                {message}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={copyMessage}
                className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Copy size={15} />
                {t.copyInfo}
              </button>
              <button
                onClick={sendSms}
                disabled={!canSend}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Send size={15} />
                {t.sendSms}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
