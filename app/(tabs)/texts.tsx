import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  TextInput,
  Linking,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Play,
  Clock,
  User,
  Star,
  ArrowLeft,
  X,
  MessageSquare,
  Brain,
  CircleCheck as CheckCircle,
  Award,
  Loader,
  Video,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAlCoursesQuery } from '@/redux/features/Course/courseApi';
import { useGetAllReelsQuery } from '@/redux/features/Reels/reelsApi';
// --- (1) IMPORT THE CHAT MUTATION HOOK ---
// Note: Adjust the import path if it's different in your project structure.;
import YoutubePlayer from 'react-native-youtube-iframe';
import { getYouTubeVideoId } from '@/utils/getYouTubeVideoId';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import { useChatMutation } from '@/redux/features/AI/aiApi';

interface Course {
  title: string;
  description: string;
  duration: string;
  progress: number;
  image: string;
  lastLesson: string;
}

interface RealVideo {
  title: string;
  duration: string;
  instructor: string;
  views: string;
  thumbnail: string;
  videoUrl: string;
}

interface QuizTopic {
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface Quiz {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export type TCourse = {
  _id: string;
  imageUrl?: string;
  name: string;
  url: string;
  duration: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TReels = {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoSource: string;
  category: string;
  tags: string[];
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const quizTopics: QuizTopic[] = [
  { title: 'Rigveda Basics', difficulty: 'Beginner' },
  { title: 'Sanskrit Grammar Fundamentals', difficulty: 'Intermediate' },
  { title: 'Core Vedic Philosophy', difficulty: 'Advanced' },
  { title: 'Introduction to Upanishads', difficulty: 'Intermediate' },
];

// Mock Quiz Service
const QuizService = {
  generateQuiz: async (topic: string, difficulty: string): Promise<Quiz> => {
    // Enhanced AI Quiz Generation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let questions: QuizQuestion[] = [];

    // Generate questions based on topic and difficulty
    if (topic.includes('Rigveda')) {
      if (difficulty === 'Beginner') {
        questions = [
          {
            id: '1',
            question: 'What is the oldest of the four Vedas?',
            options: ['Rigveda', 'Samaveda', 'Yajurveda', 'Atharvaveda'],
            correctAnswer: 0,
          },
          {
            id: '2',
            question: 'How many mandalas (books) are there in the Rigveda?',
            options: ['8', '10', '12', '16'],
            correctAnswer: 1,
          },
          {
            id: '3',
            question:
              'Which deity is most frequently mentioned in the Rigveda?',
            options: ['Vishnu', 'Shiva', 'Indra', 'Brahma'],
            correctAnswer: 2,
          },
        ];
      } else if (difficulty === 'Intermediate') {
        questions = [
          {
            id: '1',
            question: 'The Rigveda contains approximately how many hymns?',
            options: ['1028', '1017', '1875', '731'],
            correctAnswer: 0,
          },
          {
            id: '2',
            question:
              'Which mandala of Rigveda is known as the "Family Books"?',
            options: [
              'Mandala 1-2',
              'Mandala 2-7',
              'Mandala 8-9',
              'Mandala 9-10',
            ],
            correctAnswer: 1,
          },
        ];
      } else {
        questions = [
          {
            id: '1',
            question:
              'The Rigvedic meter "Gayatri" consists of how many syllables?',
            options: ['24', '32', '44', '48'],
            correctAnswer: 0,
          },
          {
            id: '2',
            question: 'Which Rigvedic hymn is known as the "Nasadiya Sukta"?',
            options: ['RV 1.1.1', 'RV 10.129', 'RV 3.62.10', 'RV 7.59.12'],
            correctAnswer: 1,
          },
        ];
      }
    } else if (topic.includes('Sanskrit')) {
      if (difficulty === 'Beginner') {
        questions = [
          {
            id: '1',
            question: 'How many letters are there in the Sanskrit alphabet?',
            options: ['48', '50', '52', '54'],
            correctAnswer: 1,
          },
          {
            id: '2',
            question: 'What does "Namaste" literally mean?',
            options: ['Hello', 'Goodbye', 'I bow to you', 'Thank you'],
            correctAnswer: 2,
          },
        ];
      } else {
        questions = [
          {
            id: '1',
            question:
              'Which Sanskrit grammar text is considered most authoritative?',
            options: [
              'Ashtadhyayi',
              'Mahabhashya',
              'Vakyapadiya',
              'Siddhanta Kaumudi',
            ],
            correctAnswer: 0,
          },
          {
            id: '2',
            question: 'The Sanskrit word "Yoga" is derived from which root?',
            options: ['Yuj', 'Yog', 'Yuga', 'Yukti'],
            correctAnswer: 0,
          },
        ];
      }
    } else if (topic.includes('Philosophy')) {
      questions = [
        {
          id: '1',
          question:
            'How many schools of Indian philosophy are traditionally recognized?',
          options: ['4', '6', '8', '10'],
          correctAnswer: 1,
        },
        {
          id: '2',
          question: 'Which concept is central to Advaita Vedanta?',
          options: ['Duality', 'Non-duality', 'Plurality', 'Materialism'],
          correctAnswer: 1,
        },
        {
          id: '3',
          question: 'The concept of "Maya" in Vedantic philosophy refers to:',
          options: ['Reality', 'Illusion', 'Knowledge', 'Liberation'],
          correctAnswer: 1,
        },
      ];
    } else {
      // Default Upanishads questions
      questions = [
        {
          id: '1',
          question:
            'How many principal Upanishads are traditionally recognized?',
          options: ['10', '12', '13', '15'],
          correctAnswer: 2,
        },
        {
          id: '2',
          question:
            'Which Upanishad contains the famous "Tat tvam asi" statement?',
          options: ['Isha', 'Kena', 'Chandogya', 'Mundaka'],
          correctAnswer: 2,
        },
        {
          id: '3',
          question: 'The word "Upanishad" literally means:',
          options: [
            'Sacred text',
            'Sitting near',
            'Divine knowledge',
            'Ancient wisdom',
          ],
          correctAnswer: 1,
        },
      ];
    }

    return {
      id: `quiz_${Date.now()}`,
      title: topic,
      difficulty: difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      questions,
    };
  },
};

// Quiz Modal Component
const QuizModal: React.FC<{
  quiz: Quiz;
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
}> = ({ quiz, onClose, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === quiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
      onComplete(
        score +
          (selectedAnswer === quiz.questions[currentQuestion].correctAnswer
            ? 1
            : 0),
        quiz.questions.length
      );
    }
  };

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.quizModalContainer}>
        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#2D3748" />
          </TouchableOpacity>
        </View>

        {!showResult ? (
          <View style={styles.quizContent}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Question {currentQuestion + 1} of {quiz.questions.length}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        ((currentQuestion + 1) / quiz.questions.length) * 100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={styles.questionText}>
              {quiz.questions[currentQuestion].question}
            </Text>

            <View style={styles.optionsContainer}>
              {quiz.questions[currentQuestion].options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === index && styles.selectedOption,
                  ]}
                  onPress={() => handleAnswerSelect(index)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedAnswer === index && styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                selectedAnswer === null && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={selectedAnswer === null}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestion < quiz.questions.length - 1
                  ? 'Next'
                  : 'Finish'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <Award size={64} color="#F59E0B" />
            <Text style={styles.resultTitle}>Quiz Complete!</Text>
            <Text style={styles.resultScore}>
              You scored {score} out of {quiz.questions.length}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default function LearnScreen() {
  const {
    data,
    isLoading: isCourseLoading,
    refetch: refetchCourses,
  } = useGetAlCoursesQuery({});

  const {
    data: reels,
    isLoading: isReelsLoading,
    refetch: refetchReels,
  } = useGetAllReelsQuery({});

  const [chat, { isLoading: isSendingMessage }] = useChatMutation();

  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<
    'courses' | 'videos' | 'ai' | 'quiz'
  >('courses');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<RealVideo | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { role: 'user' | 'assistant'; content: string; id: string }[]
  >([
    {
      role: 'assistant',
      content:
        "Hello! I'm your AI learning assistant. How can I help you with your Vedic studies today?",
      id: `initial-${Date.now()}`,
    },
  ]);

  const chatScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    chatScrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCourses(), refetchReels()]);
    } catch (error) {
      console.error('Error while refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleGenerateQuiz = async (
    topic: string,
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  ) => {
    try {
      setIsGeneratingQuiz(true);
      setError(null);
      const quiz = await QuizService.generateQuiz(topic, difficulty);
      setCurrentQuiz(quiz);
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    console.log(`Quiz completed with score: ${score}/${totalQuestions}`);
  };

  const handleVideoPlay = (video: RealVideo) => {
    triggerHaptic();
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handleAIAssistant = () => {
    triggerHaptic();
    setShowChatModal(true);
  };
 const handleSendMessage = async () => {
    // Prevent sending empty or while another message is in flight
    if (!chatMessage.trim() || isSendingMessage) return;

    // Hold the current message in a variable before clearing the state
    const messageToSend = chatMessage;

    // Create the user's message object for optimistic UI update
    const userMessage = {
      role: 'user' as const,
      content: messageToSend,
      id: `user-${Date.now()}`,
    };

    // Optimistically add the user's message to the history and clear the input
    setChatHistory((prev) => [...prev, userMessage]);
    setChatMessage('');

    try {
      // Call the API
      const response = await chat(messageToSend).unwrap();

      // Create the AI's response message object
      const aiMessage = {
        role: 'assistant' as const,
        // Ensure you access the correct property from your API response
        content:
          response?.data || "Sorry, I couldn't process that request.",
        id: `ai-${Date.now()}`,
      };

      // Add the AI's message to the history
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);

      // Create an error message object to display in the chat
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, there was an error. Please try again.',
        id: `error-${Date.now()}`,
      };

      // Add the error message to the history
      setChatHistory((prev) => [...prev, errorMessage]);
    }
  };

  const [playingCardIndex, setPlayingCardIndex] = useState<number | null>(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <View style={styles.tabContent}>
            {isCourseLoading ? (
              <LoadingComponent loading="Courses" color={colors.primary} />
            ) : (
              data?.data.map((course: TCourse, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.courseCard,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.cardShadow,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: course.imageUrl }}
                    style={styles.courseImage}
                  />
                  <View style={styles.courseContent}>
                    <Text style={[styles.courseTitle, { color: colors.text }]}>
                      {course?.name}
                    </Text>

                    <View style={styles.courseMeta}>
                      <View style={styles.metaItem}>
                        <Clock size={14} color={colors.secondaryText} />
                        <Text
                          style={[
                            styles.metaText,
                            { color: colors.secondaryText },
                          ]}
                        >
                          {course?.duration}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.continueButton}
                      onPress={() => {
                        if (course?.url) {
                          Linking.openURL(course?.url).catch((err) =>
                            console.error('Failed to open URL:', err)
                          );
                        }
                      }}
                    >
                      <Play size={16} color="#FFFFFF" />
                      <Text style={styles.continueButtonText}>
                        Continue Learning
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'videos':
        return (
          <View style={styles.tabContent}>
            {isReelsLoading ? (
              <LoadingComponent loading=" " color={colors.success} />
            ) : (
              reels?.data.map((video: TReels, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.videoCard,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.cardShadow,
                    },
                  ]}
                >
                  <View style={styles.programImageContainer}>
                    <YoutubePlayer
                      height={200}
                      play={playingCardIndex === index}
                      videoId={getYouTubeVideoId(video?.videoUrl) || ''}
                      onChangeState={(state: any) => {
                        if (state === 'ended') setPlayingCardIndex(null);
                      }}
                    />
                  </View>

                  <View style={styles.videoInfo}>
                    <Text style={[styles.videoTitle, { color: colors.text }]}>
                      {video.title}
                    </Text>
                    <View style={styles.videoMeta}>
                      <Text
                        style={[
                          styles.videoInstructor,
                          { color: colors.secondaryText },
                        ]}
                      >
                        {video.category}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        );

      case 'ai':
        return (
          <View style={styles.tabContent}>
            <View
              style={[
                styles.aiCard,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.cardShadow,
                },
              ]}
            >
              <MessageSquare size={48} color="#3B82F6" />
              <Text style={[styles.aiTitle, { color: colors.text }]}>
                AI Learning Assistant
              </Text>
              <Text
                style={[styles.aiDescription, { color: colors.secondaryText }]}
              >
                Get personalized help with your Vedic studies. Ask questions,
                get explanations, and deepen your understanding.
              </Text>
              <TouchableOpacity
                style={styles.aiButton}
                onPress={handleAIAssistant}
              >
                <Brain size={20} color="#FFFFFF" />
                <Text style={styles.aiButtonText}>Start Conversation</Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.aiFeatures,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.cardShadow,
                },
              ]}
            >
              <Text style={[styles.aiFeaturesTitle, { color: colors.text }]}>
                What can AI help you with?
              </Text>
              {[
                'Explain complex Vedic concepts',
                'Answer questions about Sanskrit',
                'Help with pronunciation of mantras',
                'Provide study recommendations',
              ].map((item, index) => (
                <View key={index} style={styles.aiFeatureItem}>
                  <CheckCircle size={16} color="#10B981" />
                  <Text
                    style={[
                      styles.aiFeatureText,
                      { color: colors.secondaryText },
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'quiz':
        return (
          <View style={styles.tabContent}>
            {error && (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: colors.error + '20' },
                ]}
              >
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              </View>
            )}

            {isGeneratingQuiz ? (
              <View
                style={[
                  styles.loadingContainer,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.cardShadow,
                  },
                ]}
              >
                <Loader size={32} color="#FF6F00" />
                <Text
                  style={[styles.loadingText, { color: colors.secondaryText }]}
                >
                  Generating your quiz...
                </Text>
              </View>
            ) : (
              <>
                {quizTopics.map((topic, index) => (
                  <View
                    key={index}
                    style={[
                      styles.quizTopicCard,
                      {
                        backgroundColor: colors.card,
                        shadowColor: colors.cardShadow,
                      },
                    ]}
                  >
                    <View style={styles.quizTopicHeader}>
                      <View>
                        <Text
                          style={[
                            styles.quizTopicTitle,
                            { color: colors.text },
                          ]}
                        >
                          {topic.title}
                        </Text>
                        <View
                          style={[
                            styles.difficultyBadge,
                            { backgroundColor: colors.background },
                          ]}
                        >
                          <Text
                            style={[
                              styles.difficultyText,
                              { color: colors.secondaryText },
                            ]}
                          >
                            {topic.difficulty}
                          </Text>
                        </View>
                      </View>
                      <Award size={24} color="#F59E0B" />
                    </View>

                    <TouchableOpacity
                      style={styles.startQuizButton}
                      onPress={() =>
                        handleGenerateQuiz(topic.title, topic.difficulty)
                      }
                    >
                      <BookOpen size={16} color="#FFFFFF" />
                      <Text style={styles.startQuizButtonText}>Start Quiz</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <View
                  style={[
                    styles.comingSoonCard,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.cardShadow,
                    },
                  ]}
                >
                  <Text
                    style={[styles.comingSoonTitle, { color: colors.text }]}
                  >
                    More Quizzes Coming Soon!
                  </Text>
                  <Text
                    style={[
                      styles.comingSoonText,
                      { color: colors.secondaryText },
                    ]}
                  >
                    Check back for AI-generated quizzes based on your learning.
                  </Text>
                </View>
              </>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Header */}
          <LinearGradient colors={['#FF6F00', '#FF8F00']} style={styles.header}>
            <TouchableOpacity
           onPress={() => router.push('/(tabs)')}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Learn & Explore</Text>
              <Text style={styles.headerSubtitle}>শিখুন ও অন্বেষণ করুন</Text>
            </View>
            <View style={styles.headerPlaceholder} />
          </LinearGradient>

          {/* Tab Navigation */}
          <View
            style={[
              styles.tabContainer,
              { backgroundColor: colors.card, shadowColor: colors.cardShadow },
            ]}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { id: 'courses', name: 'Courses' },
                { id: 'videos', name: 'Videos' },
                { id: 'ai', name: 'AI Assistant' },
                { id: 'quiz', name: 'Quiz' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    [
                      styles.tab,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ],
                    activeTab === tab.id && styles.activeTab,
                  ]}
                  onPress={() => {
                    setActiveTab(tab.id as any);
                    triggerHaptic();
                  }}
                >
                  <Text
                    style={[
                      [styles.tabText, { color: colors.secondaryText }],
                      activeTab === tab.id && styles.activeTabText,
                    ]}
                  >
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Content */}
          <View style={[styles.content, { backgroundColor: colors.background }]}>
            {renderTabContent()}
          </View>
        </ScrollView>

        {/* Quiz Modal */}
        {currentQuiz && (
          <QuizModal
            quiz={currentQuiz}
            onClose={() => setCurrentQuiz(null)}
            onComplete={handleQuizComplete}
          />
        )}

        {/* Video Modal */}
        {showVideoModal && selectedVideo && (
          <Modal
            visible={true}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <SafeAreaView style={styles.videoModalContainer}>
              <View style={styles.videoModalHeader}>
                <Text style={styles.videoModalTitle}>Video Player</Text>
                <TouchableOpacity onPress={() => setShowVideoModal(false)}>
                  <X size={24} color="#2D3748" />
                </TouchableOpacity>
              </View>

              <View style={styles.videoPlayerContainer}>
                <View style={styles.videoPlaceholder}>
                  <Video size={64} color="#718096" />
                  <Text style={styles.videoPlaceholderText}>
                    Video: {selectedVideo.title}
                  </Text>
                  <Text style={styles.videoPlaceholderSubtext}>
                    By {selectedVideo.instructor}
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
        )}

        {/* AI Chat Modal */}
        {showChatModal && (
          <Modal
            visible={true}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowChatModal(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <SafeAreaView
                style={[
                  styles.chatModalContainer,
                  { backgroundColor: colors.background },
                ]}
              >
                <View
                  style={[
                    styles.chatModalHeader,
                    {
                      backgroundColor: colors.card,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chatModalTitle, { color: colors.text }]}>
                    AI Learning Assistant
                  </Text>
                  <TouchableOpacity onPress={() => setShowChatModal(false)}>
                    <X size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  ref={chatScrollViewRef}
                  style={[
                    styles.chatMessages,
                    { backgroundColor: colors.background },
                  ]}
                  contentContainerStyle={{ paddingBottom: 10 }}
                >
                   {/* --- MODIFICATION 3: Use message.id for the key prop --- */}
                {chatHistory.map((message) => (
                  <View
                    key={message.id} // Use the unique ID for the key
                    style={[
                      styles.chatBubble,
                      message.role === 'user'
                        ? styles.userBubble
                        : styles.aiBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chatText,
                        message.role === 'user'
                          ? styles.userText
                          : [styles.aiText, { color: colors.text }],
                      ]}
                    >
                      {message.content}
                    </Text>
                  </View>
                ))}
                {/* A loading indicator can still be shown while waiting for the response */}
                {isSendingMessage && (
                  <View style={[styles.chatBubble, styles.aiBubble]}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                )}
              </ScrollView>

                <View
                  style={[
                    styles.chatInputContainer,
                    {
                      backgroundColor: colors.card,
                      borderTopColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.chatInput,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={chatMessage}
                    onChangeText={setChatMessage}
                    placeholder="Ask about Vedic concepts..."
                    placeholderTextColor={colors.secondaryText}
                    multiline
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (!chatMessage.trim() || isSendingMessage) &&
                        styles.sendButtonDisabled,
                    ]}
                    onPress={handleSendMessage}
                    disabled={!chatMessage.trim() || isSendingMessage}
                  >
                    {isSendingMessage ? (
                      <Loader size={20} color="#FFFFFF" />
                    ) : (
                      <MessageSquare size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </KeyboardAvoidingView>
          </Modal>
        )}
      </SafeAreaView>
    </PullToRefreshWrapper>
  );
}

const styles = StyleSheet.create({
  // ... (All your existing styles remain unchanged)
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  programImageContainer: {
    position: 'relative',
    height: 180,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    width: 24, // to balance the placeholder
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF7ED',
  },
  headerPlaceholder: {
    width: 24,
  },
  tabContainer: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginLeft: 16,
    borderRadius: 25,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTab: {
    backgroundColor: '#FF6F00',
    borderColor: '#FF6F00',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 0, // content itself shouldn't have bottom padding if it's inside a ScrollView
  },
  tabContent: {
    gap: 16,
    paddingBottom: 16, // Add padding here so last item has space
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  courseImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  courseContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#718096',
  },
  progressText: {
    fontSize: 12,
    color: '#718096',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6F00',
    borderRadius: 2,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6F00',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  videoThumbnailContainer: {
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: 180,
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
    fontSize: 12,
    color: '#FFFFFF',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
    marginTop: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoInstructor: {
    fontSize: 14,
    color: '#718096',
  },
  videoViews: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  aiDescription: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiFeatures: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  aiFeaturesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  aiFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  aiFeatureText: {
    fontSize: 14,
    color: '#4A5568',
  },
  quizTopicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quizTopicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  quizTopicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  difficultyBadge: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 12,
    color: '#718096',
  },
  startQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6F00',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  startQuizButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  comingSoonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingText: {
    fontSize: 14,
    color: '#718096',
    marginTop: 12,
  },
  quizModalContainer: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  quizContent: {
    flex: 1,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 24,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedOption: {
    borderColor: '#FF6F00',
    backgroundColor: '#FFF7ED',
  },
  optionText: {
    fontSize: 16,
    color: '#2D3748',
  },
  selectedOptionText: {
    color: '#FF6F00',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 18,
    color: '#718096',
    marginBottom: 32,
  },
  closeButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  videoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  videoPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  videoPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  videoPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
    textAlign: 'center',
  },
  videoPlaceholderSubtext: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
    textAlign: 'center',
  },
  chatModalContainer: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chatModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#2D3748',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    maxHeight: 100,
    fontSize: 14,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});