// ─── Hooks ────────────────────────────────────────────────────────────────────
export {
    useAuth,
    useAuthHydration,
    useSignIn,
    useSignOut,
    useSignUp
} from "./hooks/useAuth";
export { useSaveGoal, useUserGoal } from "./hooks/useGoals";
export { useProfile, useSaveProfile } from "./hooks/useProfile";

// ─── Components ───────────────────────────────────────────────────────────────
export { GoalsForm } from "./components/GoalsForm";
export { OAuthButtons } from "./components/OAuthButtons";
export { ProfileMetricsForm } from "./components/ProfileMetricsForm";
export { ReadyScreen } from "./components/ReadyScreen";
export { SignInForm } from "./components/SignInForm";
export { SignUpForm } from "./components/SignUpForm";
export { WelcomeSlides } from "./components/WelcomeSlides";

// ─── Onboarding ───────────────────────────────────────────────────────────────
export { GenderStep } from "./components/onboarding/GenderStep";
export { GoalStep } from "./components/onboarding/GoalStep";
export { AgeStep } from "./components/onboarding/AgeStep";
export { HeightStep } from "./components/onboarding/HeightStep";
export { ActivityStep } from "./components/onboarding/ActivityStep";
export { FitnessStep } from "./components/onboarding/FitnessStep";
export { WeightStep } from "./components/onboarding/WeightStep";
export { HeroImage } from "./components/HeroImage";
export { useOnboardingStore } from "./store/onboardingStore";
export type { Gender, Goal, ActivityLevel, FitnessLevel } from "./store/onboardingStore";

// ─── Services (if needed directly) ───────────────────────────────────────────
export { signIn, signOut, signUp } from "./services/auth.service";
export { fetchUserGoal, upsertUserGoal } from "./services/goals.service";
export { fetchProfile, upsertProfile } from "./services/profile.service";

