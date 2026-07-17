import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";
import { ACHIEVEMENTS } from "@/data/achievements";

export const Route = createFileRoute("/achievements")({
  component: AchievementsPage,
});

function AchievementsPage() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        unsubProfile = onSnapshot(doc(db, "profiles", user.uid), (snap) => {
          if (snap.exists()) {
            setUnlockedIds(snap.data()?.achievements || []);
            setProfile(snap.data());
          }
          setLoading(false);
        });
      } else {
        setUnlockedIds([]);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 md:p-12 relative overflow-hidden" dir="rtl">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="mx-auto max-w-4xl relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="btn-ghost !p-3 transform rotate-180">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
            الإنجازات 🏆
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedIds.includes(ach.id);
            const rawProgress = ach.getProgress(profile?.stats, profile);
            const progress = isUnlocked ? ach.maxProgress : Math.min(rawProgress, ach.maxProgress);
            const progressPercent = Math.round((progress / ach.maxProgress) * 100);

            return (
              <div 
                key={ach.id} 
                className={`p-6 rounded-2xl flex flex-col gap-4 border transition-all ${
                  isUnlocked 
                    ? "bg-gradient-to-br from-white/10 to-white/5 border-yellow-500/50 shadow-[0_0_30px_rgba(251,191,36,0.15)]" 
                    : "bg-black/40 border-white/5 opacity-60 grayscale"
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`text-6xl ${isUnlocked ? "drop-shadow-lg" : ""}`}>
                    {ach.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${isUnlocked ? "text-yellow-400" : "text-white/70"}`}>
                      {ach.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ach.description}
                    </p>
                    {!isUnlocked && (
                      <div className="mt-2 text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                        <span>🔒 مقفل</span>
                      </div>
                    )}
                    {isUnlocked && (
                      <div className="mt-2 text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-1">
                        <span>✓ تم الإنجاز</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full mt-2">
                  <div className="flex justify-between text-xs mb-1 font-bold">
                    <span className="text-muted-foreground">التقدم</span>
                    <span className={isUnlocked ? "text-yellow-400" : "text-white/50"}>
                      {progress} / {ach.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-1000 ${
                        isUnlocked 
                          ? "bg-gradient-to-r from-yellow-500 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                          : "bg-blue-500/50"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
