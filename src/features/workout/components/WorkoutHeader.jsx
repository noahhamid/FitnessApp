import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { COLORS } from "@/src/theme";

const C = COLORS;

export default function WorkoutHeader({ startTime, name, onFinish }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const sec = elapsed % 60;
  const fmt =
    h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

  return (
    <View style={s.activeHeader}>
      <View>
        <Text style={s.activeHeaderTitle}>{name || "WORKOUT"}</Text>
        <Text style={s.activeHeaderTime}>⏱  {fmt}</Text>
      </View>
      <TouchableOpacity onPress={onFinish} style={s.finishBtn}>
        <Text style={s.finishBtnText}>FINISH</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  activeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 28,
    paddingBottom: 14,
    backgroundColor: C.bg2,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  activeHeaderTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 26,
    color: C.text,
  },
  activeHeaderTime: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: C.accent,
    marginTop: 1,
  },
  finishBtn: {
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  finishBtnText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 16,
    color: C.bg,
    letterSpacing: 1,
  },
});