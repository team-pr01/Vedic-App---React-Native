import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Image,
  Button,
} from 'react-native';
import { useTranslate } from '@/hooks/useTranslate';
import { allLanguages } from '@/redux/features/Language/languageSlice';
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  Globe,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Loader,
  CircleAlert as AlertCircle,
  CircleCheck as CheckCircle,
} from 'lucide-react-native';
import OtpVerificationPage from './OtpVerificationPage';
import * as Haptics from 'expo-haptics';
import { useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { useSignupMutation } from '@/redux/features/Auth/authApi';
import { router } from 'expo-router';

type SignupStep = 1 | 2 | 3 | 4 | 5; // 5 is OTP

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onBackToMain: () => void;
}

export default function SignupPage({
  onSwitchToLogin,
  onBackToMain,
}: SignupPageProps) {
  const t = useTranslate();
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<any>({});

  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    state: '',
    city: '',
    area: '',
    phoneNumber: '',
    dob: '',
    password: '',
  });

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    triggerHaptic();
    setError(null);

    if (
      currentStep === 1 &&
      (!formData.name?.trim() || !formData.email?.trim())
    ) {
      setError(t('nameAndEmailRequired', 'Full Name and Email are required.'));
      return;
    }
    if (
      currentStep === 1 &&
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      setError(t('invalidEmailFormat', 'Please enter a valid email address.'));
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError(
        t('passwordMinLength', 'Password must be at least 6 characters.')
      );
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 2) as SignupStep);
  };

  const handlePrevStep = () => {
    triggerHaptic();
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1) as SignupStep);
  };

  const pickCoverImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
  
      if (!result.canceled && result.assets?.[0]?.uri) {
        setValue('imageUrl', result.assets[0].uri); // save picked image URI in form
      }
    };

  const [signup, {isLoading}] = useSignupMutation();

  const handleSignup = async (data: any) => {
    console.log(formData, 'form data');
    try {
      if (currentStep !== 2) return;

      if (!formData.email || !formData.password || !formData.name) {
        setError(t('fillRequiredFields', 'Please fill all required fields.'));
        return;
      }

      const signupFormData = new FormData();

      const imageUri = watch('imageUrl') || data.imageUrl;
      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';

        signupFormData.append('file', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      signupFormData.append('name', formData.name);
      signupFormData.append('email', formData.email);
      signupFormData.append('password', formData.password);
      signupFormData.append('country', formData.country);
      signupFormData.append('state', formData.state);
      signupFormData.append('city', formData.city);
      signupFormData.append('area', formData.area);
      signupFormData.append('phoneNumber', formData.phoneNumber);

      const response = await signup(signupFormData).unwrap();
      console.log(response, 'response');
      if(response?.success){
        router.replace("/auth")
      }

      setIsSubmitting(true);
      setError(null);
    } catch (err) {
      console.log(err);
    }
  };

  const InputField = ({
    name,
    type,
    label,
    placeholder,
    icon,
    required = false,
    value,
    onChangeText,
  }: {
    name: string;
    type: string;
    label: string;
    placeholder?: string;
    icon: React.ReactNode;
    required?: boolean;
    value: string | undefined;
    onChangeText: (text: string) => void;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>{icon}</View>
        <TextInput
          style={styles.textInput}
          value={value || ''}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          secureTextEntry={type === 'password'}
          keyboardType={
            type === 'email'
              ? 'email-address'
              : type === 'tel'
              ? 'phone-pad'
              : 'default'
          }
        />
      </View>
    </View>
  );

  const progressPercentage = ((currentStep - 1) / 2) * 100;

  // if (currentStep === 5) {
  //   return (
  //     <OtpVerificationPage
  //       email={formData.email || ''}
  //       onOtpVerified={() => {}}
  //       onBack={() => setCurrentStep(4)}
  //     />
  //   );
  // }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={currentStep === 1 ? onBackToMain : handlePrevStep}
        style={styles.backButton}
      >
        <ArrowLeft size={20} color="#FF6F00" />
        <Text style={styles.backButtonText}>
          {t(
            currentStep === 1 ? 'backToOptions' : 'previousStep',
            currentStep === 1 ? 'Back to options' : 'Previous Step'
          )}
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {t('createYourAccount', 'Create Your Account')}
      </Text>
      <Text style={styles.subtitle}>
        {t('joinVedicCommunity', 'Join our community to explore Vedic wisdom.')}
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {t('step', 'Step')} {currentStep} {t('of', 'of')} 2
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && (
          <>
            <InputField
              name="name"
              type="text"
              label={t('fullNameLabel', 'Full Name')}
              placeholder={t('fullNamePlaceholder', 'Enter your full name')}
              icon={<User size={20} color="#718096" />}
              required
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
            />
            <InputField
              name="email"
              type="email"
              label={t('emailLabel', 'Email Address')}
              placeholder={t('emailPlaceholder', 'you@example.com')}
              icon={<Mail size={20} color="#718096" />}
              required
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
            />
            <InputField
              name="phoneNumber"
              type="tel"
              label={t('phoneLabel', 'Phone Number (with country code)')}
              placeholder={t('phonePlaceholder', 'e.g., +8801712345678')}
              icon={<Phone size={20} color="#718096" />}
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange('phoneNumber', text)}
            />
            <InputField
              name="password"
              type="password"
              label={t('createPasswordLabel', 'Create Password')}
              placeholder="••••••••"
              icon={<Lock size={20} color="#718096" />}
              required
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
            />
            <View style={{ marginBottom: 16, position: 'relative' }}>
              <Text style={styles.label}>Select profile picture</Text>
              <Button
                title="Pick Image from Gallery"
                onPress={pickCoverImage}
              />

              {watch('imageUrl') && (
                <Image
                  source={{ uri: watch('imageUrl') }}
                  style={{
                    width: 200,
                    height: 200,
                    marginTop: 10,
                    borderRadius: 8,
                  }}
                />
              )}

              {watch('imageUrl') && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setValue('imageUrl', '')}
                >
                  <Text style={[styles.removeText, { color: '#FF0000' }]}>
                    ×
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {currentStep === 2 && (
          <>
            <InputField
              name="country"
              type="text"
              label={t('countryLabel', 'Country')}
              placeholder={t('countryPlaceholder', 'e.g., India, Bangladesh')}
              icon={<Globe size={20} color="#718096" />}
              value={formData.country}
              onChangeText={(text) => handleChange('country', text)}
            />
            <InputField
              name="state"
              type="text"
              label={t('stateLabel', 'State/Province')}
              placeholder={t(
                'statePlaceholder',
                'e.g., West Bengal, Dhaka Division'
              )}
              icon={<MapPin size={20} color="#718096" />}
              value={formData.state}
              onChangeText={(text) => handleChange('state', text)}
            />
            <InputField
              name="city"
              type="text"
              label={t('cityLabel', 'City/Town')}
              placeholder={t('cityPlaceholder', 'e.g., Kolkata, Dhaka')}
              icon={<MapPin size={20} color="#718096" />}
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
            />
            <InputField
              name="area"
              type="text"
              label={t('villageLabel', 'Village/Area (Optional)')}
              placeholder={t(
                'villagePlaceholder',
                'e.g., Shantiniketan, Mirpur'
              )}
              icon={<MapPin size={20} color="#718096" />}
              value={formData.area}
              onChangeText={(text) => handleChange('area', text)}
            />
          </>
        )}

        <View style={styles.buttonContainer}>
          {currentStep < 2 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextStep}
              // disabled={isLoadingAuth}
            >
              <Text style={styles.nextButtonText}>
                {t('nextButton', 'Next')}
              </Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit(handleSignup)}
              // disabled={isSubmitting || isLoadingAuth}
            >
              {isSubmitting ? (
                <Loader size={20} color="#FFFFFF" />
              ) : (
                <CheckCircle size={20} color="#FFFFFF" />
              )}
              <Text style={styles.submitButtonText}>
                {isLoading ? "Loading..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>
          {t('orSignupWith', 'Or sign up with')}
        </Text>
        <View style={styles.dividerLine} />
      </View>

      {/* <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignup}
        disabled={isSubmitting || isLoadingAuth}
      >
        {(isSubmitting || isLoadingAuth) ? (
          <Loader size={20} color="#4285F4" />
        ) : (
          <Text style={styles.googleIcon}>G</Text>
        )}
        <Text style={styles.googleButtonText}>
          {t('signupWithGoogleShort', 'Sign up with Google')}
        </Text>
      </TouchableOpacity> */}

      <View style={styles.loginPrompt}>
        <Text style={styles.loginPromptText}>
          {t('alreadyHaveAccount', 'Already have an account?')}{' '}
        </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={styles.loginLink}>{t('loginLink', 'Login here')}</Text>
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
    marginBottom: 20,
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#FF6F00',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6F00',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#718096',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6F00',
    borderRadius: 2,
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
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
  },
  formContainer: {
    flex: 1,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
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
  selectContainer: {
    flex: 1,
  },
  selectText: {
    fontSize: 16,
    color: '#2D3748',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
    marginBottom: 20,
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
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#718096',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6F00',
  },
   label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  remove: {
    position: 'absolute',
    top: 0,
    right: 8,
  },
  removeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  removeButton: {
    position: 'absolute',
    top: 70,
    right: 140,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
