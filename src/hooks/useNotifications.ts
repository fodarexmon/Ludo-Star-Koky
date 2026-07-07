import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging, db } from "@/integrations/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export async function requestNotificationPermission(userId: string) {
  if (!("Notification" in window) || !messaging) {
    toast.error("الإشعارات غير مدعومة في متصفحك الحالي.");
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const vapidKey = import.meta.env.VITE_VAPID_KEY;
      if (!vapidKey) {
        console.warn("VITE_VAPID_KEY is not defined in .env! Push tokens might fail.");
      }
      
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        await updateDoc(doc(db, "profiles", userId), {
          fcmToken: currentToken
        });
        toast.success("تم تفعيل الإشعارات بنجاح!");
        return true;
      } else {
        toast.error("فشل في الحصول على توكن الإشعارات.");
      }
    } else {
      toast.error("تم رفض صلاحية الإشعارات. يرجى تفعيلها من إعدادات المتصفح.");
    }
  } catch (err) {
    console.error("Could not init notifications", err);
    toast.error("حدث خطأ أثناء تفعيل الإشعارات.");
  }
  return false;
}

export function useNotifications(userId: string | null | undefined) {
  const nav = useNavigate();

  useEffect(() => {
    if (!userId || !messaging) return;

    // Listen to foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received in foreground: ", payload);
      if (payload.notification) {
        const urlToOpen = payload.data?.url;
        toast(payload.notification.title, {
          description: payload.notification.body,
          action: urlToOpen ? {
            label: "فتح",
            onClick: () => nav({ to: urlToOpen as any }),
          } : undefined,
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, nav]);
}
