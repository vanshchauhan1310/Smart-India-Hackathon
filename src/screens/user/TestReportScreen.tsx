import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { UserStackParamList } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import * as Speech from 'expo-speech';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

type RouteP = RouteProp<UserStackParamList, 'TestReport'>;

const TestReportScreen: React.FC = () => {
  const { params } = useRoute<RouteP>();
  const { testId, result } = params as any;
  const [speaking, setSpeaking] = useState(false);

  const speakReport = () => {
    const reportText = `Test ID ${testId}. Score 87 percent. Details: Form analysis, repetitions, cadence, and AI feedback.`;
    setSpeaking(true);
    Speech.speak(reportText, {
      language: 'en-US',
      rate: 0.95,
      pitch: 1.0,
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setSpeaking(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Test Report</Text>
        <Card style={{ padding: SPACING.lg }}>
          <Text style={styles.label}>Test ID</Text>
          <Text style={styles.value}>{testId}</Text>
          <Text style={styles.label}>Score</Text>
          <Text style={styles.value}>{result ? `${result.score}%` : '—'}</Text>
          <Text style={styles.label}>AI Confidence</Text>
          <Text style={styles.value}>{result ? result.aiConfidence : '—'}</Text>
          <Text style={styles.label}>Details</Text>
          <Text style={styles.value}>{result ? result.feedback || JSON.stringify(result.metrics) : 'Form analysis, repetitions, cadence, and AI feedback.'}</Text>

        <View style={styles.buttonRow}>
          <View style={{ flex: 1, marginRight: SPACING.sm }}>
            <Button
              title={speaking ? 'Speaking...' : 'Listen'}
              onPress={speakReport}
              disabled={speaking}
              fullWidth
            />
          </View>
          <View style={{ width: 120 }}>
            <Button
              title="Stop"
              onPress={stopSpeaking}
              variant="outline"
              disabled={!speaking}
              fullWidth
            />
          </View>
        </View>
      </Card>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.md },
  value: { fontSize: FONT_SIZES.md, color: COLORS.text, marginTop: 4 },
  buttonRow: { flexDirection: 'row', marginTop: SPACING.lg, alignItems: 'center' },
});

export default TestReportScreen;

