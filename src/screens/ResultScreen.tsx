import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { colors } from '../constants/colors';
import type { RootStackParamList } from '../navigation/AppNavigator';

type ResultRoute = RouteProp<RootStackParamList, 'Result'>;

export function ResultScreen() {
  const route = useRoute<ResultRoute>();
  const { value, format, createdAt } = route.params;

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [copied, setCopied] = useState(false);

  const title = useMemo(() => {
    switch (format) {
      case 'url':
        return 'URL';
      case 'email':
        return 'Email';
      case 'phone':
        return 'Phone';
      default:
        return 'Text';
    }
  }, [format]);

  const timestampText = useMemo(() => {
    try {
      return new Date(createdAt).toLocaleString();
    } catch {
      return '';
    }
  }, [createdAt]);

  const canOpen = format === 'url';

  const onOpen = async () => {
    try {
      if (!canOpen) return;
      const supported = await Linking.canOpenURL(value);
      if (!supported) {
        Alert.alert('Cannot open', 'This URL is not supported on this device.');
        return;
      }
      await Linking.openURL(value);
    } catch {
      Alert.alert('Error', 'Unable to open this link.');
    }
  };

  const onCopy = async () => {
    try {
      await Clipboard.setStringAsync(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      Alert.alert('Error', 'Unable to copy to clipboard.');
    }
  };

  const onShare = async () => {
    try {
      await Share.share({ message: value });
    } catch {
      // ignore (user can cancel)
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
      <View style={[styles.card, { backgroundColor: isDark ? colors.dark.surface : colors.light.surface, borderColor: isDark ? colors.dark.border : colors.light.border }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{title}</Text>
          </View>
          <Text style={[styles.timestamp, { color: isDark ? colors.dark.mutedText : colors.light.mutedText }]}>
            {timestampText}
          </Text>
        </View>

        <Text style={[styles.value, { color: isDark ? colors.dark.text : colors.light.text }]} selectable>
          {value}
        </Text>
      </View>

      <View style={styles.actions}>
        <Action
          label={canOpen ? 'Open' : 'Open (URL only)'}
          icon="open-outline"
          onPress={onOpen}
          disabled={!canOpen}
          primary
        />
        <Action label={copied ? 'Copied' : 'Copy'} icon="copy-outline" onPress={onCopy} />
        <Action label="Share" icon="share-outline" onPress={onShare} />
      </View>
    </View>
  );
}

function Action({
  label,
  icon,
  onPress,
  disabled,
  primary,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const baseBg = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.92)';
  const baseFg = isDark ? colors.dark.text : colors.light.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: primary ? colors.accent : baseBg },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Ionicons name={icon} size={18} color={primary ? 'white' : baseFg} />
      <Text style={[styles.actionText, { color: primary ? 'white' : baseFg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.14)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  actionText: {
    fontWeight: '700',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});
