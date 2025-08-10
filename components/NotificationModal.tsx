import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import {
  X,
  Bell,
  Calendar,
  Clock,
  ChevronRight,
  Phone,
  LocateFixed,
  CheckCircle,
  XCircle,
  Loader2,
  User,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors'; // Import the hook
import { Circle } from 'react-native-svg';

export type TPushNotification = {
  _id: string;
  user: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  deliveryStatus: 'pending' | 'sent' | 'failed';
  expoTicket?: any;
  createdAt: Date;
  updatedAt: Date;
};

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  data: TPushNotification[];
}
const NotificationModal: React.FC<NotificationModalProps> = ({
  isVisible,
  onClose,
  data,
}) => {
  const colors = useThemeColors();
  console.log(data, 'text');

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.card, shadowColor: colors.cardShadow },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleContainer}>
              <Bell size={24} color={colors.primary} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Notifications
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>

          {data?.length > 0 ? (
            <ScrollView style={styles.notificationsContainer}>
              {data?.map((notification: TPushNotification) => (
                <TouchableOpacity
                  key={notification._id}
                  style={[
                    styles.notificationItem,
                    { borderBottomColor: colors.border },
                    !notification.read && [
                      styles.unreadNotification,
                      { backgroundColor: colors.background },
                    ],
                  ]}
                >
                  <View
                    style={[
                      styles.notificationTypeIndicator,
                      // The color could be based on a type if you add it back
                      {
                        backgroundColor: !notification.read
                          ? colors.primary
                          : 'transparent',
                      },
                    ]}
                  />

                  <View style={styles.notificationContent}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        { color: colors.text },
                        !notification.read && styles.unreadNotificationTitle,
                      ]}
                    >
                      {notification?.message}
                    </Text>
                    <Text
                      style={[
                        styles.notificationMessage,
                        { color: colors.secondaryText },
                      ]}
                      numberOfLines={2}
                    >
                      {notification?.message}
                    </Text>
                    {notification?.data?.location && (
                      <View style={styles.notificationTimeContainer}>
                        <LocateFixed size={14} color={colors.secondaryText} />
                        <Text
                          style={[
                            styles.notificationMessage,
                            { color: colors.secondaryText },
                          ]}
                        >
                          {notification?.data?.location}
                        </Text>
                      </View>
                    )}
                    <View style={styles.notificationMeta}>
                      <View style={styles.notificationTimeContainer}>
                        <User size={12} color={colors.secondaryText} />
                        <Text
                          style={[
                            styles.notificationTime,
                            { color: colors.secondaryText },
                          ]}
                        >
                          {notification?.data?.userName || 'Unknown User'}
                        </Text>
                      </View>
                      <View style={styles.notificationTimeContainer}>
                        <Calendar size={12} color={colors.secondaryText} />
                        <Text
                          style={[
                            styles.notificationTime,
                            { color: colors.secondaryText },
                          ]}
                        >
                          {new Date(notification.createdAt).toLocaleString(
                            'en-US',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            }
                          )}
                        </Text>
                      </View>

                      <View style={styles.notificationTimeContainer}>
                        {/* Status icon */}
                        {notification?.data?.status === 'resolved' && (
                          <CheckCircle
                            size={12}
                            color="green"
                            style={{ marginLeft: 4 }}
                          />
                        )}
                        {notification?.data?.status === 'rejected' && (
                          <XCircle
                            size={12}
                            color="red"
                            style={{ marginLeft: 4 }}
                          />
                        )}
                        {notification?.data?.status === 'pending' && (
                          <Circle
                            size={12}
                            color="orange"
                            style={{ marginLeft: 4 }}
                          />
                        )}
                        {notification?.data?.status === 'processing' && (
                          <Loader2
                            size={12}
                            color="blue"
                            style={{ marginLeft: 4 }}
                          />
                        )}

                        <Text
                          style={[
                            styles.notificationTime,
                            { color: colors.secondaryText, marginLeft: 4 },
                          ]}
                        >
                          {notification?.data?.status}
                        </Text>
                      </View>

                      {notification?.data?.phoneNumber && (
                        <TouchableOpacity
                          style={styles.notificationTimeContainer}
                          onPress={() =>
                            Linking.openURL(
                              `tel:${notification.data.phoneNumber}`
                            )
                          }
                        >
                          <Phone size={12} color={colors.secondaryText} />
                          <Text
                            style={[
                              styles.notificationTime,
                              { color: colors.secondaryText },
                            ]}
                          >
                            {notification.data.phoneNumber}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Bell size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No notifications
              </Text>
              <Text
                style={[styles.emptyMessage, { color: colors.secondaryText }]}
              >
                "You don't have any notifications yet."
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// The StyleSheet remains completely unchanged.
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
    // maxHeight: 400, // This could be problematic, removing it is safer for dynamic content
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
    paddingLeft: 24, // Make space for the indicator
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
    flexWrap: 'wrap', // Allow meta to wrap on small screens
    gap: 12,
  },
  notificationTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  notificationTime: {
    fontSize: 10,
    color: '#718096',
  },
  emptyContainer: {
    flex: 1, // Allow it to take up the remaining space
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
