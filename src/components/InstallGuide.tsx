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

// ── Google Cloud / OAuth setup guide (step-by-step) ──
const googleGuideSteps = [
  {
    title: { fa: "ساخت پروژه گوگل کلود", en: "Create Google Cloud Project" },
    desc: {
      fa: "وارد Google Cloud Console شوید و یک پروژه جدید بسازید:",
      en: "Go to Google Cloud Console and create a new project:",
    },
    link: {
      url: "https://console.cloud.google.com/projectcreate",
      label: { fa: "ساخت پروژه", en: "Create Project" },
    },
    code: { fa: "", en: "" },
  },
  {
    title: { fa: "فعال‌سازی OAuth Consent Screen", en: "Configure OAuth Consent Screen" },
    desc: {
      fa: "از منوی APIs & Services وارد OAuth consent screen شوید:",
      en: "From APIs & Services, go to OAuth consent screen:",
    },
    link: {
      url: "https://console.cloud.google.com/apis/credentials/consent",
      label: { fa: "باز کردن Consent Screen", en: "Open Consent Screen" },
    },
    code: {
      fa: `📋 تنظیمات مورد نیاز:
• User Type: External
• App name: iGig (یا هر نامی)
• User support email: ایمیل خودتان
• Developer contact: اینترنت خودتان
• Scopes: دکمه Add گزینه‌ها:
  - .../auth/userinfo.email
  - .../auth/userinfo.profile
  - .../auth/drive.appdata
• Test users: ایمیل Google خود را اضافه کنید`,
      en: `📋 Required settings:
• User Type: External
• App name: iGig
• User support email: your email
• Developer contact: your email
• Scopes: click Add:
  - .../auth/userinfo.email
  - .../auth/userinfo.profile
  - .../auth/drive.appdata
• Test users: add your Google email`,
    },
  },
  {
    title: { fa: "فعال‌سازی Google Drive API", en: "Enable Google Drive API" },
    desc: {
      fa: "برای کارکرد پشتیبان‌گیری، باید سرویس گوگل درایو را در پروژه فعال (Enable) کنید:",
      en: "To enable Google Drive backups, enable the Google Drive API in your project:",
    },
    link: {
      url: "https://console.cloud.google.com/apis/library/drive.googleapis.com",
      label: { fa: "فعال‌سازی Google Drive API", en: "Enable Google Drive API" },
    },
    code: {
      fa: `📋 اقدام لازم:
۱. روی لینک بالا کلیک کنید.
۲. دکمه آبی ENABLE را بزنید.
(اگر فعال باشد، دکمه Manage را می‌بینید)`,
      en: `📋 Action needed:
1. Click the link above.
2. Click the blue ENABLE button.
(If already enabled, you will see 'Manage')`,
    },
  },
  {
    title: { fa: "ساخت OAuth Client ID", en: "Create OAuth Client ID" },
    desc: {
      fa: "از بخش Credentials یک OAuth Client ID وب بسازید:",
      en: "From Credentials, create a Web OAuth Client ID:",
    },
    link: {
      url: "https://console.cloud.google.com/apis/createcredentials/oauthclientid",
      label: { fa: "ساخت Client ID", en: "Create Client ID" },
    },
    code: {
      fa: `📋 تنظیمات:
• Application type: Web application
• Name: iGig Web
• Authorized JavaScript origins:
  - https://YOUR-VERCEL-APP.vercel.app
  (آدرس Vercel برنامه‌تان را بزنید)
• Authorized redirect URIs:
  - https://YOUR-VERCEL-APP.vercel.app
  `,
      en: `📋 Settings:
• Application type: Web application
• Name: iGig Web
• Authorized JavaScript origins:
  - https://YOUR-VERCEL-APP.vercel.app
  (Your actual Vercel URL)
• Authorized redirect URIs:
  - https://YOUR-VERCEL-APP.vercel.app
`,
    },
  },
  {
    title: { fa: "کپی Client ID", en: "Copy Client ID" },
    desc: {
      fa: "بعد از Save، Client ID به شما نمایش داده می‌شود:",
      en: "After saving, a Client ID will be shown to you:",
    },
    link: null,
    code: {
      fa: `📋 نمونه:
123456789-abc123xyz.apps.googleusercontent.com

این کد رو کپی کنید (میتوانید آن را در نوت‌پد ذخیره کنید)
`,
      en: `📋 Example:
123456789-abc123xyz.apps.googleusercontent.com

Copy this code (you can save it to a notepad)
`,
    },
  },
  {
    title: { fa: "افزودن به Vercel", en: "Add to Vercel" },
    desc: {
      fa: "Client ID را در Vercel به عنوان Environment Variable اضافه کنید:",
      en: "Add the Client ID to Vercel as an Environment Variable:",
    },
    link: {
      url: "https://vercel.com",
      label: { fa: "باز کردن Vercel", en: "Open Vercel" },
    },
    code: {
      fa: `📋 قدم‌ها:
1. پروژه DEM را در Vercel بزنید
2. Settings → Environment Variables
3. Add New:
   Key: NEXT_PUBLIC_GOOGLE_CLIENT_ID
   Value: <Client ID که کپی کردید>
4. همه environmentها را تیک بزنید (Production, Preview, Development)
5. Save و سپس Redeploy کنید`,
      en: `📋 Steps:
1. Open your Vercel project (DEM)
2. Settings → Environment Variables
3. Add New:
   Key: NEXT_PUBLIC_GOOGLE_CLIENT_ID
   Value: <the Client ID you copied>
4. Check all environments (Production, Preview, Development)
5. Save, then Redeploy`,
    },
  },
  {
    title: { fa: "امتحان کنید!", en: "Test It!" },
    desc: {
      fa: "حالا صفحه ثبت‌نام برنامه را باز کنید و با Google وارد شوید:",
      en: "Now open your app's setup screen and try signing in with Google:",
    },
    link: null,
    code: {
      fa: `✅ اگر همه چیز درست باشد:
• پنجره ورود گوگل باز می‌شود
• وارد حساب Google خود شوید
• اجازه دسترسی به Drive را تأیید کنید
• نام و ایمیل شما خودکار پر می‌شود!

🔄 حالا شماره همراه خود را وارد کنید و شروع کنید!`,
      en: `✅ If everything works:
• Google sign-in popup opens
• Sign in to your Google account
• Approve Drive access
• Your name & email auto-fill!

🔄 Now enter your phone number and start!`,
    },
  },
];

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

