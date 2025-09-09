import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from './Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { LeaderboardEntry } from '../../types';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  onPress?: () => void;
  showRank?: boolean;
  compact?: boolean;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  entry,
  onPress,
  showRank = true,
  compact = false,
}) => {
  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return COLORS.textSecondary;
    }
  };

  const getRankIcon = (rank: number): keyof typeof Ionicons.glyphMap => {
    switch (rank) {
      case 1:
        return 'trophy';
      case 2:
        return 'medal';
      case 3:
        return 'medal';
      default:
        return 'person';
    }
  };

  const formatScore = (score: number): string => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (compact) {
    return (
      <Card
        style={styles.compactCard}
        onPress={onPress}
        padding={SPACING.md}
      >
        <View style={styles.compactContent}>
          {showRank && (
            <View style={[styles.rankContainer, { backgroundColor: getRankColor(entry.rank) }]}>
              <Ionicons
                name={getRankIcon(entry.rank)}
                size={16}
                color={entry.rank <= 3 ? COLORS.white : COLORS.text}
              />
              <Text style={[
                styles.rankText,
                { color: entry.rank <= 3 ? COLORS.white : COLORS.text }
              ]}>
                {entry.rank}
              </Text>
            </View>
          )}
          
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {entry.userName}
            </Text>
            <Text style={styles.testName} numberOfLines={1}>
              {entry.testName}
            </Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{formatScore(entry.score)}</Text>
            <Text style={styles.location}>{entry.location}</Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card
      style={styles.card}
      onPress={onPress}
      padding={SPACING.lg}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showRank && (
            <View style={styles.rankSection}>
              <View style={[styles.rankBadge, { backgroundColor: getRankColor(entry.rank) }]}>
                <Ionicons
                  name={getRankIcon(entry.rank)}
                  size={20}
                  color={entry.rank <= 3 ? COLORS.white : COLORS.text}
                />
                <Text style={[
                  styles.rankNumber,
                  { color: entry.rank <= 3 ? COLORS.white : COLORS.text }
                ]}>
                  #{entry.rank}
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              {entry.userImage ? (
                <Image source={{ uri: entry.userImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color={COLORS.textLight} />
                </View>
              )}
            </View>
            
            <View style={styles.userDetails}>
              <Text style={styles.userName} numberOfLines={1}>
                {entry.userName}
              </Text>
              <Text style={styles.testName} numberOfLines={1}>
                {entry.testName}
              </Text>
              <Text style={styles.location} numberOfLines={1}>
                📍 {entry.location}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <View style={styles.scoreSection}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.score}>{formatScore(entry.score)}</Text>
          </View>
          
          <Text style={styles.timestamp}>
            {formatDate(entry.timestamp)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.sm,
  },
  compactCard: {
    marginBottom: SPACING.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankSection: {
    marginRight: SPACING.md,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 50,
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 30,
    justifyContent: 'center',
  },
  rankText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  testName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  location: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  score: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
});

export default LeaderboardCard;