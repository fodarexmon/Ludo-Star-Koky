import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot, collection, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementPopup } from "@/components/AchievementPopup";
import { useNotifications } from "@/hooks/useNotifications";

// Generates a 6-character friend code
function generateFriendCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function GlobalPresence() {
  const nav = useNavigate();
  const userIdRef = useRef<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Custom Hooks
  useNotifications(userIdRef.current);
  const { newAchievement, clearAchievement } = useAchievements(userIdRef.current, profileData);

  useEffect(() => {
    let unsubInvites: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        userIdRef.current = user.uid;
        const profileRef = doc(db, "profiles", user.uid);
        
        let currentFriendCode = "";
        const unsubProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setProfileData(data);
            if (data.friendCode) {
              currentFriendCode = data.friendCode;
            } else if (!currentFriendCode) {
              currentFriendCode = generateFriendCode();
              setDoc(profileRef, { friendCode: currentFriendCode }, { merge: true });
            }
          }
        });

        // Update presence and friendCode
        const updatePresence = async () => {
          try {
            await setDoc(profileRef, {
              isOnline: true,
              lastActive: Date.now(),
              ...(currentFriendCode ? { friendCode: currentFriendCode } : {})
            }, { merge: true });
          } catch (e) {
            console.error("Failed to update presence", e);
          }
        };

        updatePresence();
        const intervalId = setInterval(updatePresence, 300000); // every 5 minutes

        // Listen for incoming invites
        const invitesRef = collection(db, `profiles/${user.uid}/invites`);
        unsubInvites = onSnapshot(invitesRef, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const invite = change.doc.data();
              // Show premium custom toast
              toast.custom((t) => (
                <div className="flex w-full flex-col gap-3 rounded-2xl bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-2 border-[#eab308]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#eab308] to-[#ca8a04] shadow-lg text-2xl animate-bounce">
                      🎲
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">دعوة للعب! 🎮</h3>
                      <p className="text-sm text-blue-200" style={{ lineHeight: "1.4" }}>
                        <strong className="text-[#fde047] font-extrabold">{invite.fromName}</strong> يدعوك للانضمام إلى غرفته لتحدي لودو الآن!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <button 
                      onClick={async () => {
                        toast.dismiss(t);
                        await deleteDoc(change.doc.ref);
                        nav({ to: "/play/online/$code", params: { code: invite.roomCode } });
                      }}
                      className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-2.5 font-bold text-white shadow-lg hover:brightness-110 transition-all active:scale-95"
                    >
                      ✅ قبول
                    </button>
                    <button 
                      onClick={async () => {
                        toast.dismiss(t);
                        await deleteDoc(change.doc.ref);
                      }}
                      className="flex-1 rounded-xl bg-slate-700 py-2.5 font-bold text-white shadow-lg hover:bg-slate-600 transition-all active:scale-95 border border-slate-600"
                    >
                      ❌ رفض
                    </button>
                  </div>
                </div>
              ), { duration: 15000, id: `invite-${invite.roomCode}` });
            }
          });
        });

        // Cleanup function for interval
        return () => {
          clearInterval(intervalId);
          if (unsubInvites) unsubInvites();
          if (unsubProfile) unsubProfile();
        };
      } else {
        if (userIdRef.current) {
          const profileRef = doc(db, "profiles", userIdRef.current);
          setDoc(profileRef, { isOnline: false, lastActive: Date.now() }, { merge: true }).catch(console.error);
        }
        userIdRef.current = null;
        if (unsubInvites) unsubInvites();
      }
    });

    const handleBeforeUnload = () => {
      if (userIdRef.current) {
        const profileRef = doc(db, "profiles", userIdRef.current);
        setDoc(profileRef, { isOnline: false, lastActive: Date.now() }, { merge: true }).catch(console.error);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      unsubscribeAuth();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [nav]);

  return (
    <>
      {newAchievement && <AchievementPopup achievement={newAchievement} onClose={clearAchievement} />}
    </>
  );
}
