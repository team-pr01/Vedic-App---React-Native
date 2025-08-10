import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { X } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface PopupNotificationProps {
  title: string;
  message: string;
  onClose: () => void;
  onClick?: () => void;
  isVisible: boolean;
  imageUrl?: string;
  imageHeight?: number;
  btnText?: string;
  btnUrl?: string;
}

const PopupNotification: React.FC<PopupNotificationProps> = ({ 
  title, 
  message, 
  onClose, 
  onClick,
  isVisible, 
  imageUrl,
  imageHeight = 120,
  btnText = 'Got it!',
  btnUrl = '#'
}) => {
  const colors = useThemeColors();

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={[styles.popup, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <X size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          
          {imageUrl && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: imageUrl }} 
                style={[styles.image, { height: imageHeight }]}
                resizeMode="cover"
              />
            </View>
          )}
          
          <View style={[styles.contentContainer, imageUrl && styles.contentWithImage]}>
            <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
            <TouchableOpacity
              onPress={onClick}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.buttonText}>{btnText}</Text>
            </TouchableOpacity>
          </View>
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
    zIndex: 1000,
  },
  popup: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  imageContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  contentContainer: {
    padding: 24,
  },
  contentWithImage: {
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PopupNotification;