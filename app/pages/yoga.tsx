import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Mic,
  CircleStop as StopCircle,
  Calendar,
  Clock,
  User,
  Star,
  ArrowLeft,
  Filter,
  Play,
  Heart,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllYogaQuery } from '@/redux/features/Yoga/yogaApi';
import { TYoga } from '@/types';



// const YOGA_PROGRAMS: YogaProgram[] = [
//   {
//     id: '1',
//     title: 'Morning Flow Yoga',
//     description:
//       'Start your day with energizing yoga poses for all levels. Perfect for beginners.',
//     image:
//       'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
//     level: 'beginner',
//     duration: '30 min',
//     instructor: 'Sarah Johnson',
//     category: 'Hatha Yoga',
//     rating: 4.8,
//     students: 1250,
//     isFavorite: true,
//   },
//   {
//     id: '2',
//     title: 'Power Vinyasa Flow',
//     description:
//       'Dynamic and challenging flow sequence to build strength and flexibility.',
//     image:
//       'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400',
//     level: 'advanced',
//     duration: '60 min',
//     instructor: 'Michael Chen',
//     category: 'Vinyasa',
//     rating: 4.9,
//     students: 890,
//     isFavorite: false,
//   },
//   {
//     id: '3',
//     title: 'Gentle Restorative',
//     description:
//       'Relaxing and restorative practice to calm the mind and release tension.',
//     image:
//       'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400',
//     level: 'beginner',
//     duration: '45 min',
//     instructor: 'Emily Parker',
//     category: 'Restorative',
//     rating: 4.7,
//     students: 2100,
//     isFavorite: true,
//   },
//   {
//     id: '4',
//     title: 'Intermediate Flow',
//     description:
//       'Balance strength and flexibility with this engaging intermediate practice.',
//     image:
//       'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400',
//     level: 'intermediate',
//     duration: '45 min',
//     instructor: 'David Wilson',
//     category: 'Vinyasa',
//     rating: 4.6,
//     students: 750,
//     isFavorite: false,
//   },
//   {
//     id: '5',
//     title: 'Advanced Ashtanga',
//     description:
//       'Traditional Ashtanga sequence for experienced yogis seeking challenge.',
//     image:
//       'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
//     level: 'advanced',
//     duration: '90 min',
//     instructor: 'Anna Martinez',
//     category: 'Ashtanga',
//     rating: 4.9,
//     students: 420,
//     isFavorite: false,
//   },
//   {
//     id: '6',
//     title: 'Meditation & Mindful Movement',
//     description:
//       'Combine gentle yoga with meditation for inner peace and mindfulness.',
//     image:
//       'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400',
//     level: 'beginner',
//     duration: '40 min',
//     instructor: 'Sarah Johnson',
//     category: 'Mindful',
//     rating: 4.8,
//     students: 1680,
//     isFavorite: true,
//   },
// ];

const LEVELS = [
  { id: 'all', name: 'All Levels', color: '#718096' },
  { id: 'beginner', name: 'Beginner', color: '#10B981' },
  { id: 'intermediate', name: 'Intermediate', color: '#F59E0B' },
  { id: 'advanced', name: 'Advanced', color: '#EF4444' },
];

