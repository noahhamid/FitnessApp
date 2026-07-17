import { Image, StyleSheet, View } from "react-native";
import { useOnboardingStore, type Gender } from "../store/onboardingStore";

const HERO_IMAGES = {
  male: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop",
  female: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=2069&auto=format&fit=crop",
  other: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
};

type Props = {
  gender?: Gender | null;
};

export function HeroImage({ gender: propGender }: Props) {
  const storeGender = useOnboardingStore((s) => s.gender);
  const gender = propGender ?? storeGender;

  if (!gender) return null;

  return (
    <View style={s.container}>
      <Image
        source={{ uri: HERO_IMAGES[gender] }}
        style={s.image}
        resizeMode="cover"
      />
      {/* Gradient overlay for text readability */}
      <View style={s.overlay} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
    overflow: "hidden",
    borderRadius: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 10, 10, 0.3)",
  },
});
