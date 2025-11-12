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
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  Search,
  Mic,
  CircleStop as StopCircle,
  Brain,
  Clock,
  Star,
  ChevronRight,
  X,
  CircleCheck as CheckCircle,
  TriangleAlert as AlertTriangle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  useBookConsultationMutation,
  useGetAllConsultancyServicesQuery,
} from '@/redux/features/Consultancy/consultancyApi';
import { TConsultancyService } from '@/types';
import { useGetAllCategoriesQuery } from '@/redux/features/Categories/categoriesApi';
import NoData from '@/components/Reusable/NoData/NoData';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import { useThemeColors } from '@/hooks/useThemeColors';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import AppHeader from '@/components/Reusable/AppHeader/AppHeader';
import Categories from '@/components/Reusable/Categories/Categories';
import BookingModal from '@/components/ConsultancyPage/BookingModal';
import SuccessModal from '@/components/ConsultancyPage/SuccessModal';
import DoctorList from '@/components/ConsultancyPage/DoctorList';

const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export default function ConsultancyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const {
    data,
    isFetching,
    isLoading,
    refetch: refetchConsultancy,
  } = useGetAllConsultancyServicesQuery({
    category: selectedCategory,
    keyword: searchQuery,
  });
  const {
    data: categoryData,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useGetAllCategoriesQuery({});
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetchCategories(), refetchConsultancy()]);
    } catch (error) {
      console.error('Error while refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredCategory = categoryData?.data?.filter(
    (category: any) => category.areaName === 'consultancyService'
  );

  const allCategories = filteredCategory?.map(
    (category: any) => category.category
  );
  const [
    bookConsultation,
    {
      isLoading: isBooking,
      isSuccess: bookingSuccess,
      isError: bookingIsError,
      error: bookingErrorDetails,
    },
  ] = useBookConsultationMutation();
  const [isListening, setIsListening] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] =
    useState<TConsultancyService | null>(null);
  const [consultationIssue, setConsultationIssue] = useState('');
  const [patientName, setPatientName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const colors = useThemeColors();
  useEffect(() => {
    if (bookingSuccess) {
      setShowBookingModal(false);
      setShowSuccessModal(true);
      setPatientName('');
      setConsultationIssue('');
      setError(null);
    }
    if (bookingIsError) {
      const errorMessage =
        (bookingErrorDetails as any)?.data?.message ||
        'Failed to book consultation. Please try again.';
      setError(errorMessage);
      Alert.alert('Booking Error', errorMessage);
    }
  }, [bookingSuccess, bookingIsError, bookingErrorDetails]);

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

  const handleBookConsultation = async () => {
    triggerHaptic();

    if (!consultationIssue.trim()) {
      setError(
        'Please fill in all required fields (Name, Health Concern, Preferred Time).'
      );
      return;
    }

    if (!selectedDoctor) {
      setError('No consultant selected. Please select a consultant.');
      return;
    }

    setError(null);

    try {
      const bookingData = {
        consultantId: selectedDoctor._id,
        concern: consultationIssue,
        fees: selectedDoctor.fees,
        category: selectedDoctor.specialty,
      };
      await bookConsultation(bookingData).unwrap();
      console.log("booking sucess full")
    } catch (err) {
      console.log('Failed to initiate booking:', err);
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
        <AppHeader title="Consultancy Services" />
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
              style={[styles.content, { backgroundColor: colors.background }]}
              showsVerticalScrollIndicator={false}
            >
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
                      placeholder="Search doctors, specialities..."
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
                  {/* <TouchableOpacity
                  onPress={() => {
                    triggerHaptic();
                    setShowAIModal(true);
                  }}
                  style={[styles.aiButton, { backgroundColor: colors.primary }]}
                >
                  <Brain size={20} color="#FFFFFF" />
                  <Text style={styles.aiButtonText}>AI Assistant</Text>
                </TouchableOpacity> */}
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
              <Categories
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                allCategories={allCategories}
                isLoading={isLoadingCategories}
                bgColor={'#DD6B20'}
              />

              {/* Doctors List */}
              <DoctorList
                data={data}
                isLoading={isLoading}
                isFetching={isFetching}
                colors={colors}
                onBookPress={(doctor) => {
                  setSelectedDoctor(doctor);
                  setShowBookingModal(true);
                }}
              />

              <BookingModal
                visible={showBookingModal}
                colors={colors}
                selectedDoctor={selectedDoctor}
                consultationIssue={consultationIssue}
                setConsultationIssue={setConsultationIssue}
                error={error}
                handleBookConsultation={handleBookConsultation}
                setShowBookingModal={setShowBookingModal}
                isBooking={isBooking}
              />

              <SuccessModal
                visible={showSuccessModal}
                selectedDoctor={selectedDoctor}
                colors={colors}
                onDone={() => {
                  triggerHaptic();
                  setShowSuccessModal(false);
                }}
              />

              <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* AI Assistant Modal */}
            {/* {showAIModal && (
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
                          AI Health Assistant
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => setShowAIModal(false)}>
                        <X size={24} color={colors.secondaryText} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView>
                      <View style={styles.aiModalContent}>
                        <Text
                          style={[
                            styles.promptLabel,
                            { color: colors.secondaryText },
                          ]}
                        >
                          Describe your health concern or symptoms:
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
                          value={consultationIssue}
                          onChangeText={setConsultationIssue}
                          placeholder="E.g., I've been experiencing stress and anxiety lately..."
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
                          onPress={handleGenerateRecommendations}
                          disabled={
                            isGeneratingRecommendations ||
                            !consultationIssue.trim()
                          }
                          style={[
                            styles.generateButton,
                            { backgroundColor: colors.primary },
                            (isGeneratingRecommendations ||
                              !consultationIssue.trim()) &&
                              styles.generateButtonDisabled,
                          ]}
                        >
                          {isGeneratingRecommendations ? (
                            <>
                              <ActivityIndicator size="small" color="#FFFFFF" />
                              <Text style={styles.generateButtonText}>
                                Analyzing...
                              </Text>
                            </>
                          ) : (
                            <Text style={styles.generateButtonText}>
                              Get AI Recommendations
                            </Text>
                          )}
                        </TouchableOpacity>

                        {aiRecommendations.length > 0 && (
                          <View
                            style={[
                              styles.recommendationsContainer,
                              { backgroundColor: `${colors.success}20` },
                            ]}
                          >
                            <Text
                              style={[
                                styles.recommendationsTitle,
                                { color: colors.success },
                              ]}
                            >
                              AI Recommendations:
                            </Text>
                            {aiRecommendations.map((rec, index) => (
                              <Text
                                key={index}
                                style={[
                                  styles.recommendationText,
                                  { color: colors.success },
                                ]}
                              >
                                • {rec}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            )} */}

            {/* Payment Modal */}
            {/* {showPaymentModal && selectedDoctor && (
              <Modal
                visible={showPaymentModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPaymentModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View
                    style={[
                      styles.paymentModal,
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
                        Payment
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowPaymentModal(false)}
                      >
                        <X size={24} color={colors.secondaryText} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.paymentContent}>
                      <View
                        style={[
                          styles.paymentSummary,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Text
                          style={[
                            styles.paymentSummaryTitle,
                            { color: colors.secondaryText },
                          ]}
                        >
                          Consultation with {selectedDoctor.name}
                        </Text>
                        <Text
                          style={[
                            styles.paymentSummaryAmount,
                            { color: colors.success },
                          ]}
                        >
                          ৳{selectedDoctor.fees}
                        </Text>
                      </View>

                      {paymentError && (
                        <View
                          style={[
                            styles.errorContainer,
                            { backgroundColor: `${colors.error}20` },
                          ]}
                        >
                          <AlertTriangle size={16} color={colors.error} />
                          <Text
                            style={[styles.errorText, { color: colors.error }]}
                          >
                            {paymentError}
                          </Text>
                        </View>
                      )}

                      <TouchableOpacity
                        disabled={!selectedPaymentMethod || isProcessingPayment}
                        style={[
                          styles.payButton,
                          { backgroundColor: colors.success },
                          (!selectedPaymentMethod || isProcessingPayment) &&
                            styles.payButtonDisabled,
                        ]}
                      >
                        {isProcessingPayment ? (
                          <>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.payButtonText}>
                              Processing...
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.payButtonText}>
                            Pay ৳{selectedDoctor.fees}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            )} */}
          </View>
        </ScrollView>
      </PullToRefreshWrapper>
    </SafeAreaView>
  );
}

