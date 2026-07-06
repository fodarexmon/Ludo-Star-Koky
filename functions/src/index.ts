import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

export const onInviteCreated = functions.firestore
  .document("profiles/{userId}/invites/{inviteId}")
  .onCreate(async (snap, context) => {
    const invite = snap.data();
    const userId = context.params.userId;

    try {
      const userDoc = await db.collection("profiles").doc(userId).get();
      if (!userDoc.exists) return;
      
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;

      if (!fcmToken) {
        console.log(`No FCM token for user ${userId}`);
        return;
      }

      const payload = {
        notification: {
          title: "دعوة جديدة للعب! 🎲",
          body: `لقد دعاك ${invite.fromName} للانضمام إلى غرفته!`,
        },
        data: {
          url: `/play/online/${invite.roomCode}`,
          type: "invite",
          roomCode: invite.roomCode
        }
      };

      await messaging.send({
        token: fcmToken,
        ...payload
      });
      
      console.log(`Successfully sent invite notification to ${userId}`);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  });

export const onFriendAdded = functions.firestore
  .document("profiles/{userId}/friends/{friendId}")
  .onCreate(async (snap, context) => {
    const friend = snap.data();
    const userId = context.params.userId;

    try {
      const userDoc = await db.collection("profiles").doc(userId).get();
      if (!userDoc.exists) return;
      
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;

      if (!fcmToken) {
        console.log(`No FCM token for user ${userId}`);
        return;
      }

      const payload = {
        notification: {
          title: "صديق جديد! 👥",
          body: `قام ${friend.display_name} بإضافتك كصديق!`,
        },
        data: {
          url: `/friends`,
          type: "friend_add",
        }
      };

      await messaging.send({
        token: fcmToken,
        ...payload
      });
      
      console.log(`Successfully sent friend notification to ${userId}`);
    } catch (error) {
      console.error("Error sending friend notification:", error);
    }
  });
