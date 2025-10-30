import { useThemeColors } from '@/hooks/useThemeColors';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

function LoadingComponent({ loading,color }: { loading?: string,color?:string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="small"  color={color || colors.border} />
      {loading && <Text style={{ color: colors.text, marginTop: 10 }}>
        Loading {loading}...
      </Text>}
    </View>
  );
}

export default LoadingComponent;

const styles = StyleSheet.create({
  
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
