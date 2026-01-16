import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { useColorScheme } from 'react-native';
import { colors } from '../constants/colors';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import type { ScanFormat } from '../utils/scanUtils';

export type RootStackParamList = {
  Scanner: undefined;
  Result: { value: string; format: ScanFormat; createdAt: number };
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Stack.Navigator
      initialRouteName="Scanner"
      screenOptions={{
        headerTitleStyle: { fontWeight: '700' },
        headerStyle: {
          backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
        },
        headerTintColor: isDark ? colors.dark.text : colors.light.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: isDark ? colors.dark.background : colors.light.background,
        },
        animation: 'fade_from_bottom',
      }}>
      <Stack.Screen name="Scanner" component={ScannerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Result' }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
    </Stack.Navigator>
  );
}
