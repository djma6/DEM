"use client";

import React, { useEffect, useState } from "react";
import { Music, Globe, Share, Plus, CheckCircle, Smartphone } from "lucide-react";
import { translations, type Locale } from "@/lib/i18n";
import { isIOS, type BeforeInstallPromptEvent } from "@/lib/pwa";

export default function InstallGate({
  locale,
  onLocaleToggle,
  onSkip,
}: {
  locale: Locale;
  onLocaleToggle: () => void;
  onSkip: () => void;
}) {
  const t = translations[locale];
  const isRtl = locale === "fa";
  const ios = isIOS();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  const steps = ios
    ? [t.installIosStep1, t.installIosStep2, t.installIosStep3, t.installIosStep4]
    : [t.installAndroidStep1, t.installAndroidStep2, t.installAndroidStep3, t.installAndroidStep4];

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Language toggle */}
        <div className="flex justify-end mb-3">
          <button
            onClick={onLocaleToggle}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-xs text-purple-300 hover:bg-white/10 hover:border-purple-400/40 transition-all active:scale-95"
          >
            <Globe size={14} />
            {locale === "fa" ? "English" : "فارسی"}
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/50">
            <Music size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent mb-2">
            {t.appName}
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">{t.installRequiredDesc}</p>
        </div>

        {/* Native install button (Android/Chrome) */}
        {deferred && (
          <button
            onClick={triggerInstall}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-red-600 text-white font-bold text-base shadow-2xl shadow-purple-500/40 active:scale-[0.98] transition-all mb-4"
          >
            <Plus size={20} />
            {t.installNow}
          </button>
        )}

        {/* Manual steps */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
            {ios ? <Share size={15} /> : <Smartphone size={15} />}
            {ios ? t.installIosTitle : t.installAndroidTitle}
          </h2>
          <ol className="space-y-2.5">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-400/40 text-purple-200 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-gray-300 leading-relaxed">{s.replace(/^[۰-۹0-9]+\.\s*/, "")}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 mb-4">
          <p className="text-[11px] text-amber-200 leading-relaxed text-center">{t.installAfterOpen}</p>
        </div>

        <button
          onClick={onSkip}
          className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle size={14} />
          {t.alreadyInstalled}
        </button>
      </div>
    </div>
  );
}
