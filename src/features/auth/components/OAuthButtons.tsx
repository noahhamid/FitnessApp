import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { C, FONTS } from "@/src/theme";

type Props = { onApple?: () => void; onGoogle?: () => void };

export function OAuthButtons({ onApple, onGoogle }: Props) {
  return (
    <View style={s.row}>
      <TouchableOpacity style={s.btn} onPress={onApple} activeOpacity={0.85}>
        <Text style={s.btnText}>Continue with Apple</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btn} onPress={onGoogle} activeOpacity={0.85}>
        <Text style={s.btnText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row: { gap: 12, marginTop: 16 },
  btn: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: C.bg3,
  },
  btnText: { fontFamily: FONTS.semiBold, color: C.text, fontSize: 14 },
});
