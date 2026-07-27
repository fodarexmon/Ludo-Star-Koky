import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { Avatar } from "@/components/Avatar";
import { loadProfile } from "@/lib/profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ludo Star — Classic Ludo, Online & Offline" },
      { name: "description", content: "Play classic Ludo against friends on the same device, vs. computer, or online with friends in private rooms." },
      { property: "og:title", content: "Ludo Star — Classic Ludo, Online & Offline" },
      { property: "og:description", content: "Classic Ludo with offline pass-and-play, AI opponents, and online private rooms." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const initial = loadProfile();
  const [coins, setCoins] = useState<number | null>(null);
  const [avatarId, setAvatarId] = useState<string>(initial.avatarId || "a1");
  const [displayName, setDisplayName] = useState<string>(initial.displayName || "Player");
  const [frameThemeId, setFrameThemeId] = useState<string | undefined>(undefined);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let unsubSnap: (() => void) | undefined;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (unsubSnap) unsubSnap();
      if (user) {
        setIsSignedIn(true);
        unsubSnap = onSnapshot(doc(db, "profiles", user.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const currentCoins = data?.stats?.coins !== undefined ? data.stats.coins : 0;
            if (currentCoins < 0) {
              updateDoc(doc(db, "profiles", user.uid), { "stats.coins": 500 }).catch(console.error);
              setCoins(500);
            } else {
              setCoins(currentCoins);
            }
            setAvatarId(data?.avatar_id || user.photoURL || "a1");
            setDisplayName(data?.display_name || user.displayName || "Player");
            setFrameThemeId(data?.equipped?.frame);
          } else {
            setCoins(0);
            setAvatarId(user.photoURL || initial.avatarId || "a1");
            setDisplayName(user.displayName || initial.displayName || "Player");
            setFrameThemeId(undefined);
          }
        });
      } else {
        setIsSignedIn(false);
        setCoins(null);
        const loc = loadProfile();
        setAvatarId(loc.avatarId || "a1");
        setDisplayName(loc.displayName || "Player");
        setFrameThemeId(undefined);
      }
    });
    return () => {
      unsubAuth();
      if (unsubSnap) unsubSnap();
    };
  }, []);

  async function handleSignOut() {
    await signOut(auth);
    setCoins(null);
    const loc = loadProfile();
    setAvatarId(loc.avatarId || "a1");
    setDisplayName(loc.displayName || "Player");
    setFrameThemeId(undefined);
    setIsSignedIn(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative">
      {/* User Menu Backdrop */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}

      {/* Top Left Avatar & Dropdown */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="relative group focus:outline-none hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-lg"
          title="قائمة اللاعب"
        >
          <Avatar id={avatarId} size={42} frameThemeId={frameThemeId} ring="var(--primary)" />
          <div className="pr-2 text-white font-bold text-sm hidden sm:block truncate max-w-[100px]">{displayName}</div>
          <svg className="w-4 h-4 text-gray-300 mr-1 transform group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showUserMenu && (
          <div className="absolute top-14 left-0 w-52 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/10 rounded-2xl p-2 shadow-[0_0_35px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150 text-right" dir="rtl">
            <div className="px-3 py-2 border-b border-white/10 mb-1">
              <div className="font-bold text-sm text-white truncate">{displayName}</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {isSignedIn ? "متصل بحساب Google" : "وضع الضيف"}
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate({ to: "/settings" });
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-200 hover:text-white hover:bg-white/10 transition-colors text-right cursor-pointer"
              >
                <span className="text-lg">⚙️</span>
                <span>الإعدادات</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-right cursor-pointer"
              >
                <span className="text-lg">🚪</span>
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Coin Display at Top Right */}
      {coins !== null && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg animate-in fade-in zoom-in slide-in-from-top-4 z-40">
          <span className="font-black text-xl text-yellow-400 drop-shadow-md">{coins}</span>
          <img src="/coin.png" alt="Coins" className="w-8 h-8 drop-shadow-lg" />
        </div>
      )}

      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 grid h-24 w-24 grid-cols-2 grid-rows-2 gap-1 rounded-2xl p-2 shadow-2xl" style={{ background: "var(--board-bg)" }}>
            <div className="rounded-md" style={{ background: "var(--ludo-red)" }} />
            <div className="rounded-md" style={{ background: "var(--ludo-green)" }} />
            <div className="rounded-md" style={{ background: "var(--ludo-blue)" }} />
            <div className="rounded-md" style={{ background: "var(--ludo-yellow)" }} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Ludo Star</h1>
          <p className="mt-2 text-muted-foreground">The classic board game — your way.</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/play/offline" className="btn-game text-lg">🎲 Play Offline</Link>
          <Link to="/play/online" className="btn-game text-lg">🌐 Play Online</Link>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Link to="/store" className="btn-ghost !py-4 text-sm whitespace-nowrap !bg-gradient-to-r !from-green-500/20 !to-emerald-600/20 !border-green-500/50 hover:!from-green-500/40 hover:!to-emerald-600/40">🛒 المتجر</Link>
            <Link to="/friends" className="btn-ghost !py-4 text-sm whitespace-nowrap !bg-gradient-to-r !from-sky-500/20 !to-blue-600/20 !border-sky-500/50 hover:!from-sky-500/40 hover:!to-blue-600/40">👥 الأصدقاء</Link>
            <Link to="/achievements" className="btn-ghost !py-4 text-sm whitespace-nowrap !bg-gradient-to-r !from-yellow-500/20 !to-amber-600/20 !border-yellow-500/50 hover:!from-yellow-500/40 hover:!to-amber-600/40">🏆 الإنجازات</Link>
            <Link to="/leaderboard" className="btn-ghost !py-4 text-sm whitespace-nowrap">🥇 لوحة الشرف</Link>
            <Link to="/settings" className="btn-ghost !py-4 text-sm whitespace-nowrap col-span-2">⚙️ الإعدادات</Link>
            <Link to="/instructions" className="btn-ghost !py-4 text-sm whitespace-nowrap col-span-2 !bg-gradient-to-r !from-purple-500/20 !to-fuchsia-600/20 !border-purple-500/50 hover:!from-purple-500/40 hover:!to-fuchsia-600/40">📖 التعليمات والقواعد</Link>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-950 border border-red-500/30 w-full max-w-sm rounded-2xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.2)] text-center animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-black text-white mb-2">تأكيد تسجيل الخروج</h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟<br />
              <span className="text-xs text-red-400 font-medium block mt-2">⚠️ تنبيه: سيتم إيقاف المزامنة السحابية الفورية لإحصائياتك وألقابك حتى تقم بتسجيل الدخول مجدداً!</span>
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await handleSignOut();
                }}
                className="btn-ghost flex-1 !text-red-400 border border-red-500/30 hover:bg-red-500/20 py-2 rounded-xl font-bold transition-all"
              >
                نعم، خروج
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-game flex-1 !bg-slate-800 hover:!bg-slate-700 !border-slate-700 py-2 rounded-xl font-bold transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
