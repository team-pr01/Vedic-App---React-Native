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
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Mic,
  CircleStop as StopCircle,
  Plus,
  ArrowLeft,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Building,
  School,
  Church as Temple,
  X,
  Send,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllTempleQuery } from '@/redux/features/Temple/templeApi';
import AddTempleForm from '@/components/TemplePage/AddTempleForm/AddTempleForm';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';

interface SanatanSthalItem {
  id: string;
  name: string;
  type: 'temple' | 'gurukul' | 'org';
  location: string;
  description: string;
  image: string;
  rating: number;
  contactName: string;
  phone: string;
  email?: string;
  website?: string;
  established?: string;
  specialties?: string[];
}

export type TTemple = {
  _id: string;
  name: string;
  mainDeity: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  establishedYear: number;
  visitingHours: string;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  imageUrl: string;
  videoUrl?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
};

export default function SanatanSthalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, refetch } = useGetAllTempleQuery({
    keyword: searchQuery,
  });
  const approvedTemples =data?.data?.filter( (item: TTemple) => item.status=== 'approved') || [];
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetch()]);
    } catch (error) {
      console.error('Error while refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };
  const colors = useThemeColors();
  const [isListening, setIsListening] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const recognitionRef = useRef<any>(null);

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
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* Header */}
          <SafeAreaView edges={['top']} style={styles.headerContainer}>
            <LinearGradient
              colors={['#00BCD4', '#00ACC1']}
              style={styles.header}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Sanatan Sthal</Text>
                <Text style={styles.headerSubtitle}>সনাতন স্থল</Text>
              </View>
              <View style={styles.headerPlaceholder} />
            </LinearGradient>
          </SafeAreaView>

          {/* Floating Add Button */}
          <TouchableOpacity
            style={[styles.floatingButton, { backgroundColor: colors.info }]}
            onPress={() => {
              triggerHaptic();
              setShowRegistrationModal(true);
            }}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
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
                <Search size={20} color={colors.secondaryText} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search temples, gurukuls, organizations..."
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
                    <StopCircle size={18} color="#EF4444" />
                  ) : (
                    <Mic size={18} color={colors.info} />
                  )}
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

            {/* Items List */}
            <View style={styles.itemsContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Sacred Places & Organizations
              </Text>
              <Text
                style={[styles.resultsCount, { color: colors.secondaryText }]}
              >
                {approvedTemples?.length} place{approvedTemples?.length !== 1 ? 's' : ''}{' '}
                found
              </Text>

              {/* All temples */}
              {approvedTemples?.map((item: TTemple) => (
                <TouchableOpacity
                  key={item?._id}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.cardShadow,
                    },
                  ]}
                  // onPress={() => handleItemPress(item)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemTitleRow}>
                        {/* {getTypeIcon(item.type)} */}
                        <Text
                          style={[styles.itemTitle, { color: colors.text }]}
                        >
                          {item?.name}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.locationContainer}>
                      <MapPin size={14} color={colors.secondaryText} />
                      <Text
                        style={[
                          styles.locationText,
                          { color: colors.secondaryText },
                        ]}
                      >
                        {item?.city}, {item?.country}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.itemDescription,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {item.description}
                    </Text>

                    <View style={styles.itemFooter}>
                      <View
                        style={[
                          styles.typeBadge,
                          // { backgroundColor: getTypeColor(item.type) },
                        ]}
                      >
                        <Text style={styles.typeBadgeText}>
                          Deity : {item?.mainDeity}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {approvedTemples?.length === 0 && (
                <View style={styles.emptyState}>
                  <Text
                    style={[styles.emptyStateTitle, { color: colors.text }]}
                  >
                    No places found
                  </Text>
                  <Text
                    style={[
                      styles.emptyStateText,
                      { color: colors.secondaryText },
                    ]}
                  >
                    Try adjusting your search criteria or add a new place
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Registration Modal */}
          <Modal
            visible={showRegistrationModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowRegistrationModal(false)}
          >
            <AddTempleForm
              setShowRegistrationModal={setShowRegistrationModal}
            />
          </Modal>
        </View>
      </ScrollView>
    </PullToRefreshWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  headerContainer: {
    backgroundColor: '#00BCD4',
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
    color: '#E0F7FA',
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 32,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  itemsContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  itemContent: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#718096',
  },
  itemDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 12,
    color: '#718096',
    flex: 1,
  },
  typeBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  typeBadgeText: {
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
    color: '#2D3748',
    marginBottom: 8,
  },
  emptyStateText: {
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
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  messageModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    height: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  detailImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailContent: {
    gap: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
  },
  detailDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#4A5568',
    flex: 1,
  },
  specialtiesContainer: {
    gap: 8,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#00695C',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messageContent: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2D3748',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
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
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeOptionSelected: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
  },
  typeOptionTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#00BCD4',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
