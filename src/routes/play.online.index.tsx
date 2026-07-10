import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, runTransaction, collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { loadProfile, saveProfile } from "@/lib/profile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resignPlayer } from "@/game/engine";
import { ref, get, runTransaction as runRTDBTransaction } from "firebase/database";
import { rtdb } from "@/integrations/firebase/client";

export const Route = createFileRoute("/play/online/")({
  head: () => ({ meta: [{ title: "Online Ludo — Create or Join a Room" }] }),
  component: OnlineLobby,
});

function genCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function OnlineLobby() {
  const nav = useNavigate();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [newRoomCode, setNewRoomCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"menu" | "rooms">("menu");

  const [activeRoom, setActiveRoom] = useState<{ code: string; seat: number } | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "rooms"), where("status", "in", ["playing", "lobby", "quick_match_lobby"]), where("playerIds", "array-contains", user.id));
    
    const unsub = onSnapshot(q, async (snap: any) => {
      let foundRoom = null;
      for (const d of snap.docs) {
        const room = d.data();
        const pInfo = room.players?.find((p: any) => p.user_id === user.id);
        if (pInfo) {
          // If the room is playing, check RTDB state for disconnected
          if (room.status === "playing") {
             const stateSnap = await get(ref(rtdb, `rooms/${room.code}/state`));
             const gameState = stateSnap.val();
             if (gameState && !gameState.resigned?.includes(pInfo.seat) && gameState.disconnected?.includes(pInfo.seat)) {
                foundRoom = { code: room.code, seat: pInfo.seat };
                break;
             }
          }
        }
      }
      setActiveRoom(foundRoom);
    });
    return () => unsub();
  }, [user]);

  async function handleRejectActiveRoom() {
    if (!activeRoom) return;
    setBusy(true);
    try {
      await runRTDBTransaction(ref(rtdb, `rooms/${activeRoom.code}/state`), (current) => {
         if (!current) return undefined;
         return resignPlayer(current, activeRoom.seat);
      });
      // Apply manual ban
      const pDoc = await getDoc(doc(db, "profiles", user!.id));
      if (pDoc.exists()) {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        let newBan = { until: Date.now() + 15 * 60 * 1000, count: 1, lastBanDay: today };
        const oldBans = pDoc.data().bans;
        if (oldBans && oldBans.lastBanDay === today) {
          const newCount = oldBans.count + 1;
          if (newCount >= 3) {
            newBan = { until: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime(), count: newCount, lastBanDay: today };
          } else {
            newBan.count = newCount;
          }
        }
        await updateDoc(doc(db, "profiles", user!.id), { bans: newBan });
      }
    } catch (e) {
      console.error(e);
    }
    setActiveRoom(null);
    setBusy(false);
  }

  useEffect(() => {
    setNewRoomCode(genCode());
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) { nav({ to: "/auth" }); return; }
      setUser({ id: currentUser.uid, name: currentUser.displayName ?? "Player" });
    });
    return () => unsubscribe();
  }, [nav]);

  async function ensureProfile(uid: string) {
    const profileRef = doc(db, "profiles", uid);
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      const data = snap.data();
      const local = loadProfile();
      saveProfile({
        ...local,
        displayName: data.display_name || local.displayName,
        country: data.country || local.country,
        avatarId: data.avatar_id || local.avatarId,
      });
    } else {
      const p = loadProfile();
      await setDoc(profileRef, { 
        id: uid, 
        display_name: p.displayName, 
        country: p.country, 
        avatar_id: p.avatarId 
      }, { merge: true });
    }
  }

  async function createRoom() {
    if (!user) return;
    setBusy(true); setErr(null);
    try {
      const pDoc = await getDoc(doc(db, "profiles", user.id));
      if (pDoc.exists()) {
        const pd = pDoc.data();
        if (pd.bans && pd.bans.until > Date.now()) {
          const minLeft = Math.ceil((pd.bans.until - Date.now()) / 60000);
          setErr(`You are restricted from online play due to resigning. Try again in ${minLeft} minutes.`);
          setBusy(false);
          return;
        }
      }

      await ensureProfile(user.id);
      const roomRef = doc(db, "rooms", newRoomCode);
      
      const colors = ["red", "green", "yellow", "blue"];
      const randomSeat = Math.floor(Math.random() * 4);
      
      await setDoc(roomRef, {
        code: newRoomCode,
        host_id: user.id,
        status: "lobby",
        state: {},
        players: [{ user_id: user.id, seat: randomSeat, color: colors[randomSeat] }],
        playerIds: [user.id],
        matchCount: 1,
        scores: {}
      });
      
      nav({ to: "/play/online/$code", params: { code: newRoomCode } });
    } catch (e: any) {
      setErr(e?.message ?? "Could not create room. Ensure Firestore rules allow it.");
      setBusy(false);
    }
  }

  async function joinRoom() {
    if (!user) return;
    const c = joinCode.trim().toUpperCase();
    if (c.length !== 6) { setErr("Enter a 6-character code"); return; }
    setBusy(true); setErr(null);
    try {
      const pDoc = await getDoc(doc(db, "profiles", user.id));
      if (pDoc.exists()) {
        const pd = pDoc.data();
        if (pd.bans && pd.bans.until > Date.now()) {
          const minLeft = Math.ceil((pd.bans.until - Date.now()) / 60000);
          setErr(`You are restricted from online play due to resigning. Try again in ${minLeft} minutes.`);
          setBusy(false);
          return;
        }
      }

      await ensureProfile(user.id);
      const roomRef = doc(db, "rooms", c);
      await runTransaction(db, async (t) => {
        const snap = await t.get(roomRef);
        if (!snap.exists()) throw new Error("Room not found");
        const room = snap.data();
        const existing = room.players || [];
        const alreadyInRoom = existing.some((r: any) => r.user_id === user.id);
        
        if (room.state?.resigned?.includes(existing.find((r: any) => r.user_id === user.id)?.seat)) {
          throw new Error("لقد انسحبت من هذه المباراة ولا يمكنك العودة إليها.");
        }

        if (!alreadyInRoom && room.status !== "lobby") throw new Error("Game already started");
        if (alreadyInRoom) return true;
        if (existing.length >= 4) throw new Error("Room is full");
        
        const taken = new Set(existing.map((r: any) => r.seat));
        const available = [0, 1, 2, 3].filter(s => !taken.has(s));
        const seat = available[Math.floor(Math.random() * available.length)];
        const colors = ["red", "green", "yellow", "blue"];
        
        t.update(roomRef, {
          players: [...existing, { user_id: user.id, seat, color: colors[seat] }],
          playerIds: Array.from(new Set([...(room.playerIds || []), user.id]))
        });
        return true;
      });
      
      nav({ to: "/play/online/$code", params: { code: c } });
    } catch (e: any) {
      setErr(e?.message ?? "Could not join room. Ensure Firestore rules allow it.");
      setBusy(false);
    }
  }

  async function joinQuickMatch() {
    if (!user) return;
    setBusy(true); setErr(null);
    try {
      const pDoc = await getDoc(doc(db, "profiles", user.id));
      if (pDoc.exists()) {
        const pd = pDoc.data();
        if (pd.bans && pd.bans.until > Date.now()) {
          const minLeft = Math.ceil((pd.bans.until - Date.now()) / 60000);
          setErr(`You are restricted from online play due to resigning. Try again in ${minLeft} minutes.`);
          setBusy(false);
          return;
        }
      }

      await ensureProfile(user.id);

      const { collection, query, where, getDocs, limit, increment } = await import("firebase/firestore");

      // Helper: search for an available quick match room
      const findRoom = async () => {
        const q = query(
          collection(db, "rooms"),
          where("status", "==", "quick_match_lobby"),
          limit(10)
        );
        const snap = await getDocs(q);
        
        // 1. Check if player is already in one of the rooms
        for (const roomDoc of snap.docs) {
          const room = roomDoc.data();
          if (room.players.some((p: any) => p.user_id === user.id)) {
            return { alreadyIn: true, code: room.code };
          }
        }
        
        // 2. Return the first room the player is not already in AND has < 4 players
        for (const roomDoc of snap.docs) {
          const room = roomDoc.data();
          const pCount = room.playerCount || room.players?.length || 0;
          if (pCount < 4 && !room.players.some((p: any) => p.user_id === user.id)) {
            return roomDoc;
          }
        }
        return null;
      };

      const result = await findRoom();

      // Player is already in a room
      if (result && 'alreadyIn' in result) {
        nav({ to: "/play/online/$code", params: { code: result.code } });
        return;
      }

      // Found a room to join
      if (result) {
        const roomDoc = result;
        const room = roomDoc.data();
        try {
          const joined = await runTransaction(db, async (t) => {
            const snap = await t.get(roomDoc.ref);
            if (!snap.exists()) return false;
            const rData = snap.data();
            if (rData.status !== "quick_match_lobby") return false;
            
            const existing = rData.players || [];
            if (existing.some((r: any) => r.user_id === user.id)) return true;
            if (existing.length >= 4) return false;
            
            const taken = new Set(existing.map((r: any) => r.seat));
            const available = [0, 1, 2, 3].filter(s => !taken.has(s));
            if (available.length === 0) return false;
            
            const seat = available[Math.floor(Math.random() * available.length)];
            const colors = ["red", "green", "yellow", "blue"];
            
            t.update(roomDoc.ref, {
              players: [...existing, { user_id: user.id, seat, color: colors[seat] }],
              playerCount: existing.length + 1,
              playerIds: Array.from(new Set([...(rData.playerIds || []), user.id]))
            });
            return true;
          });

          if (joined) {
            nav({ to: "/play/online/$code", params: { code: room.code } });
            return;
          }
        } catch (err) {
          console.error("Error joining quick match room via transaction:", err);
          // If it fails, fallback to creating a new one below
        }
      }

      // Create a new room immediately
      const newCode = "QM" + genCode().substring(0, 4);
      const roomRef = doc(db, "rooms", newCode);

      const colors = ["red", "green", "yellow", "blue"];
      const randomSeat = Math.floor(Math.random() * 4);

      await setDoc(roomRef, {
        code: newCode,
        host_id: user.id,
        status: "quick_match_lobby",
        isQuickMatch: true,
        playerCount: 1,
        state: {},
        players: [{ user_id: user.id, seat: randomSeat, color: colors[randomSeat] }],
        playerIds: [user.id],
        readyPlayers: [],
        matchCount: 1,
        scores: {}
      });

      nav({ to: "/play/online/$code", params: { code: newCode } });
    } catch (e: any) {
      console.error(e);
      setErr("Could not join quick match. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen p-6 flex flex-col relative overflow-hidden">
      {/* Active Room Dialog */}
      <AlertDialog open={!!activeRoom}>
        <AlertDialogContent className="bg-neutral-800 border-neutral-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">مباراة جارية!</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-neutral-300">
              لقد انقطع اتصالك عن مباراة لا تزال جارية. هل ترغب في العودة واستكمال اللعب؟ (رفضك للعودة سيؤدي لتطبيق حظر مؤقت).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse space-x-2 space-x-reverse">
            <AlertDialogAction 
              onClick={() => nav({ to: "/play/online/$code", params: { code: activeRoom!.code } })}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              العودة للمباراة
            </AlertDialogAction>
            <AlertDialogCancel 
              onClick={handleRejectActiveRoom}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
              disabled={busy}
            >
              الانسحاب (رفض العودة)
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Decorative Background Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="mx-auto max-w-4xl w-full z-10">
        <Link to="/" className="btn-ghost mb-8 inline-flex bg-background/50 backdrop-blur-md">← Back to Home</Link>
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Play Online</h1>
          <p className="text-lg text-muted-foreground">Create a room to play with friends or join an existing one.</p>
        </div>

        {viewMode === "menu" ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Quick Match Button */}
            <button 
              onClick={joinQuickMatch} 
              disabled={busy}
              className="panel flex flex-col items-center justify-center text-center bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all hover:-translate-y-2 hover:shadow-yellow-500/30 group p-8"
            >
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
              <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">اللعب السريع</h2>
              <p className="text-muted-foreground font-medium">بحث تلقائي عن لاعبين للعب فوراً بدون كود.</p>
              <div className="mt-6 text-sm bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full font-bold">Quick Match</div>
            </button>

            {/* Private Rooms Button */}
            <button 
              onClick={() => setViewMode("rooms")}
              className="panel flex flex-col items-center justify-center text-center bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all hover:-translate-y-2 hover:shadow-primary/30 group p-8"
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">🏠</div>
              <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">الغرف الخاصة</h2>
              <p className="text-muted-foreground font-medium">إنشاء غرفة أو الانضمام لغرفة أصدقاء باستخدام كود.</p>
              <div className="mt-6 text-sm bg-primary/10 text-primary px-4 py-2 rounded-full font-bold">Private Rooms</div>
            </button>
          </div>
        ) : (
          <div>
            <button onClick={() => setViewMode("menu")} className="btn-ghost mb-6">← العودة للخيارات</button>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Create Room Card */}
              <div className="panel flex flex-col justify-between bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-transform hover:-translate-y-1 hover:shadow-primary/20">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl">🏠</div>
                    <h2 className="text-2xl font-bold">Create Room</h2>
                  </div>
                  <p className="mb-6 text-muted-foreground">Start a new game and invite your friends using a unique 6-character code.</p>
                  
                  <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Your Room Code</div>
                    <div className="text-4xl font-mono tracking-widest text-primary font-bold drop-shadow-md">{newRoomCode || "..."}</div>
                  </div>
                </div>
                
                <button onClick={createRoom} disabled={busy || !newRoomCode} className="btn-game w-full text-lg shadow-lg shadow-primary/30">
                  Create Room & Invite
                </button>
              </div>

              {/* Join Room Card */}
              <div className="panel flex flex-col justify-between bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-transform hover:-translate-y-1 hover:shadow-accent/20">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl">🤝</div>
                    <h2 className="text-2xl font-bold">Join Room</h2>
                  </div>
                  <p className="mb-6 text-muted-foreground">Got a code from a friend? Enter it below to join their game.</p>
                  
                  <div className="mb-6 relative">
                    <input
                      value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                      placeholder="ABC123"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-5 text-center text-3xl font-mono tracking-widest text-white placeholder:text-white/20 focus:border-accent focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <button onClick={joinRoom} disabled={busy || joinCode.length !== 6} className="btn-game w-full text-lg shadow-lg shadow-accent/30 !bg-gradient-to-b !from-accent !to-blue-700 !text-white">
                  Join Game
                </button>
              </div>
            </div>
          </div>
        )}

        {err && (
          <div className="mt-8 p-4 rounded-xl bg-destructive/20 border border-destructive/50 text-destructive text-center animate-in fade-in zoom-in font-medium">
            ⚠️ {err}
          </div>
        )}
      </div>
    </div>
  );
}
