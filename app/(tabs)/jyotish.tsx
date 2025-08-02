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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Mic,
  CircleStop as StopCircle,
  Brain,
  Clock,
  Star,
  ChevronRight,
  X,
  Loader,
  Heart,
  ArrowLeft,
  Filter,
  Calendar,
  Sun,
  Moon,
  Compass,
  User,
  MapPin,
  Phone,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Experts from '@/components/Experts';
import { useGetAllConsultancyServicesQuery } from '@/redux/features/Consultancy/consultancyApi';
import { useThemeColors } from '@/hooks/useThemeColors';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';

interface JyotishReading {
  id: string;
  type: string;
  title: string;
  description: string;
  predictions: string[];
  recommendations: string[];
  score: number;
}

interface JyotishExpert {
  id: number;
  name: string;
  speciality: string;
  experience: string;
  rating: number;
  price: string;
  image: string;
  nextAvailable: string;
}

interface DailyHoroscope {
  sign: string;
  prediction: string;
  lucky: {
    color: string;
    number: string;
    direction: string;
  };
}

const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// Mock AI Jyotish Service
const generateJyotishReading = async (
  prompt: string,
  type: string
): Promise<JyotishReading> => {
  // Enhanced AI Jyotish Reading with better logic
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Analyze prompt and type for better reading generation
  const lowerPrompt = prompt.toLowerCase();
  let title = 'AI Generated Jyotish Reading';
  let description =
    'Based on your details, here is your personalized Jyotish reading.';
  let predictions: string[] = [];
  let recommendations: string[] = [];
  let score = 8.2;

  // Generate reading based on type
  switch (type) {
    case 'birth-chart':
      title = 'Birth Chart Analysis';
      description =
        'Based on your birth details, here is your comprehensive birth chart analysis.';
      predictions = [
        'You are entering a favorable period for career growth and financial stability.',
        "Jupiter's position indicates opportunities in education or spiritual pursuits.",
        'Mars in your 10th house suggests leadership roles and recognition.',
        'Venus brings harmony in relationships and creative endeavors.',
        "Saturn's influence encourages discipline and long-term planning.",
      ];
      recommendations = [
        "Wear a yellow sapphire on Thursday for Jupiter's blessings",
        'Chant "Om Gam Ganapataye Namaha" 108 times daily',
        'Donate to educational institutions on Thursdays',
        'Practice meditation during sunrise for mental clarity',
        'Avoid major decisions on Saturdays',
      ];
      score = 8.8;
      break;

    case 'palm-reading':
      title = 'Palm Reading Analysis';
      description =
        'Based on your palm description, here are the insights from palmistry.';
      predictions = [
        'Your life line indicates good health and longevity.',
        'The heart line shows emotional stability and loving relationships.',
        'Your head line suggests intelligence and analytical thinking.',
        'The fate line indicates career success through hard work.',
        'Mount of Venus shows artistic talents and creativity.',
      ];
      recommendations = [
        'Strengthen your intuition through regular meditation',
        'Use your analytical skills in decision-making',
        'Express your creativity through art or music',
        'Maintain good health through yoga and proper diet',
        'Trust your instincts in relationships',
      ];
      score = 8.5;
      break;

    case 'numerology':
      title = 'Numerology Report';
      description =
        'Based on your birth date and name, here is your numerological analysis.';
      predictions = [
        'Your life path number indicates leadership qualities.',
        'Your destiny number suggests success in communication fields.',
        'Your soul number reveals deep spiritual inclinations.',
        'Your personality number shows charismatic and friendly nature.',
        'Your birth date brings luck on specific days of the month.',
      ];
      recommendations = [
        'Use your lucky numbers in important decisions',
        'Wear colors that resonate with your numerological vibrations',
        'Plan important events on your favorable dates',
        'Develop your communication and leadership skills',
        'Practice gratitude to enhance positive vibrations',
      ];
      score = 8.3;
      break;

    case 'compatibility':
      title = 'Love Compatibility Analysis';
      description =
        "Based on both partners' details, here is your relationship compatibility reading.";
      predictions = [
        'Your zodiac signs show strong emotional compatibility.',
        'Venus positions indicate mutual attraction and love.',
        'Mars compatibility suggests good physical and mental harmony.',
        'Jupiter aspects bring growth and prosperity to the relationship.',
        'Overall planetary alignment favors a long-lasting bond.',
      ];
      recommendations = [
        'Communicate openly about your feelings and expectations',
        'Plan romantic activities during favorable planetary periods',
        "Respect each other's individual space and growth",
        'Practice couple meditation for deeper connection',
        'Celebrate festivals and traditions together',
      ];
      score = 9.1;
      break;

    case 'career':
      title = 'Career Guidance Reading';
      description =
        'Based on your planetary positions, here is your career guidance.';
      predictions = [
        'Your 10th house indicates success in leadership positions.',
        "Mercury's position favors communication and technology fields.",
        "Sun's placement suggests government or authority-related work.",
        'Your current planetary period supports career changes.',
        'Financial growth is indicated in the coming months.',
      ];
      recommendations = [
        'Focus on developing leadership and management skills',
        'Consider opportunities in education or consulting',
        'Network with influential people in your field',
        'Start new projects on auspicious days',
        'Maintain ethical practices for long-term success',
      ];
      score = 8.6;
      break;

    default:
      // Default horoscope reading
      predictions = [
        'You are entering a favorable period for personal growth.',
        'Planetary alignments support your current endeavors.',
        'Good time for making important life decisions.',
        'Relationships and partnerships will flourish.',
        'Health and vitality are well-supported by cosmic energies.',
      ];
      recommendations = [
        'Practice daily meditation for mental clarity',
        'Wear gemstones that support your birth chart',
        'Perform charitable acts to enhance positive karma',
        'Follow a healthy lifestyle and diet',
        'Stay connected with spiritual practices',
      ];
  }

  return {
    id: `reading-${Date.now()}`,
    type,
    title,
    description,
    predictions,
    recommendations,
    score,
  };
};

