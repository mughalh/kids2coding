import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface AppTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle' | 'caption' | 'label';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  style,
  type = 'default',
  color,
  align,
  ...props
}) => {
  const getTypeStyle = () => {
    switch (type) {
      case 'title':
        return styles.title;
      case 'subtitle':
        return styles.subtitle;
      case 'caption':
        return styles.caption;
      case 'label':
        return styles.label;
      default:
        return styles.default;
    }
  };

  return (
    <Text
      style={[
        styles.base,
        getTypeStyle(),
        color && { color },
        align && { textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    color: Colors.text,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: Colors.textLight,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textLight,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.textLight,
  },
});