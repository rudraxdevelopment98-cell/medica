import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import type { ButtonVariant, ButtonSize } from '../../types';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { theme } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    };

    const sizes: Record<ButtonSize, ViewStyle> = {
      sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
      md: { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg },
      lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
    };

    const variants: Record<ButtonVariant, ViewStyle> = {
      primary: { backgroundColor: theme.primary },
      secondary: { backgroundColor: theme.surfaceSecondary },
      outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.primary },
      ghost: { backgroundColor: 'transparent' },
      danger: { backgroundColor: theme.error },
    };

    return { ...base, ...sizes[size], ...variants[variant] };
  };

  const getTextStyle = (): TextStyle => {
    const sizes: Record<ButtonSize, TextStyle> = {
      sm: { fontSize: Typography.fontSize.sm },
      md: { fontSize: Typography.fontSize.md },
      lg: { fontSize: Typography.fontSize.lg },
    };

    const variants: Record<ButtonVariant, TextStyle> = {
      primary: { color: '#FFFFFF' },
      secondary: { color: theme.text.primary },
      outline: { color: theme.primary },
      ghost: { color: theme.primary },
      danger: { color: '#FFFFFF' },
    };

    return {
      fontWeight: Typography.fontWeight.semibold,
      ...sizes[size],
      ...variants[variant],
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[getContainerStyle(), disabled && styles.disabled, style]}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : theme.primary}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});
