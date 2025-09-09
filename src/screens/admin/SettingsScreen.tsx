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
import Card from '../../components/common/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

const SettingsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure system settings and preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Settings Placeholder */}
        <Card style={styles.placeholderCard}>
          <View style={styles.placeholderContent}>
            <Ionicons name="settings" size={64} color={COLORS.textLight} />
            <Text style={styles.placeholderTitle}>System Settings</Text>
            <Text style={styles.placeholderText}>
              System configuration and admin settings will be available here.
              This includes user permissions, system preferences, and platform configuration.
            </Text>
          </View>
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

export default SettingsScreen;