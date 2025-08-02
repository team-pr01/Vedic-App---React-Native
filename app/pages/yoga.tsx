import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllYogaQuery } from '@/redux/features/Yoga/yogaApi';
import { TYoga } from '@/types';
import { useGetAllConsultancyServicesQuery } from '@/redux/features/Consultancy/consultancyApi';
import Experts from '@/components/Experts';

import YogaHeader from '@/components/YogaPage/YogaHeader';
import AllYogaPrograms from '@/components/YogaPage/AllYogaPrograms';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';

export const LEVELS = [
  { id: 'all', name: 'All Levels', color: '#718096' },
  { id: 'beginner', name: 'Beginner', color: '#10B981' },
  { id: 'intermediate', name: 'Intermediate', color: '#F59E0B' },
  { id: 'advanced', name: 'Advanced', color: '#EF4444' },
];

export default function YogaPage() {
  const { data: experts, isLoading: isExpertsLoading } =
    useGetAllConsultancyServicesQuery({});
  const filteredExperts =
    experts?.data?.filter((expert: any) => expert.category === 'Yoga Expert') ||
    [];
  const [searchQuery, setSearchQuery] = useState('');
  const colors = useThemeColors();
  const { data, isLoading } = useGetAllYogaQuery({});
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [filteredPrograms, setFilteredPrograms] = useState<TYoga[]>([]);

  // Filter programs based on search, level, and incoming data
  useEffect(() => {
    let programsToFilter = data?.data ? [...data.data] : [];

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      programsToFilter = programsToFilter.filter(
        (program) =>
          program.name?.toLowerCase().includes(lowercasedQuery) ||
          program.description?.toLowerCase().includes(lowercasedQuery)
        // Removed instructor and category as they are not in your data model
      );
    }

    if (selectedLevel !== 'all') {
      programsToFilter = programsToFilter.filter(
        (program) => program.difficulty?.toLowerCase() === selectedLevel
      );
    }

    setFilteredPrograms(programsToFilter);
  }, [searchQuery, selectedLevel, data]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <YogaHeader />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View
          style={[styles.searchContainer, { backgroundColor: colors.card }]}
        >
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.background,
                shadowColor: colors.cardShadow,
              },
            ]}
          >
            <Search size={20} color="#718096" />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search yoga programs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.secondaryText}
            />
          </View>
        </View>

        {/* Level Filter */}
        <View
          style={[styles.filterContainer, { backgroundColor: colors.card }]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  [
                    styles.levelChip,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ],
                  selectedLevel === level.id && [
                    styles.levelChipActive,
                    { backgroundColor: level.color },
                  ],
                ]}
                onPress={() => {
                  setSelectedLevel(level.id);
                }}
              >
                <Text
                  style={[
                    [styles.levelChipText, { color: colors.secondaryText }],
                    selectedLevel === level.id && styles.levelChipTextActive,
                  ]}
                >
                  {level.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Programs Grid */}
        {isLoading ? (
          <LoadingComponent loading="Programs" color={colors.success} />
        ) : (
          <AllYogaPrograms data={filteredPrograms} />
        )}

        {isExpertsLoading ? (
          <LoadingComponent loading="Experts" color={colors.success} />
        ) : (
          <Experts
            data={filteredExperts}
            title={'Yoga'}
            isLoading={isLoading}
          />
        )}
      </ScrollView>
    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backdropFilter: 'blur(10px)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    backdropFilter: 'blur(10px)',
  },
  levelChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    backdropFilter: 'blur(10px)',
  },
  levelChipActive: {
    borderColor: 'transparent',
  },
  levelChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  levelChipTextActive: {
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});
