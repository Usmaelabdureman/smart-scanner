import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { clearScanHistory, getScanHistory, removeFromScanHistory, type ScanHistoryItem } from '../services/storage';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [items, setItems] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getScanHistory();
      setItems(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const emptyText = useMemo(() => (loading ? 'Loading…' : 'No scans yet'), [loading]);

  const onClearAll = useCallback(() => {
    if (!items.length) return;

    Alert.alert('Clear history?', 'This removes all saved scans.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await clearScanHistory();
            setItems([]);
          })();
        },
      },
    ]);
  }, [items.length]);

  const onDelete = useCallback((id: string) => {
    void (async () => {
      const next = await removeFromScanHistory(id);
      setItems(next);
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>Saved scans</Text>
        <Pressable onPress={onClearAll} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={[styles.clearText, { color: colors.danger }]}>Clear</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={items.length ? styles.listContent : styles.emptyContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: isDark ? colors.dark.mutedText : colors.light.mutedText }]}> {emptyText} </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('Result', { value: item.value, format: item.format, createdAt: item.createdAt })}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
                borderColor: isDark ? colors.dark.border : colors.light.border,
              },
              pressed && styles.pressed,
            ]}>
            <View style={styles.rowLeft}>
              <View style={[styles.formatPill, { borderColor: isDark ? colors.dark.border : colors.light.border }]}
              >
                <Text style={[styles.formatText, { color: isDark ? colors.dark.text : colors.light.text }]}>
                  {item.format.toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={[styles.value, { color: isDark ? colors.dark.text : colors.light.text }]}>
                  {item.value}
                </Text>
                <Text style={[styles.time, { color: isDark ? colors.dark.mutedText : colors.light.mutedText }]}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => onDelete(item.id)}
              hitSlop={10}
              style={({ pressed }) => [styles.deleteIcon, pressed && styles.pressed]}>
              <Ionicons name="close" size={18} color={isDark ? colors.dark.mutedText : colors.light.mutedText} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
  },
  clearText: {
    fontWeight: '800',
  },
  listContent: {
    gap: 10,
    paddingBottom: 12,
  },
  emptyContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  formatPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  formatText: {
    fontSize: 12,
    fontWeight: '900',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  deleteIcon: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
