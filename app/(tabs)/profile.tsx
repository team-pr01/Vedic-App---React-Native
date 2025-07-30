import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TriangleAlert as AlertTriangle, 
  Phone, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Send, 
  Loader, 
  ArrowLeft 
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { useCurrentUser } from '@/redux/features/Auth/authSlice';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslate } from '@/hooks/useTranslate';
import { useSendEmergencyAlertMutation } from '@/redux/features/Emergency/Emergency';

interface EmergencyContact {
  name: string;
  number: string;
  available: string;
  type: 'call' | 'whatsapp';
}

export default function EmergencyScreen() {
  const colors = useThemeColors();
  const t = useTranslate();
  const currentUser = useSelector(useCurrentUser);
  const [sendEmergencyAlert, { isLoading }] = useSendEmergencyAlertMutation();
  const [message, setMessage] = useState('');
    const [location, setLocation] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const emergencyContacts: EmergencyContact[] = [
    { name: 'AKF Emergency Hotline', number: '+8801612131631', available: '24/7', type: 'call' },
    { name: 'AKF WhatsApp Support', number: '+8801540731551', available: '24/7', type: 'whatsapp' },
    { name: 'AKF Office (Daytime)', number: '+8801540731551', available: '9 AM - 5 PM', type: 'call' }
  ];

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleEmergencySubmit = async () => {
   if (!message.trim() || !location.trim()) {
      Alert.alert(t('submissionFailed', 'Submission Failed'), t('alertFieldsRequired', 'Please describe your emergency and provide your location.'));
      return;
    }
    if (!currentUser?._id) {
        Alert.alert(t('authError', 'Authentication Error'), t('authErrorSub', 'You must be logged in to send an alert.'));
        return;
    }
    setIsSubmitting(true);
    triggerHaptic();
    
    try {
      const payload = {
        user: currentUser._id,
        message: message,
        location: location, // TODO: Replace with dynamic location using expo-location
      };

      // Call the mutation. .unwrap() will throw an error on failure.
      await sendEmergencyAlert(payload).unwrap();

      // Handle success
      setShowSuccess(true);
      setMessage('');
      setLocation('')
      setTimeout(() => setShowSuccess(false), 5000); 
    
    } catch (error) {
       console.error('Error sending emergency notification:', error);
      Alert.alert(
        t('submissionFailed', 'Submission Failed'), 
        t('submissionFailedSub', 'Failed to send emergency alert...')
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleContactPress = (contact: EmergencyContact) => {
    triggerHaptic();
    let url = '';
    if (contact.type === 'whatsapp') {
      url = `whatsapp://send?phone=${contact.number.replace(/[^0-9]/g, '')}`;
    } else {
      url = `tel:${contact.number}`;
    }
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('Error', `Unable to open ${contact.type}.`);
      }
    });
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#EF4444', '#DC2626']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('emergency', 'Emergency')}</Text>
          <Text style={styles.headerSubtitle}>{t('emergencyService', 'জরুরি সেবা')}</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      {/* Emergency Alert */}
      <View style={[styles.alertContainer, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#FEF3C7', '#FDE68A']}
          style={styles.alertCard}
        >
          <AlertTriangle size={24} color="#D97706" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{t('emergencyAssistance', 'Emergency Assistance Available 24/7')}</Text>
            <Text style={styles.alertText}>{t('emergencyAssistanceSub', 'Tap any service below for immediate help')}</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Form */}
        <View style={styles.section}>
          <View style={[styles.emergencyFormCard, { shadowColor: colors.cardShadow }]}>
            <View style={styles.emergencyFormHeader}>
              <AlertTriangle size={28} color="#FFFFFF" />
              <View>
                <Text style={styles.emergencyFormTitle}>{t('needImmediateHelp', 'Need Immediate Help?')}</Text>
                <Text style={styles.emergencyFormSubtitle}>{t('needImmediateHelpSub', "Describe your situation. We're here 24/7.")}</Text>
              </View>
            </View>

            <View style={styles.emergencyForm}>
              <TextInput
                style={styles.emergencyInput}
                value={message}
                onChangeText={setMessage}
                placeholder={t('emergencyPlaceholder', 'Briefly describe your emergency...')}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#FCA5A5"
              />
              <TextInput
                style={styles.emergencyInputSingleLine} // Using a new style for single-line input
                value={location}
                onChangeText={setLocation}
                placeholder={t('locationPlaceholder', 'Your current location (e.g., City, Area)')}
                placeholderTextColor="#FCA5A5"
              />

              <TouchableOpacity
                style={[
                  styles.emergencyButton,
                  (isSubmitting || !message.trim()) && styles.emergencyButtonDisabled
                ]}
                onPress={handleEmergencySubmit}
                disabled={isSubmitting || !message.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={20} color="#EF4444" />
                    <Text style={styles.emergencyButtonText}>{t('sendingAlert', 'Sending Alert...')}</Text>
                  </>
                ) : (
                  <>
                    <Send size={20} color="#EF4444" />
                   <Text style={styles.emergencyButtonText}>{t('sendEmergencyAlert', 'Send Emergency Alert')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {showSuccess && (
              <View style={styles.successMessage}>
                <Text style={styles.successMessageText}>{t('alertSentSuccess', 'Alert sent successfully! We will contact you as soon as possible.')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Contacts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quickContacts', 'Quick Contacts')}</Text>
          <View style={styles.contactsContainer}>
            {emergencyContacts.map((contact, index) => (
              <View key={index} style={[styles.contactCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                  <View style={styles.availabilityContainer}>
                    <Clock size={14} color={colors.secondaryText} />
                    <Text style={[styles.availabilityText, { color: colors.secondaryText }]}>Available: {contact.available}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => {
                    triggerHaptic();
                    if (Platform.OS === 'web') {
                      if (contact.type === 'whatsapp') {
                        window.open(`https://wa.me/${contact.number.replace(/[^0-9]/g, '')}`, '_blank');
                      } else {
                        window.open(`tel:${contact.number}`, '_blank');
                      }
                    } else {
                      console.log(`Calling ${contact.type}: ${contact.number}`);
                    }
                  }}
                >
                  {contact.type === 'whatsapp' ? (
                    <MessageSquare size={24} color="#FFFFFF" />
                  ) : (
                    <Phone size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Visit Office */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Visit Our Office</Text>
          <View style={[styles.officeCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
            <View style={styles.officeHeader}>
              <MapPin size={20} color="#EF4444" />
              <Text style={[styles.officeName, { color: colors.text }]}>Arya Kalyan Foundation</Text>
            </View>
            <Text style={[styles.officeAddress, { color: colors.secondaryText }]}>Rangpur Sadar, Kamal Kachna, Notun Para, Rangpur, Bangladesh</Text>
            <TouchableOpacity
              style={[styles.directionsButton, { backgroundColor: colors.background }]}
              onPress={() => {
                triggerHaptic();
                if (Platform.OS === 'web') {
                  window.open('https://www.google.com/maps/search/?api=1&query=Arya+Kalyan+Foundation+Rangpur+Bangladesh', '_blank');
                } else {
                  console.log('Opening maps app with AKF location');
                }
              }}
            >
              <Text style={[styles.directionsButtonText, { color: colors.secondaryText }]}>Get Directions on Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Safety Tips</Text>
          <View style={styles.tipsContainer}>
            {[
              { title: "Keep Emergency Numbers Handy", description: "Save important emergency numbers in your phone and keep them easily accessible." },
              { title: "Know Your Location", description: "Always be aware of your current location to help emergency services find you quickly." },
              { title: "First Aid Basics", description: "Learn basic first aid techniques that could save lives in emergency situations." },
              { title: "Emergency Kit", description: "Keep a basic emergency kit with medicines, flashlight, and important documents." }
            ].map((tip, index) => (
              <View key={index} style={[styles.tipCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>{tip.title}</Text>
                <Text style={[styles.tipDescription, { color: colors.secondaryText }]}>{tip.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
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
    color: '#FEE2E2',
  },
  headerPlaceholder: {
    width: 24,
  },
  alertContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backdropFilter: 'blur(10px)',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBBF24',
    backdropFilter: 'blur(10px)',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#D97706',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emergencyFormCard: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    backdropFilter: 'blur(10px)',
  },
  emergencyFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical:16,
    gap: 12,
  },
  emergencyFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emergencyFormSubtitle: {
    fontSize: 14,
    color: '#FEE2E2',
  },
  emergencyForm: {
    padding: 16,
    paddingTop: 0,
  },
  emergencyInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
    height: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  emergencyButtonDisabled: {
    opacity: 0.7,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  successMessage: {
    backgroundColor: '#10B981',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  successMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  contactsContainer: {
    gap: 12,
  },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginBottom: 4,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityText: {
    fontSize: 12,
  },
  contactButton: {
    backgroundColor: '#EF4444',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  officeCard: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
  },
  officeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  officeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  officeAddress: {
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 28,
  },
  directionsButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  directionsButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  emergencyInputSingleLine: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
    height: 56, // For single-line
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});