import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Languages, X, Filter, Eye, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllNewsQuery, useLikeNewsMutation, useViewNewsMutation } from '@/redux/features/News/newsApi';
import { useGetAllCategoriesQuery } from '@/redux/features/Categories/categoriesApi';
import { formatDate } from './../../utils/formatDate';
import NewsContent from '@/components/NewsContent';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import AppHeader from '@/components/Reusable/AppHeader/AppHeader';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import Categories from '@/components/Reusable/Categories/Categories';
import { LANGUAGES } from '@/data/allLanguages';
import { useSelector } from 'react-redux';
import { useCurrentUser } from '@/redux/features/Auth/authSlice';

interface Language {
  code: string;
  name: string;
}

export default function NewsScreen() {
  const user = useSelector(useCurrentUser);
  const [searchQuery, setSearchQuery] = useState('');
  const [translatedArticles, setTranslatedArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const {
    data,
    isLoading,
    refetch: refetchNews,
  } = useGetAllNewsQuery({
    category: selectedCategory,
    keyword: searchQuery,
  });
  console.log(translatedArticles);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    LANGUAGES[0]
  );
  const [likeNews, { isLoading:isLikeLoading }] = useLikeNewsMutation();
  const [viewNews, { isLoading:isViewLoading }] = useViewNewsMutation();
 
  useEffect(() => {
    const langCode = currentLanguage?.code;
    if (!data?.data || !langCode) {
      setTranslatedArticles([]);
      return;
    }
    const filtered = data.data
      .map((article: any) => {
        let translations = article?.translations;
        if (!translations) return null;

        // 🔹 Convert array → object if needed
        if (Array.isArray(translations)) {
          translations = translations.reduce((acc: any, t: any) => {
            if (t?.language) acc[t.language] = t;
            return acc;
          }, {});
        }
        const hasLang =
          translations?.[langCode] ||
          translations?.[langCode.toLowerCase?.()] ||
          translations?.[langCode.toUpperCase?.()];

        if (!hasLang) return null;

        return { ...article, translated: hasLang };
      })
      .filter(Boolean); // remove nulls (articles without that language)

    setTranslatedArticles(filtered);
  }, [data, currentLanguage]);
  
  const { data: categoryData,isLoading:isLoadingCategories, refetch: refetchCategories } =
    useGetAllCategoriesQuery({});
 const filteredCategory = categoryData?.data?.filter(
    (category: any) => category.areaName === 'news'
  );

  const allCategories = filteredCategory?.map(
    (category: any) => category.category
  );

  const [refreshing, setRefreshing] = useState(false);
    const handleLike = async (id:string) => {
    try {
      await likeNews(id).unwrap();
    } catch (err) {
      console.error('❌ Error liking news:', err);
    }
  };
    const handleView = async (id:string) => {
    try {
      await viewNews(id).unwrap();
    } catch (err) {
      console.error('❌ Error viewing news:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetchCategories(), refetchNews()]);
    } catch (error) {
      console.error('Error while refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const colors = useThemeColors();
  const [selectedNewsItem, setSelectedNewsItem] = useState<any | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const handleOpenArticleModal = (article: any, translated: any) => {
    triggerHaptic();
    setSelectedNewsItem({ article, translated });
    setIsArticleModalOpen(true);
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <AppHeader title="Spiritual News" colors={['#FF8F00', '#F57C00']} />
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <SafeAreaView
            edges={['top', 'left', 'right']}
            style={[styles.container, { backgroundColor: colors.background }]}
          >
            {/* Search and Language Section */}
            <View
              style={[
                styles.searchSection,
                {
                  backgroundColor: colors.card,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.searchContainer}>
                <View
                  style={[
                    styles.searchBar,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Search size={20} color={colors.secondaryText} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search news..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.secondaryText}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={() => setShowLanguageModal(true)}
                >
                  <Languages size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Tabs */}
            <Categories
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
              allCategories={allCategories}
              bgColor={'#DD6B20'}
               isLoading={isLoadingCategories}
            />

            {/* Trending Topics */}
            {/* <View style={[styles.trendingSection, { backgroundColor: colors.card }]}>
        <View style={styles.trendingHeader}>
          <TrendingUp size={20} color="#F59E0B" />
          <Text style={[styles.trendingTitle, { color: colors.text }]}>
            Trending Topics
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {trendingTopics.map((topic, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.trendingTag,
                {
                  backgroundColor: colors.warning + '20',
                  borderColor: colors.warning + '40',
                },
              ]}
              onPress={triggerHaptic}
            >
              <Text style={styles.trendingTagText}>{topic.name}</Text>
              <Text style={styles.trendingTagCount}>{topic.posts} posts</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View> */}

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* News Articles */}
              <View style={styles.articlesSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Latest Articles
                </Text>

                {isLoading ? (
                  <LoadingComponent loading="Programs" color={colors.primary} />
                ) : translatedArticles.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Filter size={48} color={colors.secondaryText} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                      No news found
                    </Text>
                    <Text
                      style={[
                        styles.emptyDescription,
                        { color: colors.secondaryText },
                      ]}
                    >
                      Try adjusting your search or category filters
                    </Text>
                  </View>
                ) : (
                  translatedArticles?.map((article: any) => {
                    const translated =
                      article?.translations?.[currentLanguage.code];
                    const userLiked = article?.likedBy?.includes(user?._id);
                    return (
                      <TouchableOpacity
                        key={article?._id}
                        style={[
                          styles.articleCard,
                          {
                            backgroundColor: colors.card,
                            shadowColor: colors.cardShadow,
                          },
                        ]}
                        onPress={() =>{
                          handleOpenArticleModal(article, translated)
                          handleView(article._id)}
                        }
                      >
                        <Image
                          source={{ uri: article?.imageUrl }}
                          style={styles.articleImage}
                        />

                        <View style={styles.articleContent}>
                          <View style={styles.articleHeader}>
                            <Text style={styles.categoryBadgeText}>
                              {translated?.category}
                            </Text>
                            <Text
                              style={[
                                styles.publishTime,
                                { color: colors.secondaryText },
                              ]}
                            >
                              {formatDate(article?.createdAt)}
                            </Text>
                          </View>

                          <Text
                            style={[
                              styles.articleTitle,
                              { color: colors.text },
                            ]}
                          >
                            {translated?.title}
                          </Text>

                          {article.excerpt ? (
                            <Text
                              style={[
                                styles.articleExcerpt,
                                { color: colors.secondaryText },
                              ]}
                            >
                              {article.excerpt}
                            </Text>
                          ) : null}

                          <Text
                            style={[
                              styles.articleSummary,
                              { color: colors.secondaryText },
                            ]}
                          >
                            {translated?.content
                              .replace(/<[^>]+>/g, '')
                              .slice(0, 100) + '...'}
                          </Text>

                          <View style={styles.articleMeta}>
                          <View style={styles.metaLeft}>
                            <View style={styles.metaItem}>
                              <Eye size={14} color={colors.secondaryText} />
                              <Text
                                style={[
                                  styles.metaText,
                                  { color: colors.secondaryText },
                                ]}
                              >
                                {article.views}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.articleActions}>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleLike(article._id);
                              }}
                            >
                              <Heart
                                size={20}
                                color={
                                  userLiked
                                    ? colors.error
                                    : colors.secondaryText
                                }
                                fill={userLiked ? '#EF4444' : 'none'}
                              />
                              <Text
                                style={[
                                  styles.actionText,
                                  { color: colors.secondaryText },
                                  userLiked && { color: colors.error },
                                ]}
                              >
                              {article.likes}
                              </Text>
                            </TouchableOpacity>

                            {/* <TouchableOpacity
                              style={styles.actionButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleShare(article);
                              }}
                            >
                              <Share2 size={20} color={colors.secondaryText} />
                            </TouchableOpacity> */}
                          </View>
                        </View>

                          <View style={styles.tagsContainer}>
                            {article?.translated?.tags?.map(
                              (tag: string, index: number) => (
                                <View
                                  key={index}
                                  style={[
                                    styles.tag,
                                    { backgroundColor: colors.info + '20' },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.tagText,
                                      { color: colors.info },
                                    ]}
                                  >
                                    #333{tag}
                                  </Text>
                                </View>
                              )
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Article Modal */}
            {isArticleModalOpen && selectedNewsItem && (
              <Modal
                visible={isArticleModalOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setIsArticleModalOpen(false)}
              >
                <View style={styles.modalOverlay}>
                  <View
                    style={[
                      styles.articleModal,
                      {
                        backgroundColor: colors.card,
                        shadowColor: colors.cardShadow,
                      },
                    ]}
                  >
                    {/* 🔹 Header */}
                    <View style={styles.modalHeader}>
                      <Text style={[styles.modalTitle, { color: colors.text }]}>
                        {selectedNewsItem?.translated?.title ||
                          selectedNewsItem?.title ||
                          'Untitled'}
                      </Text>

                      <TouchableOpacity
                        onPress={() => setIsArticleModalOpen(false)}
                      >
                        <X size={24} color={colors.secondaryText} />
                      </TouchableOpacity>
                    </View>

                    {/* 🔹 Body */}
                    <ScrollView style={[styles.modalContent, { padding: 10 }]}>
                      <Image
                        source={{ uri: selectedNewsItem?.article?.imageUrl }}
                        style={styles.modalImage}
                      />

                      <View style={[styles.articleHeader, { marginTop: 10 }]}>
                        <Text style={styles.categoryBadgeText}>
                          {selectedNewsItem?.translated?.category ||
                            selectedNewsItem?.article?.category ||
                            'General'}
                        </Text>
                        <Text
                          style={[
                            styles.publishTime,
                            { color: colors.secondaryText },
                          ]}
                        >
                          {formatDate(selectedNewsItem?.article?.createdAt)}
                        </Text>
                      </View>

                      {selectedNewsItem?.translated?.excerpt ? (
                        <Text
                          style={[
                            styles.articleExcerpt,
                            { color: colors.secondaryText },
                          ]}
                        >
                          {selectedNewsItem.translated.excerpt}
                        </Text>
                      ) : null}

                      {/* 🔹 Actual translated HTML content */}
                      <NewsContent
                        htmlContent={
                          selectedNewsItem?.translated?.content ||
                          selectedNewsItem?.content ||
                          '<p>No content available</p>'
                        }
                      />
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            )}

            {/* Share Modal */}
            {/* {showShareModal && shareTargetNews && (
            <Modal
              visible={showShareModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowShareModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View
                  style={[
                    styles.shareModal,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.cardShadow,
                    },
                  ]}
                >
                  <View style={styles.shareModalHeader}>
                    <Text
                      style={[styles.shareModalTitle, { color: colors.text }]}
                    >
                      Share News
                    </Text>
                    <TouchableOpacity onPress={() => setShowShareModal(false)}>
                      <X size={24} color={colors.secondaryText} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.shareOptions}>
                    <TouchableOpacity
                      style={[
                        styles.shareOption,
                        { backgroundColor: '#1877F2' },
                      ]}
                      onPress={() => handleSharePlatform('facebook')}
                    >
                      <Facebook size={24} color="#FFFFFF" />
                      <Text style={styles.shareOptionText}>Facebook</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.shareOption,
                        { backgroundColor: '#1DA1F2' },
                      ]}
                      onPress={() => handleSharePlatform('twitter')}
                    >
                      <Twitter size={24} color="#FFFFFF" />
                      <Text style={styles.shareOptionText}>Twitter</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.shareOption,
                        { backgroundColor: '#0A66C2' },
                      ]}
                      onPress={() => handleSharePlatform('linkedin')}
                    >
                      <Linkedin size={24} color="#FFFFFF" />
                      <Text style={styles.shareOptionText}>LinkedIn</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.shareOption,
                        { backgroundColor: colors.secondaryText },
                      ]}
                      onPress={() => handleSharePlatform('copy')}
                    >
                      <Link2 size={24} color="#FFFFFF" />
                      <Text style={styles.shareOptionText}>Copy Link</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )} */}

            {/* Language Modal */}
            {showLanguageModal && (
              <Modal
                visible={showLanguageModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLanguageModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View
                    style={[
                      styles.languageModal,
                      {
                        backgroundColor: colors.card,
                        shadowColor: colors.cardShadow,
                      },
                    ]}
                  >
                    <View style={styles.languageModalHeader}>
                      <Text
                        style={[
                          styles.languageModalTitle,
                          { color: colors.primary },
                        ]}
                      >
                        Select Language
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowLanguageModal(false)}
                      >
                        <X size={24} color={colors.secondaryText} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.languageList}>
                      {LANGUAGES.map((language) => (
                        <TouchableOpacity
                          key={language.code}
                          style={[
                            styles.languageOption,
                            { borderBottomColor: colors.border },
                            currentLanguage.code === language.code && {
                              backgroundColor: colors.primary,
                            },
                          ]}
                          onPress={() => {
                            setCurrentLanguage(language);
                            setShowLanguageModal(false);
                            triggerHaptic();
                          }}
                        >
                          <Text
                            style={[
                              styles.languageOptionText,
                              { color: colors.text },
                              currentLanguage.code === language.code && {
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                              },
                            ]}
                          >
                            {language.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            )}
          </SafeAreaView>
        </ScrollView>
      </PullToRefreshWrapper>{' '}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  searchSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 0,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  languageButton: {
    borderRadius: 25,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContainer: {
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeCategoryTab: {
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  trendingSection: {
    padding: 16,
    marginBottom: 8,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  trendingTag: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
  },
  trendingTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  trendingTagCount: {
    fontSize: 12,
    color: '#D97706',
  },
  content: {
    flex: 1,
  },
  articlesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  articleCard: {
    borderRadius: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  articleContent: {
    padding: 16,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
    backgroundColor: 'green',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  publishTime: {
    fontSize: 12,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  articleSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  articleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  articleModal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10, 
    paddingBottom: 10,
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
    flex: 1,
    marginRight: 16,
  },
  modalContent: {
    // flex: 1,
    height: '100%',
  },
  modalImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  articleModalContent: {
    padding: 16,
  },
  articleModalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  footerInfo: {
    flex: 1,
  },
  footerText: {
    fontSize: 12,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  shareModal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    padding: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shareModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareOptions: {
    gap: 12,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  shareOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  languageModal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    maxHeight: '80%',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  languageList: {
    padding: 8,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  languageOptionText: {
    fontSize: 16,
  },
  bottomSpacing: {
    height: 20,
  },
  articleExcerpt: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 6,
    opacity: 0.8,
  },
  categoryChip: {
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#DD6B20',
    borderColor: '#DD6B20',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoriesContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});
