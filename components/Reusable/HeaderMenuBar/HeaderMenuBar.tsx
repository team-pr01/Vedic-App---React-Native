import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
} from 'react-native';
import { Bell, Calendar, Menu } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { socket } from '@/utils/socket';
import DefaultAvatar from '@/assets/images/user.svg';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/features/Auth/authSlice';
import { useThemeColors } from '@/hooks/useThemeColors';
import SettingsModal from '@/components/SettingsModal';
import UserProfileModal from '@/components/UserProfileModal';
import NotificationModal from '@/components/NotificationModal';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetAllPushNotificationForUserQuery } from '@/redux/features/Auth/authApi';
import { BlurView } from 'expo-blur';

// Modals

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const colors = useThemeColors();

  const user = useSelector((state: RootState) => state.auth.user);

  const [now, setNow] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const { data: allPushNotifications, refetch: refetchAllPushNotifications } =
    useGetAllPushNotificationForUserQuery(user?._id);
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // --- Date updater ---
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (allPushNotifications?.data) {
      // Merge backend notifications with real-time ones, newest first
      const combined = [...notifications, ...allPushNotifications.data];

      // Optional: Deduplicate if needed by filtering based on createdAt + message or _id
      const unique = Array.from(
        new Map(
          combined.map((n) => [n._id || n.createdAt + n.message, n])
        ).values()
      );

      // Sort descending by createdAt
      const sorted = unique.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(sorted);
    }
  }, [allPushNotifications?.data]);

  // --- Panchang date formatter (placeholder – replace with real API later) ---
  const formatHinduDate = (currentTime: Date) => {
    const hinduMonths = [
      'Chaitra',
      'Vaishakha',
      'Jyeshtha',
      'Ashadha',
      'Shravana',
      'Bhadrapada',
      'Ashwin',
      'Kartika',
      'Margashirsha',
      'Pausha',
      'Magha',
      'Phalguna',
    ];
    const hinduDays = [
      'Ravivara',
      'Somavara',
      'Mangalavara',
      'Budhavara',
      'Guruvara',
      'Shukravara',
      'Shanivara',
    ];

    return `Tithi: ${hinduDays[currentTime.getDay()]} 15, ${
      hinduMonths[currentTime.getMonth()]
    } Paksha | ${hinduMonths[currentTime.getMonth()]}`;
  };

  // --- Socket for live notifications ---
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

  // --- Handlers ---
  const handleMenuPress = () => {
    triggerHaptic();
    setShowSettingsModal(true);
  };

  const handleProfilePress = () => {
    triggerHaptic();
    setShowUserProfileModal(true);
  };

  const handleNotificationPress = () => {
    triggerHaptic();
    setShowNotificationModal(true);
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    dispatch(logout());
    setShowSettingsModal(false);
    router.push('/');
  };

  return (
    <>
      <View style={styles.headerWrapper}>
      <BlurView intensity={110} tint="light" style={StyleSheet.absoluteFill} />

      {/* Actual header content */}
      <View style={styles.headerContent}>
        {/* Left Menu */}
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <Menu size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Date */}
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
              {formatHinduDate(now)}
            </Text>
          </View>
        </View>

        {/* Right Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleNotificationPress}
          >
            <Bell size={20} color={colors.text} />
            {unreadCount > 0 && (
              <View
                style={[
                  styles.notificationBadge,
                  { backgroundColor: colors.error },
                ]}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.profileImage} />
            ) : (
              <DefaultAvatar width={28} height={28} style={styles.profileImage} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>

      {/* Modals */}
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onLogout={handleLogout}
      />
      <UserProfileModal
        visible={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
        onNavigateToSettings={() => setShowSettingsModal(true)}
      />
      <NotificationModal
        data={notifications}
        isVisible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </>
  );
};

export default Header;
const styles = StyleSheet.create({
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.9)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  menuButton: {
    padding: 4,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%', // ⬅️ fill parent width
  },
  dateText: {
    fontSize: 9,
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
});
