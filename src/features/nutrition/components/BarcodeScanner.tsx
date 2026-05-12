import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";

/** Placeholder — wire expo-camera / vision-camera when ready */
export function BarcodeScanner() {
  return (
    <View style={s.box}>
      <Text style={s.text}>Barcode scanner</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    height: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontFamily: FONTS.medium, color: COLORS.muted },
});
