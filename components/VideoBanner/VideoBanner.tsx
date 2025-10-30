import { useThemeColors } from '@/hooks/useThemeColors';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Play, Film, Video, Clapperboard, Youtube } from 'lucide-react-native';

export default function VideoBanner() {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        {
          borderLeftColor: colors.info,
          backgroundColor: colors.info + '1A',
          overflow: 'hidden',
        },
      ]}
    >
      {/* Decorative Video Icons */}
      <View style={{ position: 'absolute', top: -10, right: -10 }}>
        <Film
          color={colors.background}
          size={88}
          style={{ transform: [{ rotate: '15deg' }] }}
        />
      </View>
      <View style={{ position: 'absolute', top: 13, left: 40 }}>
        <Play
          color={colors.background}
          size={38}
          style={{ transform: [{ rotate: '-15deg' }] }}
        />
      </View>
      <View style={{ position: 'absolute', bottom: -60, left: 46 }}>
        <Youtube
          color={colors.background}
          size={88}
          style={{ transform: [{ rotate: '5deg' }] }}
        />
      </View>
      <View style={{ position: 'absolute', bottom: -10, right: -16 }}>
        <Video
          color={colors.background}
          size={38}
          style={{ transform: [{ rotate: '-25deg' }] }}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.playIconContainer, { backgroundColor: colors.info }]}>
            <Play color={colors.background} size={24} fill={colors.background} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Video Library
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Discover enlightening content on Hindu scriptures, mantras, and philosophy
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Clapperboard color={colors.info} size={16} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Bhagavad Gita Explained
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Film color={colors.info} size={16} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Mantra Chanting
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Video color={colors.info} size={16} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Spiritual Stories
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={() => {
            router.push('/texts');
          }}
          style={[styles.button, { backgroundColor: colors.info }]}
        >
          <Play color={colors.background} size={20} fill={colors.background} />
          <Text style={styles.buttonText}>Explore Videos</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 50,
    minHeight: 200,
  },
  content: {
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  playIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 25,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});