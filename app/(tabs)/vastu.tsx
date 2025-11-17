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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Mic,
  CircleStop as StopCircle,
  Brain,
  ChevronRight,
  X,
  Loader,
  DoorOpen,
  Bed,
  ChefHat as Kitchen,
  Bath,
  Flower2 as Plant,
  Church as Temple,
  Chrome as Home,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Video,} from 'expo-av';
import { useGetAllConsultancyServicesQuery } from '@/redux/features/Consultancy/consultancyApi';
import {
  useGetAllVastuQuery,
  useGetAllVastuTipsQuery,
} from '@/redux/features/Vastu/vastuApi';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getYouTubeVideoId } from '@/utils/getYouTubeVideoId';
import NoData from '@/components/Reusable/NoData/NoData';
import { useThemeColors } from '@/hooks/useThemeColors';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import AppHeader from '@/components/Reusable/AppHeader/AppHeader';
import Categories from '@/components/Reusable/Categories/Categories';
import SkeletonLoader from '@/components/Reusable/SkeletonLoader';
import Experts from '@/components/ConsultancyPage/Experts';

export type TVastu = {
  _id: string;
  title: string;
  category: string;
  videoUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
};
interface VastuTip {
  title: string;
  icon: React.ReactElement;
  category: string;
  tips: string[];
}

interface VastuExpert {
  id: number;
  name: string;
  speciality: string;
  experience: string;
  rating: number;
  price: string;
  image: string;
  nextAvailable: string;
}

interface VastuVideo {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  views: string;
}

interface VastuAnalysis {
  id: string;
  roomType: string;
  direction: string;
  analysis: string;
  recommendations: string[];
  score: number;
}

const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

const generateVastuAnalysis = async (
  prompt: string
): Promise<VastuAnalysis> => {
  // ... (logic is unchanged)
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const lowerPrompt = prompt.toLowerCase();
  let roomType = 'Living Room';
  let direction = 'North-East';
  let analysis = '';
  let recommendations: string[] = [];
  let score = 8.5;
  if (lowerPrompt.includes('bedroom')) {
    roomType = 'Bedroom';
    direction = 'South-West';
    analysis =
      'Your bedroom placement follows traditional Vastu principles. The South-West direction is ideal for the master bedroom as it promotes stability and peaceful sleep.';
    recommendations = [
      'Sleep with your head pointing South or East for better rest',
      'Avoid placing mirrors directly opposite the bed',
      'Use calming colors like light blue or green for walls',
      'Keep the room clutter-free for positive energy flow',
    ];
    score = 9.0;
  } else if (lowerPrompt.includes('kitchen')) {
    roomType = 'Kitchen';
    direction = 'South-East';
    analysis =
      'Your kitchen is well-positioned in the South-East direction (Agni corner), which is highly auspicious for cooking activities according to Vastu principles.';
    recommendations = [
      'Cook facing East for positive energy while preparing food',
      'Place water source (sink) in the North-East of kitchen',
      'Avoid placing stove and sink directly opposite each other',
      'Use bright lighting and ensure good ventilation',
    ];
    score = 9.2;
  } else {
    analysis =
      'Your living room has good natural light and proper ventilation. The placement follows traditional Vastu principles with some minor adjustments needed.';
    recommendations = [
      'Place the main seating facing East or North for positive energy flow',
      'Add a small plant in the North-East corner to enhance prosperity',
      'Ensure the center of the room remains clutter-free',
      'Use light colors for walls to maintain positive vibrations',
    ];
  }
  return {
    id: `analysis-${Date.now()}`,
    roomType,
    direction,
    analysis,
    recommendations,
    score,
  };
};

