import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api";
import { useWallClockElapsed } from "@/src/hooks/useWallClockElapsed";
import type { ConditioningSession } from "@/src/lib/conditioning-plan";
import {
  attachSessionTimer,
  detachSessionTimer,
  setSessionTimerPaused,
} from "@/src/lib/session-timer-notification";
import {
  CONDITIONING_SESSION_NOTES,
  clearConditioningRun,
  loadConditioningRun,
  saveConditioningRun,
  scheduleConditioningNotification,
  type ConditioningRun,
} from "../services/conditioning-run.service";

export function useConditioningRun() {
  const queryClient = useQueryClient();
  const [run, setRun] = useState<ConditioningRun | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justCompletedIndexes, setJustCompletedIndexes] = useState<number[]>(
    [],
  );
  const elapsedSec = useWallClockElapsed(
    run?.startedAt ?? null,
    run?.pausedAt != null,
    run?.pauseAccumMs ?? 0,
  );

  useEffect(() => {
    let active = true;
    void loadConditioningRun().then((stored) => {
      if (active) {
        setRun(stored);
        setHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (next: ConditioningRun) => {
    setRun(next);
    await saveConditioningRun(next);
    await scheduleConditioningNotification(next);
  }, []);

  const start = useCallback(
    async (session: ConditioningSession, index: number) => {
      const next: ConditioningRun = {
        label: session.label,
        modality: session.modality,
        targetMinutes: session.minutes,
        startedAt: Date.now(),
        index,
        pauseAccumMs: 0,
        pausedAt: null,
      };
      await persist(next);
    },
    [persist],
  );

  const pause = useCallback(async () => {
    if (!run || run.pausedAt != null) return;
    setSessionTimerPaused(true);
    await persist({ ...run, pausedAt: Date.now() });
  }, [run, persist]);

  const resume = useCallback(async () => {
    if (!run || run.pausedAt == null) return;
    setSessionTimerPaused(false);
    await persist({
      ...run,
      pauseAccumMs: run.pauseAccumMs + (Date.now() - run.pausedAt),
      pausedAt: null,
    });
  }, [run, persist]);

  const discard = useCallback(async () => {
    setRun(null);
    detachSessionTimer("conditioning");
    await clearConditioningRun();
  }, []);

  const complete = useCallback(async () => {
    if (!run || saving) return;
    setSaving(true);
    const durationSec = Math.max(1, elapsedSec);
    let sessionId: string | undefined;
    try {
      const session = await api.post<{ id: string }>("/api/workouts", {
        notes: CONDITIONING_SESSION_NOTES,
        exercises: [{ exerciseName: run.label, sets: [] }],
      });
      sessionId = session.id;
      await api.post(`/api/workouts/${sessionId}/complete`, {
        notes: CONDITIONING_SESSION_NOTES,
        exercises: [
          {
            exerciseName: run.label,
            sets: [{ durationSec, completed: true }],
          },
        ],
      });
      const finishedIndex = run.index;
      setRun(null);
      detachSessionTimer("conditioning");
      setJustCompletedIndexes((prev) =>
        prev.includes(finishedIndex) ? prev : [...prev, finishedIndex],
      );
      await clearConditioningRun();
      void queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
      void queryClient.invalidateQueries({ queryKey: ["workout-history"] });
      void queryClient.invalidateQueries({ queryKey: ["in-progress-session"] });
    } catch (e) {
      if (sessionId) {
        await api.delete(`/api/workouts/${sessionId}`).catch(() => {});
      }
      throw e;
    } finally {
      setSaving(false);
    }
  }, [run, saving, elapsedSec, queryClient]);

  const pauseRef = useRef(pause);
  const resumeRef = useRef(resume);
  const completeRef = useRef(complete);
  pauseRef.current = pause;
  resumeRef.current = resume;
  completeRef.current = complete;

  useEffect(() => {
    if (!run) {
      detachSessionTimer("conditioning");
      return;
    }
    return attachSessionTimer(
      {
        kind: "conditioning",
        title: run.label,
        startedAt: run.startedAt,
        pauseAccumMs: run.pauseAccumMs,
        pausedAt: run.pausedAt,
      },
      {
        onPause: () => {
          void pauseRef.current();
        },
        onResume: () => {
          void resumeRef.current();
        },
        onEnd: () => {
          void completeRef.current();
        },
      },
    );
  }, [run?.startedAt, run?.label, run?.index]);

  useEffect(() => {
    if (!run) return;
    setSessionTimerPaused(run.pausedAt != null);
  }, [run?.pausedAt]);

  return {
    run,
    hydrated,
    saving,
    elapsedSec,
    paused: run?.pausedAt != null,
    justCompletedIndexes,
    start,
    pause,
    resume,
    complete,
    discard,
  };
}
