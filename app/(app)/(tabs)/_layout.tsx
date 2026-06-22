import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";

const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#242429",
  lime: "#C8F135",
  limeDim: "#C8F13520",
  sub: "#52525F",
  text: "#F2F2F5",
  border: "#FFFFFF0C",
  borderUp: "#FFFFFF18",
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconHome({ active }: { active: boolean }) {
  const c = active ? T.lime : T.sub;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H15v-5h-6v5H4a1 1 0 01-1-1V10.5z"
        stroke={c}
        strokeWidth={active ? 1.8 : 1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={active ? T.lime + "25" : "none"}
      />
    </Svg>
  );
}

function IconTrain({ active }: { active: boolean }) {
  const c = active ? T.lime : T.sub;
  const w = active ? 1.8 : 1.5;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Line
        x1="5.5"
        y1="12"
        x2="18.5"
        y2="12"
        stroke={c}
        strokeWidth={w + 0.2}
        strokeLinecap="round"
      />
      <Rect
        x="2"
        y="9.5"
        width="3.5"
        height="5"
        rx="1"
        stroke={c}
        strokeWidth={w}
        fill={active ? T.lime + "25" : "none"}
      />
      <Rect
        x="18.5"
        y="9.5"
        width="3.5"
        height="5"
        rx="1"
        stroke={c}
        strokeWidth={w}
        fill={active ? T.lime + "25" : "none"}
      />
      <Rect
        x="5.5"
        y="8"
        width="3"
        height="8"
        rx="1.5"
        stroke={c}
        strokeWidth={w}
        fill={active ? T.lime + "25" : "none"}
      />
      <Rect
        x="15.5"
        y="8"
        width="3"
        height="8"
        rx="1.5"
        stroke={c}
        strokeWidth={w}
        fill={active ? T.lime + "25" : "none"}
      />
    </Svg>
  );
}

function IconNutrition({ active }: { active: boolean }) {
  const c = active ? T.bg0 : T.sub;
  const w = active ? 1.8 : 1.5;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
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
      <Path
        d="M12 5C12 5 13.5 3.5 15 4.5"
        stroke={c}
        strokeWidth={w - 0.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function IconProgress({ active }: { active: boolean }) {
  const c = active ? T.lime : T.sub;
  const w = active ? 1.8 : 1.5;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="3,18 8,12 13,15 21,5"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="8" cy="12" r={active ? 2 : 1.5} fill={c} />
      <Circle cx="13" cy="15" r={active ? 2 : 1.5} fill={c} />
      <Circle cx="21" cy="5" r={active ? 2 : 1.5} fill={c} />
      <Line
        x1="3"
        y1="21"
        x2="21"
        y2="21"
        stroke={c}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.25}
      />
    </Svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  const c = active ? T.lime : T.sub;
  const w = active ? 1.8 : 1.5;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="8"
        r="3.5"
        stroke={c}
        strokeWidth={w}
        fill={active ? T.lime + "25" : "none"}
      />
      <Path
        d="M4 20c0-3.5 3.6-6.5 8-6.5s8 3 8 6.5"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Tab components ───────────────────────────────────────────────────────────

function RegularTab({
  icon,
  label,
  focused,
}: {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={s.tabWrap}>
      <View style={[s.topLine, focused && s.topLineActive]} />
      <View style={[s.iconWrap, focused && s.iconWrapActive]}>{icon}</View>
      <Text style={[s.label, focused && s.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function CenterTab({ focused }: { focused: boolean }) {
  return (
    <View style={s.centerOuter}>
      <View style={[s.centerFab, focused && s.centerFabActive]}>
        <IconNutrition active={focused} />
      </View>
      <Text style={[s.label, focused && s.labelActive]} numberOfLines={1}>
        Nutrition
      </Text>
    </View>
  );
}

// ─── Root layout ──────────────────────────────────────────────────────────────

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
            <RegularTab
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
            <RegularTab
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
            <RegularTab
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
            <RegularTab
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

const IS_IOS = Platform.OS === "ios";
const TAB_H = IS_IOS ? 84 : 68;

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: T.bg1,
    borderTopWidth: 1,
    borderTopColor: T.borderUp,
    height: TAB_H,
    paddingBottom: IS_IOS ? 24 : 8,
    paddingTop: 0,
    elevation: 0,
  },

  // Regular tab
  tabWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 4,
    gap: 5,
    width: 60,
    height: "100%",
    position: "relative",
  },
  topLine: {
    position: "absolute",
    top: -1,
    width: 24,
    height: 2,
    borderRadius: 0,
    backgroundColor: "transparent",
  },
  topLineActive: {
    backgroundColor: T.lime,
  },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapActive: {
    backgroundColor: T.limeDim,
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.sub,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: T.lime,
    fontFamily: "DMSans_600SemiBold",
  },

  // Center FAB
  centerOuter: {
    alignItems: "center",
    gap: 5,
    marginTop: -18,
    width: 60,
  },
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.borderUp,
    alignItems: "center",
    justifyContent: "center",
  },
  centerFabActive: {
    backgroundColor: T.lime,
    borderColor: T.lime,
  },
});
