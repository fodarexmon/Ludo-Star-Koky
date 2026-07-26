import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, setDoc, getDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { Avatar } from "@/components/Avatar";
import { ProfileModal } from "@/components/ProfileModal";
import { sendPushNotification } from "@/utils/notifications";

export const Route = createFileRoute("/friends")({
  head: () => ({ meta: [{ title: "الأصدقاء — Ludo Star" }] }),
  component: FriendsPage,
});

function FriendsPage() {
  const nav = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriendsToInvite, setSelectedFriendsToInvite] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [addCode, setAddCode] = useState("");
  const [addMsg, setAddMsg] = useState<{ text: string, type: "err" | "success" } | null>(null);
  const [adding, setAdding] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loadingSentReqs, setLoadingSentReqs] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [friendToUnfriend, setFriendToUnfriend] = useState<any | null>(null);
  const [unfriending, setUnfriending] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserId(null);
        setLoading(false);
        return;
      }
      setUserId(user.uid);
      
      const profileRef = doc(db, "profiles", user.uid);
      const unsubMyProfile = onSnapshot(profileRef, snap => {
        if (snap.exists()) setMyProfile({ id: snap.id, ...snap.data() });
      });

      // Real-time live synchronization for friends list and their individual profiles
      const friendDocUnsubs: Record<string, () => void> = {};
      const unsubFriends = onSnapshot(collection(db, `profiles/${user.uid}/friends`), (snap) => {
        const currentIds = snap.docs.map(d => d.id);
        
        Object.keys(friendDocUnsubs).forEach(id => {
          if (!currentIds.includes(id)) {
            friendDocUnsubs[id]();
            delete friendDocUnsubs[id];
          }
        });

        if (currentIds.length === 0) {
          setFriends([]);
          setLoading(false);
          return;
        }

        currentIds.forEach(id => {
          if (!friendDocUnsubs[id]) {
            friendDocUnsubs[id] = onSnapshot(doc(db, "profiles", id), (pSnap) => {
              if (pSnap.exists()) {
                const profileData = { id: pSnap.id, ...pSnap.data() };
                setFriends(prev => {
                  const exists = prev.some(f => f.id === id);
                  if (exists) {
                    return prev.map(f => f.id === id ? profileData : f);
                  }
                  return [...prev, profileData];
                });
              } else {
                setFriends(prev => prev.filter(f => f.id !== id));
              }
              setLoading(false);
            });
          }
        });
        
        setFriends(prev => prev.filter(f => currentIds.includes(f.id)));
        setLoading(false);
      });
      
      // Real-time live synchronization for incoming friend requests
      const reqDocUnsubs: Record<string, () => void> = {};
      const unsubReqs = onSnapshot(collection(db, `profiles/${user.uid}/friend_requests`), (snap) => {
        const currentIds = snap.docs.map(d => d.id);
        
        Object.keys(reqDocUnsubs).forEach(id => {
          if (!currentIds.includes(id)) {
            reqDocUnsubs[id]();
            delete reqDocUnsubs[id];
          }
        });

        if (currentIds.length === 0) {
          setRequests([]);
          setLoadingReqs(false);
          return;
        }

        currentIds.forEach(id => {
          if (!reqDocUnsubs[id]) {
            reqDocUnsubs[id] = onSnapshot(doc(db, "profiles", id), (pSnap) => {
              if (pSnap.exists()) {
                const data = { id: pSnap.id, ...pSnap.data() };
                setRequests(prev => {
                  const exists = prev.some(r => r.id === id);
                  if (exists) return prev.map(r => r.id === id ? data : r);
                  return [...prev, data];
                });
              } else {
                setRequests(prev => prev.filter(r => r.id !== id));
              }
              setLoadingReqs(false);
            });
          }
        });

        setRequests(prev => prev.filter(r => currentIds.includes(r.id)));
        setLoadingReqs(false);
      });

      // Real-time live synchronization for sent friend requests
      const sentReqDocUnsubs: Record<string, () => void> = {};
      const unsubSentReqs = onSnapshot(collection(db, `profiles/${user.uid}/sent_requests`), (snap) => {
        const currentIds = snap.docs.map(d => d.id);
        
        Object.keys(sentReqDocUnsubs).forEach(id => {
          if (!currentIds.includes(id)) {
            sentReqDocUnsubs[id]();
            delete sentReqDocUnsubs[id];
          }
        });

        if (currentIds.length === 0) {
          setSentRequests([]);
          setLoadingSentReqs(false);
          return;
        }

        currentIds.forEach(id => {
          if (!sentReqDocUnsubs[id]) {
            sentReqDocUnsubs[id] = onSnapshot(doc(db, "profiles", id), (pSnap) => {
              if (pSnap.exists()) {
                const data = { id: pSnap.id, ...pSnap.data() };
                setSentRequests(prev => {
                  const exists = prev.some(r => r.id === id);
                  if (exists) return prev.map(r => r.id === id ? data : r);
                  return [...prev, data];
                });
              } else {
                setSentRequests(prev => prev.filter(r => r.id !== id));
              }
              setLoadingSentReqs(false);
            });
          }
        });

        setSentRequests(prev => prev.filter(r => currentIds.includes(r.id)));
        setLoadingSentReqs(false);
      });

      return () => { 
        unsubMyProfile();
        unsubFriends(); 
        unsubReqs(); 
        unsubSentReqs(); 
        Object.values(friendDocUnsubs).forEach(u => u());
        Object.values(reqDocUnsubs).forEach(u => u());
        Object.values(sentReqDocUnsubs).forEach(u => u());
      };
    });
  }, []);

  async function handleConfirmUnfriend() {
    if (!userId || !friendToUnfriend) return;
    setUnfriending(true);
    try {
      await deleteDoc(doc(db, `profiles/${userId}/friends/${friendToUnfriend.id}`));
      await deleteDoc(doc(db, `profiles/${friendToUnfriend.id}/friends/${userId}`));
      
      setFriends(prev => prev.filter(f => f.id !== friendToUnfriend.id));
      const newSelected = new Set(selectedFriendsToInvite);
      if (newSelected.has(friendToUnfriend.id)) {
        newSelected.delete(friendToUnfriend.id);
        setSelectedFriendsToInvite(newSelected);
      }
      setFriendToUnfriend(null);
    } catch (e) {
      console.error("Error unfriending:", e);
    } finally {
      setUnfriending(false);
    }
  }

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !myProfile) return;
    const code = addCode.trim().toUpperCase();
    if (code.length !== 6) {
      setAddMsg({ text: "كود الصداقة يجب أن يكون 6 أحرف/أرقام.", type: "err" });
      return;
    }
    if (code === myProfile.friendCode) {
      setAddMsg({ text: "لا يمكنك إضافة نفسك!", type: "err" });
      return;
    }

    setAdding(true);
    setAddMsg(null);
    try {
      const q = query(collection(db, "profiles"), where("friendCode", "==", code));
      const snap = await getDocs(q);
      if (snap.empty) {
        setAddMsg({ text: "لم يتم العثور على لاعب بهذا الكود.", type: "err" });
        setAdding(false);
        return;
      }

      const targetDoc = snap.docs[0];
      const targetId = targetDoc.id;
      const targetData = targetDoc.data();

      // Check if already friends
      if (friends.some(f => f.id === targetId)) {
        setAddMsg({ text: "هذا اللاعب موجود بالفعل في قائمة أصدقائك.", type: "err" });
        setAdding(false);
        return;
      }

      // Check if already sent a request
      const reqSnap = await getDoc(doc(db, `profiles/${targetId}/friend_requests`, userId));
      if (reqSnap.exists()) {
        setAddMsg({ text: "لقد قمت بإرسال طلب صداقة مسبقاً وهو قيد الانتظار.", type: "err" });
        setAdding(false);
        return;
      }

      // Check if they already sent us a request
      const incomingReqSnap = await getDoc(doc(db, `profiles/${userId}/friend_requests`, targetId));
      if (incomingReqSnap.exists()) {
         setAddMsg({ text: "هذا اللاعب أرسل لك طلب صداقة بالفعل! تحقق من قائمة الطلبات المعلقة.", type: "err" });
         setAdding(false);
         return;
      }

      // Send friend request
      await setDoc(doc(db, `profiles/${targetId}/friend_requests`, userId), {
        id: userId,
        timestamp: Date.now()
      });
      await setDoc(doc(db, `profiles/${userId}/sent_requests`, targetId), {
        id: targetId,
        timestamp: Date.now()
      });

      // Send push notification
      await sendPushNotification(
        targetId,
        "طلب صداقة جديد! 👥",
        `يرغب ${myProfile.display_name || "لاعب"} في إضافتك كصديق!`,
        { type: "friend_request", url: "/friends" }
      );

      setAddMsg({ text: `تم إرسال طلب الصداقة إلى ${targetData.display_name} بانتظار موافقته!`, type: "success" });
      setAddCode("");
    } catch (err: any) {
      console.error(err);
      setAddMsg({ text: "حدث خطأ أثناء إضافة الصديق.", type: "err" });
    } finally {
      setAdding(false);
    }
  };

  const genCode = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  };

  const acceptRequest = async (reqId: string, reqName: string) => {
    if (!userId) return;
    try {
      // Add to friends mutually
      await setDoc(doc(db, `profiles/${userId}/friends`, reqId), { id: reqId, addedAt: Date.now() });
      await setDoc(doc(db, `profiles/${reqId}/friends`, userId), { id: userId, addedAt: Date.now() });
      
      // Delete request and cleanup sent_requests
      await deleteDoc(doc(db, `profiles/${userId}/friend_requests`, reqId));
      await deleteDoc(doc(db, `profiles/${reqId}/sent_requests`, userId));

      // Notification
      await sendPushNotification(
        reqId,
        "تم قبول طلب الصداقة! ✅",
        `لقد وافق ${myProfile?.display_name || "اللاعب"} على طلب الصداقة.`,
        { type: "friend_accept", url: "/friends" }
      );
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الموافقة على الطلب.");
    }
  };

  const rejectRequest = async (reqId: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `profiles/${userId}/friend_requests`, reqId));
      await deleteDoc(doc(db, `profiles/${reqId}/sent_requests`, userId));
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء رفض الطلب.");
    }
  };

  const cancelSentRequest = async (targetId: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `profiles/${targetId}/friend_requests`, userId));
      await deleteDoc(doc(db, `profiles/${userId}/sent_requests`, targetId));
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء سحب الطلب.");
    }
  };

  const inviteSelectedFriends = async () => {
    if (!userId || !myProfile || selectedFriendsToInvite.size === 0) return;
    try {
      const newRoomCode = genCode();
      const roomRef = doc(db, "rooms", newRoomCode);
      
      await setDoc(roomRef, {
        code: newRoomCode,
        host_id: userId,
        status: "lobby",
        state: {},
        players: [{ user_id: userId, seat: 0, color: "red" }],
        matchCount: 1,
        scores: {}
      });
      
      const fids = Array.from(selectedFriendsToInvite);
      for (const fid of fids) {
        // Send invite
        await setDoc(doc(db, `profiles/${fid}/invites`, newRoomCode), {
          id: newRoomCode,
          roomCode: newRoomCode,
          fromId: userId,
          fromName: myProfile.display_name || "Player",
          timestamp: Date.now()
        });

        // Send push notification
        await sendPushNotification(
          fid,
          "دعوة جديدة للعب! 🎲",
          `لقد دعاك ${myProfile.display_name || "Player"} للانضمام إلى غرفته!`,
          { type: "invite", url: `/play/online/${newRoomCode}` }
        );
      }

      nav({ to: "/play/online/$code", params: { code: newRoomCode } });
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء إرسال الدعوات.");
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="mx-auto max-w-3xl w-full z-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="btn-ghost bg-background/50 backdrop-blur-md">← رجوع للرئيسية</Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            👥 الأصدقاء
          </h1>
          <div className="w-[100px]"></div>
        </div>

        {!userId ? (
          <div className="panel bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl p-12 text-center text-muted-foreground">
            يجب عليك تسجيل الدخول لرؤية قائمة الأصدقاء.
          </div>
        ) : (
          <div className="space-y-6">
            {/* My Code & Add Friend */}
            <div className="panel bg-card/60 backdrop-blur-xl border border-white/10 shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm text-muted-foreground mb-1">كود الصداقة الخاص بك</p>
                <div className="text-3xl font-mono font-bold text-primary tracking-widest bg-black/40 px-4 py-2 rounded-lg inline-block border border-white/5 shadow-inner">
                  {myProfile?.friendCode || "------"}
                </div>
              </div>
              <div className="w-full md:w-px h-px md:h-16 bg-white/10" />
              <form onSubmit={handleAddFriend} className="flex-1 w-full flex flex-col gap-2">
                <p className="text-sm text-muted-foreground mb-1 text-center md:text-right">إضافة صديق جديد</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="مثال: ABC123"
                    value={addCode}
                    onChange={e => setAddCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-center font-mono tracking-widest text-lg focus:border-primary outline-none transition-colors"
                  />
                  <button disabled={adding || !addCode} className="btn-game px-6 whitespace-nowrap !py-2 !text-base">
                    إضافة
                  </button>
                </div>
                {addMsg && (
                  <p className={`text-sm text-center md:text-right font-medium ${addMsg.type === "err" ? "text-destructive" : "text-green-400"}`}>
                    {addMsg.text}
                  </p>
                )}
              </form>
            </div>

            {/* Pending Requests */}
            <div className="panel bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl p-0 overflow-hidden mb-6">
              <div className="p-4 bg-primary/20 border-b border-white/5 font-bold text-lg text-primary flex items-center gap-2">
                <span>📬 طلبات الصداقة المعلقة ({requests.length})</span>
              </div>
              {loadingReqs ? (
                <div className="p-8 text-center text-muted-foreground">جاري تحميل الطلبات...</div>
              ) : requests.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {requests.map(req => (
                    <div key={req.id} className="p-4 flex flex-col md:flex-row items-center justify-between hover:bg-white/5 transition-colors gap-4">
                      <div 
                        onClick={() => setSelectedProfile(req)}
                        title="اضغط لعرض الملف الشخصي للتفاصيل والمستوى"
                        className="flex items-center gap-4 w-full md:w-auto cursor-pointer group"
                      >
                         <div className="relative">
                           <Avatar id={req.avatar_id || "a1"} size={48} frameThemeId={req.equipped?.frame} />
                           <div className="absolute inset-0 rounded-full bg-amber-400/0 group-hover:bg-amber-400/20 transition-colors pointer-events-none" />
                         </div>
                         <div>
                            <div className="font-bold text-lg group-hover:text-amber-300 transition-colors">{req.display_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="uppercase">{req.country || "unk"}</span>
                                <span>•</span>
                                <span>{req.friendCode}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                         <button 
                           onClick={() => acceptRequest(req.id, req.display_name)}
                           className="flex-1 md:flex-none btn-game bg-green-500 hover:bg-green-600 !py-2 !px-4 text-sm whitespace-nowrap"
                         >
                           قبول ✅
                         </button>
                         <button 
                           onClick={() => rejectRequest(req.id)}
                           className="flex-1 md:flex-none btn-game bg-red-500 hover:bg-red-600 !py-2 !px-4 text-sm whitespace-nowrap"
                         >
                           حذف ❌
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground bg-black/10">لا توجد طلبات صداقة معلقة.</div>
              )}
            </div>

            {/* Sent Requests */}
            <div className="panel bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl p-0 overflow-hidden mb-6">
              <div className="p-4 bg-white/5 border-b border-white/5 font-bold text-lg flex items-center gap-2">
                <span>📤 الطلبات المُرسلة ({sentRequests.length})</span>
              </div>
              {loadingSentReqs ? (
                <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
              ) : sentRequests.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {sentRequests.map(req => (
                    <div key={req.id} className="p-4 flex flex-col md:flex-row items-center justify-between hover:bg-white/5 transition-colors gap-4">
                      <div 
                        onClick={() => setSelectedProfile(req)}
                        title="اضغط لعرض الملف الشخصي للتفاصيل والمستوى"
                        className="flex items-center gap-4 w-full md:w-auto cursor-pointer group"
                      >
                         <div className="relative">
                           <Avatar id={req.avatar_id || "a1"} size={48} frameThemeId={req.equipped?.frame} />
                           <div className="absolute inset-0 rounded-full bg-amber-400/0 group-hover:bg-amber-400/20 transition-colors pointer-events-none" />
                         </div>
                         <div>
                            <div className="font-bold text-lg group-hover:text-amber-300 transition-colors">{req.display_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="uppercase">{req.country || "unk"}</span>
                                <span>•</span>
                                <span>{req.friendCode}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                         <button 
                           onClick={() => cancelSentRequest(req.id)}
                           className="flex-1 md:flex-none btn-game bg-red-500 hover:bg-red-600 !py-2 !px-4 text-sm whitespace-nowrap"
                         >
                           إلغاء الطلب 🗑️
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground bg-black/10">لم تقم بإرسال أي طلبات صداقة.</div>
              )}
            </div>

            {/* Friends List */}
            <div className="panel bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl p-0 overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/5 font-bold text-lg flex items-center justify-between">
                <span>قائمة الأصدقاء ({friends.length})</span>
                {selectedFriendsToInvite.size > 0 && (
                  <button
                    onClick={inviteSelectedFriends}
                    className="btn-game py-1.5 px-4 text-sm whitespace-nowrap"
                  >
                    دعوة للعب ({selectedFriendsToInvite.size}) 🎮
                  </button>
                )}
              </div>

              {friends.length > 0 && (
                <div className="p-3 border-b border-white/5 bg-black/20">
                  <div className="relative">
                    <span className="absolute inset-y-0 right-3 flex items-center text-white/50 text-xl">🔍</span>
                    <input
                      type="text"
                      placeholder="ابحث عن صديق..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                      dir="rtl"
                    />
                  </div>
                </div>
              )}
              
              {loading ? (
                <div className="p-12 text-center text-muted-foreground animate-pulse">جاري تحميل الأصدقاء...</div>
              ) : friends.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">لا يوجد لديك أصدقاء حالياً. قم بمشاركة كودك معهم!</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {friends.filter(f => !searchQuery || f.display_name?.toLowerCase().includes(searchQuery.toLowerCase())).map((friend) => {
                    // Consider online if lastActive is within 2 minutes
                    const isOnline = friend.isOnline && friend.lastActive && (Date.now() - friend.lastActive < 120000);
                    
                    return (
                      <div key={friend.id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 p-4 hover:bg-white/5 transition-colors">
                        <div 
                          onClick={() => setSelectedProfile(friend)}
                          title="اضغط لعرض الملف الشخصي للتفاصيل والمستوى"
                          className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer group"
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar id={friend.avatar_id || 'a1'} size={50} frameThemeId={friend.equipped?.frame} />
                            <div className="absolute inset-0 rounded-full bg-amber-400/0 group-hover:bg-amber-400/20 transition-colors pointer-events-none" />
                            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1a1b2e] ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-gray-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-base sm:text-lg group-hover:text-amber-300 transition-colors truncate">{friend.display_name}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                              {isOnline ? (
                                <span className="text-green-400 font-medium">متصل الآن</span>
                              ) : (
                                <span>غير متصل</span>
                              )}
                              {friend.country && <span className="opacity-70">({friend.country})</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                          {selectedFriendsToInvite.has(friend.id) ? (
                            <button 
                              onClick={() => {
                                const newSet = new Set(selectedFriendsToInvite);
                                newSet.delete(friend.id);
                                setSelectedFriendsToInvite(newSet);
                              }}
                              className="btn-game flex-1 sm:flex-initial !bg-gradient-to-b !from-green-500 !to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] px-3 py-2 text-xs sm:text-sm whitespace-nowrap justify-center"
                            >
                              ✓ تم التحديد
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                const newSet = new Set(selectedFriendsToInvite);
                                if (newSet.size >= 3) {
                                  alert("يمكنك دعوة 3 لاعبين كحد أقصى");
                                  return;
                                }
                                newSet.add(friend.id);
                                setSelectedFriendsToInvite(newSet);
                              }}
                              className="btn-game flex-1 sm:flex-initial !bg-gradient-to-b !from-sky-400 !to-blue-600 shadow-[0_0_15px_rgba(14,165,233,0.4)] px-3 py-2 text-xs sm:text-sm whitespace-nowrap justify-center"
                            >
                              + تحديد للدعوة
                            </button>
                          )}
                          <button
                            onClick={() => setFriendToUnfriend(friend)}
                            title="إلغاء الصداقة"
                            className="btn-ghost flex-1 sm:flex-initial !px-3 !py-2 !text-red-400 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 text-xs sm:text-sm font-bold whitespace-nowrap"
                          >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                            </svg>
                            <span>إلغاء الصداقة</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ProfileModal 
        profile={selectedProfile} 
        onClose={() => setSelectedProfile(null)} 
      />

      {friendToUnfriend && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-slate-900 via-zinc-900 to-slate-950 border border-red-500/30 w-full max-w-md rounded-2xl p-6 shadow-[0_0_45px_rgba(239,68,68,0.25)] text-center animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-black text-white mb-2">تأكيد إلغاء الصداقة</h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              هل أنت متأكد أنك تريد إلغاء صداقتك مع <strong className="text-amber-300 font-bold">{friendToUnfriend.display_name}</strong>؟<br />
              <span className="text-xs text-red-400 font-medium block mt-2">⚠️ سيتم حذف الصداقة نهائياً من طرفك ومن طرف الصديق أيضاً، ولن تتمكنا من إرسال دعوات اللعب لبعضكما إلا بإضافة كود الصداقة من جديد.</span>
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleConfirmUnfriend}
                disabled={unfriending}
                className="btn-ghost flex-1 !text-red-400 border border-red-500/30 hover:bg-red-500/20 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {unfriending ? "جاري الإلغاء..." : "نعم، إلغاء الصداقة"}
              </button>
              <button
                onClick={() => setFriendToUnfriend(null)}
                disabled={unfriending}
                className="btn-game flex-1 !bg-slate-800 hover:!bg-slate-700 !border-slate-700 py-2.5 rounded-xl font-bold transition-all"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
