import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Calendar, Users, Star, Clock, Heart, ArrowLeft, Filter } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';

const temples = [
  {
    id: 1,
    name: "Jagannath Temple",
    location: "Puri, Odisha",
    description: "One of the Char Dham pilgrimage sites, famous for the annual Rath Yatra",
    image: "https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.8,
    visitors: "2M+ yearly",
    established: "12th century",
    deity: "Lord Jagannath",
    festivals: ["Rath Yatra", "Snana Yatra"],
    category: "Char Dham",
    distance: "1,200 km"
  },
  {
    id: 2,
    name: "Kedarnath Temple",
    location: "Uttarakhand",
    description: "Sacred Jyotirlinga temple located in the Himalayas",
    image: "https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.9,
    visitors: "500K+ yearly",
    established: "8th century",
    deity: "Lord Shiva",
    festivals: ["Maha Shivaratri", "Kedarnath Yatra"],
    category: "Jyotirlinga",
    distance: "850 km"
  },
  {
    id: 3,
    name: "Vaishno Devi",
    location: "Jammu & Kashmir",
    description: "Holy shrine dedicated to Goddess Vaishno Devi",
    image: "https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.7,
    visitors: "8M+ yearly",
    established: "Ancient",
    deity: "Mata Vaishno Devi",
    festivals: ["Navratri", "Diwali"],
    category: "Shakti Peetha",
    distance: "950 km"
  },
  {
    id: 4,
    name: "Golden Temple",
    location: "Amritsar, Punjab",
    description: "The holiest Gurdwara and most important pilgrimage site of Sikhism",
    image: "https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.9,
    visitors: "10M+ yearly",
    established: "1604",
    deity: "Guru Granth Sahib",
    festivals: ["Guru Nanak Jayanti", "Baisakhi"],
    category: "Gurdwara",
    distance: "750 km"
  }
];

const festivals = [
  {
    id: 1,
    name: "Diwali",
    date: "Nov 12, 2024",
    description: "Festival of Lights celebrating the victory of light over darkness",
    image: "https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400",
    duration: "5 days",
    significance: "Victory of good over evil",
    rituals: ["Diya lighting", "Rangoli", "Fireworks"],
    regions: ["All India"],
    countdown: "15 days"
  },
  {
    id: 2,
    name: "Holi",
    date: "Mar 14, 2025",
    description: "Festival of Colors celebrating spring and love",
    image: "https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400",
    duration: "2 days",
    significance: "Triumph of good over evil",
    rituals: ["Color throwing", "Holika Dahan", "Feasting"],
    regions: ["North India", "Nepal"],
    countdown: "120 days"
  },
  {
    id: 3,
    name: "Durga Puja",
    date: "Oct 15, 2024",
    description: "Celebration of Goddess Durga's victory over Mahishasura",
    image: "https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=400",
    duration: "10 days",
    significance: "Divine feminine power",
    rituals: ["Pandal hopping", "Dhunuchi dance", "Sindoor khela"],
    regions: ["West Bengal", "Assam"],
    countdown: "Coming soon"
  }
];

const yogaRetreats = [
  {
    id: 1,
    name: "Rishikesh Yoga Retreat",
    location: "Rishikesh, Uttarakhand",
    description: "Traditional yoga practice in the yoga capital of the world",
    image: "https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400",
    duration: "7-21 days",
    price: "₹15,000 - ₹45,000",
    rating: 4.8,
    includes: ["Accommodation", "Meals", "Yoga Classes", "Meditation"],
    level: "All levels",
    nextBatch: "Dec 1, 2024"
  },
  {
    id: 2,
    name: "Kerala Ayurveda Retreat",
    location: "Kovalam, Kerala",
    description: "Holistic healing through Ayurveda and yoga",
    image: "https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400",
    duration: "14-28 days",
    price: "₹25,000 - ₹80,000",
    rating: 4.9,
    includes: ["Ayurvedic Treatment", "Yoga", "Organic Meals", "Spa"],
    level: "Beginner to Advanced",
    nextBatch: "Nov 15, 2024"
  },
  {
    id: 3,
    name: "Himalayan Meditation Retreat",
    location: "Dharamshala, Himachal Pradesh",
    description: "Deep meditation practice in the serene Himalayas",
    image: "https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=400",
    duration: "10-14 days",
    price: "₹20,000 - ₹35,000",
    rating: 4.7,
    includes: ["Accommodation", "Vegetarian Meals", "Meditation Sessions", "Nature Walks"],
    level: "Intermediate to Advanced",
    nextBatch: "Jan 10, 2025"
  }
];

