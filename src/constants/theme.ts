export const Colors = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  error: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const LightTheme = {
  background: Colors.neutral[50],
  surface: Colors.white,
  surfaceSecondary: Colors.neutral[100],
  border: Colors.neutral[200],
  borderFocus: Colors.primary[500],
  text: {
    primary: Colors.neutral[900],
    secondary: Colors.neutral[600],
    tertiary: Colors.neutral[400],
    inverse: Colors.white,
    link: Colors.primary[600],
  },
  primary: Colors.primary[600],
  primaryLight: Colors.primary[50],
  success: Colors.success[600],
  successLight: Colors.success[50],
  warning: Colors.warning[600],
  warningLight: Colors.warning[50],
  error: Colors.error[600],
  errorLight: Colors.error[50],
  tabBar: {
    background: Colors.white,
    active: Colors.primary[600],
    inactive: Colors.neutral[400],
    border: Colors.neutral[200],
  },
};

export const DarkTheme = {
  background: Colors.neutral[900],
  surface: Colors.neutral[800],
  surfaceSecondary: Colors.neutral[700],
  border: Colors.neutral[700],
  borderFocus: Colors.primary[400],
  text: {
    primary: Colors.neutral[50],
    secondary: Colors.neutral[400],
    tertiary: Colors.neutral[600],
    inverse: Colors.neutral[900],
    link: Colors.primary[400],
  },
  primary: Colors.primary[500],
  primaryLight: Colors.primary[900],
  success: Colors.success[500],
  successLight: Colors.success[700],
  warning: Colors.warning[500],
  warningLight: Colors.warning[700],
  error: Colors.error[500],
  errorLight: Colors.error[700],
  tabBar: {
    background: Colors.neutral[900],
    active: Colors.primary[400],
    inactive: Colors.neutral[600],
    border: Colors.neutral[800],
  },
};

export type AppTheme = typeof LightTheme;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Shadows = {
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
