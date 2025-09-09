import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { UserStackParamList } from '../../types';
import Card from '../../components/common/Card';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

type RouteP = RouteProp<UserStackParamList, 'EventDetail'>;

const EventDetailScreen: React.FC = () => {
  const { params } = useRoute<RouteP>();
  const { eventId } = params;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Event Details</Text>
      <Card style={{ padding: SPACING.lg }}>
        <Text style={styles.label}>Event ID</Text>
        <Text style={styles.value}>{eventId}</Text>
        <Text style={styles.label}>About</Text>
        <Text style={styles.value}>Full description, schedule, rules, and contact information.</Text>
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

export default EventDetailScreen;

