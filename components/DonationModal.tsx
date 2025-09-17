import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { X, CreditCard, CircleCheck as CheckCircle, Loader } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// Placeholder simple icons
const BikashIcon: React.FC<{size?: number, color?: string}> = ({size = 24, color = "#E91E63"}) => (
  <View style={{ width: size, height: size }}>
    <Text style={{ fontSize: size * 0.8, color, fontWeight: 'bold' }}>bK</Text>
  </View>
);

const NagadIcon: React.FC<{size?: number, color?: string}> = ({size = 24, color = "#F58220"}) => (
  <View style={{ width: size, height: size }}>
    <Text style={{ fontSize: size * 0.8, color, fontWeight: 'bold' }}>N</Text>
  </View>
);

const paymentMethods = [
  { id: 'bkash', name: 'bKash', icon: <BikashIcon /> },
  { id: 'nagad', name: 'Nagad', icon: <NagadIcon /> },
  { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard size={24} color="#3B82F6" /> },
];

const predefinedAmounts = [100, 500, 1000, 2000, 5000];

interface ProjectItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  collectedAmount: number;
  budget: number;
  supporters: number;
  deadlineDays: number;
}

interface DonationModalProps {
  isVisible: boolean;
  onClose: () => void;
  project: ProjectItem | null;
}

const DonationModal: React.FC<DonationModalProps> = ({ isVisible, onClose, project }) => {
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    if (isVisible) {
      // Reset state when modal opens
      setDonationAmount('');
      setSelectedPaymentMethod(null);
      setIsProcessing(false);
      setPaymentError(null);
      setPaymentSuccess(false);
    }
  }, [isVisible]);
  
  if (!isVisible || !project) {
    return null;
  }

  const handleDonateNow = async () => {
    const amount = parseInt(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Please enter a valid donation amount.');
      return;
    }
    if (!selectedPaymentMethod) {
      setPaymentError('Please select a payment method.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    triggerHaptic();

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentSuccess(true);
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const collectedPercentage = (project.collectedAmount / project.budget) * 100;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Support: {project.title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <X size={20} color="#718096" />
            </TouchableOpacity>
          </View>

          {!paymentSuccess ? (
            <>
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>Collected: ৳{project.collectedAmount.toLocaleString()}</Text>
                  <Text style={styles.progressLabel}>Target: ৳{project.budget.toLocaleString()}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min(collectedPercentage, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.deadlineText}>{project.deadlineDays} days left</Text>
              </View>

              <View style={styles.amountSection}>
                <Text style={styles.sectionLabel}>Enter Amount (৳)</Text>
                <TextInput 
                  style={styles.amountInput}
                  value={donationAmount}
                  onChangeText={setDonationAmount}
                  placeholder="e.g., 500"
                  keyboardType="numeric"
                  placeholderTextColor="#A0AEC0"
                />
                <View style={styles.predefinedAmounts}>
                  {predefinedAmounts.map(amount => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.amountChip,
                        donationAmount === String(amount) && styles.selectedAmountChip
                      ]}
                      onPress={() => {
                        setDonationAmount(String(amount));
                        triggerHaptic();
                      }}
                    >
                      <Text style={[
                        styles.amountChipText,
                        donationAmount === String(amount) && styles.selectedAmountChipText
                      ]}>
                        ৳{amount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.paymentMethodSection}>
                <Text style={styles.sectionLabel}>Select Payment Method:</Text>
                <View style={styles.paymentMethods}>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentMethodButton,
                        selectedPaymentMethod === method.id && styles.selectedPaymentMethod
                      ]}
                      onPress={() => {
                        setSelectedPaymentMethod(method.id);
                        triggerHaptic();
                      }}
                    >
                      <View style={styles.paymentMethodIcon}>
                        {method.icon}
                      </View>
                      <Text style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === method.id && styles.selectedPaymentMethodText
                      ]}>
                        {method.name}
                      </Text>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle size={20} color="#10B981" style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {paymentError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{paymentError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.donateButton,
                  (isProcessing || !donationAmount || parseInt(donationAmount) <= 0 || !selectedPaymentMethod) && styles.donateButtonDisabled
                ]}
                onPress={handleDonateNow}
                disabled={isProcessing || !donationAmount || parseInt(donationAmount) <= 0 || !selectedPaymentMethod}
              >
                <LinearGradient
                  colors={['#FF6F00', '#FF8F00']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <View style={styles.donateButtonContent}>
                  {isProcessing ? (
                    <Loader size={20} color="#FFFFFF" />
                  ) : null}
                  <Text style={styles.donateButtonText}>
                    {isProcessing ? 'Processing...' : `Donate ৳${donationAmount || '0'}`}
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <CheckCircle size={64} color="#10B981" style={styles.successIcon} />
              <Text style={styles.successTitle}>Thank You!</Text>
              <Text style={styles.successMessage}>
                Your donation of ৳{donationAmount} for {project.title} is successful.
              </Text>
              <Text style={styles.successSubtext}>Your support makes a difference.</Text>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={onClose}
              >
                <LinearGradient
                  colors={['#FF6F00', '#FF8F00']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  closeButton: {
    padding: 4,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#718096',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6F00',
    borderRadius: 3,
  },
  deadlineText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'right',
  },
  amountSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 8,
  },
  predefinedAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amountChip: {
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedAmountChip: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6F00',
  },
  amountChipText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  selectedAmountChipText: {
    color: '#FF6F00',
    fontWeight: '600',
  },
  paymentMethodSection: {
    marginBottom: 20,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedPaymentMethod: {
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
  },
  paymentMethodIcon: {
    marginRight: 12,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
  },
  selectedPaymentMethodText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
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
  donateButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  donateButtonDisabled: {
    opacity: 0.6,
  },
  donateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  successSubtext: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 24,
  },
  doneButton: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 14,
  },
});

export default DonationModal;