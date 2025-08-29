import { router } from 'expo-router';
import { ArrowLeft, Filter } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
const ConsultancyHeader = () => {
  return (
    <SafeAreaView edges={['top']} style={styles.headerContainer}>
      <LinearGradient colors={['#DD6B20', '#C05621']} style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')}
          style={styles.headerButton}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Consultancy Services</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ConsultancyHeader;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#DD6B20',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 32,
  },
});
