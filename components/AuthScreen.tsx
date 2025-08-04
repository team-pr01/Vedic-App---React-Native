import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, BookOpen, Users } from 'lucide-react-native';
import SignupPage from './SignupPage';
import LoginPage from './LoginPage';
import ResetPassword from './ResetPassword';

type AuthMode = 'main' | 'signup' | 'login' | 'resetPassword';

export default function AuthScreen({currentAuthMode}:{
  currentAuthMode: AuthMode,
}) {
  const [authMode, setAuthMode] = useState<AuthMode>(currentAuthMode || 'main');

  if (authMode === 'signup') {
    return (
      <SignupPage
        onSwitchToLogin={() => setAuthMode('login')}
        onBackToMain={() => setAuthMode('main')}
      />
    );
  }

  if (authMode === 'login') {
    return (
      <LoginPage
        onSwitchToSignup={() => setAuthMode('signup')}
        onBackToMain={() => setAuthMode('main')}
      />
    );
  }

  if (authMode === 'resetPassword') {
    return (
      <ResetPassword
        onSwitchToSignup={() => setAuthMode('login')}
        onBackToMain={() => setAuthMode('main')}
      />
    );
  }
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6F00', '#FF8F00']}
        style={styles.gradient}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(255, 111, 0, 0.9)']}
            style={styles.heroOverlay}
          >
            <View style={styles.heroContent}>
              <Star size={48} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.appTitle}>Vedic Wisdom</Text>
              <Text style={styles.appSubtitle}>বৈদিক জ্ঞান</Text>
              <Text style={styles.heroDescription}>
                Discover ancient wisdom, connect with sacred texts, and join a community of spiritual seekers.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.feature}>
            <BookOpen size={24} color="#FFFFFF" />
            <Text style={styles.featureText}>Sacred Texts & Mantras</Text>
          </View>
          <View style={styles.feature}>
            <Users size={24} color="#FFFFFF" />
            <Text style={styles.featureText}>Spiritual Community</Text>
          </View>
          <View style={styles.feature}>
            <Star size={24} color="#FFFFFF" />
            <Text style={styles.featureText}>Daily Wisdom</Text>
          </View>
        </View>

        {/* Auth Buttons */}
        <View style={styles.authButtons}>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => setAuthMode('signup')}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setAuthMode('login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  heroSection: {
    flex: 1,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 20,
    color: '#FFF7ED',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    color: '#FFF7ED',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  authButtons: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  signupButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6F00',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#FFF7ED',
    textAlign: 'center',
    lineHeight: 18,
  },
});