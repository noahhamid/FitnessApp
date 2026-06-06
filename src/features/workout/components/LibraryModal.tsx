import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  EXERCISES,
  MUSCLE_GROUPS,
} from "@/src/features/workout/services/workout.service";

const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  orange: "#FF8A00",
  blue: "#3D8EFF",
  purple: "#9B6DFF",
  red: "#FF3D3D",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
};

const TAG_COLORS: Record<string, string> = {
  Compound: T.lime,
  Isolation: T.orange,
  Bodyweight: T.blue,
  Machine: T.purple,
  Cardio: T.red,
};

type Exercise = { id: string; name: string; muscle: string; tag: string };
type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
};

function getExerciseIcon(tag: string): keyof typeof Ionicons.glyphMap {
  switch (tag) {
    case "Compound":
      return "barbell-outline";
    case "Isolation":
      return "git-pull-request-outline";
    case "Bodyweight":
      return "body-outline";
    case "Machine":
      return "settings-outline";
    case "Cardio":
      return "heart-outline";
    default:
      return "fitness-outline";
  }
}

// ── Muscle chip ───────────────────────────────────────────────────────────────
function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[ss.chip, active && ss.chipActive]}
    >
      <Text style={[ss.chipText, active && ss.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Exercise row ──────────────────────────────────────────────────────────────
function ExerciseRow({
  item,
  onPress,
}: {
  item: Exercise;
  onPress: () => void;
}) {
  const tagColor = TAG_COLORS[item.tag] ?? T.lime;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={ss.row}>
      <View style={[ss.rowIcon, { backgroundColor: tagColor + "18" }]}>
        <Ionicons name={getExerciseIcon(item.tag)} size={20} color={tagColor} />
      </View>
      <View style={ss.rowText}>
        <Text style={ss.rowName}>{item.name}</Text>
        <Text style={ss.rowMuscle}>{item.muscle.toUpperCase()}</Text>
      </View>
      <View
        style={[
          ss.tagPill,
          { backgroundColor: tagColor + "18", borderColor: tagColor + "35" },
        ]}
      >
        <Text style={[ss.tagText, { color: tagColor }]}>{item.tag}</Text>
      </View>
      <View style={ss.addBtn}>
        <Ionicons name="add" size={16} color={T.lime} />
      </View>
    </TouchableOpacity>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <View style={ss.empty}>
      <View style={ss.emptyIcon}>
        <Ionicons name="search-outline" size={26} color={T.muted} />
      </View>
      <Text style={ss.emptyTitle}>NO RESULTS</Text>
      <Text style={ss.emptyBody}>
        No exercises match{query ? ` "${query}"` : " that filter"}.
      </Text>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LibraryModal({ visible, onClose, onAdd }: Props) {
  const [muscle, setMuscle] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = (EXERCISES as Exercise[]).filter(
    (e) =>
      (muscle === "All" || e.muscle === muscle) &&
      e.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = useCallback(
    (item: Exercise) => {
      onAdd(item);
      onClose();
    },
    [onAdd, onClose],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={ss.overlay}>
        <TouchableOpacity
          style={ss.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={ss.sheet}>
          {/* Handle */}
          <View style={ss.handleRow}>
            <View style={ss.handle} />
          </View>

          {/* Header */}
          <View style={ss.header}>
            <View>
              <Text style={ss.title}>EXERCISE LIBRARY</Text>
              <Text style={ss.subtitle}>
                {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={ss.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={16} color={T.muted} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={ss.searchRow}>
            <Ionicons name="search-outline" size={15} color={T.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search exercises..."
              placeholderTextColor={T.muted}
              style={ss.searchInput}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color={T.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Muscle chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={ss.chipRow}
            style={{ marginBottom: 12 }}
          >
            {(MUSCLE_GROUPS as string[]).map((m) => (
              <Chip
                key={m}
                label={m}
                active={muscle === m}
                onPress={() => setMuscle(m)}
              />
            ))}
          </ScrollView>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={ss.listContent}
            ListEmptyComponent={<EmptyState query={search} />}
            renderItem={({ item }) => (
              <ExerciseRow item={item} onPress={() => handleAdd(item)} />
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  );
}

const ss = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: T.bg1,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: "92%",
    paddingTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 24,
  },
  handleRow: { alignItems: "center", paddingTop: 12, paddingBottom: 8 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.borderMid,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 22,
    color: T.text,
    letterSpacing: 1.8,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.bg3,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: T.borderMid,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.text,
    padding: 0,
  },
  chipRow: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.borderMid,
  },
  chipActive: {
    backgroundColor: T.lime,
    borderColor: T.lime,
    shadowColor: T.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  chipText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.muted,
    letterSpacing: 0.5,
  },
  chipTextActive: { color: T.bg0 },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 48 : 28,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 15,
    padding: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, gap: 2 },
  rowName: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.text,
    letterSpacing: 0.3,
  },
  rowMuscle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 0.4,
  },
  tagPill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: T.lime + "15",
    borderWidth: 1,
    borderColor: T.lime + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { alignItems: "center", paddingTop: 48, paddingBottom: 24, gap: 8 },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 18,
    color: T.text,
    letterSpacing: 1.5,
    opacity: 0.6,
  },
  emptyBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.muted,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
