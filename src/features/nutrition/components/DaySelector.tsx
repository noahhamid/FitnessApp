import { ScrollView, StyleSheet, Text, View } from "react-native";
import { T } from "../theme";
import { PressableScale } from "./PressableScale";

type Day = { label: string; num: number; hasLog?: boolean };

type Props = {
  days: Day[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function DaySelector({ days, activeIndex, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {days.map((d, i) => {
        const active = i === activeIndex;
        return (
          <PressableScale
            key={`${d.label}-${d.num}`}
            onPress={() => onSelect(i)}
            scaleTo={0.94}
            style={styles.pressableReset}
          >
            <View style={[styles.day, active && styles.dayActive]}>
              <Text style={[styles.dname, active && styles.dnameActive]}>
                {d.label}
              </Text>
              <Text style={[styles.dnum, active && styles.dnumActive]}>
                {d.num}
              </Text>
              {d.hasLog && !active && <View style={styles.logDot} />}
            </View>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  pressableReset: { borderRadius: 15 },
  day: {
    minWidth: 46,
    alignItems: "center",
    paddingVertical: 9,
    paddingBottom: 10,
    borderRadius: 15,
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
  },
  dayActive: {
    backgroundColor: T.accent,
    borderColor: T.accent,
    shadowColor: T.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  dname: {
    fontFamily: T.bodyBold,
    fontSize: 9.5,
    color: T.muted,
    letterSpacing: 0.5,
  },
  dnameActive: { color: T.bg },
  dnum: { fontFamily: T.display, fontSize: 16, color: T.white, marginTop: 3 },
  dnumActive: { color: T.bg },
  logDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.accent,
    marginTop: 4,
  },
});
