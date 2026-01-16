import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScannerScreen } from '../../src/screens/ScannerScreen';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScannerScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
