import { Ionicons } from "@expo/vector-icons";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const T = {
  gold: "#FFC700",
  bg0: "#121212",
  text: "#FFFFFF",
  sub: "#D9D9D9",
};

type Props = {
  title: string;
  tag?: string; // e.g. "Advanced" / "Beginner friendly"
  imageUrl?: string;
  calories?: number;
  minutes?: number;
  onPress: () => void;
  compact?: boolean; // smaller card, for horizontal scroll lists
};

export function WorkoutHeroCard({
  title,
  tag,
  imageUrl,
  calories,
  minutes,
  onPress,
  compact = false,
}: Props) {
  return (
    <View style={[s.card, compact && s.cardCompact]}>
      <ImageBackground
        source={imageUrl ? { uri: imageUrl } : undefined}
        style={[s.image, compact && s.imageCompact]}
        imageStyle={s.imageRadius}
      >
        <View style={s.overlay} />

        {tag ? (
          <View style={[s.tagPill, compact && s.tagPillCompact]}>
            <Text style={[s.tagText, compact && s.tagTextCompact]}>{tag}</Text>
          </View>
        ) : null}

        <View style={[s.bottomRow, compact && s.bottomRowCompact]}>
          <View style={{ flex: 1 }}>
            {!compact && <Text style={s.eyebrow}>TODAY'S WORKOUT</Text>}
            <Text
              style={[s.title, compact && s.titleCompact]}
              numberOfLines={1}
            >
              {title}
            </Text>

            <View style={s.metaRow}>
              {calories != null && (
                <View style={s.metaItem}>
                  <Ionicons
                    name="flame"
                    size={compact ? 11 : 14}
                    color={T.gold}
                  />
                  <Text style={[s.metaText, compact && s.metaTextCompact]}>
                    {calories} Kcal
                  </Text>
                </View>
              )}
              {minutes != null && (
                <View style={s.metaItem}>
                  <Ionicons
                    name="time-outline"
                    size={compact ? 11 : 14}
                    color={T.gold}
                  />
                  <Text style={[s.metaText, compact && s.metaTextCompact]}>
                    {minutes} min
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[s.playBtn, compact && s.playBtnCompact]}
            activeOpacity={0.85}
            onPress={onPress}
          >
            <Ionicons name="play" size={compact ? 16 : 22} color={T.bg0} />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1E1E1E",
  },
  cardCompact: {
    borderRadius: 18,
    width: 170,
  },
  image: {
    width: "100%",
    height: 220,
    justifyContent: "space-between",
  },
  imageCompact: {
    height: 140,
  },
  imageRadius: { borderRadius: 24 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(18,18,18,0.35)",
  },
  tagPill: {
    alignSelf: "flex-start",
    margin: 14,
    backgroundColor: "rgba(18,18,18,0.55)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagPillCompact: {
    margin: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.text,
  },
  tagTextCompact: {
    fontSize: 9,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
  },
  bottomRowCompact: {
    padding: 10,
  },
  eyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.gold,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 30,
    color: T.text,
    lineHeight: 32,
    marginTop: 2,
  },
  titleCompact: {
    fontSize: 18,
    lineHeight: 20,
    marginTop: 0,
  },
  metaRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
  },
  metaTextCompact: {
    fontSize: 10,
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: T.gold,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  playBtnCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
  },
});
