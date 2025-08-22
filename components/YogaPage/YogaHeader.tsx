import { router } from 'expo-router';
import { ArrowLeft, Filter } from 'lucide-react-native';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const YogaHeader = () => {
  return (
    <SafeAreaView edges={['top']} style={styles.headerContainer}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
       <TouchableOpacity onPress={() => router.push('/(tabs)')}
          style={styles.headerButton}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Yoga Programs</Text>
          <Text style={styles.headerSubtitle}>যোগ প্রোগ্রাম</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Filter size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default YogaHeader;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#10B981',
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
});
