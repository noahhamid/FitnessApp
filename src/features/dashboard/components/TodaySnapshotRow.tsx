import { ComponentType, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Flame, Dumbbell, GlassWater, LucideProps } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "./GlassSurface";

type Snapshot = {
  icon: ComponentType<LucideProps>;
  value: string;
  label: string;
};

export const SNAPSHOT_ICONS = {
  calories: Flame,
  workout: Dumbbell,
  water: GlassWater,
};

// splits "482" -> ["482", ""], "6/8" -> ["6", "/8"], "Done" -> [null, "Done"]
function splitLeadingNumber(value: string): [number | null, string] {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return [null, value];
  return [parseInt(match[1], 10), match[2]];
}

/** Counts up to `target` and reports the in-progress integer via onChange. */
function useCountUp(target: number | null, delay: number) {
  const [display, setDisplay] = useState(target === null ? 0 : 0);
  useEffect(() => {
    if (target === null) return;
    const anim = new Animated.Value(0);
    const id = anim.addListener(({ value }) => setDisplay(Math.round(value)));
    const run = Animated.timing(anim, {
      toValue: target,
      duration: 650,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // driving a JS listener, not a native prop
    });
    run.start();
    return () => {
      anim.removeListener(id);
      run.stop();
    };
  }, [target, delay]);
  return display;
}

function AnimatedValue({
  value,
  delay,
  valueStyle,
}: {
  value: string;
  delay: number;
  valueStyle: ReturnType<typeof makeStyles>["value"];
}) {
  const [num, suffix] = useMemo(() => splitLeadingNumber(value), [value]);
  const count = useCountUp(num, delay);
  if (num === null) {
    return <Text style={valueStyle}>{value}</Text>;
  }
  return (
    <Text style={valueStyle}>
      {count}
      {suffix}
    </Text>
  );
}

/** Each icon gets one gesture that matches what it represents —
 * not decoration, a tiny piece of characterization. */
function IconMotion({
  Icon,
  color,
  delay,
}: {
  Icon: ComponentType<LucideProps>;
  color: string;
  delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const flicker = useRef(new Animated.Value(0)).current;

  const isFlame = Icon === SNAPSHOT_ICONS.calories;
  const isDumbbell = Icon === SNAPSHOT_ICONS.workout;
  const isWater = Icon === SNAPSHOT_ICONS.water;

  useEffect(() => {
    const entrance = Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.back(1.6)),
      useNativeDriver: true,
    });
    entrance.start();

    let loop: Animated.CompositeAnimation | undefined;
    if (isFlame) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(flicker, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(flicker, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
    }

    return () => {
      entrance.stop();
      loop?.stop();
    };
  }, [delay]);

  let transform: any[] = [{ scale: anim }];

  if (isDumbbell) {
    const rotate = anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["-22deg", "0deg"],
    });
    transform = [{ scale: anim }, { rotate }];
  } else if (isWater) {
    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [-6, 0],
    });
    transform = [{ scale: anim }, { translateY }];
  } else if (isFlame) {
    const flickerRotate = flicker.interpolate({
      inputRange: [0, 1],
      outputRange: ["-4deg", "4deg"],
    });
    const flickerScale = flicker.interpolate({
      inputRange: [0, 1],
      outputRange: [0.96, 1.05],
    });
    transform = [
      { scale: Animated.multiply(anim, flickerScale) },
      { rotate: flickerRotate },
    ];
  }

  return (
    <Animated.View style={{ opacity: anim, transform }}>
      <Icon size={15} color={color} strokeWidth={2} />
    </Animated.View>
  );
}

export function TodaySnapshotRow({ items }: { items: Snapshot[] }) {
  const { T, styles } = useThemedStyles(makeStyles);

  return (
    <View style={styles.row}>
      {items.map((item, i) => {
        const delay = i * 90;
        return (
          <GlassSurface key={i} style={styles.card}>
            <View style={styles.iconBadge}>
              <IconMotion Icon={item.icon} color={T.accent} delay={delay} />
            </View>
            <AnimatedValue
              value={item.value}
              delay={delay + 120}
              valueStyle={styles.value}
            />
            <Text style={styles.label}>{item.label.toUpperCase()}</Text>
          </GlassSurface>
        );
      })}
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    row: { flexDirection: "row", gap: 9 },
    card: {
      flex: 1,
      borderRadius: T.radius.md,
      paddingVertical: 16,
      alignItems: "center",
      gap: 8,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: T.radius.sm,
      backgroundColor: T.ringGlass,
      borderWidth: 0.5,
      borderColor: T.ringBorder,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    value: {
      fontFamily: T.displaySemi,
      fontSize: 16,
      color: T.white,
      letterSpacing: -0.2,
      fontVariant: ["tabular-nums"],
      zIndex: 1,
    },
    label: {
      fontFamily: T.bodySemi,
      fontSize: 8.5,
      letterSpacing: 0.6,
      color: T.muted,
      zIndex: 1,
    },
  });
}
