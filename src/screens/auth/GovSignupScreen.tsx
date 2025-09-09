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

const GovSignupScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { login } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [org, setOrg] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!name || !email || !password || !org || !badgeId) {
      Alert.alert('Missing info', 'All fields including proof are required.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      login({
        id: 'gov-2',
        email,
        name,
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="shield-checkmark" size={40} color={COLORS.white} />
          <Text style={styles.title}>Government Sign Up</Text>
          <Text style={styles.subtitle}>Provide verification to access</Text>
        </View>
      </LinearGradient>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl }}>
          <Input label="Full Name" value={name} onChangeText={setName} leftIcon="person" required />
          <Input label="Official Email" value={email} onChangeText={setEmail} keyboardType="email-address" leftIcon="mail" required />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry leftIcon="lock-closed" required />
          <Input label="Department / Organization" value={org} onChangeText={setOrg} leftIcon="business" required />
          <Input label="Government ID / Badge No." value={badgeId} onChangeText={setBadgeId} leftIcon="id-card" required />
          <Input label="Proof URL (ID/Letter)" value={documentUrl} onChangeText={setDocumentUrl} leftIcon="document" placeholder="Link to document or leave for manual verification" />
          <Button title="Create Account" onPress={onSignup} loading={loading} fullWidth style={{ marginTop: SPACING.md }} />
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

export default GovSignupScreen;

