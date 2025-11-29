import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CircleAlert as AlertCircle,
  Chrome as Home,
  TriangleAlert as AlertTriangle,
  ChevronDown,
  BookOpen,
  Languages,
  ChevronRight,
  Flag,
  Loader,
  ChevronLeft,
  Search,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';

import { useThemeColors } from '@/hooks/useThemeColors';
import {
  useGetSingleBookQuery,
  useGetSingleVedaQuery,
} from '@/redux/features/Book/bookApi';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import { useTranslateShlokaMutation } from '@/redux/features/AI/aiApi';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import AppHeader from '@/components/Reusable/AppHeader/AppHeader';
import ReportModal from '@/components/ReportModal';
import { ReportSubmission } from '@/types';
import { allLanguages } from '@/redux/features/Language/languageSlice';
import SkeletonLoader from '@/components/Reusable/SkeletonLoader';

function VedaReaderContent() {
  const { vedaId, textName } = useLocalSearchParams<{
    vedaId: string;
    textName: string;
  }>();
  const colors = useThemeColors();
  const { data: veda, isLoading: isVedaLoading } =
    useGetSingleBookQuery(vedaId);

  // extract levels once book is loaded
  const leve1 = veda?.data?.[0]?.location?.[0]?.levelName;
  const leve2 = veda?.data?.[0]?.location?.[1]?.levelName;
  const leve3 = veda?.data?.[0]?.location?.[2]?.levelName;

  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [showSubsectionDropdown, setShowSubsectionDropdown] = useState(false);
  const [showVerseDropdown, setShowVerseDropdown] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');
  const [targetLanguage, setTargetLanguage] = useState({
    name: 'select language',
    code: 'en',
  });
  const [currentTranslation, setCurrentTranslation] = useState();
  // selected values
  const [currentSection, setCurrentSection] = useState<string | null>(
    veda?.data?.[0]?.location?.[0]?.value
  );
  const [currentSubSection, setCurrentSubSection] = useState<string | null>(
    veda?.data?.[0]?.location?.[1]?.value
  );
  const [currentVerse, setCurrentVerse] = useState<string | null>(
    veda?.data?.[0]?.location?.[2]?.value
  );

  const [level1Values, setLevel1Values] = useState<string[]>([]);
  const [level2Values, setLevel2Values] = useState<string[]>([]);
  const [level3Values, setLevel3Values] = useState<string[]>([]);
  const [flattenedVerses, setFlattenedVerses] = useState<
    { locationKey: string; levels: string[] }[]
  >([]);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingVerse, setReportingVerse] = useState(null);
  useEffect(() => {
    if (veda?.data?.length) {
      // 1️⃣ Flatten and normalize all locations
      const all = veda?.data?.map((item: any) => {
        const levels = item?.location?.map((l: any) => l?.value).filter(Boolean);
        return {
          locationKey: levels?.join('.'), // e.g., "1.2" or "1.2.3"
          levels,
        };
      });

      // 2️⃣ Sort numerically level-by-level
      all.sort((a, b) => {
        const aParts = a.levels.map(Number);
        const bParts = b.levels.map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);
          if (diff !== 0) return diff;
        }
        return 0;
      });

      setFlattenedVerses(all);
    }
  }, [veda]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(-1);

  useEffect(() => {
    if (!flattenedVerses.length) return;

    const currentKey = [currentSection, currentSubSection, currentVerse]
      .filter(Boolean)
      .join('.'); 

    const idx = flattenedVerses.findIndex((v) => v.locationKey === currentKey);
    setCurrentVerseIndex(idx);
  }, [flattenedVerses, currentSection, currentSubSection, currentVerse]);

  const navigateVerse = (direction: 'next' | 'previous') => {
    if (!flattenedVerses.length) return;

    const newIndex =
      direction === 'next' ? currentVerseIndex + 1 : currentVerseIndex - 1;

    if (newIndex < 0 || newIndex >= flattenedVerses.length) return;

    const next = flattenedVerses[newIndex];

    // Reset state levels dynamically based on available depth
    setCurrentSection(next.levels[0]);
    setCurrentSubSection(next.levels[1] || null);
    setCurrentVerse(next.levels[2] || null);
  };

  useEffect(() => {
    if (veda?.data) {
      const l1Values = [
        ...new Set(
          veda.data
            .map((item: any) => item.location?.[0]?.value)
            .filter(Boolean)
        ),
      ] as string[];

      setLevel1Values(l1Values);

      // Auto-select the first section (optional)
      if (l1Values.length > 0 && !currentSection) {
        setCurrentSection(l1Values[0]);
      }

      // Reset deeper levels
      // setCurrentSubSection(null);
      // setCurrentVerse(null);
      setLevel2Values([]);
      setLevel3Values([]);
    }
  }, [veda]);

  useEffect(() => {
    if (currentSection && veda?.data) {
      const l2Values = [
        ...new Set(
          veda.data
            .filter((item: any) => item.location?.[0]?.value === currentSection)
            .map((item: any) => item.location?.[1]?.value)
            .filter(Boolean)
        ),
      ] as string[];

      setLevel2Values(l2Values);

      // Auto-select first subsection (optional)
      if (l2Values.length > 0 && !currentSubSection) {
        setCurrentSubSection(l2Values[0]);
      }

      // Reset level 3
      setLevel3Values([]);
      // setCurrentVerse(null);
    }
  }, [currentSection, veda]);

  useEffect(() => {
    if (currentSubSection && veda?.data) {
      const l3Values = [
        ...new Set(
          veda.data
            .filter(
              (item: any) =>
                item.location?.[0]?.value === currentSection &&
                item.location?.[1]?.value === currentSubSection
            )
            .map((item: any) => item.location?.[2]?.value)
            .filter(Boolean)
        ),
      ] as string[];

      setLevel3Values(l3Values);

      // Auto-select first verse (optional)
      if (l3Values.length > 0 && !currentVerse) {
        setCurrentVerse(l3Values[0]);
      }
    }
  }, [currentSubSection, currentSection, veda]);
  useEffect(() => {
    if (!veda) return;

    const hasThreeLevels = Boolean(leve3);
    const shouldCall =
      (hasThreeLevels && currentSection && currentSubSection && currentVerse) ||
      (!hasThreeLevels && currentSection && currentSubSection);

    if (shouldCall) {
      const p: any = {
        id: vedaId,
        field1: leve1,
        field1Value: currentSection,
        field2: leve2,
        field2Value: currentSubSection,
      };

      if (hasThreeLevels) {
        p.field3 = leve3;
        p.field3Value = currentVerse;
      }

      setPayload(p);
    }
  }, [
    veda,
    leve1,
    leve2,
    leve3,
    currentSection,
    currentSubSection,
    currentVerse,
    vedaId,
  ]);
  const [payload, setPayload] = useState<any | null>(null);
  const { data: CurrentVeda, isLoading } = useGetSingleVedaQuery(payload!, {
    skip: !payload,
  });
  const [verseData, setVerseData] = useState<any>(null);
  useEffect(() => {
    const current = CurrentVeda?.data?.[0];
    if (!current) return;

    setVerseData(current);

    const availableTranslationLanguageCodes =
      current?.translations?.map((t) => t.langCode?.toLowerCase()) || [];

    // Only call if translation exists for target language
    if (
      availableTranslationLanguageCodes.includes(
        targetLanguage.code.toLowerCase()
      )
    )
      getTranslationByLang(targetLanguage.code);
  }, [CurrentVeda, targetLanguage, veda]);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  const getTranslationByLang = (langCode) => {
    const showTranslation =
      verseData?.translations?.find((t) => t.langCode === langCode)
        ?.translation || 'Translation not available';
    setCurrentTranslation(showTranslation);
  };
  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setReportingVerse(null);
  };
  const handleOpenReportModal = (verse) => {
    triggerHaptic();
    setReportingVerse(verse);
    setIsReportModalOpen(true);
  };
  const availableLanguageCodes = useMemo<string[]>(() => {
    if (!allLanguages || !CurrentVeda?.data?.[0]) return [];

    const availableTranslationLanguageCodes =
      CurrentVeda.data[0]?.translations?.map((t) => t.langCode.toLowerCase());

    // Return an array of language codes (strings) that are available in translations
    return allLanguages
      .map((lang) => lang.code.toLowerCase())
      .filter((code) => availableTranslationLanguageCodes.includes(code));
  }, [allLanguages, CurrentVeda]);

  const filteredLanguages = useMemo(() => {
    return allLanguages.filter(
      (lang) =>
        availableLanguageCodes.includes(lang.code.toLowerCase()) &&
        lang.name.toLowerCase().includes(languageSearchTerm.toLowerCase())
    );
  }, [allLanguages, availableLanguageCodes, languageSearchTerm]);
 

  if (isVedaLoading) {
    return <LoadingComponent loading="Vedic Text..." color={colors.primary} />;
  }

  if (!veda) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Veda not found
          </Text>
          <Text style={[styles.errorText, { color: colors.secondaryText }]}>
            The requested Vedic text could not be found.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <Header />
        <AppHeader title={textName} colors={['#FF6F00', '#FF8F00']} />
      </SafeAreaView>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.selectorsContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.selectorRow}>
            <Text style={[styles.selectorLabel, { color: colors.text }]}>
              {veda?.data[0]?.location[0]?.levelName}
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => {
                triggerHaptic();
                setShowSectionDropdown(!showSectionDropdown);
                setShowSubsectionDropdown(false);
                setShowVerseDropdown(false);
              }}
            >
              <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
                <Text
                  style={[styles.dropdownButtonText, { color: colors.text }]}
                >
                  {currentSection ||
                    `Select ${
                      veda?.data[0]?.location?.[1]?.levelName || 'Section'
                    }`}
                </Text>
              </Text>
              <ChevronDown size={20} color={colors.secondaryText} />
            </TouchableOpacity>

            {showSectionDropdown && (
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.cardShadow,
                  },
                ]}
              >
                <ScrollView
                  style={styles.dropdownScrollView}
                  nestedScrollEnabled={true}
                >
                  {level1Values.map((section, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        padding: 12,
                        borderBottomWidth:
                          index !== level1Values.length - 1 ? 1 : 0,
                        borderBottomColor: colors.border,
                        backgroundColor:
                          currentSection === section
                            ? colors.primary + '20'
                            : colors.card,
                      }}
                      onPress={() => {
                        setCurrentSection(section);
                        setShowSectionDropdown(false);
                        setShowSectionDropdown(false);
                        triggerHaptic();
                      }}
                    >
                      <Text
                        style={{
                          color:
                            currentSection === section
                              ? colors.primary
                              : colors.text,
                        }}
                      >
                        {section}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Subsection Dropdown */}
          {currentSection && veda?.data[0]?.location[1]?.levelName && (
            <View style={styles.selectorRow}>
              <Text style={[styles.selectorLabel, { color: colors.text }]}>
                {veda?.data?.[0]?.location?.[1]?.levelName || 'Subsection'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => {
                  triggerHaptic();
                  setShowSubsectionDropdown(!showSubsectionDropdown);
                  setShowSectionDropdown(false);
                  setShowSectionDropdown(false);
                  setShowVerseDropdown(false);
                }}
              >
                <Text
                  style={[styles.dropdownButtonText, { color: colors.text }]}
                >
                  {currentSubSection ||
                    `Select ${
                      veda?.data?.[0]?.location?.[1]?.levelName || 'Subsection'
                    }`}
                </Text>
                <ChevronDown size={20} color={colors.secondaryText} />
              </TouchableOpacity>

              {showSubsectionDropdown && (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      shadowColor: colors.cardShadow,
                    },
                  ]}
                >
                  <ScrollView
                    style={styles.dropdownScrollView}
                    nestedScrollEnabled={true}
                  >
                    {level2Values.map((subsectionValue) => (
                      <TouchableOpacity
                        key={subsectionValue}
                        style={[
                          styles.dropdownItem,
                          { borderBottomColor: colors.border },
                          currentSubSection === subsectionValue && [
                            styles.dropdownItemActive,
                            { backgroundColor: colors.primary + '20' },
                          ],
                        ]}
                        onPress={() => {
                          setCurrentSubSection(subsectionValue);
                          setShowSubsectionDropdown(false);
                          triggerHaptic();
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            { color: colors.text },
                            currentSubSection === subsectionValue && [
                              styles.dropdownItemTextActive,
                              { color: colors.primary },
                            ],
                          ]}
                        >
                          {subsectionValue}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Verse Dropdown */}
          {currentSubSection && veda?.data[0]?.location[2]?.levelName && (
            <View style={styles.selectorRow}>
              <Text style={[styles.selectorLabel, { color: colors.text }]}>
                {veda?.data?.[0]?.location?.[2]?.levelName || 'Verse'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => {
                  triggerHaptic();
                  setShowVerseDropdown(!showVerseDropdown);
                  setShowSectionDropdown(false);
                  setShowSectionDropdown(false);
                  setShowSubsectionDropdown(false);
                }}
              >
                <Text
                  style={[styles.dropdownButtonText, { color: colors.text }]}
                >
                  {currentVerse ||
                    `Select ${
                      veda?.data?.[0]?.location?.[2]?.levelName || 'Verse'
                    }`}
                </Text>
                <ChevronDown size={20} color={colors.secondaryText} />
              </TouchableOpacity>

              {showVerseDropdown && (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      shadowColor: colors.cardShadow,
                    },
                  ]}
                >
                  <ScrollView
                    style={styles.dropdownScrollView}
                    nestedScrollEnabled={true}
                  >
                    {level3Values.map((verseValue) => (
                      <TouchableOpacity
                        key={verseValue}
                        style={[
                          styles.dropdownItem,
                          { borderBottomColor: colors.border },
                          currentVerse === verseValue && [
                            styles.dropdownItemActive,
                            { backgroundColor: colors.primary + '20' },
                          ],
                        ]}
                        onPress={() => {
                          setCurrentVerse(verseValue);
                          setShowVerseDropdown(false);
                          triggerHaptic();
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            { color: colors.text },
                            currentVerse === verseValue && [
                              styles.dropdownItemTextActive,
                              { color: colors.primary },
                            ],
                          ]}
                        >
                          {verseValue}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>
        {isVedaLoading  ||isLoading? (
          <View>
            <SkeletonLoader
            array={[1]}
                     direction='column'
                    height={280}
                    width={'100%'}
                    innerSkeleton={
                      <View
                        style={{
                          padding: 15,
                          justifyContent: 'space-between',
                          flex: 1,
                        }}
                      >
                        <View style={{justifyContent: "center",}}>
                          <View
                            style={{
                              width: '100%',
                              height: 26,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 8,
                              marginBottom: 8,
                            }}
                          />
                          <View
                            style={{
                              width: '80%',
                              height: 26,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 8,
                              marginBottom: 8,
                            }}
                          />
                          <View
                            style={{
                              width: '90%',
                              height: 26,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 8,
                              marginBottom: 18,
                            }}
                          />
                          <View style={{ flexDirection: 'row', gap: 6 ,justifyContent:"space-between"}}>
                            <View
                              style={{
                                width: '30%',
                                height: 43,
                                backgroundColor: '#e0e0e0',
                                borderRadius: 32,
                              }}
                            />
                            <View
                              style={{
                                width: 43,
                                height: 43,
                                backgroundColor: '#e0e0e0',
                                borderRadius: 43,
                              }}
                            />
                          </View>
                        </View>

                        <View
                          style={{
                            width: '100%',
                            height: 16,
                            backgroundColor: '#d6d6d6',
                            borderRadius: 8,
                            marginTop: 10,
                          }}
                        />
                        <View
                          style={{
                            width: '100%',
                            height: 16,
                            backgroundColor: '#d6d6d6',
                            borderRadius: 8,
                            marginTop: 10,
                          }}
                        />
                        <View
                          style={{
                            width: '100%',
                            height: 16,
                            backgroundColor: '#d6d6d6',
                            borderRadius: 8,
                            marginTop: 10,
                          }}
                        />
                      </View>
                    }
                  />
          </View>
        ) : verseData ? (
          <View
            style={[
              styles.verseContainer,
              { backgroundColor: colors.card, shadowColor: colors.cardShadow },
            ]}
          >
            <View style={styles.sanskritContainer}>
              {/* Handle originalText (string) safely */}
              {verseData?.originalText &&
                verseData.originalText
                  .split('।') // split by danda for readability, optional
                  .filter((line) => line.trim() !== '')
                  .map((line, index) => (
                    <Text
                      key={`orig-${index}`}
                      style={[styles.sanskritText, { color: colors.text }]}
                    >
                      {line.trim()}।
                    </Text>
                  ))}
            </View>
            <View style={styles.translationControls}>
              <TouchableOpacity
                style={styles.languageButton}
                onPress={() => setShowLanguageModal(true)}
              >
                <Languages size={16} color="#FFFFFF" />
                <Text style={styles.languageButtonText}>
                  to: {targetLanguage.name}
                </Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => handleOpenReportModal(verseData)}
              >
                <Flag size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
            {}
            {currentTranslation && (
              <View
                style={[
                  styles.translationContainer,
                  { borderTopColor: colors.border },
                ]}
              >
                <View style={styles.translationHeader}>
                  <Text
                    style={[
                      styles.translationLabel,
                      { color: colors.secondaryText },
                    ]}
                  >
                    Translation by AI
                  </Text>
                  {verseData?.isHumanVerified && (
                    <View
                      style={[
                        styles.verifiedBadge,
                        { backgroundColor: colors.success + '20' },
                      ]}
                    >
                      <Text
                        style={[styles.verifiedText, { color: colors.success }]}
                      >
                        Human Verified
                      </Text>
                    </View>
                  )}
                </View>

                {/* {currentTranslation.pada && (
                          <View style={styles.translationSection}>
                            <Text
                              style={[
                                styles.translationSectionTitle,
                                { color: colors.primary },
                              ]}
                            >
                              {t('padaLabel', 'पद (Key Terms/Word Meanings)')}
                            </Text>
                            <Text
                              style={[styles.translationText, { color: colors.text }]}
                            >
                              {currentTranslation.pada}
                            </Text>
                          </View>
                        )}
        
                        {currentTranslation.padartha && (
                          <View style={styles.translationSection}>
                            <Text
                              style={[
                                styles.translationSectionTitle,
                                { color: colors.primary },
                              ]}
                            >
                              {t('padarthaLabel', 'पदार्थ (Phrase Analysis)')}
                            </Text>
                            <Text
                              style={[styles.translationText, { color: colors.text }]}
                            >
                              {currentTranslation.padartha}
                            </Text>
                          </View>
                        )} */}

                {currentTranslation !=currentTranslation && (
                  <View style={styles.translationSection}>
                    <Text
                      style={[
                        styles.translationSectionTitle,
                        { color: colors.primary },
                      ]}
                    >
                      {`भावार्थ (Purport/Essence)`}
                    </Text>
                    <Text
                      style={[styles.translationText, { color: colors.text }]}
                    >
                   
                    </Text>
                  </View>
                )}
                <View style={styles.translationSection}>
                  <Text
                    style={[styles.translationText, { color: colors.text }]}
                  >
                    {currentTranslation}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[
                  [styles.navButton, { backgroundColor: colors.background }],
                  currentVerseIndex <= 0 && styles.navButtonDisabled,
                ]}
                onPress={() => navigateVerse('previous')}
                disabled={currentVerseIndex <= 0}
              >
                <ChevronLeft
                  size={16}
                  color={
                    currentVerseIndex <= 0
                      ? colors.border
                      : colors.secondaryText
                  }
                />
                <Text
                  style={[
                    [styles.navButtonText, { color: colors.secondaryText }],
                    currentVerseIndex <= 0 && styles.navButtonTextDisabled,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <Text style={[styles.verseNumber, { color: colors.text }]}>
                {currentSection}.{currentSubSection}
                {currentVerse && `.${currentVerse}`}
              </Text>

              <TouchableOpacity
                style={[
                  [styles.navButton, { backgroundColor: colors.primary }],
                  currentVerseIndex >= flattenedVerses.length - 1 &&
                    styles.navButtonDisabled,
                ]}
                onPress={() => navigateVerse('next')}
                disabled={currentVerseIndex >= flattenedVerses.length}
              >
                <Text
                  style={[
                    styles.navButtonTextPrimary,
                    currentVerseIndex >= flattenedVerses.length - 1 &&
                      styles.navButtonTextDisabled,
                  ]}
                >
                  Next
                </Text>
                <ChevronRight
                  size={16}
                  color={
                    currentVerseIndex >= flattenedVerses.length - 1
                      ? colors.border
                      : '#FFFFFF'
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <BookOpen size={48} color="#CBD5E0" />
            <Text style={[styles.emptyTitle, { color: colors.secondaryText }]}>
              {veda?.sections?.length > 0
                ? 'Select a section, subsection, and verse to display.'
                : 'No content available for this Vedic text yet.'}
            </Text>
          </View>
        )}
      </ScrollView>
      {/* Language Selection Modal */}
      {showLanguageModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: colors.card, shadowColor: colors.cardShadow },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                Select Translation Language
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.searchContainer,
                { backgroundColor: colors.background },
              ]}
            >
              <Search
                size={16}
                color={colors.secondaryText}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search languages..."
                value={languageSearchTerm}
                onChangeText={setLanguageSearchTerm}
                placeholderTextColor={colors.secondaryText}
              />
            </View>

            <ScrollView style={styles.languageList}>
              {filteredLanguages?.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    [
                      styles.languageItem,
                      { backgroundColor: colors.background },
                    ],
                    targetLanguage?.code === lang?.code && [
                      styles.languageItemSelected,
                      { backgroundColor: colors.primary },
                    ],
                  ]}
                  onPress={() => {
                    setTargetLanguage(lang);
                    setShowLanguageModal(false);
                    setLanguageSearchTerm('');
                    triggerHaptic();
                  }}
                >
                  <Text
                    style={[
                      [styles.languageItemText, { color: colors.text }],
                      targetLanguage?.code === lang?.code && [
                        styles.languageItemTextSelected,
                        { color: '#FFFFFF' },
                      ],
                    ]}
                  >
                    {lang.name}
                  </Text>
                  <Text
                    style={[
                      styles.languageCode,
                      { color: colors.secondaryText },
                    ]}
                  >
                    ({lang.code})
                  </Text>
                </TouchableOpacity>
              ))}
              {filteredLanguages?.length === 0 && (
                <Text
                  style={[
                    styles.noResultsText,
                    { color: colors.secondaryText },
                  ]}
                >
                  No languages found matching
                  {languageSearchTerm}"
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Report Modal */}
      {isReportModalOpen && reportingVerse && currentTranslation && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={handleCloseReportModal}
          verseId={reportingVerse._id}
          vedaTitle={textName}
          bookId={vedaId}
          originalText={verseData.originalText}
          translation={currentTranslation}
          languageCode={targetLanguage.code}
        />
      )}
    </View>
  );
}

export default function VedaReaderPage() {
  return <VedaReaderContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  headerContainer: {
    backgroundColor: '#FF6F00',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubname: {
    fontSize: 14,
    color: '#FFF7ED',
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  selectorsContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  selectorRow: {
    marginBottom: 10,
    paddingHorizontal: 16,
    position: 'relative',
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#2D3748',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dropdownItemActive: {
    backgroundColor: '#FFF7ED',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#2D3748',
  },
  dropdownItemTextActive: {
    color: '#FF6F00',
    fontWeight: '600',
  },
  selectorChip: {
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectorChipActive: {
    backgroundColor: '#FF6F00',
    borderColor: '#FF6F00',
  },
  selectorChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
  },
  selectorChipTextActive: {
    color: '#FFFFFF',
  },
  verseContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    paddingBottom: 30,
  },
  sanskritContainer: {
    marginBottom: 20,
  },
  sanskritText: {
    fontSize: 20,
    lineHeight: 26,
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  devanagariText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 4,
  },
  translationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3182CE',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  languageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  reportButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  spinner: {
    // Add rotation animation if needed
  },
  statusText: {
    color: '#D97706',
    fontSize: 14,
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
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  translationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
    marginBottom: 20,
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  translationLabel: {
    fontSize: 12,
    color: '#718096',
  },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065F46',
  },
  translationSection: {
    marginBottom: 16,
  },
  translationSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6F00',
    marginBottom: 8,
  },
  translationText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4A5568',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 16,
    paddingTop:10
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  navButtonPrimary: {
    backgroundColor: '#FF6F00',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
  },
  navButtonTextPrimary: {
    color: '#FFFFFF',
  },
  navButtonTextDisabled: {
    color: '#CBD5E0',
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 16,
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
    padding: 16,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2D3748',
  },
  languageList: {
    maxHeight: 300,
    paddingHorizontal: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  languageItemSelected: {
    backgroundColor: '#FF6F00',
  },
  languageItemText: {
    fontSize: 14,
    color: '#2D3748',
  },
  languageItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  languageCode: {
    fontSize: 12,
    color: '#718096',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 14,
    paddingVertical: 20,
  },
  backButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
