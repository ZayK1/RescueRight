// Medical-Grade Design System
// Inspired by: Apple Health, Epic MyChart, Phillips HealthSuite

export const theme = {
  colors: {
    // Primary medical blue - trust, professionalism, clinical
    primary: '#0066CC',
    primaryLight: '#3385DB',
    primaryDark: '#004C99',

    // Clinical accent colors
    secondary: '#00B8A9',

    // Medical status colors (AHA Guidelines inspired)
    success: '#00C48C',      // Optimal performance
    warning: '#FF8B00',      // Needs attention
    error: '#FF3B30',        // Critical
    info: '#007AFF',         // Informational

    // Neutral medical grays
    background: '#F5F7FA',   // Soft clinical white
    surface: '#FFFFFF',
    surfaceElevated: '#FAFBFC',
    border: '#E5E9F0',
    borderLight: '#EDF1F7',

    // Text hierarchy
    text: {
      primary: '#1A2332',    // Medical records dark
      secondary: '#4A5568',  // Clinical notes gray
      tertiary: '#718096',   // Metadata gray
      disabled: '#A0AEC0',
      inverse: '#FFFFFF',
    },

    // Additional color properties for legacy components
    foreground: '#1A2332',
    mutedForeground: '#718096',
    card: '#FFFFFF',
    destructive: '#FF3B30',

    // Clinical data visualization
    chart: {
      optimal: '#00C48C',
      good: '#4ECDC4',
      moderate: '#FFE66D',
      warning: '#FF8B00',
      critical: '#FF3B30',
    },

    // Overlay and shadows
    overlay: 'rgba(26, 35, 50, 0.5)',
    shadowLight: 'rgba(0, 102, 204, 0.08)',
    shadowMedium: 'rgba(0, 102, 204, 0.12)',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Medical-grade elevation system
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#0066CC',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#0066CC',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#0066CC',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#0066CC',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  // Medical typography system
  typography: {
    // Display - for critical metrics
    display: {
      fontSize: 48,
      fontWeight: '700' as const,
      letterSpacing: -0.03,
      lineHeight: 56,
    },
    // Headers
    h1: {
      fontSize: 34,
      fontWeight: '700' as const,
      letterSpacing: -0.02,
      lineHeight: 41,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600' as const,
      letterSpacing: -0.02,
      lineHeight: 34,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600' as const,
      letterSpacing: -0.01,
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      letterSpacing: 0,
      lineHeight: 24,
    },
    // Body text
    body: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    bodyMedium: {
      fontSize: 17,
      fontWeight: '500' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    bodySemibold: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    // Small text
    caption: {
      fontSize: 15,
      fontWeight: '500' as const,
      lineHeight: 20,
      letterSpacing: 0,
    },
    caption2: {
      fontSize: 13,
      fontWeight: '500' as const,
      lineHeight: 18,
      letterSpacing: 0.01,
    },
    // Micro text
    micro: {
      fontSize: 11,
      fontWeight: '600' as const,
      lineHeight: 14,
      letterSpacing: 0.02,
    },
    // Small text variant for legacy components
    small: {
      fontSize: 13,
      fontWeight: '500' as const,
      lineHeight: 18,
      letterSpacing: 0.01,
    },
  },

  // Animation timings (medical devices feel instant)
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
};

export type Theme = typeof theme;
