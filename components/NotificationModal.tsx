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
import { X, Bell, Calendar, Clock, ChevronRight, Phone, Locate, LocateIcon, LocateFixed } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';


interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  date: string;
  read: boolean;
  name: string;
  phoneNumber?: string;
  location?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Consultation Reminder',
    message: 'Your Jyotish consultation is scheduled in 1 hour. Please be ready.',
    time: '4:00 PM',
    date: 'Today',
    read: false,
    name: 'Pandit Ravi Shankar',
    phoneNumber: '+91 12345 67890',
  },
  {
    id: '2',
    title: 'Puja Booking Confirmed',
    message: 'Your Satyanarayan Puja has been successfully booked for this Friday.',
    time: '11:15 AM',
    date: 'Today',
    read: false,
    name: 'Iskcon Temple',
    location: 'Juhu, Mumbai',
  },
  {
    id: '3',
    title: 'Live Ganga Aarti',
    message: 'The evening Ganga Aarti from Rishikesh is starting now. Tap to watch live.',
    time: '6:45 PM',
    date: 'Yesterday',
    read: true,
    name: 'Vedic Stream',
  },
  {
    id: '4',
    title: 'New Course: "Yoga Sutras"',
    message: 'A new in-depth course on Patanjali\'s Yoga Sutras has been added. Enroll now!',
    time: '9:00 AM',
    date: 'Yesterday',
    read: false,
    name: 'Vedic University',
  },
  {
    id: '5',
    title: 'Thank You for Your Donation',
    message: 'We have received your generous contribution for the Gaushala Seva. May Krishna bless you.',
    time: '1:20 PM',
    date: '2 days ago',
    read: true,
    name: 'Gopal Gaushala Trust',
  },
  {
    id: '6',
    title: 'Vastu Tip of the Day',
    message: 'Placing a Tulsi plant in the North-East corner of your home brings positivity. Learn more.',
    time: '8:00 AM',
    date: '2 days ago',
    read: true,
    name: 'Vastu Insights',
  },
  {
    id: '7',
    title: 'Community Satsang Invitation',
    message: 'Join us for a special kirtan and satsang evening this Saturday.',
    time: '5:30 PM',
    date: '3 days ago',
    read: true,
    name: 'Hari Om Community Hall',
    location: 'Koramangala, Bengaluru',
  },
  {
    id: '8',
    title: 'Your Jyotish Report is Ready',
    message: 'Your detailed Career Guidance reading has been generated and is ready to view.',
    time: '10:05 AM',
    date: '4 days ago',
    read: true,
    name: 'Jyotish AI Assistant',
  },
  {
    id: '9',
    title: 'New Recipe: Sattvic Paneer',
    message: 'A delicious and easy-to-make Sattvic Paneer recipe is now available in the food section.',
    time: '12:00 PM',
    date: '5 days ago',
    read: true,
    name: 'Vedic Recipes',
  },
  {
    id: '10',
    title: 'Account Security Update',
    message: 'Your password was successfully updated. If this wasn\'t you, please contact support immediately.',
    time: '3:45 PM',
    date: '5 days ago',
    read: true,
    name: 'System Alert',
  },
];
const NotificationModal: React.FC<NotificationModalProps> = ({ isVisible, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  // const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');

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

  // const filteredNotifications = selectedTab === 'all' 
  //   ? notifications 
  //   : notifications.filter(notif => !notif.read);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  // const getNotificationTypeColor = (type: Notification['type']) => {
  //   switch (type) {
  //     case 'event': return '#3B82F6';
  //     case 'update': return '#10B981';
  //     case 'reminder': return '#F59E0B';
  //     case 'alert': return '#EF4444';
  //     default: return '#718096';
  //   }
  // };

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

          {/* <View style={styles.tabsContainer}>
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
          </View> */}

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

          {MOCK_NOTIFICATIONS.length > 0 ? (
            <ScrollView style={styles.notificationsContainer}>
              {MOCK_NOTIFICATIONS.map((notification) => (
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
                   
                  ]} />
                  
                  
                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.read && styles.unreadNotificationTitle
                    ]}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.name}
                    </Text>
                     <View style={styles.notificationTimeContainer}>
                        <LocateFixed size={14} color="#718096" />
                        <Text style={styles.notificationMessage}>{notification.location}</Text>
                      </View>
                    <View style={styles.notificationMeta}>
                      <View style={styles.notificationTimeContainer}>
                        <Calendar size={12} color="#718096" />
                        <Text style={styles.notificationTime}>{notification.date}</Text>
                      </View>
                      <View style={styles.notificationTimeContainer}>
                        <Clock size={12} color="#718096" />
                        <Text style={styles.notificationTime}>{notification.time}</Text>
                      </View>
                      
                      <View style={styles.notificationTimeContainer}>
                        <Phone size={12} color="#718096" />
                        <Text style={styles.notificationTime}>{notification.phoneNumber}</Text>
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
              "You don't have any notifications yet." 
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
    height: '100%',
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