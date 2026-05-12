import Svg, { Path, Circle } from "react-native-svg";
import { C } from "@/src/ui/tokens";

export function LogoMark({ size = 52, color = C.bg }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <Path
        d="M8 26H14M38 26H44M14 26C14 19.373 19.373 14 26 14C32.627 14 38 19.373 38 26C38 32.627 32.627 38 26 38C19.373 38 14 32.627 14 26Z"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Circle cx="26" cy="26" r="5" fill={color} />
      <Path d="M26 8V12M26 40V44" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function CheckMark({ size = 48, color = C.bg }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M10 25L19 35L38 14"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
