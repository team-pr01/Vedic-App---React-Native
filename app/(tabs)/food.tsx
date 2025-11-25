import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Mic,
  CircleStop as StopCircle,
  Brain,
  Clock,
  ChevronRight,
  X,
  Loader,
  Box,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getYouTubeVideoId } from '@/utils/getYouTubeVideoId';
import { useGetAllRecipiesQuery } from '@/redux/features/Recipe/recipeApi';
import { useGetAllCategoriesQuery } from '@/redux/features/Categories/categoriesApi';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGenerateRecipeMutation } from '@/redux/features/AI/aiApi';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import AppHeader from '@/components/Reusable/AppHeader/AppHeader';
import Categories from '@/components/Reusable/Categories/Categories';
import SkeletonLoader from '@/components/Reusable/SkeletonLoader';

const AiOutputParser = ({ content }: { content: string | null }) => {
  if (!content) return null;
const colors = useThemeColors();
  const lines = content.split('\n');

  const renderLine = (line: string, index: number) => {
    // ### Heading
    if (line.startsWith('### ')) {
      return (
        <Text key={index} style={[styles.aiHeading,,{color:colors.secondaryText}]}>
          {line.replace('### ', '')}
        </Text>
      );
    }
    // **Bold Text:** followed by content
    if (line.includes('**')) {
      const parts = line.split('**');
      return (
        <Text key={index} style={[styles.aiParagraph,,{color:colors.text}]}>
          <Text style={{ fontWeight: 'bold' }}>{parts[0].trim()}</Text>
          {parts.slice(1).join('')}
        </Text>
      );
    }
    // - List Item
    if (line.trim().startsWith('- ')) {
      return (
        <View key={index} style={styles.aiListItemContainer}>
          <Text style={[styles.aiListItem,{color:colors.text}]}>•</Text>
          <Text style={[styles.aiListItemText,,{color:colors.text}]}>{line.trim().substring(2)}</Text>
        </View>
      );
    }
    // Numbered List Item (e.g., "1. ")
    if (/^\d+\.\s/.test(line.trim())) {
      return (
        <View key={index} style={styles.aiListItemContainer}>
          <Text style={[styles.aiListItemText,{color:colors.text}]}>{line.trim()}</Text>
        </View>
      );
    }
    // Regular paragraph
    if (line.trim().length > 0) {
      return (
        <Text key={index} style={[styles.aiParagraph,{color:colors.text}]}>
          {line}
        </Text>
      );
    }
    // Return null for empty lines to create spacing
    return null;
  };

  return <View style={styles.aiContentContainer}>{lines.map(renderLine)}</View>;
};

