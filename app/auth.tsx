import React from 'react';
import { View, StyleSheet } from 'react-native';
import AuthScreen from '../components/AuthScreen';
import { useLocalSearchParams } from 'expo-router';

export default function AuthPage() {
  const { mode } = useLocalSearchParams(); 
  const authMode = (mode === 'signup' || mode === 'login') ? mode : 'main';

  return (
    <View style={styles.container}>
      <AuthScreen currentAuthMode={authMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
