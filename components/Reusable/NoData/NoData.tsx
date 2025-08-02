import { useThemeColors } from '@/hooks/useThemeColors';
import { StyleSheet, Text, View } from 'react-native';

const NoData = ({ message }: { message?: string }) => {
  const colors = useThemeColors();
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        {message || 'No data found'}
      </Text>
      <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
        Try adjusting your search or filter criteria.
      </Text>
    </View>
  );
};

export default NoData;

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
