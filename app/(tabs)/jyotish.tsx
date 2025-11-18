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
import { useGetAllConsultancyServicesQuery } from '@/redux/features/Consultancy/consultancyApi';
import { useThemeColors } from '@/hooks/useThemeColors';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import AppHeader from '@/components/Reusable/AppHeader/AppHeader';
import {
  useGenerateKundliMutation,
  useGenerateMuhurtaMutation,
  useGetAllDailyHoroscopesQuery,
} from '@/redux/features/Jyotish/dailyHoroscopeApi';
import SkeletonLoader from '@/components/Reusable/SkeletonLoader';
import Experts from '@/components/ConsultancyPage/Experts';

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
// Mock AI Jyotish Service

export default function JyotishPage() {
  const {
    data,
    isLoading,
    refetch: refetchConsultancy,
  } = useGetAllConsultancyServicesQuery({});
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetchConsultancy()]);
    } catch (error) {
      console.error('Error while refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isListening, setIsListening] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [selectedReadingType, setSelectedReadingType] = useState('birth-chart');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReading, setSelectedReading] = useState<JyotishReading | null>(
    null
  );
  const [selectedExpert, setSelectedExpert] = useState<JyotishExpert | null>(
    null
  );
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [jyotishPrompt, setJyotishPrompt] = useState('');
  const [error, setError] = useState('');
  const [kundliReading, setKundliReading] = useState('');
  const recognitionRef = useRef<any>(null);
  const colors = useThemeColors();
  const { data: dailyHoroscope, isLoading: isHoroscopeLoading } =
    useGetAllDailyHoroscopesQuery({ keyword: searchQuery });
  const [generateKundli, { isLoading: isKundliLoading ,error:kundaliError}] =
    useGenerateKundliMutation();
  const [generateMuhurta, { isLoading: isMuhurtaLoading,error:MuhurtaError }] =
    useGenerateMuhurtaMutation();

  const readingTypes = [
    {
      id: 'kundali',
      name: 'Kundali',
      icon: <Star size={20} color="#D53F8C" />,
    },
    {
      id: 'muhurta',
      name: 'Muhurta',
      icon: <User size={20} color="#D53F8C" />,
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
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleGenerateKundali = async () => {
    try {
      // clear previous error and start loading
      setError('');
      setBirthDate('');
      setBirthPlace('');
      setName('');

      // call your RTK Query mutation
      const res = await generateKundli({
        name: name.trim(),
        birthDate: birthDate.trim(),
        birthTime: birthTime.trim(),
        birthPlace: birthPlace.trim(),
      }).unwrap();
      setShowAIModal(false);
      setKundliReading(res?.data);
      setShowReadingModal(true);

      // You can optionally store or display the result
      // setGeneratedReading(res?.data || res?.result || "No data received");
    } catch (err) {
      console.error('Error generating Kundli:', err);
      setError(err?.data?.message || 'Failed to generate Kundli');
    }
  };
  const handleGenerateMuhurta = async () => {
    try {
      // clear previous error and start loading
      setError('');

      const res = await generateMuhurta({
        query: jyotishPrompt,
      }).unwrap();
      setShowAIModal(false);
      setKundliReading(res?.data);
      setShowReadingModal(true);

      // You can optionally store or display the result
      // setGeneratedReading(res?.data || res?.result || "No data received");
    } catch (err) {
      console.error('Error generating Kundli:', err);
      setError(err?.data?.message || 'Failed to generate Kundli');
    }
  };

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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <AppHeader
          title="Jyotish & Astrology"
          colors={['#FF8F00', '#F57C00']}
        />
        <ScrollView
          style={{ backgroundColor: colors.background }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View
            style={[styles.container, { backgroundColor: colors.background }]}
          >
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Vedic Calendar Section */}
              <View style={styles.calendarSection}>
                <View
                  style={[
                    styles.calendarCard,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.cardShadow,
                    },
                  ]}
                >
                  <View style={styles.calendarHeader}>
                    <View
                      style={[
                        styles.calendarIcon,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Calendar size={28} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text
                        style={[styles.calendarTitle, { color: colors.text }]}
                      >
                        Vedic Calendar
                      </Text>
                      <Text
                        style={[
                          styles.calendarSubtitle,
                          { color: colors.secondaryText },
                        ]}
                      >
                        VS 2081 • Chaitra
                      </Text>
                    </View>
                  </View>

                  <View style={styles.calendarGrid}>
                    <View
                      style={[
                        styles.calendarItem,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarLabel,
                          { color: colors.secondaryText },
                        ]}
                      >
                        Tithi
                      </Text>
                      <Text
                        style={[styles.calendarValue, { color: colors.text }]}
                      >
                        Shukla Paksha 8
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.calendarItem,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarLabel,
                          { color: colors.secondaryText },
                        ]}
                      >
                        Nakshatra
                      </Text>
                      <Text
                        style={[styles.calendarValue, { color: colors.text }]}
                      >
                        Rohini
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.calendarItem,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarLabel,
                          { color: colors.secondaryText },
                        ]}
                      >
                        Yoga
                      </Text>
                      <Text
                        style={[styles.calendarValue, { color: colors.text }]}
                      >
                        Siddha
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.calendarItem,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarLabel,
                          { color: colors.secondaryText },
                        ]}
                      >
                        Karana
                      </Text>
                      <Text
                        style={[styles.calendarValue, { color: colors.text }]}
                      >
                        Bava
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sunMoonContainer}>
                    <View
                      style={[
                        styles.sunMoonItem,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <Sun size={20} color={colors.warning} />
                      <View>
                        <Text
                          style={[
                            styles.sunMoonLabel,
                            { color: colors.secondaryText },
                          ]}
                        >
                          Sunrise: 6:15 AM
                        </Text>
                        <Text
                          style={[
                            styles.sunMoonLabel,
                            { color: colors.secondaryText },
                          ]}
                        >
                          Sunset: 5:45 PM
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.sunMoonItem,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <Moon size={20} color={colors.info} />
                      <View>
                        <Text
                          style={[
                            styles.sunMoonLabel,
                            { color: colors.secondaryText },
                          ]}
                        >
                          Moonrise: 8:30 PM
                        </Text>
                        <Text
                          style={[
                            styles.sunMoonLabel,
                            { color: colors.secondaryText },
                          ]}
                        >
                          Moonset: 9:15 AM
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Search and AI Section */}
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
                      placeholder="Search astrologers, services..."
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
                        <Mic size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic();
                      setShowAIModal(true);
                    }}
                    style={[
                      styles.aiButton,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Brain size={20} color="#FFFFFF" />
                    <Text style={styles.aiButtonText}>AI Reading</Text>
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

              {/* Categories */}
              {/* <View style={styles.categoriesContainer}>
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
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                      selectedCategory === category.id && [
                        styles.categoryChipActive,
                        {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ],
                    ]}
                  >
                    {React.cloneElement(category.icon, {
                      color:
                        selectedCategory === category.id
                          ? '#FFFFFF'
                          : colors.primary,
                    })}
                    <Text
                      style={[
                        styles.categoryText,
                        { color: colors.secondaryText },
                        selectedCategory === category.id &&
                          styles.categoryTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View> */}

              {/* Daily Horoscope */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Daily Horoscope
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {isHoroscopeLoading? (<SkeletonLoader height={150} width={280} innerSkeleton={
                                        <View
                                          style={{
                                            padding: 15,
                                            justifyContent: 'space-between',
                                            flex: 1,
                                          }}
                                        >
                                            <View
                                              style={{
                                                width: '40%',
                                                height: 16,
                                                backgroundColor: '#e0e0e0',
                                                borderRadius: 8,
                                                marginBottom: 8,
                                              }}
                                            />
                                              <View
                                                style={{
                                                  width: '90%',
                                                  height: 12,
                                                  backgroundColor: '#e0e0e0',
                                                  borderRadius: 6,
                                                   marginBottom: 8,
                                                }}
                                              />
                                              <View
                                                style={{
                                                  width: '80%',
                                                  height: 12,
                                                  backgroundColor: '#e0e0e0',
                                                  borderRadius: 6,
                                                   marginBottom: 8,
                                                }}
                                              />
                                              <View
                                                style={{
                                                  width: '90%',
                                                  height: 12,
                                                  backgroundColor: '#e0e0e0',
                                                  borderRadius: 6,
                                                }}
                                              />
                                             
                                          
                  
                                          <View
                                            style={{
                                              width: '100%',
                                              height: 35,
                                              backgroundColor: '#d6d6d6',
                                              borderRadius: 8,
                                              marginTop: 15,
                                            }}
                                          />
                                        </View>
                                      }/> ):(dailyHoroscope?.data?.map((horoscope:any, index:number) => (
                    <View
                      key={index}
                      style={[
                        styles.horoscopeCard,
                        {
                          backgroundColor: colors.card,
                          shadowColor: colors.cardShadow,
                        },
                      ]}
                    >
                      <View style={styles.horoscopeHeader}>
                        <Star
                          size={24}
                          color={colors.warning}
                          fill={colors.warning}
                        />
                        <Text
                          style={[styles.horoscopeSign, { color: colors.text }]}
                        >
                          {horoscope?.name}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.horoscopePrediction,
                          { color: colors.secondaryText },
                        ]}
                      >
                        {horoscope?.description}
                      </Text>
                      <View
                        style={[
                          styles.luckyContainer,
                          { borderTopColor: colors.border },
                        ]}
                      >
                        <View style={styles.luckyItem}>
                          <Text
                            style={[
                              styles.luckyLabel,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Color
                          </Text>
                          <Text
                            style={[styles.luckyValue, { color: colors.text }]}
                          >
                            {horoscope?.color}
                          </Text>
                        </View>
                        <View style={styles.luckyItem}>
                          <Text
                            style={[
                              styles.luckyLabel,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Number
                          </Text>
                          <Text
                            style={[styles.luckyValue, { color: colors.text }]}
                          >
                            {horoscope?.number}
                          </Text>
                        </View>
                        <View style={styles.luckyItem}>
                          <Text
                            style={[
                              styles.luckyLabel,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Direction
                          </Text>
                          <Text
                            style={[styles.luckyValue, { color: colors.text }]}
                          >
                            {horoscope?.direction}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )))}
                </ScrollView>
              </View>

              {/* Jyotish Experts */}
<Experts defaultCategory='Jyotish Expert' />
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
                        <Brain size={24} color={colors.primary} />
                        <Text
                          style={[styles.modalTitle, { color: colors.text }]}
                        >
                          AI Jyotish Reading
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => setShowAIModal(false)}>
                        <X size={24} color={colors.secondaryText} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.aiModalContent}>
                      <View style={styles.readingTypesSection}>
                        <Text
                          style={[
                            styles.readingTypesTitle,
                            { color: colors.text },
                          ]}
                        >
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
                                {
                                  backgroundColor: colors.background,
                                  borderColor: colors.border,
                                },
                                selectedReadingType === type.id && [
                                  styles.readingTypeCardActive,
                                  {
                                    backgroundColor: colors.primary,
                                    borderColor: colors.primary,
                                  },
                                ],
                              ]}
                            >
                              {React.cloneElement(type.icon, {
                                color:
                                  selectedReadingType === type.id
                                    ? '#FFFFFF'
                                    : colors.primary,
                              })}
                              <Text
                                style={[
                                  styles.readingTypeText,
                                  { color: colors.secondaryText },
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
                      {selectedReadingType === 'kundali' && (
                        <View style={styles.promptSection}>
                          <Text
                            style={[
                              styles.promptLabel,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Full Name:
                          </Text>

                          {/* 👇 Required Inputs */}
                          <TextInput
                            placeholder="Full Name"
                            style={[
                              styles.promptInput2,
                              {
                                color: colors.text,
                                borderColor: colors.border,
                                backgroundColor: colors.background,
                              },
                            ]}
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor={colors.secondaryText}
                          />
                          <Text
                            style={[
                              styles.promptLabel,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Birth Date:
                          </Text>
                          <TextInput
                            placeholder="Birth Date (e.g., 3-12-2002)"
                            style={[
                              styles.promptInput2,
                              {
                                color: colors.text,
                                borderColor: colors.border,
                                backgroundColor: colors.background,
                              },
                            ]}
                            value={birthDate}
                            onChangeText={setBirthDate}
                            placeholderTextColor={colors.secondaryText}
                          />
                          <Text
                            style={[
                              styles.promptLabel,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Birth Time:
                          </Text>
                          <TextInput
                            placeholder="Birth Time (e.g., 10:01 AM)"
                            style={[
                              styles.promptInput2,
                              {
                                color: colors.text,
                                borderColor: colors.border,
                                backgroundColor: colors.background,
                              },
                            ]}
                            value={birthTime}
                            onChangeText={setBirthTime}
                            placeholderTextColor={colors.secondaryText}
                          />
                          <Text
                            style={[
                              styles.promptLabel,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Birth Place:
                          </Text>
                          <TextInput
                            placeholder="Birth Place (e.g., Cumilla, Bangladesh)"
                            style={[
                              styles.promptInput2,
                              {
                                color: colors.text,
                                borderColor: colors.border,
                                backgroundColor: colors.background,
                              },
                            ]}
                            value={birthPlace}
                            onChangeText={setBirthPlace}
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
                                style={[
                                  styles.errorText,
                                  { color: colors.error },
                                ]}
                              >
                                {error}
                              </Text>
                            </View>
                          )}

                          <TouchableOpacity
                            onPress={handleGenerateKundali}
                            disabled={
                              isKundliLoading ||
                              !name ||
                              !birthDate ||
                              !birthTime ||
                              !birthPlace
                            }
                            style={[
                              styles.generateButton,
                              { backgroundColor: colors.primary },
                              (isKundliLoading ||
                                !name ||
                                !birthDate ||
                                !birthTime ||
                                !birthPlace) &&
                                styles.generateButtonDisabled,
                            ]}
                          >
                            {isKundliLoading ? (
                              <>
                                <Loader size={20} color="#fff" />
                                <Text style={styles.generateButtonText}>
                                  Generating...
                                </Text>
                              </>
                            ) : (
                              <Text style={styles.generateButtonText}>
                                Generate Kundli
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}

                      {selectedReadingType === 'muhurta' && (
                        <View style={styles.promptSection}>
                          <Text
                            style={[
                              styles.promptLabel,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Enter your question or requirement:
                          </Text>

                          <TextInput
                            style={[
                              styles.promptInput,
                              {
                                borderColor: colors.border,
                                color: colors.text,
                                backgroundColor: colors.background,
                                marginBottom: 10,
                              },
                            ]}
                            value={jyotishPrompt}
                            onChangeText={setJyotishPrompt}
                            placeholder="E.g., Find an auspicious Muhurta for marriage in 2025..."
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
                                style={[
                                  styles.errorText,
                                  { color: colors.error },
                                ]}
                              >
                                {error}
                              </Text>
                            </View>
                          )}

                          <TouchableOpacity
                            onPress={handleGenerateMuhurta}
                            disabled={isMuhurtaLoading || !jyotishPrompt.trim()}
                            style={[
                              styles.generateButton,
                              { backgroundColor: colors.primary },
                              (isMuhurtaLoading || !jyotishPrompt.trim()) &&
                                styles.generateButtonDisabled,
                            ]}
                          >
                            {isMuhurtaLoading ? (
                              <>
                                <Loader size={20} color="#fff" />
                                <Text style={styles.generateButtonText}>
                                  Generating...
                                </Text>
                              </>
                            ) : (
                              <Text style={styles.generateButtonText}>
                                Generate Muhurta
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            )}

            {/* Reading Result Modal */}
            {showReadingModal && kundliReading && (
              <Modal
                visible={showReadingModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowReadingModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View
                    style={[
                      styles.recipeModal,
                      { backgroundColor: colors.card },
                    ]}
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
                        AI Generated{' '}
                        {selectedReadingType === 'kundali'
                          ? 'Kundli'
                          : 'Muhurta'}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowReadingModal(false)}
                      >
                        <X size={24} color="#718096" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView>
                      <AiOutputParser content={kundliReading} />
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
                  <View
                    style={[
                      styles.expertModal,
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
                        Book Consultation
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowExpertModal(false)}
                      >
                        <X size={24} color={colors.secondaryText} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.expertModalContent}>
                      <View style={styles.expertDetails}>
                        <Image
                          source={{ uri: selectedExpert.image }}
                          style={styles.expertModalImage}
                        />
                        <View style={styles.expertModalInfo}>
                          <Text
                            style={[
                              styles.expertModalName,
                              { color: colors.text },
                            ]}
                          >
                            {selectedExpert.name}
                          </Text>
                          <Text
                            style={[
                              styles.expertModalSpeciality,
                              { color: colors.primary },
                            ]}
                          >
                            {selectedExpert.speciality}
                          </Text>
                          <View style={styles.expertModalMeta}>
                            <View style={styles.ratingContainer}>
                              <Star
                                size={16}
                                color={colors.warning}
                                fill={colors.warning}
                              />
                              <Text
                                style={[
                                  styles.ratingText,
                                  { color: colors.text },
                                ]}
                              >
                                {selectedExpert.rating}
                              </Text>
                            </View>
                            <Text
                              style={[
                                styles.expertModalPrice,
                                { color: colors.success },
                              ]}
                            >
                              ৳{selectedExpert.price}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.bookingInfo,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <View style={styles.bookingItem}>
                          <Calendar size={20} color={colors.primary} />
                          <Text
                            style={[
                              styles.bookingText,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Next Available: {selectedExpert.nextAvailable}
                          </Text>
                        </View>
                        <View style={styles.bookingItem}>
                          <Clock size={20} color={colors.primary} />
                          <Text
                            style={[
                              styles.bookingText,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Duration: 45 minutes
                          </Text>
                        </View>
                        <View style={styles.bookingItem}>
                          <Phone size={20} color={colors.primary} />
                          <Text
                            style={[
                              styles.bookingText,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Video/Phone Consultation
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.bookButton,
                          { backgroundColor: colors.primary },
                        ]}
                        onPress={() => {
                          triggerHaptic();
                          alert(
                            `Booking confirmed with ${selectedExpert.name}!`
                          );
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
    backgroundColor: '#FFFFFF', // ADD THIS LINE
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10, // ADD THIS LINE
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
  promptInput2: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2D3748',
    minHeight: 20,
    textAlignVertical: 'top',
    marginBottom: 10,
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
});
