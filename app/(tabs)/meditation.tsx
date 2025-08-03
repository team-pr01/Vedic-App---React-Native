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
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Eye,
  Share2,
  Languages,
  X,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  ArrowLeft,
  Filter,
  Heart,
  Loader,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { allLanguages } from '@/redux/features/Language/languageSlice';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllNewsQuery } from '@/redux/features/News/newsApi';
import { useGetAllCategoriesQuery } from '@/redux/features/Categories/categoriesApi';
import { formatDate } from './../../utils/formatDate';
import NewsContent from '@/components/NewsContent';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';

// Define base English categories for state management and logic
const baseEnglishCategories = [
  'All',
  'Education',
  'Event',
  'Health',
  'Culture',
  'Spirituality',
  'Community',
];

interface Language {
  code: string;
  name: string;
}

// Import languages from LanguageContext

// Mock Translation Service
const TranslationService = {
  translate: async ({
    sourceText,
    targetLanguageCode,
    targetLanguageName,
    sourceLanguageCode,
    sourceLanguageName,
  }: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, we'll just return a simple translation
    if (targetLanguageCode === 'en' && sourceLanguageCode === 'bn') {
      return {
        translatedText: `[Translated to ${targetLanguageName}]: ${sourceText}`,
      };
    } else {
      return {
        translatedText: `[Translated to ${targetLanguageName}]: ${sourceText}`,
      };
    }
  },
};

