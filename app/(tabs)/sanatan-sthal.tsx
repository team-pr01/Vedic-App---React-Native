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
  Send
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

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

const MOCK_SANATAN_STHAL_ITEMS: SanatanSthalItem[] = [
  {
    id: '1',
    name: 'Jagannath Temple',
    type: 'temple',
    location: 'Puri, Odisha',
    description: 'One of the Char Dham pilgrimage sites, famous for the annual Rath Yatra festival.',
    image: 'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.9,
    contactName: 'Pandit Ramesh Sharma',
    phone: '+91 98765 43210',
    email: 'info@jagannathtemplepuri.org',
    established: '12th Century',
    specialties: ['Rath Yatra', 'Daily Aarti', 'Prasadam']
  },
  {
    id: '2',
    name: 'Vedic Gurukul Ashram',
    type: 'gurukul',
    location: 'Haridwar, Uttarakhand',
    description: 'Traditional Vedic education center teaching Sanskrit, Yoga, and ancient scriptures.',
    image: 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    contactName: 'Acharya Vishnu Das',
    phone: '+91 98765 43211',
    email: 'admission@vedicgurukul.org',
    established: '1995',
    specialties: ['Sanskrit Studies', 'Yoga Teacher Training', 'Vedic Mathematics']
  },
  {
    id: '3',
    name: 'Sanatan Dharma Foundation',
    type: 'org',
    location: 'Mumbai, Maharashtra',
    description: 'Non-profit organization promoting Vedic culture and supporting temple communities.',
    image: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.6,
    contactName: 'Dr. Priya Agarwal',
    phone: '+91 98765 43212',
    email: 'contact@sanatanfoundation.org',
    established: '2010',
    specialties: ['Cultural Events', 'Educational Programs', 'Community Support']
  },
  {
    id: '4',
    name: 'Kedarnath Temple',
    type: 'temple',
    location: 'Kedarnath, Uttarakhand',
    description: 'Sacred Jyotirlinga temple located in the Himalayas, one of the holiest Shiva temples.',
    image: 'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    contactName: 'Pandit Mohan Tiwari',
    phone: '+91 98765 43213',
    established: '8th Century',
    specialties: ['Jyotirlinga Darshan', 'Rudrabhishek', 'Char Dham Yatra']
  },
  {
    id: '5',
    name: 'Arya Samaj Gurukul',
    type: 'gurukul',
    location: 'Kurukshetra, Haryana',
    description: 'Modern Gurukul following Arya Samaj principles with focus on Vedic education.',
    image: 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.5,
    contactName: 'Swami Dayanand Saraswati',
    phone: '+91 98765 43214',
    email: 'info@aryasamajgurukul.org',
    established: '1980',
    specialties: ['Vedic Studies', 'Modern Education', 'Character Building']
  },
  {
    id: '6',
    name: 'Bharat Seva Sangh',
    type: 'org',
    location: 'Delhi, India',
    description: 'Cultural organization dedicated to preserving and promoting Indian heritage.',
    image: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.4,
    contactName: 'Shri Rajesh Kumar',
    phone: '+91 98765 43215',
    email: 'info@bharatsevasangh.org',
    established: '1985',
    specialties: ['Heritage Preservation', 'Youth Programs', 'Cultural Festivals']
  }
];

