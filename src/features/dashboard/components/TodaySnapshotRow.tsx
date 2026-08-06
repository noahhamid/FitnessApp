import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "./GlassSurface";

export type SnapshotKind = "calories" | "workout" | "water";

type Snapshot = {
  /** Which local asset to show — kept as `icon` so Dashboard call sites stay stable. */
  icon: SnapshotKind;
  value: string;
  label: string;
};

/** Stable keys Dashboard already passes as `SNAPSHOT_ICONS.calories` etc. */
export const SNAPSHOT_ICONS = {
  calories: "calories",
  workout: "workout",
  water: "water",
} as const satisfies Record<SnapshotKind, SnapshotKind>;

const ASSET_SOURCE = {
  calories: require("../../../../assets/images/kcal.png"),
  workout: require("../../../../assets/images/workout.png"),
  water: require("../../../../assets/images/water.png"),
} as const;

const ASSET_URI: Record<SnapshotKind, string> = {
  calories: Image.resolveAssetSource(ASSET_SOURCE.calories).uri,
  workout: Image.resolveAssetSource(ASSET_SOURCE.workout).uri,
  water: Image.resolveAssetSource(ASSET_SOURCE.water).uri,
};

const ICON_SIZE = 36;

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

/** Each asset gets one gesture that matches what it represents. */
function AssetMotion({
  kind,
  delay,
  imageStyle,
}: {
  kind: SnapshotKind;
  delay: number;
  imageStyle: ReturnType<typeof makeStyles>["asset"];
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const flicker = useRef(new Animated.Value(0)).current;

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
    if (kind === "calories") {
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
  }, [delay, kind]);

  let transform: any[] = [{ scale: anim }];

  if (kind === "workout") {
    const rotate = anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["-22deg", "0deg"],
    });
    transform = [{ scale: anim }, { rotate }];
  } else if (kind === "water") {
    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [-6, 0],
    });
    transform = [{ scale: anim }, { translateY }];
  } else if (kind === "calories") {
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
      <Image
        source={{ uri: ASSET_URI[kind] }}
        style={imageStyle}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    </Animated.View>
  );
}

export function TodaySnapshotRow({ items }: { items: Snapshot[] }) {
  const { styles } = useThemedStyles(makeStyles);

  return (
    <View style={styles.row}>
      {items.map((item, i) => {
        const delay = i * 90;
        return (
          <GlassSurface key={i} style={styles.card}>
            <AssetMotion
              kind={item.icon}
              delay={delay}
              imageStyle={styles.asset}
            />
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
    // Opaque full-bleed assets — rounded square, no tinted well behind.
    asset: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      borderRadius: T.radius.sm,
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