export default function VastuPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const {
    data: vastu,
    isLoading: isVastuLoading,
    isFetching: isRefetchingVastu,
    refetch: refetchVastu,
  } = useGetAllVastuQuery({
    keyword: searchQuery,
    category: selectedCategory,
  });
  const {
    data: vastuTips,
    isLoading: isVastuTipsLoading,
    isFetching: isRefetchingVastuTips,
    refetch: refetchVastuTips,
  } = useGetAllVastuTipsQuery({
    keyword: searchQuery,
    category: selectedCategory,
  });
  const [refreshing, setRefreshing] = useState(false);
  console.log(vastuTips?.data, 'tips');
  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetchVastu(), refetchVastuTips()]);
    } catch (error) {
      console.error('Error while refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const colors = useThemeColors();
  const [isListening, setIsListening] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [vastuPrompt, setVastuPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<VastuAnalysis | null>(null);
  const [videoStates, setVideoStates] = useState<
    Map<number, { isPlaying: boolean }>
  >(new Map());
  const recognitionRef = useRef<any>(null);
  const initialVastuTips: VastuTip[] = [
    {
      title: 'Main Entrance',
      icon: <DoorOpen size={24} color={colors.vastu} />,
      category: 'entrance',
      tips: [
        'North-East entrance is considered most auspicious for overall prosperity.',
        'Avoid obstructions like poles or large trees directly in front of the main door.',
        'The entrance door should always open inward, clockwise.',
        'Keep the entrance area well-lit and clean.',
      ],
    },
    {
      title: 'Bedroom',
      icon: <Bed size={24} color={colors.vastu} />,
      category: 'bedroom',
      tips: [
        'Master bedroom should ideally be in the South-West direction.',
        'Sleep with your head pointing South or East for peaceful sleep.',
        'Avoid placing mirrors directly opposite the bed.',
        'Use calming colors for bedroom walls.',
      ],
    },
    {
      title: 'Kitchen',
      icon: <Kitchen size={24} color={colors.vastu} />,
      category: 'kitchen',
      tips: [
        'The South-East corner is ideal for the kitchen (Agni corner).',
        'Cooking stove should be placed such that the cook faces East.',
        'Water source (sink, tap) should be in the North-East of the kitchen.',
        'Avoid placing the stove and sink directly opposite each other.',
      ],
    },
    {
      title: 'Bathroom & Toilet',
      icon: <Bath size={24} color={colors.vastu} />,
      category: 'bathroom',
      tips: [
        'North-West is the preferred direction for bathrooms and toilets.',
        'Toilet seat should ideally face South or North.',
        'Ensure good ventilation and keep the bathroom door closed when not in use.',
        'Avoid constructing toilets in the North-East or South-West corners.',
      ],
    },
    {
      title: 'Temple Room (Pooja Room)',
      icon: <Temple size={24} color={colors.vastu} />,
      category: 'temple',
      tips: [
        'The North-East (Ishan Kona) is the most sacred direction for a pooja room.',
        'Idols should face West or East.',
        'Keep the pooja room clean, clutter-free, and well-lit.',
        'Avoid placing the pooja room under a staircase or next to a bathroom.',
      ],
    },
    {
      title: 'Garden & Plants',
      icon: <Plant size={24} color={colors.vastu} />,
      category: 'garden',
      tips: [
        'Plant trees in the South and West directions for shade and protection.',
        'Avoid large trees in the North-East as they block positive energy.',
        'Tulsi plant in the North-East brings prosperity and positive energy.',
        'Keep the garden well-maintained and free from dead plants.',
      ],
    },
  ];

  const vastuVideosData: VastuVideo[] = [
    {
      id: 1,
      title: 'Introduction to Vastu Shastra Principles',
      duration: '15:30',
      thumbnail:
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl:
        'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
      views: '1.2M',
    },
    {
      id: 2,
      title: 'Vastu Guidelines for a Prosperous Home Office',
      duration: '12:45',
      thumbnail:
        'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl:
        'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
      views: '850K',
    },
    {
      id: 3,
      title: 'Kitchen Vastu: Direction and Placement Tips',
      duration: '10:20',
      thumbnail:
        'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl:
        'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
      views: '650K',
    },
  ];
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

  useEffect(() => {
    const initialStates = new Map<number, { isPlaying: boolean }>();
    vastuVideosData.forEach((video) =>
      initialStates.set(video.id, { isPlaying: false })
    );
    setVideoStates(initialStates);
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

  const handleGenerateAnalysis = async () => {
    if (!vastuPrompt.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    triggerHaptic();
    try {
      const analysis = await generateVastuAnalysis(vastuPrompt);
      setVastuPrompt('');
      setShowAIModal(false);
      setSelectedAnalysis(analysis);
      setShowAnalysisModal(true);
    } catch (err: any) {
      console.error('Error generating analysis:', err);
      setError(err.message || 'Failed to generate analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const allCategories = [
    'Entrance',
    'Bedroom',
    'Kitchen',
    'Bathroom',
    'Temple',
    'Garden',
  ];
  const [playingCardIndex, setPlayingCardIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <AppHeader title="Vastu Shastra" colors={['#7B51D4FF', '#805AD5']} />
        <ScrollView
          style={{ backgroundColor: colors.background }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View
            style={[styles.container, { backgroundColor: colors.background }]}
          >
            {/* Search and AI Section */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.searchSection,
                  {
                    backgroundColor: colors.card,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.searchContainer}>
                  <View
                    style={[
                      styles.searchBar,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Search size={20} color={colors.secondaryText} />
                    <TextInput
                      style={[styles.searchInput, { color: colors.text }]}
                      placeholder="Search Vastu tips, experts..."
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
                        <Mic size={18} color={colors.vastu} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic();
                      setShowAIModal(true);
                    }}
                    style={[styles.aiButton, { backgroundColor: colors.vastu }]}
                  >
                    <Brain size={20} color="#FFFFFF" />
                    <Text style={styles.aiButtonText}>AI Analysis</Text>
                  </TouchableOpacity>
                </View>

                {isListening && (
                  <View style={styles.listeningIndicator}>
                    <View style={styles.listeningDot} />
                    <Text
                      style={[
                        styles.listeningText,
                        { color: colors.secondaryText },
                      ]}
                    >
                      Listening...
                    </Text>
                  </View>
                )}
              </View>
              <Categories
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                allCategories={allCategories}
                bgColor={'#805AD5'}
              />
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Vastu Videos
                </Text>

                {isVastuLoading || isRefetchingVastu ? (
                  <SkeletonLoader
                    height={200}
                    width={280}
                    innerSkeleton={
                      <View
                        style={{
                          padding: 15,
                          justifyContent: 'flex-end',
                          flex: 1,
                        }}
                      >
                        <View
                          style={{
                            width: '80%',
                            height: 16,
                            backgroundColor: '#e0e0e0',
                            borderRadius: 8,
                            marginBottom: 8,
                          }}
                        />
                      </View>
                    }
                  />
                ) : vastu?.data?.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {vastu?.data?.map((vastu: TVastu, index: number) => (
                      <View
                        key={vastu?._id}
                        style={[
                          styles.videoCard,
                          {
                            backgroundColor: colors.card,
                            shadowColor: colors.cardShadow,
                          },
                        ]}
                      >
                        {/* --- Video Player Section --- */}
                        <View style={styles.programImageContainer}>
                          <YoutubePlayer
                            height={200}
                            play={playingCardIndex === index}
                            videoId={getYouTubeVideoId(vastu?.videoUrl) || ''}
                            onChangeState={(state: any) => {
                              if (state === 'ended') setPlayingCardIndex(null);
                            }}
                          />
                        </View>

                        <Text
                          style={[styles.videoTitle, { color: colors.text }]}
                        >
                          {vastu?.title}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <NoData message="No Vastu videos found" />
                )}
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Popular Vastu Tips
                </Text>
                {isVastuTipsLoading || isRefetchingVastuTips ? (
                  <SkeletonLoader
                    direction="column"
                    height={160}
                    width={'100%'}
                    innerSkeleton={
                      <View
                        style={{
                          padding: 15,
                          justifyContent: 'space-between',
                          flex: 1,
                        }}
                      >
                        {/* Title bar */}
                        <View
                          style={{
                            width: '60%',
                            height: 26,
                            backgroundColor: '#e0e0e0',
                            borderRadius: 8,
                            marginBottom: 10,
                          }}
                        />

                        {/* Row section */}
                        {[1, 2, 3].map((_, i) => (
                          <View
                            key={i}
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: 10,
                              marginBottom: 10,
                            }}
                          >
                            {/* Circle placeholder */}
                            <View
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: 12,
                                backgroundColor: '#e0e0e0',
                              }}
                            />

                            {/* Text placeholders */}
                            <View style={{ flex: 1 }}>
                              <View
                                style={{
                                  width: '90%',
                                  height: 11,
                                  backgroundColor: '#e0e0e0',
                                  borderRadius: 8,
                                  marginBottom: 6,
                                }}
                              />
                              <View
                                style={{
                                  width: '40%',
                                  height: 11,
                                  backgroundColor: '#e0e0e0',
                                  borderRadius: 6,
                                }}
                              />
                            </View>
                          </View>
                        ))}
                      </View>
                    }
                  />
                ) : vastuTips?.data?.length > 0 ? (
                  <View style={styles.tipsContainer}>
                    {vastuTips?.data?.map((tip: any, index: number) => (
                      <View
                        key={index}
                        style={[
                          styles.tipCard,
                          {
                            backgroundColor: colors.card,
                            shadowColor: colors.cardShadow,
                          },
                        ]}
                      >
                        <View style={styles.tipHeader}>
                          <Text
                            style={[styles.tipTitle, { color: colors.text }]}
                          >
                            {tip.title}
                          </Text>
                          <ChevronRight size={20} color={colors.vastu} />
                        </View>
                        <View style={styles.tipContent}>
                          {tip.tips.map((t: any, i: number) => (
                            <Text
                              key={i}
                              style={[
                                styles.tipText,
                                { color: colors.secondaryText },
                              ]}
                            >
                              • {t}
                            </Text>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text
                    style={[styles.emptyText, { color: colors.secondaryText }]}
                  >
                    No Vastu tips found for your search.
                  </Text>
                )}
              </View>

            
            </ScrollView>

            {/* AI Analysis Modal */}
            {showAIModal && (
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
                        <Brain size={24} color={colors.vastu} />
                        <Text
                          style={[styles.modalTitle, { color: colors.text }]}
                        >
                          AI Vastu Analysis
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => setShowAIModal(false)}>
                        <X size={24} color={colors.secondaryText} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.aiModalContent}>
                      <Text
                        style={[
                          styles.promptLabel,
                          { color: colors.secondaryText },
                        ]}
                      >
                        Describe your space for Vastu analysis (room type,
                        direction, layout):
                      </Text>
                      <TextInput
                        style={[
                          styles.promptInput,
                          {
                            borderColor: colors.border,
                            color: colors.text,
                            backgroundColor: colors.background,
                          },
                        ]}
                        value={vastuPrompt}
                        onChangeText={setVastuPrompt}
                        placeholder="E.g., My living room faces North-East..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        placeholderTextColor={colors.secondaryText}
                      />

                      {error && (
                        <View
                          style={[
                            styles.errorContainer,
                            { backgroundColor: `${colors.error}20` },
                          ]}
                        >
                          <Text
                            style={[styles.errorText, { color: colors.error }]}
                          >
                            {error}
                          </Text>
                        </View>
                      )}

                      <TouchableOpacity
                        onPress={handleGenerateAnalysis}
                        disabled={isAnalyzing || !vastuPrompt.trim()}
                        style={[
                          styles.generateButton,
                          { backgroundColor: colors.vastu },
                          (isAnalyzing || !vastuPrompt.trim()) &&
                            styles.generateButtonDisabled,
                        ]}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader size={20} color="#FFFFFF" />
                            <Text style={styles.generateButtonText}>
                              Analyzing...
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.generateButtonText}>
                            Generate Analysis
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            )}

            {/* Analysis Result Modal */}
            {showAnalysisModal && selectedAnalysis && (
              <Modal
                visible={showAnalysisModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAnalysisModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View
                    style={[
                      styles.analysisModal,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <View
                      style={[
                        styles.modalHeader,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.modalTitle, { color: colors.text }]}>
                        Vastu Analysis Result
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowAnalysisModal(false)}
                      >
                        <X size={24} color={colors.secondaryText} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                      <View style={styles.analysisContent}>
                        <View
                          style={[
                            styles.scoreContainer,
                            { backgroundColor: colors.background },
                          ]}
                        >
                          <Text
                            style={[
                              styles.scoreLabel,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Vastu Score
                          </Text>
                          <Text
                            style={[styles.scoreValue, { color: colors.vastu }]}
                          >
                            {selectedAnalysis.score}/10
                          </Text>
                        </View>

                        <View style={styles.analysisSection}>
                          <Text
                            style={[
                              styles.analysisSectionTitle,
                              { color: colors.text },
                            ]}
                          >
                            Room Analysis
                          </Text>
                          <Text
                            style={[
                              styles.analysisText,
                              { color: colors.secondaryText },
                            ]}
                          >
                            {selectedAnalysis.analysis}
                          </Text>
                        </View>

                        <View style={styles.analysisSection}>
                          <Text
                            style={[
                              styles.analysisSectionTitle,
                              { color: colors.text },
                            ]}
                          >
                            Recommendations
                          </Text>
                          {selectedAnalysis.recommendations.map(
                            (rec, index) => (
                              <Text
                                key={index}
                                style={[
                                  styles.recommendationText,
                                  { color: colors.secondaryText },
                                ]}
                              >
                                • {rec}
                              </Text>
                            )
                          )}
                        </View>
{/* 
                        <TouchableOpacity
                          style={[
                            styles.saveAnalysisButton,
                            { backgroundColor: colors.background },
                          ]}
                        >
                          <Heart size={20} color={colors.vastu} />
                          <Text
                            style={[
                              styles.saveAnalysisButtonText,
                              { color: colors.vastu },
                            ]}
                          >
                            Save Analysis
                          </Text>
                        </TouchableOpacity> */}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            )}

           <Experts defaultCategory='Vastu Expert' />
          </View>
        </ScrollView>
      </PullToRefreshWrapper>{' '}
    </SafeAreaView>
  );
}

// The StyleSheet remains completely unchanged.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  programImageContainer: {
    position: 'relative',
    height: 170,
  },
  headerContainer: {
    backgroundColor: '#805AD5',
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
    color: '#E9D8FD',
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
    paddingVertical: 0,
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
    backgroundColor: '#805AD5',
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

  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  videoCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  videoContainer: {
    position: 'relative',
  },
  video: {
    width: '100%',
    height: 160,
    objectFit: 'cover',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
    padding: 4,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  videoDuration: {
    fontSize: 12,
    color: '#718096',
  },
  videoViews: {
    fontSize: 12,
    color: '#718096',
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  tipTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  tipContent: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  expertsContainer: {
    gap: 12,
  },
  expertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
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
    color: '#2D3748',
    marginBottom: 4,
  },
  expertSpeciality: {
    fontSize: 14,
    color: '#805AD5',
    marginBottom: 4,
  },
  expertExperience: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  expertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  expertPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38A169',
  },
  expertAvailability: {
    fontSize: 12,
    color: '#38A169',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 14,
    paddingVertical: 20,
  },
  bottomSpacing: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  analysisModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  expertModal: {
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
    backgroundColor: '#805AD5',
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
  analysisContent: {
    padding: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#805AD5',
  },
  analysisSection: {
    marginBottom: 20,
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  recommendationText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 4,
  },
  saveAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    marginTop: 16,
  },
  saveAnalysisButtonText: {
    color: '#805AD5',
    fontSize: 14,
    fontWeight: '600',
  },
  expertModalContent: {
    padding: 16,
  },
  expertDetails: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  expertModalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  expertModalInfo: {
    flex: 1,
  },
  expertModalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  expertModalSpeciality: {
    fontSize: 14,
    color: '#805AD5',
    marginBottom: 8,
  },
  expertModalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expertModalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38A169',
  },
  bookingInfo: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookingText: {
    fontSize: 14,
    color: '#4A5568',
  },
  bookButton: {
    backgroundColor: '#805AD5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});
