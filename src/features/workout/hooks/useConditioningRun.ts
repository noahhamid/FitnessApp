import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api";
import { useWallClockElapsed } from "@/src/hooks/useWallClockElapsed";
import type { ConditioningSession } from "@/src/lib/conditioning-plan";
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
  const elapsedSec = useWallClockElapsed(run?.startedAt ?? null, false);

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

  const start = useCallback(async (session: ConditioningSession, index: number) => {
    const next: ConditioningRun = {
      label: session.label,
      modality: session.modality,
      targetMinutes: session.minutes,
      startedAt: Date.now(),
      index,
    };
    setRun(next);
    await saveConditioningRun(next);
    await scheduleConditioningNotification(next);
  }, []);

  const discard = useCallback(async () => {
    setRun(null);
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

  return {
    run,
    hydrated,
    saving,
    elapsedSec,
    justCompletedIndexes,
    start,
    complete,
    discard,
  };
}
