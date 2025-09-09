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
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useApp();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock user data - replace with actual API call
      const mockUser = {
        id: '1',
        email: formData.email,
        name: 'John Doe',
        phone: '+1234567890',
        age: 25,
        sport: 'Football',
        role: 'user' as const,
        language: 'en',
        uniqueId: 'STU001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'mock-jwt-token';

      login(mockUser, mockToken);
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality will be implemented in the next version.',
      [{ text: 'OK' }]
    );
  };

  const handleSignup = () => {
    // Navigate within Auth stack; using any to avoid type conflict on nested params
    (navigation as any).navigate('Auth', { screen: 'Signup' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
            <Ionicons name="fitness" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
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
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                error={errors.password}
                required
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={20} color={COLORS.error} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-facebook" size={20} color={COLORS.info} />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              <View style={{ alignItems: 'center', marginTop: SPACING.lg }}>
                <TouchableOpacity onPress={() => (navigation as any).navigate('Auth', { screen: 'GovLogin' })}>
                  <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Government Authority? Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: SPACING.sm }} onPress={() => (navigation as any).navigate('Auth', { screen: 'GovSignup' })}>
                  <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Government Authority? Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={handleSignup}>
              Sign Up
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  socialButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    marginLeft: SPACING.sm,
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
  signupLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;