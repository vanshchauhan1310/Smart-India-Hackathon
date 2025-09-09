import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../../context/AppContext';
import { RootStackParamList } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

type Nav = StackNavigationProp<RootStackParamList, 'Auth'>;

const GovLoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password || !badgeId) {
      Alert.alert('Missing info', 'Email, password and government ID are required.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      login({
        id: 'gov-1',
        email,
        name: 'Gov Officer',
        phone: '',
        age: 30,
        sport: 'Administration',
        role: 'admin',
        language: 'en',
        uniqueId: badgeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, 'mock-token');
    } finally {
      setLoading(false);
    }
  };

  const goSignup = () => navigation.navigate('Auth', { screen: 'GovSignup' } as any);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="shield" size={40} color={COLORS.white} />
          <Text style={styles.title}>Government Login</Text>
          <Text style={styles.subtitle}>Restricted access for authorities</Text>
        </View>
      </LinearGradient>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl }}>
          <Input label="Official Email" value={email} onChangeText={setEmail} keyboardType="email-address" leftIcon="mail" required />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry leftIcon="lock-closed" required />
          <Input label="Government ID / Badge No." value={badgeId} onChangeText={setBadgeId} leftIcon="id-card" required />
          <Button title="Sign In" onPress={onLogin} loading={loading} fullWidth style={{ marginTop: SPACING.md }} />
          <TouchableOpacity onPress={goSignup} style={{ marginTop: SPACING.lg, alignSelf: 'center' }}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Need an account? Government Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: SPACING.lg, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
  backButton: { position: 'absolute', top: SPACING.lg, left: SPACING.lg, zIndex: 1, padding: SPACING.sm },
  headerContent: { alignItems: 'center', marginTop: SPACING.lg, gap: 8 },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.white },
  subtitle: { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.9)' },
});

export default GovLoginScreen;

