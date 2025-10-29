import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Platform,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Mic,
  CircleStop as StopCircle,
  Filter,
  Star,
  Clock,
  Play,
  X,
  CreditCard,
  CircleCheck as CheckCircle,
  Loader,
  ArrowLeft,
  ChevronRight,
  BoxIcon,
  User,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllCategoriesQuery } from '@/redux/features/Categories/categoriesApi';
import { useGetAllAyurvedaQuery } from '@/redux/features/Ayurved/ayurvedaApi';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import AppHeader from '@/components/Reusable/AppHeader/AppHeader';
import Categories from '@/components/Reusable/Categories/Categories';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import Experts from '@/components/Reusable/Experts';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import { formatDate } from '@/utils/formatDate';
import { getYouTubeVideoId } from '@/utils/getYouTubeVideoId';
import YoutubePlayer from 'react-native-youtube-iframe';
import SkeletonLoader from '@/components/Reusable/SkeletonLoader';

export default function AyurvedaPage() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const {
    data,
    isLoading,
    isFetching,
    refetch: refetchAyurveda,
  } = useGetAllAyurvedaQuery({
    category: selectedCategory,
    keyword: searchQuery,
  });
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [playingCardIndex, setPlayingCardIndex] = useState<number | null>(null);
  const { data: categoryData ,isLoading:isLoadingCategories, refetch: refetchCategories } =
    useGetAllCategoriesQuery({});
  const [isListening, setIsListening] = useState(false);
  const filteredExperts =
    data?.data?.filter(
      (expert: any) => expert.category === 'Ayurveda Expert'
    ) || [];
  const recognitionRef = useRef<any>(null);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCategories(), refetchAyurveda()]);
    } catch (error) {
      console.error('Error while refreshing:', error);
    } finally {
      setRefreshing(false);
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

  // Filter content based on search and category
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
  }, [searchQuery, selectedCategory]);
  const filteredCategory = categoryData?.data?.filter(
    (category: any) => category.areaName === 'ayurveda'
  );

  const allCategories = filteredCategory?.map(
    (category: any) => category.category
  );
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <AppHeader
          title="Ayurveda"
          colors={['#38A169', '#2F855A']}
        />
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.container}>
            <ScrollView
              style={[styles.content, { backgroundColor: colors.background }]}
              showsVerticalScrollIndicator={false}
            >
              {/* Search and AI Section */}
              <View
                style={[
                  styles.searchSection,
                  { backgroundColor: colors.background },
                ]}
              >
                <View style={styles.searchContainer}>
                  <View
                    style={[
                      styles.searchBar,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Search size={20} color="#718096" />
                    <TextInput
                      style={[styles.searchInput, { color: colors.text }]}
                      placeholder="Search recipes..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholderTextColor="#A0AEC0"
                    />
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
                        <Mic size={18} color="#38A169" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                {isListening && (
                  <View style={styles.listeningIndicator}>
                    <View style={styles.listeningDot} />
                    <Text style={styles.listeningText}>Listening...</Text>
                  </View>
                )}
              </View>

              {/* Categories */}
              <Categories
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                allCategories={allCategories}
                bgColor={'#38A169'}
                isLoading={isLoadingCategories}
              />

              {/* Experts Section */}

              <View style={styles.recipesContainer}>
                {!isLoading || isFetching ? (
                  <SkeletonLoader
                  direction='column'
                    width={'100%'}
                    height={320}
                    innerSkeleton={
                      <View
                        style={{
                          padding: 15,
                          justifyContent: 'flex-end',
                          flex: 1,
                        }}
                      > <View
                            style={{
                              width: '80%',
                              height: 16,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 6,
                              marginBottom: 8,
                            }}
                          />
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <View
                            style={{
                              width: '20%',
                              height: 16,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 8,
                              marginBottom: 8,
                            }}
                          />
                          <View
                            style={{
                              width: '20%',
                              height: 16,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 6,
                              marginBottom: 8,
                            }}
                          />
                          <View
                            style={{
                              width: '40%',
                              height: 16,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 6,
                            }}
                          />
                        </View>
                        
                          <View
                            style={{
                              width: '100%',
                              height: 40,
                              backgroundColor: '#d6d6d6',
                              borderRadius: 8,
                              marginTop: 4,
                            }}
                          />
                      </View>
                    }
                  />
                ) : data?.data?.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>
                      No Ayurveda found
                    </Text>
                    <Text style={styles.emptyStateText}>
                      Try a different search or category.
                    </Text>
                  </View>
                ) : (
                  data?.data?.map((recipe: any, index: number) => (
                    <View
                      key={recipe._id}
                      style={[
                        styles.recipeCard,
                        { backgroundColor: colors.card },
                      ]}
                    >
                      <View style={styles.programImageContainer}>
                        <YoutubePlayer
                          height={200}
                          play={playingCardIndex === index}
                          videoId={getYouTubeVideoId(recipe?.videoUrl) || ''}
                          onChangeState={(state: any) => {
                            if (state === 'ended') setPlayingCardIndex(null);
                          }}
                        />
                      </View>
                      <View style={styles.recipeContent}>
                        <Text
                          style={[styles.recipeTitle, { color: colors.text }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {recipe.content}
                        </Text>
                        <View style={styles.recipeMeta}>
                          <View style={styles.metaItem}>
                            <Clock size={16} color="#718096" />
                            <Text style={styles.metaText}>
                              {recipe.duration}
                            </Text>
                          </View>
                          <View style={styles.metaItem}>
                            <BoxIcon size={16} color="#F59E0B" />
                            <Text style={styles.metaText}>
                              {recipe.category}
                            </Text>
                          </View>
                          <View style={styles.metaItem}>
                            <User size={16} color="#718096" />
                            <Text style={styles.metaText}>
                              {recipe.expertName}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedRecipe(recipe);
                            setIsArticleModalOpen(true);
                          }}
                          style={styles.viewButton}
                        >
                          <Text style={styles.viewButtonText}>View</Text>
                          <ChevronRight size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Article Modal */}
              {isArticleModalOpen && selectedRecipe && (
                <Modal
                  visible={isArticleModalOpen}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setIsArticleModalOpen(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View
                      style={[
                        styles.articleModal,
                        {
                          backgroundColor: colors.card,
                          shadowColor: colors.cardShadow,
                        },
                      ]}
                    >
                      {/* Header */}
                      <View style={styles.modalHeader}>
                       
                        <TouchableOpacity
                          onPress={() => setIsArticleModalOpen(false)}

                        >
                          <X size={24} color={colors.secondaryText} />
                        </TouchableOpacity>
                      </View>

                      {/* Body */}
                      <ScrollView
                        style={[styles.modalContent, { padding: 10 }]}
                      >
                        {/* Youtube Video */}
                        <YoutubePlayer
                          height={200}
                          play={false}
                          videoId={
                            getYouTubeVideoId(selectedRecipe?.videoUrl) || ''
                          }
                        />

                        {/* Meta info */}
                        <View style={[styles.articleHeader, { marginTop: 10 }]}>
                          <Text style={styles.categoryBadgeText}>
                            {selectedRecipe?.category}
                          </Text>
                          <Text
                            style={[
                              styles.publishTime,
                              { color: colors.secondaryText },
                            ]}
                          >
                            {selectedRecipe?.duration}
                          </Text>
                        </View>

                        {/* Expert info */}
                        <Text
                          style={[
                            styles.articleExcerpt,
                            { color: colors.secondaryText },
                          ]}
                        >
                          Expert: {selectedRecipe?.expertName}
                        </Text>
                         <Text
                          style={[styles.modalTitle, { color: colors.text }]}
                        >
                          {selectedRecipe.content}
                        </Text>
                      </ScrollView>
                    </View>
                  </View>
                </Modal>
              )}

              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
              ></ScrollView>
              <Experts
                data={filteredExperts}
                title={'Ayurveda'}
                isLoading={isLoading}
              />

              <View style={styles.bottomSpacing} />
            </ScrollView>
          </View>
        </ScrollView>
      </PullToRefreshWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#38A169',
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
    color: '#C6F6D5',
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    // backdropFilter: 'blur(10px)', // This property is not standard in React Native
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 0,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    // backdropFilter: 'blur(10px)', // This property is not standard in React Native
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
  filterButton: {
    borderRadius: 25,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // backdropFilter: 'blur(10px)', // This property is not standard in React Native
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
  categoriesContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
    // backdropFilter: 'blur(10px)', // This property is not standard in React Native
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    // backdropFilter: 'blur(10px)', // This property is not standard in React Native
  },
  categoryChipActive: {
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  videoCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    // backdropFilter: 'blur(10px)', // This property is not standard in React Native
  },
  videoThumbnailContainer: {
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  videoDurationText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  videoExpert: {
    fontSize: 12,
  },
  expertsContainer: {
    gap: 16,
  },
  expertCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    gap: 12,
    // backdropFilter: 'blur(10px)', // This property is not standard in React Native
  },
  expertImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expertSpeciality: {
    fontSize: 14,
    marginBottom: 4,
  },
  expertMeta: {
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  availabilityText: {
    fontSize: 12,
  },
  bookButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  paymentModal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    // backdropFilter: 'blur(20px)', // This property is not standard in React Native
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentContent: {
    padding: 16,
  },
  bookingSummary: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    // backdropFilter: 'blur(10px)', // This property is not standard in React Native
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  paymentMethodsSection: {
    marginBottom: 20,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    gap: 12,
    // backdropFilter: 'blur(10px)', // This property is not standard in React Native
  },
  paymentMethodCardActive: {
    backgroundColor: 'rgba(56, 161, 105, 0.1)',
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    // backdropFilter: 'blur(10px)', // This property is not standard in React Native
  },
  errorText: {
    fontSize: 14,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  doneButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recipesContainer: {
    padding: 16,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  recipeCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeMeta: {
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
    fontSize: 14,
    color: '#718096',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38A169',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  recipeModal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  aiModal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  aiModalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiModalContent: {
    padding: 16,
  },
  promptLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 100,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  programImageContainer: {
    height: 180,
    backgroundColor: '#000000',
  },
  articleModal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContent: {
    height: '60%',
  },
  modalImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  articleModalContent: {
    padding: 16,
  },
  articleModalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  footerInfo: {
    flex: 1,
  },
  footerText: {
    fontSize: 12,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  shareModal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    padding: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  categoryBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
    backgroundColor: 'green',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  publishTime: {
    fontSize: 12,
  },

  articleExcerpt: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 6,
    opacity: 0.8,
  },
});
