# PotentialPeak Onboarding Flow - Implementation Complete

## Overview
Redesigned 7-step onboarding flow with dynamic hero imagery based on gender selection, optimized for high conversion and minimal friction.

## Flow Structure

### Pre-Onboarding
**Route:** `/(auth)/welcome`
- WelcomeSlides component with auto-advance (3 seconds)
- Design: Dark background (#0A0A0A), red accent (#FF1F4D)
- Features: "TRACK STRENGTH", "FUEL SMART", "TRAIN FOCUSED"

### Onboarding Steps

#### Step 1: Gender Selection
**Route:** `/(auth)/onboarding/gender`
- **Component:** `GenderStep`
- **Options:** Male / Female / Prefer not to say
- **Purpose:** Sets hero image for subsequent screens
- **Auto-advances:** Yes (300ms delay after selection)
- **Hero Image:** None (this IS the selection screen)

#### Step 2: Main Goal
**Route:** `/(auth)/onboarding/goal`
- **Component:** `GoalStep`
- **Options:** Lose Weight / Build Muscle / Endurance / Stay Healthy
- **Hero Image:** ✅ Dynamic (based on Step 1)
- **Auto-advances:** Yes

#### Step 3: Age
**Route:** `/(auth)/onboarding/age`
- **Component:** `AgeStep`
- **Input:** Number (13-100)
- **Hero Image:** ✅ Dynamic
- **Button:** CONTINUE →

#### Step 4: Height
**Route:** `/(auth)/onboarding/height`
- **Component:** `HeightStep`
- **Input:** Number + unit toggle (cm/ft)
- **Hero Image:** ✅ Dynamic
- **Button:** CONTINUE →

#### Step 5: Activity Level
**Route:** `/(auth)/onboarding/activity`
- **Component:** `ActivityStep`
- **Options:** Sedentary / Light / Moderate / Active / Very Active
- **Hero Image:** ✅ Dynamic
- **Auto-advances:** Yes

#### Step 6: Fitness Level
**Route:** `/(auth)/onboarding/fitness`
- **Component:** `FitnessStep`
- **Options:** Beginner / Intermediate / Advanced
- **Hero Image:** ✅ Dynamic
- **Auto-advances:** Yes

#### Step 7: Weight
**Route:** `/(auth)/onboarding/weight`
- **Component:** `WeightStep`
- **Input:** Number + unit toggle (kg/lbs)
- **Hero Image:** ❌ None (clean UI for precision)
- **Loading State:** "PERSONALIZING" (2 seconds)
- **Button:** COMPLETE →
- **Next:** Navigates to `/(auth)/sign-up`

### Post-Onboarding: Account Wall
**Route:** `/(auth)/sign-up`
- User sees calculated targets (teaser)
- Creates account to save personalized plan
- Alternative: `/(auth)/sign-in` for existing users

---

## Technical Implementation

### State Management (Zustand)
**Store:** `src/features/auth/store/onboardingStore.ts`

```typescript
type OnboardingData = {
  gender: Gender | null;
  goal: Goal | null;
  age: number | null;
  heightCm: number | null;
  heightUnit: "cm" | "ft";
  activityLevel: ActivityLevel | null;
  fitnessLevel: FitnessLevel | null;
  weightKg: number | null;
  weightUnit: "kg" | "lbs";
};
```

### Dynamic Hero Image
**Component:** `src/features/auth/components/HeroImage.tsx`
- Reads `gender` from Zustand store
- Renders fit male/female/neutral image
- Dimensions: 200px height, full width
- Gradient overlay for text readability

**Image URLs (Unsplash):**
- Male: `photo-1583454110551-21f2fa2afe61`
- Female: `photo-1548690312-e3b507d8c110`
- Other: `photo-1571019614242-c5c5dee9f50b`

### Component Structure
All onboarding steps follow consistent design:
- Dark background (#0A0A0A)
- Red accent (#FF1F4D)
- Card-based selection UI
- Typography: BarlowCondensed (headings), DMSans (body)
- Step counter: "STEP X OF 7"

---

## Routes Created

```
app/(auth)/onboarding/
├── gender.tsx       → GenderStep
├── goal.tsx         → GoalStep
├── age.tsx          → AgeStep
├── height.tsx       → HeightStep
├── activity.tsx     → ActivityStep
├── fitness.tsx      → FitnessStep
└── weight.tsx       → WeightStep
```

---

## User Experience Flow

```
Welcome Screen (3s auto-advance)
    ↓
Step 1: Gender Selection (auto-advance)
    ↓ [Sets hero image]
Step 2: Goal Selection (auto-advance, shows hero)
    ↓
Step 3: Age Input (manual continue, shows hero)
    ↓
Step 4: Height Input (manual continue, shows hero)
    ↓
Step 5: Activity Level (auto-advance, shows hero)
    ↓
Step 6: Fitness Level (auto-advance, shows hero)
    ↓
Step 7: Weight Input (manual complete, NO hero)
    ↓ [2s "PERSONALIZING" loading]
Sign-Up / Sign-In (Account Wall)
    ↓
Save to database → Enter app
```

---

## Design Rationale

### Why Gender First?
- Sets visual context for entire flow
- Creates personalized, relatable experience
- Enables dynamic imagery without breaking layout

### Why No Hero on Weight Screen?
- Creates visual "pause" before final step
- Focuses user attention on precision measurement
- Reduces cognitive load during numeric input

### Why Auto-Advance on Selections?
- Reduces friction (fewer button clicks)
- Creates momentum through the flow
- Manual inputs (age, height, weight) require explicit confirmation

### Why Loading State After Weight?
- Signals that calculations are happening
- Creates anticipation for results
- Justifies the account wall ("we built YOUR plan")

---

## Next Steps

### Integration with Better-Auth
After user completes sign-up, save onboarding data:

```typescript
const onboardingData = useOnboardingStore.getState();

await prisma.user.update({
  where: { id: user.id },
  data: {
    profile: {
      create: {
        gender: onboardingData.gender,
        goal: onboardingData.goal,
        age: onboardingData.age,
        heightCm: onboardingData.heightCm,
        weightKg: onboardingData.weightKg,
        activityLevel: onboardingData.activityLevel,
        fitnessLevel: onboardingData.fitnessLevel,
      }
    }
  }
});

// Clear onboarding store
useOnboardingStore.getState().reset();
```

### Calculations for Account Wall Teaser
Use onboarding data to display:
- **TDEE:** Calculate using Mifflin-St Jeor equation
- **Protein Target:** Based on goal and weight
- **Workout Split:** Based on fitness level and goal

---

## Files Created/Modified

### New Files
- `src/features/auth/store/onboardingStore.ts`
- `src/features/auth/components/HeroImage.tsx`
- `src/features/auth/components/onboarding/GenderStep.tsx`
- `src/features/auth/components/onboarding/GoalStep.tsx`
- `src/features/auth/components/onboarding/AgeStep.tsx`
- `src/features/auth/components/onboarding/HeightStep.tsx`
- `src/features/auth/components/onboarding/ActivityStep.tsx`
- `src/features/auth/components/onboarding/FitnessStep.tsx`
- `src/features/auth/components/onboarding/WeightStep.tsx`
- `app/(auth)/onboarding/gender.tsx`
- `app/(auth)/onboarding/goal.tsx`
- `app/(auth)/onboarding/age.tsx`
- `app/(auth)/onboarding/height.tsx`
- `app/(auth)/onboarding/activity.tsx`
- `app/(auth)/onboarding/fitness.tsx`
- `app/(auth)/onboarding/weight.tsx`

### Modified Files
- `src/features/auth/index.ts` (added exports)
- `app/(auth)/welcome.tsx` (updated navigation)
- `src/ui/tokens/colors.ts` (new color scheme)
- `src/ui/components/Button.tsx` (updated styling)

---

## Design System Update

### Color Palette
```typescript
accent: "#FF1F4D"      // Primary red (replaces #FFC700 gold)
bg: "#0A0A0A"          // Darkest background
bg2: "#111111"         // Card backgrounds
bg3: "#1A1A1A"         // Elevated surfaces
border: "#242424"      // Borders and dividers
text: "#FFFFFF"        // Pure white text
muted: "#A8A8A8"       // Secondary text
```

### Typography Scale
- **Display:** 42px, BarlowCondensed Black, -1 letter-spacing
- **Title:** 28px, BarlowCondensed Black, 2 letter-spacing
- **Body:** 15px, DMSans Regular, 22 line-height
- **Label:** 14px, DMSans Bold, 1.5 letter-spacing
- **Caption:** 11px, DMSans Bold, 2 letter-spacing

---

## Testing Checklist

- [ ] Gender selection auto-advances
- [ ] Hero image appears on steps 2-6
- [ ] Hero image matches gender selection
- [ ] Unit toggles work (cm/ft, kg/lbs)
- [ ] Age validation (13-100)
- [ ] Weight validation (positive numbers)
- [ ] Loading state appears after weight
- [ ] Navigation flows correctly through all steps
- [ ] Zustand store persists data across steps
- [ ] Sign-up page receives all onboarding data
- [ ] Back button behavior (if implemented)

---

## Performance Notes

- Hero images loaded via Unsplash CDN (consider caching for production)
- Zustand store is lightweight (no persistence needed pre-signup)
- Auto-advance uses 300ms setTimeout (non-blocking)
- Loading state uses 2s setTimeout (simulated calculation)

---

## Accessibility Considerations

- All interactive elements have sufficient tap targets (44px minimum)
- Text contrast meets WCAG AA standards
- Screen reader labels needed for icon-only buttons
- Keyboard navigation support for inputs
- Error states should announce to screen readers
