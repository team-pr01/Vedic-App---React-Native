import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AuthScreen from '@/components/AuthPages/AuthScreen';

export default function AuthPage() {
  const { mode } = useLocalSearchParams(); 
  const authMode = (mode === 'signup' || mode === 'login' || mode==='resetPassword') ? mode : 'main';

  return (
    <View style={styles.container}>
      <AuthScreen currentAuthMode={authMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
