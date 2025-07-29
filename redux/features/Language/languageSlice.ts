// src/redux/features/Language/languageSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

// Define the interface for a single language object
export interface TLanguage {
  code: string;
  name: string;
}

// Define the shape of this slice's state
interface LanguageState {
  currentLanguage: TLanguage;
  allLanguages: TLanguage[];
  translations: Record<string, string>;
}

// --- ALL YOUR DATA, SAFELY STORED ---

// All available languages
export const allLanguages: TLanguage[] = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文 (Chinese)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'ar', name: 'العربية (Arabic)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'ru', name: 'Русский (Russian)' },
    // ... all other languages from your context file
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
    { code: 'sl', name:'Slovenščina (Slovenian)' },
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
    { code: 'so', name: 'Af-Soomaali (Somali)' }
];

// All translation strings
const translationStrings: Record<string, Record<string, string>> = {
  en: {
    createYourAccount: 'Create Your Account',
    joinVedicCommunity: 'Join our community to explore Vedic wisdom.',
    // ... all other 'en' translations from your context
    step: 'Step',
    of: 'of',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    emailLabel: 'Email Address',
    emailPlaceholder: 'you@example.com',
    countryLabel: 'Country',
    countryPlaceholder: 'e.g., India, Bangladesh',
    stateLabel: 'State/Province',
    statePlaceholder: 'e.g., West Bengal, Dhaka Division',
    cityLabel: 'City/Town',
    cityPlaceholder: 'e.g., Kolkata, Dhaka',
    villageLabel: 'Village/Area (Optional)',
    villagePlaceholder: 'e.g., Shantiniketan, Mirpur',
    phoneLabel: 'Phone Number (with country code)',
    phonePlaceholder: 'e.g., +8801712345678',
    dobLabel: 'Date of Birth',
    languageLabel: 'Preferred Language',
    createPasswordLabel: 'Create Password',
    confirmPasswordLabel: 'Confirm Password',
    nextButton: 'Next',
    createAccountAndVerify: 'Create Account & Verify',
    orSignupWith: 'Or sign up with',
    signupWithGoogleShort: 'Sign up with Google',
    alreadyHaveAccount: 'Already have an account?',
    loginLink: 'Login here',
    backToOptions: 'Back to options',
    previousStep: 'Previous Step',
    nameAndEmailRequired: 'Full Name and Email are required.',
    invalidEmailFormat: 'Please enter a valid email address.',
    passwordMinLength: 'Password must be at least 6 characters.',
    passwordsDoNotMatch: 'Passwords do not match.',
    fillRequiredFields: 'Please fill all required fields.',
    emailInUse: 'This email is already registered. Try logging in.',
    signupFailed: 'Signup failed. Please try again.',
    otpSendFailed: 'Failed to send OTP. Please try again.',
    googleSignUpFailed: 'Google Sign-Up failed. Please try again.',
    settingsTitle: 'Settings',
    languageSettingLabel: 'Language',
    themeSettingLabel: 'Theme',
    userProfileTitle: 'My Profile',
    joinedDateLabel: 'Joined',
    editProfileComingSoon: 'Edit Profile functionality coming soon!',
    editProfileButton: 'Edit Profile',
    activitySummaryTitle: 'Activity Summary',
    mantrasSavedLabel: 'Mantras Saved',
    quizzesTakenLabel: 'Quizzes Taken',
    articlesReadLabel: 'Articles Read',
    newsLikedLabel: 'News Liked',
    mantrasReportedLabel: 'Mantras Reported',
    totalActivitiesLabel: 'Total Activities',
    recipesGeneratedLabel: 'Recipes Generated',
    consultanciesHiredLabel: 'Consultancies Hired',
    accountAndAppSettingsTitle: 'Account & App',
    appSettingsButton: 'App Settings',
    appName: 'Vedic Wisdom'
  },
  bn: {
    createYourAccount: 'আপনার অ্যাকাউন্ট তৈরি করুন',
    joinVedicCommunity: 'বৈদিক জ্ঞান অন্বেষণের জন্য আমাদের সম্প্রদায়ে যোগ দিন।',
    // ... all other 'bn' translations from your context
    step: 'ধাপ',
    of: 'এর',
    fullNameLabel: 'পূর্ণ নাম',
    fullNamePlaceholder: 'আপনার পূর্ণ নাম লিখুন',
    emailLabel: 'ইমেইল ঠিকানা',
    emailPlaceholder: 'you@example.com',
    countryLabel: 'দেশ',
    countryPlaceholder: 'যেমন, ভারত, বাংলাদেশ',
    stateLabel: 'রাজ্য/প্রদেশ',
    statePlaceholder: 'যেমন, পশ্চিমবঙ্গ, ঢাকা বিভাগ',
    cityLabel: 'শহর/নগর',
    cityPlaceholder: 'যেমন, কলকাতা, ঢাকা',
    villageLabel: 'গ্রাম/এলাকা (ঐচ্ছিক)',
    villagePlaceholder: 'যেমন, শান্তিনিকেতন, মিরপুর',
    phoneLabel: 'ফোন নম্বর (দেশের কোড সহ)',
    phonePlaceholder: 'যেমন, +৮৮০১৭১২৩৪৫৬৭৮',
    dobLabel: 'জন্ম তারিখ',
    languageLabel: 'পছন্দের ভাষা',
    createPasswordLabel: 'পাসওয়ার্ড তৈরি করুন',
    confirmPasswordLabel: 'পাসওয়ার্ড নিশ্চিত করুন',
    nextButton: 'পরবর্তী',
    createAccountAndVerify: 'অ্যাকাউন্ট তৈরি ও যাচাই করুন',
    orSignupWith: 'অথবা সাইন আপ করুন',
    signupWithGoogleShort: 'Google দিয়ে সাইন আপ',
    alreadyHaveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    loginLink: 'এখানে লগইন করুন',
    backToOptions: 'বিকল্পে ফিরে যান',
    previousStep: 'পূর্ববর্তী ধাপ',
    nameAndEmailRequired: 'পূর্ণ নাম এবং ইমেইল প্রয়োজন।',
    invalidEmailFormat: 'দয়া করে একটি বৈধ ইমেইল ঠিকানা লিখুন।',
    passwordMinLength: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
    passwordsDoNotMatch: 'পাসওয়ার্ড মিলছে না।',
    fillRequiredFields: 'দয়া করে সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন।',
    emailInUse: 'এই ইমেইল ইতিমধ্যে নিবন্ধিত। লগইন করার চেষ্টা করুন।',
    signupFailed: 'সাইন আপ ব্যর্থ। আবার চেষ্টা করুন।',
    otpSendFailed: 'OTP পাঠাতে ব্যর্থ। আবার চেষ্টা করুন।',
    googleSignUpFailed: 'Google সাইন আপ ব্যর্থ। আবার চেষ্টা করুন।',
    settingsTitle: 'সেটিংস',
    languageSettingLabel: 'ভাষা',
    themeSettingLabel: 'থিম',
    userProfileTitle: 'আমার প্রোফাইল',
    joinedDateLabel: 'যোগদান',
    editProfileComingSoon: 'প্রোফাইল সম্পাদনা শীঘ্রই আসছে!',
    editProfileButton: 'প্রোফাইল সম্পাদনা',
    activitySummaryTitle: 'কার্যকলাপের সারসংক্ষেপ',
    mantrasSavedLabel: 'সংরক্ষিত মন্ত্র',
    quizzesTakenLabel: 'গৃহীত কুইজ',
    articlesReadLabel: 'পঠিত নিবন্ধ',
    newsLikedLabel: 'পছন্দের সংবাদ',
    mantrasReportedLabel: 'রিপোর্ট করা মন্ত্র',

    totalActivitiesLabel: 'মোট কার্যকলাপ',
    recipesGeneratedLabel: 'তৈরি রেসিপি',
    consultanciesHiredLabel: 'নিয়োগকৃত পরামর্শ',
    accountAndAppSettingsTitle: 'অ্যাকাউন্ট ও অ্যাপ',
    appSettingsButton: 'অ্যাপ সেটিংস',
    appName: 'বৈদিক জ্ঞান'
  }
};

// Set the initial state for the slice
const initialState: LanguageState = {
  currentLanguage: allLanguages[6], // Default to Bengali (index 6)
  allLanguages: allLanguages,
  translations: translationStrings.bn, // Default to Bengali translations
};

// Create the slice
export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    // This action will be dispatched to change the language
    setLanguage: (state, action: PayloadAction<TLanguage>) => {
      state.currentLanguage = action.payload;
      // When the language changes, update the active translations
      state.translations = translationStrings[action.payload.code] || translationStrings.en;
    },
  },
});

// Export the action creator
export const { setLanguage } = languageSlice.actions;

// Export the reducer to be added to the store
export default languageSlice.reducer;