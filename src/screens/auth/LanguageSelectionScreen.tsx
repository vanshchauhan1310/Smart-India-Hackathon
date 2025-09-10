import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { LANGUAGES } from '../../constants';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

const LanguageSelectionScreen: React.FC = () => {
  const { setLanguage } = useApp();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleContinue = () => {
    setLanguage(selectedLanguage);
    navigation.navigate('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="fitness" size={40} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Sports Talent Assessment</Text>
          <Text style={styles.subtitle}>AI-Powered Mobile Platform</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeText}>
            Please select your preferred language to get started with your sports talent assessment journey.
          </Text>
        </View>

        <View style={styles.languageSection}>
          <Text style={styles.sectionTitle}>Choose Language</Text>
          <View style={styles.languageGrid}>
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageCard,
                  selectedLanguage === language.code && styles.selectedLanguageCard,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.8}
              >
                <View style={styles.languageContent}>
                  <Text style={styles.flag}>{language.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text
                      style={[
                        styles.languageName,
                        selectedLanguage === language.code && styles.selectedLanguageName,
                        language.fontFamily ? { fontFamily: language.fontFamily } : {},
                      ]}
                    >
                      {language.nativeName}
                    </Text>
                    <Text
                      style={[
                        styles.languageEnglish,
                        selectedLanguage === language.code && styles.selectedLanguageEnglish,
                      ]}
                    >
                      {language.name}
                    </Text>
                  </View>
                  {selectedLanguage === language.code && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What You'll Get</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="videocam" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.featureText}>AI-Guided Video Recording</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="analytics" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.featureText}>Real-time Performance Analysis</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="trophy" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.featureText}>National Leaderboards</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.featureText}>Secure & Encrypted</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.buttonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  welcomeSection: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  welcomeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  languageSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  languageGrid: {
    gap: SPACING.sm,
  },
  languageCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  selectedLanguageCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: COLORS.primary,
  },
  languageEnglish: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  selectedLanguageEnglish: {
    color: COLORS.primary,
  },
  checkIcon: {
    marginLeft: SPACING.sm,
  },
  featuresSection: {
    marginBottom: SPACING.xl,
  },
  featuresList: {
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  continueButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  continueButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
});

export default LanguageSelectionScreen;