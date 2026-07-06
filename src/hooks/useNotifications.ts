import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging, db } from "@/integrations/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

export function useNotifications(userId: string | null | undefined) {
  useEffect(() => {
    if (!userId || !messaging) return;

    // Request permission and get token
    async function initNotifications() {
      if (!("Notification" in window)) return;
      
      try {
        let permission = Notification.permission;
        
        // Only request if not already denied
        if (permission === "default") {
          permission = await Notification.requestPermission();
        }

        if (permission === "granted") {
          const currentToken = await getToken(messaging!, {
            // vapidKey: "YOUR_PUBLIC_VAPID_KEY_HERE"
          });
          if (currentToken) {
            await updateDoc(doc(db, "profiles", userId!), {
              fcmToken: currentToken
            });
          }
        }
      } catch (err) {
        console.warn("Could not init notifications", err);
      }
    }

    initNotifications();

    // Listen to foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received in foreground: ", payload);
      if (payload.notification) {
        toast(payload.notification.title, {
          description: payload.notification.body,
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);
}
