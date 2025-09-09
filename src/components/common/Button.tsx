import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...SHADOWS.sm,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        minHeight: 56,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: COLORS.primary,
      },
      secondary: {
        backgroundColor: COLORS.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    const disabledStyle: ViewStyle = disabled
      ? {
          backgroundColor: COLORS.textLight,
          borderColor: COLORS.textLight,
        }
      : {};

    const widthStyle: ViewStyle = fullWidth ? { width: '100%' } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
      ...widthStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: FONT_SIZES.sm },
      medium: { fontSize: FONT_SIZES.md },
      large: { fontSize: FONT_SIZES.lg },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: COLORS.white },
      secondary: { color: COLORS.white },
      outline: { color: COLORS.primary },
      ghost: { color: COLORS.primary },
    };

    const disabledStyle: TextStyle = disabled
      ? { color: COLORS.white }
      : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
      ...textStyle,
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
        />
      );
    }

    return (
      <>
        {icon && <>{icon}</>}
        {icon && <Text style={{ width: SPACING.sm }} />}
        <Text style={getTextStyle()}>{title}</Text>
      </>
    );
  };

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[getButtonStyle(), { paddingHorizontal: 0, paddingVertical: 0 }]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            getButtonStyle(),
            {
              backgroundColor: 'transparent',
              shadowColor: 'transparent',
              elevation: 0,
            },
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default Button;