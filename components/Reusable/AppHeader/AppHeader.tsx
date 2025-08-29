import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

type HeaderProps = {
  title: string;
  subtitle?: string;
  colors?: string[]; // Gradient colors
  backPath?: string; // Path for back navigation
  showRight?: boolean; // Right placeholder or not
};

const AppHeader = ({
  title,
  subtitle,
  colors = ['#DD6B20', '#C05621'], // default orange gradient
  backPath = '/(tabs)',
  showRight = true,
}: HeaderProps) => {
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors[0] ,elevation:10 ,marginTop:60}}>
      <LinearGradient colors={colors} style={styles.header}>
        <TouchableOpacity onPress={() => router.push(backPath)} style={styles.headerButton}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>

        {showRight ? <View style={styles.headerPlaceholder} /> : <View style={{ width: 0 }} />}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 3,
    backgroundColor:"red",
  },
  headerButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D1FAE5',
  },
  headerPlaceholder: {
    width: 32,
  },
});
