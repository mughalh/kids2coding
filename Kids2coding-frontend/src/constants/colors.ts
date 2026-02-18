export const Colors = {
  // Primary colors
  primary: '#4F46E5',      // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  
  // Secondary colors
  secondary: '#F59E0B',    // Amber
  secondaryLight: '#FBBF24',
  secondaryDark: '#D97706',
  
  // Accent colors
  accent: '#EC4899',       // Pink
  accentLight: '#F472B6',
  accentDark: '#DB2777',
  
  // Success/Warning/Error
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Background colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  text: '#1E293B',
  textLight: '#64748B',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Gradient colors for backgrounds
  gradient1: ['#667eea', '#764ba2'],
  gradient2: ['#f093fb', '#f5576c'],
  gradient3: ['#4facfe', '#00f2fe'],
  gradient4: ['#43e97b', '#38f9d7'],
  
  // Game/playful colors
  game1: '#FF6B6B',
  game2: '#4ECDC4',
  game3: '#FFD166',
  game4: '#06D6A0',
  game5: '#118AB2',
};

export type ColorKey = keyof typeof Colors;