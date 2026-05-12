import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { COLORS, WEIGHT_LOG, WEIGHT_GOAL } from "@/src/theme";
import { StatsCard, PrimaryButton, SectionHeader } from './StatsCard';

const { width: SW } = Dimensions.get('window');

export function WeightSection() {
  const [showLogModal, setShowLogModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [unit, setUnit] = useState('kg');

  // Calculate metrics
  const current = WEIGHT_LOG[WEIGHT_LOG.length - 1].w;
  const start = WEIGHT_LOG[0].w;
  const lost = (start - current).toFixed(1);
  const toGo = (current - WEIGHT_GOAL).toFixed(1);
  const progress = Math.round(((start - current) / (start - WEIGHT_GOAL)) * 100);

  // Chart dimensions
  const chartW = SW - 48;
  const chartH = 120;
  const weights = WEIGHT_LOG.map((d) => d.w);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;

  // Calculate points for line chart
  const pts = WEIGHT_LOG.map((d, i) => ({
    x: (i / (WEIGHT_LOG.length - 1)) * (chartW - 24) + 12,
    y: chartH - 16 - ((d.w - minW) / (maxW - minW)) * (chartH - 32),
    w: d.w,
    date: d.date,
  }));

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Summary cards */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
        <View style={{ width: '50%', paddingHorizontal: 8, marginBottom: 16 }}>
          <StatsCard label="Current" value={current} unit="kg" color={COLORS.text} />
        </View>
        <View style={{ width: '50%', paddingHorizontal: 8, marginBottom: 16 }}>
          <StatsCard label="Lost" value={`-${lost}`} unit="kg" color={COLORS.accent} />
        </View>
        <View style={{ width: '50%', paddingHorizontal: 8, marginBottom: 16 }}>
          <StatsCard label="To Goal" value={toGo} unit="kg" color={COLORS.orange} />
        </View>
        <View style={{ width: '50%', paddingHorizontal: 8, marginBottom: 16 }}>
          <StatsCard label="Progress" value={progress} unit="%" color={COLORS.blue} />
        </View>
      </View>

      {/* Goal progress bar */}
      <View
        style={{
          backgroundColor: COLORS.card,
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text }}>GOAL PROGRESS</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.accent }}>{progress}%</Text>
        </View>

        {/* Progress bar */}
        <View
          style={{
            height: 12,
            backgroundColor: COLORS.bg2,
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: 12,
          }}
        >
          <View
            style={{
              height: 12,
              width: `${progress}%`,
              backgroundColor: COLORS.accent,
              borderRadius: 6,
            }}
          />
        </View>

        {/* Start and goal labels */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, color: COLORS.muted }}>{start} kg start</Text>
          <Text style={{ fontSize: 11, color: COLORS.muted }}>goal {WEIGHT_GOAL} kg</Text>
        </View>
      </View>

      {/* Weight trend chart */}
      <View style={{ backgroundColor: COLORS.card, padding: 16, borderRadius: 12, marginBottom: 24 }}>
        <SectionHeader title="Weight Trend" />

        <View style={{ height: chartH, marginTop: 12 }}>
          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((frac, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: frac * (chartH - 16),
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: COLORS.border,
              }}
            />
          ))}

          {/* Data points and lines */}
          {pts.map((pt, i) => (
            <View key={i}>
              {/* Line to next point */}
              {i < pts.length - 1 && (() => {
                const next = pts[i + 1];
                const dx = next.x - pt.x;
                const dy = next.y - pt.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                return (
                  <View
                    style={{
                      position: 'absolute',
                      left: pt.x,
                      top: pt.y,
                      width: len,
                      height: 2,
                      backgroundColor: COLORS.accent + '88',
                      transform: [{ rotate: `${angle}deg` }],
                      transformOrigin: '0 0',
                    }}
                  />
                );
              })()}

              {/* Dot */}
              <View
                style={{
                  position: 'absolute',
                  left: pt.x - (i === pts.length - 1 ? 6 : 4),
                  top: pt.y - (i === pts.length - 1 ? 6 : 4),
                  width: i === pts.length - 1 ? 12 : 8,
                  height: i === pts.length - 1 ? 12 : 8,
                  borderRadius: i === pts.length - 1 ? 6 : 4,
                  backgroundColor: i === pts.length - 1 ? COLORS.accent : COLORS.bg3,
                  borderWidth: 2,
                  borderColor: COLORS.accent,
                  shadowColor: i === pts.length - 1 ? COLORS.accent : 'transparent',
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 0 },
                }}
              />

              {/* Latest weight label */}
              {i === pts.length - 1 && (
                <Text
                  style={{
                    position: 'absolute',
                    left: pt.x - 20,
                    top: pt.y - 22,
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: COLORS.accent,
                  }}
                >
                  {pt.w} kg
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* X-axis dates */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          {WEIGHT_LOG.filter((_, i) => i % 2 === 0).map((d) => (
            <Text key={d.date} style={{ fontSize: 10, color: COLORS.muted }}>
              {d.date.split(' ')[1]}
            </Text>
          ))}
        </View>
      </View>

      {/* Log button */}
      <PrimaryButton
        label="⚖️  LOG TODAY'S WEIGHT"
        onPress={() => setShowLogModal(true)}
      />

      {/* Weight history */}
      <SectionHeader title="History" />
      {[...WEIGHT_LOG].reverse().map((entry, i) => {
        const prev = WEIGHT_LOG[WEIGHT_LOG.length - 1 - i - 1];
        const diff = prev ? (entry.w - prev.w).toFixed(1) : null;

        return (
          <View
            key={entry.date}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.accent,
                marginRight: 12,
              }}
            />
            <Text style={{ flex: 1, fontSize: 13, color: COLORS.text }}>{entry.date}</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.text }}>
              {entry.w} kg
            </Text>
            {diff && (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: parseFloat(diff) < 0 ? COLORS.accent : COLORS.red,
                  marginLeft: 12,
                }}
              >
                {parseFloat(diff) < 0 ? '↓' : '↑'} {Math.abs(diff)}
              </Text>
            )}
          </View>
        );
      })}

      <View style={{ height: 32 }} />

      {/* Log weight modal */}
      <Modal visible={showLogModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
            <View
              style={{
                backgroundColor: COLORS.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                paddingBottom: 40,
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
                LOG WEIGHT
              </Text>

              {/* Unit toggle */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                {['kg', 'lbs'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setUnit(u)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 10,
                      backgroundColor: unit === u ? COLORS.accent : COLORS.bg2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: unit === u ? COLORS.bg : COLORS.text,
                        textAlign: 'center',
                      }}
                    >
                      {u.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Input */}
              <View style={{ position: 'relative', marginBottom: 24 }}>
                <TextInput
                  value={newWeight}
                  onChangeText={setNewWeight}
                  placeholder={unit === 'kg' ? '82.0' : '180.0'}
                  placeholderTextColor={COLORS.muted}
                  keyboardType="decimal-pad"
                  style={{
                    fontSize: 18,
                    color: COLORS.text,
                    backgroundColor: COLORS.bg2,
                    borderWidth: 2,
                    borderColor: COLORS.border,
                    borderRadius: 10,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    textAlign: 'center',
                  }}
                  autoFocus
                />
                <Text
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: 14,
                    fontSize: 16,
                    fontWeight: '600',
                    color: COLORS.muted,
                  }}
                >
                  {unit}
                </Text>
              </View>

              {/* Buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    label="CANCEL"
                    onPress={() => setShowLogModal(false)}
                    outline
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    label="SAVE ENTRY"
                    onPress={() => {
                      setShowLogModal(false);
                      setNewWeight('');
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}