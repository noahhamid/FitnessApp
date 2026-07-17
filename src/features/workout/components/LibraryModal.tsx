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

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#0A0A0A", // Main background
  bg1: "#141414", // Sheet background
  bg2: "#1A1A1A", // Card / row surface
  bg3: "#242424", // Input / chip surface
  gold: "#FF1F4D", // Primary accent
  goldDim: "#FF1F4D18", // Accent tint for pressed/selected surfaces
  text: "#FFFFFF", // Headers / exercise names
  sub: "#A8A8A8", // Secondary details
  muted: "#5A5A5A", // Placeholder / disabled
  border: "#242424", // Subtle divider
};

type Exercise = { id: string; name: string; muscle: string; tag: string };
type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
};

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
  justAdded,
  onPress,
}: {
  item: Exercise;
  justAdded: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[ss.row, justAdded && ss.rowActive]}
    >
      {/* Icon bubble — gold tint, no color-per-tag */}
      <View style={[ss.rowIcon, justAdded && ss.rowIconActive]}>
        <Ionicons
          name="barbell-outline"
          size={20}
          color={justAdded ? T.bg0 : T.gold}
        />
      </View>

      {/* Name + muscle */}
      <View style={ss.rowText}>
        <Text style={ss.rowName}>{item.name}</Text>
        <Text style={ss.rowMuscle}>
          {item.muscle.toUpperCase()} · {item.tag}
        </Text>
      </View>

      {/* Add CTA — gold circle, flips to a tick on tap */}
      <View style={ss.addBtn}>
        <Ionicons
          name={justAdded ? "checkmark" : "add"}
          size={18}
          color={T.bg0}
        />
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const filtered = (EXERCISES as Exercise[]).filter(
    (e) =>
      (muscle === "All" || e.muscle === muscle) &&
      e.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = useCallback(
    (item: Exercise) => {
      setAddedId(item.id);
      onAdd(item);
      // brief gold "confirmed" flash before the sheet dismisses
      setTimeout(() => {
        onClose();
        setAddedId(null);
      }, 140);
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
              <Ionicons name="close" size={16} color={T.sub} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={[ss.searchRow, searchFocused && ss.searchRowFocused]}>
            <Ionicons
              name="search-outline"
              size={15}
              color={searchFocused ? T.gold : T.muted}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
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
              <ExerciseRow
                item={item}
                justAdded={addedId === item.id}
                onPress={() => handleAdd(item)}
              />
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },

  // Sheet
  sheet: {
    backgroundColor: T.bg1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 28,
  },
  handleRow: { alignItems: "center", paddingTop: 12, paddingBottom: 6 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.border,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 24,
    color: T.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
  },

  // Search — borderless by default, gold outline on focus
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.bg3,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1.5,
    borderColor: "transparent", // reserves space so focus doesn't shift layout
  },
  searchRowFocused: {
    borderColor: T.gold,
    backgroundColor: T.bg2,
  },
  searchInput: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.text,
    padding: 0,
  },

  // Chips
  chipRow: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: T.bg3,
  },
  chipActive: {
    backgroundColor: T.gold,
  },
  chipText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.sub,
    letterSpacing: 0.5,
  },
  chipTextActive: { color: T.bg0 }, // Dark text on gold for contrast

  // Exercise rows
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 48 : 28,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: T.bg2,
    borderRadius: 16,
    padding: 14,
    // No border, no color tags — clean card
  },
  rowActive: {
    backgroundColor: T.goldDim,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconActive: {
    backgroundColor: T.gold,
  },
  rowText: { flex: 1, gap: 3 },
  rowName: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 17,
    color: T.text,
    letterSpacing: 0.3,
  },
  rowMuscle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
    letterSpacing: 0.4,
  },

  // Gold add button — filled circle
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty state
  empty: { alignItems: "center", paddingTop: 56, paddingBottom: 24, gap: 10 },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 18,
    color: T.sub,
    letterSpacing: 1.5,
  },
  emptyBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.muted,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
