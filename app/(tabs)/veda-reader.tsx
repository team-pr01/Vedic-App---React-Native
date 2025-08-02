import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronLeft, ChevronRight, Languages, Search, X, Loader, CircleAlert as AlertCircle, Flag, BookOpen, Chrome as Home, Star, Newspaper, TriangleAlert as AlertTriangle, ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';

import { MOCK_VEDIC_TEXTS } from '../../data/mockVedicTexts';
import { VedicTranslationService } from '../../services/translationService';
import { useTranslate } from '../../hooks/useTranslate';
import { allLanguages, TLanguage } from '../../redux/features/Language/languageSlice'; // Get 
import ReportModal from '../../components/ReportModal';
import { VedicText, Section, Subsection, Verse, Language, VerseTranslation, ReportSubmission } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useThemeColors } from '@/hooks/useThemeColors';

function VedaReaderContent() {
  const { vedaId } = useLocalSearchParams<{ vedaId: string }>();
   const t = useTranslate();
  const colors = useThemeColors();

  const veda = MOCK_VEDIC_TEXTS.find(v => v.id === vedaId);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubsectionId, setSelectedSubsectionId] = useState<string | null>(null);
  const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null);
  const globalLanguage = useSelector((state: RootState) => state.language.currentLanguage);
  const [targetLanguage, setTargetLanguage] = useState<Language>(globalLanguage);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');

  const [currentTranslation, setCurrentTranslation] = useState<VerseTranslation | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingVerse, setReportingVerse] = useState<Verse | null>(null);
  
  // Dropdown states
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [showSubsectionDropdown, setShowSubsectionDropdown] = useState(false);
  const [showVerseDropdown, setShowVerseDropdown] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const flattenedVerses = useMemo(() => {
    if (!veda) return [];
    const flatList: { verse: Verse; subsection: Subsection; section: Section }[] = [];
    veda.sections.forEach(sec => {
      sec.subsections.forEach(subSec => {
        subSec.verses.forEach(v => {
          flatList.push({ verse: v, subsection: subSec, section: sec });
        });
      });
    });
    return flatList;
  }, [veda]);

  const currentVerseIndex = useMemo(() => {
    return flattenedVerses.findIndex(item => item.verse.id === selectedVerseId);
  }, [flattenedVerses, selectedVerseId]);

  const currentSection = useMemo(() => 
    veda?.sections.find(s => s.id === selectedSectionId), 
    [veda?.sections, selectedSectionId]
  );
  
  const currentSubsection = useMemo(() => 
    currentSection?.subsections.find(ss => ss.id === selectedSubsectionId), 
    [currentSection, selectedSubsectionId]
  );
  
  const currentVerse = useMemo(() => 
    flattenedVerses[currentVerseIndex]?.verse, 
    [flattenedVerses, currentVerseIndex]
  );

  const updateSelections = useCallback((sectionId: string, subsectionId: string, verseId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedSubsectionId(subsectionId);
    setSelectedVerseId(verseId);
    setCurrentTranslation(null);
    setTranslationError(null);
  }, []);

  useEffect(() => {
    if (flattenedVerses.length > 0 && (!selectedVerseId || !flattenedVerses.find(fv => fv.verse.id === selectedVerseId))) {
      const firstItem = flattenedVerses[0];
      if (firstItem) {
        updateSelections(firstItem.section.id, firstItem.subsection.id, firstItem.verse.id);
      }
    }
  }, [flattenedVerses, updateSelections, selectedVerseId]);
  
  const handleTranslate = useCallback(async () => {
    if (!currentVerse || !targetLanguage || isTranslating) return;
    
    setIsTranslating(true);
    setTranslationError(null);
    setCurrentTranslation(null);

    try {
      const sanskritText = currentVerse.sanskritLines.join('\n');
      
      // Enhanced translation with better error handling
      console.log('Starting translation for:', sanskritText, 'to', targetLanguage.name);
      
      const translationResult = await VedicTranslationService.translateVerseDetails(
        sanskritText, 
        targetLanguage.code, 
        targetLanguage.name
      );
      
      console.log('Translation result:', translationResult);
      setCurrentTranslation(translationResult);
    } catch (error: any) {
      console.error("Translation error:", error);
      setTranslationError(error.message || "Failed to translate. Please try again.");
      
      // Fallback to simple translation if available
      if (targetLanguage.code === 'en' && currentVerse.englishTranslation) {
        setCurrentTranslation({ bhavartha: currentVerse.englishTranslation });
      } else if (targetLanguage.code === 'bn' && currentVerse.bengaliTranslation) {
        setCurrentTranslation({ bhavartha: currentVerse.bengaliTranslation });
      }
    } finally {
      setIsTranslating(false);
    }
  }, [currentVerse, targetLanguage, isTranslating]);

  useEffect(() => {
    if (currentVerse && targetLanguage) {
      handleTranslate();
    }
  }, [currentVerse, targetLanguage]);

  const handleSectionSelect = (sectionId: string) => {
    triggerHaptic();
    const section = veda?.sections.find(s => s.id === sectionId);
    if (section && section.subsections.length > 0 && section.subsections[0].verses.length > 0) {
      updateSelections(section.id, section.subsections[0].id, section.subsections[0].verses[0].id);
    }
    setShowSectionDropdown(false);
  };

  const handleSubsectionSelect = (subsectionId: string) => {
    triggerHaptic();
    const section = currentSection;
    const subsection = section?.subsections.find(ss => ss.id === subsectionId);
    if (section && subsection && subsection.verses.length > 0) {
      updateSelections(section.id, subsection.id, subsection.verses[0].id);
    }
    setShowSubsectionDropdown(false);
  };
  
  const handleVerseSelect = (verseId: string) => {
    triggerHaptic();
    if (currentSection && currentSubsection) {
      updateSelections(currentSection.id, currentSubsection.id, verseId);
    }
    setShowVerseDropdown(false);
  };

  const navigateVerse = (direction: 'next' | 'previous') => {
    triggerHaptic();
    if (currentVerseIndex === -1) return;
    const newIndex = direction === 'next' ? currentVerseIndex + 1 : currentVerseIndex - 1;
    if (newIndex >= 0 && newIndex < flattenedVerses.length) {
      const { verse, subsection, section } = flattenedVerses[newIndex];
      updateSelections(section.id, subsection.id, verse.id);
    }
  };

  const handleOpenReportModal = (verse: Verse) => {
    triggerHaptic();
    setReportingVerse(verse);
    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setReportingVerse(null);
  };

  const handleSubmitReport = (submission: ReportSubmission) => {
    console.log("Report Submitted:", submission);
    // In a real app, this would send to your backend
    alert(`Report for verse ${submission.verseId} submitted. Thank you for your feedback!`);
    handleCloseReportModal();
  };

  const filteredLanguages = allLanguages.filter(lang => 
    lang.name.toLowerCase().includes(languageSearchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(languageSearchTerm.toLowerCase())
  );

  const isHumanVerified = currentVerse?.humanVerifiedLanguages?.includes(targetLanguage.code);

  if (!veda) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Veda not found</Text>
          <Text style={[styles.errorText, { color: colors.secondaryText }]}>The requested Vedic text could not be found.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <LinearGradient colors={['#FF6F00', '#FF8F00']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{veda.title}</Text>
            {veda.subtitle && <Text style={styles.headerSubtitle}>{veda.subtitle}</Text>}
          </View>
          <View style={styles.headerPlaceholder} />
        </LinearGradient>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Navigation Selectors - Dropdown Style */}
        <View style={styles.selectorsContainer}>
          {/* Section Dropdown */}
          <View style={styles.selectorRow}>
            <Text style={[styles.selectorLabel, { color: colors.text }]}>{veda.sectionLevelName || 'Section'}</Text>
            <TouchableOpacity 
              style={[styles.dropdownButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                triggerHaptic();
                setShowSectionDropdown(!showSectionDropdown);
                setShowSubsectionDropdown(false);
                setShowVerseDropdown(false);
              }}
            >
              <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
                {currentSection ? currentSection.title : `Select ${veda.sectionLevelName || 'Section'}`}
              </Text>
              <ChevronDown size={20} color={colors.secondaryText} />
            </TouchableOpacity>
            
            {showSectionDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.cardShadow }]}>
                <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
                  {veda.sections.map(section => (
                    <TouchableOpacity
                      key={section.id}
                      style={[
                        [styles.dropdownItem, { borderBottomColor: colors.border }],
                        selectedSectionId === section.id && [styles.dropdownItemActive, { backgroundColor: colors.primary + '20' }]
                      ]}
                      onPress={() => handleSectionSelect(section.id)}
                    >
                      <Text style={[
                        [styles.dropdownItemText, { color: colors.text }],
                        selectedSectionId === section.id && [styles.dropdownItemTextActive, { color: colors.primary }]
                      ]}>
                        {section.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Subsection Dropdown */}
          {currentSection && (
            <View style={styles.selectorRow}>
              <Text style={[styles.selectorLabel, { color: colors.text }]}>{veda.subsectionLevelName || 'Subsection'}</Text>
              <TouchableOpacity 
                style={[styles.dropdownButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  triggerHaptic();
                  setShowSubsectionDropdown(!showSubsectionDropdown);
                  setShowSectionDropdown(false);
                  setShowVerseDropdown(false);
                }}
              >
                <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
                  {currentSubsection ? currentSubsection.title : `Select ${veda.subsectionLevelName || 'Subsection'}`}
                </Text>
                <ChevronDown size={20} color={colors.secondaryText} />
              </TouchableOpacity>
              
              {showSubsectionDropdown && (
                <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.cardShadow }]}>
                  <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
                    {currentSection.subsections.map(subsection => (
                      <TouchableOpacity
                        key={subsection.id}
                        style={[
                          [styles.dropdownItem, { borderBottomColor: colors.border }],
                          selectedSubsectionId === subsection.id && [styles.dropdownItemActive, { backgroundColor: colors.primary + '20' }]
                        ]}
                        onPress={() => handleSubsectionSelect(subsection.id)}
                      >
                        <Text style={[
                          [styles.dropdownItemText, { color: colors.text }],
                          selectedSubsectionId === subsection.id && [styles.dropdownItemTextActive, { color: colors.primary }]
                        ]}>
                          {subsection.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Verse Dropdown */}
          {currentSubsection && (
            <View style={styles.selectorRow}>
              <Text style={[styles.selectorLabel, { color: colors.text }]}>{veda.verseLevelName || 'Verse'}</Text>
              <TouchableOpacity 
                style={[styles.dropdownButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  triggerHaptic();
                  setShowVerseDropdown(!showVerseDropdown);
                  setShowSectionDropdown(false);
                  setShowSubsectionDropdown(false);
                }}
              >
                <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
                  {currentVerse ? currentVerse.id : `Select ${veda.verseLevelName || 'Verse'}`}
                </Text>
                <ChevronDown size={20} color={colors.secondaryText} />
              </TouchableOpacity>
              
              {showVerseDropdown && (
                <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.cardShadow }]}>
                  <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
                    {currentSubsection.verses.map(verse => (
                      <TouchableOpacity
                        key={verse.id}
                        style={[
                          [styles.dropdownItem, { borderBottomColor: colors.border }],
                          selectedVerseId === verse.id && [styles.dropdownItemActive, { backgroundColor: colors.primary + '20' }]
                        ]}
                        onPress={() => handleVerseSelect(verse.id)}
                      >
                        <Text style={[
                          [styles.dropdownItemText, { color: colors.text }],
                          selectedVerseId === verse.id && [styles.dropdownItemTextActive, { color: colors.primary }]
                        ]}>
                          {verse.id}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Verse Content */}
        {currentVerse ? (
          <View style={[styles.verseContainer, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
            {/* Sanskrit Text */}
            <View style={styles.sanskritContainer}>
              {currentVerse.sanskritLines.map((line, index) => (
                <Text key={index} style={[styles.sanskritText, { color: colors.text }]}>{line}</Text>
              ))}
              {currentVerse.devanagariLines && currentVerse.devanagariLines.map((line, index) => (
                <Text key={`dev-${index}`} style={[styles.devanagariText, { color: colors.secondaryText }]}>{line}</Text>
              ))}
            </View>

            {/* Translation Controls */}
            <View style={styles.translationControls}>
              <TouchableOpacity 
                style={styles.languageButton}
                onPress={() => setShowLanguageModal(true)}
              >
                <Languages size={16} color="#FFFFFF" />
                <Text style={styles.languageButtonText}>
                  {t('tTo', 't to')}: {targetLanguage.name}
                </Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => handleOpenReportModal(currentVerse)}
              >
                <Flag size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Translation Status */}
            {isTranslating && (
              <View style={[styles.statusContainer, { backgroundColor: colors.warning + '20' }]}>
                <Loader size={20} color="#FF6F00" style={styles.spinner} />
                <Text style={[styles.statusText, { color: colors.warning }]}>
                  {t('translatingTo', 'Translating to')} {targetLanguage.name}...
                </Text>
              </View>
            )}

            {translationError && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                <AlertCircle size={20} color="#EF4444" />
                <Text style={[styles.errorText, { color: colors.error }]}>{translationError}</Text>
              </View>
            )}

            {/* Translation Content */}
            {currentTranslation && !isTranslating && !translationError && (
              <View style={[styles.translationContainer, { borderTopColor: colors.border }]}>
                <View style={styles.translationHeader}>
                  <Text style={[styles.translationLabel, { color: colors.secondaryText }]}>
                    {t('translationByAI', 'Translation by AI')}
                  </Text>
                  {isHumanVerified && (
                    <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.verifiedText, { color: colors.success }]}>
                        {t('humanVerified', 'Human Verified')}
                      </Text>
                    </View>
                  )}
                </View>

                {currentTranslation.pada && (
                  <View style={styles.translationSection}>
                    <Text style={[styles.translationSectionTitle, { color: colors.primary }]}>
                      {t('padaLabel', 'पद (Key Terms/Word Meanings)')}
                    </Text>
                    <Text style={[styles.translationText, { color: colors.text }]}>{currentTranslation.pada}</Text>
                  </View>
                )}

                {currentTranslation.padartha && (
                  <View style={styles.translationSection}>
                    <Text style={[styles.translationSectionTitle, { color: colors.primary }]}>
                      {t('padarthaLabel', 'पदार्थ (Phrase Analysis)')}
                    </Text>
                    <Text style={[styles.translationText, { color: colors.text }]}>{currentTranslation.padartha}</Text>
                  </View>
                )}

                {currentTranslation.bhavartha && (
                  <View style={styles.translationSection}>
                    <Text style={[styles.translationSectionTitle, { color: colors.primary }]}>
                      {t('bhavarthaLabel', 'भावार्थ (Purport/Essence)')}
                    </Text>
                    <Text style={[styles.translationText, { color: colors.text }]}>{currentTranslation.bhavartha}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Navigation */}
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[
                  [styles.navButton, { backgroundColor: colors.background }],
                  currentVerseIndex <= 0 && styles.navButtonDisabled
                ]}
                onPress={() => navigateVerse('previous')}
                disabled={currentVerseIndex <= 0}
              >
                <ChevronLeft size={16} color={currentVerseIndex <= 0 ? colors.border : colors.secondaryText} />
                <Text style={[
                  [styles.navButtonText, { color: colors.secondaryText }],
                  currentVerseIndex <= 0 && styles.navButtonTextDisabled
                ]}>
                  {t('previousVerse', 'Previous')}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.verseNumber, { color: colors.text }]}>{currentVerse.id}</Text>

              <TouchableOpacity
                style={[
                  [styles.navButton, { backgroundColor: colors.primary }],
                  currentVerseIndex >= flattenedVerses.length - 1 && styles.navButtonDisabled
                ]}
                onPress={() => navigateVerse('next')}
                disabled={currentVerseIndex >= flattenedVerses.length - 1}
              >
                <Text style={[
                  styles.navButtonTextPrimary,
                  currentVerseIndex >= flattenedVerses.length - 1 && styles.navButtonTextDisabled
                ]}>
                  {t('nextVerse', 'Next')}
                </Text>
                <ChevronRight size={16} color={
                  currentVerseIndex >= flattenedVerses.length - 1 ? colors.border : "#FFFFFF"
                } />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <BookOpen size={48} color="#CBD5E0" />
            <Text style={[styles.emptyTitle, { color: colors.secondaryText }]}>
              {veda.sections.length > 0 
                ? t('selectVersePrompt', 'Select a section, subsection, and verse to display.')
                : t('noVedicTextAvailable', 'No content available for this Vedic text yet.')
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                {t('selectTranslationLanguage', 'Select Translation Language')}
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
              <Search size={16} color={colors.secondaryText} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={t('searchLanguagesPlaceholder', 'Search languages...')}
                value={languageSearchTerm}
                onChangeText={setLanguageSearchTerm}
                placeholderTextColor={colors.secondaryText}
              />
            </View>

            <ScrollView style={styles.languageList}>
              {filteredLanguages.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    [styles.languageItem, { backgroundColor: colors.background }],
                    targetLanguage.code === lang.code && [styles.languageItemSelected, { backgroundColor: colors.primary }]
                  ]}
                  onPress={() => {
                    setTargetLanguage(lang);
                    setShowLanguageModal(false);
                    setLanguageSearchTerm('');
                    triggerHaptic();
                  }}
                >
                  <Text style={[
                    [styles.languageItemText, { color: colors.text }],
                    targetLanguage.code === lang.code && [styles.languageItemTextSelected, { color: '#FFFFFF' }]
                  ]}>
                    {lang.name}
                  </Text>
                  <Text style={[styles.languageCode, { color: colors.secondaryText }]}>({lang.code})</Text>
                </TouchableOpacity>
              ))}
              {filteredLanguages.length === 0 && (
                <Text style={[styles.noResultsText, { color: colors.secondaryText }]}>
                  {t('noLanguagesFound', 'No languages found matching')} "{languageSearchTerm}"
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Report Modal */}
      {isReportModalOpen && reportingVerse && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={handleCloseReportModal}
          verseId={reportingVerse.id}
          vedaTitle={veda.title}
          onSubmitReport={handleSubmitReport}
        />
      )}
    </View>
  );
}

export default function VedaReaderPage() {
  return (
   
      <VedaReaderContent />
 
  );
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
  headerSubtitle: {
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  selectorRow: {
    marginBottom: 16,
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
  },
  sanskritContainer: {
    marginBottom: 20,
  },
  sanskritText: {
    fontSize: 20,
    lineHeight: 32,
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
    paddingTop: 16,
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