export default function ExploreScreen() {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState('temples');
  const [favorites, setFavorites] = useState(new Set([1, 3]));

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleFavorite = (id: number) => {
    triggerHaptic();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const tabs = [
    { id: 'temples', name: 'Temples', icon: '🏛️', color: '#3182CE' },
    { id: 'festivals', name: 'Festivals', icon: '🎭', color: '#D53F8C' },
    { id: 'retreats', name: 'Retreats', icon: '🧘', color: '#38A169' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#00BCD4', '#00ACC1']}
        style={styles.header}
      >
        <TouchableOpacity onPress={triggerHaptic}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AKF Explore</Text>
          <Text style={styles.headerSubtitle}>আবিষ্কার করুন</Text>
        </View>
        <TouchableOpacity onPress={triggerHaptic}>
          <Filter size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                [styles.tab, { backgroundColor: colors.background, borderColor: colors.border }],
                activeTab === tab.id && [styles.activeTab, { backgroundColor: tab.color }]
              ]}
              onPress={() => {
                setActiveTab(tab.id);
                triggerHaptic();
              }}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  [styles.tabText, { color: colors.secondaryText }],
                  activeTab === tab.id && styles.activeTabText
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {activeTab === 'temples' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sacred Temples</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>পবিত্র মন্দিরসমূহ</Text>
            {temples.map((temple) => (
              <TouchableOpacity 
                key={temple.id} 
                style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
                onPress={() => {
                  triggerHaptic();
                }}
              >
                <Image source={{ uri: temple.image }} style={styles.cardImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.cardOverlay}
                >
                  <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(temple.id)}
                  >
                    <Heart 
                      size={24} 
                      color={favorites.has(temple.id) ? "#EF4444" : "#FFFFFF"}
                      fill={favorites.has(temple.id) ? "#EF4444" : "none"}
                    />
                  </TouchableOpacity>
                </LinearGradient>
                
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{temple.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Star size={16} color="#F59E0B" fill="#F59E0B" />
                      <Text style={[styles.ratingText, { color: colors.text }]}>{temple.rating}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.locationContainer}>
                    <MapPin size={16} color={colors.secondaryText} />
                    <Text style={[styles.locationText, { color: colors.secondaryText }]}>{temple.location}</Text>
                    <Text style={[styles.distanceText, { color: colors.success }]}>• {temple.distance}</Text>
                  </View>
                  
                  <Text style={[styles.cardDescription, { color: colors.secondaryText }]}>{temple.description}</Text>
                  
                  <View style={styles.templeInfo}>
                    <View style={styles.infoItem}>
                      <Users size={14} color={colors.secondaryText} />
                      <Text style={[styles.infoText, { color: colors.secondaryText }]}>{temple.visitors}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Calendar size={14} color={colors.secondaryText} />
                      <Text style={[styles.infoText, { color: colors.secondaryText }]}>{temple.established}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.tagsContainer}>
                    <View style={[styles.categoryTag, { backgroundColor: colors.info + '20' }]}>
                      <Text style={[styles.categoryTagText, { color: colors.info }]}>{temple.category}</Text>
                    </View>
                    <View style={[styles.deityTag, { backgroundColor: colors.warning + '20' }]}>
                      <Text style={[styles.deityTagText, { color: colors.warning }]}>{temple.deity}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'festivals' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Festivals</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>আসন্ন উৎসবসমূহ</Text>
            {festivals.map((festival) => (
              <TouchableOpacity 
                key={festival.id} 
                style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
                onPress={() => {
                  triggerHaptic();
                }}
              >
                <Image source={{ uri: festival.image }} style={styles.cardImage} />
                
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{festival.name}</Text>
                    <View style={[styles.dateContainer, { backgroundColor: colors.secondary + '20' }]}>
                      <Calendar size={16} color="#D53F8C" />
                      <Text style={[styles.dateText, { color: colors.secondary }]}>{festival.date}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.countdownContainer}>
                    <Clock size={16} color={colors.warning} />
                    <Text style={[styles.countdownText, { color: colors.warning }]}>{festival.countdown}</Text>
                  </View>
                  
                  <Text style={[styles.cardDescription, { color: colors.secondaryText }]}>{festival.description}</Text>
                  
                  <View style={styles.festivalInfo}>
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, { color: colors.text }]}>Duration:</Text>
                      <Text style={[styles.infoText, { color: colors.secondaryText }]}>{festival.duration}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, { color: colors.text }]}>Significance:</Text>
                      <Text style={[styles.infoText, { color: colors.secondaryText }]}>{festival.significance}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.ritualsContainer}>
                    <Text style={[styles.ritualsTitle, { color: colors.text }]}>Key Rituals:</Text>
                    <View style={styles.ritualsList}>
                      {festival.rituals.slice(0, 3).map((ritual, index) => (
                        <View key={index} style={[styles.ritualTag, { backgroundColor: colors.success + '20' }]}>
                          <Text style={[styles.ritualText, { color: colors.success }]}>{ritual}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'retreats' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Yoga Retreats</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>যোগ অবকাশ</Text>
            {yogaRetreats.map((retreat) => (
              <TouchableOpacity 
                key={retreat.id} 
                style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
                onPress={() => {
                  triggerHaptic();
                }}
              >
                <Image source={{ uri: retreat.image }} style={styles.cardImage} />
                
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{retreat.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Star size={16} color="#F59E0B" fill="#F59E0B" />
                      <Text style={[styles.ratingText, { color: colors.text }]}>{retreat.rating}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.locationContainer}>
                    <MapPin size={16} color={colors.secondaryText} />
                    <Text style={[styles.locationText, { color: colors.secondaryText }]}>{retreat.location}</Text>
                  </View>
                  
                  <Text style={[styles.cardDescription, { color: colors.secondaryText }]}>{retreat.description}</Text>
                  
                  <View style={styles.retreatInfo}>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.priceText, { color: colors.success }]}>{retreat.price}</Text>
                      <Text style={[styles.durationText, { color: colors.secondaryText }]}>{retreat.duration}</Text>
                    </View>
                    <View style={styles.nextBatchContainer}>
                      <Calendar size={14} color={colors.success} />
                      <Text style={[styles.nextBatchText, { color: colors.success }]}>Next: {retreat.nextBatch}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.includesContainer}>
                    <Text style={[styles.includesTitle, { color: colors.text }]}>Includes:</Text>
                    <View style={styles.includesList}>
                      {retreat.includes.slice(0, 3).map((item, index) => (
                        <View key={index} style={[styles.includeTag, { backgroundColor: colors.info + '20' }]}>
                          <Text style={[styles.includeText, { color: colors.info }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <View style={[styles.levelTag, { backgroundColor: colors.warning + '20' }]}>
                    <Text style={[styles.levelText, { color: colors.warning }]}>{retreat.level}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
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
    color: '#E0F7FA',
  },
  tabContainer: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginLeft: 16,
    borderRadius: 25,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTab: {
    borderColor: 'transparent',
  },
  tabIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#718096',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 180,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 16,
  },
  favoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 6,
  },
  distanceText: {
    fontSize: 14,
    color: '#38A169',
    marginLeft: 4,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  templeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '600',
    marginRight: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3182CE',
  },
  deityTag: {
    backgroundColor: '#FEF5E7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  deityTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#DD6B20',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D53F8C',
    marginLeft: 6,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 6,
  },
  festivalInfo: {
    marginBottom: 16,
  },
  ritualsContainer: {
    marginBottom: 16,
  },
  ritualsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  ritualsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ritualTag: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ritualText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#16A34A',
  },
  retreatInfo: {
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38A169',
  },
  durationText: {
    fontSize: 14,
    color: '#718096',
  },
  nextBatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextBatchText: {
    fontSize: 14,
    color: '#38A169',
    marginLeft: 6,
    fontWeight: '500',
  },
  includesContainer: {
    marginBottom: 16,
  },
  includesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  includesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  includeTag: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  includeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0369A1',
  },
  levelTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  bottomSpacing: {
    height: 20,
  },
});