import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../../context/AppContext';
import { UserStackParamList } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ChatbotWindow from '../../components/common/ChatbotWindow';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

type UserDashboardNavigationProp = StackNavigationProp<UserStackParamList, 'UserDashboard'>;

const { width: screenWidth } = Dimensions.get('window');

const UserDashboardScreen: React.FC = () => {
  const navigation = useNavigation<UserDashboardNavigationProp>();
  const { state } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  // Mock data - replace with actual API calls
  const [stats, setStats] = useState({
    totalTests: 12,
    averageScore: 85.5,
    rank: 156,
    improvement: 12.3,
  });

  const [recentTests, setRecentTests] = useState([
    {
      id: '1',
      name: 'Vertical Jump',
      score: 92,
      date: new Date(),
      improvement: '+5%',
    },
    {
      id: '2',
      name: 'Push-ups',
      score: 78,
      date: new Date(Date.now() - 86400000),
      improvement: '+2%',
    },
    {
      id: '3',
      name: 'Agility Test',
      score: 88,
      date: new Date(Date.now() - 172800000),
      improvement: '+8%',
    },
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: '1',
      title: 'National Championship Qualifier',
      date: new Date(Date.now() + 7 * 86400000),
      location: 'Delhi',
      type: 'Competition',
    },
    {
      id: '2',
      title: 'Monthly Assessment',
      date: new Date(Date.now() + 14 * 86400000),
      location: 'Local Center',
      type: 'Assessment',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Example: merge context events with local ones
    if (state.events && state.events.length > 0) {
      const merged = [
        ...upcomingEvents,
        ...state.events.map(e => ({ id: e.id, title: e.title, date: e.date, location: e.location, type: e.type })),
      ];
      // Deduplicate by id
      const seen: Record<string, boolean> = {};
      setUpcomingEvents(merged.filter(ev => (seen[ev.id] ? false : (seen[ev.id] = true))));
    }
    await new Promise(resolve => setTimeout(resolve, 400));
    setRefreshing(false);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {state.auth.user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{state.auth.user?.name || 'User'}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.chatbotButton}
            onPress={() => setShowChatbot(true)}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="fitness" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{stats.totalTests}</Text>
              <Text style={styles.statLabel}>Tests Completed</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="trophy" size={24} color={COLORS.accent} />
              <Text style={styles.statValue}>{stats.averageScore}%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="medal" size={24} color={COLORS.secondary} />
              <Text style={styles.statValue}>#{stats.rank}</Text>
              <Text style={styles.statLabel}>National Rank</Text>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('TestSelection')}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.actionGradient}
              >
                <Ionicons name="play-circle" size={32} color={COLORS.white} />
                <Text style={styles.actionText}>Start Test</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <LinearGradient
                colors={[COLORS.secondary, '#EC4899']}
                style={styles.actionGradient}
              >
                <Ionicons name="trophy" size={32} color={COLORS.white} />
                <Text style={styles.actionText}>Leaderboard</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Profile')}
            >
              <LinearGradient
                colors={[COLORS.accent, '#F59E0B']}
                style={styles.actionGradient}
              >
                <Ionicons name="person" size={32} color={COLORS.white} />
                <Text style={styles.actionText}>Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setShowChatbot(true)}
            >
              <LinearGradient
                colors={[COLORS.success, '#10B981']}
                style={styles.actionGradient}
              >
                <Ionicons name="chatbubble" size={32} color={COLORS.white} />
                <Text style={styles.actionText}>AI Assistant</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Tests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tests</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTests.map((test) => (
            <Card key={test.id} style={styles.testCard} onPress={() => navigation.navigate('TestReport', { testId: test.id })}>
              <View style={styles.testContent}>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testDate}>{formatDate(test.date)}</Text>
                </View>
                <View style={styles.testScore}>
                  <Text style={styles.scoreValue}>{test.score}%</Text>
                  <Text style={styles.improvementText}>{test.improvement}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          
          {upcomingEvents.map((event) => (
            <Card key={event.id} style={styles.eventCard} onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}>
              <View style={styles.eventContent}>
                <View style={styles.eventIcon}>
                  <Ionicons
                    name={event.type === 'Competition' ? 'trophy' : 'clipboard'}
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDetails}>
                    {formatDate(event.date)} • {event.location}
                  </Text>
                </View>
                <TouchableOpacity style={styles.eventBadge} onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}>
                  <Text style={styles.eventBadgeText}>Details</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Performance Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Trend</Text>
          <Card style={styles.chartCard}>
            <View style={styles.chartPlaceholder}>
              <View style={{ width: '100%', height: 140, justifyContent: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                  {[60, 72, 68, 80, 76, 84].map((v, i) => (
                    <View key={i} style={{ flex: 1, height: v, backgroundColor: i === 5 ? COLORS.primary : COLORS.surface, borderRadius: 8 }} />
                  ))}
                </View>
              </View>
              <Text style={styles.chartPlaceholderText}>
                Your last 6 test scores
              </Text>
              <TouchableOpacity onPress={() => {}} style={[styles.analyticsButton]}>
                <Text style={styles.analyticsButtonText}>View Detailed Analytics</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Chatbot Window */}
      <ChatbotWindow
        visible={showChatbot}
        onClose={() => setShowChatbot(false)}
        title="AI Sports Assistant"
        placeholder="Ask me about your performance, training tips, or anything else..."
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userId: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  chatbotButton: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: (screenWidth - SPACING.lg * 2 - SPACING.md) / 2,
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  actionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  testCard: {
    marginBottom: SPACING.sm,
  },
  testContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  testDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  testScore: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  improvementText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '500',
  },
  eventCard: {
    marginBottom: SPACING.sm,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  eventDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  eventBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  eventBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '500',
  },
  chartCard: {
    padding: SPACING.xl,
  },
  chartPlaceholder: {
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  chartButton: {
    marginTop: SPACING.md,
  },
  analyticsButton: {
    marginTop: SPACING.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
  },
  analyticsButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default UserDashboardScreen;