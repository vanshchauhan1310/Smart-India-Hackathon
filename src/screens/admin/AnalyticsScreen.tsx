import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Circle, Rect } from 'react-native-svg';
import Card from '../../components/common/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

const AnalyticsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Performance insights and data analysis</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* KPI Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
          {[
            { label: 'DAU', value: '1,254', color: COLORS.primary },
            { label: 'Avg Score', value: '82%', color: COLORS.accent },
            { label: 'Tests/Day', value: '314', color: COLORS.secondary },
            { label: 'Retention', value: '64%', color: COLORS.success },
          ].map((kpi, i) => (
            <Card key={i} style={{ width: '48%', padding: SPACING.lg }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZES.sm }}>{kpi.label}</Text>
              <Text style={{ color: kpi.color, fontSize: FONT_SIZES.xl, fontWeight: '700', marginTop: 4 }}>{kpi.value}</Text>
            </Card>
          ))}
        </View>

        {/* Charts (mock) */}
        <Card style={{ padding: SPACING.lg, marginTop: SPACING.lg }}>
          <Text style={{ fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md }}>Weekly Activity</Text>
          <Svg width="100%" height={180} viewBox="0 0 320 180">
            <G>
              <Rect x="0" y="0" width="320" height="180" fill={COLORS.background} />
              <Path d="M20 140 C 60 120, 100 100, 140 110 S 220 150, 300 100" stroke={COLORS.primary} strokeWidth="3" fill="none" />
              <Path d="M20 130 C 60 110, 100 90, 140 95 S 220 140, 300 90" stroke={COLORS.accent} strokeWidth="3" fill="none" />
              {[20, 80, 140, 200, 260, 300].map((x, i) => (
                <G key={i}>
                  <Circle cx={x} cy={140 - (i%2===0?20:30)} r="4" fill={COLORS.primary} />
                  <Circle cx={x} cy={130 - (i%2===0?25:35)} r="4" fill={COLORS.accent} />
                </G>
              ))}
            </G>
          </Svg>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, backgroundColor: COLORS.primary, borderRadius: 5 }} />
              <Text style={{ color: COLORS.textSecondary }}>Tests</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, backgroundColor: COLORS.accent, borderRadius: 5 }} />
              <Text style={{ color: COLORS.textSecondary }}>Active Users</Text>
            </View>
          </View>
        </Card>

        {/* Empty State Example */}
        <Card style={{ padding: SPACING.xl, alignItems: 'center', marginTop: SPACING.lg }}>
          <Ionicons name="stats-chart" size={48} color={COLORS.textLight} />
          <Text style={styles.placeholderTitle}>No Segments Selected</Text>
          <Text style={styles.placeholderText}>Choose a segment in filters to see segmented analytics.</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  placeholderCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  placeholderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AnalyticsScreen;