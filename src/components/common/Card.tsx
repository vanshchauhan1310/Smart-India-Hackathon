import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, BORDER_RADIUS, SHADOWS, SPACING } from '../../constants';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padding?: number;
  margin?: number;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = SPACING.md,
  margin = 0,
  elevation = 'md',
  onPress,
  ...touchableProps
}) => {
  const getElevationStyle = (): ViewStyle => {
    switch (elevation) {
      case 'none':
        return {};
      case 'sm':
        return SHADOWS.sm;
      case 'md':
        return SHADOWS.md;
      case 'lg':
        return SHADOWS.lg;
      case 'xl':
        return SHADOWS.xl;
      default:
        return SHADOWS.md;
    }
  };

  const flattenedStyle = Array.isArray(style) ? StyleSheet.flatten(style) : style;

  const cardStyle: ViewStyle = {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding,
    margin,
    ...getElevationStyle(),
    ...flattenedStyle,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.8}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

export default Card;