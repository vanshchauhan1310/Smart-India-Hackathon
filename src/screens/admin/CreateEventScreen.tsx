import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addEvent } = useApp();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<'Competition' | 'Assessment' | 'Camp' | 'Other'>('Competition');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!title || !date || !location) {
      Alert.alert('Missing info', 'Title, date and location are required.');
      return;
    }
    setLoading(true);
    try {
      addEvent({
        title,
        date: new Date(date),
        location,
        type,
        description,
      });
      Alert.alert('Success', 'Event has been created.');
      (navigation as any).goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => (navigation as any).goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="calendar" size={40} color={COLORS.white} />
          <Text style={styles.title}>Create Event</Text>
        </View>
      </LinearGradient>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.xl }}>
          <Input label="Title" value={title} onChangeText={setTitle} leftIcon="create" required />
          <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} leftIcon="calendar" required />
          <Input label="Location" value={location} onChangeText={setLocation} leftIcon="location" required />
          <Input label="Type (Competition/Assessment/Camp/Other)" value={type} onChangeText={(t) => setType((t as any) || 'Other')} leftIcon="pricetag" />
          <Input label="Description" value={description} onChangeText={setDescription} leftIcon="document-text" />
          <Button title="Create" onPress={onCreate} loading={loading} fullWidth style={{ marginTop: SPACING.md }} />
        </ScrollView>
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
});

export default CreateEventScreen;

