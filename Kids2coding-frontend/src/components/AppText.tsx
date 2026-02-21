import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { Colors } from '../constants/colors';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'accent' | 'text' | 'textLight' | 'error' | 'success' | 'warning';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  style,
  size = 'md',
  weight = 'regular',
  color = 'text',
  align = 'left',
  numberOfLines,
  ...props
}) => {
  const textStyles = [
    styles.base,
    styles.sizes[size],
    styles.weights[weight],
    { color: Colors[color] || Colors.text },
    { textAlign: align },
    style,
  ];

  return (
    <Text style={textStyles} numberOfLines={numberOfLines} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    color: Colors.text,
  },
  sizes: {
    xs: { fontSize: 12 },
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 18 },
    xl: { fontSize: 20 },
    xxl: { fontSize: 24 },
  },
  weights: {
    regular: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    semibold: { fontWeight: '600' },
    bold: { fontWeight: '700' },
  },
});