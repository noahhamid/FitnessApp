import { View } from "react-native";
import { SectionTitle, WorkoutRow } from "./DashboardComponents";
import { COLORS } from "@/src/theme";

type Props = { onSeeAll?: () => void };

export function TodaySession({ onSeeAll }: Props) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
      <SectionTitle title="TODAY'S PLAN" action="See all →" onAction={onSeeAll} />
      <WorkoutRow
        title="Upper Body Strength"
        duration="45 min"
        sets="5 exercises"
        tag="STRENGTH"
        tagColor={COLORS.accent}
      />
      <WorkoutRow
        title="HIIT Cardio Blast"
        duration="20 min"
        sets="8 rounds"
        tag="CARDIO"
        tagColor={COLORS.orange}
      />
      <WorkoutRow
        title="Core & Mobility"
        duration="15 min"
        sets="4 exercises"
        tag="RECOVERY"
        tagColor={COLORS.blue}
      />
    </View>
  );
}
