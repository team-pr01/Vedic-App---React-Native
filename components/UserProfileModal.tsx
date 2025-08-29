import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { X, CreditCard as Edit, Settings, ChevronRight, BookOpen, Award, Newspaper, Heart, Flag, ListChecks, Utensils, MessageSquare, AwardIcon } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout, useCurrentUser } from '@/redux/features/Auth/authSlice';
import { useTranslate } from '@/hooks/useTranslate';
import { useThemeColors } from '@/hooks/useThemeColors';
import DefaultAvatar from "../assets/images/user.svg"

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToSettings: () => void;
}

export default function UserProfileModal({ visible, onClose, onNavigateToSettings }: UserProfileModalProps) {
 
  const user = useSelector(useCurrentUser);
  console.log(user)
    const t = useTranslate();
  const colors = useThemeColors();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const StatItem = ({ 
    icon, 
    label, 
    value 
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
  }) => (
    <View style={[styles.statItem, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
      {icon}
      <View style={styles.statContent}>
        <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  if (!user) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('userProfileTitle', 'My Profile')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={[styles.profileSection, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
         
{user.avatar ? (
  <Image source={{ uri: user.avatar }} style={styles.avatar} />
) : (
  <DefaultAvatar width={100} height={100} style={styles.avatar} />
)}
            <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.email, { color: colors.secondaryText }]}>{user.email}</Text>
            <Text style={[styles.joinDate, { color: colors.secondaryText }]}>
              {t('joinedDateLabel', 'Joined')}: {user.joinDate || 'Recently'}
            </Text>
            {user.bio && (
              <Text style={[styles.bio, { color: colors.text }]}>{user.bio}</Text>
            )}
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: `${colors.primary}20` }]}
              onPress={() => alert(t('editProfileComingSoon', 'Edit Profile functionality coming soon!'))}
            >
              <Edit size={16} color={colors.primary} />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>{t('editProfileButton', 'Edit Profile')}</Text>
            </TouchableOpacity>
          </View>

          {/* Activity Summary */}
          {/* <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
              {t('activitySummaryTitle', 'ACTIVITY SUMMARY').toUpperCase()}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
              {t('activitySummaryTitle', 'কার্যকলাপের সারসংক্ষেপ')}
            </Text>
            <View style={styles.statsGrid}>
              <StatItem 
                icon={<BookOpen size={24} color={colors.primary} />} 
                label={t('mantrasSavedLabel', 'Mantras Saved')} 
                value={user.stats?.mantrasSaved || 0} 
              />
              <StatItem 
                icon={<Award size={24} color={colors.primary} />} 
                label={t('quizzesTakenLabel', 'Quizzes Taken')} 
                value={user.stats?.quizzesTaken || 0} 
              />
              <StatItem 
                icon={<Newspaper size={24} color={colors.primary} />} 
                label={t('articlesReadLabel', 'Articles Read')} 
                value={user.stats?.articlesRead || 0} 
              />
              <StatItem 
                icon={<Heart size={24} color={colors.primary} />} 
                label={t('newsLikedLabel', 'News Liked')} 
                value={user.stats?.newsLiked || 0} 
              />
              <StatItem 
                icon={<Flag size={24} color={colors.primary} />} 
                label={t('mantrasReportedLabel', 'Mantras Reported')} 
                value={user.stats?.mantrasReported || 0} 
              />
              <StatItem 
                icon={<ListChecks size={24} color={colors.primary} />} 
                label={t('totalActivitiesLabel', 'Total Activities')} 
                value={user.stats?.totalActivities || 0} 
              />
              <StatItem 
                icon={<Utensils size={24} color={colors.primary} />} 
                label={t('recipesGeneratedLabel', 'Recipes Generated')} 
                value={user.stats?.recipesGenerated || 0} 
              />
              <StatItem 
                icon={<MessageSquare size={24} color={colors.primary} />} 
                label={t('consultanciesHiredLabel', 'Consultancies Hired')} 
                value={user.stats?.consultanciesHired || 0} 
              />
            </View>
          </View> */}
<StatItem
                icon={<AwardIcon />}
                label="Quizzes Taken"
                value={user.totalQuizTaken || 0}
              />
          {/* Account & App Settings */}
          <View style={styles.section}>
            {/* <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
              {t('accountAndAppSettingsTitle', 'ACCOUNT & APP').toUpperCase()}
            </Text> */}
            {/* <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
              {t('accountAndAppSettingsTitle', 'অ্যাকাউন্ট ও অ্যাপ')}
            </Text> */}
            <View style={[styles.settingsContainer, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => {
                  onClose();
                  onNavigateToSettings();
                }}
              >
                <View style={styles.settingLeft}>
                  <Settings size={20} color={colors.primary} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {t('appSettingsButton', 'App Settings')}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: `${colors.error}20` }]} onPress={handleLogout}>
              <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FF6F00',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    maxWidth: 280,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  statContent: {
    marginLeft: 12,
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsContainer: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutContainer: {
    paddingTop: 16,
    marginBottom: 32,
  },
  logoutButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});