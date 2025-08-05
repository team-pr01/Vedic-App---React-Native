import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Button,
  Alert,
  Platform,
} from 'react-native';
import { useTranslate } from '@/hooks/useTranslate';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSignupMutation } from '@/redux/features/Auth/authApi';
import { router } from 'expo-router';
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowLeft,
  ArrowRight,
  Loader,
  CircleAlert as AlertCircle,
  CircleCheck as CheckCircle,
} from 'lucide-react-native';
type TFormData = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  country: string;
  state: string;
  city: string;
  area?: string;
}
type TInputFieldProps = {
  name: keyof TFormData;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  isRequired?: boolean;
}

type SignupPageProps = {
  onSwitchToLogin: () => void;
  onBackToMain: () => void;
};

export default function SignupPage({ onSwitchToLogin, onBackToMain }: SignupPageProps) {
 
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const {
    control,
    handleSubmit,
    trigger,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      country: '',
      state: '',
      city: '',
      area: '',
    },
  });

  const [signup, { isLoading }] = useSignupMutation();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleNextStep = async () => {
    const isStep1Valid = await trigger(["name", "email", "phoneNumber", "password"]);
    if (!isStep1Valid) {
      setError("Please fill all required fields correctly");
      return;
    }
    triggerHaptic();
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePrevStep = () => {
    triggerHaptic();
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: any) => {
    if (currentStep !== 2) return;

    try {
      const formData = new FormData();

      if (imageUrl) {
        const filename = imageUrl.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';

        formData.append('file', {
          uri: imageUrl,
          name: filename,
          type,
        } as any);
      }

      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      const response = await signup(formData).unwrap();
      console.log('Signup response:', response);
      if (response?.success) {
        router.replace({ pathname: '/auth', params: { mode: 'login' } });
      }
      Alert.alert('Sign up Success', 'You have successfully signed up. Please login to continue.');
      setIsSubmitting(true);
    } catch (err) {
      console.log(err);
    }
  };

  const InputField:React.FC<TInputFieldProps> = ({ name, label, placeholder, icon, secure = false, keyboardType = 'default', isRequired=false }) => (
    <Controller
      control={control}
      name={name}
      rules={isRequired ? { required: `${label} is required` } : {}}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{label}</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>{icon}</View>
            <TextInput
              style={styles.textInput}
              placeholder={placeholder}
              placeholderTextColor="#A0AEC0"
              secureTextEntry={secure}
              keyboardType={keyboardType}
              value={value}
              onChangeText={onChange}
            />
          </View>
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );

  const progressPercentage = ((currentStep - 1) / 2) * 100;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={currentStep === 1 ? onBackToMain : handlePrevStep} style={styles.backButton}>
        <ArrowLeft size={20} color="#FF6F00" />
        <Text style={styles.backButtonText}>
          {currentStep === 1 ? 'Back to options' : 'Previous Step'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Join our community to explore Vedic wisdom.</Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {currentStep === 1 && (
          <>
            <InputField
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              icon={<User size={20} color="#718096" />}
              isRequired={true}
            />
            <InputField
              name="email"
              label="Email Address"
              placeholder="you@example.com"
              icon={<Mail size={20} color="#718096" />}
              keyboardType="email-address"
              isRequired={true}
            />
            <InputField
              name="phoneNumber"
              label="Phone Number (with country code)"
              placeholder="+8801712345678"
              icon={<Phone size={20} color="#718096" />}
              keyboardType="phone-pad"
              isRequired={true}
            />
            <InputField
              name="password"
              label="Create Password"
              placeholder="••••••••"
              icon={<Lock size={20} color="#718096" />}
              secure
              isRequired={true}
            />
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>Select profile picture</Text>
              <Button title="Pick Image from Gallery" onPress={pickCoverImage} />
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: 200, height: 200, marginTop: 10, borderRadius: 8 }}
                />
              ) : null}
            </View>
          </>
        )}

        {currentStep === 2 && (
          <>
            <InputField name="country" label="Country" placeholder="India, Bangladesh" icon={<User size={20} color="#718096" />} isRequired={true}/>
            <InputField name="state" label="State/Province" placeholder="West Bengal, Dhaka" icon={<User size={20} color="#718096" />} isRequired={true} />
            <InputField name="city" label="City/Town" placeholder="Kolkata, Dhaka" icon={<User size={20} color="#718096" />} isRequired={true} />
            <InputField name="area" label="Village/Area (Optional)" placeholder="Shantiniketan, Mirpur" icon={<User size={20} color="#718096" />} />
          </>
        )}

        <View style={styles.buttonContainer}>
          {currentStep < 2 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
              <Text style={styles.nextButtonText}>Next</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
              {isSubmitting ? <Loader size={20} color="#FFFFFF" /> : <CheckCircle size={20} color="#FFFFFF" />}
              <Text style={styles.submitButtonText}>{isLoading ? 'Loading...' : 'Create Account'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.loginPrompt}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={styles.loginLink}>Login here</Text>
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
    paddingBottom: 40,
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
