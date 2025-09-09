import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import LeaderboardCard from '../../components/common/LeaderboardCard';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { LeaderboardEntry } from '../../types';

const STATES = ['All', 'Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Telangana', 'West Bengal', 'Kerala', 'Tamil Nadu', 'NCR'];
const ZONES = ['All', 'North', 'South', 'East', 'West', 'Central'];
const REGIONS = ['All', 'Urban', 'Rural'];

const stateToZone: Record<string, string> = {
  Maharashtra: 'West',
  Gujarat: 'West',
  Delhi: 'North',
  NCR: 'North',
  Karnataka: 'South',
  Kerala: 'South',
  'Tamil Nadu': 'South',
  Telangana: 'South',
  'West Bengal': 'East',
};

const LeaderboardScreen: React.FC = () => {
  const { state } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    // Simulate API call
    const mockData: LeaderboardEntry[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Arjun Singh',
        userImage: undefined,
        score: 95.8,
        rank: 1,
        testId: '1',
        testName: 'Vertical Jump',
        location: 'Mumbai, Maharashtra',
        timestamp: new Date(),
      },
      {
        id: '2',
        userId: '2',
        userName: 'Priya Sharma',
        userImage: undefined,
        score: 94.2,
        rank: 2,
        testId: '1',
        testName: 'Vertical Jump',
        location: 'Delhi, NCR',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: '3',
        userId: '3',
        userName: 'Rahul Kumar',
        userImage: undefined,
        score: 92.7,
        rank: 3,
        testId: '1',
        testName: 'Vertical Jump',
        location: 'Bangalore, Karnataka',
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        id: '4',
        userId: '4',
        userName: 'Sneha Patel',
        userImage: undefined,
        score: 91.3,
        rank: 4,
        testId: '2',
        testName: 'Push-ups',
        location: 'Ahmedabad, Gujarat',
        timestamp: new Date(Date.now() - 10800000),
      },
      {
        id: '5',
        userId: '5',
        userName: 'Vikram Reddy',
        userImage: undefined,
        score: 89.9,
        rank: 5,
        testId: '3',
        testName: 'Agility Test',
        location: 'Hyderabad, Telangana',
        timestamp: new Date(Date.now() - 14400000),
      },
      {
        id: '6',
        userId: '6',
        userName: 'Ananya Das',
        userImage: undefined,
        score: 88.4,
        rank: 6,
        testId: '1',
        testName: 'Vertical Jump',
        location: 'Kolkata, West Bengal',
        timestamp: new Date(Date.now() - 18000000),
      },
      {
        id: '7',
        userId: '7',
        userName: 'Karthik Nair',
        userImage: undefined,
        score: 87.1,
        rank: 7,
        testId: '2',
        testName: 'Push-ups',
        location: 'Kochi, Kerala',
        timestamp: new Date(Date.now() - 21600000),
      },
      {
        id: '8',
        userId: '8',
        userName: 'Meera Joshi',
        userImage: undefined,
        score: 85.8,
        rank: 8,
        testId: '3',
        testName: 'Agility Test',
        location: 'Chennai, Tamil Nadu',
        timestamp: new Date(Date.now() - 25200000),
      },
    ];

    setLeaderboardData(mockData.concat(
      new Array(20).fill(null).map((_, i) => ({
        id: `mock-${i}`,
        userId: `mock-${i}`,
        userName: `Player ${i + 9}`,
        userImage: undefined,
        score: Math.max(60, 95 - i),
        rank: i + 9,
        testId: '1',
        testName: 'Vertical Jump',
        location: i % 2 === 0 ? 'Pune, Maharashtra' : 'Coimbatore, Tamil Nadu',
        timestamp: new Date(Date.now() - (i + 1) * 3600000),
      }))
    ));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
  };

  const parseState = (loc: string) => {
    const parts = loc.split(',').map(s => s.trim());
    return parts[1] || 'Unknown';
  };

  const deriveRegion = (entry: LeaderboardEntry): 'Urban' | 'Rural' => {
    // Mock logic: city names imply Urban
    const city = entry.location.split(',')[0].toLowerCase();
    const urbanCities = ['mumbai','delhi','bangalore','ahmedabad','hyderabad','kolkata','kochi','chennai','pune'];
    return urbanCities.includes(city) ? 'Urban' : 'Rural';
  };

  const filtered = useMemo(() => {
    let out = leaderboardData.slice();
    // Normalize by score (desc) and rank
    out.sort((a, b) => b.score - a.score);

    if (selectedState !== 'All') {
      out = out.filter(e => parseState(e.location) === selectedState);
    }

    if (selectedZone !== 'All') {
      out = out.filter(e => stateToZone[parseState(e.location)] === selectedZone);
    }

    if (selectedRegion !== 'All') {
      out = out.filter(e => deriveRegion(e) === selectedRegion);
    }

    // Re-assign rank sequentially for visual consistency after filters
    return out.map((e, idx) => ({ ...e, rank: idx + 1 }));
  }, [leaderboardData, selectedState, selectedZone, selectedRegion]);

  const renderChip = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity key={label} style={[styles.chip, selected && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>All users listed in a single column</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Single-column list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LeaderboardCard entry={item} showRank compact onPress={() => {}} />
          )}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.xs }} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: SPACING.lg, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.white },
  subtitle: { fontSize: FONT_SIZES.md, color: 'rgba(255, 255, 255, 0.9)', marginTop: SPACING.xs },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
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
});

export default LeaderboardScreen;
