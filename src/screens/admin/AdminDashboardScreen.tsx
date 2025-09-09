import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

const { width: screenWidth } = Dimensions.get('window');

const AdminDashboardScreen: React.FC = () => {
  const { state } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalTests: 8934,
    activeToday: 156,
    pendingReviews: 23,
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: '1',
      type: 'test_completed',
      userName: 'Arjun Singh',
      testName: 'Vertical Jump',
      score: 95.8,
      timestamp: new Date(),
      status: 'completed',
    },
    {
      id: '2',
      type: 'user_registered',
      userName: 'Priya Sharma',
      testName: null,
      score: null,
      timestamp: new Date(Date.now() - 1800000),
      status: 'pending',
    },
    {
      id: '3',
      type: 'test_completed',
      userName: 'Rahul Kumar',
      testName: 'Push-ups',
      score: 87.3,
      timestamp: new Date(Date.now() - 3600000),
      status: 'completed',
    },
    {
      id: '4',
      type: 'flagged_test',
      userName: 'Sneha Patel',
      testName: 'Agility Test',
      score: 45.2,
      timestamp: new Date(Date.now() - 5400000),
      status: 'flagged',
    },
  ]);

  const [topPerformers, setTopPerformers] = useState([
    {
      id: '1',
      name: 'Arjun Singh',
      sport: 'Football',
      location: 'Mumbai',
      averageScore: 94.2,
      totalTests: 15,
      rank: 1,
    },
    {
      id: '2',
      name: 'Priya Sharma',
      sport: 'Cricket',
      location: 'Delhi',
      averageScore: 91.8,
      totalTests: 12,
      rank: 2,
    },
    {
      id: '3',
      name: 'Rahul Kumar',
      sport: 'Basketball',
      location: 'Bangalore',
      averageScore: 89.5,
      totalTests: 18,
      rank: 3,
    },
  ]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'test_completed':
        return 'checkmark-circle';
      case 'user_registered':
        return 'person-add';
      case 'flagged_test':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'test_completed':
        return COLORS.success;
      case 'user_registered':
        return COLORS.info;
      case 'flagged_test':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'flagged':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back, {state.auth.user?.name}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.white} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{loading ? '— —' : stats.totalUsers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="fitness" size={24} color={COLORS.secondary} />
              <Text style={styles.statValue}>{loading ? '— —' : stats.totalTests.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Tests Completed</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="today" size={24} color={COLORS.accent} />
              <Text style={styles.statValue}>{loading ? '—' : stats.activeToday}</Text>
              <Text style={styles.statLabel}>Active Today</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="time" size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>{loading ? '—' : stats.pendingReviews}</Text>
              <Text style={styles.statLabel}>Pending Reviews</Text>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.actionGradient}
              >
                <Ionicons name="people" size={32} color={COLORS.white} />
                <Text style={styles.actionText}>User Management</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={[COLORS.secondary, '#EC4899']}
                style={styles.actionGradient}
              >
                <Ionicons name="fitness" size={32} color={COLORS.white} />
                <Text style={styles.actionText}>Test Management</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={[COLORS.accent, '#F59E0B']}
                style={styles.actionGradient}
              >
                <Ionicons name="analytics" size={32} color={COLORS.white} />
                <Text style={styles.actionText}>Analytics</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={[COLORS.success, '#10B981']}
                style={styles.actionGradient}
              >
                <Ionicons name="settings" size={32} color={COLORS.white} />
                <Text style={styles.actionText}>Settings</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <Card style={styles.performersCard}>
            {topPerformers.map((performer, index) => (
              <View key={performer.id} style={styles.performerItem}>
                <View style={styles.performerRank}>
                  <Text style={styles.performerRankText}>#{performer.rank}</Text>
                </View>
                
                <View style={styles.performerInfo}>
                  <Text style={styles.performerName}>{performer.name}</Text>
                  <Text style={styles.performerDetails}>
                    {performer.sport} • {performer.location}
                  </Text>
                </View>
                
                <View style={styles.performerStats}>
                  <Text style={styles.performerScore}>{performer.averageScore}%</Text>
                  <Text style={styles.performerTests}>{performer.totalTests} tests</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Card style={styles.activityCard}>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons
                    name={getActivityIcon(activity.type)}
                    size={20}
                    color={getActivityColor(activity.type)}
                  />
                </View>
                
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    {activity.type === 'test_completed' && (
                      <>{activity.userName} completed {activity.testName} with {activity.score}%</>
                    )}
                    {activity.type === 'user_registered' && (
                      <>{activity.userName} registered for the platform</>
                    )}
                    {activity.type === 'flagged_test' && (
                      <>{activity.userName}'s {activity.testName} test was flagged for review</>
                    )}
                  </Text>
                  <Text style={styles.activityTime}>
                    {formatTime(activity.timestamp)}
                  </Text>
                </View>
                
                <View style={[
                  styles.activityStatus,
                  { backgroundColor: getStatusColor(activity.status) }
                ]}>
                  <Text style={styles.activityStatusText}>
                    {activity.status}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <Card style={styles.statusCard}>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>AI Analysis Engine</Text>
                <Text style={styles.statusValue}>Operational</Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Video Processing</Text>
                <Text style={styles.statusValue}>Operational</Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.warning }]} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Database</Text>
                <Text style={styles.statusValue}>Maintenance Mode</Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>API Services</Text>
                <Text style={styles.statusValue}>Operational</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
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
  headerInfo: {
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
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: (screenWidth - SPACING.lg * 2 - SPACING.sm) / 2,
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
  performersCard: {
    padding: 0,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  performerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  performerRankText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  performerDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  performerStats: {
    alignItems: 'flex-end',
  },
  performerScore: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  performerTests: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  activityCard: {
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  activityStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  activityStatusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusCard: {
    padding: 0,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusIndicator: {
    marginRight: SPACING.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default AdminDashboardScreen;