import { AppState, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import {
  formatTimer,
  wallClockElapsedSec,
} from "@/src/hooks/useWallClockElapsed";
import { ensureNotificationHandler } from "@/src/lib/meal-workout-reminders";

const CHANNEL_ID = "session-timer";
const NOTIF_ID = "session-timer-ongoing";
const CATEGORY_RUNNING = "sessionTimerRun";
const CATEGORY_PAUSED = "sessionTimerHold";
export const SESSION_TIMER_PAUSE = "sessionTimerPause";
export const SESSION_TIMER_RESUME = "sessionTimerResume";
export const SESSION_TIMER_END = "sessionTimerEnd";

export type SessionTimerKind = "lift" | "conditioning";

export type SessionTimerState = {
  kind: SessionTimerKind;
  title: string;
  startedAt: number;
  pauseAccumMs: number;
  pausedAt: number | null;
};

export type SessionTimerHandlers = {
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
};

let current: SessionTimerState | null = null;
const states = new Map<SessionTimerKind, SessionTimerState>();
const handlers = new Map<SessionTimerKind, SessionTimerHandlers>();
let listenerBound = false;
let appStateBound = false;
let tick: ReturnType<typeof setInterval> | null = null;
let presenting = false;

function fmtState(state: SessionTimerState): { title: string; body: string } {
  const elapsed = wallClockElapsedSec(
    state.startedAt,
    state.pauseAccumMs,
    state.pausedAt,
  );
  const clock = formatTimer(elapsed);
  const paused = state.pausedAt != null;
  return {
    title: paused ? `${state.title} · paused` : state.title,
    body: paused ? `${clock} · Resume or End` : `${clock} · Pause or End`,
  };
}

async function ensureChannelAndCategory(): Promise<void> {
  ensureNotificationHandler();
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Workout timer",
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [0],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
  await Notifications.setNotificationCategoryAsync(CATEGORY_RUNNING, [
    {
      identifier: SESSION_TIMER_PAUSE,
      buttonTitle: "Pause",
      options: { opensAppToForeground: false },
    },
    {
      identifier: SESSION_TIMER_END,
      buttonTitle: "End",
      options: { opensAppToForeground: true, isDestructive: true },
    },
  ]);
  await Notifications.setNotificationCategoryAsync(CATEGORY_PAUSED, [
    {
      identifier: SESSION_TIMER_RESUME,
      buttonTitle: "Resume",
      options: { opensAppToForeground: false },
    },
    {
      identifier: SESSION_TIMER_END,
      buttonTitle: "End",
      options: { opensAppToForeground: true, isDestructive: true },
    },
  ]);
}

async function hasPermission(): Promise<boolean> {
  const currentPerms = await Notifications.getPermissionsAsync();
  if (currentPerms.granted) return true;
  if (currentPerms.status !== "undetermined") return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function presentNow(): Promise<void> {
  if (!current || Platform.OS === "web") return;
  if (AppState.currentState === "active") return;
  if (presenting) return;
  presenting = true;
  try {
    if (!(await hasPermission())) return;
    await ensureChannelAndCategory();
    const copy = fmtState(current);
    const paused = current.pausedAt != null;
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIF_ID,
      content: {
        title: copy.title,
        body: copy.body,
        sound: false,
        sticky: true,
        autoDismiss: false,
        categoryIdentifier: paused ? CATEGORY_PAUSED : CATEGORY_RUNNING,
        data: { kind: current.kind, paused },
        ...(Platform.OS === "android" ? { color: "#C91923", priority: "low" } : {}),
      },
      trigger: Platform.OS === "android" ? { channelId: CHANNEL_ID } : null,
    });
  } catch {
    // Permission or presenter unavailable — in-app timer still runs.
  } finally {
    presenting = false;
  }
}

async function dismissNow(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.dismissNotificationAsync(NOTIF_ID);
  } catch {
    // ignore
  }
}

function startTicker(): void {
  if (tick) return;
  tick = setInterval(() => {
    if (!current || current.pausedAt != null) return;
    if (AppState.currentState === "active") return;
    void presentNow();
  }, 1000);
}

function stopTicker(): void {
  if (!tick) return;
  clearInterval(tick);
  tick = null;
}

function bindAppState(): void {
  if (appStateBound) return;
  appStateBound = true;
  AppState.addEventListener("change", (next) => {
    if (!current) return;
    if (next === "active") {
      stopTicker();
      void dismissNow();
      return;
    }
    if (next === "background" || next === "inactive") {
      startTicker();
      void presentNow();
    }
  });
}

function bindResponseListener(): void {
  if (listenerBound || Platform.OS === "web") return;
  listenerBound = true;
  Notifications.addNotificationResponseReceivedListener((response) => {
    const id = response.actionIdentifier;
    const kind = response.notification.request.content.data?.kind;
    const target =
      kind === "lift" || kind === "conditioning"
        ? handlers.get(kind)
        : current
          ? handlers.get(current.kind)
          : undefined;
    if (!target) return;
    if (id === SESSION_TIMER_PAUSE) target.onPause();
    else if (id === SESSION_TIMER_RESUME) target.onResume();
    else if (id === SESSION_TIMER_END) target.onEnd();
  });
}

export function ensureSessionTimerListener(): void {
  bindResponseListener();
  bindAppState();
}

export function attachSessionTimer(
  state: SessionTimerState,
  nextHandlers: SessionTimerHandlers,
): () => void {
  current = { ...state };
  states.set(state.kind, current);
  handlers.set(state.kind, nextHandlers);
  ensureSessionTimerListener();
  if (AppState.currentState !== "active") {
    startTicker();
    void presentNow();
  }
  return () => {
    detachSessionTimer(state.kind);
  };
}

export function setSessionTimerPaused(paused: boolean): void {
  if (!current) return;
  if (paused && current.pausedAt == null) {
    current = { ...current, pausedAt: Date.now() };
  } else if (!paused && current.pausedAt != null) {
    current = {
      ...current,
      pauseAccumMs: current.pauseAccumMs + (Date.now() - current.pausedAt),
      pausedAt: null,
    };
  } else {
    return;
  }
  states.set(current.kind, current);
  if (AppState.currentState !== "active") void presentNow();
}

export function detachSessionTimer(kind: SessionTimerKind): void {
  handlers.delete(kind);
  states.delete(kind);
  if (current?.kind !== kind) return;
  current = states.get("lift") ?? states.get("conditioning") ?? null;
  if (!current) {
    stopTicker();
    void dismissNow();
    return;
  }
  if (AppState.currentState !== "active") void presentNow();
}
