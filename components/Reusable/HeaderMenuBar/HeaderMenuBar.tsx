import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Bell, Calendar, Menu } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { initSocket, socket } from '@/utils/socket';
import DefaultAvatar from '@/assets/images/user.svg';
import { RootState } from '@/redux/store';
import { logout, setUser } from '@/redux/features/Auth/authSlice';
import { useThemeColors } from '@/hooks/useThemeColors';
import SettingsModal from '@/components/SettingsModal';
import UserProfileModal from '@/components/UserProfileModal';
import NotificationModal from '@/components/NotificationModal';
import { BlurView } from 'expo-blur';
import { useGetMyNotificationsQuery } from '@/redux/features/Notification/notificationApi';
import { registerForPushNotificationsAsync } from '@/components/NotificationService';
import * as Notifications from 'expo-notifications';

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const user = useSelector((state: RootState) => state.auth.user);

  const [now, setNow] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
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

  const { data: allNotifications, refetch } = useGetMyNotificationsQuery(
    user?._id
  );

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket:', socket.id);
    });

    socket.on('new-push-notification', (data) => {
      console.log('hello data', data);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off('new-push-notification');
      socket.off('connect');
    };
  }, []);

  useEffect(() => {
    // 2️⃣ Expo push notifications
    registerForPushNotificationsAsync();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const formatted = {
          _id: notification.request.identifier,
          title: notification.request.content.title,
          message: notification.request.content.body,
          createdAt: new Date().toISOString(),
          data: notification.request.content.data,
        };

        setNotifications((prev) => [formatted, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification clicked:', response);
      });

    return () => {
      if (notificationListener.current)
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // 3️⃣ Merge backend notifications with existing state whenever allNotifications changes
  useEffect(() => {
    if (allNotifications?.data) {
      setNotifications((prev) => {
        // Combine backend and existing notifications
        const combined = [...prev, ...allNotifications.data];

        // Deduplicate by _id (or fallback to createdAt + message)
        const unique = Array.from(
          new Map(
            combined.map((n) => [n._id || n.createdAt + n.message, n])
          ).values()
        );

        // Sort newest first
        const sorted = unique.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return sorted;
      });
    }
  }, [allNotifications?.data]);

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
    dispatch(setUser(null));
    setShowSettingsModal(false);
    router.push('/');
  };

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

  return (
    <>
      <View
        style={[
          styles.headerWrapper,
          { backgroundColor: colors.backgroundGlass },
        ]}
      >
        <BlurView
          intensity={110}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

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
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.profileImage}
                />
              ) : (
                <DefaultAvatar
                  width={22}
                  height={22}
                  style={styles.profileImage}
                />
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
