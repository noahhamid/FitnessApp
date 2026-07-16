import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";

const T = {
  text: "#FFFFFF",
  faint: "#9AA0AE",
  lime: "#D4F445",
  card: "#1C1F26",
};

type Props = {
  name: string;
  subtitle?: string;
  avatarUrl: string;
  hasNotification?: boolean;
  onPressBell?: () => void;
};

export function WorkoutTabHeader({
  name,
  subtitle = "Fitness Freak",
  avatarUrl,
  hasNotification = true,
  onPressBell,
}: Props) {
  return (
    <View style={s.row}>
      <View style={s.left}>
        <Image source={{ uri: avatarUrl }} style={s.avatar} />
        <View>
          <Text style={s.greeting}>Hi {name}</Text>
          <View style={s.subtitleRow}>
            <View style={s.dot} />
            <Text style={s.subtitle}>{subtitle}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPressBell}
        style={s.bellWrap}
      >
        <Bell size={20} color={T.text} />
        {hasNotification && <View style={s.badge} />}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: T.lime,
  },
  greeting: {
    color: T.text,
    fontSize: 17,
    fontWeight: "800",
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.lime,
  },
  subtitle: {
    color: T.faint,
    fontSize: 12,
    fontWeight: "600",
  },
  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.card,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F45FA0",
    borderWidth: 1.5,
    borderColor: T.card,
  },
});
