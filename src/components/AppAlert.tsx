import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

export type AppAlertButton = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

export type AppAlertOptions = {
  cancelable?: boolean;
  onDismiss?: () => void;
};

type AlertRequest = {
  title: string;
  message?: string;
  buttons: AppAlertButton[];
  options?: AppAlertOptions;
};

type ShowAlert = (
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  options?: AppAlertOptions,
) => void;

const AppAlertContext = createContext<ShowAlert | null>(null);

let presenter: ShowAlert | null = null;

function normalizeButtons(buttons?: AppAlertButton[]): AppAlertButton[] {
  if (!buttons || buttons.length === 0) {
    return [{ text: "OK", style: "default" }];
  }
  return buttons;
}

/**
 * Drop-in for `Alert.alert`. Uses the themed card when `AppAlertProvider`
 * is mounted; otherwise falls back to the system dialog.
 */
export function appAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  options?: AppAlertOptions,
): void {
  if (presenter) {
    presenter(title, message, buttons, options);
    return;
  }
  Alert.alert(
    title,
    message,
    buttons as Parameters<typeof Alert.alert>[2],
    options as Parameters<typeof Alert.alert>[3],
  );
}

export function useAppAlert(): ShowAlert {
  const ctx = useContext(AppAlertContext);
  return ctx ?? appAlert;
}

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<AlertRequest | null>(null);

  const show = useCallback<ShowAlert>((title, message, buttons, options) => {
    setRequest({
      title,
      message,
      buttons: normalizeButtons(buttons),
      options,
    });
  }, []);

  useEffect(() => {
    presenter = show;
    return () => {
      if (presenter === show) presenter = null;
    };
  }, [show]);

  const runButton = useCallback((button: AppAlertButton) => {
    setRequest(null);
    button.onPress?.();
  }, []);

  const onBackdrop = useCallback(() => {
    setRequest((current) => {
      if (!current) return null;
      if (current.options?.cancelable === false) return current;
      current.options?.onDismiss?.();
      return null;
    });
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <AppAlertContext.Provider value={value}>
      {children}
      <AppAlertDialog
        request={request}
        onBackdrop={onBackdrop}
        onButton={runButton}
      />
    </AppAlertContext.Provider>
  );
}

function AppAlertDialog({
  request,
  onBackdrop,
  onButton,
}: {
  request: AlertRequest | null;
  onBackdrop: () => void;
  onButton: (button: AppAlertButton) => void;
}) {
  const { styles } = useThemedStyles(makeStyles);
  const visible = request != null;
  const buttons = request?.buttons ?? [];
  const sideBySide = buttons.length === 2;

  const primary =
    buttons.find((b) => b.style === "destructive") ??
    buttons.find((b) => b.style !== "cancel") ??
    buttons[buttons.length - 1];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onBackdrop}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onBackdrop} />
        {request ? (
          <View style={styles.card} accessibilityRole="alert">
            <Text style={styles.title}>{request.title}</Text>
            {request.message ? (
              <Text style={styles.message}>{request.message}</Text>
            ) : null}

            <View
              style={[
                styles.actions,
                sideBySide ? styles.actionsRow : styles.actionsStack,
              ]}
            >
              {buttons.map((button) => {
                const isCancel = button.style === "cancel";
                const isDestructive = button.style === "destructive";
                const isPrimary = button === primary && !isCancel;
                return (
                  <Pressable
                    key={`${button.text}-${button.style ?? "default"}`}
                    accessibilityRole="button"
                    onPress={() => onButton(button)}
                    style={({ pressed }) => [
                      styles.btn,
                      sideBySide && styles.btnFlex,
                      isCancel && styles.btnCancel,
                      isPrimary && !isDestructive && styles.btnPrimary,
                      isDestructive && styles.btnDestructive,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        isCancel && styles.btnTextCancel,
                        (isPrimary || isDestructive) && styles.btnTextOnAccent,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(10,10,10,0.52)",
      justifyContent: "center",
      paddingHorizontal: 28,
    },
    card: {
      backgroundColor: T.bgElevated,
      borderRadius: T.radius.xl,
      paddingHorizontal: T.space.xl,
      paddingTop: T.space.xl,
      paddingBottom: T.space.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.border,
      ...T.shadow.lifted,
    },
    title: {
      fontFamily: T.displaySemi,
      fontSize: 20,
      lineHeight: 26,
      color: T.text,
      textAlign: "center",
    },
    message: {
      fontFamily: T.body,
      fontSize: 14,
      lineHeight: 21,
      color: T.muted,
      textAlign: "center",
      marginTop: T.space.sm,
    },
    actions: {
      marginTop: T.space.xl,
      gap: T.space.sm,
    },
    actionsRow: {
      flexDirection: "row",
    },
    actionsStack: {
      flexDirection: "column",
    },
    btn: {
      minHeight: 48,
      borderRadius: T.radius.pill,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: T.space.lg,
    },
    btnFlex: {
      flex: 1,
    },
    btnCancel: {
      backgroundColor: T.accentTint,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.border,
    },
    btnPrimary: {
      backgroundColor: T.accent,
    },
    btnDestructive: {
      backgroundColor: T.accent,
    },
    btnPressed: {
      opacity: 0.88,
    },
    btnText: {
      fontFamily: T.bodySemi,
      fontSize: 15,
      color: T.text,
    },
    btnTextCancel: {
      color: T.text,
    },
    btnTextOnAccent: {
      color: T.onAccent,
    },
  });
}
