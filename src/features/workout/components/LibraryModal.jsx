import { useState } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, ScrollView, StyleSheet } from "react-native";
import { COLORS, EXERCISES, MUSCLE_GROUPS, TAG_COLORS } from "@/src/theme";

const C = COLORS;

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[s.chip, active && s.chipActive]}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function LibraryModal({ visible, onClose, onAdd }) {
  const [muscle, setMuscle] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = EXERCISES.filter(
    (e) =>
      (muscle === "All" || e.muscle === muscle) &&
      e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.librarySheet}>
          <View style={s.sheetHandle} />
          <Text style={s.title}>EXERCISE LIBRARY</Text>

          <View style={s.searchRow}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search exercises..."
              placeholderTextColor={C.muted}
              style={s.searchInput}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 14 }}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {MUSCLE_GROUPS.map((m) => (
              <Chip key={m} label={m} active={muscle === m} onPress={() => setMuscle(m)} />
            ))}
          </ScrollView>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onAdd(item);
                  onClose();
                }}
                activeOpacity={0.75}
                style={s.libraryRow}
              >
                <View style={s.libraryIcon}>
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.libraryName}>{item.name}</Text>
                  <Text style={s.libraryMuscle}>{item.muscle}</Text>
                </View>
                <View style={[s.libraryTag, { backgroundColor: `${TAG_COLORS[item.tag]}18` }]}>
                  <Text style={[s.libraryTagText, { color: TAG_COLORS[item.tag] }]}>
                    {item.tag}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  librarySheet: {
    backgroundColor: C.bg2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: "90%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: C.text,
    letterSpacing: 1.5,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg3,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: C.text,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  chipText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: C.muted,
  },
  chipTextActive: {
    color: C.bg,
  },
  libraryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  libraryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${C.accent}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  libraryName: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: C.text,
  },
  libraryMuscle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  libraryTag: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  libraryTagText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
  },
});