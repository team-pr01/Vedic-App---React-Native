import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

const Chat = () => {
  const router = useRouter();

  const handleExploreWisdom = () => {
    router.push('/'); // Navigate to home page
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💬</Text>
        </View>

        <Text style={styles.title}>Chat Feature Coming Soon</Text>

        <Text style={styles.description}>
          We're working hard to bring you a seamless chatting experience where
          you can connect with fellow Vedic wisdom seekers, ask questions, and
          share insights about ancient knowledge.
        </Text>

        <Text style={styles.subDescription}>
          Stay tuned for this exciting new feature that will enhance your
          spiritual journey!
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleExploreWisdom}>
          <Text style={styles.buttonText}>Explore Vedic Wisdom</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 80,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a365d',
    marginBottom: 16,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4a5568',
    lineHeight: 24,
    marginBottom: 16,
  },
  subDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#718096',
    lineHeight: 20,
    marginBottom: 40,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Chat;
