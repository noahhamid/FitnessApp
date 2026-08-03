import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme, type ThemeMode } from "./ThemeContext";

// TEMPORARY — Stage 2B test point. Profile itself is not theme-reactive yet;
// this block only exercises the provider (mode + resolved palette swatches).
// Remove or replace when Stage 3 migrates screens onto useTheme().

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
  { mode: "system", label: "System" },
];

export function ThemeModeTestToggle() {
  const { mode, setMode, resolved, theme } = useTheme();

  return (
    <View style={s.wrap}>
      <Text style={s.eyebrow}>APPEARANCE (TEMP)</Text>
      <Text style={s.meta}>
        Mode: {mode} · Resolved: {resolved}
      </Text>

      <View style={s.row}>
        {OPTIONS.map((opt) => {
          const active = mode === opt.mode;
          return (
            <Pressable
              key={opt.mode}
              onPress={() => setMode(opt.mode)}
              style={[s.chip, active && s.chipActive]}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={s.swatchRow}>
        <View style={[s.swatch, { backgroundColor: theme.bg }]} />
        <View style={[s.swatch, { backgroundColor: theme.glass }]} />
        <View style={[s.swatch, { backgroundColor: theme.accent }]} />
        <Text style={s.swatchLabel}>
          bg / glass / accent from resolved theme
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF0D",
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  eyebrow: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.2,
    color: "#A0A0A0",
  },
  meta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#FFFFFF",
  },
  row: { flexDirection: "row", gap: 8 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#262626",
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: "#FFC700",
  },
  chipText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: "#A0A0A0",
  },
  chipTextActive: {
    color: "#121212",
  },
  swatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  swatchLabel: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: "#A0A0A0",
  },
});
