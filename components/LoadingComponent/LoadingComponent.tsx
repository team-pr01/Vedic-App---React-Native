import { useThemeColors } from '@/hooks/useThemeColors';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

function LoadingComponent({ loading,color }: { loading: string,color:string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.container, styles.loaderContainer]}>
      <ActivityIndicator size="large" color={color} />
      <Text style={{ color: colors.text, marginTop: 10 }}>
        Loading {loading}...
      </Text>
    </View>
  );
}

export default LoadingComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});
