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
  ArrowLeft, 
  X, 
  Send, 
  Trash2, 
  User, 
  Clock, 
  ExternalLink, 
  Loader, 
  Filter as FilterIcon,
  Circle as Decline, 
  CircleCheck as Accept,
  Building,
  School,
  Church as Temple,
  MapPin,
  Star
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

// Mock data for AKF Hub
const MOCK_COMMUNITY_USERS = [
  { id: 'user1', name: 'Ramesh Sharma', type: 'user', avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100', description: 'Temple Priest' },
  { id: 'user2', name: 'Vishnu Das', type: 'user', avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100', description: 'Vedic Scholar' },
  { id: 'user3', name: 'Priya Agarwal', type: 'user', avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100', description: 'Cultural Activist' },
  { id: 'org1', name: 'Vedic Heritage Foundation', type: 'organization', avatarUrl: 'https://images.pexels.com/photos/1579548/pexels-photo-1579548.jpeg?auto=compress&cs=tinysrgb&w=100', description: 'Cultural Organization' },
  { id: 'temple1', name: 'Sacred Temple Trust', type: 'temple', avatarUrl: 'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=100', description: 'Temple Management' },
  { id: 'gurukul1', name: 'Ananda Vedic Gurukul', type: 'gurukul', avatarUrl: 'https://images.pexels.com/photos/1542649/pexels-photo-1542649.jpeg?auto=compress&cs=tinysrgb&w=100', description: 'Traditional Education' }
];

const MOCK_CONTACTED_PROFILES = [
  { id: 'user1', name: 'Ramesh Sharma', type: 'user', avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100', description: 'Temple Priest' },
  { id: 'user2', name: 'Vishnu Das', type: 'user', avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100', description: 'Vedic Scholar' }
];

const MOCK_CHAT_HISTORY = {
  'user1': [
    { role: 'user', content: 'Namaste, I would like to know about temple timings', timestamp: Date.now() - 3600000 },
    { role: 'assistant', content: 'Namaste! Temple is open from 5 AM to 9 PM daily. Morning aarti at 6 AM and evening aarti at 7 PM.', timestamp: Date.now() - 3500000 }
  ],
  'user2': [
    { role: 'user', content: 'Can you tell me about Sanskrit courses?', timestamp: Date.now() - 7200000 },
    { role: 'assistant', content: 'We offer beginner to advanced Sanskrit courses. Next batch starts on 1st of next month.', timestamp: Date.now() - 7100000 }
  ]
};

const WEBSITE_URL = "https://www.akfbd.org";

export default function AkfPage() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [contactedProfiles, setContactedProfiles] = useState(MOCK_CONTACTED_PROFILES);
  const [chatHistory, setChatHistory] = useState(MOCK_CHAT_HISTORY);
  const [incomingRequests, setIncomingRequests] = useState([
    { id: 'new_user_1', name: 'Aisha Khan', type: 'user', avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100', description: 'Wants to connect about scriptures.' },
    { id: 'new_org_1', name: 'Vedic Heritage Foundation', type: 'organization', avatarUrl: 'https://images.pexels.com/photos/1579548/pexels-photo-1579548.jpeg?auto=compress&cs=tinysrgb&w=100', description: 'Collaboration inquiry.' }
  ]);
  const [sentRequests, setSentRequests] = useState([]);
  const [requestStatusMessage, setRequestStatusMessage] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [activeChatMessages, setActiveChatMessages] = useState([]);
  const [messageTimers, setMessageTimers] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showWebsiteConfirmDialog, setShowWebsiteConfirmDialog] = useState(false);
  const [showInAppBrowser, setShowInAppBrowser] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(messageTimers).forEach(clearTimeout);
    };
  }, [messageTimers]);

  useEffect(() => {
    if (selectedProfile && activeChatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatMessages, selectedProfile]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          handleSearch(transcript, activeFilters);
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
  }, [activeFilters]);

  const handleSearch = async (query, filters = activeFilters) => {
    setSearchQuery(query);
    setActiveFilters(filters);

    if (!query.trim() && filters.length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const lowerQuery = query.toLowerCase();
    let results = [];

    const applyCategoryFilter = (itemCategory) => {
      return filters.length === 0 || filters.includes(itemCategory);
    };

    MOCK_COMMUNITY_USERS.forEach(entity => {
      const matchesQuery = !lowerQuery ||
                           entity.name.toLowerCase().includes(lowerQuery) ||
                           (entity.description && entity.description.toLowerCase().includes(lowerQuery)) ||
                           entity.id.toLowerCase().includes(lowerQuery);

      const matchesFilters = applyCategoryFilter(entity.type);

      if (matchesQuery && matchesFilters) {
        const isContacted = contactedProfiles.some(cp => cp.id === entity.id);
        const isIncoming = incomingRequests.some(ir => ir.id === entity.id);
        if (!isContacted && !isIncoming) {
          results.push(entity);
        }
      }
    });

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleVoiceSearchToggle = () => {
    triggerHaptic();
    if (!recognitionRef.current) {
      alert('Voice search is not supported by your browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setIsListening(false);
        alert("Could not start voice search. Please check microphone permissions.");
      }
    }
  };

  const handleSendMessageRequest = (entity) => {
    if (sentRequests.includes(entity.id)) return;

    setSentRequests(prev => [...prev, entity.id]);
    setRequestStatusMessage(`Message request sent to ${entity.name}.`);
    setTimeout(() => setRequestStatusMessage(null), 3000);
  };

  const handleAcceptRequest = (entityId) => {
    const requestToAccept = incomingRequests.find(r => r.id === entityId);
    if (requestToAccept) {
      setContactedProfiles(prev => [requestToAccept, ...prev.filter(p => p.id !== entityId)]);
      setIncomingRequests(prev => prev.filter(r => r.id !== entityId));
      setChatHistory(prevChatHistory => {
        const newChatHistory = { ...prevChatHistory };
        newChatHistory[entityId] = [{ role: 'assistant', content: `You accepted the message request from ${requestToAccept.name}. You can now chat.`, timestamp: Date.now() }];
        return newChatHistory;
      });
    }
  };

  const handleDeclineRequest = (entityId) => {
    setIncomingRequests(prev => prev.filter(r => r.id !== entityId));
  };

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    const history = chatHistory[profile.id] || [];
    const currentDisplayableMessages = history.filter(msg => msg.content !== "Message has been automatically cleared.");
    const messagesWithTimestamp = currentDisplayableMessages.map(msg => ({...msg, timestamp: msg.timestamp || Date.now()}));

    setActiveChatMessages(messagesWithTimestamp.length > 0 ? messagesWithTimestamp : [{ role: 'assistant', content: `You can start typing to chat with ${profile.name}.`, timestamp: Date.now() }]);

    if (messageTimers[profile.id]) clearTimeout(messageTimers[profile.id]);

    const timerId = setTimeout(() => {
      setActiveChatMessages([{ role: 'assistant', content: "Message has been automatically cleared.", timestamp: Date.now() }]);
      setChatHistory(prevChatHistory => {
        const newChatHistory = { ...prevChatHistory };
        newChatHistory[profile.id] = [{ role: 'assistant', content: "Message has been automatically cleared.", timestamp: Date.now() }];
        return newChatHistory;
      });
    }, 60000);
    setMessageTimers(prev => ({ ...prev, [profile.id]: timerId }));
  };

  const resetAutoClearTimer = (profileId) => {
    if (messageTimers[profileId]) {
      clearTimeout(messageTimers[profileId]);
    }
    const newTimerId = setTimeout(() => {
      setActiveChatMessages([{ role: 'assistant', content: "Message has been automatically cleared.", timestamp: Date.now() }]);
      setChatHistory(prevChatHistory => {
        const newChatHistory = { ...prevChatHistory };
        newChatHistory[profileId] = [{ role: 'assistant', content: "Message has been automatically cleared.", timestamp: Date.now() }];
        return newChatHistory;
      });
    }, 60000);
    setMessageTimers(prev => ({ ...prev, [profileId]: newTimerId }));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedProfile || isSending) return;

    setIsSending(true);
    const userMessage = { role: 'user', content: newMessage, timestamp: Date.now() };

    setActiveChatMessages(prev => {
      const isPlaceholder = prev.length === 1 && prev[0].content.startsWith('You can start typing to chat with');
      return isPlaceholder ? [userMessage] : [...prev, userMessage];
    });

    setChatHistory(prevChatHistory => {
      const currentProfileId = selectedProfile.id;
      const newChatHistory = { ...prevChatHistory };
      const existingMessages = newChatHistory[currentProfileId] || [];

      const filteredMessages = existingMessages.filter(
        m => m.content !== "Message has been automatically cleared." &&
             !m.content.startsWith('You can start typing to chat with')
      );
      const updatedMessagesForProfile = [...filteredMessages, userMessage];
      newChatHistory[currentProfileId] = updatedMessagesForProfile;
      return newChatHistory;
    });

    const currentMessageText = newMessage;
    setNewMessage('');

    resetAutoClearTimer(selectedProfile.id);

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    const assistantReply = {
      role: 'assistant',
      content: `I received your message: "${currentMessageText}". This is an automated AKF Hub reply.`,
      timestamp: Date.now()
    };
    setActiveChatMessages(prev => [...prev, assistantReply]);

    setChatHistory(prevChatHistory => {
      const currentProfileId = selectedProfile.id;
      const newChatHistory = { ...prevChatHistory };
      const existingMessages = newChatHistory[currentProfileId] || [];
      const filteredMessages = existingMessages.filter(m => m.content !== "Message has been automatically cleared.");
      const updatedMessagesForProfile = [...filteredMessages, assistantReply];
      newChatHistory[currentProfileId] = updatedMessagesForProfile;
      return newChatHistory;
    });

    resetAutoClearTimer(selectedProfile.id);
    setIsSending(false);
  };

  const handleDeleteProfile = (profileId) => {
    const profileName = contactedProfiles.find(p => p.id === profileId)?.name || 'this user';
    if (confirm(`Are you sure you want to delete the chat with ${profileName}? This action cannot be undone.`)) {
      setContactedProfiles(prev => prev.filter(p => p.id !== profileId));
      setChatHistory(currentChatHistory => {
        const newHistory = { ...currentChatHistory };
        delete newHistory[profileId];
        return newHistory;
      });
      if (selectedProfile?.id === profileId) {
        setSelectedProfile(null);
        setActiveChatMessages([]);
      }
      if (messageTimers[profileId]) {
        clearTimeout(messageTimers[profileId]);
        setMessageTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[profileId];
          return newTimers;
        });
      }
    }
  };

  const closeChatView = () => {
    if (selectedProfile && messageTimers[selectedProfile.id]) {
      clearTimeout(messageTimers[selectedProfile.id]);
      setMessageTimers(prev => {
        const newTimers = { ...prev };
        if (selectedProfile) delete newTimers[selectedProfile.id];
        return newTimers;
      });
    }
    setSelectedProfile(null);
    setActiveChatMessages([]);
  };

  const getIconForEntityType = (type) => {
    const iconClassName = 'w-6 h-6 text-gray-500';
    switch(type) {
      case 'user': return <User size={24} color="#718096" />;
      case 'organization': return <Building size={24} color="#718096" />;
      case 'temple': return <Temple size={24} color="#718096" />;
      case 'gurukul': return <School size={24} color="#718096" />;
      default: return <User size={24} color="#718096" />;
    }
  };

  const handleVisitWebsiteConfirm = () => {
    setShowWebsiteConfirmDialog(false);
    setShowInAppBrowser(true);
  };

  const renderContent = () => {
    if (showInAppBrowser) {
      return (
        <View style={styles.browserContainer}>
          <View style={styles.browserHeader}>
            <Text style={styles.browserTitle}>Viewing AKFBD.ORG</Text>
            <TouchableOpacity onPress={() => setShowInAppBrowser(false)}>
              <X size={24} color="#718096" />
            </TouchableOpacity>
          </View>
          <Text style={styles.browserPlaceholder}>Website content would load here</Text>
        </View>
      );
    }

    if (selectedProfile) {
      return (
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              {selectedProfile.avatarUrl ? (
                <Image source={{ uri: selectedProfile.avatarUrl }} style={styles.chatAvatar} />
              ) : (
                <View style={styles.chatAvatarPlaceholder}>
                  <Text style={styles.chatAvatarText}>{selectedProfile.name.charAt(0)}</Text>
                </View>
              )}
              <Text style={styles.chatHeaderName}>{selectedProfile.name}</Text>
            </View>
            <TouchableOpacity onPress={closeChatView}>
              <X size={24} color="#718096" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatMessages}>
            {activeChatMessages.map((msg, index) => (
              <View key={index} style={[styles.messageContainer, msg.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
                <Text style={[styles.messageText, msg.role === 'user' ? styles.userMessageText : styles.assistantMessageText]}>
                  {msg.content}
                </Text>
              </View>
            ))}
            <View ref={chatEndRef} />
          </ScrollView>

          <View style={styles.chatInput}>
            <TextInput
              style={styles.chatTextInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              multiline
              onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={isSending || !newMessage.trim()}
              style={[styles.sendButton, (!newMessage.trim() || isSending) && styles.sendButtonDisabled]}
            >
              {isSending ? <Loader size={20} color="#FFFFFF" /> : <Send size={20} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>

          <View style={styles.chatFooter}>
            <Clock size={12} color="#718096" />
            <Text style={styles.chatFooterText}>Messages are for temporary viewing and will be cleared automatically.</Text>
          </View>
        </View>
      );
    }

    const itemsToDisplay = searchQuery.trim() !== '' ? searchResults : [];
    const showDefaultSections = searchQuery.trim() === '' && activeFilters.length === 0;

    return (
      <ScrollView style={styles.content}>
        {isSearching && (
          <View style={styles.searchingContainer}>
            <Loader size={24} color="#00BCD4" />
            <Text style={styles.searchingText}>Searching...</Text>
          </View>
        )}

        {!isSearching && searchQuery.trim() !== '' && itemsToDisplay.length === 0 && (
          <Text style={styles.noResultsText}>No entities match your search.</Text>
        )}

        {!isSearching && itemsToDisplay.length > 0 && (
          <View style={styles.searchResultsContainer}>
            {itemsToDisplay.map(entity => (
              <View key={entity.id} style={styles.entityCard}>
                {entity.avatarUrl ? (
                  <Image source={{ uri: entity.avatarUrl }} style={styles.entityAvatar} />
                ) : (
                  <View style={styles.entityAvatarPlaceholder}>
                    {getIconForEntityType(entity.type)}
                  </View>
                )}
                <View style={styles.entityInfo}>
                  <Text style={styles.entityName}>{entity.name}</Text>
                  <Text style={styles.entityDescription}>{entity.description || entity.type}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleSendMessageRequest(entity)}
                  disabled={sentRequests.includes(entity.id)}
                  style={[
                    styles.requestButton,
                    sentRequests.includes(entity.id) && styles.requestButtonDisabled
                  ]}
                >
                  <Text style={[
                    styles.requestButtonText,
                    sentRequests.includes(entity.id) && styles.requestButtonTextDisabled
                  ]}>
                    {sentRequests.includes(entity.id) ? 'Request Sent' : 'Message Request'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {showDefaultSections && (
          <>
            {/* Incoming Message Requests Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Incoming Message Requests</Text>
              {incomingRequests.length > 0 ? (
                incomingRequests.map(request => (
                  <View key={request.id} style={styles.requestCard}>
                    {request.avatarUrl ? (
                      <Image source={{ uri: request.avatarUrl }} style={styles.requestAvatar} />
                    ) : (
                      <View style={styles.requestAvatarPlaceholder}>
                        <Text style={styles.requestAvatarText}>{request.name.charAt(0)}</Text>
                      </View>
                    )}
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>{request.name}</Text>
                      <Text style={styles.requestDescription}>{request.description}</Text>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity onPress={() => handleAcceptRequest(request.id)} style={styles.acceptButton}>
                        <Accept size={16} color="#10B981" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeclineRequest(request.id)} style={styles.declineButton}>
                        <Decline size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No new message requests.</Text>
              )}
            </View>

            {/* Recent Chats Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Chats</Text>
              {contactedProfiles.length > 0 ? (
                contactedProfiles.map(profile => (
                  <TouchableOpacity
                    key={profile.id}
                    style={styles.profileCard}
                    onPress={() => handleProfileClick(profile)}
                  >
                    {profile.avatarUrl ? (
                      <Image source={{ uri: profile.avatarUrl }} style={styles.profileAvatar} />
                    ) : (
                      <View style={styles.profileAvatarPlaceholder}>
                        <Text style={styles.profileAvatarText}>{profile.name.charAt(0)}</Text>
                      </View>
                    )}
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>{profile.name}</Text>
                      <Text style={styles.profileDescription}>{profile.description}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); handleDeleteProfile(profile.id); }}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>No recent chats. Accept requests or search to connect.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <LinearGradient colors={['#FF6F00', '#FF8F00']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AKF Hub & Messages</Text>
            <Text style={styles.headerSubtitle}>AKF হাব ও বার্তা</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </LinearGradient>
      </SafeAreaView>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
          <Search size={20} color="#718096" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search persons, orgs, temples..."
            value={searchQuery}
            onChangeText={(text) => handleSearch(text, activeFilters)}
            placeholderTextColor={colors.secondaryText}
          />
          <View style={styles.searchActions}>
            {searchQuery && (
              <TouchableOpacity onPress={() => handleSearch('', activeFilters)}>
                <X size={16} color={colors.secondaryText} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleVoiceSearchToggle}
              style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            >
              {isListening ? <StopCircle size={18} color="#EF4444" /> : <Mic size={18} color="#00BCD4" />}
            </TouchableOpacity>
          </View>
        </View>

        {!selectedProfile && !showInAppBrowser && (
          <TouchableOpacity
            onPress={() => setShowWebsiteConfirmDialog(true)}
            style={[styles.websiteButton, { backgroundColor: colors.info + '20' }]}
          >
            <ExternalLink size={16} color="#3B82F6" />
            <Text style={[styles.websiteButtonText, { color: colors.info }]}>Visit Our Website</Text>
          </TouchableOpacity>
        )}
      </View>

      {requestStatusMessage && (
        <View style={[styles.statusMessage, { backgroundColor: colors.success + '20' }]}>
          <Text style={[styles.statusMessageText, { color: colors.success }]}>{requestStatusMessage}</Text>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        {renderContent()}
      </View>

      {/* Website Confirmation Dialog */}
      {showWebsiteConfirmDialog && (
        <Modal transparent visible={showWebsiteConfirmDialog} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.confirmDialog, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
              <Text style={[styles.confirmTitle, { color: colors.text }]}>Confirm Navigation</Text>
              <Text style={[styles.confirmMessage, { color: colors.secondaryText }]}>Do you want to visit our website? AKFBD.ORG</Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  onPress={() => setShowWebsiteConfirmDialog(false)}
                  style={[styles.cancelButton, { backgroundColor: colors.background }]}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.secondaryText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleVisitWebsiteConfirm}
                  style={styles.visitButton}
                >
                  <Text style={styles.visitButtonText}>Visit</Text>
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
  },
  headerContainer: {
    backgroundColor: '#FF6F00',
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
    color: '#FFF7ED',
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    backdropFilter: 'blur(10px)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backdropFilter: 'blur(10px)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceButton: {
    padding: 4,
  },
  voiceButtonActive: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
    backdropFilter: 'blur(10px)',
  },
  websiteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusMessage: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backdropFilter: 'blur(10px)',
  },
  statusMessageText: {
    fontSize: 14,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  searchingText: {
    fontSize: 14,
    color: '#718096',
  },
  noResultsText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    paddingVertical: 20,
  },
  searchResultsContainer: {
    gap: 12,
  },
  entityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backdropFilter: 'blur(10px)',
  },
  entityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  entityAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  entityInfo: {
    flex: 1,
  },
  entityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  entityDescription: {
    fontSize: 12,
    color: '#718096',
    textTransform: 'capitalize',
  },
  requestButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  requestButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  requestButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requestButtonTextDisabled: {
    color: '#718096',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    paddingVertical: 20,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backdropFilter: 'blur(10px)',
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  requestAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  requestDescription: {
    fontSize: 12,
    color: '#718096',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 8,
  },
  declineButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backdropFilter: 'blur(10px)',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  profileDescription: {
    fontSize: 12,
    color: '#718096',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backdropFilter: 'blur(10px)',
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  chatAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '75%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    padding: 12,
    borderRadius: 16,
    fontSize: 14,
  },
  userMessageText: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
  },
  assistantMessageText: {
    backgroundColor: '#F7FAFC',
    color: '#2D3748',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
    backdropFilter: 'blur(10px)',
  },
  chatTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    padding: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 6,
    backdropFilter: 'blur(10px)',
  },
  chatFooterText: {
    fontSize: 10,
    color: '#718096',
  },
  browserContainer: {
    flex: 1,
  },
  browserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backdropFilter: 'blur(10px)',
  },
  browserTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  browserPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  confirmDialog: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    backdropFilter: 'blur(20px)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 14,
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  visitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF6F00',
  },
  visitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});