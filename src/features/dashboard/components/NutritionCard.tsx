import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Flame, Target, Sparkles } from "lucide-react-native";

const T = {
  card: "#1C1F26",
  cardTop: "#22252E",
  cardInner: "#282C36",
  lime: "#D4F445",
  purple: "#8B7FD1",
  pink: "#F45FA0",
  text: "#FFFFFF",
  muted: "#9AA0AE",
  faint: "#71717A",
  divider: "#2E323C",
};

type Props = {
  target: number;
  burned: number;
  remaining: number;
};

const CalorieDonut = ({
  target,
  burned,
  remaining,
  size = 156,
}: Props & { size?: number }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const burnedLength = circumference * (burned / target);
  const remainingLength = circumference * (remaining / target);

  return (
    <View style={{ width: size, height: size }}>
      {/* soft glow behind the ring */}
      <View
        style={[
          s.donutGlow,
          {
            width: size + 40,
            height: size + 40,
            borderRadius: (size + 40) / 2,
            top: -20,
            left: -20,
          },
        ]}
      />

      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="burnedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF7CB8" />
            <Stop offset="100%" stopColor={T.pink} />
          </SvgGradient>
          <SvgGradient id="remainingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#A79BE8" />
            <Stop offset="100%" stopColor={T.purple} />
          </SvgGradient>
        </Defs>

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#burnedGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${burnedLength} ${circumference - burnedLength}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#remainingGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${remainingLength} ${circumference - remainingLength}`}
          strokeDashoffset={-burnedLength}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={s.donutCenter}>
        <Sparkles size={13} color={T.lime} style={{ marginBottom: 4 }} />
        <Text style={s.donutValue}>{remaining}</Text>
        <Text style={s.donutUnit}>Kcal left</Text>
      </View>
    </View>
  );
};

const MetricChip = ({
  icon,
  value,
  unit,
  label,
  gradient,
}: {
  icon: React.ReactNode;
  value: number;
  unit: string;
  label: string;
  gradient: [string, string];
}) => (
  <View style={s.chip}>
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.chipIconWrap}
    >
      {icon}
    </LinearGradient>
    <Text style={s.chipValue}>
      {value}
      <Text style={s.chipUnit}> {unit}</Text>
    </Text>
    <Text style={s.chipLabel}>{label}</Text>
  </View>
);

export function NutritionCard({ target, burned, remaining }: Props) {
  return (
    <LinearGradient
      colors={[T.cardTop, T.card]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={s.card}
    >
      <View style={s.header}>
        <View>
          <Text style={s.title}>Nutrition</Text>
          <Text style={s.subtitle}>Today's intake</Text>
        </View>
        <View style={s.datePill}>
          <Text style={s.dateText}>Wed, 18</Text>
        </View>
      </View>

      <View style={s.body}>
        <CalorieDonut target={target} burned={burned} remaining={remaining} />
      </View>

      <View style={s.divider} />

      <View style={s.chipRow}>
        <MetricChip
          icon={<Target size={16} color="#0F1400" strokeWidth={2.4} />}
          value={target}
          unit="Kcal"
          label="Target"
          gradient={["#E4FF6E", T.lime]}
        />
        <View style={s.chipDivider} />
        <MetricChip
          icon={
            <Flame size={16} color="#3A0A1E" strokeWidth={2.4} fill="#3A0A1E" />
          }
          value={burned}
          unit="Kcal"
          label="Burned"
          gradient={["#FF95C4", T.pink]}
        />
        <View style={s.chipDivider} />
        <MetricChip
          icon={<Sparkles size={16} color="#211A44" strokeWidth={2.4} />}
          value={remaining}
          unit="Kcal"
          label="Remaining"
          gradient={["#B4A9F2", T.purple]}
        />
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  title: {
    color: T.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: T.faint,
    fontSize: 12,
    marginTop: 2,
  },
  datePill: {
    backgroundColor: T.cardInner,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateText: {
    color: T.muted,
    fontSize: 12,
    fontWeight: "600",
  },

  body: {
    alignItems: "center",
    marginBottom: 20,
  },

  donutGlow: {
    position: "absolute",
    backgroundColor: T.pink,
    opacity: 0.06,
  },

  donutCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  donutValue: {
    color: T.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  donutUnit: {
    color: T.faint,
    fontSize: 11,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: T.divider,
    marginBottom: 18,
  },

  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chip: {
    flex: 1,
    alignItems: "center",
  },
  chipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  chipValue: {
    color: T.text,
    fontSize: 14,
    fontWeight: "700",
  },
  chipUnit: {
    color: T.faint,
    fontSize: 11,
    fontWeight: "500",
  },
  chipLabel: {
    color: T.faint,
    fontSize: 11,
    marginTop: 2,
  },
  chipDivider: {
    width: 1,
    height: 36,
    backgroundColor: T.divider,
    marginHorizontal: 8,
  },
});