export default function NewsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const {
    data,
    isLoading,
    refetch: refetchNews,
  } = useGetAllNewsQuery({
    category: selectedCategory,
    keyword: searchQuery,
  });
  const { data: categoryData, refetch: refetchCategories } =
    useGetAllCategoriesQuery({});
  const filteredCategory = categoryData?.data?.filter(
    (category: any) => category.areaName === 'news'
  );
  const allCategories = filteredCategory?.map(
    (category: any) => category.category
  );

  const [refreshing, setRefreshing] = useState(false);

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

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTargetNews, setShareTargetNews] = useState<any | null>(null);

  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>(
    {}
  );
  const [translatedArticles, setTranslatedArticles] = useState<
    Record<number, Record<string, Partial<any>>>
  >({});
  const [loveReacts, setLoveReacts] = useState<
    Record<number, { count: number; loved: boolean }>
  >({});
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    allLanguages[0]
  );
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const initialNewsData: any[] = [
    {
      id: 1,
      title: 'বৈদিক শিক্ষার নতুন পাঠক্রম চালু',
      summary:
        'আগামী শিক্ষাবর্ষ থেকে বৈদিক শিক্ষার নতুন পাঠক্রম চালু করা হবে। এই পাঠক্রমে সংস্কৃত ভাষা, বেদ, উপনিষদ, গীতা এবং অন্যান্য প্রাচীন গ্রন্থের শিক্ষা অন্তর্ভুক্ত করা হয়েছে।',
      content: `আগামী শিক্ষাবর্ষ থেকে বৈদিক শিক্ষার নতুন পাঠক্রম চালু করা হবে। এই পাঠক্রমে সংস্কৃত ভাষা, বেদ, উপনিষদ, গীতা এবং অন্যান্য প্রাচীন গ্রন্থের শিক্ষা অন্তর্ভুক্ত করা হয়েছে। নতুন পাঠক্রমের মাধ্যমে শিক্ষার্থীরা প্রাচীন ভারতীয় জ্ঞান ও দর্শনের সাথে পরিচিত হতে পারবে। এছাড়াও যোগ, আয়ুর্বেদ এবং ধ্যানের মতো বিষয়গুলিও শিক্ষা দেওয়া হবে। পাঠক্রমটি আধুনিক শিক্ষা পদ্ধতির সাথে সামঞ্জস্যপূর্ণভাবে তৈরি করা হয়েছে। ডিজিটাল মাধ্যমে শিক্ষাদান এবং অনলাইন কোর্সের ব্যবস্থাও থাকবে। এই উদ্যোগটি শিক্ষার্থীদের মধ্যে ভারতীয় সংস্কৃতির প্রতি আগ্রহ বাড়াতে সাহায্য করবে এবং তাদের নৈতিক ও আধ্যাত্মিক বিকাশে সহায়ক হবে।`,
      image:
        'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'March 15, 2024',
      views: '2.5K',
      category: 'Education',
    },
    {
      id: 2,
      title: 'সনাতন ধর্মের মূল্যবোধ শিক্ষা কর্মশালা',
      summary:
        'আগামী সপ্তাহে অনুষ্ঠিত হবে সনাতন ধর্মের মূল্যবোধ শিক্ষা বিষয়ক কর্মশালা। এই কর্মশালায় বিভিন্ন বিশেষজ্ঞ ও পণ্ডিতগণ অংশগ্রহণ করবেন।',
      content: `আগামী সপ্তাহে অনুষ্ঠিত হবে সনাতন ধর্মের মূল্যবোধ শিক্ষা বিষয়ক কর্মশালা। এই কর্মশালায় বিভিন্ন বিশেষজ্ঞ ও পণ্ডিতগণ অংশগ্রহণ করবেন। কর্মশালায় সনাতন ধর্মের মৌলিক মূল্যবোধ, নৈতিক শিক্ষা এবং আধ্যাত্মিক উন্নয়নের বিষয়ে আলোচনা করা হবে। বিশেষ করে যুব সমাজের মধ্যে এই মূল্যবোধগুলি কীভাবে প্রচার করা যায় সে বিষয়ে গুরুত্ব দেওয়া হবে। অংশগ্রহণকারীদের জন্য বিনামূল্যে প্রশিক্ষণ সামগ্রী ও সার্টিফিকেট প্রদান করা হবে। কর্মশালাটি অনলাইন এবং অফলাইন উভয় মাধ্যমেই পরিচালিত হবে।`,
      image:
        'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'March 14, 2024',
      views: '1.8K',
      category: 'Event',
    },
    {
      id: 3,
      title: 'যোগ ও ধ্যান শিবির',
      summary:
        'প্রতি শনিবার সকালে অনুষ্ঠিত হবে যোগ ও ধ্যান শিবির। এই শিবিরে অভিজ্ঞ যোগ শিক্ষক ও ধ্যান গুরুরা উপস্থিত থাকবেন।',
      content: `প্রতি শনিবার সকালে অনুষ্ঠিত হবে যোগ ও ধ্যান শিবির। এই শিবিরে অভিজ্ঞ যোগ শিক্ষক ও ধ্যান গুরুরা উপস্থিত থাকবেন। শিবিরে অংশগ্রহণকারীরা বিভিন্ন যোগাসন, প্রাণায়াম এবং ধ্যান পদ্ধতি শিখতে পারবেন। এছাড়াও স্বাস্থ্যকর জীবনযাপন ও মানসিক শান্তি বিষয়ে পরামর্শ দেওয়া হবে। সকল বয়সের মানুষের জন্য এই শিবির উন্মুক্ত। আগ্রহীরা অনলাইনে রেজিস্ট্রেশন করতে পারবেন। শিবিরের শেষে একটি বিশেষ মেডিটেশন সেশনের আয়োজন করা হবে।`,
      image:
        'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'March 13, 2024',
      views: '3.2K',
      category: 'Health',
    },
    {
      id: 4,
      title: 'প্রাচীন মন্দির সংরক্ষণ প্রকল্প',
      summary:
        'ঐতিহাসিক মন্দিরগুলি সংরক্ষণের জন্য একটি নতুন প্রকল্প শুরু হয়েছে। এই প্রকল্পের মাধ্যমে প্রাচীন স্থাপত্য ও সাংস্কৃতিক ঐতিহ্য রক্ষা করা হবে।',
      content: `ঐতিহাসিক মন্দিরগুলি সংরক্ষণের জন্য একটি নতুন প্রকল্প শুরু হয়েছে। এই প্রকল্পের মাধ্যমে প্রাচীন স্থাপত্য ও সাংস্কৃতিক ঐতিহ্য রক্ষা করা হবে। প্রকল্পটি সরকারি ও বেসরকারি উদ্যোগে যৌথভাবে পরিচালিত হচ্ছে। প্রথম পর্যায়ে ১০টি প্রাচীন মন্দির নির্বাচন করা হয়েছে যেগুলি অবিলম্বে সংরক্ষণের প্রয়োজন। বিশেষজ্ঞ স্থপতি ও ঐতিহাসিকদের একটি দল এই কাজে নিয়োজিত হবেন। প্রকল্পের অংশ হিসেবে মন্দিরগুলির ডিজিটাল ডকুমেন্টেশন এবং ৩ডি মডেলিং-এর কাজও করা হবে। এছাড়া স্থানীয় সম্প্রদায়কে সংরক্ষণ কাজে সম্পৃক্ত করার উদ্যোগ নেওয়া হয়েছে।`,
      image:
        'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'March 12, 2024',
      views: '1.5K',
      category: 'Culture',
    },
    {
      id: 5,
      title: 'আধ্যাত্মিক গ্রন্থের ডিজিটাল সংরক্ষণ উদ্যোগ',
      summary:
        'প্রাচীন আধ্যাত্মিক গ্রন্থগুলি ডিজিটাল আকারে সংরক্ষণের একটি বৃহৎ প্রকল্প শুরু হয়েছে। এই উদ্যোগের মাধ্যমে দুর্লভ পাণ্ডুলিপিগুলি সংরক্ষণ ও সর্বজনীন করা হবে।',
      content: `প্রাচীন আধ্যাত্মিক গ্রন্থগুলি ডিজিটাল আকারে সংরক্ষণের একটি বৃহৎ প্রকল্প শুরু হয়েছে। এই উদ্যোগের মাধ্যমে দুর্লভ পাণ্ডুলিপিগুলি সংরক্ষণ ও সর্বজনীন করা হবে। বিভিন্ন মঠ, মন্দির ও প্রাচীন গ্রন্থাগারে সংরক্ষিত বেদ, উপনিষদ, পুরাণ, তন্ত্র এবং অন্যান্য আধ্যাত্মিক গ্রন্থগুলি উচ্চ রেজোলিউশনে স্ক্যান করে ডিজিটাল আর্কাইভে সংরক্ষণ করা হবে। এছাড়া এই গ্রন্থগুলির অনুবাদ ও ব্যাখ্যাও ডিজিটাল প্ল্যাটফর্মে উপলব্ধ করা হবে। প্রকল্পের প্রথম পর্যায়ে ৫০০টি দুর্লভ পাণ্ডুলিপি ডিজিটাইজ করা হবে। এই উদ্যোগের ফলে বিশ্বব্যাপী গবেষক ও আগ্রহীরা এই মূল্যবান জ্ঞানভাণ্ডারে সহজেই প্রবেশাধিকার পাবেন।`,
      image:
        'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
      date: 'March 10, 2024',
      views: '2.1K',
      category: 'Spirituality',
    },
  ];

  const [newsFeed, setNewsFeed] = useState<any[]>(initialNewsData);

  useEffect(() => {
    const initialLoveReacts: Record<number, { count: number; loved: boolean }> =
      {};
    newsFeed.forEach((article) => {
      initialLoveReacts[article.id] = {
        count: Math.floor(Math.random() * 100) + 10,
        loved: false,
      };
    });
    setLoveReacts(initialLoveReacts);
  }, [newsFeed]);

  const translateArticleIfNeeded = useCallback(
    async (article: any, targetLang: Language) => {
      if (targetLang.code === 'bn') {
        setTranslatedArticles((prev) => ({
          ...prev,
          [article.id]: {
            ...prev[article.id],
            [targetLang.code]: {
              title: article.title,
              summary: article.summary,
              content: article.content,
            },
          },
        }));
        return;
      }

      const translationKey = `${article.id}_${targetLang.code}`;
      if (translatedArticles[article.id]?.[targetLang.code]?.content) return;

      setIsTranslating((prev) => ({ ...prev, [translationKey]: true }));
      try {
        const [titleRes, summaryRes, contentRes] = await Promise.all([
          TranslationService.translate({
            sourceText: article.title,
            targetLanguageCode: targetLang.code,
            targetLanguageName: targetLang.name,
            sourceLanguageCode: 'bn',
            sourceLanguageName: 'Bengali',
          }),
          TranslationService.translate({
            sourceText: article.summary,
            targetLanguageCode: targetLang.code,
            targetLanguageName: targetLang.name,
            sourceLanguageCode: 'bn',
            sourceLanguageName: 'Bengali',
          }),
          TranslationService.translate({
            sourceText: article.content,
            targetLanguageCode: targetLang.code,
            targetLanguageName: targetLang.name,
            sourceLanguageCode: 'bn',
            sourceLanguageName: 'Bengali',
          }),
        ]);
        setTranslatedArticles((prev) => ({
          ...prev,
          [article.id]: {
            ...prev[article.id],
            [targetLang.code]: {
              title: titleRes.translatedText,
              summary: summaryRes.translatedText,
              content: contentRes.translatedText,
            },
          },
        }));
      } catch (error) {
        console.error(
          `Error translating article ${article.id} to ${targetLang.name}:`,
          error
        );
      } finally {
        setIsTranslating((prev) => ({ ...prev, [translationKey]: false }));
      }
    },
    [translatedArticles]
  );

  useEffect(() => {
    newsFeed.forEach((article) => {
      translateArticleIfNeeded(article, currentLanguage);
    });
  }, [currentLanguage, newsFeed, translateArticleIfNeeded]);

  const handleOpenArticleModal = (article: any) => {
    triggerHaptic();
    setSelectedNewsItem(article);
    setIsArticleModalOpen(true);
  };

  const handleLoveReact = (articleId: number) => {
    triggerHaptic();
    setLoveReacts((prev) => {
      const currentReact = prev[articleId] || { count: 0, loved: false };
      return {
        ...prev,
        [articleId]: {
          count: currentReact.loved
            ? currentReact.count - 1
            : currentReact.count + 1,
          loved: !currentReact.loved,
        },
      };
    });
  };

  const handleShare = (newsItem: any) => {
    triggerHaptic();
    setShareTargetNews(newsItem);
    setShowShareModal(true);
  };

  const handleSharePlatform = (platform: string) => {
    if (!shareTargetNews) return;

    const url = 'https://akfbd.org/news';
    const text = encodeURIComponent(
      translatedArticles[shareTargetNews.id]?.[currentLanguage.code]?.title ||
        shareTargetNews.title
    );
    const summary = encodeURIComponent(
      translatedArticles[shareTargetNews.id]?.[currentLanguage.code]?.summary ||
        shareTargetNews.summary
    );

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}&quote=${text}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
          url
        )}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          url
        )}&title=${text}&summary=${summary}`;
        break;
      case 'copy':
        if (Platform.OS === 'web') {
          navigator.clipboard
            .writeText(
              `${
                translatedArticles[shareTargetNews.id]?.[currentLanguage.code]
                  ?.title || shareTargetNews.title
              } - ${url}`
            )
            .then(() => alert('Link copied to clipboard!'))
            .catch((err) => console.error('Failed to copy: ', err));
        } else {
          alert('Copy to clipboard is not available on this platform');
        }
        setShowShareModal(false);
        return;
    }

    if (Platform.OS === 'web' && shareUrl) {
      window.open(
        shareUrl,
        '_blank',
        'noopener,noreferrer,width=600,height=400'
      );
    } else {
      console.log('Share URL:', shareUrl);
    }

    setShowShareModal(false);
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  console.log(selectedNewsItem, 'hi');

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <LinearGradient colors={colors.headerBackground} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Spiritual News</Text>
            <Text style={styles.headerSubtitle}>আধ্যাত্মিক সংবাদ</Text>
          </View>
          <TouchableOpacity onPress={triggerHaptic}>
            <Filter size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Search and Language Section */}
        <View
          style={[
            styles.searchSection,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <View style={styles.searchContainer}>
            <View
              style={[styles.searchBar, { backgroundColor: colors.background }]}
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
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                setSelectedCategory('');
              }}
              style={[
                styles.categoryChip,
                selectedCategory === '' && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === '' && styles.categoryTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {allCategories?.map((category: string) => (
              <View>
                <TouchableOpacity
                  key={category}
                  onPress={() => {
                    triggerHaptic();
                    setSelectedCategory(category);
                  }}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* News Articles */}
          <View style={styles.articlesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Latest Articles
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.secondaryText }]}
            >
              সর্বশেষ নিবন্ধসমূহ
            </Text>

            {isLoading ? (
              <LoadingComponent loading="Programs" color={colors.primary} />
            ) : data?.data?.length === 0 &&
              !Object.values(isTranslating).some((v) => v) ? (
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
              data?.data?.map((article: any) => {
                const translationKey = `${article.id}_${currentLanguage.code}`;
                const isLoadingTranslation = isTranslating[translationKey];
                const translated =
                  translatedArticles[article.id]?.[currentLanguage.code];
                const displayTitle = translated?.title || article.title;
                const displaySummary = translated?.summary || article.summary;
                const { count: loveCount, loved: userLoved } = loveReacts[
                  article.id
                ] || { count: 0, loved: false };
                const categoryIndex = baseEnglishCategories.indexOf(
                  article.category
                );

                return (
                  <TouchableOpacity
                    key={article.id}
                    style={[
                      styles.articleCard,
                      {
                        backgroundColor: colors.card,
                        shadowColor: colors.cardShadow,
                      },
                    ]}
                    onPress={() => handleOpenArticleModal(article)}
                  >
                    <Image
                      source={{ uri: article.imageUrl }}
                      style={styles.articleImage}
                    />

                    <View style={styles.articleContent}>
                      <View style={styles.articleHeader}>
                        <Text style={styles.categoryBadgeText}>
                          {article?.category}
                        </Text>
                        <Text
                          style={[
                            styles.publishTime,
                            { color: colors.secondaryText },
                          ]}
                        >
                          {formatDate(article.createdAt)}
                        </Text>
                      </View>

                      <Text
                        style={[styles.articleTitle, { color: colors.text }]}
                      >
                        {isLoadingTranslation && !translated?.title ? (
                          <Loader size={16} color={colors.primary} />
                        ) : (
                          displayTitle
                        )}
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
                        {isLoadingTranslation && !translated?.summary ? (
                          <Loader size={14} color={colors.primary} />
                        ) : (
                          displaySummary
                        )}
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
                              handleLoveReact(article.id);
                            }}
                          >
                            <Heart
                              size={20}
                              color={
                                userLoved ? colors.error : colors.secondaryText
                              }
                              fill={userLoved ? '#EF4444' : 'none'}
                            />
                            <Text
                              style={[
                                styles.actionText,
                                { color: colors.secondaryText },
                                userLoved && { color: colors.error },
                              ]}
                            >
                              {loveCount}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleShare(article);
                            }}
                          >
                            <Share2 size={20} color={colors.secondaryText} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.tagsContainer}>
                        {article?.tags?.map((tag: string, index: number) => (
                          <View
                            key={index}
                            style={[
                              styles.tag,
                              { backgroundColor: colors.info + '20' },
                            ]}
                          >
                            <Text
                              style={[styles.tagText, { color: colors.info }]}
                            >
                              #{tag}
                            </Text>
                          </View>
                        ))}
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
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {translatedArticles[selectedNewsItem.id]?.[
                      currentLanguage.code
                    ]?.title || selectedNewsItem.title}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setIsArticleModalOpen(false)}
                  >
                    <X size={24} color={colors.secondaryText} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={[styles.modalContent, { padding: 10 }]}>
                  <Image
                    source={{ uri: selectedNewsItem.imageUrl }}
                    style={styles.modalImage}
                  />

                  <View style={[styles.articleHeader, { marginTop: 10 }]}>
                    <Text style={styles.categoryBadgeText}>
                      {selectedNewsItem?.category}
                    </Text>
                    <Text
                      style={[
                        styles.publishTime,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {formatDate(selectedNewsItem.createdAt)}
                    </Text>
                  </View>

                  {selectedNewsItem.excerpt ? (
                    <Text
                      style={[
                        styles.articleExcerpt,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {selectedNewsItem.excerpt}
                    </Text>
                  ) : null}

                  {/* <View style={styles.articleModalContent}>
                  <Text
                    style={[styles.articleModalText, { color: colors.text }]}
                  >
                    {isTranslating[
                      `${selectedNewsItem.id}_${currentLanguage.code}`
                    ] ? (
                      <View style={styles.loadingContainer}>
                        <Loader size={24} color={colors.primary} />
                        <Text
                          style={[
                            styles.loadingText,
                            { color: colors.secondaryText },
                          ]}
                        >
                          Translating content...
                        </Text>
                      </View>
                    ) : (
                      translatedArticles[selectedNewsItem.id]?.[
                        currentLanguage.code
                      ]?.content || selectedNewsItem.content
                    )}
                  </Text>
                </View> */}

                  <NewsContent htmlContent={selectedNewsItem.content} />
                  {/* <Text
                        style={[
                          styles.articleExcerpt,
                          { color: "#000" },
                        ]}
                      >
                        {selectedNewsItem.content}
                      </Text> */}
                </ScrollView>

                <View
                  style={[
                    styles.modalFooter,
                    { borderTopColor: colors.border },
                  ]}
                >
                  <View style={styles.footerInfo}>
                    <Text
                      style={[
                        styles.footerText,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {selectedNewsItem.date} • {selectedNewsItem.views} views
                    </Text>
                  </View>
                  <View style={styles.footerActions}>
                    <TouchableOpacity
                      style={[
                        styles.footerButton,
                        { backgroundColor: colors.background },
                        loveReacts[selectedNewsItem.id]?.loved && {
                          backgroundColor: colors.error + '20',
                        },
                      ]}
                      onPress={() => handleLoveReact(selectedNewsItem.id)}
                    >
                      <Heart
                        size={20}
                        color={
                          loveReacts[selectedNewsItem.id]?.loved
                            ? colors.error
                            : colors.secondaryText
                        }
                        fill={
                          loveReacts[selectedNewsItem.id]?.loved
                            ? colors.error
                            : 'none'
                        }
                      />
                      <Text
                        style={[
                          styles.footerButtonText,
                          { color: colors.secondaryText },
                          loveReacts[selectedNewsItem.id]?.loved && {
                            color: colors.error,
                          },
                        ]}
                      >
                        {loveReacts[selectedNewsItem.id]?.count || 0}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.footerButton,
                        { backgroundColor: colors.background },
                      ]}
                      onPress={() => {
                        handleShare(selectedNewsItem);
                        setIsArticleModalOpen(false);
                      }}
                    >
                      <Share2 size={20} color={colors.secondaryText} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Share Modal */}
        {showShareModal && shareTargetNews && (
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
                    style={[styles.shareOption, { backgroundColor: '#1877F2' }]}
                    onPress={() => handleSharePlatform('facebook')}
                  >
                    <Facebook size={24} color="#FFFFFF" />
                    <Text style={styles.shareOptionText}>Facebook</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.shareOption, { backgroundColor: '#1DA1F2' }]}
                    onPress={() => handleSharePlatform('twitter')}
                  >
                    <Twitter size={24} color="#FFFFFF" />
                    <Text style={styles.shareOptionText}>Twitter</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.shareOption, { backgroundColor: '#0A66C2' }]}
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
        )}

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
                  <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                    <X size={24} color={colors.secondaryText} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.languageList}>
                  {allLanguages.map((language) => (
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
    </PullToRefreshWrapper>
  );
}

function getCategoryColor(index: number): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6', // teal
    '#F59E0B', // amber
  ];
  return colors[index % colors.length];
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
    paddingVertical: 12,
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
