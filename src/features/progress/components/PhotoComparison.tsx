import { useWeightLog } from "@/src/features/nutrition/hooks/useWeight";
import { fetchWorkoutSessions } from "@/src/features/workout/services/workout.service";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Strict token system — zero color bleed ────────────────────────────────────
const T = {
  bg: "#121212",
  card: "#1E1E1E",
  surface: "#252525",
  gold: "#FFC700", // active selections, highlights ONLY
  text: "#FFFFFF",
  sub: "#A0A0A0",
  dim: "#3A3A3A", // dividers, inactive circles, ghost elements
  border: "#FFFFFF0D", // hairline — 5% white
};

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(SCREEN_W, 430) - 48;
const PHOTO_H = 190;
const PHOTO_W = (CARD_W - 10) / 2;

const BEFORE_PATH = "progress_before.jpg";
const AFTER_PATH = "progress_after.jpg";

function progressPhotoFile(filename: string) {
  return new FileSystem.File(FileSystem.Paths.document, filename);
}

// ── Photo slot ────────────────────────────────────────────────────────────────
function PhotoSlot({
  label,
  tag,
  imageUri,
  showSaved,
  onPick,
  onDelete,
}: {
  label: string;
  tag: string;
  isAfter?: boolean;
  imageUri: string | null;
  showSaved: boolean;
  onPick: () => void;
  onDelete: () => void;
}) {
  return (
    <TouchableOpacity
      style={s.photoSlot}
      activeOpacity={0.8}
      onPress={onPick}
      onLongPress={() => {
        if (!imageUri) return;
        Alert.alert(
          "Remove photo?",
          "This will delete the saved progress photo.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: onDelete },
          ],
        );
      }}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={s.photoImg}
          resizeMode="cover"
        />
      ) : (
        <View style={s.emptySlot}>
          {/* Camera icon — no tinted background, just the icon */}
          <Ionicons name="camera-outline" size={20} color={T.dim} />
          <Text style={s.tapText}>TAP TO ADD</Text>
          <Text style={s.tapHint}>{label.toLowerCase()} photo</Text>
        </View>
      )}

      {/* Date tag — top left, plain muted text */}
      <View style={s.tagWrap}>
        <Text style={s.tagText}>{tag}</Text>
      </View>

      {/* Saved badge — gold checkmark only, no background pill */}
      {showSaved && (
        <View style={s.savedWrap}>
          <Ionicons name="checkmark" size={10} color={T.gold} />
          <Text style={s.savedText}>SAVED</Text>
        </View>
      )}

      {/* Label — bottom center, hairline white */}
      <View style={s.labelWrap}>
        <Text style={s.labelText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Stat item ─────────────────────────────────────────────────────────────────
function StatItem({
  value,
  label,
  highlight = false,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <View style={s.statItem}>
      <Text style={[s.statVal, highlight && { color: T.gold }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function PhotoComparison() {
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [beforeSaved, setBeforeSaved] = useState(false);
  const [afterSaved, setAfterSaved] = useState(false);

  const { data: weightLogs = [] } = useWeightLog();
  const { data: completedWorkouts = [] } = useQuery({
    queryKey: ["progress", "workouts"],
    queryFn: () => fetchWorkoutSessions("?limit=60&completed=true"),
  });

  useEffect(() => {
    async function loadSavedPhotos() {
      const beforeFile = progressPhotoFile(BEFORE_PATH);
      const afterFile = progressPhotoFile(AFTER_PATH);
      if (beforeFile.exists) setBeforePhoto(beforeFile.uri);
      if (afterFile.exists) setAfterPhoto(afterFile.uri);
    }
    void loadSavedPhotos();
  }, []);

  const sortedWeights = useMemo(
    () => [...weightLogs].sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [weightLogs],
  );
  const first = sortedWeights[0];
  const last = sortedWeights[sortedWeights.length - 1];

  const weightDelta = useMemo(() => {
    if (!first || !last) return null;
    return Number((last.weight - first.weight).toFixed(1));
  }, [first, last]);

  // Neutral delta label — no red/green signal, just the number
  const weightDeltaLabel = useMemo(() => {
    if (weightDelta === null) return "—";
    const sign = weightDelta >= 0 ? "+" : "−";
    return `${sign}${Math.abs(weightDelta).toFixed(1)} kg`;
  }, [weightDelta]);

  const durationWeeksLabel = useMemo(() => {
    if (!first || !last) return "—";
    const start = new Date(first.log_date).getTime();
    const end = new Date(last.log_date).getTime();
    const weeks = Math.max(
      0,
      Math.round((end - start) / (1000 * 60 * 60 * 24 * 7)),
    );
    return `${weeks} wks`;
  }, [first, last]);

  function flashSaved(slot: "before" | "after") {
    const setSaved = slot === "before" ? setBeforeSaved : setAfterSaved;
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function savePhoto(slot: "before" | "after", sourceUri: string) {
    const filename = slot === "before" ? BEFORE_PATH : AFTER_PATH;
    const dest = progressPhotoFile(filename);
    if (dest.exists) dest.delete();
    new FileSystem.File(sourceUri).copy(dest);
    if (slot === "before") setBeforePhoto(dest.uri);
    else setAfterPhoto(dest.uri);
    flashSaved(slot);
  }

  async function deletePhoto(slot: "before" | "after") {
    const filename = slot === "before" ? BEFORE_PATH : AFTER_PATH;
    const file = progressPhotoFile(filename);
    if (file.exists) file.delete();
    if (slot === "before") setBeforePhoto(null);
    else setAfterPhoto(null);
  }

  async function pickPhoto(slot: "before" | "after") {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled) {
      await savePhoto(slot, result.assets[0].uri);
    }
  }

  return (
    <View style={s.card}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.sectionLabel}>PROGRESS PHOTOS</Text>
          <Text style={s.subtitle}>Tap to add · Long press to remove</Text>
        </View>
        {/* Duration pill — calendar icon + weeks, no color */}
        <View style={s.durationPill}>
          <Ionicons name="calendar-outline" size={11} color={T.sub} />
          <Text style={s.durationText}>{durationWeeksLabel}</Text>
        </View>
      </View>

      {/* ── Photos row ─────────────────────────────────────────────────────── */}
      <View style={s.photosRow}>
        <PhotoSlot
          label="BEFORE"
          tag={first?.log_date ?? "Start"}
          imageUri={beforePhoto}
          showSaved={beforeSaved}
          onPick={() => void pickPhoto("before")}
          onDelete={() => void deletePhoto("before")}
        />

        {/* VS divider — thin hairline + label, no colored circle */}
        <View style={s.vsDivider}>
          <View style={s.vsLine} />
          <Text style={s.vsText}>VS</Text>
          <View style={s.vsLine} />
        </View>

        <PhotoSlot
          label="AFTER"
          tag={last?.log_date ?? "Now"}
          isAfter
          imageUri={afterPhoto}
          showSaved={afterSaved}
          onPick={() => void pickPhoto("after")}
          onDelete={() => void deletePhoto("after")}
        />
      </View>

      {/* ── Footer stats ────────────────────────────────────────────────────── */}
      {/*
          Weight delta: pure white — no red/green signal.
          Workouts:     gold — this is the active achievement highlight.
          Duration:     white — neutral info.
      */}
      <View style={s.footer}>
        <StatItem value={weightDeltaLabel} label="WEIGHT" />
        <View style={s.statDivider} />
        <StatItem
          value={String(completedWorkouts.length)}
          label="WORKOUTS"
          highlight // gold: the one earned highlight
        />
        <View style={s.statDivider} />
        <StatItem value={durationWeeksLabel} label="DURATION" />
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: {
    backgroundColor: T.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 8,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  headerLeft: { gap: 3 },
  sectionLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.sub,
    letterSpacing: 1.4,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
    opacity: 0.55,
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  durationText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.sub,
    letterSpacing: 0.5,
  },

  // Photos row
  photosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    marginBottom: 16,
  },
  photoSlot: {
    width: PHOTO_W,
    height: PHOTO_H,
    borderRadius: 14,
    backgroundColor: T.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  emptySlot: {
    alignItems: "center",
    gap: 7,
  },
  tapText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
    color: T.dim,
    marginTop: 4,
  },
  tapHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.dim,
  },

  // Date tag — top left, no background pill
  tagWrap: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  tagText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    letterSpacing: 0.4,
    color: T.text,
    opacity: 0.7,
  },

  // Saved indicator — no pill, just icon + text
  savedWrap: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  savedText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 9,
    color: T.gold,
    letterSpacing: 1.2,
  },

  // Label — bottom center
  labelWrap: {
    position: "absolute",
    bottom: 10,
  },
  labelText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    letterSpacing: 1.8,
    color: T.text,
    opacity: 0.8,
  },

  // VS divider — hairline lines + plain text, no circle chrome
  vsDivider: {
    width: 10,
    height: PHOTO_H,
    alignItems: "center",
    justifyContent: "center",
  },
  vsLine: {
    width: 1,
    flex: 1,
    backgroundColor: T.border,
  },
  vsText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 7,
    color: T.dim,
    letterSpacing: 0.5,
    marginVertical: 4,
  },

  // Footer stats
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: T.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: T.dim,
    opacity: 0.4,
  },
  statVal: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
    color: T.text,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.sub,
    letterSpacing: 1.5,
  },
});