// The StyleSheet remains completely unchanged as requested.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
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
  doctorsContainer: {
    gap: 16,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    gap: 12,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  doctorSpeciality: {
    fontSize: 14,
    color: '#DD6B20',
    marginBottom: 4,
  },
  doctorExperience: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  doctorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  doctorPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  consultationTypes: {
    flexDirection: 'row',
    gap: 6,
  },
  typeChip: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeChipText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '500',
    textTransform: 'capitalize',
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

  StateText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
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
  bookingModal: {
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
  paymentModal: {
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
  successModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
    padding: 24,
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
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
  recommendationsContainer: {
    marginTop: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 12,
    color: '#15803D',
    marginBottom: 4,
    lineHeight: 18,
  },
  doctorSummary: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F7FAFC',
    gap: 12,
  },
  doctorSummaryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  doctorSummaryInfo: {
    flex: 1,
  },
  doctorSummaryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  doctorSummarySpeciality: {
    fontSize: 14,
    color: '#DD6B20',
    marginBottom: 4,
  },
  doctorSummaryPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  formSection: {
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2D3748',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  optionChipActive: {
    backgroundColor: '#DD6B20',
    borderColor: '#DD6B20',
  },
  optionChipText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  optionChipTextActive: {
    color: '#FFFFFF',
  },
  urgencyChip: {
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  urgencyChipText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  urgencyChipTextActive: {
    color: '#FFFFFF',
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DD6B20',
    borderRadius: 8,
    paddingVertical: 16,
    margin: 16,
    gap: 8,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentContent: {
    padding: 16,
  },
  paymentSummary: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  paymentSummaryTitle: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
    textAlign: 'center',
  },
  paymentSummaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  paymentMethodsSection: {
    marginBottom: 20,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  paymentMethodCardActive: {
    backgroundColor: '#EBF8FF',
    borderColor: '#DD6B20',
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  successButtonText: {
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
