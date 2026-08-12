import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * KU STUDY RESOURCE HUB - FIREBASE CONFIGURATION
 * 
 * Instructions:
 * 1. Go to Firebase Console (https://console.firebase.google.com/)
 * 2. Create a project named "KU-Resource-Hub" (or select existing)
 * 3. Add a Web App to get your Firebase configuration object
 * 4. Replace the placeholder strings below with your project credentials:
 *    - Enable Authentication (Email/Password)
 *    - Enable Cloud Firestore (in production or test mode)
 *    - Enable Cloud Storage (for PDF/DOCX/image uploads)
 */

export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "ku-resource-hub.firebaseapp.com",
  projectId: "ku-resource-hub",
  storageBucket: "ku-resource-hub.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Check if actual credentials have been added
export const isFirebaseConfigured = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
    !firebaseConfig.apiKey.includes("YOUR_FIREBASE")
  );
};

let app, auth, db, storage;

try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("⚡ Firebase initialized successfully!");
  } else {
    console.warn(
      "⚠️ Firebase is using placeholder credentials. Running in interactive Demo/Fallback Mode."
    );
  }
} catch (error) {
  console.error("Firebase init error:", error);
}

export { app, auth, db, storage };
