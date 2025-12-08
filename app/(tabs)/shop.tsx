import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Mic,
  CircleStop as StopCircle,
  Heart,
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  Star,
  X,
  ExternalLink,
  Filter,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ShopBanner, ShopCategory, ShopProduct } from '../../types/shop';
import {
  MOCK_SHOP_BANNERS,
  MOCK_SHOP_CATEGORIES,
  MOCK_SHOP_PRODUCTS,
} from '../../data/shopMockData';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllCategoriesQuery } from '@/redux/features/Categories/categoriesApi';
import Categories from '@/components/Reusable/Categories/Categories';
import {
  useGetAllProductsQuery,
  useUpdateProductClicksMutation,
} from '@/redux/features/Products/productApi';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import AppHeader from '@/components/Reusable/AppHeader/AppHeader';
import SkeletonLoader from '@/components/Reusable/SkeletonLoader';
import { useGetAllProductBannersQuery } from '@/redux/features/ProductBannerApi/productBannerApi';
import { Animated } from 'react-native';

const { width } = Dimensions.get('window');

export default function ShopPage() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [productToBuy, setProductToBuy] = useState<ShopProduct | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { data: banners, isLoading: isBannerLoading } =
    useGetAllProductBannersQuery({});
  const recognitionRef = useRef<any>(null);
  const {
    data: products,
    isLoading: isLoadingProducts,
    isFetching,
  } = useGetAllProductsQuery({
    keyword: searchQuery,
    category: selectedCategory,
  });
  console.log(banners, 'banner ');
  const {
    data: categoryData,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useGetAllCategoriesQuery({});
  const filteredCategory = categoryData?.data?.filter(
    (category: any) => category.areaName === 'product'
  );
  const allCategories = filteredCategory?.map(
    (category: any) => category.category
  );
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Auto-scroll banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % MOCK_SHOP_BANNERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleVoiceSearch = () => {
    
  };

  const [updateProductClicks] = useUpdateProductClicksMutation();
  const handleBuyNowClick = (product: ShopProduct) => {
    triggerHaptic();
    setProductToBuy(product);
    setShowConfirmationModal(true);
  };

  const handleConfirmPurchase = async (product: ShopProduct) => {
    triggerHaptic();

    try {
      // First update clicks
      await updateProductClicks(product._id).unwrap();
      if (Platform.OS === 'web') {
        window.open(product.productLink, '_blank');
      } else {
        Linking.openURL(product.productLink).catch((err) =>
          console.error('Failed to open link: ', err)
        );
      }
    } catch (err) {
      console.error('Failed to update clicks:', err);
    }

    setShowConfirmationModal(false);
  };

  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerValue]);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <Header />

        <AppHeader title="Spiritual Shop" colors={['#8B5CF6', '#7C3AED']} />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={[{ backgroundColor: colors.background }]}>
          <View style={styles.searchContainer}>
            <View
              style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Search size={20} color="#718096" />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search product..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#A0AEC0"
              />
              {/* <TouchableOpacity
                onPress={handleVoiceSearch}
                style={[
                  styles.voiceButton,
                  isListening && styles.voiceButtonActive,
                ]}
              >
                {isListening ? (
                  <StopCircle size={18} color="#EF4444" />
                ) : (
                  <Mic size={18} color="#38A169" />
                )}
              </TouchableOpacity> */}
            </View>
          </View>
          {isListening && (
            <View style={styles.listeningIndicator}>
              <View style={styles.listeningDot} />
              <Text style={styles.listeningText}>Listening...</Text>
            </View>
          )}
        </View>

        {/* Banners */}
        <View style={styles.bannersSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (width * 1)
              );
              setCurrentBannerIndex(index);
            }}
          >
            {isBannerLoading ? (
              <SkeletonLoader
                height={180}
                width={'95%'}
                innerSkeleton={
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'flex-end',
                      padding: 12,
                      backgroundColor: 'rgba(0,0,0,0.05)',
                    }}
                  >
                    {/* Title placeholder */}
                    <View
                      style={{
                        width: '70%',
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: '#d6d6d6',
                        marginBottom: 6,
                      }}
                    />
                    {/* Description placeholder */}
                    <View
                      style={{
                        width: '90%',
                        height: 12,
                        borderRadius: 8,
                        backgroundColor: '#d6d6d6',
                        marginBottom: 6,
                      }}
                    />
                    <View
                      style={{
                        width: '50%',
                        height: 12,
                        borderRadius: 8,
                        backgroundColor: '#d6d6d6',
                      }}
                    />
                  </View>
                }
              />
            ) : (
              banners?.data?.map((banner) => (
                <View
                  key={banner.id}
                  style={[styles.bannerSlide, { width: width * 0.85 }]}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primary + 'CC']}
                    style={styles.banner}
                  >
                    <View style={styles.bannerContent}>
                      <Text
                        style={[styles.bannerTitle, { color: colors.text }]}
                      >
                        {banner.title}
                      </Text>
                      <Text
                        style={[
                          styles.bannerDescription,
                          { color: colors.text },
                        ]}
                      >
                        {banner.description}
                      </Text>
                      <View style={styles.bannerActions}>
                        <TouchableOpacity
                          onPress={() => {
                            if (Platform.OS === 'web') {
                              // For web, open in a new tab
                              window.open(banner.link, '_blank');
                            } else {
                              // For mobile, use Linking
                              Linking.openURL(banner.link).catch((err) => {
                                console.error('Failed to open link:', err);
                              });
                            }
                          }}
                          style={[
                            styles.ctaButton,
                            { backgroundColor: 'white' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.ctaButtonText,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Shop now
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Image
                      source={{ uri: banner.imageUrl }}
                      style={styles.bannerImage}
                    />
                  </LinearGradient>
                </View>
              ))
            )}
          </ScrollView>

          {/* Banner Indicators */}
          <View style={styles.bannerIndicators}>
            {banners?.data?.map((index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  index === currentBannerIndex && [
                    styles.activeIndicator,
                    { backgroundColor: colors.primary },
                  ],
                ]}
                onPress={() => {
                  setCurrentBannerIndex(index);
                  triggerHaptic();
                }}
              />
            ))}
          </View>
        </View>

        {/* Category Tabs */}
        <Categories
          setSelectedCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          allCategories={allCategories}
          bgColor={'#8B5CF6'}
          isLoading={isLoadingProducts}
        />

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Products
          </Text>
          <View style={{ paddingVertical: 8 }} />
          <View style={styles.productsGrid}>
            {isLoadingProducts || isFetching ? (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: 6,
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={{
                      width: '48%',
                      height: 200,
                      borderRadius: 12,
                      backgroundColor: colors.card,
                      opacity,
                      overflow: 'hidden',
                      marginBottom: 15,
                    }}
                  >
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
                            width: '40%',
                            height: 12,
                            backgroundColor: '#e0e0e0',
                            borderRadius: 6,
                          }}
                        />
                      </View>

                      <View
                        style={{
                          width: '100%',
                          height: 35,
                          backgroundColor: '#d6d6d6',
                          borderRadius: 8,
                          marginTop: 20,
                        }}
                      />
                    </View>
                  </Animated.View>
                ))}
              </View>
            ) : (
              // 🛍️ Product Grid
              products?.data?.products?.map((product: ShopProduct) => (
                <View
                  key={product?._id}
                  style={[
                    styles.productCard,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.cardShadow,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.productImageContainer,
                      { backgroundColor: product.imageBgColor },
                    ]}
                  >
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.productImage}
                    />
                    {product?.tags && (
                      <View
                        style={[
                          styles.productTag,
                          { backgroundColor: colors.error },
                        ]}
                      >
                        <Text style={styles.productTagText}>
                          {product?.tags}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.productContent}>
                    <Text
                      style={[
                        styles.productSubtitle,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {product?.category}
                    </Text>
                    <Text
                      style={[styles.productName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {product?.name}
                    </Text>

                    <View style={styles.productFooter}>
                      <View
                        style={[
                          styles.priceContainer,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Text
                          style={[styles.priceText, { color: colors.text }]}
                        >
                          {product.currency} {product?.price}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleBuyNowClick(product)}
                        style={[
                          styles.buyButton,
                          { backgroundColor: colors.text },
                        ]}
                      >
                        <ShoppingBag size={14} color={colors.background} />
                        <Text
                          style={[
                            styles.buyButtonText,
                            { color: colors.background },
                          ]}
                        >
                          BUY
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Purchase Confirmation Modal */}
      {showConfirmationModal && productToBuy && (
        <Modal
          visible={showConfirmationModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.confirmationModal,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.cardShadow,
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Confirm Purchase
                </Text>
                <TouchableOpacity
                  onPress={() => setShowConfirmationModal(false)}
                >
                  <X size={24} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <Image
                  source={{ uri: productToBuy.imageUrl }}
                  style={styles.modalProductImage}
                />
                <Text style={[styles.modalProductName, { color: colors.text }]}>
                  {productToBuy?.name}
                </Text>
                <Text
                  style={[styles.modalProductPrice, { color: colors.primary }]}
                >
                  {productToBuy.currency} {productToBuy?.price}
                </Text>

                <Text
                  style={[styles.modalMessage, { color: colors.secondaryText }]}
                >
                  You will be redirected to our main website to complete the
                  purchase. Do you want to continue?
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setShowConfirmationModal(false)}
                  >
                    <Text
                      style={[
                        styles.cancelButtonText,
                        { color: colors.secondaryText },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => {
                      handleConfirmPurchase(productToBuy);
                    }}
                  >
                    <ExternalLink size={16} color="#FFFFFF" />
                    <Text style={styles.confirmButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#8B5CF6',
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
    color: '#E9D5FF',
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 32,
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
    flex: 1,
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
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  voiceButton: {
    padding: 4,
  },
  voiceButtonActive: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  listeningText: {
    fontSize: 12,
  },
  bannersSection: {
    paddingVertical: 16,
    position: 'relative',
  },
  bannerSlide: {
    paddingHorizontal: 16,
  },
  banner: {
    height: 180,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 16,
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  ctaButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ctaButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerImage: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 120,
    height: 120,
    resizeMode: 'contain',
    opacity: 0.8,
  },
  bannerIndicators: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    width: 20,
  },
  categoriesSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    backdropFilter: 'blur(10px)',
  },
  categoryChipActive: {
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  productsSection: {
    paddingHorizontal: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: '48%',
    borderRadius: 16,
    padding: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
    backdropFilter: 'blur(10px)',
  },
  productImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    height: 140,
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    padding: 8,
  },
  productTag: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  productTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 6,
    backdropFilter: 'blur(10px)',
  },
  productContent: {
    paddingHorizontal: 4,
  },
  productSubtitle: {
    fontSize: 10,
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reviewsText: {
    fontSize: 10,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backdropFilter: 'blur(10px)',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  buyButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  confirmationModal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    backdropFilter: 'blur(20px)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    alignItems: 'center',
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalProductPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
