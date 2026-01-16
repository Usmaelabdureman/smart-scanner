import { BarCodeScanner, type BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type PermissionState = boolean | null;

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState<PermissionState>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [lastScan, setLastScan] = useState<{ type: string; data: string } | null>(null);

  const requestPermission = useCallback(async () => {
    setIsRequestingPermission(true);
    try {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    } finally {
      setIsRequestingPermission(false);
    }
  }, []);

  useEffect(() => {
    void requestPermission();
  }, [requestPermission]);

  const handleBarCodeScanned = useCallback(
    (result: BarCodeScannerResult) => {
      if (scanned) return;

      setScanned(true);
      setLastScan({ type: String(result.type), data: result.data });
    },
    [scanned]
  );

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
        <ThemedText style={styles.centerText}>Requesting camera permission…</ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title" style={styles.centerText}>
          Camera permission needed
        </ThemedText>
        <ThemedText style={styles.centerText}>
          Enable camera access to scan QR codes and barcodes.
        </ThemedText>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          disabled={isRequestingPermission}
          onPress={() => void requestPermission()}>
          <ThemedText type="defaultSemiBold">
            {isRequestingPermission ? 'Requesting…' : 'Grant permission'}
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlay}>
        <ThemedText type="title" style={styles.overlayTitle}>
          Scan a code
        </ThemedText>

        {lastScan ? (
          <ThemedView style={styles.resultCard}>
            <ThemedText type="defaultSemiBold">Last scan</ThemedText>
            <ThemedText numberOfLines={2}>{lastScan.data}</ThemedText>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={() => {
                setScanned(false);
                setLastScan(null);
              }}>
              <ThemedText type="defaultSemiBold">Scan again</ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          <ThemedText style={styles.overlayHint}>Point your camera at a QR code.</ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  centerText: {
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  overlayTitle: {
    textAlign: 'center',
    color: 'white',
  },
  overlayHint: {
    textAlign: 'center',
    color: 'white',
    opacity: 0.9,
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  button: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
