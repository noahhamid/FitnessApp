import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg0: "#0A0A0C",
  bg2: "#1A1A20",
  lime: "#C8F135",
  muted: "#4A4A58",
  sub: "#6B6B7A",
  border: "#FFFFFF0D",
};

// ─── SVG icon components (24×24 viewBox, consistent stroke weight) ────────────

function IconHome({ active }: { active: boolean }) {
  const stroke = active ? T.lime : T.sub;
  const sw = active ? 1.8 : 1.5;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H15v-5h-6v5H4a1 1 0 01-1-1V10.5z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={active ? T.lime + "22" : "none"}
      />
    </Svg>
  );
}

function IconTrain({ active }: { active: boolean }) {
  const stroke = active ? T.lime : T.sub;
  const sw = active ? 1.8 : 1.5;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Line
        x1="5.5"
        y1="12"
        x2="18.5"
        y2="12"
        stroke={stroke}
        strokeWidth={sw + 0.2}
        strokeLinecap="round"
      />
      <Rect
        x="2"
        y="9.5"
        width="3.5"
        height="5"
        rx="1"
        stroke={stroke}
        strokeWidth={sw}
        fill={active ? T.lime + "22" : "none"}
      />
      <Rect
        x="18.5"
        y="9.5"
        width="3.5"
        height="5"
        rx="1"
        stroke={stroke}
        strokeWidth={sw}
        fill={active ? T.lime + "22" : "none"}
      />
      <Rect
        x="5.5"
        y="8"
        width="3"
        height="8"
        rx="1.5"
        stroke={stroke}
        strokeWidth={sw}
        fill={active ? T.lime + "22" : "none"}
      />
      <Rect
        x="15.5"
        y="8"
        width="3"
        height="8"
        rx="1.5"
        stroke={stroke}
        strokeWidth={sw}
        fill={active ? T.lime + "22" : "none"}
      />
    </Svg>
  );
}

function IconNutrition({ active }: { active: boolean }) {
  // Apple icon — rendered white on lime when active, muted when not
  const stroke = active ? T.bg0 : T.sub;
  const sw = active ? 1.8 : 1.5;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {/* Apple body */}
      <Path
        d="M17 12.5C17 16.5 14.5 20 12 21C9.5 20 7 16.5 7 12.5C7 9 9 7 12 7C15 7 17 9 17 12.5Z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        fill="none"
      />
      {/* Dip at top */}
      <Path
        d="M9.5 7C9.5 7 8 5.5 9 4"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path
        d="M14.5 7C14.5 7 16 5.5 15 4"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* Stem */}
      <Line
        x1="12"
        y1="7"
        x2="12"
        y2="5"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* Leaf */}
      <Path
        d="M12 5C12 5 13.5 3.5 15 4.5"
        stroke={stroke}
        strokeWidth={sw - 0.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function IconProgress({ active }: { active: boolean }) {
  const stroke = active ? T.lime : T.sub;
  const sw = active ? 1.8 : 1.5;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="3,18 8,12 13,15 21,5"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="8" cy="12" r={active ? 2 : 1.6} fill={stroke} />
      <Circle cx="13" cy="15" r={active ? 2 : 1.6} fill={stroke} />
      <Circle cx="21" cy="5" r={active ? 2 : 1.6} fill={stroke} />
      <Line
        x1="3"
        y1="21"
        x2="21"
        y2="21"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.35}
      />
    </Svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  const stroke = active ? T.lime : T.sub;
  const sw = active ? 1.8 : 1.5;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="8"
        r="3.5"
        stroke={stroke}
        strokeWidth={sw}
        fill={active ? T.lime + "22" : "none"}
      />
      <Path
        d="M4 20c0-3.5 3.6-6.5 8-6.5s8 3 8 6.5"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Tab wrapper ──────────────────────────────────────────────────────────────

type TabIconProps = {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
  isCenter?: boolean;
};

function TabIcon({ icon, label, focused, isCenter }: TabIconProps) {
  if (isCenter) {
    return (
      <View style={s.centerWrap}>
        <View style={[s.centerBtn, focused && s.centerBtnActive]}>{icon}</View>
        <Text style={[s.label, focused && s.labelActive]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={s.tabWrap}>
      <View style={[s.iconBg, focused && s.iconBgActive]}>{icon}</View>
      <Text style={[s.label, focused && s.labelActive]}>{label}</Text>
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: s.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
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
            <TabIcon
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
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={<IconNutrition active={focused} />}
              label="Nutrition"
              focused={focused}
              isCenter
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
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
            <TabIcon
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

const TAB_H = Platform.OS === "ios" ? 80 : 64;

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: T.bg0,
    borderTopWidth: 0.5,
    borderTopColor: T.border,
    height: TAB_H,
    paddingBottom: Platform.OS === "ios" ? 20 : 4,
    paddingTop: 0,
    elevation: 0,
  },

  // ── Regular tab ──────────────────────────────────────────────────────────────
  tabWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    width: 52,
    height: "100%",
    paddingBottom: 4,
  },
  iconBg: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconBgActive: {
    backgroundColor: T.lime + "15",
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
  },
  labelActive: {
    color: T.lime,
    fontFamily: "DMSans_600SemiBold",
  },

  // ── Center tab ───────────────────────────────────────────────────────────────
  centerWrap: {
    alignItems: "center",
    gap: 5,
    marginTop: -12, // lifts it above bar level
    width: 56,
  },
  centerBtn: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: "#FFFFFF14",
    alignItems: "center",
    justifyContent: "center",
  },
  centerBtnActive: {
    backgroundColor: T.lime,
    borderColor: T.lime,
  },
});
