import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Text, Image, View, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

import HomeScreen from '../screens/NoAuthScreen/Customer/HomeScreen';
import NotificationScreen from '../screens/NoAuthScreen/Customer/NotificationScreen';
import PrivacyPolicy from '../screens/NoAuthScreen/Customer/PrivacyPolicy';
import ChatScreen from '../screens/NoAuthScreen/Customer/ChatScreen';
import { bookmarkedFill, bookmarkedNotFill, bookmarkednotFocusedImg, calenderFocusedImg, calenderImg, homeIconFocusedImg, homeIconNotFocusedImg, menuImg, messageImg, quotesImg, talkFocusedImg, talkImg } from '../utils/Images';
import ThankYouBookingScreen from '../screens/NoAuthScreen/Customer/ThankYouBookingScreen';
import BookingSummary from '../screens/NoAuthScreen/Customer/BookingSummary';
import PaymentFailed from '../screens/NoAuthScreen/Customer/PaymentFailed';
import QuotesScreen from '../screens/NoAuthScreen/Customer/QuotesScreen';
import QuotesListScreen from '../screens/NoAuthScreen/Customer/QuotesListScreen';
import SearchScreen from '../screens/NoAuthScreen/Customer/SearchScreen';
import TopLocationScreen from '../screens/NoAuthScreen/Customer/TopLocationScreen';
import TopLocationScreenDetails from '../screens/NoAuthScreen/Customer/TopLocationScreenDetails';
import TravelAgencyDetails from '../screens/NoAuthScreen/Customer/TravelAgencyDetails';
import PackageDetailsScreen from '../screens/NoAuthScreen/Customer/PackageDetailsScreen';
import PaymentSuccessScreen from '../screens/NoAuthScreen/Customer/PaymentSuccessScreen';
import MenuScreen from '../screens/NoAuthScreen/Customer/MenuScreen';
import ProfileEditScreen from '../screens/NoAuthScreen/Customer/ProfileEditScreen';
import MyBookingList from '../screens/NoAuthScreen/Customer/MyBookingList';
import MyBookingDetails from '../screens/NoAuthScreen/Customer/MyBookingDetails';
import CompletedBookingDetails from '../screens/NoAuthScreen/Customer/CompletedBookingDetails';
import UpcommingBookingDetails from '../screens/NoAuthScreen/Customer/UpcommingBookingDetails';
import ChatListScreen from '../screens/NoAuthScreen/Customer/ChatListScreen';
import RefundScreen from '../screens/NoAuthScreen/Customer/RefundScreen';
import CustomerSupport from '../screens/NoAuthScreen/Customer/CustomerSupport';
import ReviewScreen from '../screens/NoAuthScreen/Customer/ReviewScreen';
import NearbyTourPlanerList from '../screens/NoAuthScreen/Customer/NearbyTourPlanerList';
import FilterPackageResult from '../screens/NoAuthScreen/Customer/FilterPackageResult';
import WishlistPackage from '../screens/NoAuthScreen/Customer/WishlistPackage';
import TransactionScreen from '../screens/NoAuthScreen/Customer/TransactionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = ({ navigation }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('Home');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TopLocationScreen"
        component={TopLocationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TopLocationScreenDetails"
        component={TopLocationScreenDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TravelAgencyDetails"
        component={TravelAgencyDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PackageDetailsScreen"
        component={PackageDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingSummary"
        component={BookingSummary}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='ChatScreen'
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ThankYouBookingScreen"
        component={ThankYouBookingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentFailed"
        component={PaymentFailed}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="RefundScreen"
        component={RefundScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentSuccessScreen"
        component={PaymentSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyBookingDetails"
        component={MyBookingDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReviewScreen"
        component={ReviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NearbyTourPlanerList"
        component={NearbyTourPlanerList}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="FilterPackageResult"
        component={FilterPackageResult}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const QuotesStack = ({ navigation, route }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('QuotesScreen');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="QuotesScreen"
        component={QuotesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuotesListScreen"
        component={QuotesListScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};

const MessageStack = ({ navigation, route }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('ChatListScreen');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatListScreen"
        component={ChatListScreen}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name='ChatScreen'
        component={ChatScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};


const MenuStack = ({ navigation, route }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('MenuScreen');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MenuScreen"
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileEditScreen"
        component={ProfileEditScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyBookingList"
        component={MyBookingList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyBookingDetails"
        component={MyBookingDetails}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="CompletedBookingDetails"
        component={CompletedBookingDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpcommingBookingDetails"
        component={UpcommingBookingDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomerSupport"
        component={CustomerSupport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WishlistPackage"
        component={WishlistPackage}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="TransactionScreen"
        component={TransactionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PackageDetailsScreen"
        component={PackageDetailsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};

const TabNavigator = ({ navigation }) => {
  const cartProducts = useSelector(state => state.cart)
  console.log(cartProducts)
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarInactiveTintColor: '#1F1F1F',
        tabBarActiveTintColor: '#FF455C',
        tabBarStyle: {
          height: 100,
        },
      }}
    >
      <Tab.Screen
        name="HOME"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FAFAFA',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={homeIconFocusedImg} tintColor={color} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1),marginTop: responsiveHeight(1) }}>Home</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Talk"
        component={QuotesStack}
        // listeners={{
        //   tabPress: e => {
        //     e.preventDefault();
        //     navigation.navigate('QuotesScreen')
        //   },
        // }}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FAFAFA',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              {/* <FontAwesome name="rupee-sign" color={color} size={size} style={{ marginTop: responsiveHeight(1.2) }} /> */}
              <Image source={quotesImg} tintColor={color} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1),marginTop: responsiveHeight(1) }}>Quotes</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Message"
        component={MessageStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FAFAFA',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={messageImg} tintColor={color} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1),marginTop: responsiveHeight(1) }}>Messages</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Menu"
        component={MenuStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FAFAFA',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={menuImg} tintColor={color} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1),marginTop: responsiveHeight(1) }}>Menu</Text>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

const getTabBarVisibility = route => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  //console.log(routeName)
  if (routeName == 'Summary') {
    return 'none';
  } else if (routeName == 'ThankYouBookingScreen') {
    return 'none';
  } else if (routeName == 'ChatScreen') {
    return 'none';
  } else if (routeName == 'ReviewScreen') {
    return 'none';
  } else if (routeName == 'WalletScreen') {
    return 'none';
  } else if (routeName == 'PaymentFailed') {
    return 'none';
  } else if (routeName == 'ProfileScreen') {
    return 'none';
  } else {
    return 'flex';
  }
};

export default TabNavigator;
