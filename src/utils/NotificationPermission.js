import { Platform, Alert, PermissionsAndroid, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';

// Function to check if notification permission is granted (without requesting)
export const isNotificationPermissionGranted = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      return granted;
    } else {
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
    }
  } catch (error) {
    console.log('Check notification permission error:', error);
    return false;
  }
};

// Function to request notification permission
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission Required',
          message: 'This app needs notification permission for chat functionality and important updates',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        showNotificationPermissionAlert();
        return false;
      }
    } else {
      const authStatus = await messaging().hasPermission();
      if (authStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
        const permission = await messaging().requestPermission();
        if (permission === messaging.AuthorizationStatus.AUTHORIZED) {
          console.log('Notification permission granted');
          return true;
        } else {
          console.log('Notification permission denied');
          showNotificationPermissionAlert();
          return false;
        }
      } else if (authStatus === messaging.AuthorizationStatus.DENIED) {
        showNotificationPermissionAlert();
        return false;
      }
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
    }
  } catch (error) {
    console.log('Notification Permission Error:', error);
    return false;
  }
};

// Function to show notification permission alert
export const showNotificationPermissionAlert = () => {
  // Alert.alert(
  //   'Notification Permission Required',
  //   'This app requires notification permission to keep you informed and function properly. Please enable notifications in settings.',
  //   [
  //     { text: 'Cancel', style: 'cancel' },
  //     { 
  //       text: 'Settings', 
  //       onPress: () => {
  //         Linking.openSettings();
  //       }
  //     }
  //   ]
  // );
};

// Function to check and request notification permission if needed
export const ensureNotificationPermission = async () => {
  const isGranted = await isNotificationPermissionGranted();
  if (!isGranted) {
    return await requestNotificationPermission();
  }
  return true;
};
