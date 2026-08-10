import { GoalTile } from "@/src/ui/components/GoalTile";
import { C, FONTS } from "@/src/ui/tokens";
import { useEffect, useRef } from "react";
import {
  Animated,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type ChipOption = {
  id: string;
  label: string;
  desc?: string;
  /** Subject on a black backdrop, dissolved into the card like the goals grid. */
  image?: ImageSourcePropType;
  /** Give this option a row of its own, e.g. "Full Body" among focus areas. */
  fullWidth?: boolean;
  /**
   * Vertical crop bias for background tiles, as % of the card height.
   * Positive lowers the photo; negative lifts it.
   */
  imageOffsetY?: number;
};

type Props = {
  options: ChipOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** Allow more than one chip selected at once. Defaults to single-select. */
  multiple?: boolean;
  /** Selecting this id clears every other selection, and vice versa
   * (e.g. "none" among body issues / injuries). */
  exclusiveId?: string;
  /** Selecting this id also selects every other option (e.g. "full_body"). */
  selectAllId?: string;
  columns?: 1 | 2;
  /** "cover" crops the artwork to fill each card, i.e. zooms in. */
  imageFit?: "contain" | "cover";
  /**
   * "inside" = cutout chip (default). "background" = full-bleed shaded photo
   * with a large centered label (focus areas).
   */
  imagePlacement?: "inside" | "background";
  style?: StyleProp<ViewStyle>;
};

/** Text-only fallback card, matched to GoalTile's surface and label treatment. */
function PlainChip({
  option,
  active,
  onPress,
  role,
}: {
  option: ChipOption;
  active: boolean;
  onPress: () => void;
  role: "radio" | "checkbox";
}) {
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: active ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  }, [active, anim]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityState={{ selected: active, checked: active }}
      accessibilityLabel={`${option.label}${option.desc ? `. ${option.desc}` : ""}`}
      style={({ pressed }) => [s.plainSlot, s.tile, pressed && s.plainPressed]}
    >
      <Animated.View
        style={[
          s.plainCard,
          active && s.plainCardActive,
          { transform: [{ scale }] },
        ]}
      >
        <Text
          style={[s.plainLabel, active && s.plainLabelActive]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          allowFontScaling={false}
        >
          {option.label}
        </Text>
        {option.desc ? (
          <Text
            style={[s.plainDesc, active && s.plainDescActive]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            allowFontScaling={false}
          >
            {option.desc}
          </Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

/**
 * Onboarding multi/single-select picker. Options with artwork render as
 * GoalTile cards — the same cut-out-over-card treatment as the gender and
 * goals steps. Text-only options (e.g. "4 Days") get a matching plain card.
 */
export function ChipSelect({
  options,
  selected,
  onChange,
  multiple = false,
  exclusiveId,
  selectAllId,
  columns = 2,
  imageFit = "contain",
  imagePlacement = "inside",
  style,
}: Props) {
  function toggle(id: string) {
    if (!multiple) {
      onChange([id]);
      return;
    }

    if (selectAllId && id === selectAllId) {
      const partIds = options
        .filter((o) => o.id !== selectAllId)
        .map((o) => o.id);
      const allOn = partIds.every((p) => selected.includes(p));
      onChange(allOn ? [] : [...partIds, selectAllId]);
      return;
    }

    if (exclusiveId && id === exclusiveId) {
      onChange(selected.includes(id) ? [] : [id]);
      return;
    }

    let next = exclusiveId
      ? selected.filter((s) => s !== exclusiveId)
      : [...selected];

    if (next.includes(id)) {
      next = next.filter((s) => s !== id);
    } else {
      next = [...next, id];
    }

    if (selectAllId) {
      const partIds = options
        .filter((o) => o.id !== selectAllId)
        .map((o) => o.id);
      const allPartsOn = partIds.every((p) => next.includes(p));
      next = next.filter((s) => s !== selectAllId);
      if (allPartsOn) next = [...next, selectAllId];
    }

    onChange(next);
  }

  const role = multiple ? "checkbox" : "radio";

  const rows: ChipOption[][] = [];
  for (const opt of options) {
    const last = rows[rows.length - 1];
    const fits = last && !opt.fullWidth && !last[0].fullWidth && last.length < columns;
    if (fits) last.push(opt);
    else rows.push([opt]);
  }

  return (
    <View
      style={[s.grid, style]}
      accessibilityRole={multiple ? undefined : "radiogroup"}
    >
      {rows.map((row, ri) => (
        <View key={ri} style={s.row}>
          {row.map((opt) => {
            const active = selected.includes(opt.id);

            return opt.image ? (
              <GoalTile
                key={opt.id}
                image={opt.image}
                title={opt.label}
                desc={opt.desc}
                isSelected={active}
                onPress={() => toggle(opt.id)}
                role={role}
                imagePlacement={imagePlacement}
                imageFit={imageFit}
                imageOffsetY={opt.imageOffsetY}
                style={s.tile}
              />
            ) : (
              <PlainChip
                key={opt.id}
                option={opt}
                active={active}
                onPress={() => toggle(opt.id)}
                role={role}
              />
            );
          })}
          {/* Keeps a lone trailing tile the same width as a full row. */}
          {row.length < columns && !row[0].fullWidth ? (
            <View style={s.tile} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  // Rows share the band between the header and the continue button, matching
  // the goals grid.
  grid: {
    flex: 1,
    minHeight: 0,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  tile: {
    flex: 1,
  },
  // GoalTile owns an 8pt slot padding; mirror it so both card kinds align.
  plainSlot: {
    padding: 8,
  },
  plainPressed: {
    opacity: 0.94,
  },
  plainCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: C.bg3,
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },
  plainCardActive: {
    backgroundColor: C.accent,
  },
  plainLabel: {
    fontFamily: FONTS.blackItalic,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 2,
    color: C.accent,
  },
  plainLabelActive: {
    color: "#FFFFFF",
  },
  plainDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255, 255, 255, 0.65)",
  },
  plainDescActive: {
    color: "rgba(255, 255, 255, 0.9)",
  },
});
