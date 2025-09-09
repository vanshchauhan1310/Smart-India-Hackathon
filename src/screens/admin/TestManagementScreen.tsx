import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { TESTS, COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

const TestManagementScreen: React.FC = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

  // Enhanced test data with more details
  const enhancedTests = TESTS.map(test => ({
    ...test,
    difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
    status: ['active', 'draft', 'archived'][Math.floor(Math.random() * 3)],
    completions: Math.floor(Math.random() * 500) + 50,
    averageScore: Math.floor(Math.random() * 30) + 70,
    createdDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
    lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
  }));

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleTestAction = (action: string, test: any) => {
    switch (action) {
      case 'edit':
        navigation?.navigate('EditTest', { test });
        break;
      case 'configure':
        navigation?.navigate('ConfigureTest', { test });
        break;
      case 'duplicate':
        Alert.alert('Duplicate Test', `Create a copy of "${test.name}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Duplicate', onPress: () => console.log('Duplicating test') },
        ]);
        break;
      case 'archive':
        Alert.alert('Archive Test', `Archive "${test.name}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Archive', style: 'destructive', onPress: () => console.log('Archiving test') },
        ]);
        break;
      default:
        break;
    }
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

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Easy':
        return COLORS.success;
      case 'Medium':
        return COLORS.warning;
      case 'Hard':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'draft':
        return COLORS.warning;
      case 'archived':
        return COLORS.textSecondary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getFilteredAndSortedTests = () => {
    let filtered = enhancedTests;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }

    // Sort tests
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdDate' || sortBy === 'lastUpdated') {
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
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const categoryOptions = [
    { key: 'all', label: 'All Tests', count: enhancedTests.length },
    { key: 'fitness', label: 'Fitness', count: enhancedTests.filter(t => t.category === 'fitness').length },
    { key: 'strength', label: 'Strength', count: enhancedTests.filter(t => t.category === 'strength').length },
    { key: 'endurance', label: 'Endurance', count: enhancedTests.filter(t => t.category === 'endurance').length },
    { key: 'skill', label: 'Skill', count: enhancedTests.filter(t => t.category === 'skill').length },
  ];

  // Create a reusable FilterChip component for consistent styling
  const FilterChip = ({ category, isSelected, onPress, isHorizontalLayout }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && styles.activeFilterChip,
        // Apply marginRight only for horizontal layout
        isHorizontalLayout && { marginRight: SPACING.md }
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          isSelected && styles.activeFilterChipText,
        ]}
      >
        {category.label}
      </Text>
      <View style={[
        styles.filterCount,
        isSelected && styles.activeFilterCount,
      ]}>
        <Text style={[
          styles.filterCountText,
          isSelected && styles.activeFilterCountText,
        ]}>
          {category.count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTestCard = ({ item: test, index }) => (
    <Card
      key={test.id}
      style={[
        styles.testCard,
        {
          width: isTablet ? getItemWidth() : '100%',
          marginRight: isTablet && (index + 1) % getColumns() !== 0 ? SPACING.sm : 0,
        }
      ]}
    >
      <View style={styles.testHeader}>
        <View style={styles.testIconContainer}>
          <View style={[styles.testIcon, { backgroundColor: getCategoryColor(test.category) + '20' }]}>
            <Text style={styles.testEmoji}>{test.icon}</Text>
          </View>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(test.status) }
          ]} />
        </View>
        
        <View style={styles.testInfo}>
          <View style={styles.testTitleRow}>
            <Text style={styles.testName} numberOfLines={2}>{test.name}</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.testDescription} numberOfLines={2}>{test.description}</Text>
          
          <View style={styles.testBadges}>
            <View style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(test.category) }
            ]}>
              <Text style={styles.categoryText}>{test.category}</Text>
            </View>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(test.difficulty) + '20' }
            ]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(test.difficulty) }]}>
                {test.difficulty}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.testMetrics}>
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Ionicons name="time" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metricValue}>{test.duration}s</Text>
          </View>
          <Text style={styles.metricLabel}>Duration</Text>
        </View>
        
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Ionicons name="people" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metricValue}>{test.completions}</Text>
          </View>
          <Text style={styles.metricLabel}>Completed</Text>
        </View>
        
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Ionicons name="trending-up" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metricValue}>{test.averageScore}%</Text>
          </View>
          <Text style={styles.metricLabel}>Avg Score</Text>
        </View>
      </View>

      <View style={styles.testFooter}>
        <Text style={styles.lastUpdated}>
          Updated {formatDate(test.lastUpdated)}
        </Text>
        <View style={styles.testActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleTestAction('edit', test)}
          >
            <Ionicons name="create" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleTestAction('configure', test)}
          >
            <Ionicons name="settings" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleTestAction('duplicate', test)}
          >
            <Ionicons name="copy" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Test Management</Text>
          <Text style={styles.subtitle}>Manage and configure assessment tests</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="analytics" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="Create Test"
            onPress={() => navigation?.navigate('CreateTest')}
            style={styles.primaryAction}
            icon="add"
          />
          <TouchableOpacity 
            style={styles.secondaryAction}
            onPress={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}
          >
            <Ionicons 
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
              size={20} 
              color={COLORS.primary} 
            />
            <Text style={styles.secondaryActionText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        {isTablet ? (
          <View style={styles.filtersWrap}>
            {categoryOptions.map((category) => (
              <FilterChip
                key={category.key}
                category={category}
                isSelected={selectedCategory === category.key}
                onPress={() => setSelectedCategory(category.key)}
                isHorizontalLayout={false}
              />
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {categoryOptions.map((category) => (
              <FilterChip
                key={category.key}
                category={category}
                isSelected={selectedCategory === category.key}
                onPress={() => setSelectedCategory(category.key)}
                isHorizontalLayout={true}
              />
            ))}
          </ScrollView>
        )}

        {/* Tests List */}
        <FlatList
          data={getFilteredAndSortedTests()}
          renderItem={renderTestCard}
          keyExtractor={(item) => item.id}
          numColumns={getColumns()}
          key={getColumns()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.testsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyStateTitle}>No tests found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Create your first test to get started
              </Text>
              <Button
                title="Create Test"
                onPress={() => navigation?.navigate('CreateTest')}
                style={styles.emptyStateButton}
              />
            </View>
          }
        />
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
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  primaryAction: {
    flex: 1,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
    gap: SPACING.xs,
  },
  secondaryActionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
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
    color: COLORS.black,
    fontWeight: '500',
    marginRight: SPACING.sm,
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
  testsList: {
    paddingBottom: SPACING.xl,
  },
  testCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  testIconContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  testIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testEmoji: {
    fontSize: 24,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  testInfo: {
    flex: 1,
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  testName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  testDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  testBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  difficultyText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  testMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  metricValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  testFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastUpdated: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },
  testActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    paddingHorizontal: SPACING.xl,
  },
});

export default TestManagementScreen;