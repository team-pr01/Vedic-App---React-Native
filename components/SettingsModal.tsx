import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import {
  X,
  Languages,
  Bell,
  Shield,
  Info,
  LogOut,
  User,
  Palette,
  Users,
  Search,
  ChevronRight,
  Crown,
  ShoppingBag,
  Moon,
  Sun,
} from 'lucide-react-native';
import ShopConfirmationModal from './ShopConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { useThemeColors } from '@/hooks/useThemeColors';
import { RootState } from '@/redux/store';
import { toggleTheme } from '@/redux/features/Theme/themeSlice';
import SubscriptionPage from './SubscriptionPage';
import * as Haptics from 'expo-haptics';
import { useGetMeQuery } from '@/redux/features/Auth/authApi';

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  // Top 100 World Languages
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'id', name: 'Bahasa Indonesia (Indonesian)' },
  { code: 'ur', name: 'اردو (Urdu)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'sw', name: 'Kiswahili (Swahili)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'tr', name: 'Türkçe (Turkish)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'it', name: 'Italiano (Italian)' },
  { code: 'th', name: 'ไทย (Thai)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'pl', name: 'Polski (Polish)' },
  { code: 'uk', name: 'Українська (Ukrainian)' },
  { code: 'fa', name: 'فارسی (Persian)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'as', name: 'অসমীয়া (Assamese)' },
  { code: 'ne', name: 'नेपाली (Nepali)' },
  { code: 'si', name: 'සිංහල (Sinhala)' },
  { code: 'my', name: 'မြန်မာ (Myanmar)' },
  { code: 'km', name: 'ខ្មែរ (Khmer)' },
  { code: 'lo', name: 'ລາວ (Lao)' },
  { code: 'ka', name: 'ქართული (Georgian)' },
  { code: 'am', name: 'አማርኛ (Amharic)' },
  { code: 'he', name: 'עברית (Hebrew)' },
  { code: 'fi', name: 'Suomi (Finnish)' },
  { code: 'hu', name: 'Magyar (Hungarian)' },
  { code: 'cs', name: 'Čeština (Czech)' },
  { code: 'sk', name: 'Slovenčina (Slovak)' },
  { code: 'bg', name: 'Български (Bulgarian)' },
  { code: 'hr', name: 'Hrvatski (Croatian)' },
  { code: 'sr', name: 'Српски (Serbian)' },
  { code: 'sl', name: 'Slovenščina (Slovenian)' },
  { code: 'et', name: 'Eesti (Estonian)' },
  { code: 'lv', name: 'Latviešu (Latvian)' },
  { code: 'lt', name: 'Lietuvių (Lithuanian)' },
  { code: 'ro', name: 'Română (Romanian)' },
  { code: 'nl', name: 'Nederlands (Dutch)' },
  { code: 'da', name: 'Dansk (Danish)' },
  { code: 'sv', name: 'Svenska (Swedish)' },
  { code: 'no', name: 'Norsk (Norwegian)' },
  { code: 'is', name: 'Íslenska (Icelandic)' },
  { code: 'ga', name: 'Gaeilge (Irish)' },
  { code: 'cy', name: 'Cymraeg (Welsh)' },
  { code: 'mt', name: 'Malti (Maltese)' },
  { code: 'sq', name: 'Shqip (Albanian)' },
  { code: 'mk', name: 'Македонски (Macedonian)' },
  { code: 'be', name: 'Беларуская (Belarusian)' },
  { code: 'az', name: 'Azərbaycan (Azerbaijani)' },
  { code: 'kk', name: 'Қазақ (Kazakh)' },
  { code: 'ky', name: 'Кыргыз (Kyrgyz)' },
  { code: 'uz', name: 'Oʻzbek (Uzbek)' },
  { code: 'tg', name: 'Тоҷикӣ (Tajik)' },
  { code: 'mn', name: 'Монгол (Mongolian)' },
  { code: 'bo', name: 'བོད་ཡིག (Tibetan)' },
  { code: 'dz', name: 'རྫོང་ཁ (Dzongkha)' },
  { code: 'ms', name: 'Bahasa Melayu (Malay)' },
  { code: 'tl', name: 'Filipino (Tagalog)' },
  { code: 'ceb', name: 'Cebuano' },
  { code: 'hil', name: 'Hiligaynon' },
  { code: 'war', name: 'Waray' },
  { code: 'bcl', name: 'Bikol' },
  { code: 'pam', name: 'Kapampangan' },
  { code: 'jv', name: 'Basa Jawa (Javanese)' },
  { code: 'su', name: 'Basa Sunda (Sundanese)' },
  { code: 'mad', name: 'Madhurâ (Madurese)' },
  { code: 'min', name: 'Baso Minangkabau (Minangkabau)' },
  { code: 'bug', name: 'ᨅᨔ ᨕᨘᨁᨗ (Buginese)' },
  { code: 'ban', name: 'ᬩᬲᬩᬮᬶ (Balinese)' },
  { code: 'ace', name: 'Bahsa Acèh (Acehnese)' },
  { code: 'bjn', name: 'Bahasa Banjar (Banjarese)' },
  { code: 'tet', name: 'Tetun (Tetum)' },
  { code: 'mg', name: 'Malagasy' },
  { code: 'ny', name: 'Chichewa' },
  { code: 'sn', name: 'ChiShona (Shona)' },
  { code: 'zu', name: 'isiZulu (Zulu)' },
  { code: 'xh', name: 'isiXhosa (Xhosa)' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'st', name: 'Sesotho (Southern Sotho)' },
  { code: 'nso', name: 'Sepedi (Northern Sotho)' },
  { code: 'tn', name: 'Setswana (Tswana)' },
  { code: 'ss', name: 'siSwati (Swazi)' },
  { code: 've', name: 'Tshivenḓa (Venda)' },
  { code: 'ts', name: 'Xitsonga (Tsonga)' },
  { code: 'nr', name: 'isiNdebele (Southern Ndebele)' },
  { code: 'ig', name: 'Asụsụ Igbo (Igbo)' },
  { code: 'yo', name: 'Yorùbá (Yoruba)' },
  { code: 'ha', name: 'Hausa' },
  { code: 'ff', name: 'Fulfulde (Fula)' },
  { code: 'wo', name: 'Wolof' },
  { code: 'bm', name: 'Bamanankan (Bambara)' },
  { code: 'ln', name: 'Lingála (Lingala)' },
  { code: 'kg', name: 'Kikongo (Kongo)' },
  { code: 'lua', name: 'Tshiluba (Luba-Kasai)' },
  { code: 'rw', name: 'Ikinyarwanda (Kinyarwanda)' },
  { code: 'rn', name: 'Ikirundi (Kirundi)' },
  { code: 'so', name: 'Af-Soomaali (Somali)' },
];

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function SettingsModal({
  visible,
  onClose,
  onLogout,
}: SettingsModalProps) {
  const dispatch = useDispatch();
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);
  const colors = useThemeColors();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [communityUpdates, setCommunityUpdates] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');
  const [showShopModal, setShowShopModal] = useState(false);
  const currentTheme = useSelector((state: RootState) => state.theme.theme);
  const {data:getMe,isLoading}=useGetMeQuery({})
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const isDarkMode = currentTheme === 'dark';
  const filteredLanguages = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(languageSearchTerm.toLowerCase()) ||
      lang.code.toLowerCase().includes(languageSearchTerm.toLowerCase())
  );
  console.log(getMe,"me")
   const triggerHaptic = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };
  
  const handleMembershipPress = () => {triggerHaptic();
    setShowUserProfileModal(true);
  };

  const handleToggleTheme = (value: boolean) => {
    dispatch(toggleTheme());
  };

  const SettingItem = ({
    icon,
    label,
    value,
    onPress,
    isToggle = false,
    toggleValue,
    onToggle,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    onPress?: () => void;
    isToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: (value: boolean) => void;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !isToggle}
    >
      <View style={styles.settingLeft}>
        {icon}
        <Text style={[styles.settingLabel, { color: colors.text }]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {value && (
          <Text style={[styles.settingValue, { color: colors.secondaryText }]}>
            {value}
          </Text>
        )}
        {isToggle && onToggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        )}
        {onPress && !isToggle && (
          <ChevronRight size={20} color={colors.secondaryText} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Settings
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* General Section */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: colors.secondaryText }]}
              >
                GENERAL
              </Text>
              <View
                style={[
                  styles.sectionContent,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.cardShadow,
                  },
                ]}
              >
                {/* <SettingItem
                  icon={<Languages size={20} color={colors.primary} />}
                  label="Language"
                  value={currentLanguage.name}
                  onPress={() => setShowLanguageModal(true)}
                /> */}
                <SettingItem
                  icon={
                    isDarkMode ? (
                      <Moon size={20} color={colors.primary} />
                    ) : (
                      <Sun size={20} color={colors.primary} />
                    )
                  }
                  label="Dark Mode"
                  isToggle={true}
                  toggleValue={isDarkMode}
                  onToggle={handleToggleTheme}
                />
                <SettingItem
                  icon={<ShoppingBag size={20} color={colors.primary} />}
                  label="Visit Our Shop"
                  onPress={() => setShowShopModal(true)}
                />
              </View>
            </View>

            {/* Membership Section */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: colors.secondaryText }]}
              >
                MEMBERSHIP
              </Text>
              <View
                style={[
                  styles.sectionContent,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.cardShadow,
                  },
                ]}
              >
                <SettingItem
                  icon={<Crown size={20} color="#FFD700" />}
                  label="Membership Plans"
                  value={getMe?.data?.plan}
                  onPress={handleMembershipPress}
                />
              </View>
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: colors.secondaryText }]}
              >
                NOTIFICATIONS
              </Text>
              <View
                style={[
                  styles.sectionContent,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.cardShadow,
                  },
                ]}
              >
                <SettingItem
                  icon={<Bell size={20} color={colors.primary} />}
                  label="Push Notifications"
                  isToggle={true}
                  toggleValue={pushNotifications}
                  onToggle={setPushNotifications}
                />
                <SettingItem
                  icon={<Users size={20} color={colors.primary} />}
                  label="Community Updates"
                  isToggle={true}
                  toggleValue={communityUpdates}
                  onToggle={setCommunityUpdates}
                />
              </View>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: colors.secondaryText }]}
              >
                ACCOUNT
              </Text>
              <View
                style={[
                  styles.sectionContent,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.cardShadow,
                  },
                ]}
              >
                <SettingItem
                  icon={<User size={20} color={colors.primary} />}
                  label="Manage Account"
                  onPress={() => alert('Manage Account page coming soon!')}
                />
                <SettingItem
                  icon={<Shield size={20} color={colors.primary} />}
                  label="Data & Privacy"
                  onPress={() => alert('Data & Privacy info coming soon!')}
                />
              </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: colors.secondaryText }]}
              >
                ABOUT
              </Text>
              <View
                style={[
                  styles.sectionContent,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.cardShadow,
                  },
                ]}
              >
                <SettingItem
                  icon={<Info size={20} color={colors.primary} />}
                  label="About Vedic Wisdom"
                  onPress={() => alert('Vedic Wisdom v1.0.0')}
                />
                <SettingItem
                  icon={<Info size={20} color={colors.primary} />}
                  label="Version"
                  value="1.0.0"
                />
              </View>
            </View>

            {/* Logout Button */}
            <View style={styles.logoutContainer}>
              <TouchableOpacity
                style={[
                  styles.logoutButton,
                  { backgroundColor: colors.error + '20' },
                ]}
                onPress={onLogout}
              >
                <LogOut size={20} color={colors.error} />
                <Text style={[styles.logoutText, { color: colors.error }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View
          style={[styles.languageModal, { backgroundColor: colors.background }]}
        >
          <View
            style={[
              styles.languageHeader,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.languageTitle, { color: colors.primary }]}>
              Select Language
            </Text>
            <TouchableOpacity
              onPress={() => setShowLanguageModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View
              style={[styles.searchBar, { backgroundColor: colors.background }]}
            >
              <Search size={16} color={colors.secondaryText} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search languages..."
                value={languageSearchTerm}
                onChangeText={setLanguageSearchTerm}
                placeholderTextColor={colors.secondaryText}
              />
            </View>
          </View>

          <ScrollView style={styles.languageList}>
            {filteredLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  currentLanguage.code === lang.code && [
                    styles.selectedLanguageItem,
                    { backgroundColor: colors.primary },
                  ],
                ]}
                onPress={() => {
                  setCurrentLanguage(lang);
                  setShowLanguageModal(false);
                  setLanguageSearchTerm('');
                }}
              >
                <Text
                  style={[
                    styles.languageItemText,
                    { color: colors.text },
                    currentLanguage.code === lang.code && [
                      styles.selectedLanguageText,
                      { color: '#FFFFFF' },
                    ],
                  ]}
                >
                  {lang.name}
                </Text>
                <Text
                  style={[styles.languageCode, { color: colors.secondaryText }]}
                >
                  ({lang.code})
                </Text>
              </TouchableOpacity>
            ))}
            {filteredLanguages.length === 0 && (
              <Text
                style={[styles.noResultsText, { color: colors.secondaryText }]}
              >
                No languages found matching "{languageSearchTerm}"
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Shop Confirmation Modal */}
      <ShopConfirmationModal
        isVisible={showShopModal}
        onClose={() => setShowShopModal(false)}
      />
      <SubscriptionPage
        visible={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
        onNavigateToSettings={() => setShowSettingsModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    maxWidth: 120,
  },
  logoutContainer: {
    paddingTop: 16,
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageModal: {
    flex: 1,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  languageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  languageList: {
    flex: 1,
    padding: 4,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 2,
    borderRadius: 8,
  },
  selectedLanguageItem: {
    backgroundColor: '#FF6F00',
  },
  languageItemText: {
    fontSize: 14,
  },
  selectedLanguageText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  languageCode: {
    fontSize: 12,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
});
