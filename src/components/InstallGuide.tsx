"use client";

import React, { useState } from "react";
import {
  X,
  Smartphone,
  Globe,
  Server,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ExternalLink,
  GitBranch,
  Database,
  Rocket,
} from "lucide-react";

const steps = [
  {
    icon: <GitBranch size={24} />,
    title: { fa: "آپلود روی GitHub", en: "Upload to GitHub" },
    desc: {
      fa: "یک Repository به اسم igig بسازید. با git push کد برنامه رو آپلود کنید. Personal Access Token برای احراز هویت لازمه.",
      en: "Create a Repository named igig. Upload code with git push. You'll need a Personal Access Token for authentication.",
    },
    link: { url: "https://github.com/new", label: { fa: "ساخت Repository", en: "Create Repository" } },
  },
  {
    icon: <Rocket size={24} />,
    title: { fa: "استقرار روی Vercel", en: "Deploy to Vercel" },
    desc: {
      fa: "با حساب GitHub وارد بشید. Repository igig رو انتخاب کنید. دکمه Deploy رو بزنید — کمتر از ۲ دقیقه!",
      en: "Sign in with GitHub. Select igig repository. Click Deploy — takes under 2 minutes!",
    },
    link: { url: "https://vercel.com/new", label: { fa: "استقرار روی Vercel", en: "Deploy to Vercel" } },
  },
  {
    icon: <Database size={24} />,
    title: { fa: "تنظیم دیتابیس", en: "Setup Database" },
    desc: {
      fa: "از Supabase یک پروژه PostgreSQL رایگان بسازید. آدرس اتصال رو در Vercel → Settings → Environment Variables اضافه کنید.",
      en: "Create a free PostgreSQL project at Supabase. Add the connection URL to Vercel → Settings → Environment Variables.",
    },
    link: { url: "https://supabase.com/dashboard/projects", label: { fa: "ساخت پروژه Supabase", en: "Create Supabase Project" } },
  },
  {
    icon: <Smartphone size={24} />,
    title: { fa: "نصب روی گوشی", en: "Install on Phone" },
    desc: {
      fa: "آدرس برنامه رو در Chrome باز کنید. منوی ⋮ → Install App رو بزنید. آیکون روی صفحه اصلی ظاهر میشه!",
      en: "Open the app URL in Chrome. Tap ⋮ menu → Install App. Icon appears on home screen!",
    },
    link: null,
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
  const lang = locale === "fa" ? "fa" : "en";

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gradient-to-br from-[#1a0a2e] via-[#1a1a2e] to-[#2e0a1a] rounded-3xl border border-purple-500/30 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-purple-300">
            {locale === "fa" ? "📦 راهنمای نصب و انتشار" : "📦 Install & Deploy Guide"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-5">
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

        {/* Step number */}
        <p className="text-[10px] text-gray-500 mb-3">
          {locale === "fa" ? `قدم` : "Step"} {step + 1} {locale === "fa" ? "از" : "of"} {steps.length}
        </p>

        {/* Step Content */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/30 to-red-600/30 flex items-center justify-center mx-auto mb-4 text-purple-300">
            {steps[step].icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {steps[step].title[lang]}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {steps[step].desc[lang]}
          </p>
        </div>

        {/* Link button */}
        {steps[step].link && (
          <a
            href={steps[step].link!.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-sm font-medium mb-4 hover:bg-white/20 transition-all"
          >
            <ExternalLink size={14} />
            {steps[step].link!.label[lang]}
          </a>
        )}

        {/* Extra tips for each step */}
        {step === 0 && (
          <div className="bg-white/5 rounded-xl p-3 mb-4 text-[11px] text-gray-400 leading-relaxed text-right" dir={isRtl ? "rtl" : "ltr"}>
            <p className="font-semibold text-purple-300 mb-1">
              {locale === "fa" ? "💡 دستورات:" : "💡 Commands:"}
            </p>
            <code className="block bg-black/30 rounded-lg p-2 mt-1 text-[10px] dir-ltr" dir="ltr">
              git init<br/>
              git add -A<br/>
              git commit -m "iGig"<br/>
              git remote add origin https://github.com/YOU/igig.git<br/>
              git push -u origin main
            </code>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white/5 rounded-xl p-3 mb-4 text-[11px] text-gray-400 leading-relaxed" dir={isRtl ? "rtl" : "ltr"}>
            <p className="font-semibold text-purple-300 mb-1">
              {locale === "fa" ? "💡 نکته:" : "💡 Tip:"}
            </p>
            <p>
              {locale === "fa"
                ? "اگه NODE_ENV درست تنظیم نشه، برنامه بیلد نمیشه. مطمئن بشید Framework Preset روی Next.js باشه."
                : "Make sure Framework Preset is set to Next.js in Vercel settings."}
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white/5 rounded-xl p-3 mb-4 text-[11px] text-gray-400 leading-relaxed" dir={isRtl ? "rtl" : "ltr"}>
            <p className="font-semibold text-purple-300 mb-1">
              {locale === "fa" ? "💡 نام متغیر:" : "💡 Variable name:"}
            </p>
            <code className="block bg-black/30 rounded-lg p-2 mt-1 text-[10px]" dir="ltr">
              DATABASE_URL = postgresql://postgres...@supabase.com:6543/postgres
            </code>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white/5 rounded-xl p-3 mb-4 text-[11px] text-gray-400 leading-relaxed" dir={isRtl ? "rtl" : "ltr"}>
            <p className="font-semibold text-purple-300 mb-1">
              {locale === "fa" ? "💡 iPhone?" : "💡 iPhone?"}
            </p>
            <p>
              {locale === "fa"
                ? "در Safari باز کنید → دکمه اشتراک □↑ → Add to Home Screen"
                : "Open in Safari → Share button □↑ → Add to Home Screen"}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 transition-all"
            >
              {isRtl ? <ChevronRight size={16} className="inline ml-1" /> : <ChevronLeft size={16} className="inline mr-1" />}
              {locale === "fa" ? "قبلی" : "Previous"}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 transition-all"
            >
              {locale === "fa" ? "بستن" : "Close"}
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:opacity-90 transition-all"
            >
              {locale === "fa" ? "بعدی" : "Next"}
              {isRtl ? <ChevronLeft size={16} className="inline mr-1" /> : <ChevronRight size={16} className="inline ml-1" />}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              <CheckCircle size={16} />
              {locale === "fa" ? "متوجشم!" : "Got it!"}
            </button>
          )}
        </div>

        {/* Full guide link */}
        <p className="text-center text-[10px] text-gray-500 mt-4">
          {locale === "fa" ? "برای راهنمای کامل" : "For full guide"} →{" "}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 underline"
          >
            {locale === "fa" ? "DEPLOYMENT_GUIDE.md" : "DEPLOYMENT_GUIDE.md"}
          </a>
        </p>
      </div>
    </div>
  );
}
