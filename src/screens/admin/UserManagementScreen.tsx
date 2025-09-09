import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  useWindowDimensions,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

const UserManagementScreen: React.FC = () => {
  const initialUsers = [
    {
      id: '1',
      name: 'Arjun Singh',
      email: 'arjun@example.com',
      sport: 'Football',
      location: 'Mumbai',
      status: 'active',
      testsCompleted: 15,
      averageScore: 94.2,
      lastActive: new Date(),
      joinedDate: new Date(Date.now() - 30 * 24 * 3600000),
      phone: '+91 98765 43210',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      sport: 'Cricket',
      location: 'Delhi',
      status: 'active',
      testsCompleted: 12,
      averageScore: 91.8,
      lastActive: new Date(Date.now() - 3600000),
      joinedDate: new Date(Date.now() - 45 * 24 * 3600000),
      phone: '+91 87654 32109',
    },
    {
      id: '3',
      name: 'Rahul Kumar',
      email: 'rahul@example.com',
      sport: 'Basketball',
      location: 'Bangalore',
      status: 'pending',
      testsCompleted: 8,
      averageScore: 89.5,
      lastActive: new Date(Date.now() - 7200000),
      joinedDate: new Date(Date.now() - 15 * 24 * 3600000),
      phone: '+91 76543 21098',
    },
  ];

  const generatedUsers = Array.from({ length: 50 }, (_, i) => ({
    id: `${i + 10}`,
    name: `User ${i + 10}`,
    email: `user${i + 10}@example.com`,
    sport: ['Football','Cricket','Basketball','Tennis','Swimming'][i % 5],
    location: ['Mumbai','Delhi','Bangalore','Chennai','Kolkata','Hyderabad'][i % 6],
    status: ['active','pending','suspended'][i % 3],
    testsCompleted: 5 + (i % 20),
    averageScore: 60 + (i % 35),
    lastActive: new Date(Date.now() - (i + 1) * 3600000),
    joinedDate: new Date(Date.now() - (i + 1) * 24 * 3600000),
    phone: `+91 ${Math.floor(Math.random() * 90000) + 10000} ${Math.floor(Math.random() * 90000) + 10000}`,
  }));

  const [users, setUsers] = useState([...initialUsers, ...generatedUsers]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;
  
  // Responsive calculations
  const getItemWidth = () => {
    if (isTablet && isLandscape) return '32%';
    if (isTablet) return '48%';
    return '100%';
  };

  const getColumns = () => {
    if (isTablet && isLandscape) return 3;
    if (isTablet) return 2;
    return 1;
  };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleUserPress = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleUserAction = (action: string, user: any) => {
    Alert.alert(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: action === 'Suspend' ? 'destructive' : 'default',
          onPress: () => {
            // Update user status
            setUsers(prev => prev.map(u => 
              u.id === user.id 
                ? { ...u, status: action === 'Suspend' ? 'suspended' : 'active' }
                : u
            ));
            setShowUserModal(false);
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'suspended':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getFilteredAndSortedUsers = () => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'lastActive' || sortBy === 'joinedDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: diffDays > 365 ? 'numeric' : undefined,
    }).format(new Date(date));
  };

  const filterOptions = [
    { key: 'all', label: 'All Users', count: users.length },
    { key: 'active', label: 'Active', count: users.filter(u => u.status === 'active').length },
    { key: 'pending', label: 'Pending', count: users.filter(u => u.status === 'pending').length },
    { key: 'suspended', label: 'Suspended', count: users.filter(u => u.status === 'suspended').length },
  ];

  const renderUserCard = ({ item: user, index }) => (
    <Card
      key={user.id}
      style={[
        styles.userCard,
        {
          width: isTablet ? getItemWidth() : '100%',
          marginRight: isTablet && (index + 1) % getColumns() !== 0 ? SPACING.sm : 0,
        }
      ]}
      onPress={() => handleUserPress(user)}
    >
      <View style={styles.userHeader}>
        <View style={[styles.userAvatar, { backgroundColor: getStatusColor(user.status) }]}>
          <Text style={styles.userAvatarText}>
            {user.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
          <Text style={styles.userDetails} numberOfLines={1}>
            {user.sport} • {user.location}
          </Text>
        </View>
        <View style={styles.userStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(user.status) }
          ]}>
            <Text style={styles.statusText}>{user.status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.testsCompleted}</Text>
          <Text style={styles.statLabel}>Tests</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.averageScore}%</Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue} numberOfLines={1}>
            {formatDate(user.lastActive)}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>Manage platform users and their activities</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="person-add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={20} color={COLORS.textLight} />
            <TextInput
              style={styles.searchTextInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textLight}
            />
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity style={styles.sortButton} onPress={() => {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          }}>
            <Ionicons 
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
              size={20} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Status Filters */}
        {isTablet ? (
          <View style={styles.filtersWrap}>
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  filterStatus === filter.key && styles.activeFilterChip,
                ]}
                onPress={() => setFilterStatus(filter.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === filter.key && styles.activeFilterChipText,
                  ]}
                >
                  {filter.label}
                </Text>
                <View style={[
                  styles.filterCount,
                  filterStatus === filter.key && styles.activeFilterCount,
                ]}>
                  <Text style={[
                    styles.filterCountText,
                    filterStatus === filter.key && styles.activeFilterCountText,
                  ]}>
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  filterStatus === filter.key && styles.activeFilterChip,
                ]}
                onPress={() => setFilterStatus(filter.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === filter.key && styles.activeFilterChipText,
                  ]}
                >
                  {filter.label}
                </Text>
                <View style={[
                  styles.filterCount,
                  filterStatus === filter.key && styles.activeFilterCount,
                ]}>
                  <Text style={[
                    styles.filterCountText,
                    filterStatus === filter.key && styles.activeFilterCountText,
                  ]}>
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Users List */}
        <FlatList
          data={getFilteredAndSortedUsers()}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id}
          numColumns={getColumns()}
          key={getColumns()} // Force re-render on orientation change
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.usersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyStateTitle}>No users found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      </View>

      {/* User Detail Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUserModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowUserModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>User Details</Text>
            <TouchableOpacity>
              <Ionicons name="create" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {selectedUser && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.userDetailHeader}>
                <View style={[
                  styles.userDetailAvatar,
                  { backgroundColor: getStatusColor(selectedUser.status) }
                ]}>
                  <Text style={styles.userDetailAvatarText}>
                    {selectedUser.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.userDetailName}>{selectedUser.name}</Text>
                <Text style={styles.userDetailEmail}>{selectedUser.email}</Text>
                <View style={[
                  styles.userDetailStatus,
                  { backgroundColor: getStatusColor(selectedUser.status) }
                ]}>
                  <Text style={styles.userDetailStatusText}>{selectedUser.status}</Text>
                </View>
              </View>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{selectedUser.testsCompleted}</Text>
                  <Text style={styles.quickStatLabel}>Tests Completed</Text>
                </View>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{selectedUser.averageScore}%</Text>
                  <Text style={styles.quickStatLabel}>Average Score</Text>
                </View>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>
                    {Math.floor((new Date().getTime() - new Date(selectedUser.joinedDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </Text>
                  <Text style={styles.quickStatLabel}>Days Active</Text>
                </View>
              </View>
              
              <View style={styles.userDetailSection}>
                <Text style={styles.sectionTitle}>Profile Information</Text>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Full Name</Text>
                  <Text style={styles.detailValue}>{selectedUser.name}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{selectedUser.email}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Sport</Text>
                  <Text style={styles.detailValue}>{selectedUser.sport}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{selectedUser.location}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Joined Date</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedUser.joinedDate)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Last Active</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedUser.lastActive)}</Text>
                </View>
              </View>
              
              <View style={styles.userDetailSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionButtons}>
                  <Button
                    title="View Test History"
                    onPress={() => {}}
                    variant="outline"
                    style={styles.actionButton}
                    icon="document-text"
                  />
                  <Button
                    title="Send Notification"
                    onPress={() => {}}
                    variant="outline"
                    style={styles.actionButton}
                    icon="notifications"
                  />
                  <Button
                    title="Generate Report"
                    onPress={() => {}}
                    variant="outline"
                    style={styles.actionButton}
                    icon="analytics"
                  />
                  {selectedUser.status === 'active' ? (
                    <Button
                      title="Suspend User"
                      onPress={() => handleUserAction('Suspend', selectedUser)}
                      variant="outline"
                      style={[styles.actionButton, { borderColor: COLORS.error }]}
                      textColor={COLORS.error}
                      icon="ban"
                    />
                  ) : (
                    <Button
                      title="Activate User"
                      onPress={() => handleUserAction('Activate', selectedUser)}
                      variant="outline"
                      style={[styles.actionButton, { borderColor: COLORS.success }]}
                      textColor={COLORS.success}
                      icon="checkmark-circle"
                    />
                  )}
                </View>
              </View>
            </ScrollView>
          )}
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
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
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
  headerAction: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  searchTextInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  filtersContent: {
    paddingRight: SPACING.lg,
  },
  filtersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    height: 60,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
  activeFilterChipText: {
    color: COLORS.white,
  },
  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCountText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  activeFilterCountText: {
    color: COLORS.white,
  },
  usersList: {
    paddingBottom: SPACING.xl,
  },
  userCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  userAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyStateSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
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
  userDetailHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  userDetailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  userDetailAvatarText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userDetailName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userDetailEmail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  userDetailStatus: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  userDetailStatusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quickStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  userDetailSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    gap: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
});

export default UserManagementScreen;