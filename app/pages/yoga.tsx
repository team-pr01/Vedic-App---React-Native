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
  X, // Changed from Filter to X for clearing search
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllYogaQuery } from '@/redux/features/Yoga/yogaApi';
import { TYoga } from '@/types';
import { useGetAllConsultancyServicesQuery } from '@/redux/features/Consultancy/consultancyApi';
import Experts from '@/components/Experts';
import YoutubePlayer from 'react-native-youtube-iframe';

const LEVELS = [
  { id: 'all', name: 'All Levels', color: '#718096' },
  { id: 'beginner', name: 'Beginner', color: '#10B981' },
  { id: 'intermediate', name: 'Intermediate', color: '#F59E0B' },
  { id: 'advanced', name: 'Advanced', color: '#EF4444' },
];

export default function YogaPage() {
  const { data: experts, isLoading: isExpertsLoading } =
    useGetAllConsultancyServicesQuery({});
  const filteredExperts =
    experts?.data?.filter((expert: any) => expert.category === 'Yoga Expert') ||
    [];
  const [searchQuery, setSearchQuery] = useState('');
  const colors = useThemeColors();
  const { data, isLoading } = useGetAllYogaQuery({});
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [filteredPrograms, setFilteredPrograms] = useState<TYoga[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [favorites, setFavorites] = useState(new Set(['1', '3', '6']));
  const recognitionRef = useRef<any>(null);
  const [playingCardIndex, setPlayingCardIndex] = useState<number | null>(null);

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

  // Filter programs based on search, level, and incoming data
  useEffect(() => {
    let programsToFilter = data?.data ? [...data.data] : [];

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      programsToFilter = programsToFilter.filter(
        (program) =>
          program.name?.toLowerCase().includes(lowercasedQuery) ||
          program.description?.toLowerCase().includes(lowercasedQuery)
        // Removed instructor and category as they are not in your data model
      );
    }

    if (selectedLevel !== 'all') {
      programsToFilter = programsToFilter.filter(
        (program) => program.difficulty?.toLowerCase() === selectedLevel
      );
    }

    setFilteredPrograms(programsToFilter);
  }, [searchQuery, selectedLevel, data]); // Added `data` to the dependency array

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


  const getLevelColor = (level: string) => {
    const levelData = LEVELS.find((l) => l.id === level?.toLowerCase());
    return levelData ? levelData.color : '#718096';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ color: colors.text, marginTop: 10 }}>
          Loading Programs...
        </Text>
      </View>
    );
  }

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
              placeholder="Search yoga programs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.secondaryText}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#718096" />
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
                  [
                    styles.levelChip,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ],
                  selectedLevel === level.id && [
                    styles.levelChipActive,
                    { backgroundColor: level.color },
                  ],
                ]}
                onPress={() => {
                  setSelectedLevel(level.id);
                  triggerHaptic();
                }}
              >
                <Text
                  style={[
                    [styles.levelChipText, { color: colors.secondaryText }],
                    selectedLevel === level.id && styles.levelChipTextActive,
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
              {filteredPrograms.length} program
              {filteredPrograms.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {filteredPrograms.length > 0 ? (
            <View style={styles.programsGrid}>
              {filteredPrograms.map((program: TYoga,index:number) => (
                <View
          key={program._id || index}
          style={[
            styles.programCard,
            { backgroundColor: colors.card, shadowColor: colors.cardShadow },
          ]}
        >
          {/* --- Video Player Section --- */}
          <View style={styles.programImageContainer}>
            <YoutubePlayer
              height={200}
              play={playingCardIndex === index}
              videoId="brg5LgDN114" // Fixed YouTube video
              onChangeState={(state) => {
                if (state === "ended") setPlayingCardIndex(null);
              }}
            />

           
          </View>

          {/* --- Content Section --- */}
          <View style={styles.programContent}>
            <View style={styles.programHeader}>
              <Text style={[styles.programTitle, { color: colors.text }]}>
                {program.name}
              </Text>
            </View>

            <Text
              style={[styles.programDescription, { color: colors.secondaryText }]}
              numberOfLines={2}
            >
              {program.description}
            </Text>

            <View style={styles.programMeta}>
              <View style={styles.metaItem}>
                <Clock size={14} color={colors.secondaryText} />
                <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                  {program.duration}
                </Text>
              </View>
            </View>

            <View style={styles.programFooter}>
              <View style={styles.instructorInfo}>
                {/* Add instructor info if API provides it */}
              </View>
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: getLevelColor(program.difficulty) },
                ]}
              >
                <Text style={styles.levelBadgeText}>
                  {program.difficulty?.charAt(0).toUpperCase() +
                    program.difficulty?.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No Programs Found
              </Text>
              <Text
                style={[styles.emptyStateText, { color: colors.secondaryText }]}
              >
                Try adjusting your search or filter criteria.
              </Text>
            </View>
          )}
        </View>

        <Experts data={filteredExperts} title={'Yoga'} isLoading={isLoading} />
      </ScrollView>
    </View>
  );
}

// Styles remain the same
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
