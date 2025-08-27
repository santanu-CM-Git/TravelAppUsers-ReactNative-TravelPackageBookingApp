import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'react-native';
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
import { navigate } from './src/navigation/NavigationService'; // Import the navigation function
import { requestCameraAndAudioPermissions } from './src/utils/PermissionHandler';
import { PERMISSIONS, request } from 'react-native-permissions';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(false);

  useEffect(() => {
    SplashScreen.hide();

    if (Platform.OS === 'ios') {
      requestUserPermission();
    }

    // Request only notification permission and set up notification handlers
    requestNotificationPopup().then(() => {
      const unsubscribeForeground = setupNotificationHandlers(setNotifications, setnotifyStatus);

      messaging().onNotificationOpenedApp(remoteMessage => {
        if (remoteMessage?.data?.screen === 'ScheduleScreen') {
          navigate('Schedule', { screen: 'ScheduleScreen' });
        } else if (remoteMessage?.data?.screen === 'WalletScreen') {
          navigate('WalletScreen');
        }
      });

      messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage?.data?.screen === 'ScheduleScreen') {
          navigate('Schedule', { screen: 'ScheduleScreen' });
        } else if (remoteMessage?.data?.screen === 'WalletScreen') {
          navigate('WalletScreen');
        }
      });

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
        </SafeAreaProvider>
    </Provider>
  );
}

export default App;
