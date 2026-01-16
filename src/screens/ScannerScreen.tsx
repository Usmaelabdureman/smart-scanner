import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
  type BarcodeType,
} from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../constants/colors';
import { ScanOverlay } from '../components/ScanOverlay';
import { ActionCard } from '../components/ActionCard';
import { DeveloperCard } from '../components/DeveloperCard';
import { detectScanFormat } from '../utils/scanUtils';
import { addToScanHistory } from '../services/storage';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ScannerScreen() {
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isHandlingScan, setIsHandlingScan] = useState(false);
  const [scanMode, setScanMode] = useState<'qr' | 'barcode' | null>(null);
  const insets = useSafeAreaInsets();

  const soundRef = useRef<Audio.Sound | null>(null);

  const overlayTextColor = 'white';

  useEffect(() => {
    // Ask on initial load
    if (!permission) return;
    if (permission.granted) return;
    if (permission.canAskAgain) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    // Prepare a tiny embedded beep (short WAV) for scan feedback.
    // If this fails, we still have haptics.
    const init = async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

        const uri = createBeepDataUri({
          durationMs: 70,
          frequencyHz: 880,
          sampleRate: 8000,
          volume: 0.35,
        });
        const { sound } = await Audio.Sound.createAsync({ uri }, { volume: 0.9 });
        soundRef.current = sound;
      } catch {
        // ignore
      }
    };

    void init();

    return () => {
      void soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Reset scan lock whenever we come back to this screen.
    if (isFocused) setIsHandlingScan(false);
  }, [isFocused]);

  const barcodeTypes = useMemo<BarcodeType[]>(() => {
    if (scanMode === 'qr') {
      return ['qr', 'aztec', 'datamatrix', 'pdf417'];
    }
    if (scanMode === 'barcode') {
      return [
        'ean13',
        'ean8',
        'code128',
        'code39',
        'code93',
        'upc_a',
        'upc_e',
        'itf14',
      ];
    }
    return [];
  }, [scanMode]);

  const handleScan = useCallback(
    async (result: BarcodeScanningResult) => {
      if (!isFocused) return;
      if (isHandlingScan) return;
      if (!result?.data) return;

      setIsHandlingScan(true);

      const { format, value } = detectScanFormat(result.data);
      const createdAt = Date.now();

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // ignore
      }

      try {
        await soundRef.current?.replayAsync();
      } catch {
        // ignore
      }

      try {
        await addToScanHistory({ format, value, createdAt });
      } catch {
        // ignore
      }

      navigation.navigate('Result', { format, value, createdAt });

      // Let navigation settle, then allow scanning again when user returns.
      setTimeout(() => setIsHandlingScan(false), 800);
    },
    [isFocused, isHandlingScan, navigation]
  );

  const showPermissionDenied = useCallback(() => {
    Alert.alert(
      'Camera access needed',
      'Enable camera access in Settings to scan QR codes and barcodes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            void Linking.openSettings();
          },
        },
      ]
    );
  }, []);

  const canScan = Boolean(permission?.granted) && isFocused && !isHandlingScan;

  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
        <Text style={[styles.centerTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>Loading…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
        <Text style={[styles.centerTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>Camera permission</Text>
        <Text style={[styles.centerSubtitle, { color: isDark ? colors.dark.mutedText : colors.light.mutedText }]}>We need access to your camera to scan.</Text>

        <Pressable
          onPress={() => void requestPermission()}
          disabled={!permission.canAskAgain}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>
            {permission.canAskAgain ? 'Grant permission' : 'Permission blocked'}
          </Text>
        </Pressable>

        {!permission.canAskAgain ? (
          <View style={{ gap: 10, marginTop: 8, alignItems: 'center' }}>
            <Pressable
              onPress={() => void Linking.openSettings()}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
              <Text style={[styles.secondaryButtonText, { color: isDark ? colors.dark.text : colors.light.text }]}>
                Open Settings
              </Text>
            </Pressable>

            <Pressable
              onPress={showPermissionDenied}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
              <Text style={[styles.linkButtonText, { color: colors.accent }]}>Why can’t I enable it?</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  if (!scanMode) {
    const fadeAnimStyle = { opacity: 1 }; // Simple fade-in placeholder if needed

    return (
      <LinearGradient
        colors={isDark ? ['#0f172a', '#334155'] : ['#f0f9ff', '#e0f2fe']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}>
        <View
          style={[
            styles.landingContainer,
            {
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
            },
          ]}>
          <View style={styles.headerSection}>
            <Text style={[styles.appName, { color: isDark ? colors.dark.text : colors.light.text }]}>
              Smart Scanner
            </Text>
            <Text style={[styles.appSubtitle, { color: isDark ? colors.dark.mutedText : colors.light.mutedText }]}>
              Fast & Secure QR / Barcode Scanner
            </Text>
          </View>

          <View style={styles.actionsSection}>
            <ActionCard
              title="Scan QR Code"
              subtitle="Websites, Contacts, Wi-Fi & more"
              icon="qr-code-outline"
              onPress={() => setScanMode('qr')}
            />
            <ActionCard
              title="Scan Barcode"
              subtitle="Products, Books, ISBN & EAN"
              icon="barcode-outline"
              onPress={() => setScanMode('barcode')}
              style={{ marginTop: 16 }}
            />
            <ActionCard
              title="History"
              subtitle="View your past scans"
              icon="time-outline"
              onPress={() => navigation.navigate('History')}
              style={{ marginTop: 16 }}
            />
          </View>

          <DeveloperCard
            name="Usmael A."
            role="App Developer"
            avatarImage={require('../../assets/images/esmu.png')}
            socials={[
              { icon: 'logo-github', url: 'https://github.com/usmaelabdureman' },
              { icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/usmael-lkdn' },
              { icon: 'logo-twitter', url: 'https://x.com/esmiz_o' },
            ]}
          />
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torchEnabled}
          barcodeScannerSettings={{ barcodeTypes }}
          onBarcodeScanned={canScan ? handleScan : undefined}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000' }]} />
      )}

      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        <Pressable
          onPress={() => setScanMode(null)}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed, { marginRight: 12 }]}>
          <Ionicons name="arrow-back" size={22} color={overlayTextColor} />
        </Pressable>
        <Text style={[styles.title, { color: overlayTextColor }]}>
          {scanMode === 'qr' ? 'Scan QR' : 'Scan Barcode'}
        </Text>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.centerOverlay}>
        <ScanOverlay />
        <Text style={[styles.hint, { color: overlayTextColor }]}>Align the code inside the frame</Text>
      </View>

      <View style={[styles.bottomBar, { bottom: insets.bottom + 18 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={torchEnabled ? 'Turn flashlight off' : 'Turn flashlight on'}
          onPress={() => setTorchEnabled((v) => !v)}
          style={({ pressed }) => [styles.fab, pressed && styles.iconPressed]}>
          <Ionicons name={torchEnabled ? 'flashlight' : 'flashlight-outline'} size={22} color={overlayTextColor} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  landingContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    marginBottom: 40,
    marginTop: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  actionsSection: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  centerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  centerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 10,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  linkButtonText: {
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
  topBar: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  iconButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: {
    opacity: 0.85,
  },
  centerOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 14,
  },
  hint: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.92,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});

function createBeepDataUri(options: {
  durationMs: number;
  frequencyHz: number;
  sampleRate: number;
  volume: number;
}): string {
  const { durationMs, frequencyHz, sampleRate, volume } = options;
  const numSamples = Math.max(1, Math.floor((sampleRate * durationMs) / 1000));

  // 8-bit PCM mono
  const data = new Uint8Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const s = Math.sin(2 * Math.PI * frequencyHz * t);
    const v = 128 + Math.round(s * 127 * Math.min(1, Math.max(0, volume)));
    data[i] = Math.max(0, Math.min(255, v));
  }

  const header = createWavHeader({
    sampleRate,
    numChannels: 1,
    bitsPerSample: 8,
    dataByteLength: data.length,
  });

  const wav = concatBytes(header, data);
  const base64 = bytesToBase64(wav);
  return `data:audio/wav;base64,${base64}`;
}

function createWavHeader(input: {
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
  dataByteLength: number;
}): Uint8Array {
  const { sampleRate, numChannels, bitsPerSample, dataByteLength } = input;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;

  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM
  view.setUint16(20, 1, true); // audio format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataByteLength, true);

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;

    const triplet = (b1 << 16) | (b2 << 8) | b3;
    const c1 = (triplet >> 18) & 0x3f;
    const c2 = (triplet >> 12) & 0x3f;
    const c3 = (triplet >> 6) & 0x3f;
    const c4 = triplet & 0x3f;

    output += alphabet[c1] + alphabet[c2];
    output += i + 1 < bytes.length ? alphabet[c3] : '=';
    output += i + 2 < bytes.length ? alphabet[c4] : '=';
  }

  return output;
}
