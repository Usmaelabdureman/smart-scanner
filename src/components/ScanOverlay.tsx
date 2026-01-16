import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '../constants/colors';

type Props = {
  style?: ViewStyle;
  size?: number;
  cornerRadius?: number;
};

export function ScanOverlay({ style, size = 260, cornerRadius = 22 }: Props) {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [scanAnim]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-(size / 2) + 14, size / 2 - 14],
  });

  const frameStyle = useMemo(
    () => ({ width: size, height: size, borderRadius: cornerRadius }),
    [cornerRadius, size]
  );

  return (
    <View style={[styles.root, style]} pointerEvents="none">
      <View style={[styles.frame, frameStyle]}>
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [{ translateY }],
              width: size - 26,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  scanLine: {
    height: 2,
    alignSelf: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    shadowColor: colors.accent,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
