"use client";

import React, { useEffect, useRef, useState } from "react";
import { Megaphone } from "lucide-react";
import { type Locale } from "@/lib/i18n";

export interface AdSlide {
  id: string;
  /** Optional image; when omitted a branded placeholder is shown */
  image?: string;
  /** Optional link opened when the slide is tapped */
  href?: string;
  faTitle?: string;
  enTitle?: string;
  faSubtitle?: string;
  enSubtitle?: string;
  /** Tailwind gradient classes for the placeholder background */
  gradient?: string;
}

/**
 * Empty advertising slider shown on the dashboard.
 * Pass `slides` later to fill it with real campaigns.
 */
export default function AdSlider({
  locale,
  slides = [],
  intervalMs = 5000,
}: {
  locale: Locale;
  slides?: AdSlide[];
  intervalMs?: number;
}) {
  const isRtl = locale === "fa";
  const placeholders: AdSlide[] = [
    { id: "ph-1", gradient: "from-purple-600/25 via-[#1a1a2e] to-blue-600/25" },
    { id: "ph-2", gradient: "from-red-600/25 via-[#1a1a2e] to-purple-600/25" },
    { id: "ph-3", gradient: "from-blue-600/25 via-[#1a1a2e] to-emerald-600/25" },
  ];
  const data = slides.length > 0 ? slides : placeholders;

  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    if (data.length <= 1) return;
    const timer = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % data.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [data.length, intervalMs]);

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + data.length) % data.length);

  const onTouchStart = (e: React.TouchEvent) => {
    paused.current = true;
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    paused.current = false;
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    // In RTL a swipe left should advance, mirrored for LTR
    const forward = isRtl ? delta > 0 : delta < 0;
    go(forward ? 1 : -1);
  };

  const active = data[index];
  const title = locale === "fa" ? active.faTitle : active.enTitle;
  const subtitle = locale === "fa" ? active.faSubtitle : active.enSubtitle;

  const Slide = (
    <div
      className={`relative w-full h-24 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br ${
        active.gradient || "from-purple-600/25 via-[#1a1a2e] to-blue-600/25"
      }`}
    >
      {active.image ? (
        <img src={active.image} alt={title || ""} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-4 text-center">
          {title ? (
            <>
              <p className="text-sm font-bold text-white">{title}</p>
              {subtitle && <p className="text-[11px] text-gray-300">{subtitle}</p>}
            </>
          ) : (
            <>
              <Megaphone size={20} className="text-white/25" />
              <p className="text-[10px] text-white/30">
                {locale === "fa" ? "فضای تبلیغات" : "Advertising space"}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="mt-3" dir={isRtl ? "rtl" : "ltr"}>
      <div
        className="relative select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        {active.href ? (
          <a href={active.href} target="_blank" rel="noopener noreferrer" className="block active:scale-[0.99] transition-transform">
            {Slide}
          </a>
        ) : (
          Slide
        )}
      </div>

      {data.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {data.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-purple-400" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
