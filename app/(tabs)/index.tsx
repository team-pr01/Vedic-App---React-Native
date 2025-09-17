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
} from 'lucide-react-native';
import { ShoppingBag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import SacredTextsSection from '../../components/SacredTextsSection';
import SettingsModal from '../../components/SettingsModal';
import UserProfileModal from '../../components/UserProfileModal';
import SearchBar from '../../components/SearchBar';
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
import { useGetAllDonationProgramsQuery } from '@/redux/features/DonationPrograms/donationProgramApi';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getYouTubeVideoId } from '@/utils/getYouTubeVideoId';
import YogaIcon from '@/assets/icons/yoga.svg';
import TempleIcon from '@/assets/icons/temple.svg';
import VastuIcon from '@/assets/icons/house.svg';
import JyotishIcon from '@/assets/icons/astrology.svg';
import ConsultancyIcon from '@/assets/icons/expert.svg';
import Food from '@/assets/icons/food.svg';
import ShopIcon from '@/assets/icons/shop.svg';
import Header from '@/components/Reusable/HeaderMenuBar/HeaderMenuBar';

export type TContent = {
  _id: string;
  imageUrl?: string;
  videoUrl?: string;
};

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
    icon: TreePine ,
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
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState<string[]>([]);
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
    triggerHaptic(); if (route) {
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

  // const [panchangData, setPanchangData] = useState<any>(null);
  // const token = useSelector((state: RootState) => state.auth.token);

  // useEffect(() => {
  //   const fetchPanchang = async () => {
  //     try {
  //       const headers = new Headers();
  //       headers.set('Authorization', `Bearer ${token}`);

  //       const response = await fetch(
  //         'https://api.prokerala.com/v2/astrology/panchang?ayanamsa=1&date=2025-08-02&coordinates=23.8103,90.4125',
  //         {
  //           method: 'GET',
  //           headers,
  //         }
  //       );
  //       const data = await response.json();
  //       setPanchangData(data);
  //     } catch (error) {
  //       console.error('Error fetching Panchang:', error);
  //     }
  //   };

  //   fetchPanchang();
  // }, []);

  // console.log(panchangData, 'panchangData');

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Socket io connection for notifications
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
                  onScrollBeginDrag={() => {
                    setIsManualScrolling(true);
                  }}
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
                        console.log(
                          'Scrolling to index:',
                          index,
                          '=> x:',
                          index * width
                        );
                        console.log('ref:', scrollViewRef.current);
                      }}
                    />
                  ))}
                </View>
              </View>

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
                    <LoadingComponent
                      loading="Programs "
                      color={colors.primary}
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
                              {project.description}{' '}
                            </Text>

                            <View style={styles.projectProgress}>
                              {/* <View style={styles.progressInfo}>
                            <Text style={styles.progressText}>
                              Raised: ৳
                              {project.collectedAmount.toLocaleString()}
                            </Text>
                            <Text style={styles.progressGoal}>
                              Goal: ৳{project.budget.toLocaleString()}
                            </Text>
                          </View>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${
                                    (project.collectedAmount / project.budget) *
                                    100
                                  }%`,
                                },
                              ]}
                            />
                          </View> */}
                              {/* <Text style={styles.supportersText}>
                              {project.supporters} supporters
                            </Text> */}
                            </View>

                            {/* <TouchableOpacity
                            style={styles.donateButton}
                            onPress={() => handleProjectDonate(project)}
                          >
                            <Heart size={16} color="#FFFFFF" fill="#FFFFFF" />
                            <Text style={styles.donateText}>Donate Now</Text>
                          </TouchableOpacity> */}
                          </View>
                        </LinearGradient>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>

              <View style={styles.bottomSpacing} />
            </ScrollView>
          </SafeAreaView>
        </ScrollView>
      </PullToRefreshWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  donateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 20,
  },
});
