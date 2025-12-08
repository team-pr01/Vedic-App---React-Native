import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Mic, Search, StopCircle } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllYogaQuery } from '@/redux/features/Yoga/yogaApi';
import { TYoga } from '@/types';
import { useGetAllConsultancyServicesQuery } from '@/redux/features/Consultancy/consultancyApi';
import AllYogaPrograms from '@/components/YogaPage/AllYogaPrograms';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import AppHeader from '@/components/Reusable/AppHeader/AppHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import Categories from '@/components/Reusable/Categories/Categories';
import SkeletonLoader from '@/components/Reusable/SkeletonLoader';
import Experts from '@/components/ConsultancyPage/Experts';

export const LEVELS = [
  { id: 'all', name: 'All Levels', color: '#718096' },
  { id: 'beginner', name: 'Beginner', color: '#10B981' },
  { id: 'intermediate', name: 'Intermediate', color: '#F59E0B' },
  { id: 'advanced', name: 'Advanced', color: '#EF4444' },
];
export const allCategories = ['beginner', 'intermediate', 'advanced'];

export default function YogaPage() {
  const {
    data,
    isLoading,
    isFetching,
    refetch: refetchYoga,
  } = useGetAllYogaQuery({});
  const {
    data: experts,
    isLoading: isExpertsLoading,
    refetch,
  } = useGetAllConsultancyServicesQuery({});
  const [refreshing, setRefreshing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetch(), refetchYoga()]);
    } catch (error) {
      console.error('Error while refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const colors = useThemeColors();

  const [selectedCategory, setSelectedCategory] = useState('');
  // const [selectedLevel, setSelectedLevel] = useState('all');
  const [filteredPrograms, setFilteredPrograms] = useState<TYoga[]>([]);

  // // Filter programs based on search, level, and incoming data
  useEffect(() => {
    let programsToFilter = data?.data ? [...data.data] : [];

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      programsToFilter = programsToFilter.filter(
        (program) =>
          program.name?.toLowerCase().includes(lowercasedQuery) ||
          program.description?.toLowerCase().includes(lowercasedQuery)
      );
    }

    if (selectedCategory) {
      programsToFilter = programsToFilter.filter(
        (program) => program.difficulty?.toLowerCase() === selectedCategory
      );
    }

    setFilteredPrograms(programsToFilter);
  }, [searchQuery, selectedCategory, data]);

  const handleVoiceSearch = () => {};

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />

      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <AppHeader title="Yoga Programs" colors={['#10B981', '#059669']} />
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View
            style={[styles.container, { backgroundColor: colors.background }]}
          >
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Search Bar */}
              <View
                style={[
                  styles.searchContainer,
                  { backgroundColor: colors.card },
                ]}
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
                  {/* <TouchableOpacity
                    onPress={handleVoiceSearch}
                    style={[
                      styles.voiceButton,
                      isListening && styles.voiceButtonActive,
                    ]}
                  >
                    {isListening ? (
                      <StopCircle size={18} color={colors.error} />
                    ) : (
                      <Mic size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity> */}
                </View>
              </View>

              {/* Level Filter */}
              <Categories
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                allCategories={allCategories}
                bgColor={'#38A169'}
              />
              <View style={{ paddingHorizontal: 16 }}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Featured Programs
                  </Text>
                  <Text
                    style={[
                      styles.resultsCount,
                      { color: colors.secondaryText },
                    ]}
                  >
                    {data?.length} program
                    {data?.length !== 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Programs Grid */}
                {isLoading || isFetching ? (
                  <SkeletonLoader
                    direction="column"
                    width={'100%'}
                    height={300}
                    innerSkeleton={
                      <View
                        style={{
                          padding: 15,
                          justifyContent: 'flex-end',
                          flex: 1,
                        }}
                      >
                        <View>
                          <View
                            style={{
                              width: '60%',
                              height: 16,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 8,
                              marginBottom: 8,
                            }}
                          />
                          <View
                            style={{
                              width: '90%',
                              height: 12,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 6,
                              marginBottom: 8,
                            }}
                          />
                          <View
                            style={{
                              width: '20%',
                              height: 12,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 6,
                            }}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <View
                            style={{
                              width: '30%',
                              height: 20,
                              backgroundColor: '#d6d6d6',
                              borderRadius: 15,
                              marginTop: 20,
                            }}
                          />
                        </View>
                      </View>
                    }
                  />
                ) : (
                  <AllYogaPrograms data={filteredPrograms} />
                )}
              </View>

              <Experts defaultCategory="Yoga Expert" />
            </ScrollView>
          </View>
        </ScrollView>
      </PullToRefreshWrapper>
    </SafeAreaView>
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
    paddingVertical: 0,
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
  bottomSpacing: {
    height: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  voiceButton: {
    padding: 4,
  },
  voiceButtonActive: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultsCount: {
    fontSize: 14,
  },
});
