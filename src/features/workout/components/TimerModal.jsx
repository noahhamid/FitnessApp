import { useState, useEffect, useRef } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS } from "@/src/theme";

const C = COLORS;

export default function TimerModal({ visible, onClose, defaultSeconds = 90 }) {
  const [total, setTotal] = useState(defaultSeconds);
  const [remain, setRemain] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setRemain(total);
      setRunning(false);
    }
    return () => clearInterval(intervalRef.current);
  }, [visible]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemain((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const pct = remain / total;
  const SIZE = 200;
  const R = 88;
  const circ = 2 * Math.PI * R;
  const dash = circ * (1 - pct);
  const mins = String(Math.floor(remain / 60)).padStart(2, "0");
  const secs = String(remain % 60).padStart(2, "0");
  const PRESETS = [60, 90, 120, 180];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.timerSheet}>
          <View style={s.sheetHandle} />
          <Text style={s.timerTitle}>REST TIMER</Text>

          <View style={{ alignItems: "center", marginVertical: 24 }}>
            <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
              <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={C.border} strokeWidth={10} />
              <Circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={remain === 0 ? C.red : C.accent}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={`${circ}`}
                strokeDashoffset={`${dash}`}
              />
            </Svg>
            <View style={[s.timerCenter, { width: SIZE, height: SIZE }]}>
              <Text style={s.timerValue}>
                {mins}:{secs}
              </Text>
              <Text style={s.timerSub}>{remain === 0 ? "DONE!" : "REMAINING"}</Text>
            </View>
          </View>

          <View style={s.presetRow}>
            {PRESETS.map((sec) => (
              <TouchableOpacity
                key={sec}
                onPress={() => {
                  setTotal(sec);
                  setRemain(sec);
                  setRunning(false);
                }}
                style={[s.presetBtn, total === sec && s.presetBtnActive]}
              >
                <Text style={[s.presetText, total === sec && s.presetTextActive]}>
                  {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.timerControls}>
            <TouchableOpacity
              onPress={() => {
                setRemain(total);
                setRunning(false);
              }}
              style={s.timerBtnSecondary}
            >
              <Text style={s.timerBtnSecondaryText}>↺  RESET</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRunning((r) => !r)}
              style={[s.timerBtnPrimary, running && s.timerBtnPause]}
            >
              <Text style={s.timerBtnPrimaryText}>{running ? "⏸  PAUSE" : "▶  START"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={s.timerClose}>
            <Text style={s.timerCloseText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  timerSheet: {
    backgroundColor: C.bg2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 12,
  },
  timerTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: C.text,
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 12,
  },
  timerCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  timerValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 52,
    color: C.text,
  },
  timerSub: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: C.muted,
    marginTop: 4,
  },
  presetRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 24,
    gap: 10,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  presetBtnActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  presetText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: C.muted,
  },
  presetTextActive: {
    color: C.bg,
  },
  timerControls: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  timerBtnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  timerBtnSecondaryText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: C.muted,
  },
  timerBtnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.accent,
    alignItems: "center",
  },
  timerBtnPause: {
    backgroundColor: C.orange,
  },
  timerBtnPrimaryText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 15,
    color: C.bg,
    letterSpacing: 1,
  },
  timerClose: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  timerCloseText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: C.text,
  },
});