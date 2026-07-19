import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";
import {
  X,
  Pause,
  Play,
  SkipForward,
  Check,
  Minus,
  Plus,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { WorkoutPlan } from "../data/workouts";

const T = {
  accent: "#FFC700",
  accentSoft: "#FFE066",
  accentText: "#1A1300",

  bg: "#09090C",
  panel: "#111318",
  panelBorder: "rgba(255,255,255,0.07)",
  glass: "rgba(255,255,255,0.05)",
  glassBorder: "rgba(255,255,255,0.10)",

  white: "#FFFFFF",
  muted: "#9AA0AE",

  display: "SpaceGrotesk_700Bold",
  displayMed: "SpaceGrotesk_500Medium",
  body: "Inter_400Regular",
  bodyMed: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};

type Phase = "exercise" | "rest" | "done";

export interface SetLog {
  exerciseName: string;
  reps?: number;
  weight?: number;
  durationSec?: number;
  completed: boolean;
}

type Props = {
  plan: WorkoutPlan;
  onClose: () => void;
  onFinish: (logs: SetLog[]) => void;
  lastPerformance?: Record<string, { weight?: number; reps?: number }>;
};

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const haptic = (style: Haptics.ImpactFeedbackStyle) => {
  Haptics.impactAsync(style).catch(() => {});
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CountdownRing = ({
  left,
  total,
  size = 128,
}: {
  left: number;
  total: number;
  size?: number;
}) => {
  const sw = 8;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const prog = useRef(new Animated.Value(total > 0 ? left / total : 0)).current;

  useEffect(() => {
    Animated.timing(prog, {
      toValue: total > 0 ? left / total : 0,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [left]);

  const offset = prog.interpolate({
    inputRange: [0, 1],
    outputRange: [circ, 0],
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <SvgGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={T.accent} />
            <Stop offset="100%" stopColor={T.accentSoft} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={sw}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={sw}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={s.ringTime}>{fmt(left)}</Text>
    </View>
  );
};

const DotsStrip = ({ total, current }: { total: number; current: number }) => (
  <View style={s.dotsRow}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          s.dot,
          i < current ? s.dotDone : i === current ? s.dotActive : s.dotPending,
        ]}
      />
    ))}
  </View>
);

// ─── weight/reps stepper — compact inline number adjuster ───────────────────
const Stepper = ({
  label,
  value,
  onChange,
  step = 1,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  unit?: string;
}) => (
  <View style={s.stepperWrap}>
    <Text style={s.stepperLabel}>{label}</Text>
    <View style={s.stepperRow}>
      <TouchableOpacity
        style={s.stepperBtn}
        onPress={() => onChange(Math.max(0, value - step))}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Minus size={14} color={T.white} strokeWidth={2.4} />
      </TouchableOpacity>
      <View style={s.stepperValueWrap}>
        <TextInput
          style={s.stepperInput}
          value={String(value)}
          keyboardType="numeric"
          onChangeText={(t) => {
            const n = parseInt(t.replace(/[^0-9]/g, ""), 10);
            onChange(isNaN(n) ? 0 : n);
          }}
          selectTextOnFocus
        />
        {unit && <Text style={s.stepperUnit}>{unit}</Text>}
      </View>
      <TouchableOpacity
        style={s.stepperBtn}
        onPress={() => onChange(value + step)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Plus size={14} color={T.white} strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  </View>
);

export function ActiveWorkoutScreen({
  plan,
  onClose,
  onFinish,
  lastPerformance,
}: Props) {
  const insets = useSafeAreaInsets();
  const exs = plan.exercises;

  const [exIdx, setExIdx] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [phase, setPhase] = useState<Phase>("exercise");
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [secsLeft, setSecsLeft] = useState<number | null>(null);

  const ex = exs[exIdx];
  const nextEx = exIdx < exs.length - 1 ? exs[exIdx + 1] : null;

  const totalSets = exs.reduce((a, e) => a + e.sets, 0);
  const doneSets =
    exs.slice(0, exIdx).reduce((a, e) => a + e.sets, 0) + (setNum - 1);

  // ── real performance tracking ──────────────────────────────────────────
  const logsRef = useRef<SetLog[]>([]);
  const lastForCurrent = lastPerformance?.[ex.name];
  const [currentReps, setCurrentReps] = useState(
    ex.reps ?? lastForCurrent?.reps ?? 8,
  );
  const [currentWeight, setCurrentWeight] = useState(
    lastForCurrent?.weight ?? 0,
  );

  // reset the input fields whenever the exercise changes, seeded from
  // target reps + last time this exercise was performed (0 if never)
  useEffect(() => {
    const last = lastPerformance?.[ex.name];
    setCurrentReps(ex.reps ?? last?.reps ?? 8);
    setCurrentWeight(last?.weight ?? 0);
  }, [exIdx]);

  // ── animated values ────────────────────────────────────────────────────────
  const panelY = useRef(new Animated.Value(60)).current;
  const imgScale = useRef(new Animated.Value(1)).current;
  const exFade = useRef(new Animated.Value(1)).current;
  const exSlide = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const pauseScale = useRef(new Animated.Value(1)).current;
  const setNumScale = useRef(new Animated.Value(1)).current;
  const restContentOpacity = useRef(new Animated.Value(0)).current;
  const exContentOpacity = useRef(new Animated.Value(1)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const panelExpand = useRef(new Animated.Value(0)).current;
  const doneOpacity = useRef(new Animated.Value(0)).current;
  const doneScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.spring(panelY, {
      toValue: 0,
      friction: 9,
      tension: 55,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: doneSets / totalSets,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [doneSets]);

  useEffect(() => {
    if (paused || phase === "done") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [paused, phase]);

  useEffect(() => {
    if (phase === "rest") setSecsLeft(ex.restSec);
    else if (phase === "exercise" && ex.type === "duration")
      setSecsLeft(ex.durationSec ?? 0);
    else setSecsLeft(null);
  }, [phase, exIdx, setNum]);

  useEffect(() => {
    if (paused || secsLeft === null) return;
    if (secsLeft <= 0) {
      advance();
      return;
    }
    const t = setTimeout(() => setSecsLeft((n) => (n ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secsLeft, paused]);

  useEffect(() => {
    const toRest = phase === "rest";

    Animated.timing(panelExpand, {
      toValue: toRest ? 1 : 0,
      duration: 420,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();

    Animated.parallel([
      Animated.timing(restContentOpacity, {
        toValue: toRest ? 1 : 0,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(exContentOpacity, {
        toValue: toRest ? 0 : 1,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, [phase]);

  useEffect(() => {
    exFade.setValue(0);
    exSlide.setValue(14);
    imgScale.setValue(1.05);
    Animated.parallel([
      Animated.timing(exFade, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(exSlide, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(imgScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [exIdx]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(setNumScale, {
        toValue: 1.28,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(setNumScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [setNum]);

  useEffect(() => {
    if (phase !== "done") return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    Animated.parallel([
      Animated.timing(doneOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(doneScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
    const t = setTimeout(() => onFinish(logsRef.current), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  const logCurrentSet = (completed: boolean) => {
    logsRef.current.push({
      exerciseName: ex.name,
      reps: ex.type === "reps" ? currentReps : undefined,
      weight: ex.type === "reps" ? currentWeight : undefined,
      durationSec: ex.type === "duration" ? (ex.durationSec ?? 0) : undefined,
      completed,
    });
  };

  const advance = () => {
    if (phase === "exercise") {
      logCurrentSet(true);
      const lastSet = setNum >= ex.sets;
      const lastEx = exIdx >= exs.length - 1;
      if (lastSet && lastEx) {
        setPhase("done");
        return;
      }
      setPhase("rest");
    } else {
      if (setNum >= ex.sets) {
        setExIdx((i) => i + 1);
        setSetNum(1);
      } else setSetNum((n) => n + 1);
      setPhase("exercise");
    }
  };

  const onCompletePress = () => {
    haptic(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.93,
        duration: 85,
        useNativeDriver: true,
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(advance);
  };

  const onHoldTogglePress = () => {
    haptic(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => setPaused((p) => !p));
  };

  const onPausePress = () => {
    haptic(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(pauseScale, {
        toValue: 0.88,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.spring(pauseScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => setPaused((p) => !p));
  };

  const onSkipRest = () => {
    haptic(Haptics.ImpactFeedbackStyle.Light);
    advance();
  };

  const panelHeight = panelExpand.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 440], // slightly taller now to fit the steppers
  });
  const barPct = barWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={s.screen}>
      <Animated.Image
        source={{ uri: ex.imageUrl }}
        style={[s.bgImage, { transform: [{ scale: imgScale }] }]}
        resizeMode="cover"
      />

      <LinearGradient
        colors={[
          "rgba(8,9,11,0.70)",
          "rgba(8,9,11,0.12)",
          "rgba(8,9,11,0.00)",
          "rgba(8,9,11,0.62)",
        ]}
        locations={[0, 0.26, 0.58, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View
        style={[s.topContent, { paddingTop: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <View style={s.topBar}>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={onClose}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close workout"
          >
            <X size={18} color={T.white} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={s.titleBlock}>
            <Text style={s.topTitle} numberOfLines={1}>
              {plan.title}
            </Text>
            <View style={s.elapsedPill}>
              <Text style={s.elapsedText}>{fmt(elapsed)}</Text>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: pauseScale }] }}>
            <TouchableOpacity
              style={s.iconBtn}
              onPress={onPausePress}
              activeOpacity={0.85}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={paused ? "Resume workout" : "Pause workout"}
            >
              {paused ? (
                <Play size={16} color={T.white} strokeWidth={2.2} />
              ) : (
                <Pause size={16} color={T.white} strokeWidth={2.2} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: barPct }]} />
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            s.heroWrap,
            { opacity: exFade, transform: [{ translateY: exSlide }] },
          ]}
        >
          <Text style={s.heroTitle} numberOfLines={2}>
            {ex.name}
          </Text>
          <Text style={s.heroSub} numberOfLines={1}>
            {ex.sets} sets ·{" "}
            {ex.type === "reps" ? `${ex.reps} reps` : `${ex.durationSec}s hold`}
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        style={[s.panelOuter, { transform: [{ translateY: panelY }] }]}
      >
        <Animated.View
          style={[
            s.panel,
            { height: panelHeight, paddingBottom: insets.bottom + 18 },
          ]}
        >
          <DotsStrip total={exs.length} current={exIdx} />

          <View style={s.panelBody}>
            <Animated.View
              style={[s.contentLayer, { opacity: exContentOpacity }]}
              pointerEvents={phase === "exercise" ? "auto" : "none"}
            >
              <Animated.View
                style={{
                  opacity: exFade,
                  transform: [{ translateY: exSlide }],
                }}
              >
                <Text style={s.cueLabel}>Form cue</Text>
                <Text style={s.exInstr} numberOfLines={2}>
                  {ex.instructions}
                </Text>
              </Animated.View>

              <View style={s.statRow}>
                <View style={s.statChip}>
                  <Text style={s.statLabel}>Set</Text>
                  <Animated.Text
                    style={[
                      s.statValue,
                      { transform: [{ scale: setNumScale }] },
                    ]}
                  >
                    {setNum}
                    <Text style={s.statDim}>/{ex.sets}</Text>
                  </Animated.Text>
                </View>

                <View style={s.centerDisplay}>
                  {ex.type === "duration" && (
                    <>
                      <Text style={s.bigNumber}>{fmt(secsLeft ?? 0)}</Text>
                      <Text style={s.bigLabel}>Hold</Text>
                    </>
                  )}
                </View>

                <View style={s.statChip}>
                  <Text style={s.statLabel}>Exercise</Text>
                  <Text style={s.statValue}>
                    {exIdx + 1}
                    <Text style={s.statDim}>/{exs.length}</Text>
                  </Text>
                </View>
              </View>

              {/* weight/reps steppers — only for rep-based exercises,
                  pre-filled from last time this exercise was logged */}
              {ex.type === "reps" && (
                <View style={s.stepperGrid}>
                  <Stepper
                    label="WEIGHT"
                    value={currentWeight}
                    onChange={setCurrentWeight}
                    step={2.5}
                    unit="kg"
                  />
                  <Stepper
                    label="REPS"
                    value={currentReps}
                    onChange={setCurrentReps}
                    step={1}
                  />
                </View>
              )}

              {ex.type === "reps" ? (
                <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                  <TouchableOpacity
                    style={s.cta}
                    onPress={onCompletePress}
                    activeOpacity={0.92}
                    accessibilityRole="button"
                    accessibilityLabel="Mark set complete"
                  >
                    <Check size={16} color={T.accentText} strokeWidth={3} />
                    <Text style={s.ctaText}>Done — next set</Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                  <TouchableOpacity
                    style={s.ctaOutline}
                    onPress={onHoldTogglePress}
                    activeOpacity={0.88}
                    accessibilityRole="button"
                  >
                    <Text style={s.ctaOutlineText}>
                      {paused ? "Resume" : "Pause hold"}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>

            <Animated.View
              style={[s.contentLayer, { opacity: restContentOpacity }]}
              pointerEvents={phase === "rest" ? "auto" : "none"}
            >
              <View style={s.restRow}>
                <View style={s.restLeft}>
                  <Text style={s.restEyebrow}>Rest</Text>
                  <CountdownRing
                    left={secsLeft ?? 0}
                    total={ex.restSec}
                    size={128}
                  />
                </View>

                <View style={s.restRight}>
                  {nextEx ? (
                    <View style={s.nextCard}>
                      <Text style={s.nextLabel}>Up next</Text>
                      <Image
                        source={{ uri: nextEx.imageUrl }}
                        style={s.nextThumb}
                        resizeMode="cover"
                      />
                      <Text style={s.nextName} numberOfLines={2}>
                        {nextEx.name}
                      </Text>
                      <Text style={s.nextMeta}>
                        {nextEx.sets} sets ·{" "}
                        {nextEx.type === "reps"
                          ? `${nextEx.reps} reps`
                          : `${nextEx.durationSec}s`}
                      </Text>
                    </View>
                  ) : (
                    <View style={s.lastExBlock}>
                      <Text style={s.nextLabel}>Last one</Text>
                      <Text style={s.nextName}>Finish strong 💪</Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={s.skipBtn}
                onPress={onSkipRest}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Skip rest"
              >
                <SkipForward size={13} color={T.muted} strokeWidth={2.4} />
                <Text style={s.skipText}>Skip rest</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View
        pointerEvents={phase === "done" ? "auto" : "none"}
        style={[s.doneOverlay, { opacity: doneOpacity }]}
      >
        <Animated.View
          style={[s.doneBadge, { transform: [{ scale: doneScale }] }]}
        >
          <Check size={30} color={T.accentText} strokeWidth={3} />
        </Animated.View>
        <Text style={s.doneTitle}>Workout complete</Text>
        <Text style={s.doneSub}>
          {fmt(elapsed)} elapsed · {totalSets} sets
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  bgImage: { ...StyleSheet.absoluteFillObject },

  topContent: { paddingHorizontal: 18, gap: 12 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { flex: 1, alignItems: "center", gap: 4 },
  topTitle: {
    color: T.white,
    fontFamily: T.bodySemi,
    fontSize: 13,
    letterSpacing: 0.1,
  },
  elapsedPill: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  elapsedText: {
    color: T.accent,
    fontFamily: T.display,
    fontSize: 12.5,
    letterSpacing: -0.2,
    fontVariant: ["tabular-nums"],
  },

  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: T.accent, borderRadius: 2 },

  heroWrap: { paddingRight: 40, marginTop: 2 },
  heroTitle: {
    color: T.white,
    fontFamily: T.display,
    fontSize: 27,
    letterSpacing: -0.6,
    lineHeight: 32,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroSub: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: T.bodyMed,
    fontSize: 13,
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  panelOuter: { position: "absolute", bottom: 0, left: 0, right: 0 },
  panel: {
    backgroundColor: T.panel,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: T.panelBorder,
    paddingHorizontal: 20,
    paddingTop: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.35,
    shadowRadius: 26,
    elevation: 20,
  },
  panelBody: { flex: 1 },

  dotsRow: { flexDirection: "row", gap: 4, marginBottom: 16 },
  dot: { height: 4, borderRadius: 2, flex: 1 },
  dotDone: { backgroundColor: T.accent, opacity: 0.4 },
  dotActive: { backgroundColor: T.accent },
  dotPending: { backgroundColor: "rgba(255,255,255,0.08)" },

  contentLayer: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 14,
  },

  cueLabel: {
    color: T.muted,
    fontFamily: T.bodySemi,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  exInstr: {
    color: T.muted,
    fontFamily: T.body,
    fontSize: 12.5,
    lineHeight: 18,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statChip: { alignItems: "center", minWidth: 68 },
  statLabel: {
    color: T.muted,
    fontFamily: T.bodySemi,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  statValue: {
    color: T.white,
    fontFamily: T.display,
    fontSize: 19,
    letterSpacing: -0.3,
    marginTop: 3,
    fontVariant: ["tabular-nums"],
  },
  statDim: { color: T.muted, fontFamily: T.bodySemi, fontSize: 13 },

  centerDisplay: { alignItems: "center" },
  bigNumber: {
    color: T.white,
    fontFamily: T.display,
    fontSize: 54,
    letterSpacing: -2.5,
    lineHeight: 58,
    fontVariant: ["tabular-nums"],
  },
  bigLabel: {
    color: T.muted,
    fontFamily: T.bodySemi,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: -2,
  },

  // steppers
  stepperGrid: { flexDirection: "row", gap: 12 },
  stepperWrap: { flex: 1 },
  stepperLabel: {
    color: T.muted,
    fontFamily: T.bodySemi,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValueWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 3,
  },
  stepperInput: {
    color: T.white,
    fontFamily: T.display,
    fontSize: 18,
    textAlign: "center",
    minWidth: 32,
    padding: 0,
  },
  stepperUnit: {
    color: T.muted,
    fontFamily: T.bodyMed,
    fontSize: 11,
  },

  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.accent,
    borderRadius: 999,
    paddingVertical: 15,
  },
  ctaText: {
    color: T.accentText,
    fontFamily: T.bodyBold,
    fontSize: 14.5,
    letterSpacing: 0.1,
  },

  ctaOutline: {
    borderWidth: 1.5,
    borderColor: T.glassBorder,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaOutlineText: {
    color: T.white,
    fontFamily: T.bodyBold,
    fontSize: 14,
    letterSpacing: 0.1,
  },

  restRow: { flexDirection: "row", gap: 16, alignItems: "center", flex: 1 },
  restLeft: { alignItems: "center", gap: 8 },
  restEyebrow: {
    color: T.accent,
    fontFamily: T.bodyBold,
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },

  ringTime: {
    color: T.white,
    fontFamily: T.display,
    fontSize: 28,
    letterSpacing: -1,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },

  restRight: { flex: 1 },
  nextCard: {
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 18,
    padding: 12,
    gap: 6,
  },
  nextLabel: {
    color: T.muted,
    fontFamily: T.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  nextThumb: {
    width: "100%",
    height: 66,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  nextName: {
    color: T.white,
    fontFamily: T.displayMed,
    fontSize: 14.5,
    lineHeight: 19,
  },
  nextMeta: { color: T.muted, fontFamily: T.bodyMed, fontSize: 11.5 },

  lastExBlock: { flex: 1, justifyContent: "center", gap: 6 },

  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 6,
  },
  skipText: { color: T.muted, fontFamily: T.bodySemi, fontSize: 12.5 },

  doneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,9,12,0.94)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    zIndex: 50,
  },
  doneBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: T.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  doneTitle: {
    color: T.white,
    fontFamily: T.display,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  doneSub: { color: T.muted, fontFamily: T.bodyMed, fontSize: 13 },
});
