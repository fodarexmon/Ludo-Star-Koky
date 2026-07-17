import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from "firebase/firestore";
import type { User } from "firebase/auth";
import { STORE_ITEMS, type ItemType, type StoreItem } from "@/data/store";
import { Dice } from "@/components/Dice";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/store")({
  component: StorePage,
});

function TokenPreview({ shape }: { shape: string }) {
  const CELL = 40;
  const color = "#ef4444"; // Use red for preview
  return (
    <svg width="60" height="60" viewBox="-25 -25 50 50" style={{ overflow: 'visible' }}>
      <circle cx={0} cy={3} r={CELL * 0.35} fill="#000" opacity={0.25} />
      {shape === "crown" && (
        <g>
          <path d={`M${-CELL*0.25},${CELL*0.25} L${CELL*0.25},${CELL*0.25} L${CELL*0.32},${-CELL*0.2} L${CELL*0.12},${-CELL*0.02} L${0},${-CELL*0.3} L${-CELL*0.12},${-CELL*0.02} L${-CELL*0.32},${-CELL*0.2} Z`} fill={color} stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
          <circle cx={0} cy={-CELL*0.3} r={CELL * 0.06} fill="#FFD700" stroke="#fff" strokeWidth={1} />
          <circle cx={-CELL*0.32} cy={-CELL*0.2} r={CELL * 0.06} fill="#FFD700" stroke="#fff" strokeWidth={1} />
          <circle cx={CELL*0.32} cy={-CELL*0.2} r={CELL * 0.06} fill="#FFD700" stroke="#fff" strokeWidth={1} />
          <rect x={-CELL*0.2} y={CELL*0.15} width={CELL*0.4} height={CELL*0.06} fill="#FFD700" rx={CELL*0.02} />
        </g>
      )}
      {shape === "star" && (
        <g>
          <path d={`M0,${-CELL*0.45} L${CELL*0.12},${-CELL*0.12} L${CELL*0.45},${-CELL*0.15} L${CELL*0.15},${CELL*0.1} L${CELL*0.25},${CELL*0.45} L0,${CELL*0.2} L${-CELL*0.25},${CELL*0.45} L${-CELL*0.15},${CELL*0.1} L${-CELL*0.45},${-CELL*0.15} L${-CELL*0.12},${-CELL*0.12} Z`} fill="#000" opacity={0.3} transform="translate(0, 3)" />
          <path d={`M0,${-CELL*0.45} L${CELL*0.12},${-CELL*0.12} L${CELL*0.45},${-CELL*0.15} L${CELL*0.15},${CELL*0.1} L${CELL*0.25},${CELL*0.45} L0,${CELL*0.2} L${-CELL*0.25},${CELL*0.45} L${-CELL*0.15},${CELL*0.1} L${-CELL*0.45},${-CELL*0.15} L${-CELL*0.12},${-CELL*0.12} Z`} fill={color} stroke="#fff" strokeWidth={1} strokeLinejoin="round" />
          
          <path d={`M0,0 L0,${-CELL*0.45} L${-CELL*0.12},${-CELL*0.12} Z`} fill="rgba(255,255,255,0.2)" />
          <path d={`M0,0 L${CELL*0.12},${-CELL*0.12} L${CELL*0.45},${-CELL*0.15} Z`} fill="rgba(255,255,255,0.2)" />
          <path d={`M0,0 L${CELL*0.15},${CELL*0.1} L${CELL*0.25},${CELL*0.45} Z`} fill="rgba(255,255,255,0.2)" />
          <path d={`M0,0 L0,${CELL*0.2} L${-CELL*0.25},${CELL*0.45} Z`} fill="rgba(255,255,255,0.2)" />
          <path d={`M0,0 L${-CELL*0.15},${CELL*0.1} L${-CELL*0.45},${-CELL*0.15} Z`} fill="rgba(255,255,255,0.2)" />

          <path d={`M0,0 L0,${-CELL*0.45} L${CELL*0.12},${-CELL*0.12} Z`} fill="rgba(0,0,0,0.2)" />
          <path d={`M0,0 L${CELL*0.45},${-CELL*0.15} L${CELL*0.15},${CELL*0.1} Z`} fill="rgba(0,0,0,0.2)" />
          <path d={`M0,0 L${CELL*0.25},${CELL*0.45} L0,${CELL*0.2} Z`} fill="rgba(0,0,0,0.2)" />
          <path d={`M0,0 L${-CELL*0.25},${CELL*0.45} L${-CELL*0.15},${CELL*0.1} Z`} fill="rgba(0,0,0,0.2)" />
          <path d={`M0,0 L${-CELL*0.45},${-CELL*0.15} L${-CELL*0.12},${-CELL*0.12} Z`} fill="rgba(0,0,0,0.2)" />
        </g>
      )}
      {shape === "gem" && (
        <g>
          <path d={`M${-CELL*0.2},${-CELL*0.3} L${CELL*0.2},${-CELL*0.3} L${CELL*0.35},${-CELL*0.05} L0,${CELL*0.4} L${-CELL*0.35},${-CELL*0.05} Z`} fill={color} stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
          <path d={`M${-CELL*0.35},${-CELL*0.05} L${CELL*0.35},${-CELL*0.05}`} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
          <path d={`M${-CELL*0.2},${-CELL*0.3} L${-CELL*0.15},${-CELL*0.05} L0,${CELL*0.4}`} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
          <path d={`M${CELL*0.2},${-CELL*0.3} L${CELL*0.15},${-CELL*0.05} L0,${CELL*0.4}`} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
          <path d={`M${-CELL*0.15},${-CELL*0.05} L0,${-CELL*0.3} L${CELL*0.15},${-CELL*0.05}`} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
          <circle cx={-CELL*0.15} cy={-CELL*0.15} r={CELL*0.04} fill="#fff" opacity={0.8} />
        </g>
      )}
      {shape === "pin" && (
        <g>
          <path d={`M0,${CELL*0.35} C${CELL*0.3},${CELL*0.05} ${CELL*0.35},${-CELL*0.35} 0,${-CELL*0.4} C${-CELL*0.35},${-CELL*0.35} ${-CELL*0.3},${CELL*0.05} 0,${CELL*0.35} Z`} fill="#f8fafc" stroke="#94a3b8" strokeWidth={2} strokeLinejoin="round" />
          <circle cx={0} cy={-CELL*0.1} r={CELL * 0.18} fill={color} />
          <circle cx={-CELL * 0.05} cy={-CELL * 0.15} r={CELL * 0.05} fill="#fff" opacity={0.8} />
        </g>
      )}
      {shape === "circle" && (
        <>
          <circle cx={0} cy={0} r={CELL * 0.36} fill={color} stroke="#fff" strokeWidth={3} />
          <circle cx={-CELL * 0.1} cy={-CELL * 0.12} r={CELL * 0.1} fill="#fff" opacity={0.7} />
        </>
      )}
      {shape === "disc" && (
        <>
          <circle cx={CELL * 0.04} cy={CELL * 0.06} r={CELL * 0.36} fill="#000" opacity={0.4} />
          <circle cx={0} cy={0} r={CELL * 0.36} fill={color} />
        </>
      )}
    </svg>
  );
}

