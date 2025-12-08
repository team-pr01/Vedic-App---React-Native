import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { Send, Mic, CircleStop as StopCircle, X, Brain, Loader } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface AIAssistantChatProps {
  isVisible: boolean;
  onClose: () => void;
}

const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ isVisible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Namaste! I'm your Vedic Wisdom AI Assistant. How can I help you with your spiritual journey today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const recognitionRef = useRef<any>(null);

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
          setInputText(transcript);
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    triggerHaptic();
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      generateResponse(userMessage.text);
    }, 1000);
  };

  const generateResponse = (userQuery: string) => {
    // Enhanced AI response generation with better logic
    let responseText = '';
    const lowerQuery = userQuery.toLowerCase();
    
    // Vedic texts and scriptures
    if (lowerQuery.includes('veda') || lowerQuery.includes('vedic')) {
      if (lowerQuery.includes('rigveda')) {
        responseText = "The Rigveda is the oldest of the four Vedas, containing 1,028 hymns organized in 10 mandalas (books). It primarily consists of hymns praising various deities like Indra, Agni, and Varuna. The famous Gayatri Mantra (RV 3.62.10) is from the Rigveda. Would you like to know about specific hymns or deities?";
      } else if (lowerQuery.includes('samaveda')) {
        responseText = "The Samaveda is known as the 'Veda of melodies' and contains 1,875 verses, mostly derived from the Rigveda but set to musical notation. It's essential for the Soma sacrifice and forms the foundation of Indian classical music. The chanting of Samaveda is considered highly sacred.";
      } else if (lowerQuery.includes('yajurveda')) {
        responseText = "The Yajurveda contains prose mantras and sacrificial formulas. It exists in two versions: Shukla (White) and Krishna (Black) Yajurveda. It provides detailed instructions for performing Vedic rituals and sacrifices.";
      } else if (lowerQuery.includes('atharvaveda')) {
        responseText = "The Atharvaveda is unique among the Vedas as it contains practical knowledge for daily life, including medicine, magic, and domestic rituals. It has 20 books with hymns for healing, protection, and prosperity.";
      } else {
        responseText = "The Vedas are ancient sacred texts of Hinduism, consisting of four collections: Rigveda (hymns), Samaveda (melodies), Yajurveda (sacrificial formulas), and Atharvaveda (practical knowledge). They contain hymns, philosophical discussions, and instructions for rituals. Would you like to know more about a specific Veda?";
      }
    } 
    // Yoga and spiritual practices
    else if (lowerQuery.includes('yoga')) {
      if (lowerQuery.includes('asana') || lowerQuery.includes('pose')) {
        responseText = "Yoga asanas are physical postures that form one of the eight limbs of yoga. Popular asanas include Surya Namaskara (Sun Salutation), Vrikshasana (Tree Pose), and Shavasana (Corpse Pose). Each asana has specific benefits for physical and mental health. Would you like guidance on specific poses?";
      } else if (lowerQuery.includes('pranayama')) {
        responseText = "Pranayama is the practice of breath control in yoga. Key techniques include Anulom Vilom (alternate nostril breathing), Kapalbhati (skull shining breath), and Ujjayi (victorious breath). Regular pranayama practice improves lung capacity, reduces stress, and enhances mental clarity.";
      } else {
        responseText = "Yoga is a comprehensive system of physical, mental, and spiritual practices originating in ancient India. The word 'yoga' comes from Sanskrit 'yuj' meaning to unite or join. The eight limbs of yoga (Ashtanga) include ethical guidelines, physical postures, breath control, and meditation. Would you like to learn about specific aspects of yoga?";
      }
    }
    // Meditation and mindfulness
    else if (lowerQuery.includes('meditation') || lowerQuery.includes('dhyana')) {
      if (lowerQuery.includes('technique') || lowerQuery.includes('how')) {
        responseText = "Here are some effective meditation techniques: 1) Mindfulness meditation - focus on breath and present moment, 2) Mantra meditation - repeat sacred sounds like 'Om', 3) Trataka - candle gazing meditation, 4) Walking meditation - mindful movement. Start with 5-10 minutes daily and gradually increase duration.";
      } else {
        responseText = "Meditation (Dhyana) is the seventh limb of yoga, involving sustained concentration and awareness. It helps reduce stress, improve focus, and develop spiritual insight. In Vedantic tradition, meditation leads to self-realization and union with the divine. Regular practice brings peace, clarity, and inner transformation.";
      }
    }
    // Temples and sacred places
    else if (lowerQuery.includes('temple') || lowerQuery.includes('mandir')) {
      responseText = "Hindu temples are sacred spaces designed according to Vastu Shastra principles. Key elements include the Garbhagriha (sanctum), Mandapa (hall), and Shikhara (tower). Famous temples include Jagannath Puri, Kedarnath, Vaishno Devi, and Tirupati. Each temple has unique architecture, deities, and spiritual significance. Would you like information about specific temples?";
    }
    // Bhagavad Gita
    else if (lowerQuery.includes('gita') || lowerQuery.includes('bhagavad')) {
      if (lowerQuery.includes('karma')) {
        responseText = "The Bhagavad Gita's teaching on Karma Yoga emphasizes performing one's duty without attachment to results. The famous verse 'Karmanye vadhikaraste ma phaleshu kadachana' means you have the right to action but not to the fruits of action. This principle helps achieve inner peace and spiritual growth.";
      } else if (lowerQuery.includes('chapter') || lowerQuery.includes('verse')) {
        responseText = "The Bhagavad Gita has 18 chapters with 700 verses. Key chapters include: Chapter 2 (Sankhya Yoga), Chapter 6 (Dhyana Yoga), Chapter 9 (Raja Vidya Yoga), and Chapter 18 (Moksha Yoga). Each chapter addresses different aspects of spiritual life and self-realization.";
      } else {
        responseText = "The Bhagavad Gita is a 700-verse dialogue between Prince Arjuna and Lord Krishna on the battlefield of Kurukshetra. It addresses fundamental questions about duty, righteousness, and the nature of reality. Key teachings include Karma Yoga (path of action), Bhakti Yoga (path of devotion), and Jnana Yoga (path of knowledge).";
      }
    }
    // Mantras and chanting
    else if (lowerQuery.includes('mantra') || lowerQuery.includes('chant')) {
      if (lowerQuery.includes('gayatri')) {
        responseText = "The Gayatri Mantra (Om Bhur Bhuvaḥ Swaḥ...) is one of the most sacred mantras from Rigveda 3.62.10. It's a prayer to Savitri (the sun deity) for illumination of the mind. Traditionally chanted at sunrise and sunset, it enhances wisdom, concentration, and spiritual growth.";
      } else if (lowerQuery.includes('om') || lowerQuery.includes('aum')) {
        responseText = "Om (AUM) is the primordial sound and most sacred mantra in Hinduism. It represents the cosmic sound of creation and the unity of all existence. The three sounds A-U-M symbolize creation, preservation, and destruction. Chanting Om brings peace, clarity, and spiritual connection.";
      } else {
        responseText = "Mantras are sacred sounds, words, or phrases used in meditation and prayer. They can be seed mantras (like Om), deity mantras (like Om Namah Shivaya), or longer prayers (like Gayatri Mantra). Regular mantra chanting purifies the mind, enhances concentration, and creates positive vibrations.";
      }
    }
    // Ayurveda and health
    else if (lowerQuery.includes('ayurveda') || lowerQuery.includes('health')) {
      responseText = "Ayurveda is the ancient Indian system of medicine focusing on balance between mind, body, and spirit. It identifies three doshas: Vata (air/space), Pitta (fire/water), and Kapha (earth/water). Treatment includes diet, herbs, lifestyle changes, and therapies like Panchakarma. Ayurveda emphasizes prevention and natural healing.";
    }
    // Festivals and traditions
    else if (lowerQuery.includes('festival') || lowerQuery.includes('celebration')) {
      responseText = "Hindu festivals celebrate various aspects of divinity and nature's cycles. Major festivals include Diwali (festival of lights), Holi (festival of colors), Navaratri (nine nights of the goddess), Dussehra (victory of good over evil), and Janmashtami (Krishna's birthday). Each festival has deep spiritual significance and brings communities together.";
    }
    // Philosophy and spirituality
    else if (lowerQuery.includes('philosophy') || lowerQuery.includes('spiritual')) {
      responseText = "Indian philosophy encompasses six orthodox schools (Darshanas): Samkhya, Yoga, Nyaya, Vaisheshika, Mimamsa, and Vedanta. Key concepts include Dharma (righteous duty), Karma (action and consequence), Moksha (liberation), and Atman (soul). These philosophies provide frameworks for understanding reality and achieving spiritual growth.";
    }
    // Sanskrit language
    else if (lowerQuery.includes('sanskrit')) {
      responseText = "Sanskrit is the sacred language of Hinduism and ancient Indian literature. It has a systematic grammar codified by Panini in the Ashtadhyayi. Sanskrit texts include the Vedas, Upanishads, epics (Ramayana, Mahabharata), and philosophical works. Learning Sanskrit provides direct access to original spiritual texts and their profound meanings.";
    }
    // Default response with suggestions
    else {
      responseText = "Thank you for your question! I'm here to help with Vedic wisdom and spiritual knowledge. You can ask me about:\n\n• Vedic texts (Rigveda, Samaveda, Yajurveda, Atharvaveda)\n• Bhagavad Gita teachings and verses\n• Yoga practices and philosophy\n• Meditation techniques\n• Mantras and their meanings\n• Hindu temples and traditions\n• Ayurveda and holistic health\n• Sanskrit language and literature\n• Indian philosophy and spirituality\n\nWhat specific topic interests you?";
    }
    
    const assistantMessage: Message = {
      id: Date.now().toString(),
      text: responseText,
      sender: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleVoiceInput = () => {
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
        console.error('Error starting voice recognition:', error);
        setIsListening(false);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Brain size={24} color="#FF6F00" />
          <Text style={styles.headerTitle}>Vedic Wisdom AI</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#718096" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userMessage : styles.assistantMessage
            ]}
          >
            {message.sender === 'assistant' && (
              <Image 
                source={{ uri: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=100" }}
                style={styles.assistantAvatar}
              />
            )}
            <View style={styles.messageContent}>
              <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userMessageText : styles.assistantMessageText
              ]}>
                {message.text}
              </Text>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Image 
              source={{ uri: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=100" }}
              style={styles.assistantAvatar}
            />
            <View style={styles.loadingBubble}>
              <Loader size={20} color="#FF6F00" />
            </View>
          </View>
        )}
      </ScrollView>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about Vedic wisdom..."
          placeholderTextColor="#A0AEC0"
          multiline
          maxLength={500}
          onSubmitEditing={handleSendMessage}
        />
        <View style={styles.inputActions}>
          {/* <TouchableOpacity
            onPress={handleVoiceInput}
            style={[
              styles.voiceButton,
              isListening && styles.voiceButtonActive
            ]}
          >
            {isListening ? (
              <StopCircle size={24} color="#EF4444" />
            ) : (
              <Mic size={24} color="#718096" />
            )}
          </TouchableOpacity> */}
          
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
          >
            <Send size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  assistantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  messageContent: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '90%',
  },
  userMessageText: {
    backgroundColor: '#FF6F00',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    color: '#FFFFFF',
  },
  assistantMessageText: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    color: '#2D3748',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: '#718096',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  loadingBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 80,
    fontSize: 14,
    color: '#2D3748',
    maxHeight: 100,
  },
  inputActions: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  voiceButtonActive: {
    backgroundColor: '#FEF2F2',
  },
  sendButton: {
    backgroundColor: '#FF6F00',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
});

export default AIAssistantChat;