export default function YogaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const colors = useThemeColors();
  const { data, isLoading } = useGetAllYogaQuery({
    // keyword: searchQuery,
  });
  console.log(data?.data)
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [filteredPrograms, setFilteredPrograms] = useState<TYoga[]>(
   []
  );
  const [isListening, setIsListening] = useState(false);
  const [favorites, setFavorites] = useState(new Set(['1', '3', '6']));
  const recognitionRef = useRef<any>(null);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Filter programs based on search and level
  useEffect(() => {
    let filtered = data?.data ? [...data.data] : [];


    if (searchQuery) {
      filtered = filtered.filter(
        (program) =>
          program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          program.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          program.instructor
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          program.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

   if (selectedLevel !== 'all') {
      filtered = filtered.filter(
        (program) => program.difficulty.toLowerCase() === selectedLevel
      );
    }

    setFilteredPrograms(filtered);
  }, [searchQuery, selectedLevel]);

  const handleVoiceSearch = () => {
    triggerHaptic();
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
    }
  };

  const toggleFavorite = (programId: string) => {
    triggerHaptic();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(programId)) {
      newFavorites.delete(programId);
    } else {
      newFavorites.add(programId);
    }
    setFavorites(newFavorites);
  };

  const getLevelColor = (level: string) => {
    const levelData = LEVELS.find((l) => l.id === level);
    return levelData ? levelData.color : '#718096';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View
          style={[styles.searchContainer, { backgroundColor: colors.card }]}
        >
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.background,
                shadowColor: colors.cardShadow,
              },
            ]}
          >
            <Search size={20} color="#718096" />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search yoga programs, instructors..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.secondaryText}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Filter size={18} color="#718096" />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={handleVoiceSearch}
              style={[
                styles.voiceButton,
                isListening && styles.voiceButtonActive,
              ]}
            >
              {isListening ? (
                <StopCircle size={18} color="#EF4444" />
              ) : (
                <Mic size={18} color="#10B981" />
              )}
            </TouchableOpacity>
          </View>

          {isListening && (
            <View style={styles.listeningIndicator}>
              <View style={styles.listeningDot} />
              <Text
                style={[styles.listeningText, { color: colors.secondaryText }]}
              >
                Listening...
              </Text>
            </View>
          )}
        </View>

        {/* Level Filter */}
        <View
          style={[styles.filterContainer, { backgroundColor: colors.card }]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  [styles.levelChip, { backgroundColor: colors.background, borderColor: colors.border }],
                  selectedLevel === level.id && [
                    styles.levelChipActive,
                    { backgroundColor: level.color }
                  ]
                ]}
                onPress={() => {
                  setSelectedLevel(level.id);
                  triggerHaptic();
                }}
              >
                <Text
                  style={[
                    [styles.levelChipText, { color: colors.secondaryText }],
                    selectedLevel === level.id && styles.levelChipTextActive
                  ]}
                >
                  {level.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView> 
        </View>

        {/* Programs Grid */}
        <View style={styles.programsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Featured Programs
            </Text>
            <Text
              style={[styles.resultsCount, { color: colors.secondaryText }]}
            >
              {data?.data.length} program{data?.data.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FF6F00" />
            </View>
          ) : data?.data?.length > 0 ? (
            <View style={styles.programsGrid}>
              {data?.data.map((program: TYoga) => (
                <TouchableOpacity
                  key={program._id}
                  style={[
                    styles.programCard,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.cardShadow,
                    },
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    console.log('Program selected:', program.name);
                  }}
                  activeOpacity={0.8}
                >
                  {/* ---------- Program Image ---------- */}
                  <View style={styles.programImageContainer}>
                    <Image
                      source={{ uri: program.imageUrl }}
                      style={styles.programImage}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.programImageOverlay}
                    >
                      <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => toggleFavorite(program._id)}
                      >
                        <Heart
                          size={20}
                          color={
                            favorites.has(program._id) ? '#EF4444' : '#FFFFFF'
                          }
                          fill={favorites.has(program._id) ? '#EF4444' : 'none'}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.playButton}>
                        <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>

                  {/* ---------- Program Content ---------- */}
                  <View style={styles.programContent}>
                    <View style={styles.programHeader}>
                      <Text
                        style={[styles.programTitle, { color: colors.text }]}
                      >
                        {program.name}
                      </Text>
                      {/* <View style={styles.ratingContainer}> */}
                      {/* <Star size={14} color="#F59E0B" fill="#F59E0B" /> */}
                      {/* <Text style={[styles.ratingText, { color: colors.text }]}>{program.}</Text> */}
                      {/* </View> */}
                    </View>

                    <Text
                      style={[
                        styles.programDescription,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {program.description}
                    </Text>

                    {/* ---------- Meta Info ---------- */}
                    <View style={styles.programMeta}>
                      <View style={styles.metaItem}>
                        <Clock size={14} color={colors.secondaryText} />
                        <Text
                          style={[
                            styles.metaText,
                            { color: colors.secondaryText },
                          ]}
                        >
                          {program.duration}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <User size={14} color={colors.secondaryText} />
                        {/* <Text style={[styles.metaText, { color: colors.secondaryText }]}>{program.students}</Text> */}
                      </View>
                    </View>

                    {/* ---------- Footer ---------- */}
                    <View style={styles.programFooter}>
                      <View style={styles.instructorInfo}>
                        {/* <Text style={[styles.instructorName, { color: colors.text }]}>{program.}</Text> */}
                        {/* <Text style={[styles.categoryText, { color: colors.secondaryText }]}>{program.category}</Text> */}
                      </View>
                      <View
                        style={[
                          styles.levelBadge,
                          {
                            backgroundColor: getLevelColor(
                              program.difficulty.toLowerCase()
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.levelBadgeText}>
                          {program.difficulty.charAt(0).toUpperCase() +
                            program.difficulty.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : filteredPrograms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No programs found
              </Text>
              <Text
                style={[styles.emptyStateText, { color: colors.secondaryText }]}
              >
                Try adjusting your search or filter criteria
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backdropFilter: 'blur(10px)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  voiceButton: {
    padding: 4,
  },
  voiceButtonActive: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  listeningText: {
    fontSize: 12,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    backdropFilter: 'blur(10px)',
  },
  levelChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    backdropFilter: 'blur(10px)',
  },
  levelChipActive: {
    borderColor: 'transparent',
  },
  levelChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  levelChipTextActive: {
    color: '#FFFFFF',
  },
  programsContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultsCount: {
    fontSize: 14,
  },
  programsGrid: {
    gap: 16,
  },
  programCard: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
  },
  programImageContainer: {
    position: 'relative',
    height: 180,
  },
  programImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  programImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 12,
    flexDirection: 'row',
  },
  favoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  playButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 25,
    padding: 12,
  },
  programContent: {
    padding: 16,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  programDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  programMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 12,
  },
  levelBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
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
  bottomSpacing: {
    height: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});
