import { useEffect } from "react";
import { rtdb } from "@/integrations/firebase/client";
import { ref, onValue, onDisconnect, set, serverTimestamp } from "firebase/database";

export function usePresence(userId: string | null, roomId: string | null) {
  useEffect(() => {
    if (!userId) return;

    // Firebase RTDB connection status reference
    const connectedRef = ref(rtdb, ".info/connected");
    // Reference to this user's status in RTDB
    const userStatusRef = ref(rtdb, `/status/${userId}`);

    const isOfflineForDatabase = {
      state: "offline",
      lastChanged: serverTimestamp(),
    };

    const isOnlineForDatabase = {
      state: "online",
      room: roomId || "lobby",
      lastChanged: serverTimestamp(),
    };

    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === false) {
        // Not connected
        return;
      }

      // When connected, set up the onDisconnect hook
      onDisconnect(userStatusRef)
        .set(isOfflineForDatabase)
        .then(() => {
          // Promise resolves when the server acknowledges the onDisconnect request
          // Now we can safely set ourselves to online
          set(userStatusRef, isOnlineForDatabase);
        });
    });

    return () => {
      unsubscribe();
      // When unmounting (e.g. leaving the room/game), mark as offline or remove room
      if (userId) {
        set(userStatusRef, {
          state: "offline",
          lastChanged: serverTimestamp(),
        });
      }
    };
  }, [userId, roomId]);
}
