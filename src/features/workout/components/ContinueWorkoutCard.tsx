import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { ArrowUpRight } from "lucide-react-native";

const T = {
  lime: "#D4F445",
  limeDeep: "#B9DE1E",
  dark: "#121400",
  text: "#0F1400",
  fade: "rgba(15,20,0,0.6)",
};

type Props = {
  title: string;
  tag: string;
  minutes: number;
  calories: number;
  percent: number;
  onPress?: () => void;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({
  percent,
  size = 44,
}: {
  percent: number;
  size?: number;
}) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: percent / 100,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
      delay: 400,
    }).start();
  }, [percent]);

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(15,20,0,0.15)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={T.dark}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={s.ringLabelWrap}>
        <Text style={s.ringLabelText}>{percent}%</Text>
      </View>
    </View>
  );
};

export function ContinueWorkoutCard({
  title,
  tag,
  minutes,
  calories,
  percent,
  onPress,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const floatY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 6,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <LinearGradient
          colors={[T.lime, T.limeDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.card}
        >
          <View style={s.textCol}>
            <Text style={s.eyebrow}>Progress</Text>
            <Text style={s.title}>{title}</Text>
            <Text style={s.meta}>
              {tag} • {minutes} mins
            </Text>

            <View style={s.caloriePill}>
              <Text style={s.calorieValue}>{calories}</Text>
              <Text style={s.calorieLabel}>CALORIES</Text>
              <View style={s.arrowCircle}>
                <ArrowUpRight size={14} color={T.lime} />
              </View>
            </View>
          </View>

          <View style={s.imageWrap}>
            <View style={s.heroGlow} />
            <Animated.Image
              source={require("@/assets/images/shadow.png")}
              style={[s.heroImage, { transform: [{ translateY: floatY }] }]}
              resizeMode="contain"
            />
            <View style={s.ringWrap}>
              <ProgressRing percent={percent} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 26,
    flexDirection: "row",
    overflow: "hidden",
    height: 168,
  },
  textCol: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  eyebrow: {
    color: T.fade,
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    color: T.text,
    fontSize: 21,
    fontWeight: "800",
    marginTop: 2,
  },
  meta: {
    color: T.fade,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  caloriePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: T.dark,
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 5,
    paddingVertical: 5,
    marginTop: 10,
    gap: 5,
  },
  calorieValue: {
    color: T.lime,
    fontSize: 14,
    fontWeight: "800",
  },
  calorieLabel: {
    color: "rgba(212,244,69,0.6)",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  arrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(212,244,69,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 3,
  },

  imageWrap: {
    width: 130,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(15,20,0,0.1)",
  },
  heroImage: {
    width: 140,
    height: 168,
  },
  ringWrap: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: T.lime,
    borderRadius: 20,
    padding: 2,
  },
  ringLabelWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  ringLabelText: {
    color: T.text,
    fontSize: 9,
    fontWeight: "800",
  },
});