export default function JyotishPage() {
  const { data, isLoading } = useGetAllConsultancyServicesQuery({});
  const filteredExperts =
    data?.data?.filter((expert: any) => expert.category === 'Jyotish Expert') ||
    [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isListening, setIsListening] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [jyotishPrompt, setJyotishPrompt] = useState('');
  const [selectedReadingType, setSelectedReadingType] = useState('birth-chart');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReading, setSelectedReading] = useState<JyotishReading | null>(
    null
  );
  const [selectedExpert, setSelectedExpert] = useState<JyotishExpert | null>(
    null
  );
  const recognitionRef = useRef<any>(null);
  const colors = useThemeColors();

  const jyotishExperts: JyotishExpert[] = [
    {
      id: 1,
      name: 'Pandit Rajesh Sharma',
      speciality: 'Vedic Astrology & Palmistry',
      experience: '25 years',
      rating: 4.9,
      price: '2500',
      image:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      nextAvailable: 'Today, 4:00 PM',
    },
    {
      id: 2,
      name: 'Acharya Sunita Devi',
      speciality: 'Numerology & Gemstone Therapy',
      experience: '18 years',
      rating: 4.8,
      price: '2000',
      image:
        'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
      nextAvailable: 'Tomorrow, 11:00 AM',
    },
    {
      id: 3,
      name: 'Guru Vishwanath',
      speciality: 'Horary Astrology & Remedies',
      experience: '30 years',
      rating: 4.9,
      price: '3000',
      image:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      nextAvailable: 'Today, 7:00 PM',
    },
  ];

  const dailyHoroscope: DailyHoroscope[] = [
    {
      sign: 'Aries (মেষ)',
      prediction:
        'A favorable day ahead. New opportunities may arise in your career. Focus on your goals.',
      lucky: { color: 'Red', number: '9', direction: 'North' },
    },
    {
      sign: 'Taurus (বৃষভ)',
      prediction:
        'Family life will be peaceful and harmonious. Good time for financial planning.',
      lucky: { color: 'Green', number: '6', direction: 'South-East' },
    },
    {
      sign: 'Gemini (মিথুন)',
      prediction:
        'Be cautious with communication to avoid misunderstandings. Short travels are indicated.',
      lucky: { color: 'Yellow', number: '5', direction: 'East' },
    },
    {
      sign: 'Cancer (কর্কট)',
      prediction:
        'Emotional stability and family support will be strong. Focus on home and relationships.',
      lucky: { color: 'White', number: '2', direction: 'North-West' },
    },
    {
      sign: 'Leo (সিংহ)',
      prediction:
        'Leadership qualities will shine today. Creative projects will bring success.',
      lucky: { color: 'Orange', number: '1', direction: 'East' },
    },
    {
      sign: 'Virgo (কন্যা)',
      prediction:
        'Attention to detail will pay off. Health and work matters need careful consideration.',
      lucky: { color: 'Navy Blue', number: '3', direction: 'South' },
    },
  ];

  const readingTypes = [
    {
      id: 'birth-chart',
      name: 'Birth Chart Analysis',
      icon: <Star size={20} color="#D53F8C" />,
    },
    {
      id: 'palm-reading',
      name: 'Palm Reading',
      icon: <User size={20} color="#D53F8C" />,
    },
    {
      id: 'numerology',
      name: 'Numerology Report',
      icon: <Calendar size={20} color="#D53F8C" />,
    },
    {
      id: 'horoscope',
      name: 'Daily Horoscope',
      icon: <Sun size={20} color="#D53F8C" />,
    },
    {
      id: 'compatibility',
      name: 'Love Compatibility',
      icon: <Heart size={20} color="#D53F8C" />,
    },
    {
      id: 'career',
      name: 'Career Guidance',
      icon: <Compass size={20} color="#D53F8C" />,
    },
  ];

  const categories = [
    { id: 'all', name: 'All', icon: <Compass size={20} color="#D53F8C" /> },
    { id: 'kundli', name: 'Kundli', icon: <Star size={20} color="#D53F8C" /> },
    {
      id: 'horoscope',
      name: 'Horoscope',
      icon: <Sun size={20} color="#D53F8C" />,
    },
    {
      id: 'muhurta',
      name: 'Muhurta',
      icon: <Clock size={20} color="#D53F8C" />,
    },
    {
      id: 'panchang',
      name: 'Panchang',
      icon: <Calendar size={20} color="#D53F8C" />,
    },
  ];

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

  const handleGenerateReading = async () => {
    if (!jyotishPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    triggerHaptic();

    try {
      const reading = await generateJyotishReading(
        jyotishPrompt,
        selectedReadingType
      );
      setJyotishPrompt('');
      setShowAIModal(false);
      setSelectedReading(reading);
      setShowReadingModal(true);
    } catch (err: any) {
      console.error('Error generating reading:', err);
      setError(err.message || 'Failed to generate reading. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExpertBooking = (expert: JyotishExpert) => {
    triggerHaptic();
    setSelectedExpert(expert);
    setShowExpertModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <LinearGradient colors={['#D53F8C', '#B83280']} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Jyotish & Astrology</Text>
            <Text style={styles.headerSubtitle}>জ্যোতিষ ও জ্যোতির্বিদ্যা</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </LinearGradient>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vedic Calendar Section */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View style={styles.calendarIcon}>
                <Calendar size={28} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.calendarTitle}>Vedic Calendar</Text>
                <Text style={styles.calendarSubtitle}>VS 2081 • Chaitra</Text>
              </View>
            </View>

            <View style={styles.calendarGrid}>
              <View style={styles.calendarItem}>
                <Text style={styles.calendarLabel}>Tithi</Text>
                <Text style={styles.calendarValue}>Shukla Paksha 8</Text>
              </View>
              <View style={styles.calendarItem}>
                <Text style={styles.calendarLabel}>Nakshatra</Text>
                <Text style={styles.calendarValue}>Rohini</Text>
              </View>
              <View style={styles.calendarItem}>
                <Text style={styles.calendarLabel}>Yoga</Text>
                <Text style={styles.calendarValue}>Siddha</Text>
              </View>
              <View style={styles.calendarItem}>
                <Text style={styles.calendarLabel}>Karana</Text>
                <Text style={styles.calendarValue}>Bava</Text>
              </View>
            </View>

            <View style={styles.sunMoonContainer}>
              <View style={styles.sunMoonItem}>
                <Sun size={20} color="#F59E0B" />
                <View>
                  <Text style={styles.sunMoonLabel}>Sunrise: 6:15 AM</Text>
                  <Text style={styles.sunMoonLabel}>Sunset: 5:45 PM</Text>
                </View>
              </View>
              <View style={styles.sunMoonItem}>
                <Moon size={20} color="#60A5FA" />
                <View>
                  <Text style={styles.sunMoonLabel}>Moonrise: 8:30 PM</Text>
                  <Text style={styles.sunMoonLabel}>Moonset: 9:15 AM</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Search and AI Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#718096" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search astrologers, services..."
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
                  <Mic size={18} color="#D53F8C" />
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
              <Text style={styles.aiButtonText}>AI Reading</Text>
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
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  triggerHaptic();
                  setSelectedCategory(category.id);
                }}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
              >
                {React.cloneElement(category.icon, {
                  color:
                    selectedCategory === category.id ? '#FFFFFF' : '#D53F8C',
                })}
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id &&
                      styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Daily Horoscope */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Horoscope</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dailyHoroscope.map((horoscope, index) => (
              <View key={index} style={styles.horoscopeCard}>
                <View style={styles.horoscopeHeader}>
                  <Star size={24} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.horoscopeSign}>{horoscope.sign}</Text>
                </View>
                <Text style={styles.horoscopePrediction}>
                  {horoscope.prediction}
                </Text>
                <View style={styles.luckyContainer}>
                  <View style={styles.luckyItem}>
                    <Text style={styles.luckyLabel}>Color</Text>
                    <Text style={styles.luckyValue}>
                      {horoscope.lucky.color}
                    </Text>
                  </View>
                  <View style={styles.luckyItem}>
                    <Text style={styles.luckyLabel}>Number</Text>
                    <Text style={styles.luckyValue}>
                      {horoscope.lucky.number}
                    </Text>
                  </View>
                  <View style={styles.luckyItem}>
                    <Text style={styles.luckyLabel}>Direction</Text>
                    <Text style={styles.luckyValue}>
                      {horoscope.lucky.direction}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Jyotish Experts */}

        {isLoading ? (
          <LoadingComponent loading="Experts" color={colors.success} />
        ) : (
          <Experts
            data={filteredExperts}
            title={'Jyotish'}
            isLoading={isLoading}
          />
        )}
      </ScrollView>

      {/* AI Reading Modal */}
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
                  <Brain size={24} color="#D53F8C" />
                  <Text style={styles.modalTitle}>AI Jyotish Reading</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAIModal(false)}>
                  <X size={24} color="#718096" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.aiModalContent}>
                <View style={styles.readingTypesSection}>
                  <Text style={styles.readingTypesTitle}>
                    Select Reading Type:
                  </Text>
                  <View style={styles.readingTypesGrid}>
                    {readingTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        onPress={() => {
                          triggerHaptic();
                          setSelectedReadingType(type.id);
                        }}
                        style={[
                          styles.readingTypeCard,
                          selectedReadingType === type.id &&
                            styles.readingTypeCardActive,
                        ]}
                      >
                        {type.icon}
                        <Text
                          style={[
                            styles.readingTypeText,
                            selectedReadingType === type.id &&
                              styles.readingTypeTextActive,
                          ]}
                        >
                          {type.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.promptSection}>
                  <Text style={styles.promptLabel}>
                    Provide your birth details or question:
                  </Text>
                  <TextInput
                    style={styles.promptInput}
                    value={jyotishPrompt}
                    onChangeText={setJyotishPrompt}
                    placeholder="E.g., Born on 15th March 1990, 10:30 AM in Mumbai..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor="#A0AEC0"
                  />
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleGenerateReading}
                  disabled={isGenerating || !jyotishPrompt.trim()}
                  style={[
                    styles.generateButton,
                    (isGenerating || !jyotishPrompt.trim()) &&
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
                      Generate Reading
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Reading Result Modal */}
      {showReadingModal && selectedReading && (
        <Modal
          visible={showReadingModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReadingModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.readingModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Your Jyotish Reading</Text>
                <TouchableOpacity onPress={() => setShowReadingModal(false)}>
                  <X size={24} color="#718096" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.readingContent}>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Compatibility Score</Text>
                    <Text style={styles.scoreValue}>
                      {selectedReading.score}/10
                    </Text>
                  </View>

                  <View style={styles.readingSection}>
                    <Text style={styles.readingSectionTitle}>Predictions</Text>
                    {selectedReading.predictions.map((prediction, index) => (
                      <Text key={index} style={styles.predictionText}>
                        • {prediction}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.readingSection}>
                    <Text style={styles.readingSectionTitle}>
                      Recommendations
                    </Text>
                    {selectedReading.recommendations.map((rec, index) => (
                      <Text key={index} style={styles.recommendationText}>
                        • {rec}
                      </Text>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.saveReadingButton}>
                    <Heart size={20} color="#D53F8C" />
                    <Text style={styles.saveReadingButtonText}>
                      Save Reading
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Expert Booking Modal */}
      {showExpertModal && selectedExpert && (
        <Modal
          visible={showExpertModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowExpertModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.expertModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book Consultation</Text>
                <TouchableOpacity onPress={() => setShowExpertModal(false)}>
                  <X size={24} color="#718096" />
                </TouchableOpacity>
              </View>

              <View style={styles.expertModalContent}>
                <View style={styles.expertDetails}>
                  <Image
                    source={{ uri: selectedExpert.image }}
                    style={styles.expertModalImage}
                  />
                  <View style={styles.expertModalInfo}>
                    <Text style={styles.expertModalName}>
                      {selectedExpert.name}
                    </Text>
                    <Text style={styles.expertModalSpeciality}>
                      {selectedExpert.speciality}
                    </Text>
                    <View style={styles.expertModalMeta}>
                      <View style={styles.ratingContainer}>
                        <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.ratingText}>
                          {selectedExpert.rating}
                        </Text>
                      </View>
                      <Text style={styles.expertModalPrice}>
                        ৳{selectedExpert.price}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bookingInfo}>
                  <View style={styles.bookingItem}>
                    <Calendar size={20} color="#D53F8C" />
                    <Text style={styles.bookingText}>
                      Next Available: {selectedExpert.nextAvailable}
                    </Text>
                  </View>
                  <View style={styles.bookingItem}>
                    <Clock size={20} color="#D53F8C" />
                    <Text style={styles.bookingText}>Duration: 45 minutes</Text>
                  </View>
                  <View style={styles.bookingItem}>
                    <Phone size={20} color="#D53F8C" />
                    <Text style={styles.bookingText}>
                      Video/Phone Consultation
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => {
                    triggerHaptic();
                    alert(`Booking confirmed with ${selectedExpert.name}!`);
                    setShowExpertModal(false);
                  }}
                >
                  <Text style={styles.bookButtonText}>
                    Book Now - ৳{selectedExpert.price}
                  </Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  headerContainer: {
    backgroundColor: '#D53F8C',
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
    color: '#FCE7F3',
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  calendarSection: {
    padding: 16,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  calendarIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D53F8C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  calendarSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  calendarItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
  },
  calendarLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  calendarValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  sunMoonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  sunMoonItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  sunMoonLabel: {
    fontSize: 12,
    color: '#4A5568',
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
    backgroundColor: '#8B5CF6',
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
    backgroundColor: '#D53F8C',
    borderColor: '#D53F8C',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
  },
  categoryTextActive: {
    color: '#FFFFFF',
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
  horoscopeCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  horoscopeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  horoscopeSign: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  horoscopePrediction: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  luckyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  luckyItem: {
    alignItems: 'center',
  },
  luckyLabel: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 4,
  },
  luckyValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
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
    color: '#D53F8C',
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
    color: '#10B981',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
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
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  readingModal: {
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
  readingTypesSection: {
    marginBottom: 20,
  },
  readingTypesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  readingTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  readingTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    width: '48%',
  },
  readingTypeCardActive: {
    backgroundColor: '#D53F8C',
    borderColor: '#D53F8C',
  },
  readingTypeText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  readingTypeTextActive: {
    color: '#FFFFFF',
  },
  promptSection: {
    marginBottom: 20,
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
    minHeight: 100,
    textAlignVertical: 'top',
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
    backgroundColor: '#D53F8C',
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
  readingContent: {
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
    color: '#D53F8C',
  },
  readingSection: {
    marginBottom: 20,
  },
  readingSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  predictionText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 4,
  },
  saveReadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    marginTop: 16,
  },
  saveReadingButtonText: {
    color: '#D53F8C',
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
    color: '#D53F8C',
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
    color: '#10B981',
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
    backgroundColor: '#D53F8C',
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
