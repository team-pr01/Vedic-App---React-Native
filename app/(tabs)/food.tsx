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

interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  cookingTime: string;
  difficulty: string;
  cuisine: string;
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
  let cookingTime = '25 mins';

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
    cookingTime = '15 mins';
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
    cookingTime = '35 mins';
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
    cookingTime = '45 mins';
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
    id: `ai-recipe-${Date.now()}`,
    name: recipeName,
    category: 'sattvic',
    ingredients,
    instructions,
    imageUrl:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    cookingTime,
    difficulty,
    cuisine,
  };
};

export default function FoodPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { data, isLoading } = useGetAllRecipiesQuery({
    category: selectedCategory,
    keyword: searchQuery,
  });
  const { data: categoryData } = useGetAllCategoriesQuery({});
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

  const initialRecipes: Recipe[] = [
    {
      id: 'sattvic-khichdi',
      name: 'Sattvic Khichdi',
      category: 'sattvic',
      ingredients: [
        'Moong Dal (1/2 cup)',
        'Rice (1/2 cup)',
        'Ghee (1 tbsp)',
        'Cumin Seeds (1 tsp)',
        'Turmeric (1/2 tsp)',
        'Water (3 cups)',
        'Salt to taste',
      ],
      instructions: [
        'Wash rice and dal thoroughly.',
        'Heat ghee in a pressure cooker.',
        'Add cumin seeds and let them crackle.',
        'Add rice, dal, turmeric, and salt.',
        'Add water and pressure cook for 3-4 whistles.',
        'Let pressure release naturally. Serve hot with a dollop of ghee.',
      ],
      imageUrl:
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      cookingTime: '30 mins',
      difficulty: 'Easy',
      cuisine: 'Vedic',
    },
    {
      id: 'prasad-halwa',
      name: 'Prasad Halwa',
      category: 'prasad',
      ingredients: [
        'Semolina (1 cup)',
        'Ghee (1/2 cup)',
        'Sugar (1 cup)',
        'Water (2 cups)',
        'Cardamom powder (1/2 tsp)',
        'Mixed Nuts (2 tbsp, chopped)',
      ],
      instructions: [
        'Heat ghee in a pan and roast semolina on low heat until golden brown and aromatic.',
        'In a separate saucepan, bring water and sugar to a boil to make sugar syrup.',
        'Gradually add the hot sugar syrup to the roasted semolina, stirring continuously to avoid lumps.',
        'Add cardamom powder and cook until the halwa thickens and leaves the sides of the pan.',
        'Garnish with chopped nuts and serve warm as prasad.',
      ],
      imageUrl:
        'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400',
      cookingTime: '25 mins',
      difficulty: 'Medium',
      cuisine: 'Temple',
    },
    {
      id: 'ayurvedic-tea',
      name: 'Ayurvedic Herbal Tea',
      category: 'ayurvedic',
      ingredients: [
        'Water (2 cups)',
        'Fresh Ginger (1 inch, grated)',
        'Tulsi (Holy Basil) leaves (5-6)',
        'Cardamom pods (2, crushed)',
        'Cinnamon stick (1 inch)',
        'Honey or Jaggery to taste (optional)',
      ],
      instructions: [
        'Bring water to a boil in a saucepan.',
        'Add grated ginger, tulsi leaves, crushed cardamom, and cinnamon stick.',
        'Simmer on low heat for 5-7 minutes to let the flavors infuse.',
        'Strain the tea into cups.',
        'Add honey or jaggery if desired. Serve hot.',
      ],
      imageUrl:
        'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400',
      cookingTime: '10 mins',
      difficulty: 'Easy',
      cuisine: 'Ayurvedic',
    },
  ];

  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);

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
      setRecipes((prev) => [recipe, ...prev.filter((r) => r.id !== recipe.id)]);
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
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <LinearGradient colors={['#38A169', '#2F855A']} style={styles.header}>
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
        </LinearGradient>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search and AI Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#718096" />
              <TextInput
                style={styles.searchInput}
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
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
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
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                setSelectedCategory('');
              }}
              style={[
                styles.categoryChip,
                selectedCategory === '' && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
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
                  selectedCategory === category && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
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
          {data?.data?.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No recipes found</Text>
              <Text style={styles.emptyStateText}>
                Try a different search or category, or use the AI Recipe
                generator!
              </Text>
            </View>
          ) : (
            data?.data?.map((recipe: any, index: number) => (
              <TouchableOpacity
                key={recipe._id}
                style={styles.recipeCard}
                onPress={() => handleViewRecipe(recipe)}
                activeOpacity={0.8}
              >
                {/* --- Video Player Section --- */}
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
                  <Text style={styles.recipeTitle}>{recipe.name}</Text>
                  <View style={styles.recipeMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={16} color="#718096" />
                      <Text style={styles.metaText}>{recipe.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Box size={16} color="#F59E0B" />
                      <Text style={styles.metaText}>{recipe.category}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (recipe?.videoUrl) {
                        Linking.openURL(recipe?.videoUrl);
                      } else {
                        console.warn('No video URL found for this recipe.');
                      }
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

      {/* AI Modal */}
      {showAIModal && (
        <Modal
          visible={showAIModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAIModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.aiModal}>
              <View style={styles.modalHeader}>
                <View style={styles.aiModalTitle}>
                  <Brain size={24} color="#3B82F6" />
                  <Text style={styles.modalTitle}>AI Recipe Generator</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAIModal(false)}>
                  <X size={24} color="#718096" />
                </TouchableOpacity>
              </View>

              <View style={styles.aiModalContent}>
                <Text style={styles.promptLabel}>
                  Describe the recipe you want (e.g., ingredients, cuisine,
                  type):
                </Text>
                <TextInput
                  style={styles.promptInput}
                  value={recipePrompt}
                  onChangeText={setRecipePrompt}
                  placeholder="E.g., A healthy sattvic breakfast using oats and fruits..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#A0AEC0"
                />

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleGenerateRecipe}
                  disabled={isGenerating || !recipePrompt.trim()}
                  style={[
                    styles.generateButton,
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
    </View>
  );
}

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
    flex: 1,
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