export default function SanatanSthalPage() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<SanatanSthalItem[]>(MOCK_SANATAN_STHAL_ITEMS);
  const [isListening, setIsListening] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SanatanSthalItem | null>(null);
  const [messageText, setMessageText] = useState('');
  const recognitionRef = useRef<any>(null);

  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    type: 'temple' as 'temple' | 'gurukul' | 'org',
    location: '',
    description: '',
    contactName: '',
    phone: '',
    email: ''
  });

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

  // Filter items based on search
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredItems(
      MOCK_SANATAN_STHAL_ITEMS.filter(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.location.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.type.toLowerCase().includes(lowerQuery) ||
        item.contactName.toLowerCase().includes(lowerQuery)
      )
    );
  }, [searchQuery]);

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

  const handleItemPress = (item: SanatanSthalItem) => {
    triggerHaptic();
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleMessagePress = () => {
    triggerHaptic();
    setShowDetailsModal(false);
    setShowMessageModal(true);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedItem) return;
    
    triggerHaptic();
    console.log(`Message sent to ${selectedItem.contactName}: ${messageText}`);
    alert(`Message sent to ${selectedItem.contactName}!`);
    setMessageText('');
    setShowMessageModal(false);
  };

  const handleRegistration = () => {
    if (!registrationForm.name || !registrationForm.location || !registrationForm.contactName) {
      alert('Please fill in all required fields');
      return;
    }

    triggerHaptic();
    console.log('Registration submitted:', registrationForm);
    alert(`${registrationForm.type.charAt(0).toUpperCase() + registrationForm.type.slice(1)} "${registrationForm.name}" registered successfully!`);
    
    // Reset form
    setRegistrationForm({
      name: '',
      type: 'temple',
      location: '',
      description: '',
      contactName: '',
      phone: '',
      email: ''
    });
    setShowRegistrationModal(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'temple':
        return <Temple size={20} color="#FF6F00" />;
      case 'gurukul':
        return <School size={20} color="#10B981" />;
      case 'org':
        return <Building size={20} color="#3B82F6" />;
      default:
        return <Building size={20} color="#718096" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'temple':
        return '#FF6F00';
      case 'gurukul':
        return '#10B981';
      case 'org':
        return '#3B82F6';
      default:
        return '#718096';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <LinearGradient colors={['#00BCD4', '#00ACC1']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.background, shadowColor: colors.cardShadow }]}>
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
                isListening && styles.voiceButtonActive
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
              <Text style={[styles.listeningText, { color: colors.secondaryText }]}>Listening...</Text>
            </View>
          )}
        </View>

        {/* Items List */}
        <View style={styles.itemsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sacred Places & Organizations</Text>
          <Text style={[styles.resultsCount, { color: colors.secondaryText }]}>
            {filteredItems.length} place{filteredItems.length !== 1 ? 's' : ''} found
          </Text>

          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleRow}>
                    {getTypeIcon(item.type)}
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{item.name}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
                  </View>
                </View>

                <View style={styles.locationContainer}>
                  <MapPin size={14} color={colors.secondaryText} />
                  <Text style={[styles.locationText, { color: colors.secondaryText }]}>{item.location}</Text>
                </View>

                <Text style={[styles.itemDescription, { color: colors.secondaryText }]}>{item.description}</Text>

                <View style={styles.itemFooter}>
                  <Text style={[styles.contactName, { color: colors.secondaryText }]}>Contact: {item.contactName}</Text>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: getTypeColor(item.type) }
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredItems.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No places found</Text>
              <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
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
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Register New Place</Text>
              <TouchableOpacity onPress={() => setShowRegistrationModal(false)}>
                <X size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Name *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={registrationForm.name}
                  onChangeText={(text) => setRegistrationForm({...registrationForm, name: text})}
                  placeholder="Enter name"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Type *</Text>
                <View style={styles.typeSelector}>
                  {['temple', 'gurukul', 'org'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        [styles.typeOption, { backgroundColor: colors.background, borderColor: colors.border }],
                        registrationForm.type === type && styles.typeOptionSelected
                      ]}
                      onPress={() => setRegistrationForm({...registrationForm, type: type as any})}
                    >
                      <Text style={[
                        [styles.typeOptionText, { color: colors.secondaryText }],
                        registrationForm.type === type && styles.typeOptionTextSelected
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Location *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={registrationForm.location}
                  onChangeText={(text) => setRegistrationForm({...registrationForm, location: text})}
                  placeholder="City, State"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={registrationForm.description}
                  onChangeText={(text) => setRegistrationForm({...registrationForm, description: text})}
                  placeholder="Brief description"
                  placeholderTextColor={colors.secondaryText}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Contact Name *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={registrationForm.contactName}
                  onChangeText={(text) => setRegistrationForm({...registrationForm, contactName: text})}
                  placeholder="Contact person name"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Phone</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={registrationForm.phone}
                  onChangeText={(text) => setRegistrationForm({...registrationForm, phone: text})}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Email</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={registrationForm.email}
                  onChangeText={(text) => setRegistrationForm({...registrationForm, email: text})}
                  placeholder="contact@example.org"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.info }]} onPress={handleRegistration}>
                <Text style={styles.submitButtonText}>Register</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        {selectedItem && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modal, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedItem.name}</Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                  <X size={24} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <Image source={{ uri: selectedItem.image }} style={styles.detailImage} />
                
                <View style={styles.detailContent}>
                  <View style={styles.detailHeader}>
                    {getTypeIcon(selectedItem.type)}
                    <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedItem.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Star size={16} color="#F59E0B" fill="#F59E0B" />
                      <Text style={[styles.ratingText, { color: colors.text }]}>{selectedItem.rating}</Text>
                    </View>
                  </View>

                  <View style={styles.locationContainer}>
                    <MapPin size={16} color={colors.secondaryText} />
                    <Text style={[styles.locationText, { color: colors.secondaryText }]}>{selectedItem.location}</Text>
                  </View>

                  <Text style={[styles.detailDescription, { color: colors.secondaryText }]}>{selectedItem.description}</Text>

                  {selectedItem.established && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.text }]}>Established:</Text>
                      <Text style={[styles.detailValue, { color: colors.secondaryText }]}>{selectedItem.established}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text }]}>Contact:</Text>
                    <Text style={[styles.detailValue, { color: colors.secondaryText }]}>{selectedItem.contactName}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.text }]}>Phone:</Text>
                    <Text style={[styles.detailValue, { color: colors.secondaryText }]}>{selectedItem.phone}</Text>
                  </View>

                  {selectedItem.email && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.text }]}>Email:</Text>
                      <Text style={[styles.detailValue, { color: colors.secondaryText }]}>{selectedItem.email}</Text>
                    </View>
                  )}

                  {selectedItem.specialties && (
                    <View style={styles.specialtiesContainer}>
                      <Text style={[styles.detailLabel, { color: colors.text }]}>Specialties:</Text>
                      <View style={styles.specialtiesList}>
                        {selectedItem.specialties.map((specialty, index) => (
                          <View key={index} style={[styles.specialtyTag, { backgroundColor: colors.info + '20' }]}>
                            <Text style={[styles.specialtyText, { color: colors.info }]}>{specialty}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.callButton}>
                      <Phone size={16} color="#FFFFFF" />
                      <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageButton} onPress={handleMessagePress}>
                      <MessageCircle size={16} color="#FFFFFF" />
                      <Text style={styles.messageButtonText}>Message</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      {/* Message Modal */}
      <Modal
        visible={showMessageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMessageModal(false)}
      >
        {selectedItem && (
          <View style={styles.modalOverlay}>
            <View style={[styles.messageModal, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Message {selectedItem.contactName}</Text>
                <TouchableOpacity onPress={() => setShowMessageModal(false)}>
                  <X size={24} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>

              <View style={styles.messageContent}>
                <TextInput
                  style={[styles.messageInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={messageText}
                  onChangeText={setMessageText}
                  placeholder="Type your message here..."
                  placeholderTextColor={colors.secondaryText}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />

                <TouchableOpacity 
                  style={[
                    [styles.sendButton, { backgroundColor: colors.info }],
                    !messageText.trim() && styles.sendButtonDisabled
                  ]}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <Send size={16} color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>Send Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
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
    bottom: 100,
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
    height: 120,
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
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
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
  modalContent: {
    flex: 1,
    padding: 16,
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
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});