import { View, Text, Modal, TextInput, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useState } from 'react';
import { COLORS, MEAL_LOG, FOOD_SEARCH, NUTRITION_GOALS } from "@/src/theme";
import { ProgressCircle } from './ProgressCircle';
import { MacroBar } from './MacroBar';
import { SectionHeader, PrimaryButton } from './StatsCard';

const { width: SW } = Dimensions.get('window');

export function CaloriesSection() {
  const [showAddFood, setShowAddFood] = useState(false);
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('Breakfast');

  // Calculate totals
  const totalCal = MEAL_LOG.reduce((a, m) => a + m.cal, 0);
  const remaining = NUTRITION_GOALS.calories - totalCal;
  const pct = Math.round((totalCal / NUTRITION_GOALS.calories) * 100);

  const totalP = MEAL_LOG.reduce((a, m) => a + m.protein, 0);
  const totalC = MEAL_LOG.reduce((a, m) => a + m.carbs, 0);
  const totalF = MEAL_LOG.reduce((a, m) => a + m.fat, 0);

  const filtered = FOOD_SEARCH.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Hero section with ring and stats */}
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
        <ProgressCircle
          pct={pct}
          size={130}
          stroke={13}
          color={pct > 90 ? COLORS.red : COLORS.accent}
          label={`${totalCal}`}
          sub="KCAL EATEN"
        />

        {/* Side stats */}
        <View style={{ flex: 1, justifyContent: 'center', gap: 12 }}>
          <View>
            <Text style={{ fontSize: 12, color: COLORS.muted }}>Goal</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>
              {NUTRITION_GOALS.calories}
              <Text style={{ fontSize: 12, color: COLORS.muted }}> kcal</Text>
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 12, color: COLORS.muted }}>Remaining</Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: remaining < 0 ? COLORS.red : COLORS.accent,
              }}
            >
              {Math.max(remaining, 0)}
              <Text style={{ fontSize: 12, color: COLORS.muted }}> kcal</Text>
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 12, color: COLORS.muted }}>Burned</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.orange }}>
              {NUTRITION_GOALS.caloriesBurned}
              <Text style={{ fontSize: 12, color: COLORS.muted }}> kcal</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Macro bars */}
      <View style={{ backgroundColor: COLORS.card, padding: 16, borderRadius: 12, marginBottom: 24 }}>
        <MacroBar label="Protein" current={totalP} goal={NUTRITION_GOALS.protein} color={COLORS.blue} />
        <MacroBar label="Carbs" current={totalC} goal={NUTRITION_GOALS.carbs} color={COLORS.orange} />
        <MacroBar label="Fat" current={totalF} goal={NUTRITION_GOALS.fat} color={COLORS.red} />
      </View>

      {/* Today's meals */}
      <SectionHeader
        title="Today's Meals"
        action="+ Add Food"
        onAction={() => setShowAddFood(true)}
      />

      {['Breakfast', 'Snack', 'Lunch', 'Dinner'].map((mealGroup) => {
        const items = MEAL_LOG.filter((m) => m.meal === mealGroup);
        if (!items.length) return null;

        const groupCal = items.reduce((a, m) => a + m.cal, 0);

        return (
          <View key={mealGroup} style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>
                {mealGroup}
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.accent }}>{groupCal} kcal</Text>
            </View>

            {items.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.muted2,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: '500' }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
                    P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.accent }}>
                    {item.cal}
                  </Text>
                  <Text style={{ fontSize: 10, color: COLORS.muted }}>kcal</Text>
                </View>
              </View>
            ))}
          </View>
        );
      })}

      {/* Add food modal */}
      <Modal visible={showAddFood} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: COLORS.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              maxHeight: '90%',
            }}
          >
            {/* Handle */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: COLORS.border,
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />

            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 }}>
              ADD FOOD
            </Text>

            {/* Meal type selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['Breakfast', 'Snack', 'Lunch', 'Dinner'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setMealType(t)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: mealType === t ? COLORS.accent : COLORS.bg2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: mealType === t ? '600' : '500',
                        color: mealType === t ? COLORS.bg : COLORS.text,
                      }}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Search box */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.bg2,
                borderRadius: 10,
                paddingHorizontal: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search food..."
                placeholderTextColor={COLORS.muted}
                style={{ flex: 1, paddingVertical: 12, color: COLORS.text }}
              />
            </View>

            {/* Food list */}
            <FlatList
              data={filtered}
              keyExtractor={(i) => i.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                  }}
                  onPress={() => setShowAddFood(false)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: '500' }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                      P:{item.protein}g · C:{item.carbs}g · F:{item.fat}g
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.accent }}>
                    {item.cal} kcal
                  </Text>
                </TouchableOpacity>
              )}
            />

            <PrimaryButton
              label="CLOSE"
              onPress={() => setShowAddFood(false)}
              outline
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}