import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { SKU_LABEL, skuDisplayPrice, type PremiumSku } from "./skus";
import type { StoreProduct } from "./IapContext";

type Props = {
  visible: boolean;
  C: OnboardingColors;
  products: StoreProduct[];
  selectedSku: PremiumSku;
  onSelectSku: (sku: PremiumSku) => void;
  onPurchase: () => void;
  onRestore: () => void;
  onDismiss: () => void;
  purchasing: boolean;
  restoring: boolean;
  error: string | null;
  skuOrder: PremiumSku[];
};

export function FloatingPaywall({
  visible,
  C,
  products,
  selectedSku,
  onSelectSku,
  onPurchase,
  onRestore,
  onDismiss,
  purchasing,
  restoring,
  error,
  skuOrder,
}: Props) {
  const busy = purchasing || restoring;
  const styles = makeStyles(C);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Not now"
            hitSlop={10}
            style={styles.close}
            onPress={onDismiss}
          >
            <X size={18} color={C.muted} strokeWidth={2.2} />
          </Pressable>

          <Text style={styles.kicker}>LAST CHANCE</Text>
          <Text style={styles.title}>Unlock Pro</Text>
          <Text style={styles.body}>
            Save workouts, scan meals, apply adaptive calories, and log
            conditioning. Browsing the app stays free.
          </Text>

          <View style={styles.skus}>
            {skuOrder.map((sku) => {
              const product = products.find((item) => item.id === sku);
              const active = selectedSku === sku;
              return (
                <Pressable
                  key={sku}
                  onPress={() => onSelectSku(sku)}
                  style={[styles.sku, active && styles.skuActive]}
                >
                  <Text style={[styles.skuLabel, active && styles.skuLabelActive]}>
                    {SKU_LABEL[sku]}
                  </Text>
                  <Text style={[styles.skuPrice, active && styles.skuLabelActive]}>
                    {skuDisplayPrice(sku, product?.displayPrice)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            style={[styles.cta, busy && styles.disabled]}
            onPress={onPurchase}
          >
            {purchasing ? (
              <ActivityIndicator color={C.onAccent} size="small" />
            ) : (
              <Text style={styles.ctaText}>
                {`SUBSCRIBE · ${skuDisplayPrice(
                  selectedSku,
                  products.find((item) => item.id === selectedSku)?.displayPrice,
                )}`}
              </Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={onRestore}
            style={styles.restore}
          >
            <Text style={styles.restoreText}>
              {restoring ? "Restoring…" : "Restore purchases"}
            </Text>
          </Pressable>

          <Pressable onPress={onDismiss} disabled={busy} style={styles.skip}>
            <Text style={styles.skipText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      paddingHorizontal: 22,
    },
    card: {
      backgroundColor: C.bg,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
    },
    close: {
      alignSelf: "flex-end",
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.card,
    },
    kicker: {
      fontFamily: FONTS.blackItalic,
      fontSize: 12,
      letterSpacing: 2,
      color: C.accent,
      textAlign: "center",
      marginTop: 4,
    },
    title: {
      fontFamily: FONTS.blackItalic,
      fontSize: 24,
      color: C.text,
      textAlign: "center",
      marginTop: 8,
      textTransform: "uppercase",
    },
    body: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      lineHeight: 18,
      color: C.muted,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 16,
    },
    skus: { gap: 8, marginBottom: 14 },
    sku: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: C.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
    },
    skuActive: {
      borderColor: C.accent,
    },
    skuLabel: {
      fontFamily: FONTS.semiBold,
      fontSize: 14,
      color: C.text,
    },
    skuLabelActive: { color: C.accent },
    skuPrice: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: C.muted,
    },
    error: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: C.red,
      textAlign: "center",
      marginBottom: 10,
    },
    cta: {
      backgroundColor: C.accent,
      borderRadius: 999,
      paddingVertical: 15,
      alignItems: "center",
    },
    disabled: { opacity: 0.55 },
    ctaText: {
      fontFamily: FONTS.blackItalic,
      fontSize: 15,
      letterSpacing: 1,
      color: C.onAccent,
    },
    restore: { alignItems: "center", marginTop: 12 },
    restoreText: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: C.text,
    },
    skip: { alignItems: "center", marginTop: 10 },
    skipText: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: C.muted2,
    },
  });
}
