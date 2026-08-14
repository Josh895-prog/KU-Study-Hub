/*
 One-time script to set a superAdmin role for a user by email.
 Usage:
   node scripts/set-superadmin.js --serviceAccount=./serviceAccountKey.json --email=7791.2023@students.ku.ac.ke

 This script uses the Firebase Admin SDK. It will:
  - initialize the Admin SDK using the provided service account
  - find the user by email
  - set a custom claim { role: 'superAdmin' }
  - create/update the Firestore users/{uid} document with role: 'superAdmin'

 IMPORTANT: Do NOT commit your service account JSON to the repo. Run this locally and keep credentials secure.
*/

import fs from "fs";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const argv = process.argv.slice(2).reduce((acc, cur) => {
  const [k, v] = cur.split("=");
  acc[k.replace(/^--/, "")] = v;
  return acc;
}, {});

const serviceAccountPath = argv.serviceAccount;
const targetEmail = argv.email;

if (!serviceAccountPath || !targetEmail) {
  console.error("Usage: node scripts/set-superadmin.js --serviceAccount=./serviceAccountKey.json --email=you@example.com");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
} catch (e) {
  console.error("Failed to read service account file:", e.message);
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();
const db = getFirestore();

(async () => {
  try {
    const userRecord = await auth.getUserByEmail(targetEmail);
    const uid = userRecord.uid;

    // Set custom claims
    await auth.setCustomUserClaims(uid, { role: "superAdmin" });
    console.log(`Set custom claim role=superAdmin for uid=${uid}`);

    // Update Firestore users document
    const userRef = db.doc(`users/${uid}`);
    await userRef.set({ uid, email: targetEmail, role: "superAdmin", updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`Firestore users/${uid} updated with role=superAdmin`);

    console.log("Done. Please sign in with the super admin account; the frontend will pick up the role from Firestore on next login.");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
