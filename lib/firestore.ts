import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ---------- Types ----------

export type TelemetryRecord = {
  sessionId: string;
  uid: string;
  headers: string[];
  row: (string | number)[];
  isHuman: boolean;
  createdAt: ReturnType<typeof serverTimestamp>;
};

export type SubmissionRecord = {
  id: string;
  uid: string;
  hunt: string;
  status: string;
  userEmail: string;
  userName: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

export type UserRecord = {
  uid: string;
  email: string;
  displayName: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  phone?: string;
  country?: string;
  ageRange?: string;
  occupation?: string;
  createdAt?: Timestamp | null;
};

// ---------- Telemetry ----------

export async function saveTelemetry(data: {
  sessionId: string;
  uid: string;
  headers: string[];
  row: (string | number)[];
  isHuman: boolean;
}): Promise<boolean> {
  if (!db) return false;
  try {
    await setDoc(doc(db, "telemetry", data.sessionId), {
      sessionId: data.sessionId,
      uid: data.uid,
      headers: data.headers,
      row: data.row,
      isHuman: data.isHuman,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
}

export async function saveBotTelemetry(data: {
  sessionId: string;
  botType: string;
  headers: string[];
  row: (string | number)[];
}): Promise<boolean> {
  if (!db) return false;
  try {
    await setDoc(doc(db, "bot_telemetry", `${data.sessionId}-${data.botType}`), {
      sessionId: data.sessionId,
      botType: data.botType,
      headers: data.headers,
      row: data.row,
      isHuman: false,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
}

// ---------- Submissions ----------

export async function createDraftSubmission(data: {
  sessionId: string;
  uid: string;
  userEmail: string;
  userName: string;
  username: string;
}): Promise<boolean> {
  if (!db) return false;
  try {
    const ref = doc(db, "submissions", data.sessionId);
    const existing = await getDoc(ref);
    if (existing.exists()) return true;
    const now = new Date().toISOString();
    await setDoc(ref, {
      id: data.sessionId,
      uid: data.uid,
      hunt: "turing-test",
      status: "Draft",
      userEmail: data.userEmail,
      userName: data.userName,
      username: data.username,
      createdAt: now,
      updatedAt: now,
    } as SubmissionRecord);
    return true;
  } catch {
    return false;
  }
}

export async function updateSubmissionStatus(
  sessionId: string,
  status: string
): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, "submissions", sessionId), {
      status,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
}

export async function getUserSubmissions(uid: string): Promise<SubmissionRecord[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "submissions"), where("uid", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SubmissionRecord);
  } catch {
    return [];
  }
}

// ---------- Turing Test Unlock ----------

export async function setTuringTestUnlocked(uid: string, unlocked: boolean): Promise<boolean> {
  if (!db) return false;
  try {
    await setDoc(doc(db, "turing_test_state", uid), {
      uid,
      unlocked,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
}

export async function getTuringTestUnlocked(uid: string): Promise<boolean> {
  if (!db) return false;
  try {
    const snap = await getDoc(doc(db, "turing_test_state", uid));
    if (snap.exists()) {
      return (snap.data() as { unlocked: boolean }).unlocked === true;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------- Users (Admin) ----------

export async function getAllUsers(): Promise<UserRecord[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<UserRecord, "uid">),
    }));
  } catch {
    return [];
  }
}

export async function saveUserRecord(uid: string, data: Record<string, string>): Promise<boolean> {
  if (!db) return false;
  try {
    await setDoc(doc(db, "users", uid), {
      uid,
      ...data,
      createdAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch {
    return false;
  }
}
