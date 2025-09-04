import React, { useEffect, useState,useRef } from 'react';
import { Provider } from 'react-redux';
import { StatusBar,Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNav from './src/navigation/AppNav';
import store from './src/store/store';
import "./ignoreWarnings";
import OfflineNotice from './src/utils/OfflineNotice';
import Toast from 'react-native-toast-message';
import SplashScreen from 'react-native-splash-screen';
import messaging from '@react-native-firebase/messaging';
import { requestNotificationPopup, setupNotificationHandlers } from './src/utils/NotificationService';
import { navigate, getNavigationRef } from './src/navigation/NavigationService'; // Import the navigation function
import { requestCameraAndAudioPermissions } from './src/utils/PermissionHandler';
import { PERMISSIONS, request } from 'react-native-permissions';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NotificationPopup from './src/components/NotificationPopup';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const notificationQueue = useRef([]).current;
  // useEffect(() => {
  //   if (Platform.OS == 'android' || Platform.OS === 'ios') {
  //     /* this is app foreground notification */
  //     const unsubscribe = messaging().onMessage(async remoteMessage => {
  //       // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
  //        console.log('Received background message:', JSON.stringify(remoteMessage));

  //     });
  //     return unsubscribe;
  //   }
  // }, [])
  useEffect(() => {
    // Hide splash screen
    SplashScreen.hide();

    if (Platform.OS === 'ios') {
      requestUserPermission()
    }

    // Request permissions and set up notifications
    requestNotificationPopup().then(() => {
      const unsubscribeForeground = setupNotificationHandlers(
        setNotifications,
        setnotifyStatus,
        null,
        (notification) => {
          console.log('Foreground notification received:', {
            screen: notification?.data?.screen,
            title: notification?.notification?.title,
            currentScreen: isCurrentScreenChatScreen() ? 'ChatScreen' : 'Other'
          });

          // Only show popup for ChatScreen notifications
          if (notification?.data?.screen !== 'ChatScreen') {
            console.log('Skipping notification popup - not a ChatScreen notification');
            return;
          }

          // Skip popup if user is already on ChatScreen (ChatScreen handles its own notifications)
          if (isCurrentScreenChatScreen()) {
            console.log('Skipping notification popup - user is on ChatScreen');
            return;
          }

          console.log('Showing ChatScreen notification popup');
          // Show notification popup when app is in foreground
          if (showNotificationPopup) {
            // If popup is already visible, add to queue
            notificationQueue.push(notification);
          } else {
            // Show popup immediately
            setCurrentNotification(notification);
            setShowNotificationPopup(true);
          }
        }
      );

      // Handle notification when the app is opened from a background state
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification opened app:', remoteMessage);
        if (remoteMessage?.data?.screen === 'ChatScreen') {
          navigate('Message', {
            screen: 'ChatScreen', params: {
              agentId: remoteMessage?.data?.id,
              flag: remoteMessage?.data?.flag,
            }
          });
        } else if (remoteMessage?.data?.screen === 'WalletScreen') {
          navigate('WalletScreen');
        }
      });

      // Handle notification when the app is opened from a quit state
      messaging().getInitialNotification().then(remoteMessage => {
        console.log('Notification opened app:', remoteMessage);
        console.log('Notification opened app flag:', remoteMessage?.data?.flag);
        if (remoteMessage?.data?.screen === 'ChatScreen') {
          navigate('Message', {
            screen: 'ChatScreen', params: {
              agentId: remoteMessage?.data?.id,
              flag: remoteMessage?.data?.flag,
            }
          });
        } else if (remoteMessage?.data?.screen === 'WalletScreen') {
          navigate('WalletScreen');
        }
      });

      // Clean up foreground listener on unmount
      return () => {
        if (unsubscribeForeground) unsubscribeForeground();
      };
    });
  }, []);

  async function requestUserPermission() {
    const result = await request(PERMISSIONS.IOS.CAMERA);
    const authorizationStatus = await messaging().requestPermission();

    if (authorizationStatus) {
      console.log('Permission status:', authorizationStatus);
    }
  }
  const handleNotificationPopupClose = () => {
    setShowNotificationPopup(false);
    setCurrentNotification(null);

    // Process next notification in queue after a short delay
    setTimeout(() => {
      if (notificationQueue.length > 0) {
        const nextNotification = notificationQueue.shift();
        setCurrentNotification(nextNotification);
        setShowNotificationPopup(true);
      }
    }, 300);
  };

  // Helper function to check if current screen is ChatScreen
  const isCurrentScreenChatScreen = () => {
    try {
      const navigationRef = getNavigationRef();
      if (navigationRef?.current?.getState) {
        const state = navigationRef.current.getState();

        // Function to recursively check nested routes and params
        const findCurrentRoute = (navState) => {
          if (!navState) return null;

          const currentRoute = navState.routes[navState.index];
          if (!currentRoute) return null;

          console.log('Checking route:', currentRoute.name, 'Params:', currentRoute.params);

          // Check if current route has ChatScreen in params
          if (currentRoute.params?.screen === 'ChatScreen') {
            console.log('Found ChatScreen in params of route:', currentRoute.name);
            return { name: 'ChatScreen', isChatScreen: true };
          }

          // Check if current route name is ChatScreen
          if (currentRoute.name === 'ChatScreen') {
            console.log('Found ChatScreen route directly:', currentRoute.name);
            return { name: 'ChatScreen', isChatScreen: true };
          }

          // If this route has nested state, check it recursively
          if (currentRoute.state) {
            console.log('Route has nested state, checking recursively...');
            const nestedRoute = findCurrentRoute(currentRoute.state);
            if (nestedRoute?.isChatScreen) {
              return nestedRoute;
            }
          }

          return currentRoute;
        };

        const currentRoute = findCurrentRoute(state);
        const isChatScreen = currentRoute?.name === 'ChatScreen' || currentRoute?.isChatScreen;
        
        console.log('Final route check - Name:', currentRoute?.name, 'Is ChatScreen:', isChatScreen);
        
        return isChatScreen;
      }
      return false;
    } catch (error) {
      console.log('Error checking current screen:', error);
      return false;
    }
  };

  const handleNotificationAction = (notification) => {
    // Handle notification action based on data
    if (notification?.data?.screen === 'ChatScreen') {
      navigate('Message', {
        screen: 'ChatScreen', params: {
          agentId: notification?.data?.id,
          flag: notification?.data?.flag,
        }
      });
    } else if (notification?.data?.screen === 'WalletScreen') {
      navigate('WalletScreen');
    }
    // Add more screen navigation logic as needed

    // Close popup and process queue
    handleNotificationPopupClose();
  };
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar
          translucent={false}
          backgroundColor="#000"
          barStyle="light-content"
        />
        <OfflineNotice />
        <AuthProvider>
          <AppNav />
        </AuthProvider>
        <Toast />
        <NotificationPopup
          isVisible={showNotificationPopup}
          notification={currentNotification}
          onClose={handleNotificationPopupClose}
          onAction={handleNotificationAction}
        />
        </SafeAreaProvider>
    </Provider>
  );
}

export default App;
