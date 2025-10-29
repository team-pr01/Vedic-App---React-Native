import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  RefreshControl,
  Modal,
  Alert,
  Button,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Menu,
  Calendar,
  Church as Temple,
  Bell,
  AlertTriangle,
  Newspaper,
  TreePine,
  Heart,
  X,
} from 'lucide-react-native';
import { ShoppingBag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import SacredTextsSection from '../../components/SacredTextsSection';
import SettingsModal from '../../components/SettingsModal';
import UserProfileModal from '../../components/UserProfileModal';
import DonationModal from '../../components/DonationModal';
import NotificationModal from '../../components/NotificationModal';
import ShopConfirmationModal from '../../components/ShopConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout, useCurrentUser } from '@/redux/features/Auth/authSlice';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGetAllContentsQuery } from '@/redux/features/Content/contentApi';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import { useGetAllBooksQuery } from '@/redux/features/Book/bookApi';
import { useGetAllPushNotificationForUserQuery } from '@/redux/features/Auth/authApi';
import { socket } from '@/utils/socket';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import {
  useAddPaymentProofMutation,
  useGetAllDonationProgramsQuery,
} from '@/redux/features/DonationPrograms/donationProgramApi';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getYouTubeVideoId } from '@/utils/getYouTubeVideoId';
import YogaIcon from '@/assets/icons/yoga.svg';
import TempleIcon from '@/assets/icons/temple.svg';
import VastuIcon from '@/assets/icons/house.svg';
import JyotishIcon from '@/assets/icons/astrology.svg';
import ConsultancyIcon from '@/assets/icons/expert.svg';
import Food from '@/assets/icons/food.svg';
import ShopIcon from '@/assets/icons/shop.svg';
import ResetPassword from '@/components/AuthPages/ResetPassword';
import { useForm } from 'react-hook-form';
import SkeletonLoader from '@/components/Reusable/SkeletonLoader';
import SearchBar from '@/components/Reusable/SearchBar';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';
import AIBanner from '@/components/AIBanner/AiBanner';

export type TContent = {
  _id: string;
  imageUrl?: string;
  videoUrl?: string;
};
interface DonationProgram {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  // Add other properties of a donation program if needed
}

// Define form values for the payment proof submission
interface PaymentProofFormValues {
  amount: string;
  currency: string;
  senderAccountNumber: string; // This corresponds to senderAccountNumber
  file: string | null;
  donationProgramId?: string;
  donationProgramTitle?: string;
  paymentMethod: string;
}

const width = Dimensions.get('window').width;