export type GuideMode = "deploy" | "google";

export default function InstallGuide({
  locale,
  onClose,
  mode = "deploy",
}: {
  locale: "fa" | "en";
  onClose: () => void;
  mode?: GuideMode;
}) {
  const [step, setStep] = useState(0);
  const isRtl = locale === "fa";
  const lang = locale === "fa" ? "fa" : "en";
  const googleSteps = mode === "google";
  const list = googleSteps ? googleGuideSteps : steps;

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gradient-to-br from-[#1a0a2e] via-[#1a1a2e] to-[#2e0a1a] rounded-3xl border border-purple-500/30 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-purple-300">
            {googleSteps
              ? locale === "fa" ? "🔐 راهنمای راه‌اندازی گوگل" : "🔐 Google Setup Guide"
              : locale === "fa" ? "📦 راهنمای نصب و انتشار" : "📦 Install & Deploy Guide"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-5">
          {list.map((_, i) => (
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
          {locale === "fa" ? `قدم` : "Step"} {step + 1} {locale === "fa" ? "از" : "of"} {list.length}
        </p>

        {/* Step Content */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/30 to-red-600/30 flex items-center justify-center mx-auto mb-4 text-purple-300">
            {googleSteps ? <Globe size={24} /> : (steps[step]?.icon || <Globe size={24} />)}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {list[step]?.title?.[lang] ?? ""}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {list[step]?.desc?.[lang] ?? ""}
          </p>
        </div>

        {/* Link button */}
        {list[step]?.link && (
          <a
            href={list[step]!.link!.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-sm font-medium mb-4 hover:bg-white/20 transition-all"
          >
            <ExternalLink size={14} />
            {list[step]!.link!.label[lang]}
          </a>
        )}

        {/* Code / detail block */}
        {(() => {
          const s = list[step] as { code?: { fa: string; en: string } } | undefined;
          const codeText = s?.code?.[lang];
          if (!codeText) return null;
          return (
            <div className="bg-white/5 rounded-xl p-3 mb-4 text-[11px] text-gray-300 leading-relaxed text-right" dir={isRtl ? "rtl" : "ltr"}>
              <pre className="bg-black/30 rounded-lg p-3 mt-1 text-[10px] whitespace-pre-wrap font-mono overflow-x-auto dir-ltr" dir="ltr">
                {codeText}
              </pre>
            </div>
          );
        })()}

        {/* Extra tips for each step (deploy mode only) */}
        {!googleSteps && step === 0 && (
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

        {!googleSteps && step === 1 && (
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

        {!googleSteps && step === 2 && (
          <div className="bg-white/5 rounded-xl p-3 mb-4 text-[11px] text-gray-400 leading-relaxed" dir={isRtl ? "rtl" : "ltr"}>
            <p className="font-semibold text-purple-300 mb-1">
              {locale === "fa" ? "💡 نام متغیر:" : "💡 Variable name:"}
            </p>
            <code className="block bg-black/30 rounded-lg p-2 mt-1 text-[10px]" dir="ltr">
              DATABASE_URL = postgresql://postgres...@supabase.com:6543/postgres
            </code>
          </div>
        )}

        {!googleSteps && step === 3 && (
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
          {step < list.length - 1 ? (
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
