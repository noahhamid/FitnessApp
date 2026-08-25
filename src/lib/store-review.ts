import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as StoreReview from "expo-store-review";

const STORAGE_KEY = "exo:store-review-v1";
const DAY_MS = 24 * 60 * 60 * 1000;
const YEARLY_CAP = 2;

type StoreReviewState = {
  /** OS does not tell us if a rating was submitted. Stays false unless we set it. */
  hasReviewed: boolean;
  onboardingPrompted: boolean;
  year: number;
  yearlyPromptCount: number;
  nextEligibleAt: number | null;
};

function emptyState(): StoreReviewState {
  return {
    hasReviewed: false,
    onboardingPrompted: false,
    year: new Date().getFullYear(),
    yearlyPromptCount: 0,
    nextEligibleAt: null,
  };
}

function randomFollowUpAt(minDays: number, maxDays: number): number {
  const span = Math.max(0, maxDays - minDays);
  const days = minDays + Math.floor(Math.random() * (span + 1));
  return Date.now() + days * DAY_MS;
}

async function loadState(): Promise<StoreReviewState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<StoreReviewState>;
    return {
      ...emptyState(),
      ...parsed,
    };
  } catch {
    return emptyState();
  }
}

async function saveState(state: StoreReviewState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function rollCalendarYear(state: StoreReviewState): StoreReviewState {
  const year = new Date().getFullYear();
  if (state.year === year) return state;
  return {
    ...state,
    year,
    yearlyPromptCount: 0,
    nextEligibleAt: state.hasReviewed ? null : randomFollowUpAt(20, 80),
  };
}

/**
 * Native in-app sheet only. Never opens the Play/App Store (that leaves the app).
 * iOS: SKStoreReviewController. Android: Play In-App Review (API 21+).
 */
async function requestIosInAppReview(): Promise<boolean> {
  if (!(await StoreReview.isAvailableAsync())) return false;
  await StoreReview.requestReview();
  return true;
}

async function requestAndroidInAppReview(): Promise<boolean> {
  const apiLevel = typeof Platform.Version === "number" ? Platform.Version : 0;
  if (apiLevel < 21) return false;
  if (!(await StoreReview.isAvailableAsync())) return false;
  await StoreReview.requestReview();
  return true;
}

export async function requestInAppReview(): Promise<boolean> {
  try {
    if (Platform.OS === "ios") return await requestIosInAppReview();
    if (Platform.OS === "android") return await requestAndroidInAppReview();
    return false;
  } catch {
    return false;
  }
}

/** End of onboarding, immediately before the paywall. Once per install. */
export async function promptOnboardingReview(): Promise<void> {
  const state = rollCalendarYear(await loadState());
  if (state.onboardingPrompted || state.hasReviewed) {
    await saveState({ ...state, onboardingPrompted: true });
    return;
  }

  await requestInAppReview();
  await saveState({
    ...state,
    onboardingPrompted: true,
    nextEligibleAt: state.hasReviewed ? null : randomFollowUpAt(45, 160),
  });
}

/**
 * Up to two extra in-app prompts per calendar year, on a random delay,
 * only if we have not marked the user as already reviewed.
 */
export async function maybePromptYearlyReview(): Promise<void> {
  let state = rollCalendarYear(await loadState());

  if (state.hasReviewed) return;

  if (!state.onboardingPrompted && state.nextEligibleAt == null) {
    await saveState({
      ...state,
      nextEligibleAt: randomFollowUpAt(14, 60),
    });
    return;
  }

  if (state.yearlyPromptCount >= YEARLY_CAP) return;
  if (state.nextEligibleAt == null || Date.now() < state.nextEligibleAt) return;

  const shown = await requestInAppReview();
  if (!shown) {
    await saveState({
      ...state,
      nextEligibleAt: randomFollowUpAt(7, 21),
    });
    return;
  }

  const yearlyPromptCount = state.yearlyPromptCount + 1;
  await saveState({
    ...state,
    yearlyPromptCount,
    nextEligibleAt:
      yearlyPromptCount >= YEARLY_CAP ? null : randomFollowUpAt(70, 180),
  });
}
