import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNav from './src/navigation/AppNav';
import store from './src/store/store';
import "./ignoreWarnings";
import OfflineNotice from './src/utils/OfflineNotice';
import Toast from 'react-native-toast-message';
import SplashScreen from 'react-native-splash-screen';
import messaging from '@react-native-firebase/messaging';
import { requestPermissions, setupNotificationHandlers } from './src/utils/NotificationService';
import { navigate } from './src/navigation/NavigationService'; // Import the navigation function
import { requestCameraAndAudioPermissions } from './src/utils/PermissionHandler';
import { PERMISSIONS, request } from 'react-native-permissions';
 
function App() {
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(false);
  
  useEffect(() => {
    // Hide splash screen
    SplashScreen.hide();

    if(Platform.OS === 'ios'){
      requestUserPermission()
    }

    // Request permissions and set up notifications
    requestPermissions().then(() => {
      const unsubscribeForeground = setupNotificationHandlers(setNotifications, setnotifyStatus);

      // Handle notification when the app is opened from a background state
      messaging().onNotificationOpenedApp(remoteMessage => {
        if (remoteMessage?.data?.screen === 'ScheduleScreen') {
          navigate('Schedule', { screen: 'ScheduleScreen' });
        } else if (remoteMessage?.data?.screen === 'WalletScreen') {
          navigate('WalletScreen');
        }
      });

      // Handle notification when the app is opened from a quit state
      messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage?.data?.screen === 'ScheduleScreen') {
          navigate('Schedule', { screen: 'ScheduleScreen' });
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

  return (
    <Provider store={store}>
      <StatusBar backgroundColor="#000" />
      <OfflineNotice />
      <AuthProvider>
        <AppNav />
      </AuthProvider>
      <Toast />
    </Provider>
  );
}

export default App;
