import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { UserStackParamList } from '../../types';
import Card from '../../components/common/Card';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

type RouteP = RouteProp<UserStackParamList, 'TestReport'>;

const TestReportScreen: React.FC = () => {
  const { params } = useRoute<RouteP>();
  const { testId } = params;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Test Report</Text>
      <Card style={{ padding: SPACING.lg }}>
        <Text style={styles.label}>Test ID</Text>
        <Text style={styles.value}>{testId}</Text>
        <Text style={styles.label}>Score</Text>
        <Text style={styles.value}>87%</Text>
        <Text style={styles.label}>Details</Text>
        <Text style={styles.value}>Form analysis, repetitions, cadence, and AI feedback.</Text>
      </Card>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.md },
  value: { fontSize: FONT_SIZES.md, color: COLORS.text, marginTop: 4 },
});

export default TestReportScreen;

