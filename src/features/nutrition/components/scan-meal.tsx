// app/scan-meal.tsx
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  ChevronLeft,
  RotateCcw,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Sparkles,
  ScanLine,
} from "lucide-react-native";
import { AppIcon } from "@/src/components/AppIcon";

import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { PressableScale } from "../components/PressableScale";
import { useAddMeal } from "../hooks/useNutrition";
import { scanFoodImage, uploadMealPhoto } from "../services/nutrition.service";
import type { FoodScanResult, MealType } from "../types/nutrition.types";
import * as ImageManipulator from "expo-image-manipulator";

const MEAL_SLOTS: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

const ANALYZE_BEATS: {
  Icon: typeof Flame;
  title: string;
  sub: string;
}[] = [
  {
    Icon: ScanLine,
    title: "Reading the plate…",
    sub: "Spotting what's on there",
  },
  {
    Icon: Flame,
    title: "Calculating kcal…",
    sub: "Energy estimate coming up",
  },
  {
    Icon: Beef,
    title: "Weighing protein…",
    sub: "Muscle fuel check",
  },
  {
    Icon: Wheat,
    title: "Counting carbs…",
    sub: "Fuel for the session",
  },
  {
    Icon: Droplets,
    title: "Measuring fats…",
    sub: "Rounding out the macros",
  },
  {
    Icon: Sparkles,
    title: "Finishing touches…",
    sub: "Almost ready to log",
  },
];

function todayStr(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

type Status =
  | "idle"
  | "camera"
  | "analyzing"
  | "reviewing"
  | "error";

function FocusCorners({ color }: { color: string }) {
  const len = 28;
  const thick = 3;
  const Bar = ({
    w,
    h,
    top,
    left,
    right,
    bottom,
  }: {
    w?: number;
    h?: number;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  }) => (
    <View
      style={{
        position: "absolute",
        width: w,
        height: h,
        top,
        left,
        right,
        bottom,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ position: "absolute", top: 0, left: 0, width: len, height: len }}>
        <Bar w={len} h={thick} top={0} left={0} />
        <Bar w={thick} h={len} top={0} left={0} />
      </View>
      <View style={{ position: "absolute", top: 0, right: 0, width: len, height: len }}>
        <Bar w={len} h={thick} top={0} right={0} />
        <Bar w={thick} h={len} top={0} right={0} />
      </View>
      <View style={{ position: "absolute", bottom: 0, left: 0, width: len, height: len }}>
        <Bar w={len} h={thick} bottom={0} left={0} />
        <Bar w={thick} h={len} bottom={0} left={0} />
      </View>
      <View style={{ position: "absolute", bottom: 0, right: 0, width: len, height: len }}>
        <Bar w={len} h={thick} bottom={0} right={0} />
        <Bar w={thick} h={len} bottom={0} right={0} />
      </View>
    </View>
  );
}

function AnalyzingLoader({
  photoUri,
  accent,
  styles,
}: {
  photoUri: string | null;
  accent: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  const [beat, setBeat] = useState(0);
  const pulse = useRef(new Animated.Value(0.55)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    const id = setInterval(() => {
      Animated.sequence([
        Animated.timing(fade, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
      setBeat((b) => (b + 1) % ANALYZE_BEATS.length);
    }, 1600);
    return () => clearInterval(id);
  }, [fade]);

  const current = ANALYZE_BEATS[beat]!;
  const Icon = current.Icon;

  return (
    <View style={styles.centerFill}>
      {photoUri ? (
        <View style={styles.analyzePreviewWrap}>
          <Image source={{ uri: photoUri }} style={styles.analyzePreview} />
          <Animated.View
            style={[
              styles.analyzeGlow,
              { opacity: pulse, borderColor: accent },
            ]}
          />
          <View style={styles.analyzeIconBadge}>
            <Icon size={22} color={accent} strokeWidth={2} />
          </View>
        </View>
      ) : (
        <Animated.View style={{ opacity: pulse, marginBottom: 18 }}>
          <Icon size={36} color={accent} strokeWidth={1.8} />
        </Animated.View>
      )}
      <Animated.View style={{ opacity: fade, alignItems: "center" }}>
        <Text style={styles.analyzeTitle}>{current.title}</Text>
        <Text style={styles.analyzeSub}>{current.sub}</Text>
      </Animated.View>
      <ActivityIndicator color={accent} size="small" style={{ marginTop: 20 }} />
    </View>
  );
}

export default function ScanMealScreen() {
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ slot?: string; date?: string }>();
  const logDate = params.date ?? todayStr();
  const initialSlot = MEAL_SLOTS.includes(params.slot as MealType)
    ? (params.slot as MealType)
    : "Breakfast";

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<FoodScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturingShot, setCapturingShot] = useState(false);

  const [slot, setSlot] = useState<MealType>(initialSlot);
  const [name, setName] = useState("");
  const [cal, setCal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const addMeal = useAddMeal();

  const openCamera = async () => {
    setErrorMsg(null);
    if (!permission?.granted) {
      const next = await requestPermission();
      if (!next.granted) {
        setErrorMsg("Camera permission is needed to scan food.");
        return;
      }
    }
    setStatus("camera");
  };

  const analyzeBase64 = async (base64: string, mimeType: string, uri: string) => {
    setPhotoUri(uri);
    setStatus("analyzing");
    const startedAt = Date.now();
    try {
      console.log(
        `[scan-meal] uploading ${(base64.length / 1024 / 1024).toFixed(2)}MB base64, mime=${mimeType}`,
      );
      const scan = await scanFoodImage(base64, mimeType);
      console.log(`[scan-meal] scan ok in ${Date.now() - startedAt}ms`);
      setResult(scan);
      setName(scan.name);
      setCal(String(scan.cal));
      setProtein(String(scan.protein));
      setCarbs(String(scan.carbs));
      setFat(String(scan.fat));
      setStatus("reviewing");
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      console.error(
        `[scan-meal] scan failed after ${Date.now() - startedAt}ms:`,
        detail,
      );
      setStatus("error");
      setErrorMsg(`${detail} — try again or enter it manually.`);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current || capturingShot) return;
    setCapturingShot(true);
    try {
      const shot = await cameraRef.current.takePictureAsync({
        quality: 0.65,
        base64: true,
        skipProcessing: false,
      });
      if (!shot?.uri) {
        setStatus("error");
        setErrorMsg("Couldn't capture that photo. Try again.");
        return;
      }
      if (!shot.base64) {
        setStatus("error");
        setErrorMsg("Couldn't read that photo. Try again.");
        return;
      }
      await analyzeBase64(shot.base64, "image/jpeg", shot.uri);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      setStatus("error");
      setErrorMsg(`${detail} — try again.`);
    } finally {
      setCapturingShot(false);
    }
  };

  const retake = () => {
    setPhotoUri(null);
    setResult(null);
    setStatus("idle");
  };

  const canSubmit =
    name.trim().length > 0 &&
    cal.trim().length > 0 &&
    !Number.isNaN(Number(cal)) &&
    !addMeal.isPending;

  const handleSave = async () => {
    if (!canSubmit) return;

    let imageUrl: string | null = null;
    if (photoUri) {
      try {
        const prepared = await ImageManipulator.manipulateAsync(
          photoUri,
          [{ resize: { width: 1024 } }],
          {
            compress: 0.72,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          },
        );
        if (prepared.base64) {
          imageUrl = await uploadMealPhoto(prepared.base64, "image/jpeg");
        }
      } catch (e) {
        console.error("[scan-meal] photo upload failed:", e);
      }
    }

    addMeal.mutate(
      {
        log_date: logDate,
        meal: slot,
        name: name.trim(),
        cal: Math.round(Number(cal)),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        quantity: 1,
        unit: "serving",
        image_url: imageUrl,
        source: "scan",
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <SafeAreaView
      edges={status === "camera" ? [] : ["top"]}
      style={[styles.root, status === "camera" && { backgroundColor: "#000" }]}
    >
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={status === "camera" ? "#000" : T.bg}
        translucent={false}
      />

      {status !== "camera" && (
        <View style={styles.header}>
          <PressableScale onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={20} color={T.white} strokeWidth={2.2} />
          </PressableScale>
          <Text style={styles.headerTitle}>Scan food</Text>
          <View style={{ width: 34 }} />
        </View>
      )}

      {status === "idle" && (
        <View style={styles.centerFill}>
          <View style={styles.captureRing}>
            <AppIcon name="scan" size={42} />
          </View>
          <Text style={styles.hint}>
            Snap a photo of your meal and{"\n"}we'll estimate the macros.
          </Text>
          {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
          <PressableScale onPress={openCamera} style={styles.captureBtnPressable}>
            <View style={styles.captureBtn}>
              <Text style={styles.captureBtnText}>Open camera</Text>
            </View>
          </PressableScale>
        </View>
      )}

      {status === "camera" && (
        <View style={styles.cameraRoot}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            mode="picture"
          />
          <View style={[styles.cameraTopBar, { paddingTop: insets.top + 8 }]}>
            <PressableScale
              onPress={() => setStatus("idle")}
              style={styles.camClose}
            >
              <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.2} />
            </PressableScale>
            <Text style={styles.camTitle}>Focus on your food</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.focusFrame}>
            <FocusCorners color={T.accent} />
            <View style={styles.focusCrosshair} />
            <Text style={styles.focusHint}>Center the plate in the frame</Text>
          </View>

          <View style={[styles.cameraBottom, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <PressableScale
              onPress={takePhoto}
              disabled={capturingShot}
              style={[
                styles.shutterOuter,
                capturingShot && { opacity: 0.55 },
              ]}
            >
              <View style={styles.shutterInner} />
            </PressableScale>
          </View>
        </View>
      )}

      {status === "analyzing" && (
        <AnalyzingLoader
          photoUri={photoUri}
          accent={T.accent}
          styles={styles}
        />
      )}

      {status === "error" && (
        <View style={styles.centerFill}>
          <Text style={styles.error}>{errorMsg}</Text>
          <PressableScale onPress={openCamera} style={styles.captureBtnPressable}>
            <View style={styles.captureBtn}>
              <Text style={styles.captureBtnText}>Try again</Text>
            </View>
          </PressableScale>
        </View>
      )}

      {status === "reviewing" && (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {photoUri && (
            <View style={styles.previewWrap}>
              <Image source={{ uri: photoUri }} style={styles.preview} />
              <PressableScale onPress={retake} style={styles.retakeBtn}>
                <RotateCcw size={14} color={T.onImage} strokeWidth={2.2} />
                <Text style={styles.retakeText}>Retake</Text>
              </PressableScale>
            </View>
          )}

          <Text style={styles.label}>Meal</Text>
          <View style={styles.slotRow}>
            {MEAL_SLOTS.map((s) => (
              <PressableScale
                key={s}
                onPress={() => setSlot(s)}
                scaleTo={0.96}
                style={styles.slotPressable}
              >
                <View
                  style={[styles.slotChip, slot === s && styles.slotChipActive]}
                >
                  <Text
                    style={[
                      styles.slotText,
                      slot === s && styles.slotTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </View>

          <Text style={styles.label}>Food name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholderTextColor={T.muted}
            style={styles.input}
          />

          <Text style={styles.label}>Calories</Text>
          <TextInput
            value={cal}
            onChangeText={setCal}
            keyboardType="number-pad"
            placeholderTextColor={T.muted}
            style={styles.input}
          />

          <View style={styles.macroRow}>
            <View style={styles.macroField}>
              <Text style={styles.label}>Carbs (g)</Text>
              <TextInput
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="decimal-pad"
                placeholderTextColor={T.muted}
                style={styles.input}
              />
            </View>
            <View style={styles.macroField}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                value={protein}
                onChangeText={setProtein}
                keyboardType="decimal-pad"
                placeholderTextColor={T.muted}
                style={styles.input}
              />
            </View>
            <View style={styles.macroField}>
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                value={fat}
                onChangeText={setFat}
                keyboardType="decimal-pad"
                placeholderTextColor={T.muted}
                style={styles.input}
              />
            </View>
          </View>

          {addMeal.isError && (
            <Text style={styles.error}>
              Couldn't save that meal — try again.
            </Text>
          )}

          <PressableScale
            onPress={handleSave}
            disabled={!canSubmit}
            style={[
              styles.submitPressable,
              !canSubmit && styles.submitDisabled,
            ]}
          >
            <View style={styles.submitBtn}>
              <Text style={styles.submitText}>
                {addMeal.isPending ? "Saving…" : "Save meal"}
              </Text>
            </View>
          </PressableScale>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: T.glass,
      borderWidth: 0.5,
      borderColor: T.glassBorder,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 10,
      elevation: 1,
    },
    headerTitle: { fontFamily: T.display, fontSize: 17, color: T.white },
    centerFill: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 30,
      gap: 6,
    },
    captureRing: {
      width: 84,
      height: 84,
      borderRadius: 42,
      borderWidth: 1.5,
      borderColor: T.ringBorder,
      backgroundColor: T.ringGlass,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },
    hint: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.muted,
      textAlign: "center",
      lineHeight: 19,
      marginBottom: 22,
    },
    captureBtnPressable: { borderRadius: 17, marginTop: 8 },
    captureBtn: {
      backgroundColor: T.accent,
      borderRadius: 17,
      paddingVertical: 14,
      paddingHorizontal: 28,
    },
    captureBtnText: { fontFamily: T.bodyBold, fontSize: 14, color: T.onAccent },
    error: {
      fontFamily: T.bodyMed,
      fontSize: 12.5,
      color: T.badge,
      textAlign: "center",
      marginBottom: 14,
    },
    analyzePreviewWrap: {
      width: 168,
      height: 168,
      borderRadius: 28,
      marginBottom: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    analyzePreview: {
      width: 148,
      height: 148,
      borderRadius: 24,
    },
    analyzeGlow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 28,
      borderWidth: 2,
    },
    analyzeIconBadge: {
      position: "absolute",
      bottom: -2,
      right: -2,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: T.bgElevated,
      borderWidth: 1,
      borderColor: T.glassBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    analyzeTitle: {
      fontFamily: T.display,
      fontSize: 20,
      color: T.white,
      textAlign: "center",
      marginBottom: 6,
    },
    analyzeSub: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.muted,
      textAlign: "center",
    },
    cameraRoot: {
      flex: 1,
      backgroundColor: "#000",
    },
    cameraTopBar: {
      position: "absolute",
      top: 0,
      left: 16,
      right: 16,
      zIndex: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    camClose: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
    },
    camTitle: {
      fontFamily: T.bodySemi,
      fontSize: 14,
      color: "#FFFFFF",
      letterSpacing: 0.2,
    },
    focusFrame: {
      position: "absolute",
      alignSelf: "center",
      top: "22%",
      width: "78%",
      aspectRatio: 1,
      zIndex: 3,
      alignItems: "center",
      justifyContent: "center",
    },
    focusCrosshair: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.55)",
    },
    focusHint: {
      position: "absolute",
      bottom: -36,
      fontFamily: T.bodyMed,
      fontSize: 12.5,
      color: "rgba(255,255,255,0.82)",
      textAlign: "center",
    },
    cameraBottom: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      zIndex: 4,
    },
    shutterOuter: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 4,
      borderColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.12)",
    },
    shutterInner: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: "#FFFFFF",
    },
    content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 60, gap: 6 },
    previewWrap: { borderRadius: 22, overflow: "hidden", marginBottom: 6 },
    preview: { width: "100%", height: 200 },
    retakeBtn: {
      position: "absolute",
      top: 12,
      right: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: T.onImageGlass,
      borderWidth: 1,
      borderColor: T.onImageBorder,
      borderRadius: 999,
      paddingVertical: 7,
      paddingHorizontal: 12,
    },
    retakeText: { fontFamily: T.bodySemi, fontSize: 11, color: T.onImage },
    label: {
      fontFamily: T.bodySemi,
      fontSize: 11.5,
      color: T.muted,
      marginTop: 14,
      marginBottom: 8,
    },
    slotRow: { flexDirection: "row", gap: 8 },
    slotPressable: { flex: 1, borderRadius: 13 },
    slotChip: {
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 13,
      backgroundColor: T.glass,
      borderWidth: 0.5,
      borderColor: T.glassBorder,
    },
    slotChipActive: { backgroundColor: T.accent, borderColor: T.accent },
    slotText: { fontFamily: T.bodySemi, fontSize: 11.5, color: T.white },
    slotTextActive: { color: T.onAccent },
    input: {
      backgroundColor: T.glass,
      borderWidth: 0.5,
      borderColor: T.glassBorder,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontFamily: T.bodyMed,
      fontSize: 14,
      color: T.white,
    },
    macroRow: { flexDirection: "row", gap: 10 },
    macroField: { flex: 1 },
    submitPressable: { borderRadius: 17, marginTop: 24 },
    submitDisabled: { opacity: 0.4 },
    submitBtn: {
      backgroundColor: T.accent,
      borderRadius: 17,
      paddingVertical: 15,
      alignItems: "center",
    },
    submitText: { fontFamily: T.bodyBold, fontSize: 14, color: T.onAccent },
  });
}
