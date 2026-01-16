export const colors = {
  accent: '#3B82F6',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',

  light: {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    text: '#0F172A',
    mutedText: '#475569',
    border: 'rgba(15, 23, 42, 0.12)',
    overlay: 'rgba(15, 23, 42, 0.40)',
  },

  dark: {
    background: '#0B1220',
    surface: '#0F172A',
    text: '#E5E7EB',
    mutedText: '#A1A1AA',
    border: 'rgba(229, 231, 235, 0.14)',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },
} as const;

export type AppColorScheme = 'light' | 'dark';
