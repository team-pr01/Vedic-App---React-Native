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
  Image, // Image is needed for the recipe modal
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
  ArrowLeft,
  Box,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getYouTubeVideoId } from '@/utils/getYouTubeVideoId';
import { useGetAllRecipiesQuery } from '@/redux/features/Recipe/recipeApi';
import { useGetAllCategoriesQuery } from '@/redux/features/Categories/categoriesApi';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Recipe {
  _id: string; // Changed id to _id to match API data
  name: string;
  category: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  duration: string; // Changed from cookingTime to match API data
  difficulty: string;
  cuisine: string;
  videoUrl?: string; // videoUrl is part of the API data
}

const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// Mock AI Recipe Service
const generateRecipe = async (prompt: string): Promise<Recipe> => {
  // Enhanced AI Recipe Generation with better logic
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Analyze prompt for better recipe generation
  const lowerPrompt = prompt.toLowerCase();
  let recipeName = 'AI Generated Recipe';
  let ingredients: string[] = [];
  let instructions: string[] = [];
  let cuisine = 'Vedic';
  let difficulty = 'Easy';
  let duration = '25 mins';

  // Smart recipe generation based on prompt
  if (lowerPrompt.includes('breakfast') || lowerPrompt.includes('morning')) {
    recipeName = 'AI Generated Morning Sattvic Bowl';
    ingredients = [
      'Oats (1 cup)',
      'Fresh fruits (1 cup)',
      'Nuts and seeds (2 tbsp)',
      'Honey (1 tbsp)',
      'Milk or plant milk (1/2 cup)',
      'Cardamom powder (pinch)',
      'Ghee (1 tsp)',
    ];
    instructions = [
      'Soak oats in milk for 10 minutes.',
      'Heat ghee in a pan and lightly roast the oats.',
      'Add chopped fruits and nuts.',
      'Sprinkle cardamom powder and drizzle honey.',
      'Serve warm as a nourishing breakfast.',
    ];
    duration = '15 mins';
  } else if (
    lowerPrompt.includes('dinner') ||
    lowerPrompt.includes('evening')
  ) {
    recipeName = 'AI Generated Evening Sattvic Meal';
    ingredients = [
      'Basmati rice (1 cup)',
      'Mixed vegetables (2 cups)',
      'Moong dal (1/2 cup)',
      'Ghee (2 tbsp)',
      'Cumin seeds (1 tsp)',
      'Turmeric (1/2 tsp)',
      'Fresh coriander (2 tbsp)',
      'Salt to taste',
    ];
    instructions = [
      'Wash rice and dal thoroughly.',
      'Heat ghee and add cumin seeds.',
      'Add vegetables and sauté until tender.',
      'Add rice, dal, turmeric, and water.',
      'Cook until everything is well done.',
      'Garnish with fresh coriander and serve.',
    ];
    duration = '35 mins';
    difficulty = 'Medium';
  } else if (lowerPrompt.includes('sweet') || lowerPrompt.includes('dessert')) {
    recipeName = 'AI Generated Sattvic Sweet';
    ingredients = [
      'Kheer rice (1/2 cup)',
      'Full-fat milk (4 cups)',
      'Jaggery or sugar (1/2 cup)',
      'Cardamom powder (1/2 tsp)',
      'Almonds and pistachios (2 tbsp)',
      'Ghee (1 tbsp)',
      'Saffron (few strands)',
    ];
    instructions = [
      'Boil milk in a heavy-bottomed pan.',
      'Add washed rice and cook on low heat.',
      'Stir occasionally until rice is soft.',
      'Add jaggery and cardamom powder.',
      'Garnish with nuts and saffron.',
      'Serve warm or chilled.',
    ];
    duration = '45 mins';
    difficulty = 'Medium';
    cuisine = 'Traditional';
  } else {
    // Default sattvic recipe
    ingredients = [
      'Quinoa (1 cup)',
      'Mixed vegetables (2 cups)',
      'Ghee (2 tbsp)',
      'Turmeric (1/2 tsp)',
      'Cumin seeds (1 tsp)',
      'Fresh herbs (mint, cilantro)',
      'Lemon juice (1 tbsp)',
      'Salt to taste',
    ];
    instructions = [
      'Rinse quinoa thoroughly and cook with 2 cups water until fluffy.',
      'Heat ghee in a pan and add cumin seeds.',
      'Add mixed vegetables and sauté until tender.',
      'Add turmeric and salt, mix well.',
      'Combine cooked quinoa with vegetables.',
      'Garnish with fresh herbs and lemon juice.',
      'Serve warm as a complete sattvic meal.',
    ];
  }

  return {
    _id: `ai-recipe-${Date.now()}`,
    name: recipeName,
    category: 'sattvic',
    ingredients,
    instructions,
    imageUrl:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration,
    difficulty,
    cuisine,
  };
};

