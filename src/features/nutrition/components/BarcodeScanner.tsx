import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg1: "#111114",
  bg3: "#222228",
  lime: "#C8F135",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
};

// ─── Corner bracket SVG ───────────────────────────────────────────────────────
// Draws a single L-shaped corner bracket
function Corner({
  flip = false,
  flipY = false,
  color = T.lime,
  size = 18,
  stroke = 2.5,
}: {
  flip?: boolean;
  flipY?: boolean;
  color?: string;
  size?: number;
  stroke?: number;
}) {
  const scaleX = flip ? -1 : 1;
  const scaleY = flipY ? -1 : 1;
  return (
    <Svg
      width={size}
      height={size}
      style={{ transform: [{ scaleX }, { scaleY }] }}
    >
      <Path
        d={`M ${stroke / 2} ${size} L ${stroke / 2} ${stroke / 2} L ${size} ${stroke / 2}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Barcode icon ─────────────────────────────────────────────────────────────
function BarcodeIcon({
  color = T.muted,
  size = 36,
}: {
  color?: string;
  size?: number;
}) {
  const barW = size;
  const barH = size * 0.65;
  const bars = [2, 5, 4, 2, 6, 3, 5, 2, 4, 3, 6, 2];
  let x = 0;
  const totalW = bars.reduce((a, b) => a + b, 0) + bars.length - 1;
  const scale = barW / totalW;

  return (
    <Svg width={barW} height={barH + 10}>
      {bars.map((w, i) => {
        const fill = i % 2 === 0 ? color : "transparent";
        const bx = x * scale;
        const bw = w * scale;
        x += w + 1;
        return fill !== "transparent" ? (
          <Rect
            key={i}
            x={bx}
            y={0}
            width={bw}
            height={barH}
            fill={fill}
            rx={1}
          />
        ) : null;
      })}
      {/* Number strip */}
      <Rect
        x={0}
        y={barH + 4}
        width={barW}
        height={4}
        fill={color}
        rx={2}
        opacity={0.35}
      />
    </Svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  /** Called when user taps "Tap to scan" */
  onScan?: () => void;
  /** Called when user taps "Enter manually" */
  onManual?: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────
/** Placeholder — wire expo-camera / vision-camera when ready */
export function BarcodeScanner({ onScan, onManual }: Props) {
  return (
    <View style={s.outer}>
      {/* Scan viewport */}
      <TouchableOpacity style={s.viewport} activeOpacity={0.8} onPress={onScan}>
        {/* Dim overlay stripes */}
        <View style={s.dimLeft} pointerEvents="none" />
        <View style={s.dimRight} pointerEvents="none" />

        {/* Corner brackets */}
        <View style={s.corners}>
          <View style={s.cornersTop}>
            <Corner />
            <Corner flip />
          </View>
          <View style={s.cornersBottom}>
            <Corner flipY />
            <Corner flip flipY />
          </View>
        </View>

        {/* Scan line */}
        <View style={s.scanLine} pointerEvents="none" />

        {/* Center content */}
        <View style={s.center}>
          <BarcodeIcon color={T.sub} size={44} />
          <Text style={s.hint}>Tap to scan barcode</Text>
        </View>
      </TouchableOpacity>

      {/* Footer */}
      <View style={s.footer}>
        <View style={s.footerLeft}>
          <View style={s.statusDot} />
          <Text style={s.statusText}>Camera ready</Text>
        </View>
        <TouchableOpacity onPress={onManual} activeOpacity={0.7}>
          <Text style={s.manualText}>Enter manually →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const VIEWPORT_H = 172;
const BRACKET_PAD = 14;

const s = StyleSheet.create({
  outer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.borderMid,
    backgroundColor: T.bg1,
    overflow: "hidden",
  },

  // ── Viewport ──────────────────────────────────────────────────────────────
  viewport: {
    height: VIEWPORT_H,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
  },

  // Side dim bars — suggest a scan window cut-out
  dimLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "18%",
    backgroundColor: "#00000040",
  },
  dimRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "18%",
    backgroundColor: "#00000040",
  },

  // Corner brackets
  corners: {
    position: "absolute",
    top: BRACKET_PAD,
    left: BRACKET_PAD,
    right: BRACKET_PAD,
    bottom: BRACKET_PAD,
  },
  cornersTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cornersBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Scan line
  scanLine: {
    position: "absolute",
    left: "18%",
    right: "18%",
    height: 1.5,
    top: "50%",
    backgroundColor: T.lime,
    opacity: 0.5,
    shadowColor: T.lime,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },

  // Center icon + hint
  center: {
    alignItems: "center",
    gap: 10,
  },
  hint: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.muted,
    letterSpacing: 0.3,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.lime,
    opacity: 0.7,
  },
  statusText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.muted,
  },
  manualText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: T.lime,
  },
});
