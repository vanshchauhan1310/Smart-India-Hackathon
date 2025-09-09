import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserStackParamList } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { TESTS, COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

type TestSelectionNavigationProp = StackNavigationProp<UserStackParamList, 'TestSelection'>;

const { width: screenWidth } = Dimensions.get('window');

const TestSelectionScreen: React.FC = () => {
  const navigation = useNavigation<TestSelectionNavigationProp>();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showTestDetails, setShowTestDetails] = useState(false);

  const handleTestSelect = (testId: string) => {
    setSelectedTest(testId);
    setShowTestDetails(true);
  };

  const handleStartTest = () => {
    if (selectedTest) {
      setShowTestDetails(false);
      setShowDisclaimer(true);
    }
  };

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    navigation.navigate('CameraTest', { testId: selectedTest! });
  };

  const getTestById = (id: string) => {
    return TESTS.find(test => test.id === id);
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'fitness':
        return COLORS.primary;
      case 'strength':
        return COLORS.secondary;
      case 'endurance':
        return COLORS.accent;
      case 'skill':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Select Test</Text>
            <Text style={styles.subtitle}>Choose a test to assess your performance</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="fitness" size={32} color={COLORS.white} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.testsContainer}>
          {TESTS.map((test) => (
            <Card
              key={test.id}
              style={styles.testCard}
              onPress={() => handleTestSelect(test.id)}
            >
              <View style={styles.testHeader}>
                <View style={styles.testIcon}>
                  <Text style={styles.testEmoji}>{test.icon}</Text>
                </View>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testDescription}>{test.description}</Text>
                </View>
                <View style={styles.testMeta}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(test.category) }]}>
                    <Text style={styles.categoryText}>{test.category}</Text>
                  </View>
                  <Text style={styles.duration}>{formatDuration(test.duration)}</Text>
                </View>
              </View>
              
              <View style={styles.testFooter}>
                <View style={styles.requirements}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.requirementsText}>
                    {test.requirements.length} requirements
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </View>
            </Card>
          ))}
        </View>

        {/* Test Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Test Categories</Text>
          <View style={styles.categoriesGrid}>
            <View style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="fitness" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.categoryName}>Fitness</Text>
              <Text style={styles.categoryCount}>2 tests</Text>
            </View>
            
            <View style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: COLORS.secondary }]}>
                <Ionicons name="barbell" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.categoryName}>Strength</Text>
              <Text style={styles.categoryCount}>1 test</Text>
            </View>
            
            <View style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: COLORS.accent }]}>
                <Ionicons name="speedometer" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.categoryName}>Endurance</Text>
              <Text style={styles.categoryCount}>0 tests</Text>
            </View>
            
            <View style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: COLORS.success }]}>
                <Ionicons name="star" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.categoryName}>Skill</Text>
              <Text style={styles.categoryCount}>0 tests</Text>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Test Tips</Text>
          <Card style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Ionicons name="videocam" size={20} color={COLORS.primary} />
              <Text style={styles.tipText}>Ensure good lighting for accurate analysis</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.tipText}>Find a clear space with enough room to move</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="time" size={20} color={COLORS.primary} />
              <Text style={styles.tipText}>Follow the on-screen instructions carefully</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
              <Text style={styles.tipText}>Warm up before starting any test</Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Test Details Modal */}
      <Modal
        visible={showTestDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTestDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {selectedTest && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTestDetails(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Test Details</Text>
                <View style={{ width: 24 }} />
              </View>
              
              <ScrollView style={styles.modalContent}>
                {(() => {
                  const test = getTestById(selectedTest);
                  if (!test) return null;
                  
                  return (
                    <>
                      <View style={styles.testDetailHeader}>
                        <Text style={styles.testDetailEmoji}>{test.icon}</Text>
                        <Text style={styles.testDetailName}>{test.name}</Text>
                        <Text style={styles.testDetailDescription}>{test.description}</Text>
                      </View>
                      
                      <View style={styles.testDetailSection}>
                        <Text style={styles.sectionTitle}>Instructions</Text>
                        {test.instructions.map((instruction, index) => (
                          <View key={index} style={styles.instructionItem}>
                            <View style={styles.instructionNumber}>
                              <Text style={styles.instructionNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.instructionText}>{instruction}</Text>
                          </View>
                        ))}
                      </View>
                      
                      <View style={styles.testDetailSection}>
                        <Text style={styles.sectionTitle}>Requirements</Text>
                        {test.requirements.map((requirement, index) => (
                          <View key={index} style={styles.requirementItem}>
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                            <Text style={styles.requirementText}>{requirement}</Text>
                          </View>
                        ))}
                      </View>
                      
                      <View style={styles.testDetailSection}>
                        <Text style={styles.sectionTitle}>Test Information</Text>
                        <View style={styles.testInfoGrid}>
                          <View style={styles.testInfoItem}>
                            <Ionicons name="time" size={20} color={COLORS.primary} />
                            <Text style={styles.testInfoLabel}>Duration</Text>
                            <Text style={styles.testInfoValue}>{formatDuration(test.duration)}</Text>
                          </View>
                          <View style={styles.testInfoItem}>
                            <Ionicons name="fitness" size={20} color={COLORS.primary} />
                            <Text style={styles.testInfoLabel}>Category</Text>
                            <Text style={styles.testInfoValue}>{test.category}</Text>
                          </View>
                        </View>
                      </View>
                    </>
                  );
                })()}
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <Button
                  title="Start Test"
                  onPress={handleStartTest}
                  fullWidth
                />
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* Disclaimer Modal */}
      <Modal
        visible={showDisclaimer}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDisclaimer(false)}
      >
        <View style={styles.disclaimerOverlay}>
          <View style={styles.disclaimerContainer}>
            <View style={styles.disclaimerHeader}>
              <Ionicons name="warning" size={32} color={COLORS.warning} />
              <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
            </View>
            
            <ScrollView style={styles.disclaimerContent}>
              <Text style={styles.disclaimerText}>
                Before proceeding with the test, please read and acknowledge the following:
              </Text>
              
              <View style={styles.disclaimerList}>
                <Text style={styles.disclaimerItem}>
                  • Ensure you are in good physical condition and have warmed up properly
                </Text>
                <Text style={styles.disclaimerItem}>
                  • Stop immediately if you experience any pain or discomfort
                </Text>
                <Text style={styles.disclaimerItem}>
                  • Make sure you have adequate space and proper lighting
                </Text>
                <Text style={styles.disclaimerItem}>
                  • Follow all safety guidelines and instructions carefully
                </Text>
                <Text style={styles.disclaimerItem}>
                  • Results are for assessment purposes only and not medical advice
                </Text>
              </View>
              
              <Text style={styles.disclaimerWarning}>
                By proceeding, you acknowledge that you understand these terms and are ready to begin the test safely.
              </Text>
            </ScrollView>
            
            <View style={styles.disclaimerFooter}>
              <Button
                title="Cancel"
                onPress={() => setShowDisclaimer(false)}
                variant="outline"
                style={styles.disclaimerButton}
              />
              <Button
                title="I Understand, Start Test"
                onPress={handleAcceptDisclaimer}
                style={styles.disclaimerButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
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
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  testsContainer: {
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  testCard: {
    padding: SPACING.lg,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  testIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  testEmoji: {
    fontSize: 24,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  testDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  testMeta: {
    alignItems: 'flex-end',
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  duration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  testFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requirements: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  categoriesSection: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  categoryCard: {
    width: (screenWidth - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  categoryName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  categoryCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  tipsSection: {
    marginBottom: SPACING.xl,
  },
  tipsCard: {
    padding: SPACING.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  testDetailHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  testDetailEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  testDetailName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  testDetailDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  testDetailSection: {
    marginBottom: SPACING.xl,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  instructionNumberText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  requirementText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  testInfoGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  testInfoItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  testInfoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  testInfoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  modalFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  disclaimerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  disclaimerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    width: '100%',
    ...SHADOWS.xl,
  },
  disclaimerHeader: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  disclaimerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  disclaimerContent: {
    padding: SPACING.lg,
    maxHeight: 300,
  },
  disclaimerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  disclaimerList: {
    marginBottom: SPACING.lg,
  },
  disclaimerItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  disclaimerWarning: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  disclaimerFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  disclaimerButton: {
    flex: 1,
  },
});

export default TestSelectionScreen;