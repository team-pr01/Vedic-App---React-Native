import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useTranslate } from '@/hooks/useTranslate';
import {
  Mail,
  Lock,
  ArrowLeft,
  Loader,
  CircleAlert as AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/features/Auth/authSlice';
import { useResetPasswordMutation } from '@/redux/features/Auth/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface ResetPasswordProps {
  onSwitchToSignup: () => void;
  onBackToMain: () => void;
}

export default function ResetPassword({
  onSwitchToSignup,
  onBackToMain,
}: ResetPasswordProps) {
  const t = useTranslate();
  const email = AsyncStorage.getItem('resetEmail') || '';
  const [password, setPassword] = useState('11111111');
  const [otp, setOtp] = useState('11111111');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const dispatch = useDispatch();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleReset = async () => {
     const storedEmail = await AsyncStorage.getItem('resetEmail');
  if (!storedEmail) {
    setError('Something went wrong. Please try to send email again.');
    return;
  }
    const payload = {
    email: storedEmail,
    otp,
    newPassword: password,
  };
  console.log(payload)
    setIsSubmitting(true);
    setError(null);
    triggerHaptic();

    try {
      const res = await resetPassword(payload).unwrap();
       router.replace({ pathname: '/auth', params: { mode: 'login' } });
    } catch (err: any) {
      console.error('Reset failed', err);
      setError(err.message || 'Reset failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   triggerHaptic();
  //   setError(null);
  //   setIsSubmitting(true);

  //   try {
  //     await loginWithGoogle();
  //   } catch (err: any) {
  //     console.error('Google Login Error:', err);
  //     setError(err.message || 'Google login failed. Please try again.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setError('Please enter your email address first.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    triggerHaptic();
    setError(null);

    try {
      await AsyncStorage.setItem('resetEmail', resetEmail); // <-- save email
      const storedEmail = await AsyncStorage.getItem('resetEmail'); // <-- retrieve email

      if (storedEmail) {
        // simulate API success
        const sent = true;
        if (sent) {
          alert(
            `Password reset instructions have been sent to your email: ${storedEmail}`
          );
          setShowForgotPassword(false);
        }
      } else {
        alert('Failed to retrieve email from storage');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBackToMain} style={styles.backButton}>
        <ArrowLeft size={20} color="#FF6F00" />
        <Text style={styles.backButtonText}>
          {t('backToOptions', 'Back to options')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>{t('welcomeBack', 'Welcome Back')}</Text>
      <Text style={styles.subtitle}>
        {t('signInToContinue', 'Sign in to continue your spiritual journey')}
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>OTP</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color="#718096" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6 digit your OTP"
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color="#718096" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? (
                <EyeOff size={20} color="#718096" />
              ) : (
                <Eye size={20} color="#718096" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.loginButton,
            (isSubmitting || isLoading) && styles.loginButtonDisabled,
          ]}
          onPress={handleReset}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <Loader size={20} color="#FFFFFF" />
          ) : null}
          <Text style={styles.loginButtonText}>
            {isSubmitting ? 'Resetting...' : 'Reset'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>
          {t('orContinueWith', 'Or continue with')}
        </Text>
        <View style={styles.dividerLine} />
      </View>

      {/* <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleLogin}
        disabled={isSubmitting || isLoading}
      >
        {(isSubmitting || isLoading) ? (
          <Loader size={20} color="#4285F4" />
        ) : (
          <Text style={styles.googleIcon}>G</Text>
        )}
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity> */}

      <View style={styles.signupPrompt}>
        <Text style={styles.signupPromptText}>
          {t('dontHaveAccount', "Don't have an account? ")}{' '}
        </Text>
        <TouchableOpacity onPress={onSwitchToSignup}>
          <Text style={styles.signupLink}>
            {t('signUpHere', 'Sign up here')}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 32,
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#FF6F00',
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
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
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  eyeButton: {
    padding: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#FF6F00',
    fontWeight: '500',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#718096',
    paddingHorizontal: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    marginBottom: 32,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupPromptText: {
    fontSize: 14,
    color: '#718096',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6F00',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  modalConfirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF6F00',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  modalInput: { flex: 1, height: 40 },
});
