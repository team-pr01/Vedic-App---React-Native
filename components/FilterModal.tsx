import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Filter, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Make FilterIdType generic, default to string for general use
interface FilterModalProps<FilterIdType extends string = string> {
  isVisible: boolean;
  onClose: () => void;
  options: { id: FilterIdType | 'all'; name: string; icon?: React.ReactElement<{ size?: number, color?: string }> }[];
  currentFilters: FilterIdType[];
  onApplyFilters: (selectedFilters: FilterIdType[]) => void;
}

const FilterModal = <FilterIdType extends string = string>({
  isVisible,
  onClose,
  options,
  currentFilters,
  onApplyFilters,
}: FilterModalProps<FilterIdType>): React.ReactElement | null => {
  const [selectedFilters, setSelectedFilters] = useState<FilterIdType[]>(currentFilters);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    setSelectedFilters(currentFilters);
  }, [currentFilters, isVisible]);

  const actualCategoryOptions = options.filter(opt => opt.id !== 'all');
  const allActualCategoryIds = actualCategoryOptions.map(opt => opt.id as FilterIdType);

  const isAllSelectedForUI = actualCategoryOptions.length > 0 &&
                           selectedFilters.length === actualCategoryOptions.length &&
                           allActualCategoryIds.every(id => selectedFilters.includes(id));

  const handleToggleFilter = (filterId: FilterIdType | 'all') => {
    triggerHaptic();
    if (filterId === 'all') {
      if (isAllSelectedForUI) {
        setSelectedFilters([]);
      } else {
        setSelectedFilters(allActualCategoryIds);
      }
    } else {
      const catId = filterId as FilterIdType; // Cast is safe here as 'all' is handled
      setSelectedFilters(prev =>
        prev.includes(catId)
          ? prev.filter(id => id !== catId)
          : [...prev, catId]
      );
    }
  };
  
  const handleClearFilters = () => {
    triggerHaptic();
    setSelectedFilters([]);
    onApplyFilters([]);
    onClose();
  };

  const handleSubmit = () => {
    triggerHaptic();
    onApplyFilters(selectedFilters);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Search Results</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <X size={20} color="#718096" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.optionsContainer}>
            {options.map((option) => {
              const isChecked = option.id === 'all' ? isAllSelectedForUI : selectedFilters.includes(option.id as FilterIdType);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionItem,
                    isChecked && styles.optionItemSelected
                  ]}
                  onPress={() => handleToggleFilter(option.id)}
                >
                  <View style={[
                    styles.checkbox,
                    isChecked && styles.checkboxSelected
                  ]}>
                    {isChecked && <Check size={16} color="#FFFFFF" />}
                  </View>
                  {option.icon && React.cloneElement(option.icon, { 
                    size: 20, 
                    color: isChecked ? '#FF6F00' : '#718096' 
                  })}
                  <Text style={[
                    styles.optionText,
                    isChecked && styles.optionTextSelected
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleSubmit}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    padding: 16,
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionItemSelected: {
    backgroundColor: '#FFF7ED',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF6F00',
    borderColor: '#FF6F00',
  },
  optionText: {
    fontSize: 14,
    color: '#2D3748',
    marginLeft: 8,
  },
  optionTextSelected: {
    color: '#FF6F00',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#FF6F00',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FilterModal;