export default function FoodPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { data, isLoading, refetch:refetchRecipe } = useGetAllRecipiesQuery({
    category: selectedCategory,
    keyword: searchQuery,
  });
  const { data: categoryData, refetch:refetchCategories } = useGetAllCategoriesQuery({});
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
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipePrompt, setRecipePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  const handleVoiceSearch = () => {
    triggerHaptic();
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting voice search:', error);
        setIsListening(false);
      }
    }
  };

  const handleGenerateRecipe = async () => {
    if (!recipePrompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    triggerHaptic();

    try {
      const recipe = await generateRecipe(recipePrompt);
      setRecipePrompt('');
      setShowAIModal(false);
      setSelectedRecipe(recipe);
      setShowRecipeModal(true);
    } catch (err: any) {
      console.error('Error generating recipe:', err);
      setError(err.message || 'Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    triggerHaptic();
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const [playingCardIndex, setPlayingCardIndex] = useState<number | null>(null);

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <SafeAreaView edges={['top']} style={[styles.headerContainer, { backgroundColor: colors.success }]}>
            <View
              style={[styles.header, { backgroundColor: colors.success }]}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Vedic Food & Recipes</Text>
                <Text style={styles.headerSubtitle}>বৈদিক খাদ্য ও রেসিপি</Text>
              </View>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Search and AI Section */}
            <View style={[styles.searchSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
                  <Search size={20} color={colors.secondaryText} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.secondaryText}
                  />
                  <TouchableOpacity
                    onPress={handleVoiceSearch}
                    style={[
                      styles.voiceButton,
                      isListening && styles.voiceButtonActive,
                    ]}
                  >
                    {isListening ? (
                      <StopCircle size={18} color={colors.error} />
                    ) : (
                      <Mic size={18} color={colors.success} />
                    )}
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic();
                    setShowAIModal(true);
                  }}
                  style={[styles.aiButton, { backgroundColor: colors.secondary }]}
                >
                  <Brain size={20} color="#FFFFFF" />
                  <Text style={styles.aiButtonText}>AI Recipe</Text>
                </TouchableOpacity>
              </View>

              {isListening && (
                <View style={styles.listeningIndicator}>
                  <View style={styles.listeningDot} />
                  <Text style={[styles.listeningText, { color: colors.secondaryText }]}>Listening...</Text>
                </View>
              )}
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic();
                    setSelectedCategory('');
                  }}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    selectedCategory === '' && [styles.categoryChipActive, { backgroundColor: colors.success, borderColor: colors.success }],
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: colors.secondaryText },
                      selectedCategory === '' && styles.categoryTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {allCategories?.map((category: string) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => {
                      triggerHaptic();
                      setSelectedCategory(category);
                    }}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      selectedCategory === category &&
                        [styles.categoryChipActive, { backgroundColor: colors.success, borderColor: colors.success }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: colors.secondaryText },
                        selectedCategory === category &&
                          styles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Recipes Grid */}
            <View style={styles.recipesContainer}>
              {isLoading?<LoadingComponent loading='Recipes' color={colors.success}/> :data?.data?.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No recipes found</Text>
                  <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
                    Try a different search or category, or use the AI Recipe
                    generator!
                  </Text>
                </View>
              ) : (
                data?.data?.map((recipe: Recipe, index: number) => (
                  <TouchableOpacity
                    key={recipe._id}
                    style={[styles.recipeCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
                    onPress={() => handleViewRecipe(recipe)}
                    activeOpacity={0.8}
                  >
                    {/* --- Video Player Section --- */}
                    <View style={styles.programImageContainer}>
                      <YoutubePlayer
                        height={200}
                        play={playingCardIndex === index}
                        videoId={getYouTubeVideoId(recipe?.videoUrl ?? '')}
                        onChangeState={(state: any) => {
                          if (state === 'ended') setPlayingCardIndex(null);
                        }}
                      />
                    </View>
                    <View style={styles.recipeContent}>
                      <Text style={[styles.recipeTitle, { color: colors.text }]}>{recipe.name}</Text>
                      <View style={styles.recipeMeta}>
                        <View style={styles.metaItem}>
                          <Clock size={16} color={colors.secondaryText} />
                          <Text style={[styles.metaText, { color: colors.secondaryText }]}>{recipe.duration}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Box size={16} color={colors.warning} />
                          <Text style={[styles.metaText, { color: colors.secondaryText }]}>{recipe.category}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleViewRecipe(recipe)}
                        style={[styles.viewButton, { backgroundColor: colors.success }]}
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

          {/* AI Modal */}
          {showAIModal && (
            <Modal
              visible={showAIModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowAIModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.aiModal, { backgroundColor: colors.card }]}>
                  <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                    <View style={styles.aiModalTitle}>
                      <Brain size={24} color={colors.secondary} />
                      <Text style={[styles.modalTitle, { color: colors.text }]}>AI Recipe Generator</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowAIModal(false)}>
                      <X size={24} color={colors.secondaryText} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.aiModalContent}>
                    <Text style={[styles.promptLabel, { color: colors.secondaryText }]}>
                      Describe the recipe you want (e.g., ingredients, cuisine,
                      type):
                    </Text>
                    <TextInput
                      style={[styles.promptInput, { 
                        borderColor: colors.border, 
                        color: colors.text, 
                        backgroundColor: colors.background 
                      }]}
                      value={recipePrompt}
                      onChangeText={setRecipePrompt}
                      placeholder="E.g., A healthy sattvic breakfast using oats and fruits..."
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      placeholderTextColor={colors.secondaryText}
                    />

                    {error && (
                      <View style={[styles.errorContainer, { backgroundColor: `${colors.error}20` }]}>
                        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={handleGenerateRecipe}
                      disabled={isGenerating || !recipePrompt.trim()}
                      style={[
                        styles.generateButton,
                        { backgroundColor: colors.secondary },
                        (isGenerating || !recipePrompt.trim()) &&
                          styles.generateButtonDisabled,
                      ]}
                    >
                      {isGenerating ? (
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
          )}
          
          {/* Recipe Details Modal */}
          {showRecipeModal && selectedRecipe && (
            <Modal
              visible={showRecipeModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowRecipeModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.recipeModal, { backgroundColor: colors.card }]}>
                  <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedRecipe.name}</Text>
                    <TouchableOpacity onPress={() => setShowRecipeModal(false)}>
                      <X size={24} color={colors.secondaryText} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    <Image source={{ uri: selectedRecipe.imageUrl }} style={styles.modalImage} />
                    <View style={styles.recipeDetails}>
                      <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients</Text>
                        {selectedRecipe?.ingredients?.map((item, index) => (
                          <Text key={index} style={[styles.listItem, { color: colors.secondaryText }]}>• {item}</Text>
                        ))}
                      </View>
                      <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Instructions</Text>
                        {selectedRecipe?.instructions?.map((item, index) => (
                          <Text key={index} style={[styles.listItem, { color: colors.secondaryText }]}>{index + 1}. {item}</Text>
                        ))}
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}

        </View>
      </ScrollView>
    </PullToRefreshWrapper>
  );
}

// The StyleSheet remains completely unchanged.
const styles = StyleSheet.create({
  programImageContainer: {
    height: 180,
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F7FAFC',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
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
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: '#38A169',
    borderColor: '#38A169',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  aiModalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalContent: {
    // flex: 1, // Removed to allow ScrollView to manage its own size
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  recipeDetails: {
    padding: 16,
  },
  recipeInfo: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: 'normal',
    color: '#718096',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  aiModalContent: {
    padding: 16,
  },
  promptLabel: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2D3748',
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
});