function StorePage() {
  const [tab, setTab] = useState<ItemType>("board");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubSnap: () => void;
    const unsubAuth = auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        unsubSnap = onSnapshot(doc(db, "profiles", user.uid), (snap) => {
          if (snap.exists()) {
            setProfile(snap.data());
          }
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => {
      unsubAuth();
      if (unsubSnap) unsubSnap();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">يجب عليك تسجيل الدخول أولاً!</h2>
        <Link to="/auth" className="btn-game">تسجيل الدخول</Link>
      </div>
    );
  }

  const coins = profile.stats?.coins || 0;
  const inventory = profile.inventory || [];
  const equipped = profile.equipped || { board: "board_default", dice: "dice_default" };

  const isOwned = (item: StoreItem) => item.price === 0 || inventory.includes(item.id);
  const isEquipped = (item: StoreItem) => equipped[item.type] === item.id;

  const handleBuy = async (item: StoreItem) => {
    if (!auth.currentUser) return;
    if (coins < item.price) {
      toast.error("عذراً، ليس لديك عدد كافٍ من الكوينز!");
      return;
    }

    try {
      await updateDoc(doc(db, "profiles", auth.currentUser.uid), {
        "stats.coins": increment(-item.price),
        inventory: arrayUnion(item.id),
      });
      toast.success(`تم شراء ${item.name} بنجاح! 🎉`);
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء الشراء.");
    }
  };

  const handleEquip = async (item: StoreItem) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, "profiles", auth.currentUser.uid), {
        [`equipped.${item.type}`]: item.id,
      });
      toast.success(`تم تجهيز ${item.name} بنجاح!`);
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء التجهيز.");
    }
  };

  const items = STORE_ITEMS.filter((i) => i.type === tab);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 font-sans dir-rtl">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="btn-ghost flex items-center gap-2">
            <ArrowRight size={20} />
            العودة
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-sm flex items-center justify-center gap-3">
              <ShoppingCart size={32} className="text-yellow-500" />
              متجر اللعبة
            </h1>
          </div>
          <div className="bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-yellow-500/30 shadow-lg flex items-center gap-2">
            <span className="text-xl font-black text-yellow-400 drop-shadow-md">{coins}</span>
            <img src="/coin.png" alt="Coins" className="w-8 h-8 drop-shadow-lg" />
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {[
            { id: "board", label: "الرقع 🎴" },
            { id: "dice", label: "النرد 🎲" },
            { id: "token", label: "البيادق ♟️" },
            { id: "frame", label: "الإطارات 🖼️" },
            { id: "trail", label: "التأثيرات ✨" },
            { id: "emoji", label: "المشاعر 😂" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex-none px-6 py-3 text-lg font-bold rounded-2xl transition-all snap-center whitespace-nowrap ${
                tab === t.id
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.5)]"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const owned = isOwned(item);
            const active = isEquipped(item);

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border-2 transition-all ${
                  active
                    ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.3)]"
                    : "border-white/10 bg-card hover:border-white/30"
                }`}
              >
                <div className="text-6xl mb-4 text-center select-none flex justify-center">
                  {item.type === "token" ? (
                    <TokenPreview shape={item.tokenTheme?.shape || "circle"} />
                  ) : item.type === "dice" ? (
                    <div style={{ transform: "rotateX(-20deg) rotateY(-30deg)" }} className="flex justify-center my-2">
                      <Dice value={6} themeId={item.id} size={50} />
                    </div>
                  ) : (
                    item.icon
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-center">{item.name}</h3>
                <p className="text-muted-foreground text-sm mb-6 text-center h-10">
                  {item.description}
                </p>

                <div className="mt-auto">
                  {!owned ? (
                    <button
                      onClick={() => handleBuy(item)}
                      className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl font-bold text-lg hover:brightness-110 flex items-center justify-center gap-2"
                    >
                      شراء بـ {item.price} <img src="/coin.png" alt="Coin" className="w-5 h-5 inline-block" />
                    </button>
                  ) : active ? (
                    <button
                      disabled
                      className="w-full py-3 bg-white/10 text-white rounded-xl font-bold text-lg cursor-not-allowed"
                    >
                      مُجهّز ✅
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-3 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/80"
                    >
                      تجهيز
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
