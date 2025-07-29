import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { ArrowLeft, Loader, CircleAlert as AlertCircle, CircleCheck as CheckCircle, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslate } from '@/hooks/useTranslate';

interface OtpVerificationPageProps {
  email: string;
  onOtpVerified: () => void;
  onBack: () => void;
}

export default function OtpVerificationPage({ email, onOtpVerified, onBack }: OtpVerificationPageProps) {
    const t = useTranslate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // const handleOtpChange = (value: string, index: number) => {
  //   if (value.length > 1) return; // Prevent multiple characters
    
  //   const newOtp = [...otp];
  //   newOtp[index] = value;
  //   setOtp(newOtp);

  //   // Auto-focus next input
  //   if (value && index < 5) {
  //     inputRefs.current[index + 1]?.focus();
  //   }

  //   // Auto-verify when all fields are filled
  //   if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
  //     handleVerifyOtp(newOtp.join(''));
  //   }
  // };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // const handleVerifyOtp = async (otpCode?: string) => {
  //   const otpToVerify = otpCode || otp.join('');
  //   if (otpToVerify.length !== 6) {
  //     setError('Please enter the complete 6-digit OTP.');
  //     return;
  //   }

  //   setIsVerifying(true);
  //   setError(null);
  //   triggerHaptic();

  //   try {
  //     const isValid = await verifyOtp(otpToVerify);
  //     if (isValid) {
  //       onOtpVerified();
  //     }
  //   } catch (err: any) {
  //     console.error('OTP Verification Error:', err);
  //     setError(err.message || 'OTP verification failed. Please try again.');
  //     // Clear OTP on error
  //     setOtp(['', '', '', '', '', '']);
  //     inputRefs.current[0]?.focus();
  //   } finally {
  //     setIsVerifying(false);
  //   }
  // };

  // const handleResendOtp = async () => {
  //   if (!canResend) return;
    
  //   triggerHaptic();
  //   setError(null);
    
  //   try {
  //     const sent = await sendOtp('email', email);
  //     if (sent) {
  //       setCountdown(300);
  //       setCanResend(false);
  //       setOtp(['', '', '', '', '', '']);
  //       inputRefs.current[0]?.focus();
  //     } else {
  //       setError('Failed to resend OTP. Please try again.');
  //     }
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to resend OTP.');
  //   }
  // };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={20} color="#FF6F00" />
        <Text style={styles.backButtonText}>{t('back', 'Back')}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color="#10B981" />
        </View>

        <Text style={styles.title}>{t('verifyYourEmail', 'Verify Your Email')}</Text>
        <Text style={styles.subtitle}>
         {t('otpSentTo', "We've sent a 6-digit verification code to")}
        </Text>
        <Text style={styles.email}>{email}</Text>

        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                error && styles.otpInputError
              ]}
              value={digit}
              // onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {/* <TouchableOpacity
          style={[
            styles.verifyButton,
            (isVerifying || isLoadingAuth) && styles.verifyButtonDisabled
          ]}
          onPress={() => handleVerifyOtp()}
          disabled={isVerifying || isLoadingAuth || otp.join('').length !== 6}
        >
          {(isVerifying || isLoadingAuth) ? (
            <Loader size={20} color="#FFFFFF" />
          ) : (
            <CheckCircle size={20} color="#FFFFFF" />
          )}
          <Text style={styles.verifyButtonText}>
             {isVerifying ? t('verifying', 'Verifying...') : t('verifyOtp', 'Verify OTP')}
          </Text>
        </TouchableOpacity> */}

        <View style={styles.resendContainer}>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>
              {t('resendOtpIn', 'Resend OTP in')} {formatTime(countdown)}
            </Text>
          ) : (
            <TouchableOpacity
              style={styles.resendButton}
              // onPress={handleResendOtp}
              disabled={!canResend}
            >
              <RefreshCw size={16} color="#FF6F00" />
              <Text style={styles.resendButtonText}>{t('resendOtp', 'Resend OTP')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.helpText}>
         {t('didNotReceiveCode', "Didn't receive the code? Check your spam folder or try resending.")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#FF6F00',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6F00',
    textAlign: 'center',
    marginBottom: 32,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    backgroundColor: '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: '#FF6F00',
    backgroundColor: '#FFF7ED',
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
    marginBottom: 24,
    width: '100%',
  },
  verifyButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendContainer: {
    marginBottom: 24,
  },
  countdownText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6F00',
  },
  helpText: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 18,
  },
});