import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  projectId: "ludo-star-koky",
  appId: "1:645767134808:web:94f87da0e7c8d878a4142d",
  storageBucket: "ludo-star-koky.firebasestorage.app",
  apiKey: "AIzaSyAYFTYLTTGvn1Y3HYOcf05lIdfRy0mzUpc",
  authDomain: "ludo-star-koky.firebaseapp.com",
  messagingSenderId: "645767134808",
  databaseURL: "https://ludo-star-koky-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const rtdb = getDatabase(app);

// Messaging is only supported in context with a ServiceWorker and secure origins
let messagingInstance: any = null;
try {
  messagingInstance = getMessaging(app);
} catch (e) {
  console.log("Firebase Messaging not supported in this environment", e);
}
export const messaging = messagingInstance;
