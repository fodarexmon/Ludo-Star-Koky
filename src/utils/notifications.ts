import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

export async function sendPushNotification(
  targetUserId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const userDoc = await getDoc(doc(db, "profiles", targetUserId));
    if (!userDoc.exists()) return;

    const fcmToken = userDoc.data()?.fcmToken;
    if (!fcmToken) return;

    await fetch("/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: fcmToken,
        title,
        body,
        data,
      }),
    });
  } catch (err) {
    console.error("Failed to send push notification", err);
  }
}
