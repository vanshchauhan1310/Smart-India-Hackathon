import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../../context/AppContext';
import { RootStackParamList } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width: screenWidth } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { state, updateUser } = useApp();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    profileImage: '',
    bio: '',
    experience: '',
    goals: '',
    emergencyContact: '',
    medicalInfo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    {
      title: 'Profile Setup',
      subtitle: 'Let\'s personalize your experience',
      icon: 'person-circle',
    },
    {
      title: 'Sports Experience',
      subtitle: 'Tell us about your background',
      icon: 'trophy',
    },
    {
      title: 'Goals & Preferences',
      subtitle: 'What do you want to achieve?',
      icon: 'flag',
    },
    {
      title: 'Safety Information',
      subtitle: 'Important details for your safety',
      icon: 'shield-checkmark',
    },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.bio.trim()) {
          newErrors.bio = 'Bio is required';
        }
        break;
      case 1:
        if (!formData.experience.trim()) {
          newErrors.experience = 'Experience level is required';
        }
        break;
      case 2:
        if (!formData.goals.trim()) {
          newErrors.goals = 'Goals are required';
        }
        break;
      case 3:
        if (!formData.emergencyContact.trim()) {
          newErrors.emergencyContact = 'Emergency contact is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Update user with additional information
      const updatedUser = {
        ...state.auth.user!,
        bio: formData.bio,
        experience: formData.experience,
        goals: formData.goals,
        emergencyContact: formData.emergencyContact,
        medicalInfo: formData.medicalInfo,
        profileImage: formData.profileImage,
      };

      updateUser(updatedUser);

      // Navigate to appropriate portal based on role
      if (state.auth.user?.role === 'user') {
        navigation.navigate('UserPortal');
      } else {
        navigation.navigate('AdminPortal');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {formData.profileImage ? (
                  <Text style={styles.avatarText}>📷</Text>
                ) : (
                  <Ionicons name="person" size={40} color={COLORS.textLight} />
                )}
              </View>
              <TouchableOpacity style={styles.changePhotoButton}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
            
            <Input
              label="Bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              multiline
              numberOfLines={4}
              error={errors.bio}
              required
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Input
              label="Experience Level"
              placeholder="e.g., Beginner, Intermediate, Advanced, Professional"
              value={formData.experience}
              onChangeText={(text) => handleInputChange('experience', text)}
              error={errors.experience}
              required
            />
            
            <View style={styles.experienceOptions}>
              {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.experienceOption,
                    formData.experience === level && styles.selectedExperienceOption,
                  ]}
                  onPress={() => handleInputChange('experience', level)}
                >
                  <Text
                    style={[
                      styles.experienceOptionText,
                      formData.experience === level && styles.selectedExperienceOptionText,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Input
              label="Goals"
              placeholder="What do you want to achieve?"
              value={formData.goals}
              onChangeText={(text) => handleInputChange('goals', text)}
              multiline
              numberOfLines={3}
              error={errors.goals}
              required
            />
            
            <View style={styles.goalsOptions}>
              {[
                'Improve Performance',
                'Get Discovered',
                'Track Progress',
                'Compete Nationally',
                'Stay Fit',
                'Learn New Skills',
              ].map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.goalOption,
                    formData.goals.includes(goal) && styles.selectedGoalOption,
                  ]}
                  onPress={() => {
                    const currentGoals = formData.goals;
                    const updatedGoals = currentGoals.includes(goal)
                      ? currentGoals.replace(goal, '').replace(/,\s*,/g, ',').replace(/^,|,$/g, '')
                      : currentGoals ? `${currentGoals}, ${goal}` : goal;
                    handleInputChange('goals', updatedGoals);
                  }}
                >
                  <Text
                    style={[
                      styles.goalOptionText,
                      formData.goals.includes(goal) && styles.selectedGoalOptionText,
                    ]}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Input
              label="Emergency Contact"
              placeholder="Name and phone number"
              value={formData.emergencyContact}
              onChangeText={(text) => handleInputChange('emergencyContact', text)}
              leftIcon="call"
              error={errors.emergencyContact}
              required
            />
            
            <Input
              label="Medical Information (Optional)"
              placeholder="Any medical conditions or allergies?"
              value={formData.medicalInfo}
              onChangeText={(text) => handleInputChange('medicalInfo', text)}
              multiline
              numberOfLines={3}
              leftIcon="medical"
            />
            
            <View style={styles.safetyInfo}>
              <Ionicons name="information-circle" size={20} color={COLORS.info} />
              <Text style={styles.safetyInfoText}>
                This information is kept secure and only used for your safety during assessments.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / steps.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={steps[currentStep].icon as keyof typeof Ionicons.glyphMap}
              size={40}
              color={COLORS.white}
            />
          </View>
          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {renderStepContent()}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <Button
              title="Back"
              onPress={handleBack}
              variant="outline"
              style={styles.backButton}
            />
          )}
          
          <Button
            title={currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            onPress={handleNext}
            style={[
              styles.nextButton,
              currentStep === 0 && styles.fullWidthButton,
            ]}
          />
        </View>
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
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
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  stepContent: {
    gap: SPACING.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  avatarText: {
    fontSize: 40,
  },
  changePhotoButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
  },
  changePhotoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '500',
  },
  experienceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  experienceOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedExperienceOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  experienceOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedExperienceOptionText: {
    color: COLORS.white,
  },
  goalsOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  goalOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedGoalOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedGoalOptionText: {
    color: COLORS.white,
  },
  safetyInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  safetyInfoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  fullWidthButton: {
    flex: 1,
  },
});

export default OnboardingScreen;