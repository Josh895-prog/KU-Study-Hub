import {
  auth,
  db,
  storage,
  isFirebaseConfigured
} from "./config";

export { isFirebaseConfigured };
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
  query,
  where,
  orderBy,
  setDoc,
  getDoc
} from "firebase/firestore";
import { INITIAL_COURSES, INITIAL_RESOURCES, DEPARTMENTS, RESOURCE_TYPES } from "../data/mockData";

export { DEPARTMENTS, RESOURCE_TYPES };

// Helper to initialize local storage mock data if not already present
const getLocalData = (key, fallback) => {
  const data = localStorage.getItem(`ku_hub_${key}`);
  if (!data) {
    localStorage.setItem(`ku_hub_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
};

const setLocalData = (key, data) => {
  localStorage.setItem(`ku_hub_${key}`, JSON.stringify(data));
};

/**
 * AUTHENTICATION SERVICES
 */

export const validateKUEmail = (email) => {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  return lower.endsWith("@ku.ac.ke") || lower.endsWith("@students.ku.ac.ke");
};

export const signUpUser = async (email, password, displayName, department) => {
  if (!isFirebaseConfigured()) {
    // Local Fallback Auth
    const newUser = {
      uid: "user_" + Date.now(),
      email,
      displayName: displayName || email.split("@")[0],
      department: department || "General Studies",
      isKUEmail: validateKUEmail(email),
      joinedAt: new Date().toISOString()
    };
    localStorage.setItem("ku_hub_current_user", JSON.stringify(newUser));
    return { user: newUser, error: null };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });

    // Store user metadata in Firestore 'users' collection
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.email.split("@")[0],
      department: department || "General Studies",
      isKUEmail: validateKUEmail(email),
      joinedAt: new Date().toISOString()
    });

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const signInUser = async (email, password) => {
  if (!isFirebaseConfigured()) {
    // Local Fallback Auth
    const existingUser = JSON.parse(localStorage.getItem("ku_hub_current_user")) || {
      uid: "user_demo_01",
      email: email,
      displayName: email.split("@")[0] || "KU Student",
      department: "School of Business",
      isKUEmail: validateKUEmail(email),
      joinedAt: new Date().toISOString()
    };
    localStorage.setItem("ku_hub_current_user", JSON.stringify(existingUser));
    return { user: existingUser, error: null };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  if (!isFirebaseConfigured()) {
    localStorage.removeItem("ku_hub_current_user");
    return { error: null };
  }

  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * COURSES SERVICES
 */

export const getCourses = async () => {
  if (!isFirebaseConfigured()) {
    return getLocalData("courses", INITIAL_COURSES);
  }

  try {
    const querySnapshot = await getDocs(collection(db, "courses"));
    if (querySnapshot.empty) {
      // Seed Firestore with initial courses if empty
      for (const course of INITIAL_COURSES) {
        await setDoc(doc(db, "courses", course.id), course);
      }
      return INITIAL_COURSES;
    }
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Firestore getCourses error, using fallback:", error);
    return getLocalData("courses", INITIAL_COURSES);
  }
};

/**
 * RESOURCES SERVICES
 */

export const getResources = async () => {
  if (!isFirebaseConfigured()) {
    return getLocalData("resources", INITIAL_RESOURCES);
  }

  try {
    const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      // Seed Firestore with sample resources if empty
      for (const res of INITIAL_RESOURCES) {
        await setDoc(doc(db, "resources", res.id), res);
      }
      return INITIAL_RESOURCES;
    }
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Firestore getResources error, using fallback:", error);
    return getLocalData("resources", INITIAL_RESOURCES);
  }
};

export const uploadResourceService = async ({
  title,
  description,
  courseCode,
  department,
  resourceType,
  file,
  currentUser
}) => {
  const timestamp = new Date().toISOString();
  const fileExtension = file ? file.name.split(".").pop().toUpperCase() : "PDF";
  const formattedSize = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "1.2 MB";

  let fileUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  if (isFirebaseConfigured() && file) {
    try {
      const storageRef = ref(storage, `resources/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      fileUrl = await getDownloadURL(uploadResult.ref);
    } catch (e) {
      console.warn("Storage upload failed or unconfigured, using fallback link:", e);
    }
  } else if (file) {
    // Create object URL for local preview/download during demo
    fileUrl = URL.createObjectURL(file);
  }

  const newResource = {
    id: "res_" + Date.now(),
    title,
    description: description || "No description provided.",
    courseCode,
    department: department || "General Studies",
    resourceType: resourceType || "Notes",
    fileUrl,
    fileName: file ? file.name : `${courseCode.replace(/\s+/g, "_")}_resource.${fileExtension.toLowerCase()}`,
    fileSize: formattedSize,
    uploaderId: currentUser?.uid || "user_demo",
    uploaderName: currentUser?.displayName || currentUser?.email?.split("@")[0] || "Anonymous KU Student",
    uploaderEmail: currentUser?.email || "student@students.ku.ac.ke",
    upvotesCount: 0,
    upvotedBy: [],
    createdAt: timestamp
  };

  if (!isFirebaseConfigured()) {
    const localResources = getLocalData("resources", INITIAL_RESOURCES);
    const updated = [newResource, ...localResources];
    setLocalData("resources", updated);
    return { resource: newResource, error: null };
  }

  try {
    const docRef = await addDoc(collection(db, "resources"), newResource);
    newResource.id = docRef.id;
    return { resource: newResource, error: null };
  } catch (error) {
    console.error("Firestore addDoc failed, using local state:", error);
    const localResources = getLocalData("resources", INITIAL_RESOURCES);
    const updated = [newResource, ...localResources];
    setLocalData("resources", updated);
    return { resource: newResource, error: null };
  }
};

