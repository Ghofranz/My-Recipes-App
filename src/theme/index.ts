// Design tokens — Qu'est-ce qu'on mange ?

export const Colors = {
  // Primary warm palette
  primary: '#D4541A',       // Terracotta orange
  primaryLight: '#F5885A',
  primaryDark: '#A63D10',

  // Accent
  accent: '#F5A623',        // Warm amber
  accentLight: '#FFF3DC',

  // Backgrounds
  background: '#FDF8F3',    // Warm off-white
  surface: '#FFFFFF',
  surfaceAlt: '#FFF5EC',
  card: '#FFFFFF',

  // Text
  textPrimary: '#2C1810',   // Dark brown
  textSecondary: '#7A6155',
  textMuted: '#B8A49C',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#27AE60',
  successLight: '#EAFAF1',
  warning: '#F5A623',
  warningLight: '#FFF8E7',
  error: '#E74C3C',
  errorLight: '#FDEDEC',
  missing: '#E74C3C',
  missingLight: '#FFF0EF',
  available: '#27AE60',
  availableLight: '#EAFAF1',

  // UI
  border: '#EDE0D8',
  separator: '#F0E6DE',
  shadow: 'rgba(44, 24, 16, 0.08)',
  overlay: 'rgba(44, 24, 16, 0.4)',

  // Tab bar
  tabActive: '#D4541A',
  tabInactive: '#B8A49C',
  tabBackground: '#FFFFFF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
};
