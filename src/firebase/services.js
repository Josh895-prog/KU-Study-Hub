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
import {
  INITIAL_COURSES,
  INITIAL_RESOURCES,
  DEPARTMENTS,
  RESOURCE_TYPES,
  ADMIN_EMAILS
} from "../data/mockData";

export { DEPARTMENTS, RESOURCE_TYPES, ADMIN_EMAILS };

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
      role: "student",
      createdAt: new Date().toISOString()
    });

    // return combined user + profile info
    return { user: { uid: user.uid, email: user.email, displayName: displayName || user.email.split("@")[0], role: "student" }, error: null };
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
    const user = userCredential.user;

    // Fetch Firestore profile
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        const combined = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || profile.displayName || user.email.split("@")[0],
          role: profile.role || "student",
          department: profile.department || null
        };
        // store session for fallback use
        localStorage.setItem("ku_hub_current_user", JSON.stringify(combined));
        return { user: combined, error: null };
      }
    } catch (e) {
      console.warn("Failed to load user profile from Firestore:", e);
    }

    // fallback to basic user object
    return { user: { uid: user.uid, email: user.email, displayName: user.displayName || user.email.split("@")[0], role: "student" }, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  if (!isFirebaseConfigured()) {
    return JSON.parse(localStorage.getItem("ku_hub_current_user") || "null");
  }

  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("getUserProfile error:", error);
    return null;
  }
};

export const setUserRole = async (targetUid, newRole, currentUser) => {
  // currentUser must be provided and must be superAdmin on client-side checks
  if (!isFirebaseConfigured()) {
    // local fallback: modify stored users list if present
    try {
      const users = JSON.parse(localStorage.getItem("ku_hub_users") || "[]");
      const updated = users.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u));
      localStorage.setItem("ku_hub_users", JSON.stringify(updated));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  try {
    const targetRef = doc(db, "users", targetUid);
    await updateDoc(targetRef, { role: newRole });
    return { success: true };
  } catch (error) {
    console.error("setUserRole error:", error);
    return { success: false, error: error.message };
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

export const isAdminUser = (user) => {
  if (!user || !user.email) return false;
  const email = user.email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.trim().toLowerCase() === email);
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
    status: "pending",
    approvedAt: null,
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

export const approveResourceService = async (resourceId, currentUser) => {
  if (!currentUser || !["admin", "superAdmin"].includes(currentUser.role)) {
    return { success: false, error: "Only admins can approve submissions." };
  }

  if (!isFirebaseConfigured()) {
    const localResources = getLocalData("resources", INITIAL_RESOURCES);
    const updated = localResources.map((resource) =>
      resource.id === resourceId
        ? { ...resource, status: "approved", approvedAt: new Date().toISOString() }
        : resource
    );
    setLocalData("resources", updated);
    return { success: true };
  }

  try {
    const docRef = doc(db, "resources", resourceId);
    await updateDoc(docRef, {
      status: "approved",
      approvedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser.uid
    });
    return { success: true };
  } catch (error) {
    console.error("Firestore approve error:", error);
    const localResources = getLocalData("resources", INITIAL_RESOURCES);
    const updated = localResources.map((resource) =>
      resource.id === resourceId
        ? { ...resource, status: "approved", approvedAt: new Date().toISOString() }
        : resource
    );
    setLocalData("resources", updated);
    return { success: true };
  }
};

export const rejectResourceService = async (resourceId, currentUser, reason) => {
  if (!currentUser || !["admin", "superAdmin"].includes(currentUser.role)) {
    return { success: false, error: "Only admins can reject submissions." };
  }

  if (!isFirebaseConfigured()) {
    const localResources = getLocalData("resources", INITIAL_RESOURCES);
    const updated = localResources.map((resource) =>
      resource.id === resourceId
        ? { ...resource, status: "rejected", reviewedAt: new Date().toISOString(), reviewedBy: currentUser.uid, rejectionReason: reason }
        : resource
    );
    setLocalData("resources", updated);
    return { success: true };
  }

  try {
    const docRef = doc(db, "resources", resourceId);
    await updateDoc(docRef, {
      status: "rejected",
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser.uid,
      rejectionReason: reason || "Not specified"
    });
    return { success: true };
  } catch (error) {
    console.error("Firestore reject error:", error);
    return { success: false, error: error.message };
  }
};

export const getAllUsers = async () => {
  if (!isFirebaseConfigured()) {
    try {
      return JSON.parse(localStorage.getItem("ku_hub_users") || "[]");
    } catch (e) {
      return [];
    }
  }

  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
  } catch (error) {
    console.error("getAllUsers error:", error);
    return [];
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
