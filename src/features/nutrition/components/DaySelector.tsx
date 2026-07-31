import { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  Easing,
  View,
} from "react-native";
import { T } from "@/src/theme";
import { PressableScale } from "./PressableScale";

type Day = { label: string; num: number; hasLog?: boolean; date: string };

type Props = {
  days: Day[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

type ItemLayout = { x: number; width: number };

export function DaySelector({ days, activeIndex, onSelect }: Props) {
  const [layouts, setLayouts] = useState<Record<number, ItemLayout>>({});
  // Measured explicitly instead of using height:"100%" on the indicator.
  // The indicator is absolutely positioned, so it doesn't contribute to
  // `wrap`'s auto size — its height depends entirely on `row`, the only
  // in-flow sibling. Under Fabric that percentage can resolve to 0 before
  // (or without ever) picking up row's real height, which silently makes
  // the pill invisible — the animation was firing the whole time, there
  // was just a zero-height bar to show for it.
  const [rowHeight, setRowHeight] = useState(0);

  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const indicatorScale = useRef(new Animated.Value(1)).current;
  // Keyed by date, created lazily — NOT a fixed-length array. If DaySelector
  // first mounts before `weekly` has loaded (days = []), an array sized off
  // that first render would stay frozen at length 0 forever, leaving every
  // numberScales[i] undefined once real days arrive — exactly what threw
  // "Cannot read property 'getValue' of undefined" from the Animated.Text
  // transform below.
  const numberScalesRef = useRef<Map<string, Animated.Value>>(new Map());
  const getNumberScale = (dateKey: string) => {
    let v = numberScalesRef.current.get(dateKey);
    if (!v) {
      v = new Animated.Value(1);
      numberScalesRef.current.set(dateKey, v);
    }
    return v;
  };
  const hasMounted = useRef(false);

  const target = layouts[activeIndex];
  const ready = !!target && rowHeight > 0;

  useEffect(() => {
    if (!target) return;

    if (!hasMounted.current) {
      // snap into place on first measure, no glide from x=0
      indicatorX.setValue(target.x);
      indicatorWidth.setValue(target.width);
      hasMounted.current = true;
      return;
    }

    // translateX, scale, and width all live on the same indicator's style
    // array, and width can't ride the native driver — so none of the three
    // can, since RN refuses to split one animated node into partly-native,
    // partly-JS.
    Animated.parallel([
      Animated.timing(indicatorX, {
        toValue: target.x,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(indicatorWidth, {
        toValue: target.width,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, target?.x, target?.width]);

  const pulse = (dateKey: string) => {
    const scale = getNumberScale(dateKey);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scale, { toValue: 1, ...T.motion.settle }),
    ]).start();

    Animated.sequence([
      Animated.timing(indicatorScale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: false,
      }),
      Animated.spring(indicatorScale, {
        toValue: 1,
        ...T.motion.settle,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleItemLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) =>
      prev[index]?.x === x && prev[index]?.width === width
        ? prev
        : { ...prev, [index]: { x, width } },
    );
  };

  const handleRowLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    setRowHeight((prev) => (prev === height ? prev : height));
  };

  const handleSelect = (index: number, dateKey: string) => {
    onSelect(index);
    pulse(dateKey);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.wrap}>
        {ready && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                height: rowHeight,
                width: indicatorWidth,
                transform: [
                  { translateX: indicatorX },
                  { scale: indicatorScale },
                ],
              },
            ]}
          />
        )}

        <View style={styles.row} onLayout={handleRowLayout}>
          {days.map((d, i) => {
            const active = i === activeIndex;
            return (
              <View key={d.date} onLayout={handleItemLayout(i)}>
                <PressableScale
                  onPress={() => handleSelect(i, d.date)}
                  scaleTo={0.94}
                  style={styles.pressableReset}
                >
                  <View style={styles.day}>
                    <Text style={[styles.dname, active && styles.dnameActive]}>
                      {d.label}
                    </Text>
                    <Animated.Text
                      style={[
                        styles.dnum,
                        active && styles.dnumActive,
                        { transform: [{ scale: getNumberScale(d.date) }] },
                      ]}
                    >
                      {d.num}
                    </Animated.Text>
                    {d.hasLog && !active && <View style={styles.logDot} />}
                  </View>
                </PressableScale>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingVertical: 4 },
  wrap: { position: "relative" },
  row: { flexDirection: "row", gap: 8 },
  pressableReset: { borderRadius: 15 },
  indicator: {
    position: "absolute",
    top: 0,
    borderRadius: 15,
    backgroundColor: T.accent,
    ...T.shadow.lifted,
  },
  day: {
    minWidth: 46,
    alignItems: "center",
    paddingVertical: 9,
    paddingBottom: 10,
  },
  dname: {
    fontFamily: T.bodyBold,
    fontSize: 9.5,
    color: T.muted,
    letterSpacing: 0.5,
  },
  dnameActive: { color: T.onImage },
  dnum: { fontFamily: T.display, fontSize: 16, color: T.white, marginTop: 3 },
  dnumActive: { color: T.onImage },
  logDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.accent,
    marginTop: 4,
  },
});