export const upvoteResourceService = async (resourceId, userId, currentResources) => {
  let updatedResource = null;

  const updateList = (list) => {
    return list.map((res) => {
      if (res.id === resourceId) {
        const hasUpvoted = res.upvotedBy?.includes(userId);
        const newUpvotedBy = hasUpvoted
          ? res.upvotedBy.filter((id) => id !== userId)
          : [...(res.upvotedBy || []), userId];
        const newCount = hasUpvoted
          ? Math.max(0, (res.upvotesCount || 1) - 1)
          : (res.upvotesCount || 0) + 1;

        updatedResource = {
          ...res,
          upvotesCount: newCount,
          upvotedBy: newUpvotedBy
        };
        return updatedResource;
      }
      return res;
    });
  };

  if (!isFirebaseConfigured()) {
    const localResources = getLocalData("resources", INITIAL_RESOURCES);
    const updated = updateList(localResources);
    setLocalData("resources", updated);
    return { resources: updated, updatedResource };
  }

  try {
    const docRef = doc(db, "resources", resourceId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const resData = docSnap.data();
      const hasUpvoted = resData.upvotedBy?.includes(userId);

      await updateDoc(docRef, {
        upvotesCount: increment(hasUpvoted ? -1 : 1),
        upvotedBy: hasUpvoted ? arrayRemove(userId) : arrayUnion(userId)
      });
    }

    const updated = updateList(currentResources);
    return { resources: updated, updatedResource };
  } catch (error) {
    console.error("Firestore upvote error, using local fallback:", error);
    const localResources = getLocalData("resources", INITIAL_RESOURCES);
    const updated = updateList(localResources);
    setLocalData("resources", updated);
    return { resources: updated, updatedResource };
  }
};

export const deleteResourceService = async (resourceId, currentResources) => {
  if (!isFirebaseConfigured()) {
    const localResources = getLocalData("resources", INITIAL_RESOURCES);
    const updated = localResources.filter((r) => r.id !== resourceId);
    setLocalData("resources", updated);
    return { success: true };
  }

  try {
    await deleteDoc(doc(db, "resources", resourceId));
    return { success: true };
  } catch (error) {
    console.error("Firestore delete error:", error);
    const localResources = getLocalData("resources", INITIAL_RESOURCES);
    const updated = localResources.filter((r) => r.id !== resourceId);
    setLocalData("resources", updated);
    return { success: true };
  }
};
