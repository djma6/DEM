"use client";

import React from "react";
import { X, Music, Heart } from "lucide-react";
import { type Locale } from "@/lib/i18n";

const INSTAGRAM_ID = "DJMA6";
const INSTAGRAM_URL = "https://instagram.com/DJMA6";

function InstagramLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-bold text-pink-300 underline decoration-pink-400/50 underline-offset-2 hover:text-pink-200 transition-colors ${className}`}
      dir="ltr"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
      {INSTAGRAM_ID}
    </a>
  );
}

export default function AboutModal({
  locale,
  onClose,
}: {
  locale: Locale;
  onClose: () => void;
}) {
  const isRtl = locale === "fa";

  const features = isRtl
    ? [
        { icon: "🎧", text: "ایونت‌های خودتون رو ثبت و مدیریت کنید و برای اون‌ها یادآوری دریافت کنید." },
        { icon: "📅", text: "از یک تقویم کاربردی استفاده کنید که مناسبت‌ها و رویدادهای مختلف رو به شکل‌های مختلف به شما نمایش میده." },
        { icon: "💳", text: "شماره کارت خودتون رو به‌راحتی برای مشتری ارسال کنید." },
        { icon: "💰", text: "حساب‌وکتاب هر برنامه رو مدیریت کنید و یک دید بهتر نسبت به درآمدها و هزینه‌های ایونت‌ها داشته باشید." },
        { icon: "☁️", text: "در صورت اجازه دسترسی، اطلاعات ایونت‌ها رو روی Google Drive ذخیره کنید." },
        { icon: "🔐", text: "از اطلاعات خودتون بکاپ آنلاین با Gmail داشته باشید." },
        { icon: "🔄", text: "اطلاعات برنامه رو با Gmail همگام‌سازی کنید تا اطلاعات مهمتون همیشه در دسترس باشه." },
      ]
    : [
        { icon: "🎧", text: "Create and manage your events and get reminders for them." },
        { icon: "📅", text: "Use a practical calendar that shows holidays and occasions clearly." },
        { icon: "💳", text: "Send your bank card number to a client in seconds." },
        { icon: "💰", text: "Track the finances of every gig and see your income and costs." },
        { icon: "☁️", text: "Store your event data on Google Drive when you allow access." },
        { icon: "🔐", text: "Keep an online backup of your data with Gmail." },
        { icon: "🔄", text: "Sync your data with Gmail so it is always available." },
      ];

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-md bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-purple-500/30 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a2e]/95 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
            <span className="text-lg">🇮🇷</span>
            {isRtl ? "درباره iGig" : "About iGig"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Author */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-purple-900/40 to-red-900/25 border border-purple-400/25 rounded-2xl p-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/40">
              <Music size={26} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-snug">
                {isRtl ? "سلام من مسیح نظری یا همون DJMA6 هستم" : "Hi, I'm Masih Nazari, also known as DJMA6"}
              </p>
              <InstagramLink className="text-[11px] mt-1" />
            </div>
          </div>

          {/* Intro */}
          <div className="space-y-3 text-[13px] text-gray-300 leading-relaxed">
            {isRtl ? (
              <>
                <p>از اونجایی که هممون مشغله‌های زیادی داریم و قابلیت اینکه خیلی چیزها رو به ذهنمون بسپاریم، کم‌کم ازمون گرفته شده، از همین جهت شروع به ساخت این برنامه کردم.</p>
                <p>iGig از یک نیاز واقعی شروع شد؛ نیاز به اینکه برنامه‌های کاری، ایونت‌ها، تاریخ‌ها، حساب‌وکتاب‌ها و اطلاعات مهم، همیشه در یک جای ساده و قابل دسترس باشن.</p>
                <p>این برنامه مخصوصاً برای DJها و افرادی که به‌صورت حرفه‌ای در ایونت‌ها فعالیت می‌کنن طراحی شده تا مدیریت برنامه‌ها راحت‌تر و منظم‌تر بشه.</p>
              </>
            ) : (
              <>
                <p>We all carry a lot, and remembering every detail keeps getting harder. That is why I started building this app.</p>
                <p>iGig began from a real need: keeping your gigs, dates, finances and important details in one simple, accessible place.</p>
                <p>It is made especially for DJs and people who work professionally at events, so managing your schedule becomes easier and more organised.</p>
              </>
            )}
          </div>

          {/* Features */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs font-bold text-purple-300 mb-3">
              {isRtl ? "با iGig می‌تونید:" : "With iGig you can:"}
            </p>
            <ul className="space-y-2.5">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-sm flex-shrink-0 leading-relaxed">{f.icon}</span>
                  <span className="text-[12px] text-gray-300 leading-relaxed">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Closing words */}
          <div className="space-y-3 text-[13px] text-gray-300 leading-relaxed">
            {isRtl ? (
              <>
                <p>هدف من از ساخت iGig این بوده که بخشی از دغدغه‌های ذهنی شما رو کم کنم؛ تا به جای اینکه مدام به یاد بیارید «ایونت بعدیم کیه؟»، «حساب این برنامه چی شد؟» یا «فلان تاریخ چه برنامه‌ای دارم؟»، iGig این کارها رو براتون ساده‌تر انجام بده.</p>
                <p>این تازه شروع راه iGig هست و امیدوارم با پیشنهادها و نظرات شما، هر روز امکانات بهتر و کاربردی‌تری بهش اضافه بشه.</p>
                <p>امیدوارم روزی برسه برای همتون که با نوتیف ایونت‌های خیلی خفن از این اپلیکیشن روزتون رو شروع کنید و همه روزهای تقویمتون رو با اسم و عددهای خیلی خیلی خوب پر کنید.</p>
              </>
            ) : (
              <>
                <p>My goal with iGig is to take some weight off your mind, so instead of constantly asking yourself when your next gig is or what you were paid, iGig handles it for you.</p>
                <p>This is just the beginning, and I hope it keeps improving with your feedback and suggestions.</p>
                <p>I hope you all start your days with notifications about amazing gigs, and fill every day of your calendar with great names and even better numbers.</p>
              </>
            )}
          </div>

          {/* Signature */}
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-sm font-bold text-white">
              {isRtl ? "به امید موفقیت برای همه" : "Wishing everyone success"}
            </span>
            <Heart size={15} className="text-red-400 fill-red-400" />
          </div>

          {/* Advertising note */}
          <div className="bg-gradient-to-r from-purple-600/15 to-pink-600/15 border border-pink-400/25 rounded-2xl p-4 text-center">
            <p className="text-[12px] text-gray-300 leading-relaxed">
              {isRtl
                ? "برای ثبت تبلیغاتتون در برنامه، با آیدی اینستاگرام "
                : "To advertise in the app, get in touch on Instagram "}
              <InstagramLink />
              {isRtl ? " در ارتباط باشید." : "."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1a1a2e]/95 backdrop-blur-xl border-t border-white/5 p-4">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-red-600 text-white text-sm font-bold active:scale-[0.98] transition-all"
          >
            {isRtl ? "بستن" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
