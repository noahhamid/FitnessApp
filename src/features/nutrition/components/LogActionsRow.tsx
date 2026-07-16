import { ComponentType } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera, Search, PenLine, LucideProps } from "lucide-react-native";
import { T } from "../theme";
import { PressableScale } from "./PressableScale";

type Action = {
  key: string;
  label: string;
  icon: ComponentType<LucideProps>;
  primary?: boolean;
  onPress: () => void;
};

export const LOG_ACTION_ICONS = {
  camera: Camera,
  search: Search,
  manual: PenLine,
};

export function LogActionsRow({ actions }: { actions: Action[] }) {
  return (
    <View style={styles.row}>
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <PressableScale
            key={a.key}
            onPress={a.onPress}
            scaleTo={0.96}
            style={styles.pressableReset}
          >
            <View style={[styles.btn, a.primary && styles.btnPrimary]}>
              <View
                style={[styles.iconWrap, a.primary && styles.iconWrapPrimary]}
              >
                <Icon
                  size={16}
                  color={a.primary ? T.bg : T.accent}
                  strokeWidth={2.2}
                />
              </View>
              <Text style={[styles.label, a.primary && styles.labelPrimary]}>
                {a.label}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  pressableReset: { flex: 1, borderRadius: 17 },
  btn: {
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 17,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: T.accent, borderColor: T.accent },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: T.ringGlass,
    borderWidth: 1,
    borderColor: T.ringBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconWrapPrimary: {
    backgroundColor: "rgba(17,19,24,0.15)",
    borderColor: "rgba(17,19,24,0.2)",
  },
  label: { fontFamily: T.bodySemi, fontSize: 11, color: T.white },
  labelPrimary: { color: T.bg },
});
