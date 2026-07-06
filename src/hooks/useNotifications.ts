import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging, db } from "@/integrations/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

export function useNotifications(userId: string | null | undefined) {
  useEffect(() => {
    if (!userId || !messaging) return;

    // Request permission and get token
    async function requestPermission() {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const currentToken = await getToken(messaging!, {
            // Optional: VAPID key is needed if you generated one in Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration
            // vapidKey: "YOUR_PUBLIC_VAPID_KEY_HERE"
          });
          if (currentToken) {
            // Save token to Firestore profile
            await updateDoc(doc(db, "profiles", userId!), {
              fcmToken: currentToken
            });
          } else {
            console.log("No registration token available. Request permission to generate one.");
          }
        } else {
          console.log("Notification permission not granted.");
        }
      } catch (err) {
        console.error("An error occurred while retrieving token. ", err);
      }
    }

    requestPermission();

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
