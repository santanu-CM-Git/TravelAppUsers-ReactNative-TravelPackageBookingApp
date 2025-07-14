import { Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

export const requestNotificationPermission = async () => {
  const permission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    : PERMISSIONS.IOS.NOTIFICATIONS;

  const result = await request(permission);
  return result;
};

export const checkNotificationPermission = async () => {
  const permission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    : PERMISSIONS.IOS.NOTIFICATIONS;

  const result = await check(permission);
  return result;
};

export const openSettings = () => {
  Linking.openSettings();
};

// export const requestPermission = async () => {
//   const checkPermission = await checkNotificationPermission();

//   if (checkPermission === RESULTS.GRANTED) {
//     console.log('Notification permission already granted.');
//     return;
//   }

//   const request = await requestNotificationPermission();

//   if (request !== RESULTS.GRANTED) {
//     Alert.alert(
//       'Notification Permission Required',
//       'Please enable notifications to stay updated.',
//       [{ text: 'OK', onPress: openSettings }]
//     );
//   }
// };
export const requestPermission = async () => {
  const checkPermission = await checkNotificationPermission();

  console.log('Current notification permission status:', checkPermission);

  if (checkPermission === RESULTS.GRANTED) {
    console.log('Notification permission already granted.');
    return;
  }

  if (checkPermission === RESULTS.BLOCKED) {
    console.log('Notification permission is blocked.');
    Alert.alert(
      'Notification Permission Blocked',
      'Notifications are currently blocked. Please enable them in your device settings.',
      [{ text: 'OK', onPress: openSettings }]
    );
    return;
  }

  const request = await requestNotificationPermission();

  console.log('Request notification permission status:', request);

  if (request !== RESULTS.GRANTED) {
    Alert.alert(
      'Notification Permission Required',
      'Please enable notifications to stay updated.',
      [{ text: 'OK', onPress: openSettings }]
    );
  }
};


export const handleNotification = (remoteMessage, setNotifications, setnotifyStatus, navigation) => {
  //Alert.alert('A new FCM message arrived!!!', JSON.stringify(remoteMessage));

  // const action = remoteMessage?.data?.action;
  // if (action) {
  //   handleAction(action, remoteMessage, navigation);
  // } else {
  //   setNotifications(prevNotifications => {
  //     const newNotifications = [...prevNotifications, remoteMessage];
  //     setnotifyStatus(true);
  //     return newNotifications;
  //   });
  // }
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
      if (navigation && navigation.current) {
        navigation.current.navigate('ScheduleScreen');
      }
      break;
  }
};

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
