import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import {
  LayoutGrid,
  PersonStanding,
  Dumbbell,
  Flame,
  CircleDot,
  Wind,
} from "lucide-react-native";

export type Category =
  | "All workouts"
  | "Lower body"
  | "Upper body"
  | "Full body"
  | "Core"
  | "Mobility";

const ICONS: Record<Category, React.ComponentType<any>> = {
  "All workouts": LayoutGrid,
  "Lower body": PersonStanding,
  "Upper body": Dumbbell,
  "Full body": Flame,
  Core: CircleDot,
  Mobility: Wind,
};

const LIME = "#D4F445";
const LIME_DIM = "rgba(212,244,69,0.10)";

const Chip = ({
  category,
  isActive,
  onPress,
}: {
  category: Category;
  isActive: boolean;
  onPress: () => void;
}) => {
  const Icon = ICONS[category];

  // ── native driver: transform only ──────────────────────────────────────────
  const pressScale = useRef(new Animated.Value(1)).current;

  // ── JS driver: background color only ───────────────────────────────────────
  const bgAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    // must stay useNativeDriver: false because it drives backgroundColor
    Animated.timing(bgAnim, {
      toValue: isActive ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const onPressIn = () =>
    Animated.spring(pressScale, {
      toValue: 0.91,
      useNativeDriver: true,
      friction: 5,
      tension: 120,
    }).start();

  const onPressOut = () =>
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [LIME_DIM, LIME],
  });

  const iconColor = isActive ? "#121400" : "#9AA0AE";
  const textColor = isActive ? "#121400" : "#FFFFFF";

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      {/* outer: native transform only */}
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        {/* inner: JS-driven backgroundColor only */}
        <Animated.View style={[s.chip, { backgroundColor: bgColor }]}>
          <Icon size={15} color={iconColor} strokeWidth={2.2} />
          <Text style={[s.label, { color: textColor }]}>{category}</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

type Props = {
  categories: Category[];
  active: Category;
  onChange: (cat: Category) => void;
};

export function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.row}
    >
      {categories.map((cat) => (
        <Chip
          key={cat}
          category={cat}
          isActive={cat === active}
          onPress={() => onChange(cat)}
        />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 20,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
});
