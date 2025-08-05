import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Search, Mic, Filter, X, CircleStop as StopCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import FilterModal from './FilterModal';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SearchBarProps {
  placeholderText?: string;
  onSearch: (query: string) => void;
  onFilterClick?: () => void;
  initialQuery?: string;
  style?: any;
  showFilter?: boolean;
  filterOptions?: { id: string; name: string; icon?: React.ReactElement }[];
  currentFilters?: string[];
  onApplyFilters?: (filters: string[]) => void;
}

export default function SearchBar({ 
  placeholderText, 
  onSearch, 
  onFilterClick, 
  initialQuery = '',
  style,
  showFilter = true,
  filterOptions = [
    { id: 'all', name: 'All Categories' },
    { id: 'texts', name: 'Sacred Texts' },
    { id: 'temples', name: 'Temples' },
    { id: 'news', name: 'News' },
    { id: 'recipes', name: 'Recipes' },
    { id: 'yoga', name: 'Yoga' },
    { id: 'meditation', name: 'Meditation' }
  ],
  currentFilters = [],
  onApplyFilters
}: SearchBarProps) {
  const colors = useThemeColors();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [isListening, setIsListening] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const recognitionRef = useRef<any>(null);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchTerm(transcript);
          onSearch(transcript);
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error, event.message);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognitionInstance;
      } else {
        console.warn('Speech recognition not supported by this browser.');
      }
    }
  }, [onSearch]);

  const handleSearchSubmit = () => {
    triggerHaptic();
    onSearch(searchTerm);
  };

  const handleVoiceSearchToggle = () => {
    triggerHaptic();
    if (!recognitionRef.current) {
      alert('Voice search is not supported by your browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setIsListening(false);
        alert("Could not start voice search. Please check microphone permissions.");
      }
    }
  };

  const clearSearch = () => {
    triggerHaptic();
    setSearchTerm('');
    onSearch('');
  };

  const handleTextChange = (text: string) => {
    setSearchTerm(text);
    // Real-time search as user types
    onSearch(text);
  };

  const handleFilterPress = () => {
    triggerHaptic();
    if (onFilterClick) {
      onFilterClick();
    } else {
      setShowFilterModal(true);
    }
  };

  const handleApplyFilters = (selectedFilters: string[]) => {
    if (onApplyFilters) {
      onApplyFilters(selectedFilters);
    }
    console.log('Applied filters:', selectedFilters);
  };

  return (
    <>
      <View style={[styles.container, style]}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={20} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={placeholderText || "Search anything..."}
            value={searchTerm}
            onChangeText={handleTextChange}
            onSubmitEditing={handleSearchSubmit}
            placeholderTextColor={colors.secondaryText}
            returnKeyType="search"
          />
          
          <View style={styles.actionButtons}>
            {searchTerm && (
              <TouchableOpacity 
                onPress={clearSearch}
                style={styles.actionButton}
              >
                <X size={18} color={colors.secondaryText} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              onPress={handleVoiceSearchToggle}
              style={[
                styles.actionButton,
                isListening && [styles.listeningButton, { backgroundColor: colors.error + '20' }]
              ]}
              disabled={!recognitionRef.current && !isListening}
            >
              {isListening ? (
                <StopCircle size={18} color={colors.error} />
              ) : (
                <Mic size={18} color={colors.info} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleSearchSubmit}
              style={styles.actionButton}
            >
              <Search size={18} color={colors.primary} />
            </TouchableOpacity>
            
            {/* {showFilter && (
              <TouchableOpacity 
                onPress={handleFilterPress}
                style={[
                  styles.actionButton,
                  currentFilters.length > 0 && [styles.activeFilterButton, { backgroundColor: colors.primary + '20' }]
                ]}
              >
                <Filter size={18} color={currentFilters.length > 0 ? colors.primary : colors.secondaryText} />
              </TouchableOpacity>
            )} */}
          </View>
        </View>
      </View>

      {/* Filter Modal */}
      <FilterModal
        isVisible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        options={filterOptions}
        currentFilters={currentFilters}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningButton: {
    backgroundColor: '#FEF2F2',
  },
  activeFilterButton: {
    backgroundColor: '#FFF7ED',
  },
});