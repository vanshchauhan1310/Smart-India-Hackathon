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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

const ProfileScreen: React.FC = () => {
  const { state, logout, updateUser } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const user = state.auth.user;

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingField && editValue.trim()) {
      const updates: any = {};
      updates[editingField] = editValue.trim();
      updateUser(updates);
      setShowEditModal(false);
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      sport: 'Sport',
      bio: 'Bio',
      experience: 'Experience Level',
      goals: 'Goals',
    };
    return labels[field] || field;
  };

  const getFieldIcon = (field: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      name: 'person',
      email: 'mail',
      phone: 'call',
      sport: 'fitness',
      bio: 'document-text',
      experience: 'trophy',
      goals: 'flag',
    };
    return icons[field] || 'information-circle';
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userId}>ID: {user?.uniqueId}</Text>
              <Text style={styles.userSport}>{user?.sport}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <Ionicons name="settings" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="fitness" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Tests</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="trophy" size={24} color={COLORS.accent} />
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="trending-up" size={24} color={COLORS.success} />
              <Text style={styles.statValue}>+12%</Text>
              <Text style={styles.statLabel}>Improvement</Text>
            </View>
          </Card>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <Card style={styles.infoCard}>
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => handleEditField('name', user?.name || '')}
            >
              <View style={styles.infoIcon}>
                <Ionicons name="person" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => handleEditField('email', user?.email || '')}
            >
              <View style={styles.infoIcon}>
                <Ionicons name="mail" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => handleEditField('phone', user?.phone || '')}
            >
              <View style={styles.infoIcon}>
                <Ionicons name="call" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => handleEditField('sport', user?.sport || '')}
            >
              <View style={styles.infoIcon}>
                <Ionicons name="fitness" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Sport</Text>
                <Text style={styles.infoValue}>{user?.sport || 'Not set'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Sports Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports Information</Text>
          
          <Card style={styles.infoCard}>
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => handleEditField('bio', user?.bio || '')}
            >
              <View style={styles.infoIcon}>
                <Ionicons name="document-text" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Bio</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {user?.bio || 'Tell us about yourself...'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => handleEditField('experience', user?.experience || '')}
            >
              <View style={styles.infoIcon}>
                <Ionicons name="trophy" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Experience Level</Text>
                <Text style={styles.infoValue}>{user?.experience || 'Not set'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => handleEditField('goals', user?.goals || '')}
            >
              <View style={styles.infoIcon}>
                <Ionicons name="flag" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Goals</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {user?.goals || 'What do you want to achieve?'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <Card style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="language" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Language</Text>
                <Text style={styles.infoValue}>
                  {state.selectedLanguage === 'en' ? 'English' : 'Other'}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Account Status</Text>
                <Text style={[styles.infoValue, { color: COLORS.success }]}>
                  Verified
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Edit {editingField ? getFieldLabel(editingField) : 'Field'}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.modalContent}>
            <Input
              label={editingField ? getFieldLabel(editingField) : 'Field'}
              placeholder={`Enter ${editingField ? getFieldLabel(editingField).toLowerCase() : 'value'}`}
              value={editValue}
              onChangeText={setEditValue}
              multiline={editingField === 'bio' || editingField === 'goals'}
              numberOfLines={editingField === 'bio' || editingField === 'goals' ? 4 : 1}
            />
          </View>
          
          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setShowEditModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Save"
              onPress={handleSaveEdit}
              style={styles.modalButton}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Settings</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Preferences</Text>
              
              <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="notifications" size={20} color={COLORS.primary} />
                <Text style={styles.settingsItemText}>Notifications</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="language" size={20} color={COLORS.primary} />
                <Text style={styles.settingsItemText}>Language</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                <Text style={styles.settingsItemText}>Privacy & Security</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Support</Text>
              
              <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="help-circle" size={20} color={COLORS.primary} />
                <Text style={styles.settingsItemText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="document-text" size={20} color={COLORS.primary} />
                <Text style={styles.settingsItemText}>Terms of Service</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
                <Text style={styles.settingsItemText}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
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
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  avatarText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  userId: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.xs,
  },
  userSport: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoCard: {
    padding: 0,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.lg + 40 + SPACING.md,
  },
  logoutButton: {
    marginTop: SPACING.lg,
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
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    flex: 1,
  },
  settingsSection: {
    marginBottom: SPACING.xl,
  },
  settingsSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  settingsItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
  },
});

export default ProfileScreen;