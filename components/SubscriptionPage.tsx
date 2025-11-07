import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Button,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { X, Crown, Star, Check, X as XIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';
import * as ImagePicker from 'expo-image-picker';
import { useForm } from 'react-hook-form';

const { width } = Dimensions.get('window');

// Updated payment cards with better colors
export const paymentCards = [
  {
    id: 'card-1',
    provider: 'bkash',
    logo: '/logos/bkash.png',
    accountName: 'Arya Kallayn Foundation',
    accountNumber: '01812-XXXXXX-001',
    qr: 'https://via.placeholder.com/150?text=bkash+QR',
    color: '#E2136E',
    gradient: ['#E2136E', '#FF4D94'],
  },
  {
    id: 'card-2',
    provider: 'Nagad',
    logo: '/logos/nagad.png',
    accountName: 'Arya Kallayn Foundation',
    accountNumber: '01711-XXXXXX-002',
    qr: 'https://via.placeholder.com/150?text=nagad+QR',
    color: '#F8A01C',
    gradient: ['#F8A01C', '#FFC107'],
  },
  {
    id: 'card-4',
    provider: 'Stripe',
    logo: '/logos/stripe.png',
    accountName: 'Arya Kallayn Foundation',
    accountNumber: 'acct_1Hxxxxxx',
    qr: 'https://via.placeholder.com/150?text=stripe+QR',
    color: '#635BFF',
    gradient: ['#635BFF', '#8B85FF'],
  },
  {
    id: 'card-5',
    provider: 'PayPal',
    logo: '/logos/paypal.png',
    accountName: 'Arya Kallayn Foundation',
    accountNumber: 'paypal@prtech.com',
    qr: 'https://via.placeholder.com/150?text=paypal+QR',
    color: '#0070BA',
    gradient: ['#0070BA', '#009CDE'],
  },
  {
    id: 'card-6',
    provider: 'Bank',
    logo: '/logos/bank.png',
    accountName: 'Arya Kallayn Foundation',
    accountNumber: '001234567890',
    qr: 'https://via.placeholder.com/150?text=bank+QR',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#66BB6A'],
    note: 'Standard bank transfer (IBAN not required)',
  },
];

// Enhanced plans with better gradients and structure
const plans = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '$0',
    gradient: ['#667080', '#95A0B8'],
    icon: '🆓',
    features: [
      { text: 'News in 100 languages – Unlimited', included: true },
      { text: 'Vedic Book – 100 languages, Unlimited', included: true },
      { text: 'Cooking Videos – Unlimited', included: true },
      { text: 'Ayurveda Videos – Unlimited', included: true },
      { text: 'Yoga Videos – Unlimited', included: true },
      { text: 'Vastu Videos – Unlimited (No AI support)', included: true, note: true },
      { text: 'Unlimited quizzes per month', included: true },
      { text: 'AI Chat: 5/day', included: true, limited: true },
      { text: 'AI Recipes: 5/month', included: true, limited: true },
      { text: 'AI Kundli', included: false },
      { text: 'AI Muhurta', included: false },
      { text: 'With ads', included: true, warning: true },
    ],
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    price: '$5',
    gradient: ['#4F46E5', '#7C73FF'],
    icon: '🔹',
    features: [
      { text: 'News, Books, Videos – Unlimited', included: true },
      { text: 'Vastu AI Support: 5/month', included: true, limited: true },
      { text: 'AI Chat: 20/day', included: true, limited: true },
      { text: 'AI Recipes: 20/month', included: true, limited: true },
      { text: 'AI Kundli: 5/month', included: true, limited: true },
      { text: 'AI Muhurta: 5/month', included: true, limited: true },
      { text: 'No ads', included: true, note: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$15',
    gradient: ['#F59E0B', '#FBBF24'],
    icon: '⭐',
    features: [
      { text: 'All Basic features', included: true },
      { text: 'Vastu AI Support: 20/month', included: true, limited: true },
      { text: 'AI Chat: 50/day', included: true, limited: true },
      { text: 'AI Recipes: 50/month', included: true, limited: true },
      { text: 'AI Kundli: 20/month', included: true, limited: true },
      { text: 'AI Muhurta: 20/month', included: true, limited: true },
      { text: 'Voice Health Tips', included: true },
      { text: 'No ads', included: true },
    ],
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: '$30',
    gradient: ['#9333EA', '#C026D3'],
    icon: '👑',
    features: [
      { text: 'News in 100 languages – Unlimited', included: true },
      { text: 'Vedic Book – 100 languages, Unlimited', included: true },
      { text: 'Cooking Videos – Unlimited', included: true },
      { text: 'Ayurveda Videos – Unlimited', included: true },
      { text: 'Yoga Videos – Unlimited', included: true },
      { text: 'Vastu Videos – Unlimited', included: true },
      { text: 'Vastu AI Support: Unlimited', included: true },
      { text: 'Unlimited quizzes per month', included: true },
      { text: 'AI Chat / Generated Feature: Unlimited', included: true },
      { text: 'AI Recipes: Unlimited', included: true },
      { text: 'AI Kundli: Unlimited', included: true },
      { text: 'AI Muhurta: Unlimited', included: true },
      { text: 'No ads', included: true },
    ],
  },
];

export default function SubscriptionPage({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const [paymentOptionModalOpen, setPaymentOptionModalOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);

  const { watch, setValue, handleSubmit, reset } = useForm({
    defaultValues: { currency: '', amount: '', file: null },
  });

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setValue('file', result.assets[0].uri);
    }
  };

  const onSubmit = (data: any) => {
    Alert.alert('Success', `Payment submitted for ${selectedPlan?.name}`);
    reset();
    setPaymentOpen(false);
  };

  const FeatureIcon = ({ included, limited, warning, note }: any) => {
    if (!included) return <XIcon size={16} color="#EF4444" />;
    if (warning) return <Text style={styles.warningIcon}>⚠</Text>;
    if (note) return <Text style={styles.noteIcon}>•</Text>;
    if (limited) return <Check size={16} color="#10B981" />;
    return <Check size={16} color="#10B981" />;
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Choose Your Plan
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={28} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Select the perfect plan for your spiritual journey
          </Text>
          
          {plans.map((plan) => (
            <LinearGradient
              key={plan.id}
              colors={plan.gradient}
              style={[
                styles.card,
                plan.id === 'premium' && styles.premiumCard
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Premium Badge */}
              {plan.id === 'premium' && (
                <View style={styles.premiumBadge}>
                  <Crown size={14} color="#000" />
                  <Text style={styles.premiumBadgeText}>BEST VALUE</Text>
                </View>
              )}

              {/* Plan Header */}
              <View style={styles.cardHeader}>
                <View style={styles.planTitleContainer}>
                  <View style={styles.planNameRow}>
                    <Text style={styles.planIcon}>{plan.icon}</Text>
                    <Text style={styles.planName}>{plan.name}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>
                      {plan.id === 'free' ? 'forever' : '/month'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Features List */}
              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIconContainer}>
                      <FeatureIcon {...feature} />
                    </View>
                    <Text style={[
                      styles.featureText,
                      !feature.included && styles.featureExcluded,
                      feature.limited && styles.featureLimited,
                      feature.warning && styles.featureWarning,
                      feature.note && styles.featureNote,
                    ]}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Subscribe Button */}
              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  plan.id === 'free' && styles.freeButton,
                  plan.id === 'basic' && styles.basicButton,
                  plan.id === 'pro' && styles.proButton,
                  plan.id === 'premium' && styles.premiumButton,
                ]}
                onPress={() => {
                  setSelectedPlan(plan);
                  setPaymentOptionModalOpen(true);
                }}
              >
                <Text style={[
                  styles.subscribeText,
                  plan.id === 'free' && styles.freeButtonText,
                  plan.id === 'premium' && styles.premiumButtonText,
                ]}>
                  {plan.id === 'free' ? 'Get Started Free' : 'Subscribe Now'}
                  {plan.id === 'premium' && <Crown size={16} color="#9333EA" style={{ marginLeft: 4 }} />}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </ScrollView>

        {/* Payment Option Modal */}
        <Modal visible={paymentOptionModalOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select Payment Method
                </Text>
                <TouchableOpacity onPress={() => setPaymentOptionModalOpen(false)}>
                  <X size={24} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.paymentMethodsContainer}>
                {paymentCards.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[styles.paymentCard, { borderLeftColor: card.color }]}
                    onPress={() => {
                      setPaymentMethod(card);
                      setPaymentOptionModalOpen(false);
                      setPaymentOpen(true);
                      setValue('amount', selectedPlan?.price.replace('$', ''));
                    }}
                  >
                    <View style={styles.paymentCardContent}>
                      <View style={styles.paymentCardLeft}>
                        <View style={[styles.paymentLogoContainer, { backgroundColor: `${card.color}15` }]}>
                          <Text style={[styles.paymentLogoText, { color: card.color }]}>
                            {card.provider.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.paymentInfo}>
                          <Text style={[styles.paymentProvider, { color: colors.text }]}>
                            {card.provider}
                          </Text>
                          <Text style={[styles.paymentAccount, { color: colors.secondaryText }]}>
                            {card.accountNumber}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.qrPreview}>
                        <Text style={styles.qrPreviewText}>QR</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Payment Confirmation Modal */}
        <Modal visible={paymentOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Complete Payment
                </Text>
                <TouchableOpacity onPress={() => setPaymentOpen(false)}>
                  <X size={24} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.paymentDetailsContainer}>
                {paymentMethod && (
                  <View style={styles.selectedPaymentMethod}>
                    <View style={[styles.paymentMethodHeader, { backgroundColor: `${paymentMethod.color}15` }]}>
                      <Text style={[styles.paymentMethodName, { color: paymentMethod.color }]}>
                        {paymentMethod.provider}
                      </Text>
                      <Text style={[styles.paymentAccountDetail, { color: colors.text }]}>
                        {paymentMethod.accountNumber}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.amountSection}>
                  <Text style={[styles.amountLabel, { color: colors.text }]}>Amount (USD)</Text>
                  <TextInput
                    value={watch('amount')}
                    onChangeText={(t) => setValue('amount', t)}
                    style={[styles.amountInput, { backgroundColor: colors.background, color: colors.text }]}
                    keyboardType="numeric"
                    placeholder="Enter amount"
                    placeholderTextColor={colors.secondaryText}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, { backgroundColor: '#9333EA' }]}
                  onPress={handleSubmit(onSubmit)}
                >
                  <Text style={styles.submitButtonText}>Confirm Payment</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '800',
    fontFamily: 'System',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 480,
  },
  premiumCard: {
    shadowColor: '#9333EA',
    shadowOpacity: 0.3,
    transform: [{ scale: 1.02 }],
    marginVertical: 8,
    borderWidth: 2,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  premiumBadge: {
    position: 'absolute',
    top: 16,
    right: -20,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 6,
    transform: [{ rotate: '45deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: 2,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'System',
  },
  cardHeader: {
    marginBottom: 20,
  },
  planTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planIcon: {
    fontSize: 20,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    fontFamily: 'System',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    fontFamily: 'System',
  },
  planPeriod: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    fontFamily: 'System',
  },
  featuresContainer: {
    flex: 1,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  featureIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  warningIcon: {
    fontSize: 16,
    color: '#F59E0B',
  },
  noteIcon: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
    fontFamily: 'System',
  },
  featureExcluded: {
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
  },
  featureLimited: {
    color: 'rgba(255,255,255,0.9)',
  },
  featureWarning: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  featureNote: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  subscribeButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  freeButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  basicButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  proButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  premiumButton: {
    backgroundColor: '#fff',
    shadowColor: '#9333EA',
    shadowOpacity: 0.4,
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'System',
  },
  freeButtonText: {
    color: '#666',
  },
  premiumButtonText: {
    color: '#9333EA',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    fontFamily: 'System',
  },
  paymentMethodsContainer: {
    padding: 20,
  },
  paymentCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  paymentCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentLogoText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
  },
  paymentInfo: {
    gap: 2,
  },
  paymentProvider: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  paymentAccount: {
    fontSize: 14,
    fontFamily: 'System',
  },
  qrPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPreviewText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '600',
  },
  paymentDetailsContainer: {
    padding: 20,
  },
  selectedPaymentMethod: {
    marginBottom: 20,
  },
  paymentMethodHeader: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  paymentMethodName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 4,
  },
  paymentAccountDetail: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  amountSection: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
  },
  amountInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
  },
});