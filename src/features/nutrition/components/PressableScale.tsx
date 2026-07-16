import { useCallback, useRef, ReactNode } from "react";
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

type Props = Omit<PressableProps, "style"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

// Same press-feedback pattern as WorkoutPlanCard (spring scale + opacity dip),
// factored out so every tappable card/button in this section shares it
// instead of re-declaring the same two Animated.Values each time.
export function PressableScale({
  children,
  style,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(
    (e: any) => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: scaleTo,
          useNativeDriver: true,
          friction: 7,
          tension: 140,
        }),
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 90,
          useNativeDriver: true,
        }),
      ]).start();
      onPressIn?.(e);
    },
    [scale, opacity, scaleTo, onPressIn],
  );

  const handlePressOut = useCallback(
    (e: any) => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 140,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      onPressOut?.(e);
    },
    [scale, opacity, onPressOut],
  );

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={4}
      style={style}
      {...rest}
    >
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
