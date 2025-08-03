import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllBooksQuery } from '@/redux/features/Book/bookApi';

interface SacredText {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  chapters: number;
  verses: number;
  image: string;
}

interface SacredTextsSectionProps {
  onTextClick: (textId: string) => void;
}


export default function SacredTextsSection({ onTextClick }: SacredTextsSectionProps) {
  const colors = useThemeColors();
  const {data,isLoading} = useGetAllBooksQuery({});
  const handleTextPress = (textId: string) => {
    onTextClick(textId);
    // Navigate to the Veda reader page
    router.push(`/(tabs)/veda-reader?vedaId=${textId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>Sacred Texts</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>পবিত্র গ্রন্থসমূহ</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {data?.data.map((text, index) => (
          <TouchableOpacity 
            key={text.id}
            style={[
              styles.textCard, 
              { 
                marginLeft: index === 0 ? 16 : 12,
                backgroundColor: colors.card,
                shadowColor: colors.cardShadow
              }
            ]}
            onPress={() => handleTextPress(text._id)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: text.imageUrl }} style={styles.textImage} />
            <View style={styles.textOverlay}>
              <View style={styles.textContent}>
                <Text style={styles.textTitle}>{text.title}</Text>
                <Text style={styles.textSubtitle}>{text.category}</Text>
                <Text style={styles.textDescription}>{text.description}</Text>
                <View style={styles.textMeta}>
                  <BookOpen size={12} color="#E2E8F0" />
                  <Text style={styles.textMetaText}>
                    {text.chapters} chapters • {text.verses} verses
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollView: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingRight: 16,
  },
  textCard: {
    width: 180,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  textImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  textContent: {
    padding: 12,
  },
  textTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  textSubtitle: {
    fontSize: 12,
    color: '#E2E8F0',
    marginBottom: 4,
  },
  textDescription: {
    fontSize: 11,
    color: '#CBD5E0',
    marginBottom: 8,
  },
  textMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textMetaText: {
    fontSize: 10,
    color: '#E2E8F0',
    marginLeft: 4,
  },
});