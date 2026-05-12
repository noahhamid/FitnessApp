import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { C, FONTS } from "@/src/theme";
import { Button } from "@/src/ui/components/Button";
import { CheckMark } from "@/src/ui/components/Icons";

type Props = { onNext: () => void };

export function ReadyScreen({ onNext }: Props) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.badge}>
          <CheckMark size={48} color={C.bg} />
        </View>
        <Text style={s.titleWhite}>YOU&apos;RE</Text>
        <Text style={s.titleAccent}>READY.</Text>
        <Button onPress={onNext}>ENTER THE APP →</Button>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  badge: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  titleWhite: { fontFamily: FONTS.black, fontSize: 56, color: C.text, lineHeight: 58 },
  titleAccent: {
    fontFamily: FONTS.black,
    fontSize: 56,
    color: C.accent,
    lineHeight: 58,
    marginBottom: 16,
  },
});
