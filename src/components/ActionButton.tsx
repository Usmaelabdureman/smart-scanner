import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme, type ViewStyle } from 'react-native';

import { colors } from '../constants/colors';

type Props = {
  label?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function ActionButton({
  label,
  icon,
  onPress,
  variant = 'secondary',
  style,
  disabled,
  accessibilityLabel,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const textColor = variant === 'primary' ? 'white' : isDark ? colors.dark.text : colors.light.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        stylesByVariant[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <View style={styles.row}>
        <Ionicons name={icon} size={18} color={textColor} />
        {label ? (
          <Text style={[styles.label, { color: textColor }]}>
            {label}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});

const stylesByVariant = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  danger: {
    backgroundColor: colors.danger,
  },
});