const services = [
  {
    id: 'yoga',
    name: 'Yoga',
    icon: YogaIcon,
    color: '#E53E3E',
    gradient: ['#E53E3E', '#C53030'],
    route: '/yoga',
  },
  {
    id: 'sanatan',
    name: 'Sanatan Sthal',
    icon: TempleIcon,
    color: '#3182CE',
    gradient: ['#3182CE', '#2C5282'],
    route: '/sanatan-sthal',
  },
  {
    id: 'food',
    name: 'Food',
    icon: Food,
    color: '#38A169',
    gradient: ['#38A169', '#2F855A'],
    route: '/food',
  },
  {
    id: 'shop',
    name: 'Shop',
    icon: ShopIcon,
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    route: '/shop',
  },
  {
    id: 'vastu',
    name: 'Vastu',
    icon: VastuIcon,
    color: '#805AD5',
    gradient: ['#805AD5', '#6B46C1'],
    route: '/vastu',
  },
  {
    id: 'jyotish',
    name: 'Jyotish',
    icon: JyotishIcon,
    color: '#D53F8C',
    gradient: ['#D53F8C', '#B83280'],
    route: '/jyotish',
  },
  {
    id: 'consultancy',
    name: 'Consultancy',
    icon: ConsultancyIcon,
    color: '#DD6B20',
    gradient: ['#DD6B20', '#C05621'],
    route: '/consultancy',
  },
  {
    id: 'ayurveda',
    name: 'Ayurveda',
    icon: TreePine,
    color: '#29C743',
    gradient: ['#29C743', '#21C03C'],
    route: '/ayurveda',
  },
];
const searchServices = [
  {
    id: 'yoga',
    name: 'Yoga',
    icon: YogaIcon,
    color: '#E53E3E',
    gradient: ['#E53E3E', '#C53030'],
    route: '/yoga',
  },
  {
    id: 'sanatan',
    name: 'Sanatan Sthal',
    icon: TempleIcon,
    color: '#3182CE',
    gradient: ['#3182CE', '#2C5282'],
    route: '/sanatan-sthal',
  },
  {
    id: 'food',
    name: 'Food',
    icon: Food,
    color: '#38A169',
    gradient: ['#38A169', '#2F855A'],
    route: '/food',
  },
  {
    id: 'shop',
    name: 'Shop',
    icon: ShopIcon,
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    route: null,
  },
  {
    id: 'vastu',
    name: 'Vastu',
    icon: VastuIcon,
    color: '#805AD5',
    gradient: ['#805AD5', '#6B46C1'],
    route: '/vastu',
  },
  {
    id: 'jyotish',
    name: 'Jyotish',
    icon: JyotishIcon,
    color: '#D53F8C',
    gradient: ['#D53F8C', '#B83280'],
    route: '/jyotish',
  },
  {
    id: 'consultancy',
    name: 'Consultancy',
    icon: ConsultancyIcon,
    color: '#DD6B20',
    gradient: ['#DD6B20', '#C05621'],
    route: '/consultancy',
  },
  {
    id: 'emergency',
    name: 'Emergency',
    icon: AlertTriangle,
    color: '#DD6B20',
    gradient: ['#DD6B20', '#C05621'],
    route: '/profile',
  },
  {
    id: 'news',
    name: 'News',
    icon: Newspaper,
    color: '#DD6B20',
    gradient: ['#DD6B20', '#C05621'],
    route: '/meditation',
  },
];

export const paymentCards = [
  {
    id: 'card-1',
    provider: 'bkash',
    logo: '/logos/bkash.png',
    accountName: 'Arya Kallayn Foundation',
    accountNumber: '01812-XXXXXX-001',
    qr: 'https://via.placeholder.com/150?text=bkash+QR',
  },
  {
    id: 'card-2',
    provider: 'Nagad',
    logo: '/logos/nagad.png',
    accountName: 'Arya Kallayn Foundation',
    accountNumber: '01711-XXXXXX-002',
    qr: 'https://via.placeholder.com/150?text=nagad+QR',
  },
  {
    id: 'card-4',
    provider: 'Stripe',
    logo: '/logos/stripe.png',
    accountName: 'Arya Kallayn Foundation',
    accountNumber: 'acct_1Hxxxxxx',
    qr: 'https://via.placeholder.com/150?text=stripe+QR',
  },
  {
    id: 'card-5',
    provider: 'PayPal',
    logo: '/logos/paypal.png',
    accountName: 'Arya Kallayn Foundation',
    accountNumber: 'paypal@prtech.com',
    qr: 'https://via.placeholder.com/150?text=paypal+QR',
  },
  {
    id: 'card-6',
    provider: 'Bank',
    logo: '/logos/bank.png',
    accountName: 'Arya Kallayn Foundation',
    accountNumber: '001234567890',
    qr: 'https://via.placeholder.com/150?text=bank+QR',
    note: 'Standard bank transfer (IBAN not required)',
  },
];

