import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { localDateOnly } from "@/src/features/progress/lib/localDate";
import {
  minWeekOffsetSince,
  shiftDateStr,
  signupDateOnly,
  weekDatesFor,
  weekOffsetForDate,
} from "@/src/lib/week-days";

type DiaryDateState = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
};

export const useDiaryDateStore = create<DiaryDateState>((set) => ({
  selectedDate: localDateOnly(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));

/**
 * Shared Home + Nutrition calendar day. Changing the day on one tab
 * keeps the other tab on the same date.
 */
export function useDiaryDate(joinAt?: string | Date | null) {
  const raw = useDiaryDateStore((s) => s.selectedDate);
  const setSelectedDate = useDiaryDateStore((s) => s.setSelectedDate);
  const today = localDateOnly();
  const joinDate = signupDateOnly(joinAt);

  const selectedDate =
    raw > today ? today : joinDate && raw < joinDate ? joinDate : raw;

  useEffect(() => {
    if (raw !== selectedDate) setSelectedDate(selectedDate);
  }, [raw, selectedDate, setSelectedDate]);

  const weekOffset = weekOffsetForDate(selectedDate);
  const { weekStart, weekEnd, weekDates } = useMemo(
    () => weekDatesFor(weekOffset),
    [weekOffset],
  );

  const minWeekOffset = minWeekOffsetSince(joinAt);
  const canGoPrevWeek =
    minWeekOffset == null ? true : weekOffset > minWeekOffset;
  const canGoNextWeek = weekOffset < 0;

  const shiftWeek = (delta: number) => {
    const next = weekOffset + delta;
    if (minWeekOffset != null && next < minWeekOffset) return;
    if (next > 0) return;
    const shifted = shiftDateStr(selectedDate, delta * 7);
    const clamped =
      joinDate && shifted < joinDate
        ? joinDate
        : shifted > today
          ? today
          : shifted;
    setSelectedDate(clamped);
  };

  return {
    today,
    selectedDate,
    setSelectedDate,
    weekOffset,
    weekStart,
    weekEnd,
    weekDates,
    canGoPrevWeek,
    canGoNextWeek,
    shiftWeek,
    isToday: selectedDate === today,
    joinDate,
  };
}
