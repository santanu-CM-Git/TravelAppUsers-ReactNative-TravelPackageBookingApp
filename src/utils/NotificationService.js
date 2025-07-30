import { Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PERMISSIONS, request, check, RESULTS, checkNotifications } from 'react-native-permissions';

// Request notification permission
export const requestNotificationPermission = async () => {
  const permission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    : PERMISSIONS.IOS.POST_NOTIFICATIONS;
  return await request(permission);
};

// Check notification permission
export const checkNotificationPermission = async () => {
  const permission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    : PERMISSIONS.IOS.POST_NOTIFICATIONS;
  return await check(permission);
};

// Request camera and audio permissions
export const requestCameraAudioPermissions = async () => {
  const cameraPermission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.CAMERA
    : PERMISSIONS.IOS.CAMERA;
  const audioPermission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.RECORD_AUDIO
    : PERMISSIONS.IOS.MICROPHONE;

  const cameraResult = await request(cameraPermission);
  const audioResult = await request(audioPermission);

  return { camera: cameraResult, audio: audioResult };
};

// Check camera and audio permissions
export const checkCameraAudioPermissions = async () => {
  const cameraPermission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.CAMERA
    : PERMISSIONS.IOS.CAMERA;
  const audioPermission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.RECORD_AUDIO
    : PERMISSIONS.IOS.MICROPHONE;

  const cameraResult = await check(cameraPermission);
  const audioResult = await check(audioPermission);

  return { camera: cameraResult, audio: audioResult };
};

// Open app settings
export const openSettings = () => {
  Linking.openSettings();
};

// Combined permission request function
export const requestPermissions = async () => {
  // const notificationPermission = await checkNotificationPermission();
  const { camera, audio } = await checkCameraAudioPermissions();

  // Log current permissions
  // console.log('Current permissions - Notification:', notificationPermission, 'Camera:', camera, 'Audio:', audio);

  checkNotifications().then(({status, settings}) => {
//  console.log('statusstatus', status);
   if (status !== RESULTS.GRANTED) {
      if(Platform.OS == 'android'){
        Alert.alert(
          'Notification Permission Required',
          'Please enable notifications to stay updated.',
          [{
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: openSettings }]
        );
      }
    }
  });

  // Handle notification permission
  // if (notificationPermission !== RESULTS.GRANTED) {
  //   const result = await requestNotificationPermission();
  //   if (result !== RESULTS.GRANTED) {
  //     if(Platform.OS == 'android'){
  //       Alert.alert(
  //         'Notification Permission Required',
  //         'Please enable notifications to stay updated.',
  //         [{
  //           text: 'Cancel',
  //           onPress: () => console.log('Cancel Pressed'),
  //           style: 'cancel',
  //         },
  //         { text: 'OK', onPress: openSettings }]
  //       );
  //     }
  //   }
  // }

  // Handle camera and audio permissions
  if (camera !== RESULTS.GRANTED || audio !== RESULTS.GRANTED) {
    const { camera: cameraRequest, audio: audioRequest } = await requestCameraAudioPermissions();

    if (cameraRequest !== RESULTS.GRANTED || audioRequest !== RESULTS.GRANTED) {
      Alert.alert(
        'Camera and Audio Permissions Required',
        'This app needs access to your camera to enable video calls, allowing you to see and be seen during your call sessions. It also requires access to your microphone to enable audio during video calls, so you can hear and be heard. Please enable camera and audio permissions for a full app experience.',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: openSettings }
        ]
      );
    }
  }
};

// Handle notifications with actions
export const handleNotification = (remoteMessage, setNotifications, setnotifyStatus, navigation) => {
  const action = remoteMessage?.data?.action;
  if (action) {
    handleAction(action, remoteMessage, navigation);
  } else {
    setNotifications(prevNotifications => {
      const newNotifications = [...prevNotifications, remoteMessage];
      setnotifyStatus(true);
      return newNotifications;
    });
  }
};

const handleAction = (action, remoteMessage, navigation) => {
  switch (action) {
    case 'reply':
      console.log('User chose to reply to the message:', remoteMessage);
      break;
    case 'mark_as_read':
      console.log('User chose to mark the message as read:', remoteMessage);
      break;
    default:
      console.log('Unknown action:', action);
      break;
  }
};

// Setup notification handlers
export const setupNotificationHandlers = (setNotifications, setnotifyStatus, navigation) => {
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('Received foreground message:', JSON.stringify(remoteMessage));
    handleNotification(remoteMessage, setNotifications, setnotifyStatus, navigation);
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Received background message:', JSON.stringify(remoteMessage));
    handleNotification(remoteMessage, setNotifications, setnotifyStatus, navigation);
  });

  return unsubscribeForeground;
};
