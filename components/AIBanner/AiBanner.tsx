import { useThemeColors } from '@/hooks/useThemeColors';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Book, BookAIcon, BookCheck, BookCopy, BookDashed, BookHeadphones } from 'lucide-react-native';
export default function AIBanner() {
  const colors = useThemeColors();
  const exampleQuestions = [
    'What is the meaning of this shloka from the Bhagavad Gita?',
  ];

  return (
    <View
      style={[
        styles.container,
        {
          borderLeftColor: colors.primary,
          backgroundColor: colors.primary + '1A',
          overflow: 'hidden',
        },
      ]}
    >
      <View style={{ position: 'absolute', top: -10, right: -10 }}>
        <BookCheck
          color={colors.background}
          size={88}
          style={{ transform: [{ rotate: '45deg' }] }}
        />
      </View>
      <View style={{ position: 'absolute', top: 13, left: 40 }}>
        <BookCheck
          color={colors.background}
          size={38}
          style={{ transform: [{ rotate: '45deg' }] }}
        />
      </View>
      <View style={{ position: 'absolute', top: 100, left: 10 }}>
        <BookCheck
          color={colors.background}
          size={28}
          style={{ transform: [{ rotate: '45deg' }] }}
        />
      </View>
      <View style={{ position: 'absolute', bottom: 60, left: 160 }}>
        <BookCheck
          color={colors.background}
          size={58}
          style={{ transform: [{ rotate: '45deg' }] }}
        />
      </View>
      <View style={{ position: 'absolute', bottom: -60, left: 46 }}>
        <BookCheck
          color={colors.background}
          size={88}
          style={{ transform: [{ rotate: '45deg' }] }}
        />
      </View>
      <View style={{ position: 'absolute', bottom: -10, right: -16 }}>
        <BookCheck
          color={colors.background}
          size={38}
          style={{ transform: [{ rotate: '45deg' }] }}
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        Curious about Sanatan Dharma?
      </Text>
      <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
        Your AI guide is here to help. Try asking:
      </Text>

      {/* Example Questions */}
      <View style={styles.examplesContainer}>
        {exampleQuestions.map((question, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              router.push('/texts');
            }}
            style={[styles.exampleBubble, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.exampleText, { color: colors.text }]}>
              "{question}"
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
      onPress={() => {
              router.push('/texts');
            }}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.buttonText}>Chat with AI Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 10,
    borderLeftWidth: 5,
    position: 'relative',
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
  },
  examplesContainer: {
    marginBottom: 15,
  },
  exampleBubble: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 12,
    color: '#1b5e20',
    fontStyle: 'italic',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
