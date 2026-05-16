import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Fixed: import directly from tokens and feature service, NOT from @/src/theme
import {
  EXERCISES,
  MUSCLE_GROUPS,
} from "@/src/features/workout/services/workout.service";
import { COLORS, TAG_COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";

// ── Types ─────────────────────────────────────────────────────────────────────

type Exercise = {
  id: string;
  name: string;
  muscle: string;
  tag: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
};

// ── Muscle filter chip ────────────────────────────────────────────────────────

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function Chip({ label, active, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[s.chip, active && s.chipActive]}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Exercise row ──────────────────────────────────────────────────────────────

type ExerciseRowProps = {
  item: Exercise;
  onPress: () => void;
};

function ExerciseRow({ item, onPress }: ExerciseRowProps) {
  const tagColor = TAG_COLORS[item.tag] ?? COLORS.accent;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={s.libraryRow}
    >
      {/* Icon placeholder — coloured by tag */}
      <View style={[s.libraryIcon, { backgroundColor: `${tagColor}18` }]}>
        <Ionicons name={getExerciseIcon(item.tag)} size={20} color={tagColor} />
      </View>

      <View style={s.libraryTextCol}>
        <Text style={s.libraryName}>{item.name}</Text>
        <Text style={s.libraryMuscle}>{item.muscle.toUpperCase()}</Text>
      </View>

      <View
        style={[
          s.libraryTag,
          { backgroundColor: `${tagColor}18`, borderColor: `${tagColor}35` },
        ]}
      >
        <Text style={[s.libraryTagText, { color: tagColor }]}>{item.tag}</Text>
      </View>

      {/* Fixed: was ＋ emoji — now Ionicons */}
      <View style={s.addChevron}>
        <Ionicons name="add" size={16} color={COLORS.accent} />
      </View>
    </TouchableOpacity>
  );
}

// ── Tag → icon map (replaces per-exercise emoji field) ────────────────────────

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

// ── Empty state ───────────────────────────────────────────────────────────────

type EmptyStateProps = { query: string };

function EmptyState({ query }: EmptyStateProps) {
  return (
    <View style={s.emptyWrap}>
      <View style={s.emptyIconWrap}>
        <Ionicons name="search-outline" size={28} color={COLORS.muted} />
      </View>
      <Text style={s.emptyTitle}>NO RESULTS</Text>
      <Text style={s.emptyBody}>
        No exercises match{query ? ` "${query}"` : " that filter"}.
      </Text>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LibrarySheet({ visible, onClose, onAdd }: Props) {
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

  const clearSearch = useCallback(() => setSearch(""), []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.modalOverlay}>
        {/* Tap outside to close */}
        <TouchableOpacity
          style={s.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <View style={s.librarySheet}>
          {/* Handle */}
          <View style={s.sheetHandle} />

          {/* Header */}
          <View style={s.headerRow}>
            <Text style={s.title}>EXERCISE LIBRARY</Text>
            <TouchableOpacity
              onPress={onClose}
              style={s.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {/* Fixed: was ✕ string — now Ionicons */}
              <Ionicons name="close" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          </View>

          {/* Result count */}
          <Text style={s.resultCount}>
            {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
          </Text>

          {/* Search */}
          <View style={s.searchRow}>
            {/* Fixed: was 🔍 emoji — now Ionicons */}
            <Ionicons
              name="search-outline"
              size={16}
              color={COLORS.muted}
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search exercises..."
              placeholderTextColor={COLORS.muted}
              style={s.searchInput}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color={COLORS.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Muscle filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipScroll}
            style={s.chipScrollOuter}
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

          {/* Exercise list */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  librarySheet: {
    backgroundColor: COLORS.bg2,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 22,
    color: COLORS.text,
    letterSpacing: 1.8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  resultCount: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg3,
    borderRadius: 13,
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
  },
  chipScrollOuter: { marginBottom: 14 },
  chipScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.38,
    shadowRadius: 6,
    elevation: 4,
  },
  chipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.muted,
  },
  chipTextActive: { color: COLORS.bg },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 9,
  },
  libraryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 13,
  },
  libraryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  libraryTextCol: { flex: 1, gap: 2 },
  libraryName: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  libraryMuscle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 0.4,
  },
  libraryTag: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  libraryTagText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  addChevron: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: `${COLORS.accent}15`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 24,
    gap: 8,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: FONTS.black,
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: 1,
  },
  emptyBody: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
