// app/auth.tsx
// (This is your old app/index.tsx, just renamed)

import React from 'react';
import { View, StyleSheet } from 'react-native';
import AuthScreen from '../components/AuthScreen'; 

export default function AuthPage() {
  // We no longer need any logic here. The _layout handles it.
  // This page's only job is to show the AuthScreen component.
  return (
    <View style={styles.container}>
      <AuthScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});