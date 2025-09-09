import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

interface LBRow {
  id: string;
  userName: string;
  score: number;
  state: string;
  zone: string;
  region: string;
}

const STATES = ['All', 'Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Telangana', 'West Bengal', 'Kerala', 'Tamil Nadu'];
const ZONES = ['All', 'North', 'South', 'East', 'West', 'Central'];
const REGIONS = ['All', 'Urban', 'Rural'];

const AdminLeaderboardScreen: React.FC = () => {
  const [selectedState, setSelectedState] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [data, setData] = useState<LBRow[]>([]);

  useEffect(() => {
    // Mock data - replace with API call
    const base: LBRow[] = Array.from({ length: 40 }, (_, i) => {
      const state = STATES[1 + (i % (STATES.length - 1))];
      const zone = ZONES[1 + (i % (ZONES.length - 1))];
      const region = REGIONS[1 + (i % (REGIONS.length - 1))];
      return {
        id: `${i + 1}`,
        userName: `User ${i + 1}`,
        score: Math.round(95 - (i * 0.9)),
        state,
        zone,
        region,
      };
    });
    setData(base);
  }, []);

  const filtered = useMemo(() => {
    let out = data.slice();
    if (selectedState !== 'All') out = out.filter(i => i.state === selectedState);
    if (selectedZone !== 'All') out = out.filter(i => i.zone === selectedZone);
    if (selectedRegion !== 'All') out = out.filter(i => i.region === selectedRegion);
    // Sort by score desc and assign implicit rank by index
    out.sort((a, b) => b.score - a.score);
    return out;
  }, [data, selectedState, selectedZone, selectedRegion]);

  const renderChip = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      style={[styles.chip, selected && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }: { item: LBRow; index: number }) => (
    <View style={styles.row}>
      <View style={styles.rankBox}>
        <Text style={styles.rankText}>#{index + 1}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.name} numberOfLines={1}>{item.userName}</Text>
        <Text style={styles.meta} numberOfLines={1}>{item.state} • {item.zone} • {item.region}</Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreText}>{item.score}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
      >
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Single column list with filters</Text>

        {/* Filters */}
        <View style={styles.filtersBlock}>
          <Text style={styles.filterLabel}>State</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STATES.map(s => renderChip(s, selectedState === s, () => setSelectedState(s)))}
          </ScrollView>
        </View>
        <View style={styles.filtersBlock}>
          <Text style={styles.filterLabel}>Zone</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ZONES.map(z => renderChip(z, selectedZone === z, () => setSelectedZone(z)))}
          </ScrollView>
        </View>
        <View style={[styles.filtersBlock, { marginBottom: SPACING.md }]}>
          <Text style={styles.filterLabel}>Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {REGIONS.map(r => renderChip(r, selectedRegion === r, () => setSelectedRegion(r)))}
          </ScrollView>
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="people" size={40} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No users found for selected filters</Text>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.lg },
  filtersBlock: { marginBottom: SPACING.md },
  filterLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },
  chipTextActive: { color: COLORS.white },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  rankBox: {
    width: 56,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rankText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  rowInfo: { flex: 1 },
  name: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  scoreBox: { marginLeft: SPACING.md },
  scoreText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.primary },
  separator: { height: SPACING.md },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xl },
  emptyText: { marginTop: SPACING.sm, color: COLORS.textSecondary },
});

export default AdminLeaderboardScreen;
