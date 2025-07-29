import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Platform
} from 'react-native';
import { X, Bell, Calendar, Clock, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  date: string;
  read: boolean;
  image?: string;
  type: 'event' | 'update' | 'reminder' | 'alert';
}

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Vedic Course Available',
    message: 'Introduction to Bhagavad Gita course is now available. Enroll today!',
    time: '10:30 AM',
    date: 'Today',
    read: false,
    image: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'update'
  },
  {
    id: '2',
    title: 'Temple Festival Reminder',
    message: 'The annual temple festival begins tomorrow. Don\'t miss the opening ceremony!',
    time: '2:45 PM',
    date: 'Yesterday',
    read: true,
    image: 'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'event'
  },
  {
    id: '3',
    title: 'Meditation Session',
    message: 'Your scheduled meditation session starts in 30 minutes.',
    time: '5:15 PM',
    date: 'Yesterday',
    read: true,
    type: 'reminder'
  },
  {
    id: '4',
    title: 'Donation Received',
    message: 'Thank you for your donation to the Temple Restoration project!',
    time: '11:20 AM',
    date: '2 days ago',
    read: true,
    type: 'alert'
  },
  {
    id: '5',
    title: 'New Article Published',
    message: 'Read our latest article on "The Significance of Mantras in Daily Life"',
    time: '9:00 AM',
    date: '3 days ago',
    read: true,
    image: 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'update'
  }
];

const NotificationModal: React.FC<NotificationModalProps> = ({ isVisible, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleMarkAsRead = (id: string) => {
    triggerHaptic();
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    triggerHaptic();
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleClearAll = () => {
    triggerHaptic();
    setNotifications([]);
  };

  const filteredNotifications = selectedTab === 'all' 
    ? notifications 
    : notifications.filter(notif => !notif.read);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const getNotificationTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'event': return '#3B82F6';
      case 'update': return '#10B981';
      case 'reminder': return '#F59E0B';
      case 'alert': return '#EF4444';
      default: return '#718096';
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Bell size={24} color="#FF6F00" />
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#718096" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'all' && styles.activeTab
              ]}
              onPress={() => {
                triggerHaptic();
                setSelectedTab('all');
              }}
            >
              <Text style={[
                styles.tabText,
                selectedTab === 'all' && styles.activeTabText
              ]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'unread' && styles.activeTab
              ]}
              onPress={() => {
                triggerHaptic();
                setSelectedTab('unread');
              }}
            >
              <Text style={[
                styles.tabText,
                selectedTab === 'unread' && styles.activeTabText
              ]}>
                Unread
              </Text>
              {unreadCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Text style={[
                styles.actionButtonText,
                unreadCount === 0 && styles.actionButtonTextDisabled
              ]}>
                Mark all as read
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Text style={[
                styles.actionButtonText,
                notifications.length === 0 && styles.actionButtonTextDisabled
              ]}>
                Clear all
              </Text>
            </TouchableOpacity>
          </View>

          {filteredNotifications.length > 0 ? (
            <ScrollView style={styles.notificationsContainer}>
              {filteredNotifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.read && styles.unreadNotification
                  ]}
                  onPress={() => handleMarkAsRead(notification.id)}
                >
                  <View style={[
                    styles.notificationTypeIndicator,
                    { backgroundColor: getNotificationTypeColor(notification.type) }
                  ]} />
                  
                  {notification.image ? (
                    <Image 
                      source={{ uri: notification.image }} 
                      style={styles.notificationImage} 
                    />
                  ) : (
                    <View style={[
                      styles.notificationIconContainer,
                      { backgroundColor: getNotificationTypeColor(notification.type) + '20' }
                    ]}>
                      <Bell size={20} color={getNotificationTypeColor(notification.type)} />
                    </View>
                  )}
                  
                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.read && styles.unreadNotificationTitle
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <View style={styles.notificationMeta}>
                      <View style={styles.notificationTimeContainer}>
                        <Calendar size={12} color="#718096" />
                        <Text style={styles.notificationTime}>{notification.date}</Text>
                      </View>
                      <View style={styles.notificationTimeContainer}>
                        <Clock size={12} color="#718096" />
                        <Text style={styles.notificationTime}>{notification.time}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <ChevronRight size={16} color="#CBD5E0" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Bell size={48} color="#CBD5E0" />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyMessage}>
                {selectedTab === 'all' 
                  ? "You don't have any notifications yet." 
                  : "You don't have any unread notifications."}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  unreadBadge: {
    backgroundColor: '#FF6F00',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6F00',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
  },
  activeTabText: {
    color: '#FF6F00',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#FF6F00',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  actionButtonTextDisabled: {
    color: '#CBD5E0',
  },
  notificationsContainer: {
    flex: 1,
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#F7FAFC',
  },
  notificationTypeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  notificationImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 4,
  },
  unreadNotificationTitle: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 6,
    lineHeight: 18,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationTime: {
    fontSize: 10,
    color: '#718096',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
});

export default NotificationModal;