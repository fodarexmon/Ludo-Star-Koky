import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

const oldConfig = {
  apiKey: "AIzaSyC2X3Ato1hQWCaMD2AyYoDPdmVbrK4owro",
  authDomain: "ludo-lovable-foda.firebaseapp.com",
  projectId: "ludo-lovable-foda",
  storageBucket: "ludo-lovable-foda.firebasestorage.app",
  messagingSenderId: "150903761722",
  appId: "1:150903761722:web:4c91095e7caa88e5f03e03"
};

const newConfig = {
  projectId: "ludo-star-koky",
  appId: "1:645767134808:web:94f87da0e7c8d878a4142d",
  storageBucket: "ludo-star-koky.firebasestorage.app",
  apiKey: "AIzaSyAYFTYLTTGvn1Y3HYOcf05lIdfRy0mzUpc",
  authDomain: "ludo-star-koky.firebaseapp.com",
  messagingSenderId: "645767134808"
};

const oldApp = initializeApp(oldConfig, "old");
const newApp = initializeApp(newConfig, "new");

const oldDb = getFirestore(oldApp);
const newDb = getFirestore(newApp);

async function migrateCollection(collectionName: string) {
  console.log(`Migrating collection: ${collectionName}...`);
  try {
    const querySnapshot = await getDocs(collection(oldDb, collectionName));
    let count = 0;
    for (const document of querySnapshot.docs) {
      // In Firestore, if rules are open, we can read/write everything.
      await setDoc(doc(newDb, collectionName, document.id), document.data());
      count++;
      if (count % 10 === 0) console.log(`Copied ${count} documents...`);
    }
    console.log(`Finished migrating ${count} documents in ${collectionName}.`);
  } catch (error) {
    console.error(`Error migrating ${collectionName}:`, error);
  }
}

async function run() {
  await migrateCollection("profiles");
  await migrateCollection("rooms");
  console.log("Migration complete!");
  process.exit(0);
}

run();
