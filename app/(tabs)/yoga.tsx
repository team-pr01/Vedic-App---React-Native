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
import { Search } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllYogaQuery } from '@/redux/features/Yoga/yogaApi';
import { TYoga } from '@/types';
import { useGetAllConsultancyServicesQuery } from '@/redux/features/Consultancy/consultancyApi';
import Experts from '@/components/Experts';
import AllYogaPrograms from '@/components/YogaPage/AllYogaPrograms';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import AppHeader from '@/components/Reusable/AppHeader/AppHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import Categories from '@/components/Reusable/Categories/Categories';

export const LEVELS = [
  { id: 'all', name: 'All Levels', color: '#718096' },
  { id: 'beginner', name: 'Beginner', color: '#10B981' },
  { id: 'intermediate', name: 'Intermediate', color: '#F59E0B' },
  { id: 'advanced', name: 'Advanced', color: '#EF4444' },
];
export const allCategories = ['beginner','intermediate',  'advanced' ,
];

export default function YogaPage() {
  const { data, isLoading,isFetching, refetch: refetchYoga } = useGetAllYogaQuery({});
  const {
    data: experts,
    isLoading: isExpertsLoading,
    refetch,
  } = useGetAllConsultancyServicesQuery({});
  const [refreshing, setRefreshing] = useState(false);

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
  const filteredExperts =
    experts?.data?.filter((expert: any) => expert.category === 'Yoga Expert') ||
    [];
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
                </View>
              </View>

              {/* Level Filter */}
              <Categories
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                allCategories={allCategories}
                bgColor={'#38A169'}
              />

              {/* Programs Grid */}
              {isLoading || isFetching ? (
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
});