export default function HomeScreen() {
  const user = useSelector(useCurrentUser);
  const [filteredServices, setFilteredServices] = useState(searchServices);
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredServices(searchServices); // reset
    } else {
      const results = searchServices.filter((service) =>
        service.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredServices(results);
    }
  };

  const {
    data,
    isLoading,
    refetch: refetchContent,
  } = useGetAllContentsQuery({});
  const {
    data: bookData,
    isLoading: isBooksLoading,
    refetch: refetchBookData,
  } = useGetAllBooksQuery({});
  const {
    data: ProgramData,
    isLoading: isProgramLoading,
    refetch: refetchProgramData,
  } = useGetAllDonationProgramsQuery({});
  const { data: allPushNotifications, refetch: refetchAllPushNotifications } =
    useGetAllPushNotificationForUserQuery(user?._id);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        refetchContent(),
        refetchBookData(),
        refetchProgramData(),
        refetchAllPushNotifications(),
      ]);
    } catch (error) {
      console.error('Error while refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };
  const width = Dimensions.get('window').width;
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [donation, setDonation] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [paymentOptionModalOpen, setPaymentOptionModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await AsyncStorage.clear();
    dispatch(logout());
    setShowSettingsModal(false);
    router.push('/');
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const handleServicePress = (serviceId: string, route?: string) => {
    triggerHaptic();
    if (route) {
      router.push(route as any);
    } else {
      console.log(`Service pressed: ${serviceId}`);
    }
  };

  const handleTextPress = (textId: string) => {
    triggerHaptic();
  };

  const handleNavigateToSettings = () => {
    setShowSettingsModal(true);
  };

  const handleApplyFilters = (filters: string[]) => {
    setSearchFilters(filters);

    // Re-run search with new filters
    handleSearch(searchQuery);
  };

  const searchFilterOptions = [
    { id: 'all', name: 'All Categories' },
    { id: 'texts', name: 'Sacred Texts' },
    { id: 'temples', name: 'Temples' },
    { id: 'news', name: 'News' },
    { id: 'recipes', name: 'Recipes' },
    { id: 'yoga', name: 'Yoga' },
    { id: 'meditation', name: 'Meditation' },
    { id: 'vastu', name: 'Vastu' },
    { id: 'jyotish', name: 'Jyotish' },
    { id: 'consultancy', name: 'Consultancy' },
    { id: 'projects', name: 'Projects' },
  ];

  const handleFilterClick = () => {
    triggerHaptic();
  };

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Socket io connection for notifications
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setValue('imageUrl', result.assets[0].uri); // save picked image URI in form
    }
  };
  // console.log(notifications, "real time notification");
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket:', socket.id);
    });

    socket.on('new-push-notification', (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off('new-push-notification');
      socket.off('connect');
    };
  }, []);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PaymentProofFormValues>({
    defaultValues: {
      amount: '',
      currency: 'BDT', // Default currency
      senderAccountNumber: '',
      paymentMethod: '',
      donationProgramTitle: '',
      donationProgramId: '',
      file: null,
    },
  });
  const [addPaymentProof, { isSubmitLoading }] = useAddPaymentProofMutation();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      const imageUri = watch('imageUrl') || data.imageUrl;
      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';

        formData.append('file', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }
      // Append all string fields
      formData.append('donationProgramId', donation?.id);
      formData.append('donationProgramTitle', donation?.title);
      formData.append('amount', data.amount);
      formData.append('currency', data.curreny);
      formData.append('paymentMethod', paymentMethod?.provider);
      formData.append('senderAccountNumber', data.accountNumber);

      const response = await addPaymentProof(formData).unwrap();

      if (response?.success) {
        Alert.alert(
          'Temple added successfully. Temple will be listed if Admin approves.'
        );
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Something went wrong while adding the temple.');
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, }}>
      <Header />
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
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Section */}
              <View style={styles.heroContainer}>
                {isLoading ? (
                  // 🩶 Hero Skeleton Loader
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
                  >
                    <SkeletonLoader
                      width={width - 32}
                      height={230}
                      innerSkeleton={
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'flex-end',
                            padding: 16,
                            backgroundColor: 'rgba(0,0,0,0.05)',
                          }}
                        >
                          {/* Title placeholder */}
                          <View
                            style={{
                              width: '60%',
                              height: 18,
                              borderRadius: 6,
                              backgroundColor: '#d6d6d6',
                              marginBottom: 10,
                            }}
                          />
                          {/* Subtitle placeholder */}
                          <View
                            style={{
                              width: '80%',
                              height: 14,
                              borderRadius: 6,
                              backgroundColor: '#d6d6d6',
                            }}
                          />
                        </View>
                      }
                    />
                  </ScrollView>
                ) : (
                  <>
                    <ScrollView
                      ref={scrollViewRef}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onMomentumScrollEnd={(event) => {
                        const index = Math.round(
                          event.nativeEvent.contentOffset.x / width
                        );
                        setCurrentHeroIndex(index);
                        setIsManualScrolling(false);
                      }}
                      onScrollBeginDrag={() => setIsManualScrolling(true)}
                    >
                      {data?.data?.map((hero: TContent, index: number) => (
                        <View key={index} style={styles.heroSlide}>
                          {hero.videoUrl ? (
                            <YoutubePlayer
                              height={280}
                              play={false}
                              videoId={getYouTubeVideoId(hero.videoUrl)}
                            />
                          ) : (
                            <Image
                              source={{ uri: hero.imageUrl }}
                              style={styles.heroImage}
                            />
                          )}
                        </View>
                      ))}
                    </ScrollView>

                    {/* Hero Indicators */}
                    <View style={styles.heroIndicators}>
                      {data?.data?.map((_: any, index: number) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.indicator,
                            index === currentHeroIndex && [
                              styles.activeIndicator,
                              { backgroundColor: colors.info },
                            ],
                          ]}
                          onPress={() => {
                            scrollViewRef.current?.scrollTo({
                              x: index * width,
                              animated: true,
                            });
                            setCurrentHeroIndex(index);
                            triggerHaptic();
                          }}
                        />
                      ))}
                    </View>
                  </>
                )}
              </View>
              <AIBanner/>

              {/* Search Bar */}
              <SearchBar
                placeholderText="Search Yoga, Sanathan Sthal, Food, News... "
                onSearch={handleSearch}
                onFilterClick={handleFilterClick}
                initialQuery={searchQuery}
                showFilter={true}
                filterOptions={searchFilterOptions}
                currentFilters={searchFilters}
                onApplyFilters={handleApplyFilters}
              />
              {/* Search Results */}
              {searchQuery.length > 0 && (
                <View style={{ marginVertical: 12, marginHorizontal: 10 }}>
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <TouchableOpacity
                        key={service.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: '#eee',
                        }}
                        onPress={() =>
                          handleServicePress(service.id, service.route)
                        }
                      >
                        <LinearGradient
                          colors={service.gradient}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 10,
                          }}
                        >
                          <service.icon width={18} height={18} fill="#FFF" />
                        </LinearGradient>
                        <Text style={{ fontSize: 16 }}>{service.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={{ color: 'gray', padding: 10 }}>
                      No results found.
                    </Text>
                  )}
                </View>
              )}

              {/* Service Icons */}
              <View style={styles.servicesContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.servicesContent}
                >
                  {services.map((service, index) => (
                    <TouchableOpacity
                      key={service.id}
                      style={styles.serviceItem}
                      onPress={() =>
                        handleServicePress(service.id, service.route)
                      }
                    >
                      <LinearGradient
                        colors={service.gradient}
                        style={styles.serviceIcon}
                      >
                        <service.icon width={24} height={24} fill="#FFFFFF" />
                      </LinearGradient>
                      <Text
                        style={[styles.serviceName, { color: colors.text }]}
                      >
                        {service.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Sacred Texts Section */}
              <SacredTextsSection
                onTextClick={handleTextPress}
                data={bookData}
                isLoading={isBooksLoading}
              />

              {/* Our Project Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text
                    style={[styles.sectionTitle, { color: colors.success }]}
                  >
                    {'Our Project'}
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.projectsContent}
                >
                  {isProgramLoading ? (
                    <SkeletonLoader
                      width={300}
                      height={200}
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
                  ) : (ProgramData?.data?.length || 0) === 0 ? (
                    <Text style={{ color: colors.text }}>
                      Projects are coming soon! Stay tuned.
                    </Text>
                  ) : (
                    ProgramData?.data?.map((project: any) => (
                      <View key={project.id} style={styles.projectCard}>
                        <Image
                          source={{ uri: project.imageUrl }}
                          style={styles.projectImage}
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.projectOverlay}
                        >
                          <View style={styles.projectContent}>
                            <Text style={styles.projectTitle}>
                              {project.title}
                            </Text>
                            <Text style={styles.projectDescription}>
                              {project.description}
                            </Text>

                            <View style={styles.projectProgress}></View>

                            <TouchableOpacity
                              style={styles.donateButton}
                              onPress={() => {
                                setPaymentOptionModalOpen(true);
                                setDonation(project);
                              }}
                            >
                              <Heart size={16} color="#FFFFFF" fill="#FFFFFF" />
                              <Text style={styles.donateText}>Donate Now</Text>
                            </TouchableOpacity>
                          </View>
                        </LinearGradient>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>

              {paymentOptionModalOpen && (
                <Modal
                  visible={paymentOptionModalOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setPaymentOptionModalOpen(false)}
                >
                  <View style={styles.modalOverlay}>
                    {' '}
                    {/* This will make the background semi-transparent */}
                    <View style={styles.paymentOptionModalContent}>
                      {' '}
                      {/* This will be your actual modal box */}
                      <View
                        style={[
                          styles.modalHeader,
                          { borderBottomColor: colors.border },
                        ]}
                      >
                        <Text
                          style={[styles.modalTitle, { color: colors.text }]}
                        >
                          Select payment method
                        </Text>
                        <TouchableOpacity
                          onPress={() => setPaymentOptionModalOpen(false)}
                        >
                          <X size={24} color={colors.secondaryText} />
                        </TouchableOpacity>
                      </View>
                      {/* Add your payment options components here */}
                      <ScrollView contentContainerStyle={styles.container1}>
                        {paymentCards.map((card) => (
                          <TouchableOpacity
                            onPress={() => {
                              setPaymentMethod(card);
                              setPaymentOpen(true);
                              setPaymentOptionModalOpen(false);
                            }}
                            key={card.id}
                            style={styles.card}
                          >
                            {/* Left side */}
                            <View style={styles.leftSection}>
                              <View>
                                <Image
                                  source={{ uri: card.logo }}
                                  style={styles.logo}
                                />
                                <Text style={styles.accountName}>
                                  {card.accountName}
                                </Text>
                                <Text style={styles.accountNumber}>
                                  {card.accountNumber}
                                </Text>
                              </View>
                            </View>

                            {/* Right side (QR) */}
                            <View style={styles.qrBox1}>
                              <Image
                                source={{ uri: card.qr }}
                                style={styles.qrImage}
                              />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </Modal>
              )}

              {paymentOpen && (
                <Modal
                  visible={paymentOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setPaymentOpen(false)}
                >
                  <View style={styles.modalOverlay}>
                    {' '}
                    {/* This will make the background semi-transparent */}
                    <View style={styles.paymentOptionModalContent}>
                      {' '}
                      {/* This will be your actual modal box */}
                      <View
                        style={[
                          styles.modalHeader,
                          { borderBottomColor: colors.border },
                        ]}
                      >
                        <Text
                          style={[styles.modalTitle, { color: colors.text }]}
                        >
                          Donate
                        </Text>
                        <TouchableOpacity onPress={() => setPaymentOpen(false)}>
                          <X size={24} color={colors.secondaryText} />
                        </TouchableOpacity>
                      </View>
                      {/* Add your payment options components here */}
                      <ScrollView contentContainerStyle={styles.container1}>
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'column',
                            alignContent: 'flex-start',
                          }}
                        >
                          {/* Left side */}
                          <View style={styles.leftSection1}>
                            <View>
                              <Image
                                source={{ uri: paymentMethod?.logo }}
                                style={styles.logo}
                              />
                              <Text style={styles.accountName}>
                                {paymentMethod?.accountName}
                              </Text>
                              <Text style={styles.accountNumber}>
                                {paymentMethod?.accountNumber}
                              </Text>
                            </View>
                          </View>

                          {/* Right side (QR) */}
                          <View style={styles.qrBox}>
                            <Image
                              source={{ uri: paymentMethod?.qr }}
                              style={styles.qrImage1}
                            />
                          </View>
                          <View>
                            <Input
                              label="Currency"
                              name="currency"
                              setValue={setValue}
                              watch={watch}
                            />
                            <Input
                              label="Amount"
                              name="amount"
                              setValue={setValue}
                              watch={watch}
                            />
                            <View
                              style={{ marginBottom: 16, position: 'relative' }}
                            >
                              <Text style={styles.label}>Pick Cover Image</Text>
                              <Button
                                title="Pick Image from Gallery"
                                onPress={pickCoverImage}
                              />

                              {watch('file') && (
                                <Image
                                  source={{ uri: watch('file') }}
                                  style={{
                                    width: 200,
                                    height: 200,
                                    marginTop: 10,
                                    borderRadius: 8,
                                  }}
                                />
                              )}

                              {watch('file') && (
                                <TouchableOpacity
                                  style={styles.removeButton}
                                  onPress={() => setValue('file', '')}
                                >
                                  <Text
                                    style={[
                                      styles.removeText,
                                      { color: '#FF0000' },
                                    ]}
                                  >
                                    ×
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                            <View style={styles.buttonContainer}>
                              <Button
                                title={
                                  isSubmitLoading ? 'Submitting...' : 'Submit'
                                }
                                onPress={handleSubmit(onSubmit)}
                              />
                            </View>
                          </View>
                        </View>
                      </ScrollView>
                    </View>
                  </View>
                </Modal>
              )}

              <View style={styles.bottomSpacing} />
            </ScrollView>
          </SafeAreaView>
        </ScrollView>
      </PullToRefreshWrapper>
    </SafeAreaView>
  );
}
const Input = ({
  label,
  name,
  watch,
  setValue,
  multiline = false,
  keyboardType = 'default',
}: {
  label: string;
  name: any;
  watch: any;
  setValue: any;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}) => {
  const value = watch(name);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        multiline={multiline}
        keyboardType={keyboardType}
        onChangeText={(text) => setValue(name, text)}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container1: {
    padding: 20,
  },
  content: {
    flex: 1,
  },
  heroContainer: {
    height: 230,
    position: 'relative',
    marginTop: 54,
  },
  heroSlide: {
    width: width,
    height: 230,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 220,
    resizeMode: 'stretch',
  },
  heroVideo: {
    width: '100%',
    height: 230,
    resizeMode: 'stretch',
  },
  heroIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    width: 24,
  },
  servicesContainer: {
    marginBottom: 10,
  },
  servicesContent: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  serviceItem: {
    alignItems: 'center',
    marginRight: 5,
    width: 70,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  serviceName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 0,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
  },
  projectsContent: {
    paddingHorizontal: 16,
  },
  projectCard: {
    width: 300,
    height: 200,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  projectImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  projectOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
    justifyContent: 'flex-end',
  },
  projectContent: {
    paddingHorizontal: 16,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  projectSubtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 6,
  },
  projectDescription: {
    fontSize: 13,
    color: '#CBD5E0',
    marginBottom: 12,
  },
  projectProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressGoal: {
    fontSize: 12,
    color: '#E2E8F0',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00BCD4',
    borderRadius: 2,
  },
  supportersText: {
    fontSize: 11,
    color: '#CBD5E0',
  },
  donateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6F00',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 10,
  },
  donateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  paymentOptionModalContent: {
    width: '80%', // Adjust width as needed
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  leftSection1: {
    width: '100%',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  accountNumber: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  qrBox: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  qrBox1: {
    width: 70,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  qrImage1: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  removeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  removeButton: {
    position: 'absolute',
    top: 70,
    right: 140,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 35,
  },
  inputGroup: {
    marginBottom: 15,
  },
});
