import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from './src/constants/colors';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const base = (isDark ? DarkTheme : DefaultTheme) as Theme;
  const theme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: isDark ? colors.dark.background : colors.light.background,
      card: isDark ? colors.dark.surface : colors.light.surface,
      text: isDark ? colors.dark.text : colors.light.text,
      border: isDark ? colors.dark.border : colors.light.border,
      notification: colors.accent,
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
