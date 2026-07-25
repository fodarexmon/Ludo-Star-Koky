import React, { useEffect } from "react";
import { Avatar } from "./Avatar";
import { getCountry } from "@/data/countries";
import { STORE_ITEMS } from "@/data/store";

export interface ProfileModalProps {
  profile: any | null;
  rank?: number;
  onClose: () => void;
}

export function ProfileModal({ profile, rank, onClose }: ProfileModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!profile) return null;

  const stats = profile.stats || {};
  const gamesPlayed = stats.gamesPlayed || 0;
  const wins = stats.wins || 0;
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
  const totalPoints = stats.totalPoints || 0;
  const coins = stats.coins || 0;
  const piecesEaten = stats.piecesEaten || stats.kills || 0;
  const flawlessWins = stats.flawlessWins || 0;
  const maxWinStreak = stats.maxWinStreak || 0;
  const currentWinStreak = stats.currentWinStreak || 0;
  const country = getCountry(profile.country || "US");

  // Compute dynamic titles based on skill and play history
  const badges: string[] = [];
  if (totalPoints >= 500 || (winRate >= 70 && gamesPlayed >= 10)) badges.push("🔥 أسطورة اللودو");
  else if (wins >= 20 || (winRate >= 50 && gamesPlayed >= 5)) badges.push("⚔️ محترف منافس");
  else badges.push("🌟 مبارز صاعد");

  if (gamesPlayed >= 100) badges.push("🎲 لعيب مخضرم");
  else if (gamesPlayed >= 20) badges.push("🛡️ مقاتل متمرس");
  else if (gamesPlayed > 0) badges.push("🚀 مستكشف الطاولة");

  if (flawlessWins >= 3) badges.push("👑 الملك الذي لا يُقهر");
  else if (maxWinStreak >= 5) badges.push("⚡ سلسلة انتصارات نارية");

  // Get equipped items names
  const equipped = profile.equipped || {};
  const equippedItems = Object.values(equipped).map((id) =>
    STORE_ITEMS.find((item) => item.id === id)
  ).filter(Boolean);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-w-md w-full rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-b from-[#1e2038] to-[#0e101a] shadow-[0_0_60px_rgba(250,204,21,0.2)] text-white relative flex flex-col max-h-[92vh]">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-amber-500/30 via-purple-600/30 to-sky-500/30 relative flex-shrink-0 border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 border border-white/20 hover:bg-black/80 hover:scale-105 transition-all text-white font-bold flex items-center justify-center text-lg z-20 shadow-md"
            title="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 -mt-14 relative flex-1 overflow-y-auto space-y-5 flex flex-col items-center text-center">
          {/* Avatar and Identity */}
          <div className="relative">
            <div className="relative z-10 filter drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]">
              <Avatar id={profile.avatar_id || "a1"} size={92} frameThemeId={profile.equipped?.frame} />
            </div>
            {rank !== undefined && (
              <span className="absolute -bottom-2 right-1/2 translate-x-1/2 z-20 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs px-3 py-1 rounded-full shadow-lg border border-white/40 whitespace-nowrap">
                🏆 المركز #{rank}
              </span>
            )}
          </div>

          <div className="space-y-1 w-full mt-2">
            <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-md text-amber-300">
              {profile.display_name || "Player"}
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
              <span className="text-lg">{country.flag}</span>
              <span>{country.name}</span>
            </div>
          </div>

          {/* Badges / Titles */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full">
            {badges.map((badge, idx) => (
              <span key={idx} className="bg-white/10 hover:bg-white/15 border border-white/10 text-xs px-3 py-1 rounded-full text-amber-200/90 font-medium tracking-wide transition-all shadow-sm">
                {badge}
              </span>
            ))}
          </div>

          {/* Core Highlights Grid */}
          <div className="grid grid-cols-3 gap-3 w-full bg-black/40 p-3 rounded-2xl border border-white/10 shadow-inner text-center">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xl font-black text-yellow-400 drop-shadow flex items-center gap-1">
                {coins}
              </span>
              <span className="text-[11px] text-gray-400 mt-1">💰 عملات</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xl font-black text-amber-300 drop-shadow">
                {totalPoints}
              </span>
              <span className="text-[11px] text-gray-400 mt-1">⭐ نقاط</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xl font-black text-emerald-400 drop-shadow">
                {winRate}%
              </span>
              <span className="text-[11px] text-gray-400 mt-1">🎯 نسبة الفوز</span>
            </div>
          </div>

          {/* Detailed Combat Stats */}
          <div className="w-full bg-white/[0.03] rounded-2xl p-4 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/80 text-right w-full border-b border-white/10 pb-2">
              📊 إحصائيات المعارك والمواجهات
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-right">
              <div className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-xl border border-white/5">
                <span className="font-bold text-white">{gamesPlayed}</span>
                <span className="text-gray-400 text-xs">🎮 المباريات الملعوبة</span>
              </div>
              <div className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-xl border border-white/5">
                <span className="font-bold text-emerald-400">{wins}</span>
                <span className="text-gray-400 text-xs">👑 إجمالي الانتصارات</span>
              </div>
              <div className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-xl border border-white/5">
                <span className="font-bold text-amber-400">{piecesEaten}</span>
                <span className="text-gray-400 text-xs">⚔️ قطع خصم مأكولة</span>
              </div>
              <div className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-xl border border-white/5">
                <span className="font-bold text-purple-400">{flawlessWins}</span>
                <span className="text-gray-400 text-xs">🛡️ انتصار نظيف</span>
              </div>
              <div className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-xl border border-white/5">
                <span className="font-bold text-yellow-300">{maxWinStreak}</span>
                <span className="text-gray-400 text-xs">🔥 أعلى سلسلة فوز</span>
              </div>
              <div className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-xl border border-white/5">
                <span className="font-bold text-sky-400">{currentWinStreak}</span>
                <span className="text-gray-400 text-xs">🚀 السلسلة الحالية</span>
              </div>
            </div>
          </div>

          {/* Equipped Inventory Section */}
          <div className="w-full bg-white/[0.03] rounded-2xl p-4 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300/80 text-right w-full border-b border-white/10 pb-2 flex items-center justify-between">
              <span className="text-white text-[11px] font-normal bg-purple-500/20 px-2 py-0.5 rounded">
                مقتنيات مجهزة ({equippedItems.length})
              </span>
              <span>🎒 المظهر والتجهيزات</span>
            </h3>
            {equippedItems.length > 0 ? (
              <div className="flex flex-wrap justify-end gap-2">
                {equippedItems.map((item: any) => (
                  <span key={item.id} className="bg-purple-950/40 border border-purple-500/30 text-purple-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-sm">{item.icon}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-2 italic">
                يستخدم التصاميم الكلاسيكية الافتراضية 🎲
              </p>
            )}
          </div>

          {/* Close Action */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 transition-all text-base mt-2"
          >
            إغلاق الملف الشخصي
          </button>
        </div>
      </div>
    </div>
  );
}
