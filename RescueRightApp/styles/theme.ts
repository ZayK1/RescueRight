export const theme = {
    colors: {
      primary: '#3B82F6',
      secondary: '#00A896',
      success: '#059669',
      warning: '#F59E0B',
      error: '#DC2626',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        disabled: '#9CA3AF',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 8,
      md: 14,
      lg: 20,
      full: 9999,
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 8,
      },
    },
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        letterSpacing: -0.02,
      },
      h2: {
        fontSize: 28,
        fontWeight: '700' as const,
        letterSpacing: -0.02,
      },
      h3: {
        fontSize: 22,
        fontWeight: '600' as const,
        letterSpacing: -0.01,
      },
      body: {
        fontSize: 17,
        fontWeight: '400' as const,
        lineHeight: 24,
      },
      caption: {
        fontSize: 14,
        fontWeight: '500' as const,
        lineHeight: 20,
      },
    },
  };
  
  export type Theme = typeof theme;