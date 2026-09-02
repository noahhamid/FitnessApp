import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "trainplate_pending_signup";

export type PendingSignUp = {
  email: string;
  /** Empty on web — never store passwords in localStorage. */
  password: string;
  createdAt: number;
};

const TTL_MS = 30 * 60 * 1000;

function webGet(key: string): string | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function webSet(key: string, value: string): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

function webRemove(key: string): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  } catch {
    /* private mode */
  }
}

async function writeRaw(raw: string | null): Promise<void> {
  if (Platform.OS === "web") {
    if (raw) webSet(KEY, raw);
    else webRemove(KEY);
    return;
  }
  if (raw) await SecureStore.setItemAsync(KEY, raw);
  else await SecureStore.deleteItemAsync(KEY);
}

async function readRaw(): Promise<string | null> {
  if (Platform.OS === "web") return webGet(KEY);
  return SecureStore.getItemAsync(KEY);
}

export async function savePendingSignUp(
  email: string,
  password: string,
): Promise<void> {
  const payload: PendingSignUp = {
    email: email.trim().toLowerCase(),
    // Native: SecureStore. Web: email only — never persist passwords in localStorage.
    password: Platform.OS === "web" ? "" : password,
    createdAt: Date.now(),
  };
  await writeRaw(JSON.stringify(payload));
}

export async function loadPendingSignUp(): Promise<PendingSignUp | null> {
  const raw = await readRaw();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingSignUp;
    if (!parsed.email) return null;
    if (Date.now() - parsed.createdAt > TTL_MS) {
      await clearPendingSignUp();
      return null;
    }
    // Legacy web entries may still have a password — strip it.
    if (Platform.OS === "web" && parsed.password) {
      parsed.password = "";
      await writeRaw(JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    await clearPendingSignUp();
    return null;
  }
}

export async function clearPendingSignUp(): Promise<void> {
  await writeRaw(null);
}
