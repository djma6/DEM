"use client";

import React, { useState } from "react";
import { X, Smartphone, Globe, Server, Download, ChevronLeft, ChevronRight, CheckCircle, ExternalLink } from "lucide-react";

const steps = [
  {
    icon: <Globe size={24} />,
    title: { fa: "آپلود روی Vercel", en: "Deploy to Vercel" },
    desc: {
      fa: "به vercel.com برید، اکانت GitHub بسازید، و Repository برنامه رو انتخاب کنید. دکمه Deploy رو بزنید — کمتر از ۲ دقیقه!",
      en: "Go to vercel.com, sign in with GitHub, select your repo, and click Deploy. Takes less than 2 minutes!",
    },
  },
  {
    icon: <Server size={24} />,
    title: { fa: "تنظیم دیتابیس", en: "Setup Database" },
    desc: {
      fa: "از Supabase.com یک پروژه PostgreSQL رایگان بسازید. آدرس رو در Environment Variables در Vercel اضافه کنید.",
      en: "Create a free PostgreSQL project at Supabase.com. Add the URL to Environment Variables in Vercel.",
    },
  },
  {
    icon: <Smartphone size={24} />,
    title: { fa: "نصب روی گوشی", en: "Install on Phone" },
    desc: {
      fa: "آدرس برنامه رو در Chrome باز کنید. منوی ⋮ → Install App رو بزنید. آیکون روی صفحه اصلی ظاهر میشه!",
      en: "Open the app URL in Chrome. Tap ⋮ menu → Install App. Icon appears on home screen!",
    },
  },
  {
    icon: <Download size={24} />,
    title: { fa: "آماده!", en: "Done!" },
    desc: {
      fa: "برنامه مثل یک اپ واقعی کار می‌کنه — بدون نوار مرورگر، با آیکون مخصوص، و حتی آفلاین!",
      en: "The app works like a native app — no browser bar, custom icon, and even works offline!",
    },
  },
];

export default function InstallGuide({
  locale,
  onClose,
}: {
  locale: "fa" | "en";
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const isRtl = locale === "fa";

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gradient-to-br from-[#1a0a2e] via-[#1a1a2e] to-[#2e0a1a] rounded-3xl border border-purple-500/30 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-purple-300">
            {locale === "fa" ? "راهنمای نصب" : "Install Guide"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i === step
                  ? "bg-gradient-to-r from-purple-500 to-red-500"
                  : i < step
                  ? "bg-purple-600/50"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/30 to-red-600/30 flex items-center justify-center mx-auto mb-4 text-purple-300">
            {steps[step].icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {steps[step].title[locale === "fa" ? "fa" : "en"]}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {steps[step].desc[locale === "fa" ? "fa" : "en"]}
          </p>
        </div>

        {/* Vercel link for step 0 */}
        {step === 0 && (
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-sm font-medium mb-4 hover:bg-white/20 transition-all"
          >
            <ExternalLink size={14} />
            {locale === "fa" ? "باز کردن Vercel.com" : "Open Vercel.com"}
          </a>
        )}

        {/* Supabase link for step 1 */}
        {step === 1 && (
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-sm font-medium mb-4 hover:bg-white/20 transition-all"
          >
            <ExternalLink size={14} />
            {locale === "fa" ? "باز کردن Supabase.com" : "Open Supabase.com"}
          </a>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium"
            >
              {isRtl ? <ChevronRight size={16} className="inline ml-1" /> : <ChevronLeft size={16} className="inline mr-1" />}
              {locale === "fa" ? "قبلی" : "Previous"}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium"
            >
              {locale === "fa" ? "بستن" : "Close"}
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium"
            >
              {locale === "fa" ? "بعدی" : "Next"}
              {isRtl ? <ChevronLeft size={16} className="inline mr-1" /> : <ChevronRight size={16} className="inline ml-1" />}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              {locale === "fa" ? "متوجشم!" : "Got it!"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
