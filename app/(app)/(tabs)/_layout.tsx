import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";

const T = {
  bg: "#121212",
  gold: "#FFC700",
  inactive: "#505050",
  border: "#FFFFFF08",
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconHome({ active }: { active: boolean }) {
  const c = active ? T.gold : T.inactive;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H15v-5h-6v5H4a1 1 0 01-1-1V10.5z"
        stroke={c}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function IconTrain({ active }: { active: boolean }) {
  const c = active ? T.gold : T.inactive;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Line
        x1="5.5"
        y1="12"
        x2="18.5"
        y2="12"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Rect
        x="2"
        y="9.5"
        width="3.5"
        height="5"
        rx="1"
        stroke={c}
        strokeWidth={1.6}
      />
      <Rect
        x="18.5"
        y="9.5"
        width="3.5"
        height="5"
        rx="1"
        stroke={c}
        strokeWidth={1.6}
      />
      <Rect
        x="5.5"
        y="8"
        width="3"
        height="8"
        rx="1.5"
        stroke={c}
        strokeWidth={1.6}
      />
      <Rect
        x="15.5"
        y="8"
        width="3"
        height="8"
        rx="1.5"
        stroke={c}
        strokeWidth={1.6}
      />
    </Svg>
  );
}

function IconNutrition({ active }: { active: boolean }) {
  const c = active ? T.bg : T.inactive;
  const w = 1.6;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 12.5C17 16.5 14.5 20 12 21C9.5 20 7 16.5 7 12.5C7 9 9 7 12 7C15 7 17 9 17 12.5Z"
        stroke={c}
        strokeWidth={w}
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 7C9.5 7 8 5.5 9 4"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
      />
      <Path
        d="M14.5 7C14.5 7 16 5.5 15 4"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
      />
      <Line
        x1="12"
        y1="7"
        x2="12"
        y2="5"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function IconProgress({ active }: { active: boolean }) {
  const c = active ? T.gold : T.inactive;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="3,18 8,12 13,15 21,5"
        stroke={c}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="21" cy="5" r={2} fill={c} />
    </Svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  const c = active ? T.gold : T.inactive;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.5" stroke={c} strokeWidth={1.6} />
      <Path
        d="M4 20c0-3.5 3.6-6.5 8-6.5s8 3 8 6.5"
        stroke={c}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

function Tab({
  icon,
  label,
  focused,
}: {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={s.tab}>
      {icon}
      <Text style={[s.label, focused && s.labelActive]}>{label}</Text>
    </View>
  );
}

// Center FAB — gold filled pill when active, dark surface when inactive
function CenterTab({ focused }: { focused: boolean }) {
  return (
    <View style={s.centerOuter}>
      <View style={[s.centerFab, focused && s.centerFabActive]}>
        <IconNutrition active={focused} />
      </View>
      <Text style={[s.label, focused && s.labelActive]}>Nutrition</Text>
    </View>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

const IS_IOS = Platform.OS === "ios";

export default function AppTabsLayout() {
  const insets = useSafeAreaInsets();
  // Respect the device's home indicator / gesture bar,
  // with a sensible minimum so the bar never feels cramped.
  const bottomPad = Math.max(insets.bottom, IS_IOS ? 16 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          s.tabBar,
          {
            paddingBottom: bottomPad,
            height: 52 + bottomPad, // icon area (52) + dynamic safe-area pad
          },
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Tab
              icon={<IconHome active={focused} />}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          tabBarIcon: ({ focused }) => (
            <Tab
              icon={<IconTrain active={focused} />}
              label="Train"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          tabBarIcon: ({ focused }) => <CenterTab focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused }) => (
            <Tab
              icon={<IconProgress active={focused} />}
              label="Progress"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <Tab
              icon={<IconProfile active={focused} />}
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: T.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: T.border,
    // height & paddingBottom are set dynamically above via useSafeAreaInsets.
    // paddingTop nudges icons down slightly so they sit centered & airy.
    paddingTop: 6,
    elevation: 0,
  },

  // Regular tab — icon + label stacked, bottom-aligned
  tab: {
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    width: 60,
    height: 46, // fixed inner height; bar height grows via bottomPad only
    paddingBottom: 4,
  },
  label: {
    fontFamily: "Inter_600SemiBold", // was "DMSans_500Medium" — never loaded anywhere, silently fell back to system font
    fontSize: 10,
    color: T.inactive,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: T.gold,
  },

  // Center FAB
  centerOuter: {
    alignItems: "center",
    gap: 5,
    marginTop: -18,
    width: 60,
  },
  centerFab: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
  },
  centerFabActive: {
    backgroundColor: T.gold,
  },
});
