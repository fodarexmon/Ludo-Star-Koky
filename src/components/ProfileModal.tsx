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

  // Revolutionary Multi-Dimensional Smart Badge System (Max 7 badges sorted by rarity & weight)
  interface Badge { label: string; weight: number; style: string; tier: string; }
  const allBadges: Badge[] = [];

  const mythicStyle = "bg-gradient-to-r from-amber-500/30 via-red-500/30 to-purple-600/30 border border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-pulse";
  const legendaryStyle = "bg-gradient-to-r from-yellow-500/20 via-amber-600/20 to-orange-600/20 border border-yellow-400/60 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.3)]";
  const epicStyle = "bg-gradient-to-r from-purple-600/25 to-fuchsia-600/25 border border-purple-400/50 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.3)]";
  const rareStyle = "bg-gradient-to-r from-sky-500/20 to-blue-600/20 border border-sky-400/40 text-sky-200";
  const normalStyle = "bg-white/10 hover:bg-white/15 border border-white/15 text-gray-300";

  // 1. Skill & Win Rate Supremacy
  if (winRate >= 80 && gamesPlayed >= 25) allBadges.push({ label: "💎 إمبراطور اللودو المطلق", weight: 150, tier: "mythic", style: mythicStyle });
  else if (winRate >= 70 && gamesPlayed >= 15) allBadges.push({ label: "👑 جلاد الخصوم (70%+)", weight: 95, tier: "legendary", style: legendaryStyle });
  else if (winRate >= 60 && gamesPlayed >= 10) allBadges.push({ label: "🔥 أسطورة المنافسين", weight: 75, tier: "epic", style: epicStyle });
  else if (winRate >= 50 && gamesPlayed >= 5) allBadges.push({ label: "⚔️ محترف تكتيكي", weight: 50, tier: "rare", style: rareStyle });
  else if (gamesPlayed >= 1) allBadges.push({ label: "🌟 مبارز صاعد", weight: 20, tier: "normal", style: normalStyle });

  // 2. Playstyle & Combat Archetype
  const avgKills = gamesPlayed > 0 ? piecesEaten / gamesPlayed : 0;
  if (piecesEaten >= 200 || (avgKills >= 3.0 && gamesPlayed >= 10)) allBadges.push({ label: "👹 جزار الطاولة المرعب", weight: 140, tier: "mythic", style: mythicStyle });
  else if (piecesEaten >= 100 || (avgKills >= 2.2 && gamesPlayed >= 5)) allBadges.push({ label: "💥 كابوس الزوايا والخصوم", weight: 90, tier: "legendary", style: legendaryStyle });
  else if (piecesEaten >= 40 || avgKills >= 1.5) allBadges.push({ label: "⚔️ المفترس الشرس", weight: 65, tier: "epic", style: epicStyle });
  else if (piecesEaten >= 10) allBadges.push({ label: "🎯 قناص القطع", weight: 45, tier: "rare", style: rareStyle });
  else if (winRate >= 55 && avgKills <= 1.0 && gamesPlayed >= 5) allBadges.push({ label: "🧠 الداهية التكتيكي الهادئ", weight: 70, tier: "epic", style: epicStyle });

  // 3. Win Streaks & Flawless Mastery
  if (maxWinStreak >= 15) allBadges.push({ label: "⚡ سيرة رعب متواصلة (15+)", weight: 145, tier: "mythic", style: mythicStyle });
  else if (maxWinStreak >= 10) allBadges.push({ label: "🌪️ إعصار لا يهدأ (10+)", weight: 92, tier: "legendary", style: legendaryStyle });
  else if (maxWinStreak >= 5) allBadges.push({ label: "🔥 عاصفة اللودو (5+)", weight: 68, tier: "epic", style: epicStyle });

  if (flawlessWins >= 20) allBadges.push({ label: "🚫 المحظور لمسه (Immortal)", weight: 138, tier: "mythic", style: mythicStyle });
  else if (flawlessWins >= 10) allBadges.push({ label: "👑 المالك للأرض (10+ Flawless)", weight: 88, tier: "legendary", style: legendaryStyle });
  else if (flawlessWins >= 3) allBadges.push({ label: "🛡️ فائز ساحق ونظيف", weight: 62, tier: "epic", style: epicStyle });
  else if (flawlessWins >= 1) allBadges.push({ label: "✨ أول انتصار ساحق", weight: 25, tier: "normal", style: normalStyle });

  // 4. Cumulative Points Tiers
  if (totalPoints >= 10000) allBadges.push({ label: "🌌 زعيم المجرة (10k+)", weight: 135, tier: "mythic", style: mythicStyle });
  else if (totalPoints >= 5000) allBadges.push({ label: "👑 جنرال اللودو (5k+)", weight: 85, tier: "legendary", style: legendaryStyle });
  else if (totalPoints >= 2000) allBadges.push({ label: "🎖️ بطل ذهبي (2k+)", weight: 66, tier: "epic", style: epicStyle });
  else if (totalPoints >= 500) allBadges.push({ label: "🏅 منافس بارع", weight: 44, tier: "rare", style: rareStyle });

  // 5. Wealth & Prestige
  if (coins >= 100000) allBadges.push({ label: "👑 عملاق الذهب (100k+ 💰)", weight: 130, tier: "mythic", style: mythicStyle });
  else if (coins >= 25000) allBadges.push({ label: "💰 المليونير الماسي", weight: 82, tier: "legendary", style: legendaryStyle });
  else if (coins >= 5000) allBadges.push({ label: "🪙 ثري الطاولات", weight: 58, tier: "rare", style: rareStyle });

  if (profile.equipped?.frame && profile.equipped?.board) allBadges.push({ label: "🎨 أيقونة الموضة الملكية", weight: 80, tier: "legendary", style: legendaryStyle });
  else if (profile.equipped?.frame || profile.equipped?.board || profile.equipped?.dice) allBadges.push({ label: "🛍️ متذوق المقتنيات الخاصة", weight: 38, tier: "normal", style: normalStyle });

  // 6. Veterancy & Experience
  if (gamesPlayed >= 500) allBadges.push({ label: "🏛️ أسطورة النادي المخضرمة", weight: 125, tier: "mythic", style: mythicStyle });
  else if (gamesPlayed >= 200) allBadges.push({ label: "⚔️ محارب معارك الزمن الجميل", weight: 84, tier: "legendary", style: legendaryStyle });
  else if (gamesPlayed >= 50) allBadges.push({ label: "🛡️ لعيب متمرس (50+)", weight: 61, tier: "epic", style: epicStyle });
  else if (gamesPlayed >= 10) allBadges.push({ label: "🎲 عاشق المغامرة", weight: 41, tier: "rare", style: rareStyle });
  else allBadges.push({ label: "🚀 مستكشف جديد", weight: 15, tier: "normal", style: normalStyle });

  // Sort by weight (highest prestige first) and cap strictly at maximum of 7 badges!
  allBadges.sort((a, b) => b.weight - a.weight);
  const displayBadges = allBadges.slice(0, 7);

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

          {/* Badges / Titles (Max 7 sorted by prestige and rarity) */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full my-1">
            {displayBadges.map((badge, idx) => (
              <span 
                key={idx} 
                className={`text-xs px-3.5 py-1.5 rounded-full font-bold tracking-wide transition-all transform hover:scale-105 shadow-sm flex items-center gap-1 ${badge.style}`}
                title={`الندرة: ${badge.tier.toUpperCase()} — التقييم الشرفي: ${badge.weight}`}
              >
                {badge.label}
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
