import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image, Platform, Alert, StatusBar, BackHandler, ActivityIndicator, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { notifyImg } from '../../../utils/Images'
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoNotification from './NoNotification';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env'
import moment from 'moment-timezone';

const NotificationScreen = ({  }) => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (isRefresh = false) => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User token is missing');
      }

      const response = await axios.post(`${API_URL}/customer/notification`,{}, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.data.response === true) {
        const newNotifications = response.data.data;
        console.log('newNotifications', newNotifications);
        setNotifications(newNotifications);
        setnotifyStatus(newNotifications.length > 0);
      } else {
        setnotifyStatus(false);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  useFocusEffect(
    useCallback(() => {
        const backAction = () => {
           navigation.goBack()
           return true
          };
      
          const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
          );
      
          return () => backHandler.remove();
    }, [navigation])
);

  if (notifyStatus === false) {
    return <NoNotification />;
  }

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FF455C" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.Container}>
      <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
      <CustomHeader commingFrom={'Notification'} onPress={() => navigation.goBack()} title={'Notification'} />
      <ScrollView 
        style={styles.wrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
      <View style={{marginBottom: responsiveHeight(2)}}>
        {notifications.map((notification, index) => (
          <View key={index} style={styles.noticontainer}>
            {/* <View style={styles.dot} /> */}
            <View style={styles.card}>
              <Text style={styles.title}>{notification.title}</Text>
              <Text style={styles.description}>
                {notification.description}
              </Text>
              <View style={styles.footer}>
                <Text style={styles.time}>{moment(notification.created_at).format('DD-MM-YYYY')}</Text>
                <Text style={styles.date}>{moment(notification.created_at).format('hh:mm a')}</Text>
              </View>
            </View>
          </View>
        ))}
        </View>
        {renderFooter()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  wrapper: {
    padding: 10,
    marginBottom: responsiveHeight(1)
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  noticontainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    paddingHorizontal: 5,
    marginBottom: 5
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: 5,
    marginRight: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(2),
    color: "#2A2A2A",
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.7),
    color: "#696969",
    marginVertical: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  time: {
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
    color: "#9D9D9D",
  },
  date: {
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
    color: "#9D9D9D",
  },
});
