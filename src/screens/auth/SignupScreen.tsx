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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../../context/AppContext';
import { RootStackParamList } from '../../types';
import { SPORTS } from '../../constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { login } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    age: '',
    sport: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSportPicker, setShowSportPicker] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 10 || Number(formData.age) > 100) {
      newErrors.age = 'Please enter a valid age (10-100)';
    }

    if (!formData.sport.trim()) {
      newErrors.sport = 'Please select a sport';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock user data - replace with actual API call
      const mockUser = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        age: Number(formData.age),
        sport: formData.sport,
        role: 'user' as const,
        language: 'en',
        uniqueId: `STU${Date.now().toString().slice(-6)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'mock-jwt-token';

      login(mockUser, mockToken);
    } catch (error) {
      Alert.alert('Error', 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSportSelect = (sport: string) => {
    setFormData(prev => ({ ...prev, sport }));
    setShowSportPicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="person-add" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the sports talent community</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                leftIcon="person"
                error={errors.name}
                required
              />

              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="mail"
                error={errors.email}
                required
              />

              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                keyboardType="phone-pad"
                leftIcon="call"
                error={errors.phone}
                required
              />

              <Input
                label="Age"
                placeholder="Enter your age"
                value={formData.age}
                onChangeText={(text) => handleInputChange('age', text)}
                keyboardType="numeric"
                leftIcon="calendar"
                error={errors.age}
                required
              />

              <TouchableOpacity
                style={styles.sportSelector}
                onPress={() => setShowSportPicker(true)}
              >
                <View style={styles.sportSelectorContent}>
                  <Ionicons name="fitness" size={20} color={COLORS.textLight} />
                  <Text style={[
                    styles.sportSelectorText,
                    formData.sport ? styles.sportSelectorTextSelected : styles.sportSelectorTextPlaceholder
                  ]}>
                    {formData.sport || 'Select your sport'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
                </View>
              </TouchableOpacity>
              {errors.sport && <Text style={styles.errorText}>{errors.sport}</Text>}

              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                error={errors.password}
                required
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                error={errors.confirmPassword}
                required
              />

              <Button
                title="Create Account"
                onPress={handleSignup}
                loading={loading}
                fullWidth
                style={styles.signupButton}
              />

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={handleLogin}>
              Sign In
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Sport Picker Modal */}
      {showSportPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sport</Text>
              <TouchableOpacity onPress={() => setShowSportPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.sportList}>
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport}
                  style={[
                    styles.sportItem,
                    formData.sport === sport && styles.selectedSportItem,
                  ]}
                  onPress={() => handleSportSelect(sport)}
                >
                  <Text
                    style={[
                      styles.sportItemText,
                      formData.sport === sport && styles.selectedSportItemText,
                    ]}
                  >
                    {sport}
                  </Text>
                  {formData.sport === sport && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
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
  backButton: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    zIndex: 1,
    padding: SPACING.sm,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  form: {
    gap: SPACING.md,
  },
  sportSelector: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  sportSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportSelectorText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.sm,
  },
  sportSelectorTextPlaceholder: {
    color: COLORS.textLight,
  },
  sportSelectorTextSelected: {
    color: COLORS.text,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
  },
  signupButton: {
    marginTop: SPACING.md,
  },
  termsContainer: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  termsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    margin: SPACING.lg,
    maxHeight: '70%',
    width: '90%',
    ...SHADOWS.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  sportList: {
    maxHeight: 300,
  },
  sportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedSportItem: {
    backgroundColor: COLORS.surface,
  },
  sportItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  selectedSportItemText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default SignupScreen;