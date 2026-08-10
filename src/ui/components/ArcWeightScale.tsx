import { C, FONTS } from "@/src/ui/tokens";
import * as Haptics from "expo-haptics";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 112;
/** Full circle — every kg maps across all 360°. */
const SWEEP = 360;
/** px of horizontal drag per kg. */
const PX_PER_KG = 4;

export type ArcWeightScaleHandle = {
  scrollToValue: (kg: number) => void;
};

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Angle in degrees for a weight (0° = straight up / pointer). */
function angleForWeight(kg: number, min: number, max: number) {
  const span = max - min;
  if (span <= 0) return 0;
  // Map the full range around the circle (600° land on the same mark as 0).
  return ((kg - min) / span) * SWEEP;
}

function polar(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: CX + r * Math.sin(rad),
    y: CY - r * Math.cos(rad),
  };
}

export const ArcWeightScale = forwardRef<ArcWeightScaleHandle, Props>(
  function ArcWeightScale({ min, max, value, onChange }, ref) {
    const lastEmitted = useRef(value);
    const dragStartKg = useRef(value);

    const emit = useCallback(
      (next: number) => {
        const rounded = Math.round(clamp(next, min, max));
        if (rounded === lastEmitted.current) return;
        lastEmitted.current = rounded;
        if (Platform.OS !== "web") Haptics.selectionAsync();
        onChange(rounded);
      },
      [min, max, onChange],
    );

    const scrollToValue = useCallback(
      (kg: number) => {
        emit(kg);
      },
      [emit],
    );

    useImperativeHandle(ref, () => ({ scrollToValue }), [scrollToValue]);

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: (_, g) =>
            Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
          onPanResponderGrant: () => {
            dragStartKg.current = lastEmitted.current;
          },
          onPanResponderMove: (_, g) => {
            // Drag right → heavier (dial rotates under the fixed pointer).
            const next = dragStartKg.current + g.dx / PX_PER_KG;
            emit(next);
          },
        }),
      [emit],
    );

    // Dial rotation: at `value`, that tick sits under the top pointer (0°).
    const dialRotation = -angleForWeight(value, min, max);

    const ticks = useMemo(() => {
      const items: {
        kg: number;
        isMajor: boolean;
        isMid: boolean;
        angle: number;
      }[] = [];
      // Sparse across the full circle: minor 25, mid 50, major+label 100.
      for (let kg = min; kg <= max; kg++) {
        if (kg % 25 !== 0) continue;
        // 0 and max share the same angle on a 360° dial — keep one mark.
        if (kg === max && min !== max) continue;
        const isMajor = kg % 100 === 0;
        const isMid = !isMajor && kg % 50 === 0;
        items.push({
          kg,
          isMajor,
          isMid,
          angle: angleForWeight(kg, min, max),
        });
      }
      return items;
    }, [min, max]);

    const tip = polar(0, RADIUS - 6);
    const baseL = polar(-5, RADIUS - 34);
    const baseR = polar(5, RADIUS - 34);

    return (
      <View style={s.wrap} {...panResponder.panHandlers}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Defs>
            <LinearGradient id="bezel" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#3A3A3A" />
              <Stop offset="0.5" stopColor="#2A2A2A" />
              <Stop offset="1" stopColor="#1A1A1A" />
            </LinearGradient>
            <LinearGradient id="face" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#2E2E2E" />
              <Stop offset="1" stopColor="#222222" />
            </LinearGradient>
          </Defs>

          {/* Full round scale housing */}
          <Circle
            cx={CX}
            cy={CY}
            r={RADIUS + 28}
            fill="url(#bezel)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={2}
          />
          <Circle
            cx={CX}
            cy={CY}
            r={RADIUS + 18}
            fill="url(#face)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />

          {/* Full 360° track ring */}
          <Circle
            cx={CX}
            cy={CY}
            r={RADIUS + 2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={14}
            fill="none"
          />

          {/* Rotating dial — 0…max spread evenly around all 360° */}
          <G transform={`rotate(${dialRotation} ${CX} ${CY})`}>
            {ticks.map(({ kg, isMajor, isMid, angle }) => {
              const outer = polar(angle, RADIUS + 4);
              const inner = polar(
                angle,
                RADIUS - (isMajor ? 22 : isMid ? 16 : 10),
              );
              const label = isMajor ? polar(angle, RADIUS - 36) : null;
              return (
                <G key={kg}>
                  <Line
                    x1={outer.x}
                    y1={outer.y}
                    x2={inner.x}
                    y2={inner.y}
                    stroke={
                      isMajor
                        ? C.accent
                        : isMid
                          ? "rgba(255,255,255,0.45)"
                          : "rgba(255,255,255,0.22)"
                    }
                    strokeWidth={isMajor ? 2.5 : isMid ? 2 : 1.5}
                    strokeLinecap="round"
                  />
                  {label ? (
                    <SvgText
                      x={label.x}
                      y={label.y + 4}
                      fill={C.muted}
                      fontSize={10}
                      fontFamily={FONTS.bold}
                      textAnchor="middle"
                    >
                      {kg}
                    </SvgText>
                  ) : null}
                </G>
              );
            })}
          </G>

          {/* Fixed pointer at 12 o'clock */}
          <Path
            d={`M ${tip.x} ${tip.y} L ${baseL.x} ${baseL.y} L ${baseR.x} ${baseR.y} Z`}
            fill={C.accent}
          />
          <Circle cx={CX} cy={CY} r={8} fill={C.accent} />
          <Circle cx={CX} cy={CY} r={3.5} fill="#1A1A1A" />
        </Svg>

        <View style={s.hintRow}>
          <Text style={s.hint}>SLIDE HORIZONTALLY TO ADJUST</Text>
        </View>
      </View>
    );
  },
);

const s = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  hintRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hintChevron: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: C.accent,
  },
  hint: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: C.muted,
  },
});
