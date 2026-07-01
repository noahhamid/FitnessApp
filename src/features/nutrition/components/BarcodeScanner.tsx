import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E",
  bg3: "#252525",
  gold: "#FFC700",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

// ── Corner bracket ────────────────────────────────────────────────────────────
function Corner({
  flip = false,
  flipY = false,
  size = 18,
  stroke = 2.5,
}: {
  flip?: boolean;
  flipY?: boolean;
  size?: number;
  stroke?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      style={{
        transform: [{ scaleX: flip ? -1 : 1 }, { scaleY: flipY ? -1 : 1 }],
      }}
    >
      <Path
        d={`M ${stroke / 2} ${size} L ${stroke / 2} ${stroke / 2} L ${size} ${stroke / 2}`}
        fill="none"
        stroke={T.gold} // Gold brackets
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Barcode icon ──────────────────────────────────────────────────────────────
function BarcodeIcon({ size = 36 }: { size?: number }) {
  const barW = size;
  const barH = size * 0.65;
  const bars = [2, 5, 4, 2, 6, 3, 5, 2, 4, 3, 6, 2];
  let x = 0;
  const totalW = bars.reduce((a, b) => a + b, 0) + bars.length - 1;
  const scale = barW / totalW;

  return (
    <Svg width={barW} height={barH + 10}>
      {bars.map((w, i) => {
        if (i % 2 !== 0) {
          x += w + 1;
          return null;
        }
        const bx = x * scale;
        const bw = w * scale;
        x += w + 1;
        return (
          <Rect
            key={i}
            x={bx}
            y={0}
            width={bw}
            height={barH}
            fill={T.muted}
            rx={1}
          />
        );
      })}
      <Rect
        x={0}
        y={barH + 4}
        width={barW}
        height={4}
        fill={T.muted}
        rx={2}
        opacity={0.35}
      />
    </Svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = {
  onScan?: () => void;
  onManual?: () => void;
};

// ── Component ─────────────────────────────────────────────────────────────────
export function BarcodeScanner({ onScan, onManual }: Props) {
  return (
    <View style={s.outer}>
      {/* Viewport */}
      <TouchableOpacity style={s.viewport} activeOpacity={0.8} onPress={onScan}>
        {/* Side dim bars */}
        <View style={s.dimLeft} pointerEvents="none" />
        <View style={s.dimRight} pointerEvents="none" />

        {/* Gold corner brackets */}
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

        {/* Gold scan line */}
        <View style={s.scanLine} pointerEvents="none" />

        {/* Center */}
        <View style={s.center}>
          <BarcodeIcon size={44} />
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

// ── Styles ────────────────────────────────────────────────────────────────────
const VIEWPORT_H = 172;
const BRACKET_PAD = 14;

const s = StyleSheet.create({
  // Outer card — no border
  outer: {
    borderRadius: 20,
    backgroundColor: T.bg2,
    overflow: "hidden",
  },

  // Viewport
  viewport: {
    height: VIEWPORT_H,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  dimLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "18%",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  dimRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "18%",
    backgroundColor: "rgba(0,0,0,0.35)",
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

  // Gold scan line — sharp, minimal glow
  scanLine: {
    position: "absolute",
    left: "18%",
    right: "18%",
    height: 1.5,
    top: "50%",
    backgroundColor: T.gold,
    opacity: 0.7,
    shadowColor: T.gold,
    shadowOpacity: 0.6,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },

  // Center icon + hint
  center: { alignItems: "center", gap: 10 },
  hint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
    letterSpacing: 0.3,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: T.bg3, // Subtle separator, same family
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
    backgroundColor: T.gold, // Gold status dot
    opacity: 0.8,
  },
  statusText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  manualText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.gold, // Gold CTA
    letterSpacing: 0.5,
  },
});
