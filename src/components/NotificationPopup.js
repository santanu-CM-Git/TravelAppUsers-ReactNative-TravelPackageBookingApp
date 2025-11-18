import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const NotificationPopup = ({ 
  isVisible, 
  notification, 
  onClose, 
  onAction 
}) => {
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Vibrate when notification appears
      Vibration.vibrate(200);
      
      // Slide in animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      // Slide out animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, fadeAnim, onClose]);

  // Don't render if no notification or if notification is invalid
  if (!notification || (!notification.notification && !notification.data)) {
    return null;
  }

  const handleAction = () => {
    if (onAction) {
      onAction(notification);
    }
    onClose();
  };

  // Handle notification data safely
  const getNotificationTitle = () => {
    if (notification?.notification?.title) {
      return notification.notification.title;
    }
    if (notification?.data?.title) {
      return notification.data.title;
    }
    return 'New Notification';
  };

  const getNotificationBody = () => {
    if (notification?.notification?.body) {
      return notification.notification.body;
    }
    if (notification?.data?.body) {
      return notification.data.body;
    }
    if (notification?.data?.message) {
      return notification.data.message;
    }
    return 'You have a new message';
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      backdropOpacity={0.3}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="notifications" size={24} color="#FF455C" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {getNotificationTitle()}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {getNotificationBody()}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleAction}
          >
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    marginTop: Math.max(60, height * 0.08),
    width: Math.min(width - 32, 400),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#FF455C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#FF455C',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationPopup;