export default function FoodPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAIGeneratedModal, setShowAIGeneratedModal] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string | null>(
    null
  );

  const [
    generateRecipe,
    { data: recipeData, isLoading: isRecipeLoading, error: recipeError },
  ] = useGenerateRecipeMutation();

  const {
    data,
    isLoading,
    isFetching,
    refetch: refetchRecipe,
  } = useGetAllRecipiesQuery({
    category: selectedCategory,
    keyword: searchQuery,
  });
  const {
    data: categoryData,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useGetAllCategoriesQuery({});
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCategories(), refetchRecipe()]);
    } catch (error) {
      console.error('Error while refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredCategory = categoryData?.data?.filter(
    (category: any) => category.areaName === 'recipe'
  );

  const allCategories = filteredCategory?.map(
    (category: any) => category.category
  );

  const [showAIModal, setShowAIModal] = useState(false);
  const [recipePrompt, setRecipePrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (recipeData && typeof recipeData.data === 'string') {
      setAiGeneratedContent(recipeData.data);
      setShowAIGeneratedModal(true);
      setShowAIModal(false);
      setRecipePrompt('');
    }
  }, [recipeData]);

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
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleVoiceSearch = () => {

  };

  const handleGenerate = () => {
    if (!recipePrompt.trim()) return;
    const res=generateRecipe(recipePrompt);
   
  };

  const [playingCardIndex, setPlayingCardIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <AppHeader
          title="Vedic Food & Recipes"
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
                      placeholderTextColor="#A0AEC0"k
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
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowAIModal(true);
                    }}
                    style={styles.aiButton}
                  >
                    <Brain size={20} color="#FFFFFF" />
                    <Text style={styles.aiButtonText}>AI Recipe</Text>
                  </TouchableOpacity>
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

              {/* Recipes Grid */}
              <View style={styles.recipesContainer}>
                {isLoading || isFetching ? (
                  <SkeletonLoader
                     direction='column'
                    height={280}
                    width={'100%'}
                    innerSkeleton={
                      <View
                        style={{
                          padding: 15,
                          justifyContent: 'flex-end',
                          flex: 1,
                        }}
                      >
                        <View>
                          <View
                            style={{
                              width: '60%',
                              height: 16,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 8,
                              marginBottom: 8,
                            }}
                          />
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <View
                              style={{
                                width: '20%',
                                height: 12,
                                backgroundColor: '#e0e0e0',
                                borderRadius: 6,
                              }}
                            />
                            <View
                              style={{
                                width: '20%',
                                height: 12,
                                backgroundColor: '#e0e0e0',
                                borderRadius: 6,
                              }}
                            />
                          </View>
                        </View>

                        <View
                          style={{
                            width: '100%',
                            height: 35,
                            backgroundColor: '#d6d6d6',
                            borderRadius: 8,
                            marginTop: 20,
                          }}
                        />
                      </View>
                    }
                  />
                ) : data?.data?.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>No recipes found</Text>
                    <Text style={styles.emptyStateText}>
                      Try a different search or category.
                    </Text>
                  </View>
                ) : (
                  data?.data?.map((recipe: any, index: number) => (
                    <TouchableOpacity
                      key={recipe._id}
                      style={[
                        styles.recipeCard,
                        { backgroundColor: colors.card },
                      ]}
                      onPress={() => {
                        if (recipe?.videoUrl) Linking.openURL(recipe?.videoUrl);
                      }}
                      activeOpacity={0.8}
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
                        >
                          {recipe.name}
                        </Text>
                        <View style={styles.recipeMeta}>
                          <View style={styles.metaItem}>
                            <Clock size={16} color="#718096" />
                            <Text style={styles.metaText}>
                              {recipe.duration}
                            </Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Box size={16} color="#F59E0B" />
                            <Text style={styles.metaText}>
                              {recipe.category}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            if (recipe?.videoUrl)
                              Linking.openURL(recipe?.videoUrl);
                          }}
                          style={styles.viewButton}
                        >
                          <Text style={styles.viewButtonText}>View Recipe</Text>
                          <ChevronRight size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <View style={styles.bottomSpacing} />
            </ScrollView>

            <Modal
              visible={showAIModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowAIModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View
                  style={[styles.aiModal, { backgroundColor: colors.card }]}
                >
                  <View
                    style={[
                      styles.modalHeader,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={styles.aiModalTitle}>
                      <Brain size={24} color="#3B82F6" />
                      <Text style={[styles.modalTitle, { color: colors.text }]}>
                        AI Recipe Generator
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowAIModal(false)}>
                      <X size={24} color="#718096" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.aiModalContent}>
                    <Text
                      style={[
                        styles.promptLabel,
                        { color: colors.secondaryText },
                      ]}
                    >
                      Describe the recipe you want:
                    </Text>
                    <TextInput
                      style={[
                        styles.promptInput,
                        { borderColor: colors.border, color: colors.text },
                      ]}
                      value={recipePrompt}
                      onChangeText={setRecipePrompt}
                      placeholder="E.g., A healthy sattvic breakfast..."
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      placeholderTextColor="#A0AEC0"
                    />
                    {recipeError && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                          {recipeError?.data?.message}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={handleGenerate}
                      disabled={isRecipeLoading || !recipePrompt.trim()}
                      style={[
                        styles.generateButton,
                        (isRecipeLoading || !recipePrompt.trim()) &&
                          styles.generateButtonDisabled,
                      ]}
                    >
                      {isRecipeLoading ? (
                        <>
                          <Loader size={20} color="#FFFFFF" />
                          <Text style={styles.generateButtonText}>
                            Generating...
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.generateButtonText}>
                          Generate Recipe
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              visible={showAIGeneratedModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowAIGeneratedModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View
                  style={[styles.recipeModal, { backgroundColor: colors.card }]}
                >
                  <View
                    style={[
                      styles.modalHeader,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalTitle,
                        { color: colors.text, flex: 1 },
                      ]}
                      numberOfLines={1}
                    >
                      AI Generated Recipe
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowAIGeneratedModal(false)}
                    >
                      <X size={24} color="#718096" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    <AiOutputParser content={aiGeneratedContent} />
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </PullToRefreshWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... All previous styles are kept ...
  programImageContainer: {
    height: 180,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
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
    borderBottomColor: '#E2E8F0',
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    color: '#718096',
  },
  categoriesContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: '#38A169',
    borderColor: '#38A169',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  recipesContainer: {
    padding: 16,
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  bottomSpacing: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
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

  // *** FIX 6: ADDED the necessary styles for the AiRecipeParser ***
  aiContentContainer: {
    padding: 16,
  },
  aiHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 5,
  },
  aiParagraph: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
    marginBottom: 10,
  },
  aiListItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 10,
  },
  aiListItem: {
    fontSize: 15,
    color: '#4A5568',
    marginRight: 8,
    lineHeight: 22,
  },
  aiListItemText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
    flex: 1,
  },
});
