import { Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

// Request notification permission
export const requestNotificationPermission = async () => {
  const permission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    : PERMISSIONS.IOS.NOTIFICATIONS;

  return await request(permission);
};

// Check notification permission
export const checkNotificationPermission = async () => {
  const permission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    : PERMISSIONS.IOS.NOTIFICATIONS;

  return await check(permission);
};

// Open app settings
export const openSettings = () => {
  Linking.openSettings();
};

// Show permission popup
export const requestNotificationPopup = async () => {
  const result = await requestNotificationPermission();

  if (result !== RESULTS.GRANTED) {
    Alert.alert(
      'Notification Permission Required',
      'Please enable notifications to stay updated.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings },
      ]
    );
  }
};

// Handle notification when received
export const handleNotification = (remoteMessage, setNotifications, setnotifyStatus, navigation) => {
  const action = remoteMessage?.data?.action;
  if (action) {
    handleAction(action, remoteMessage, navigation);
  } else {
    setNotifications(prev => {
      const newNotifications = [...prev, remoteMessage];
      setnotifyStatus(true);
      return newNotifications;
    });
  }
};

// Optional: Handle action button press
const handleAction = (action, remoteMessage, navigation) => {
  switch (action) {
    case 'reply':
      console.log('Reply to message:', remoteMessage);
      break;
    case 'mark_as_read':
      console.log('Mark as read:', remoteMessage);
      break;
    default:
      console.log('Unknown action:', action);
  }
};

// Setup notification handlers
export const setupNotificationHandlers = (setNotifications, setnotifyStatus, navigation) => {
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('Foreground message:', JSON.stringify(remoteMessage));
    handleNotification(remoteMessage, setNotifications, setnotifyStatus, navigation);
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message:', JSON.stringify(remoteMessage));
    handleNotification(remoteMessage, setNotifications, setnotifyStatus, navigation);
  });

  return unsubscribeForeground;
};