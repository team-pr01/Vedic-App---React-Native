import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Star,
  Search,
  BookOpen,
  Heart,
  Bell,
  Menu,
  Mic,
  Filter,
  Utensils,
  Building,
  Sparkles,
  Chrome as HomeIcon,
  TreePine,
  Calendar,
  Clock,
  School,
  Church as Temple,
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
import { RootState } from '@/redux/store';

const { width } = Dimensions.get('window');

const heroImages = [
  {
    url: 'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Sacred Wisdom',
    subtitle: 'পবিত্র জ্ঞান',
    description: 'Discover ancient teachings',
  },
  {
    url: 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Inner Peace',
    subtitle: 'অন্তর্নিহিত শান্তি',
    description: 'Find your spiritual path',
  },
  {
    url: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Divine Connection',
    subtitle: 'ঐশ্বরিক সংযোগ',
    description: 'Connect with the eternal',
  },
];

const services = [
  {
    id: 'yoga',
    name: 'Yoga',
    icon: TreePine,
    color: '#E53E3E',
    gradient: ['#E53E3E', '#C53030'],
    route: '/pages/yoga',
  },
  {
    id: 'sanatan',
    name: 'Sanatan Sthal',
    icon: Temple,
    color: '#3182CE',
    gradient: ['#3182CE', '#2C5282'],
    route: '/pages/sanatan-sthal',
  },
  {
    id: 'food',
    name: 'Food',
    icon: Utensils,
    color: '#38A169',
    gradient: ['#38A169', '#2F855A'],
    route: '/pages/food',
  },
  {
    id: 'shop',
    name: 'Shop',
    icon: ShoppingBag,
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    route: null, // Special handling for shop
  },
  {
    id: 'vastu',
    name: 'Vastu',
    icon: Star,
    color: '#805AD5',
    gradient: ['#805AD5', '#6B46C1'],
    route: '/pages/vastu',
  },
  {
    id: 'jyotish',
    name: 'Jyotish',
    icon: Star,
    color: '#D53F8C',
    gradient: ['#D53F8C', '#B83280'],
    route: '/pages/jyotish',
  },
  {
    id: 'consultancy',
    name: 'Consultancy',
    icon: Sparkles,
    color: '#DD6B20',
    gradient: ['#DD6B20', '#C05621'],
    route: '/pages/consultancy',
  },
];

const projects = [
  {
    id: 1,
    title: 'Community Kitchen Initiative',
    subtitle: 'সম্প্রদায়িক রান্নাঘর উদ্যোগ',
    description: 'Providing nutritious meals to those in need.',
    image:
      'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=400',
    collectedAmount: 250000,
    budget: 500000,
    supporters: 1250,
    deadlineDays: 30,
  },
  {
    id: 2,
    title: 'Vedic Library Center',
    subtitle: 'বৈদিক গ্রন্থাগার কেন্দ্র',
    description: 'A serene space for exploration of ancient wisdom.',
    image:
      'https://images.pexels.com/photos/481516/pexels-photo-481516.jpeg?auto=compress&cs=tinysrgb&w=400',
    collectedAmount: 175000,
    budget: 300000,
    supporters: 890,
    deadlineDays: 45,
  },
  {
    id: 3,
    title: 'Temple Restoration',
    subtitle: 'মন্দির পুনরুদ্ধার',
    description: 'Preserving our sacred heritage for future generations.',
    image:
      'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400',
    collectedAmount: 420000,
    budget: 800000,
    supporters: 2100,
    deadlineDays: 60,
  },
];

export default function HomeScreen() {
  const colors = useThemeColors();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<
    (typeof projects)[0] | null
  >(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [showShopModal, setShowShopModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState<string[]>([]);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await AsyncStorage.clear();
    dispatch(logout());
    setShowSettingsModal(false);
    console.log('logout called');
    router.push('/');
  };

  const user = useSelector(useCurrentUser);
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const formatBengaliDate = () => {
    const bengaliMonths = [
      'বৈশাখ',
      'জ্যৈষ্ঠ',
      'আষাঢ়',
      'শ্রাবণ',
      'ভাদ্র',
      'আশ্বিন',
      'কার্তিক',
      'অগ্রহায়ণ',
      'পৌষ',
      'মাঘ',
      'ফাল্গুন',
      'চৈত্র',
    ];
    const bengaliDays = [
      'রবি',
      'সোম',
      'মঙ্গল',
      'বুধ',
      'বৃহস্পতি',
      'শুক্র',
      'শনি',
    ];

    return `তিথি: ${bengaliDays[currentTime.getDay()]} ১৫, ${
      bengaliMonths[currentTime.getMonth()]
    } পক্ষ... | মাস: ${bengaliMonths[currentTime.getMonth()]}...`;
  };

  const handleServicePress = (serviceId: string, route?: string) => {
    triggerHaptic();
    if (serviceId === 'shop') {
      setShowShopModal(true);
    } else if (route) {
      router.push(route as any);
    } else {
      console.log(`Service pressed: ${serviceId}`);
    }
  };

  const handleTextPress = (textId: string) => {
    triggerHaptic();
    console.log(`Sacred text pressed: ${textId}`);
  };

  const handleProjectDonate = (project: (typeof projects)[0]) => {
    triggerHaptic();
    setSelectedProject(project);
    setShowDonationModal(true);
  };

  const handleMenuPress = () => {
    triggerHaptic();
    setShowSettingsModal(true);
  };

  const handleNotificationPress = () => {
    triggerHaptic();
    setShowNotificationModal(true);
    // When notifications are viewed, we can consider them as "read"
    setHasUnreadNotifications(false);
  };

  const handleProfilePress = () => {
    triggerHaptic();
    setShowUserProfileModal(true);
  };

  const handleNavigateToSettings = () => {
    setShowSettingsModal(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);

    // Filter content based on search query and active filters
    if (query.trim() || searchFilters.length > 0) {
      console.log('Search query:', query);
      console.log('Active filters:', searchFilters);

      // Here you can implement actual search logic
      // For example, filter services, texts, projects based on query and filters
    }
  };

  const handleApplyFilters = (filters: string[]) => {
    setSearchFilters(filters);
    console.log('Applied filters:', filters);

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
    console.log('Filter button clicked');
  };

  // const [panchangData, setPanchangData] = useState<any>(null);
  // const token = useSelector((state: RootState) => state.auth.token);
  // console.log(token, 'userData');

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <LinearGradient colors={colors.tabBarBackground} style={styles.header}>
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <Menu size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.dateContainer}>
          <View
            style={[
              styles.dateWrapper,
              {
                backgroundColor: `${colors.primary}20`,
                borderColor: `${colors.primary}40`,
              },
            ]}
          >
            <Calendar size={14} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.primary }]}>
              {formatBengaliDate()}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* <TouchableOpacity style={styles.headerButton} onPress={handleNotificationPress}>
            <Bell size={20} color={colors.text} />
            {hasUnreadNotifications && <View style={[styles.notificationBadge, { backgroundColor: colors.error }]} />}
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentHeroIndex(index);
            }}
          >
            {heroImages.map((hero, index) => (
              <View key={index} style={styles.heroSlide}>
                <Image source={{ uri: hero.url }} style={styles.heroImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.heroOverlay}
                >
                  <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>{hero.title}</Text>
                    <Text style={styles.heroSubtitle}>{hero.subtitle}</Text>
                    <Text style={styles.heroDescription}>
                      {hero.description}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>

          {/* Hero Indicators */}
          <View style={styles.heroIndicators}>
            {heroImages.map((_, index) => (
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
                  setCurrentHeroIndex(index);
                  triggerHaptic();
                }}
              />
            ))}
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar
          placeholderText="বৈদিক জ্ঞান, মন্দির, সংবাদ অনুসন্ধান করুন..."
          onSearch={handleSearch}
          onFilterClick={handleFilterClick}
          initialQuery={searchQuery}
          showFilter={true}
          filterOptions={searchFilterOptions}
          currentFilters={searchFilters}
          onApplyFilters={handleApplyFilters}
        />

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
                onPress={() => handleServicePress(service.id, service.route)}
              >
                <LinearGradient
                  colors={service.gradient}
                  style={styles.serviceIcon}
                >
                  <service.icon size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.serviceName, { color: colors.text }]}>
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sacred Texts Section */}
        <SacredTextsSection onTextClick={handleTextPress} />

        {/* Our Project Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: colors.primary }]}
            >{`Our Project"  ${user?.name}`}</Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.secondaryText }]}
            >
              আমাদের প্রকল্প
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.projectsContent}
          >
            {projects.map((project) => (
              <View key={project.id} style={styles.projectCard}>
                <Image
                  source={{ uri: project.image }}
                  style={styles.projectImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.projectOverlay}
                >
                  <View style={styles.projectContent}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <Text style={styles.projectSubtitle}>
                      {project.subtitle}
                    </Text>
                    <Text style={styles.projectDescription}>
                      {project.description}{' '}
                    </Text>

                    <View style={styles.projectProgress}>
                      <View style={styles.progressInfo}>
                        <Text style={styles.progressText}>
                          Raised: ৳{project.collectedAmount.toLocaleString()}
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
                                (project.collectedAmount / project.budget) * 100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.supportersText}>
                        {project.supporters} supporters
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.donateButton}
                      onPress={() => handleProjectDonate(project)}
                    >
                      <Heart size={16} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.donateText}>Donate Now</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onLogout={handleLogout}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        visible={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
        onNavigateToSettings={handleNavigateToSettings}
      />

      {/* Donation Modal */}
      <DonationModal
        isVisible={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        project={selectedProject}
      />

      {/* Notification Modal */}
      <NotificationModal
        isVisible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />

      {/* Shop Confirmation Modal */}
      <ShopConfirmationModal
        isVisible={showShopModal}
        onClose={() => setShowShopModal(false)}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    padding: 4,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  profileButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  content: {
    flex: 1,
  },
  heroContainer: {
    height: 240,
    position: 'relative',
  },
  heroSlide: {
    width: width,
    height: 240,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 14,
    color: '#CBD5E0',
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
    marginBottom: 32,
  },
  servicesContent: {
    paddingHorizontal: 16,
  },
  serviceItem: {
    alignItems: 'center',
    marginRight: 20,
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
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
    padding: 16,
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
