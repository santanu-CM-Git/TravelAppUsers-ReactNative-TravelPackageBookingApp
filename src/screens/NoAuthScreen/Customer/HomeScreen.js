import React, { useContext, useMemo, useState, useEffect, memo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Alert,
  Dimensions,
  BackHandler,
  Platform,
  TextInput,
  StatusBar,
  PermissionsAndroid,
  ActivityIndicator,
  Linking
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../../context/AuthContext';
import { getProducts } from '../../../store/productSlice'
import moment from 'moment-timezone';
import CustomButton from '../../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../../store/cartSlice';
import { freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, filterImg, productImg, travelImg, likefillImg, mappinImg, starImg } from '../../../utils/Images';
import Loader from '../../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../../components/CustomHeader';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, GOOGLE_MAP_KEY } from '@env'
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import StarRating from 'react-native-star-rating-widget';
import SwitchSelector from "react-native-switch-selector";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";
import Geolocation from 'react-native-geolocation-service';
import Toast from 'react-native-toast-message';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Entypo from 'react-native-vector-icons/Entypo';
import RadioGroup from 'react-native-radio-buttons-group';
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ensureNotificationPermission } from '../../../utils/NotificationPermission';
import { SafeAreaView } from 'react-native-safe-area-context';
import IOSDatePickerModal from '../../../components/IOSDatePickerModal';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio

// Memoized constants
const TABS = [
  { label: 'All  packages', value: 'all_packages' },
  { label: 'International', value: 'international' },
  { label: 'Domestic', value: 'domestic' },
];

const SWITCH_OPTIONS = [
  { label: "New Packages", value: "New Packages" },
  { label: "Near by", value: "Near by" },
];


export default function HomeScreen() {
  const navigation = useNavigation();
  const carouselRef = useRef(null);
  const dispatch = useDispatch();
  const { data: products, status } = useSelector(state => state.products)
  const { logout } = useContext(AuthContext);
  // const { userInfo } = useContext(AuthContext)
  // Loading states
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [recentview, setRecentview] = useState([]);
  const [destinationsData, setDestinationsData] = useState([]);
  const [isBannerShown, setIsBannerShown] = useState([]);

  // Nearby tour agent states
  const [nearbyTourAgent, setNearbyTourAgent] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [pageno, setPageno] = useState(1);
  const [loading, setLoading] = useState(false);

  // New package states
  const [newPackageData, setNewPackageData] = useState([]);
  const [hasMoreNewPackages, setHasMoreNewPackages] = useState(true);
  const [pagenoNewPackages, setPagenoNewPackages] = useState(1);
  const [loadingNewPackages, setLoadingNewPackages] = useState(false);

  // Nearby package states
  const [nearbyPackageData, setNearbyPackageData] = useState([]);
  const [hasMoreNearbyPackages, setHasMoreNearbyPackages] = useState(true);
  const [pagenoNearbyPackages, setPagenoNearbyPackages] = useState(1);
  const [loadingNearbyPackages, setLoadingNearbyPackages] = useState(false);

  // Tab states
  const [activeTab, setActiveTab] = useState('all_packages');
  const [activeTab2, setActiveTab2] = useState('New Packages');
  const [activeButtonNo, setActiveButtonNo] = useState(0);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showIOSFromDatePicker, setShowIOSFromDatePicker] = useState(false);
  const [showIOSToDatePicker, setShowIOSToDatePicker] = useState(false);

  const [adultPassengers, setAdultPassengers] = useState("");
  const [kidsPassengers, setKidsPassengers] = useState("");
  
  // Passenger limits
  const MIN_ADULT_PASSENGERS = 1;
  const MAX_ADULT_PASSENGERS = 100;
  const MIN_KIDS_PASSENGERS = 0;
  const MAX_KIDS_PASSENGERS = 100;

  // Maximum date for request quote (5 years from current year - end of 5th year)
  const MAX_QUOTE_DATE = useMemo(() => {
    const maxDate = new Date();
    const currentYear = maxDate.getFullYear();
    // Set to December 31st of the 5th year from now
    maxDate.setFullYear(currentYear + 5, 11, 31); // Month 11 = December, day 31
    maxDate.setHours(23, 59, 59, 999); // Set to end of day
    return maxDate;
  }, []);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationName, setLocationName] = useState('');
  const [countryName, setCountryName] = useState('');
  const [userInfo, setUserInfo] = useState([]);
  const [isLocationDataReady, setIsLocationDataReady] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [isPackageFocus, setYearIsFocus] = useState(false);

  const [packagevalue, setPackageValue] = useState(null);
  const [location, setlocation] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locationError, setlocationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [fromDateModal, setFromDateModal] = useState(new Date());
  const [toDateModal, setToDateModal] = useState(new Date());
  const [showFromDatePickerModal, setShowFromDatePickerModal] = useState(false);
  const [showToDatePickerModal, setShowToDatePickerModal] = useState(false);
  const [showIOSFromDatePickerModal, setShowIOSFromDatePickerModal] = useState(false);
  const [showIOSToDatePickerModal, setShowIOSToDatePickerModal] = useState(false);
  const filterScrollViewRef = useRef(null);
  const [pricevalues, setPriceValues] = useState([0, 25000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [starCount, setStarCount] = useState(5)
  const [selectedId2, setSelectedId2] = useState('1');

  // Memoized radio buttons to prevent unnecessary re-renders
  const radioButtons2 = useMemo(() => ([
    {
      id: '1',
      label: 'All packages',
      value: 'all_packages',
      labelStyle: { color: '#131313' },
      borderColor: '#FF455C',
      color: '#FF455C',
      size: 20,
    },
    {
      id: '2',
      label: 'International',
      value: 'international',
      labelStyle: { color: '#131313' },
      borderColor: '#FF455C',
      color: '#FF455C',
      size: 20,
    },
    {
      id: '3',
      label: 'Domestic',
      value: 'domestic',
      labelStyle: { color: '#131313' },
      borderColor: '#FF455C',
      color: '#FF455C',
      size: 20,
    },
  ]), []);

  // Optimized date change handlers with useCallback
  const onChangeFromDateModal = useCallback((event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowFromDatePickerModal(false);
      if (event.type === 'set' && selectedDate) {
        setFromDateModal(selectedDate);
      }
    } else {
      // iOS - handled by modal
      if (selectedDate) setFromDateModal(selectedDate);
    }
  }, []);

  const onChangeToDateModal = useCallback((event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowToDatePickerModal(false);
      if (event.type === 'set' && selectedDate) {
        setToDateModal(selectedDate);
      }
    } else {
      // iOS - handled by modal
      if (selectedDate) setToDateModal(selectedDate);
    }
  }, []);

  const onChangeFromDate = useCallback((event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowFromDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setFromDate(selectedDate);
      }
    } else {
      // iOS - handled by modal
      if (selectedDate) setFromDate(selectedDate);
    }
  }, []);

  const onChangeToDate = useCallback((event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowToDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setToDate(selectedDate);
      }
    } else {
      // iOS - handled by modal
      if (selectedDate) setToDate(selectedDate);
    }
  }, []);

  // iOS Modal handlers for Request Quote section
  const handleIOSFromDateConfirm = useCallback((selectedDate) => {
    setFromDate(selectedDate);
    setShowIOSFromDatePicker(false);
  }, []);

  const handleIOSToDateConfirm = useCallback((selectedDate) => {
    setToDate(selectedDate);
    setShowIOSToDatePicker(false);
  }, []);

  // Validation handlers for passenger inputs
  const handleAdultPassengersChange = useCallback((text) => {
    // Allow empty string for clearing
    if (text === '') {
      setAdultPassengers('');
      return;
    }
    
    // Only allow numeric input
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '') {
      setAdultPassengers('');
      return;
    }
    
    const numValue = parseInt(numericValue, 10);
    
    // Enforce min/max limits
    if (numValue < MIN_ADULT_PASSENGERS) {
      setAdultPassengers(MIN_ADULT_PASSENGERS.toString());
    } else if (numValue > MAX_ADULT_PASSENGERS) {
      setAdultPassengers(MAX_ADULT_PASSENGERS.toString());
    } else {
      setAdultPassengers(numericValue);
    }
  }, []);

  const handleKidsPassengersChange = useCallback((text) => {
    // Allow empty string for clearing
    if (text === '') {
      setKidsPassengers('');
      return;
    }
    
    // Only allow numeric input
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '') {
      setKidsPassengers('');
      return;
    }
    
    const numValue = parseInt(numericValue, 10);
    
    // Enforce min/max limits
    if (numValue < MIN_KIDS_PASSENGERS) {
      setKidsPassengers(MIN_KIDS_PASSENGERS.toString());
    } else if (numValue > MAX_KIDS_PASSENGERS) {
      setKidsPassengers(MAX_KIDS_PASSENGERS.toString());
    } else {
      setKidsPassengers(numericValue);
    }
  }, []);


  const getFCMToken = useCallback(async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      await AsyncStorage.setItem('fcmToken', token);
    } catch (e) {
      console.log('FCM Token Error:', e);
    }
  }, []);

  useEffect(() => {
    getFCMToken()
    if (Platform.OS == 'android' || Platform.OS === 'ios') {
      /* this is app foreground notification */
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        //console.log('Received background message:', JSON.stringify(remoteMessage));
        if (remoteMessage?.notification?.title === 'Appointment Cancelled') {
          //fetchUpcomingBooking()
        }
      });

      return unsubscribe;
    }
  }, [])

  // useEffect(() => {
  //   const backAction = () => {
  //     if (Platform.OS === 'android') {
  //       BackHandler.exitApp(); // Minimize the app (simulating background run)
  //       return true; // Prevent default back action
  //     }
  //     return false;
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction
  //   );

  //   return () => backHandler.remove(); // Cleanup the event listener on component unmount
  // }, []);

  // useEffect(() => {
  //   const backAction = () => {
  //     Alert.alert('Hold on!', 'Are you sure you want to go back?', [
  //       {
  //         text: 'Cancel',
  //         onPress: () => null,
  //         style: 'cancel',
  //       },
  //       { text: 'YES', onPress: () => BackHandler.exitApp() },
  //     ]);
  //     return true;
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction,
  //   );

  //   return () => backHandler.remove();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecentViewed()
    }, [])
  );

  const requestLocationPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'This app needs to access your location',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
          // Check notification permission after location permission is granted
          checkNotificationPermission();
        } else {
          Alert.alert('Permission Denied', 'Location permission is required');
        }
      } else {
        const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (status === RESULTS.GRANTED) {
          getCurrentLocation();
          // Check notification permission after location permission is granted
          checkNotificationPermission();
        } else if (status === RESULTS.DENIED) {
          const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          if (result === RESULTS.GRANTED) {
            getCurrentLocation();
            // Check notification permission after location permission is granted
            checkNotificationPermission();
          } else {
            Alert.alert('Permission Denied', 'Location permission is required');
          }
        } else if (status === RESULTS.BLOCKED) {
          Alert.alert(
            'Permission Blocked',
            'Please enable location permissions from settings',
          );
        }
      }
    } catch (error) {
      console.log('Location Permission Error:', error);
    }
  }, []);

  const checkNotificationPermission = useCallback(async () => {
    try {
      await ensureNotificationPermission();
    } catch (error) {
      console.log('Notification Permission Error:', error);
    }
  }, []);





  const getCurrentLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const placeName = await getAddressFromCoords(latitude, longitude);
        setLatitude(latitude);
        setLongitude(longitude);
        setIsLoading(false);
        console.log('You are at:', placeName);
      },
      error => {
        console.log('Location Error:', error.message);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }, []);

  const getAddressFromCoords = useCallback(async (latitude, longitude) => {
    try {
      const apiKey = GOOGLE_MAP_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      const json = await response.json();

      if (json.results.length > 0) {
        const firstResult = json.results[0];
        const place = firstResult.formatted_address;

        const countryComponent = firstResult.address_components.find(component =>
          component.types.includes("country")
        );
        const countryName = countryComponent ? countryComponent.long_name : null;

        setLocationName(place);
        setCountryName(countryName);
        setIsLocationDataReady(true);

        if (countryName) {
          await AsyncStorage.setItem('countryName', countryName);
        }

        // Update profile with location information
        const usertoken = await AsyncStorage.getItem('userToken');
        if (usertoken) {
          const formData = new FormData();
          formData.append("address", place);
          formData.append("lat", latitude.toString());
          formData.append("long", longitude.toString());
          formData.append("country", countryName);

          await axios.post(`${API_URL}/customer/profile-update`, formData, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data',
              "Authorization": `Bearer ${usertoken}`,
            },
          });
        }

        return { place, countryName };
      } else {
        console.log('No results found');
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchProfileDetails();
    fetchalllocation();
    fetchBanner();
    fetchRecentViewed();
    requestLocationPermission();

    // Check notification permission on app start
    const checkInitialNotificationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          if (!granted) {
            // Don't show modal immediately, wait for location permission
            console.log('Notification permission not granted');
          }
        } else {
          const authStatus = await messaging().hasPermission();
          if (authStatus === messaging.AuthorizationStatus.DENIED) {
            // Don't show modal immediately, wait for location permission
            console.log('Notification permission denied');
          }
        }
      } catch (error) {
        console.log('Initial notification permission check error:', error);
      }
    };

    checkInitialNotificationPermission();
  }, [])

  useEffect(() => {
    if (isLocationDataReady && latitude && longitude && countryName) {
      fetchTopLocation();
      fetchNearbyTourPlaner(1);
      fetchNewPackage(1);
      fetchNearbyPackage(1);
    }
  }, [isLocationDataReady, latitude, longitude, countryName]);

  const fetchProfileDetails = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      console.log(usertoken, 'usertoken')
      axios.post(`${API_URL}/customer/profile-details`, {}, {
        headers: {
          "Authorization": `Bearer ${usertoken}`,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let userInfo = res.data.data;
          console.log(userInfo, 'user data from contact informmation')
          setUserInfo(userInfo)
        })
        .catch(e => {
          console.log(`Profile error from home page ${e}`)
        });
    });
  }
  const fetchalllocation = () => {
    axios.get(`${API_URL}/location`, {
      headers: {
        "Content-Type": 'application/json'
      },
    })
      .then(res => {
        let userInfo = res.data.data;
        let minPrice = res.data.min_price;
        let maxPrice = res.data.max_price;
        setMinPrice(0)
        setMaxPrice(maxPrice)
        setPriceValues([0, maxPrice])
        const formattedData = userInfo.map(item => ({
          label: item.name,
          value: item.id
        }));

        console.log(formattedData, 'Formatted User Type');
        setLocationList(formattedData);
        setIsLoading(false)
      })
      .catch(e => {
        console.log(`location error ${e}`)
      });
  }

  const fetchBanner = async () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      console.log(usertoken, 'usertoken')
      axios.post(`${API_URL}/customer/banner`, {}, {
        headers: {
          "Authorization": `Bearer ${usertoken}`,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {

          if (res.data.response == true) {
            let banner = res.data.data;
            console.log(banner, 'hjghjg');
            setIsBannerShown(banner)
          } else {
            setIsBannerShown([])
          }
        })
        .catch(e => {
          console.log(`Profile error from home page ${e}`)
        });
    });
  }

  const fetchRecentViewed = async () => {
    try {
      const usertoken = await AsyncStorage.getItem('userToken');
      if (!usertoken) {
        throw new Error('User token not found');
      }

      const response = await axios.post(
        `${API_URL}/customer/recent-viewed`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${usertoken}`,
            "Content-Type": 'application/json',
          },
        }
      );

      let recentView = response.data.data;
      console.log(recentView, 'recent view data');

      // Get the last 5 entries
      recentView = recentView.slice(0, 5);
      setRecentview(recentView);

    } catch (error) {
      console.log(`fetch previous booking error ${error}`);
      if (error.response && error.response.data && error.response.data.message) {
        console.log(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopLocation = async () => {
    try {
      const usertoken = await AsyncStorage.getItem('userToken');
      if (!usertoken) {
        throw new Error('User token not found');
      }

      const option = {
        "lat": latitude,
        "long": longitude,
        "flag": activeTab,
        "country": countryName,
      }
      console.log(option)
      const response = await axios.post(
        `${API_URL}/customer/top-location`,
        option,
        {
          headers: {
            "Authorization": `Bearer ${usertoken}`,
            "Content-Type": 'application/json',
          },
        }
      );

      let toplocation = response.data.data;
      console.log(toplocation, 'top location data from home screen');

      // Get the last 5 entries
      toplocation = toplocation.slice(0, 5);
      setDestinationsData(toplocation);

    } catch (error) {
      console.log(`fetch Top Location error ${error}`);
      if (error.response && error.response.data && error.response.data.message) {
        console.log(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const fetchNearbyTourPlaner = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const usertoken = await AsyncStorage.getItem('userToken');
      if (!usertoken) {
        console.log('No user token found');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/customer/nearBy-traveller`,
        {
          lat: latitude,
          long: longitude,
          country: countryName
        },
        {
          params: {
            page
          },
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${usertoken}`,
          },
        }
      );

      const responseData = response.data.data.data;
      console.log(responseData, 'nearby tour planner data');
      //setNearbyTourAgent(prevData => page === 1 ? responseData : [...prevData, ...responseData]);
      // Store only the first 5 items
      const limitedData = responseData.slice(0, 5);
      setNearbyTourAgent(prevData => page === 1 ? limitedData : [...prevData, ...limitedData].slice(0, 5));

      if (responseData.length === 0) {
        setHasMore(false); // No more data to load
      }
    } catch (error) {
      console.log(`Fetch nearby tour planner error: ${error}`);
      let myerror = error.response?.data?.message;
      Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
        { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
      ]);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [latitude, longitude, countryName]);

  const fetchNewPackage = useCallback(async (page = 1) => {
    try {
      setLoadingNewPackages(true);
      const usertoken = await AsyncStorage.getItem('userToken');
      if (!usertoken) {
        console.log('No user token found');
        setIsLoading(false);
        return;
      }
      const option = {
        "country": countryName,
        "flag": activeTab,
        "lat": latitude,
        "long": longitude
      }
      console.log(option)
      const response = await axios.post(
        `${API_URL}/customer/new-packages`,
        option,
        {
          params: {
            page
          },
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${usertoken}`,
          },
        }
      );

      const responseData = response.data.data.data;
      console.log(responseData, 'new packages data');
      //setNewPackageData(prevData => page === 1 ? responseData : [...prevData, ...responseData]);
      setNewPackageData(prevData => {
        const newData = page === 1 ? responseData : [...prevData, ...responseData];
        return newData.slice(0, 10); // only keep maximum 10 items
      });

      if (responseData.length === 0) {
        setHasMoreNewPackages(false); // No more data to load
      }
    } catch (error) {
      console.log(`Fetch new packages error: ${error}`);
      let myerror = error.response?.data?.message;
      Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
        { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
      ]);
    } finally {
      setIsLoading(false);
      setLoadingNewPackages(false);
    }
  }, [countryName, latitude, longitude, activeTab]);

  const fetchNearbyPackage = useCallback(async (page = 1) => {
    try {
      setLoadingNearbyPackages(true);
      const usertoken = await AsyncStorage.getItem('userToken');
      if (!usertoken) {
        console.log('No user token found');
        setIsLoading(false);
        return;
      }

      const option = {
        "country": countryName,
        "lat": latitude,
        "long": longitude
      }
      console.log('Fetching page:', page, 'with options:', option)

      const response = await axios.post(
        `${API_URL}/customer/nearby-packages`,
        option,
        {
          params: {
            page: 1 // Always start from page 1
          },
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${usertoken}`,
          },
        }
      );

      if (response?.data?.packages) {
        const packages = response.data.packages;
        const responseData = packages.data || [];
        console.log('Pagination info:', {
          currentPage: packages.current_page,
          lastPage: packages.last_page,
          total: packages.total,
          dataLength: responseData.length
        });

        // Reset pagination state
        setPagenoNearbyPackages(1);
        setHasMoreNearbyPackages(false); // Since we're only getting one page

        // Update data state
        setNearbyPackageData(responseData);
      } else {
        console.log('Invalid response structure:', response);
        setNearbyPackageData([]);
      }
    } catch (error) {
      console.log(`Fetch nearby packages error: ${error}`);
      let myerror = error.response?.data?.message;
      Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
        { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
      ]);
    } finally {
      setIsLoading(false);
      setLoadingNearbyPackages(false);
    }
  }, [countryName, latitude, longitude]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     fetchProfileDetails()
  //   }, [])
  // )

  // Function to save selected tab to AsyncStorage
  const saveSelectedTab = async (tabValue) => {
    try {
      await AsyncStorage.setItem('selectedTab', tabValue);
    } catch (error) {
      console.log('Error saving selected tab:', error);
    }
  };

  // Function to load saved tab from AsyncStorage
  const loadSelectedTab = async () => {
    try {
      const savedTab = await AsyncStorage.getItem('selectedTab');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    } catch (error) {
      console.log('Error loading selected tab:', error);
    }
  };

  useEffect(() => {
    loadSelectedTab();
  }, []);

  // Add new useEffect to watch for activeTab changes
  useEffect(() => {
    if (isLocationDataReady && latitude && longitude && countryName) {
      fetchTopLocation();
      fetchNewPackage(1);
    }
  }, [activeTab, isLocationDataReady, latitude, longitude, countryName]);

  const renderRecentView = useCallback(({ item }) => (
    <TouchableWithoutFeedback onPress={() => navigation.navigate('PackageDetailsScreen', { packageId: item.package_id })}>
      <View style={styles.productSection}>
        <View style={styles.topAstrologerSection}>
          <View style={styles.totalValue}>
            <Image source={{ uri: item?.package?.cover_photo_url }} style={styles.productImg} />
            <Text style={styles.productText} numberOfLines={1}>{item?.package?.name}</Text>
          </View>
        </View>
        <View style={styles.tagTextView}>
          <Text style={styles.tagText}>{item?.package?.location}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  ), [navigation]);

  const renderNearbyTourPlanner = useCallback(({ item }) => {
    // Return null if no active packages
    if (!item.no_of_active_packages || item.no_of_active_packages <= 0) {
      return null;
    }

    return (
      <TouchableWithoutFeedback onPress={() => navigation.navigate('TravelAgencyDetails', { item: item, countryName: countryName })}>
        <View style={styles.productSection}>
          <View style={styles.topAstrologerSection}>
            <View style={styles.totalValue3}>
              <Image source={{ uri: item?.profile_photo_url }} style={styles.productImg3} />
              <View style={{ margin: 5 }}>
                <Text style={styles.productText3}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                  <Image source={mappinImg} style={styles.pinImg} />
                  <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                </View>
                <View
                  style={{
                    borderBottomColor: '#C0C0C0',
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    marginVertical: 5,
                  }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                  <Text style={styles.packageAvlText}>Package : {item.no_of_active_packages}</Text>
                  {item?.rating !== null && item?.rating !== undefined && item?.rating !== 0 && (
                    <View style={styles.rateingView}>
                      <Image source={starImg} style={[styles.staricon, { marginTop: -5 }]} />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }, [navigation, countryName]);

  const formatNumber = useCallback((num) => {
    if (num >= 100000) {
      return (num / 100000).toFixed(1).replace(/\.0$/, '') + 'L'; // Lakhs
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; // Thousands
    }
    return num.toString(); // Less than 1000
  }, []);

  const renderNewPackageItem = useCallback(({ item }) => (
    <TouchableWithoutFeedback onPress={() => navigation.navigate('PackageDetailsScreen', { packageId: item.id })}>
      <View style={styles.productSection}>
        <View style={styles.topAstrologerSection}>
          <View style={styles.totalValue4}>
            <Image
              source={{ uri: item?.cover_photo_url }}
              style={styles.productImg4}
            />
            <View style={{ margin: 5 }}>
              <Text style={styles.productText4} numberOfLines={1}>{item?.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={mappinImg}
                  style={styles.pinImg}
                />
                <Text style={styles.addressText}>{item?.location}</Text>
              </View>
              <Text style={styles.travelerText}>{item?.agent?.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  {item?.date_type == 0 ?
                    <Text style={styles.addressText}>Slots : {item?.seat_slots - item?.booked_slots}</Text>
                    :
                    null
                  }
                </View>
                <Text style={styles.priceText2}>₹{formatNumber(item?.discounted_price)}</Text>
              </View>
              <View
                style={{
                  borderBottomColor: '#C0C0C0',
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  marginVertical: 5
                }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                {item?.date_type == 0 ?
                  <Text style={styles.packageAvlText}>
                    {(() => {
                      const start = moment(item.start_date);
                      const end = moment(item.end_date);
                      const days = end.diff(start, 'days') + 1;
                      const nights = days > 0 ? days - 1 : 0;
                      return `${days} Days ${nights} Nights`;
                    })()}
                  </Text> :
                  <Text style={styles.packageAvlText}>
                    {item?.itinerary.length} Days {item?.itinerary.length - 1} Nights
                  </Text>
                }
                {item?.rating != null && item?.rating != undefined && item?.rating != 0 && (
                  <View style={styles.rateingView}>
                    <Image
                      source={starImg}
                      style={[styles.staricon, { marginTop: -5 }]}
                    />
                    <Text style={styles.ratingText}>{item?.rating || 0}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.tagTextView4}>
              <View style={styles.newPackageTagCutLeft} />
              <Text style={styles.tagText}>New</Text>
              <View style={styles.newPackageTagCutRight} />
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  ), [navigation, formatNumber]);

  const renderNearbyPackageItem = useCallback(({ item }) => (
    <TouchableWithoutFeedback onPress={() => navigation.navigate('PackageDetailsScreen', { packageId: item.id })}>
      <View style={styles.productSection}>
        <View style={styles.topAstrologerSection}>
          <View style={styles.totalValue4}>
            <Image
              source={{ uri: item?.cover_photo_url }}
              style={styles.productImg4}
            />
            <View style={{ margin: 5 }}>
              <Text style={styles.productText4} numberOfLines={1}>{item?.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={mappinImg}
                  style={styles.pinImg}
                />
                <Text style={styles.addressText}>{item?.location}</Text>
              </View>
              <Text style={styles.travelerText}>{item?.agent?.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  {item?.date_type == 0 ?
                    <Text style={styles.addressText}>Slots : {item?.seat_slots}</Text>
                    :
                    null
                  }
                </View>
                <Text style={styles.priceText2}>₹{formatNumber(item?.discounted_price)}</Text>
              </View>
              <View
                style={{
                  borderBottomColor: '#C0C0C0',
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  marginVertical: 5
                }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                {item?.date_type == 0 ?
                  <Text style={styles.packageAvlText}>
                    {(() => {
                      const start = moment(item.start_date);
                      const end = moment(item.end_date);
                      const days = end.diff(start, 'days');
                      const nights = days > 0 ? days - 1 : 0;
                      return `${days} Days ${nights} Nights`;
                    })()}
                  </Text> :
                  <Text style={styles.packageAvlText}>
                    {item?.itinerary.length} Days {item?.itinerary.length - 1} Nights
                  </Text>
                }
                {item?.rating !== null && item?.rating !== undefined && item?.rating !== 0 && (
                  <View style={styles.rateingView}>
                    <Image
                      source={starImg}
                      style={[styles.staricon, { marginTop: -5 }]}
                    />
                    <Text style={styles.ratingText}>{item?.rating || 0}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  ), [navigation, formatNumber]);

  const renderTopLocationItem = useCallback(({ item }) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.5}
      onPress={() => navigation.navigate('TopLocationScreenDetails', {
        location: item,
        country: userInfo?.country
      })}
    >
      <View style={styles.topLocationCardContainer}>
        {/* Background Image (Slightly Behind) */}
        <View style={styles.topLocationBackgroundWrapper}>
          <Image source={{ uri: item?.backgroud_image_url }} style={styles.topLocationBackgroundImage} />
        </View>
        {/* Main Image (On Top) */}
        <View style={styles.topLocationMainImageWrapper}>
          <Image source={{ uri: item?.image_url }} style={styles.topLocationMainImage} />
          {/* Location Tag */}
          <View style={styles.topLocationTag}>
            <Text style={[styles.topLocationTagText, { maxWidth: 110 }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.location_name}
            </Text>
            <View style={styles.topLocationTagCut} />
          </View>
        </View>
        {/* Price Section (Below the Main Image) */}
        <View style={styles.topLocationPriceContainer}>
          <Text style={styles.topLocationStartingText}>Starting at</Text>
          <Text style={styles.topLocationPriceText}>₹{item?.lowest_price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation, userInfo?.country]);

  const handleRequestQuote = useCallback(async () => {
    try {
      // Validate required fields
      if (!locationId) {
        Alert.alert('Error', 'Please select location');
        return;
      }

      if (!fromDate || !toDate) {
        Alert.alert('Error', 'Please select both from and to dates');
        return;
      }

      if (moment(toDate).isSameOrBefore(moment(fromDate), 'day')) {
        Alert.alert('Error', 'To Date must be after From Date');
        return;
      }

      if (!adultPassengers) {
        Alert.alert('Error', 'Please enter number of adult passengers');
        return;
      }

      const adultCount = parseInt(adultPassengers, 10);
      const kidsCount = kidsPassengers ? parseInt(kidsPassengers, 10) : 0;

      // Validate adult passengers limits
      if (adultCount < MIN_ADULT_PASSENGERS || adultCount > MAX_ADULT_PASSENGERS) {
        Alert.alert('Error', `Adult passengers must be between ${MIN_ADULT_PASSENGERS} and ${MAX_ADULT_PASSENGERS}`);
        return;
      }

      // Validate kids passengers limits
      if (kidsCount < MIN_KIDS_PASSENGERS || kidsCount > MAX_KIDS_PASSENGERS) {
        Alert.alert('Error', `Kids passengers must be between ${MIN_KIDS_PASSENGERS} and ${MAX_KIDS_PASSENGERS}`);
        return;
      }

      setIsSubmitting(true);

      const quoteData = {
        location: location,
        location_id: locationId,
        sdate: moment(fromDate).format('YYYY-MM-DD'),
        edate: moment(toDate).format('YYYY-MM-DD'),
        adults: adultCount,
        kids: kidsCount,
      };

      const usertoken = await AsyncStorage.getItem('userToken');

      const response = await axios.post(
        `${API_URL}/customer/request-quotes`,
        quoteData,
        {
          headers: {
            "Authorization": `Bearer ${usertoken}`,
            "Content-Type": 'application/json'
          }
        }
      );

      if (response.data.response == true) {
        Toast.show({
          type: 'success',
          text1: '',
          text2: response.data.message || 'Quote request submitted successfully.',
          position: 'top',
          topOffset: Platform.OS == 'ios' ? 55 : 20
        });
        // Reset form
        setPackageValue(null);
        setlocation('');
        setLocationId('');
        setFromDate(new Date());
        setToDate(new Date());
        setAdultPassengers("");
        setKidsPassengers("");
        navigation.navigate('Talk', {
          screen: 'QuotesScreen',
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit quote request');
      }
    } catch (error) {
      console.log('Quote request error:', error);
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: errors[key][0]
          });
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.message || 'Something went wrong'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [locationId, fromDate, toDate, adultPassengers, kidsPassengers, location, navigation]);

  // Optimized load more functions with useCallback
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPageno(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);

  const handleLoadMoreNewPackages = useCallback(() => {
    if (!loadingNewPackages && hasMoreNewPackages) {
      setPagenoNewPackages(prevPage => prevPage + 1);
    }
  }, [loadingNewPackages, hasMoreNewPackages]);

  const handleLoadMoreNearbyPackages = useCallback(() => {
    if (!loadingNearbyPackages && hasMoreNearbyPackages) {
      setPagenoNearbyPackages(prevPage => prevPage + 1);
    }
  }, [loadingNearbyPackages, hasMoreNearbyPackages]);

  useEffect(() => {
    if (pageno > 1) {
      fetchNearbyTourPlaner(pageno);
    }
  }, [pageno]);

  useEffect(() => {
    if (pagenoNewPackages > 1) {
      fetchNewPackage(pagenoNewPackages);
    }
  }, [pagenoNewPackages]);

  useEffect(() => {
    if (pagenoNearbyPackages > 1) {
      fetchNearbyPackage(pagenoNearbyPackages);
    }
  }, [pagenoNearbyPackages]);

  const toggleFilterModal = useCallback(() => {
    setFilterModalVisible(!isFilterModalVisible);
  }, [isFilterModalVisible]);

  const handlePriceChange = useCallback((values) => {
    setPriceValues(values);
  }, []);

  const resetFilters = useCallback(async () => {
    try {
      // Reset all filter states to initial values
      setFromDateModal(new Date());
      setToDateModal(new Date());
      setPriceValues([0, maxPrice]);
      setStarCount(5);
      setActiveTab('all_packages');
      setSelectedId2('1');
      // Close the filter modal
      toggleFilterModal();
    } catch (error) {
      console.log('Error resetting filters:', error);
    }
  }, [maxPrice, toggleFilterModal]);

  const submitForFilter = useCallback(async () => {
    try {
      const filters = {
        flag: selectedId2 == "1" ? "all_packages" : selectedId2 == "2" ? "international" : "domestic",
        country: countryName,
        departute_date: moment(fromDateModal).format('YYYY-MM-DD'),
        return_date: moment(toDateModal).format('YYYY-MM-DD'),
        min_price: pricevalues[0],
        max_price: pricevalues[1],
        rating: starCount
      };
      navigation.navigate('FilterPackageResult', { filters });
      // Close the filter modal
      toggleFilterModal();
    } catch (error) {
      console.log('Error applying filters:', error);
    }
  }, [selectedId2, countryName, fromDateModal, toDateModal, pricevalues, starCount, navigation, toggleFilterModal]);

  // Optimized pull-to-refresh function with useCallback
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchProfileDetails(),
        fetchalllocation(),
        fetchBanner(),
        fetchRecentViewed(),
        fetchTopLocation(),
        fetchNearbyTourPlaner(1),
        fetchNewPackage(1)
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProfileDetails, fetchalllocation, fetchBanner, fetchRecentViewed, requestLocationPermission]);

  // Memoized key extractors for better FlatList performance
  const keyExtractor = useCallback((item, index) => item.id?.toString() ?? index.toString(), []);
  const recentViewKeyExtractor = useCallback((item) => item.id?.toString(), []);

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
      {/* <CustomHeader commingFrom={'Home'} onPressProfile={() => navigation.navigate('Profile')} /> */}
      <View style={styles.homeHeaderView}>
        <View style={styles.nameSection}>
          <View style={styles.collumnView}>
            <Text style={styles.username} numberOfLines={1} ellipsizeMode="tail">HI, {userInfo?.first_name}</Text>
            <View style={styles.locationView}>
              <Image
                source={markerImg}
                style={styles.markerIcon}
              />
              <ShimmerPlaceholder
                visible={true}
                style={{
                  marginLeft: 5,
                  borderRadius: 24
                }}
                shimmerColors={["#FFFFFF", "#ffc7ce", "#FF455C"]}
                LinearGradient={LinearGradient}
              >
                {isLocationDataReady ? (
                  <Text style={[styles.locationname, { marginLeft: 5 }]} numberOfLines={2}>{locationName}</Text>
                ) : (
                  <TouchableOpacity onPress={requestLocationPermission}>
                    <Text style={[styles.locationname, { marginLeft: 5, color: '#FF455C' }]}>Tap to fetch location</Text>
                  </TouchableOpacity>
                )}
              </ShimmerPlaceholder>

            </View>
          </View>
        </View>
        <TouchableWithoutFeedback onPress={() => navigation.navigate('Notification')}>
          <View style={styles.iconSection}>
            <Image
              source={notificationImg}
              style={styles.notificationIcon}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF455C"]}
            tintColor="#FF455C"
          />
        }
      >
        <View style={styles.tabView}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.tabContainer}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.value}
                  onPress={() => {
                    setIsLoading(true);
                    setActiveTab(tab.value);
                    saveSelectedTab(tab.value);
                  }}
                  style={[
                    styles.tab,
                    activeTab === tab.value && styles.activeTab,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.value && styles.activeTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        <View style={styles.headingSection}>
          <Text style={styles.text1}>Explore New Places</Text>
          <Text style={styles.text2}>Travel with Group</Text>
        </View>
        <TouchableWithoutFeedback onPress={() => navigation.navigate('SearchScreen')}>
          <View style={styles.searchSection}>
            <View style={styles.searchInput}>
              <View style={{ flexDirection: 'row' }}>
                <Image
                  source={searchIconImg}
                  style={styles.searchIcon}
                />
                <Text style={styles.placeholderText}>Search</Text>
              </View>
              <TouchableOpacity style={styles.filterButton} onPress={() => toggleFilterModal()}>
                <Image
                  source={filterImg}
                  style={[styles.filterIcon, { marginRight: 5 }]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
        {/* <TouchableOpacity onPress={() => navigation.navigate('FreeTherapistList')}>
        <View style={styles.freebannerContainer}>
          <Image
            source={freebannerPlaceHolder}
            style={styles.freebannerImg}
          />
        </View>
      </TouchableOpacity> */}
        {isBannerShown.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('ReviewScreen', { agentId: isBannerShown[0].agent_id, packageId: isBannerShown[0].package_id })}>
            <Image
              source={freebannerPlaceHolder}
              style={styles.freebannerImg}
            />
          </TouchableOpacity>
          : null}
        {recentview.length > 0 && (
          <View style={styles.sectionHeaderView}>
            <Text style={styles.sectionHeaderText}>Recently Viewed</Text>
          </View>
        )}
        <View style={{ marginRight: responsiveWidth(2) }}>
          <FlatList
            data={recentview}
            keyExtractor={recentViewKeyExtractor}
            renderItem={renderRecentView}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ marginHorizontal: 10 }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={5}
          />
        </View>
        {destinationsData.length > 0 ? (
        <View style={styles.sectionHeaderView}>
          <Text style={styles.sectionHeaderText}>Top location</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TopLocationScreen')}>
            <Text style={styles.seeallText}>View All</Text>
          </TouchableOpacity>
        </View>
        ) : null}
        {destinationsData.length > 0 ? (
          <FlatList
            data={destinationsData}
            keyExtractor={keyExtractor}
            renderItem={renderTopLocationItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            style={styles.topLocationScrollView}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            windowSize={5}
          />
        ) : (
          null
        )}
        <View style={styles.sectionHeaderView}>
          <Text style={styles.sectionHeaderText}>Request for quote</Text>
        </View>
        <View style={styles.quoteView}>
          <View style={styles.cardView}>
            <Image
              source={travelImg}
              style={styles.cardImg}
            />


            <View style={{ width: responsiveWidth(90), padding: 5 }}>
              {/* Location Input */}
              <Text style={styles.textinputHeader}>Location</Text>
              {/* <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#ddd",
                  paddingHorizontal: 10,
                  paddingVertical: 0,
                  borderRadius: 5,
                }}
              >
                <Icon name="map-marker" size={20} color="red" />
                <TextInput
                  style={{ marginLeft: 10, flex: 1, color: '#767676' }}
                  placeholder="Enter Location"
                  value={location}
                  onChangeText={setLocation}
                  placeholderTextColor="#767676"
                />
              </View> */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Dropdown
                  style={[styles.dropdownHalf, isPackageFocus && { borderColor: '#DDD' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  itemTextStyle={styles.selectedTextStyle}
                  data={locationList}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isPackageFocus ? 'Choose Location' : '...'}
                  searchPlaceholder="Search..."
                  value={packagevalue}
                  onFocus={() => setYearIsFocus(true)}
                  onBlur={() => setYearIsFocus(false)}
                  onChange={item => {
                    setPackageValue(item.value);
                    setlocation(item.label)
                    setLocationId(item.value)
                    setYearIsFocus(false);
                    setlocationError('');
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'column' }}>
                  {/* From Date */}
                  <Text style={styles.textinputHeader}>From Date</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS === 'ios') {
                        setShowIOSFromDatePicker(true);
                      } else {
                        setShowFromDatePicker(true);
                      }
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#ddd",
                      paddingHorizontal: 10,
                      paddingVertical: 13,
                      borderRadius: 5,
                      marginTop: 5,
                      width: responsiveWidth(42)
                    }}
                  >
                    <Icon name="calendar" size={20} color="red" />
                    <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{fromDate.toDateString()}</Text>
                  </TouchableOpacity>
                  {Platform.OS === 'android' && showFromDatePicker && (
                    <DateTimePicker
                      value={fromDate}
                      mode="date"
                      display="default"
                      onChange={onChangeFromDate}
                      minimumDate={new Date()}
                      maximumDate={MAX_QUOTE_DATE}
                    />
                  )}
                </View>
                <View style={{ flexDirection: 'column' }}>
                  {/* To Date */}
                  <Text style={styles.textinputHeader}>To Date</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS === 'ios') {
                        setShowIOSToDatePicker(true);
                      } else {
                        setShowToDatePicker(true);
                      }
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#ddd",
                      paddingHorizontal: 10,
                      paddingVertical: 13,
                      borderRadius: 5,
                      marginTop: 5,
                      width: responsiveWidth(42)
                    }}
                  >
                    <Icon name="calendar" size={20} color="red" />
                    <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{toDate.toDateString()}</Text>
                  </TouchableOpacity>
                  {Platform.OS === 'android' && showToDatePicker && (
                    <DateTimePicker
                      value={toDate}
                      mode="date"
                      display="default"
                      onChange={onChangeToDate}
                      minimumDate={fromDate} // Only allow dates after the selected From Date
                      maximumDate={MAX_QUOTE_DATE}
                    />
                  )}
                </View>
              </View>
              {/* Total Adult Passengers Input */}
              <Text style={styles.textinputHeader}>Total Adult Passengers</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#ddd",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 5,
                  marginTop: 5,
                  height: Platform.OS === 'ios' ? responsiveHeight(5) : responsiveHeight(6.5)
                }}
              >
                <Icon name="user" size={20} color="red" />
                <TextInput
                  style={{ marginLeft: 10, flex: 1, color: '#767676' }}
                  placeholder="Enter total adults"
                  keyboardType="numeric"
                  value={adultPassengers}
                  onChangeText={handleAdultPassengersChange}
                  placeholderTextColor="#767676"
                />
              </View>
              <Text style={styles.helperText}>
                Min: {MIN_ADULT_PASSENGERS} | Max: {MAX_ADULT_PASSENGERS}
              </Text>

              {/* Total Kids Passengers Input */}
              <Text style={styles.textinputHeader}>Total Kids Passengers</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#ddd",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 5,
                  marginTop: 5,
                  height: Platform.OS === 'ios' ? responsiveHeight(5) : responsiveHeight(6.5)
                }}
              >
                <Icon name="child" size={20} color="red" />
                <TextInput
                  style={{ marginLeft: 10, flex: 1, color: '#767676' }}
                  placeholder="Enter total kids"
                  keyboardType="numeric"
                  value={kidsPassengers}
                  onChangeText={handleKidsPassengersChange}
                  placeholderTextColor="#767676"
                />
              </View>
              <Text style={styles.helperText}>
                Min: {MIN_KIDS_PASSENGERS} | Max: {MAX_KIDS_PASSENGERS}
              </Text>
            </View>


            <View style={styles.buttonwrapper}>
              <CustomButton
                label={isSubmitting ? "Submitting..." : "Request Quote"}
                onPress={handleRequestQuote}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>
        <View style={styles.sectionHeaderView}>
          <Text style={styles.sectionHeaderText}>Tour planner</Text>
          <TouchableOpacity onPress={() => navigation.navigate('NearbyTourPlanerList')}>
            <Text style={styles.seeallText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginRight: responsiveWidth(2) }}>
          <FlatList
            data={nearbyTourAgent}
            keyExtractor={keyExtractor}
            renderItem={renderNearbyTourPlanner}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ marginHorizontal: 10 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => loading && <ActivityIndicator size="small" color="#FF455C" style={{ alignSelf: 'center' }} />}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={5}
          />
        </View>
        <View style={{ paddingHorizontal: 15, marginVertical: responsiveHeight(1) }}>
          <SwitchSelector
            initial={activeButtonNo}
            onPress={value => setActiveTab2(value)}
            textColor={'#746868'}
            selectedColor={'#FFFFFF'}
            buttonColor={'#FF455C'}
            backgroundColor={'#F4F5F5'}
            borderWidth={0}
            height={responsiveHeight(7)}
            valuePadding={6}
            hasPadding
            options={SWITCH_OPTIONS}
            testID="gender-switch-selector"
            accessibilityLabel="gender-switch-selector"
          />
        </View>
        {activeTab2 == 'New Packages' ?
          <FlatList
            data={newPackageData}
            keyExtractor={keyExtractor}
            renderItem={renderNewPackageItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            style={{ flexGrow: 0 }}
            numColumns={2}
            onEndReached={handleLoadMoreNewPackages}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => loadingNewPackages && <ActivityIndicator size="small" color="#FF455C" style={{ alignSelf: 'center' }} />}
            removeClippedSubviews={true}
            maxToRenderPerBatch={4}
            windowSize={5}
            getItemLayout={(data, index) => ({
              length: 200, // Approximate item height
              offset: 200 * Math.floor(index / 2),
              index,
            })}
          />
          :
          <FlatList
            data={nearbyPackageData}
            keyExtractor={keyExtractor}
            renderItem={renderNearbyPackageItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            style={{ flexGrow: 0 }}
            numColumns={2}
            onEndReached={handleLoadMoreNearbyPackages}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => loadingNearbyPackages && <ActivityIndicator size="small" color="#FF455C" style={{ alignSelf: 'center' }} />}
            removeClippedSubviews={true}
            maxToRenderPerBatch={4}
            windowSize={5}
            getItemLayout={(data, index) => ({
              length: 200, // Approximate item height
              offset: 200 * Math.floor(index / 2),
              index,
            })}
          />
        }

      </ScrollView>
      <Modal
        isVisible={isFilterModalVisible}
        // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
        style={{
          margin: 0, // Add this line to remove the default margin
          justifyContent: 'flex-end',
        }}>
        {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
        <View style={{ height: '70%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <View style={{ padding: 0 }}>
            <View style={{ paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
              <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Filter</Text>
              <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                <Entypo name="cross" size={20} color="#000000" onPress={toggleFilterModal} />
              </View>
            </View>
          </View>
          <ScrollView
            ref={filterScrollViewRef}
            style={{ marginBottom: responsiveHeight(0) }}
            contentContainerStyle={{ paddingBottom: responsiveHeight(5) }}
          >
            <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 0, paddingHorizontal: 15, marginBottom: 5 }}>
              <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Days</Text>
              {/* Show date pickers in full width when open on iOS, otherwise show normal layout */}
              {Platform.OS === 'ios' && showIOSFromDatePickerModal ? (
                <View style={{ marginBottom: responsiveHeight(2) }}>
                  <Text style={styles.textinputHeader}>Departure Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowIOSFromDatePickerModal(false)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#ddd",
                      paddingHorizontal: 10,
                      paddingVertical: 13,
                      borderRadius: 5,
                      marginTop: 5,
                    }}
                  >
                    <Icon name="calendar" size={20} color="red" />
                    <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{fromDateModal.toDateString()}</Text>
                  </TouchableOpacity>
                  <View style={styles.iosPickerContainer}>
                    <DateTimePicker
                      value={fromDateModal}
                      mode="date"
                      display="spinner"
                      minimumDate={new Date()}
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setFromDateModal(selectedDate);
                        }
                      }}
                      textColor="#000"
                      themeVariant="light"
                    />
                    <View style={styles.iosPickerButtons}>
                      <TouchableOpacity
                        onPress={() => setShowIOSFromDatePickerModal(false)}
                        style={styles.iosPickerButton}
                      >
                        <Text style={styles.iosPickerButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : Platform.OS === 'ios' && showIOSToDatePickerModal ? (
                <View style={{ marginBottom: responsiveHeight(2) }}>
                  <Text style={styles.textinputHeader}>Return Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowIOSToDatePickerModal(false)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#ddd",
                      paddingHorizontal: 10,
                      paddingVertical: 13,
                      borderRadius: 5,
                      marginTop: 5,
                    }}
                  >
                    <Icon name="calendar" size={20} color="red" />
                    <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{toDateModal.toDateString()}</Text>
                  </TouchableOpacity>
                  <View style={styles.iosPickerContainer}>
                    <DateTimePicker
                      value={toDateModal}
                      mode="date"
                      display="spinner"
                      minimumDate={fromDateModal}
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setToDateModal(selectedDate);
                        }
                      }}
                      textColor="#000"
                      themeVariant="light"
                    />
                    <View style={styles.iosPickerButtons}>
                      <TouchableOpacity
                        onPress={() => setShowIOSToDatePickerModal(false)}
                        style={styles.iosPickerButton}
                      >
                        <Text style={styles.iosPickerButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: responsiveHeight(2) }}>
                  <View style={{ flexDirection: 'column', flex: 1, marginRight: 5 }}>
                    <Text style={styles.textinputHeader}>Departure Date</Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS === 'ios') {
                          setShowIOSFromDatePickerModal(!showIOSFromDatePickerModal);
                          setShowIOSToDatePickerModal(false); // Close other picker if open
                        } else {
                          setShowFromDatePickerModal(true);
                        }
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "#ddd",
                        paddingHorizontal: 10,
                        paddingVertical: 13,
                        borderRadius: 5,
                        marginTop: 5,
                      }}
                    >
                      <Icon name="calendar" size={20} color="red" />
                      <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{fromDateModal.toDateString()}</Text>
                    </TouchableOpacity>
                    {Platform.OS === 'android' && showFromDatePickerModal && (
                      <DateTimePicker
                        value={fromDateModal}
                        mode="date"
                        display="default"
                        onChange={onChangeFromDateModal}
                      />
                    )}
                  </View>
                  <View style={{ flexDirection: 'column', flex: 1, marginLeft: 5 }}>
                    <Text style={styles.textinputHeader}>Return Date</Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS === 'ios') {
                          setShowIOSToDatePickerModal(!showIOSToDatePickerModal);
                          setShowIOSFromDatePickerModal(false); // Close other picker if open
                        } else {
                          setShowToDatePickerModal(true);
                        }
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "#ddd",
                        paddingHorizontal: 10,
                        paddingVertical: 13,
                        borderRadius: 5,
                        marginTop: 5,
                      }}
                    >
                      <Icon name="calendar" size={20} color="red" />
                      <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{toDateModal.toDateString()}</Text>
                    </TouchableOpacity>
                    {Platform.OS === 'android' && showToDatePickerModal && (
                      <DateTimePicker
                        value={toDateModal}
                        mode="date"
                        display="default"
                        onChange={onChangeToDateModal}
                        minimumDate={fromDateModal} // Only allow dates after the selected From Date in modal
                      />
                    )}
                  </View>
                </View>
              )}
              {/* Hide other filter sections when date picker is open on iOS */}
              {!(Platform.OS === 'ios' && (showIOSFromDatePickerModal || showIOSToDatePickerModal)) && (
                <>
                  <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Type</Text>
                  <View style={{ marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2), marginLeft: -responsiveWidth(2.5) }}>
                    <RadioGroup
                      radioButtons={radioButtons2}
                      onPress={setSelectedId2}
                      selectedId={selectedId2}
                      layout='row'
                      containerStyle={{ flexWrap: 'wrap' }}
                      labelStyle={{ flexShrink: 1, flexWrap: 'wrap', maxWidth: responsiveWidth(40), }}
                    />
                  </View>
                  <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Price</Text>
                  <View style={styles.slidercontainer}>
                    <MultiSlider
                      values={pricevalues}
                      sliderLength={responsiveWidth(80)}
                      onValuesChange={handlePriceChange}
                      min={minPrice}
                      max={maxPrice}
                      step={500}
                      selectedStyle={{ backgroundColor: "#FF455C" }}
                      unselectedStyle={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
                      markerStyle={{ backgroundColor: "#FF455C" }}
                    />
                    <View style={styles.valueContainer}>
                      <Text style={styles.valueText}>₹{pricevalues[0]}</Text>
                      <Text style={styles.valueText}>₹{pricevalues[1]}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Rating</Text>
                  <View style={{ width: responsiveWidth(50), marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) }}>
                    <StarRating
                      disabled={false}
                      maxStars={5}
                      rating={starCount}
                      onChange={(rating) => setStarCount(rating)}
                      fullStarColor={'#FFCB45'}
                      starSize={28}
                      starStyle={{ marginHorizontal: responsiveWidth(1) }}
                    />
                  </View>
                </>
              )}
            </View>
          </ScrollView>
          <View style={{ bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
            <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ width: responsiveWidth(43) }}>
                <CustomButton
                  label={"Reset"}
                  onPress={resetFilters}
                  buttonStyle={{ backgroundColor: '#E3E3E3' }}
                  textStyle={{ color: '#000' }}
                />
              </View>
              <View style={{ width: responsiveWidth(43) }}>
                <CustomButton
                  label={"Apply"}
                  onPress={submitForFilter}
                />
              </View>
            </View>
          </View>
        </View>
        {/* </TouchableWithoutFeedback> */}
      </Modal>

      {/* iOS Date Picker Modals for Request Quote Section - Placed at root level for proper rendering */}
      {Platform.OS === 'ios' && (
        <>
          <IOSDatePickerModal
            visible={showIOSFromDatePicker}
            date={fromDate}
            minimumDate={new Date()}
            maximumDate={MAX_QUOTE_DATE}
            onConfirm={handleIOSFromDateConfirm}
            onCancel={() => setShowIOSFromDatePicker(false)}
            mode="date"
          />
          <IOSDatePickerModal
            visible={showIOSToDatePicker}
            date={toDate}
            minimumDate={fromDate} // Only allow dates after the selected From Date
            maximumDate={MAX_QUOTE_DATE}
            onConfirm={handleIOSToDateConfirm}
            onCancel={() => setShowIOSToDatePicker(false)}
            mode="date"
          />
        </>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    //paddingTop: responsiveHeight(1),
    marginBottom: Platform.OS === 'ios' ? -responsiveHeight(3):0,
  },
  homeHeaderView: {
    width: responsiveWidth(100),
    height: responsiveHeight(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 20
  },
  nameSection: {
    marginTop: responsiveHeight(3),
    width: responsiveWidth(70)
  },
  collumnView: {
    flexDirection: 'column'
  },
  locationView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconSection: {
    marginTop: responsiveHeight(3)
  },
  notificationIcon: {
    height: 25,
    width: 25,
    resizeMode: 'contain'
  },
  markerIcon: {
    height: 15,
    width: 15,
    resizeMode: 'contain'
  },
  username: {
    color: '#757575',
    fontFamily: 'Poppins-Bold',
    fontSize: responsiveFontSize(1.7),
    marginLeft: responsiveWidth(5)
  },
  locationname: {
    color: '#1B2234',
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(1.3),
  },
  tabView: {
    paddingHorizontal: 15,
  },
  /* tab section */
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    width: responsiveWidth(92)
  },
  tab: {
    // paddingVertical: 8,
    // paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderColor: '#FF455C',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: responsiveHeight(5),
    width: responsiveWidth(28)
  },
  activeTab: {
    backgroundColor: '#FF455C',
    borderColor: '#FF455C',
    borderWidth: 1
  },
  tabText: {
    color: '#FF455C',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
  },
  /* tab section */
  headingSection: {
    paddingHorizontal: 15,
  },
  text1: {
    color: '#FF455C',
    fontFamily: 'Poppins-Bold',
    fontSize: responsiveFontSize(2.5),
  },
  text2: {
    color: '#1B2234',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(2),
  },
  searchSection: {
    paddingHorizontal: 15,
    marginTop: responsiveHeight(2)
  },
  searchInput: {
    height: responsiveHeight(6),
    width: responsiveWidth(92),
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 26,
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
  searchIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    marginHorizontal: 8
  },
  placeholderText: {
    color: "#1B2234",
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.7),
  },
  filterIcon: {
    height: 32,
    width: 32,
    resizeMode: 'contain'
  },
  freebannerContainer: {
    marginTop: responsiveHeight(10),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freebannerImg: {
    height: responsiveHeight(12.5), // Adjust height based on desired aspect ratio
    width: responsiveWidth(90.5),   // 92% of the screen width
    borderRadius: 6,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginTop: responsiveHeight(3)
  },
  sectionHeaderView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(0)
  },
  sectionHeaderText: {
    marginHorizontal: 20,
    color: '#2D2D2D',
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(2)
  },
  seeallText: {
    marginHorizontal: 20,
    color: '#FF455C',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.7)
  },
  productSection: {
    marginTop: responsiveHeight(0),
    //marginLeft: 20
  },
  //product section
  topAstrologerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  totalValue: {
    width: responsiveWidth(45),
    //height: responsiveHeight(18),
    alignItems: 'center',
    backgroundColor: '#fff',
    //justifyContent: 'center',
    padding: 5,
    borderRadius: 15,
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
    margin: 2,
    marginBottom: responsiveHeight(2),
    marginRight: 5
  },
  totalValue3: {
    width: responsiveWidth(46),
    //height: responsiveHeight(34),
    //alignItems: 'center',
    backgroundColor: '#fff',
    //justifyContent: 'center',
    padding: 5,
    borderRadius: 15,
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
    margin: 2,
    marginBottom: responsiveHeight(2),
    marginRight: 5
  },
  totalValue4: {
    width: responsiveWidth(46),
    //height: responsiveHeight(40),
    //alignItems: 'center',
    backgroundColor: '#fff',
    //justifyContent: 'center',
    padding: 5,
    borderRadius: 15,
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
    margin: 2,
    marginBottom: responsiveHeight(2),
    marginRight: 5
  },
  productImg: {
    height: responsiveHeight(12),
    width: responsiveFontSize(20),
    resizeMode: 'cover',
    borderRadius: 15,
  },
  productImg3: {
    height: responsiveHeight(21),
    width: responsiveFontSize(21),
    resizeMode: 'cover',
    borderRadius: 15,
    alignSelf: 'center'
  },
  productImg4: {
    height: responsiveHeight(21),
    width: responsiveFontSize(21),
    resizeMode: 'cover',
    borderRadius: 15,
    alignSelf: 'center'
  },
  productText: {
    color: '#1E2023',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
    marginTop: responsiveHeight(1)
  },
  productText3: {
    color: '#1E2023',
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(1.7),
    marginTop: responsiveHeight(1),
  },
  productText4: {
    color: '#1E2023',
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(1.7),
    marginTop: responsiveHeight(1),
  },
  addressText: {
    color: '#686868',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.5),
  },
  priceText2: {
    color: '#FF455C',
    fontFamily: 'Poppins-Bold',
    fontSize: responsiveFontSize(2),
  },
  travelerText: {
    color: '#FF455C',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.6),
  },
  tagTextView: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    backgroundColor: 'red',
    position: 'absolute',
    top: responsiveHeight(9),
    right: responsiveWidth(5),
    borderRadius: 8
  },
  tagTextView3: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    position: 'absolute',
    top: responsiveHeight(3),
    right: responsiveWidth(5),
    borderRadius: 8
  },
  tagTextView4: {
    backgroundColor: '#FF0020',
    paddingVertical: 2,
    paddingHorizontal: 7,
    position: 'absolute',
    top: responsiveHeight(0.2),
    left: responsiveWidth(5),
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5
  },
  tagText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.3),
  },
  cardView: {
    //height: responsiveHeight(6),
    width: responsiveWidth(92),
    backgroundColor: '#FFF',
    borderColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
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
  quoteView: {
    paddingHorizontal: 15,
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1)
  },
  cardImg: {
    height: responsiveHeight(15), // Adjust height based on desired aspect ratio
    width: responsiveWidth(85),   // 92% of the screen width
    borderRadius: 6,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: responsiveHeight(2)
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    width: responsiveWidth(90),
    marginTop: responsiveHeight(2)
  },
  likeImg: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  pinImg: {
    height: 12,
    width: 12,
    resizeMode: 'contain',
    marginRight: 5
  },
  packageAvlText: {
    color: '#686868',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.4),
  },
  rateingView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ratingText: {
    fontSize: responsiveFontSize(1.5),
    color: '#1E2023',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 5
  },
  staricon: {
    height: 15,
    width: 15,
    resizeMode: 'contain'
  },
  textinputHeader: {
    fontSize: responsiveFontSize(1.5),
    color: '#000000',
    fontFamily: 'Poppins-Medium',
    marginBottom: 5,
    marginTop: 10
  },
  helperText: {
    fontSize: responsiveFontSize(1.3),
    color: '#767676',
    fontFamily: 'Poppins-Regular',
    marginTop: 3,
    marginLeft: 5,
    marginBottom: 5
  },

  topLocationScrollView: {
    marginHorizontal: responsiveWidth(2),
  },
  topLocationCardContainer: {
    width: responsiveWidth(43),
    alignItems: "center",
    margin: 8,
  },
  // Background Image Styling
  topLocationBackgroundWrapper: {
    position: "absolute",
    top: 15, // Slightly lower
    zIndex: -1, // Push to the back
  },
  topLocationBackgroundImage: {
    width: responsiveWidth(45),
    height: responsiveHeight(15),
    borderRadius: 8,
    opacity: 0.6, // Make it slightly faded
  },
  // Main Image Styling
  topLocationMainImageWrapper: {
    position: "relative",
    zIndex: 1,
  },
  topLocationMainImage: {
    width: responsiveWidth(35),
    height: responsiveHeight(20),
    borderRadius: 8,
  },
  // Location Tag
  topLocationTag: {
    position: "absolute",
    bottom: 10,
    right: -5,
    backgroundColor: "#FF0020",
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 2,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8
  },
  // Creating the small cut effect
  topLocationTagCut: {
    position: "absolute",
    top: -5,
    right: 0,
    width: 5,
    height: 0,
    borderTopWidth: 5,
    borderTopColor: "#FF0020", // Adjust for different effects
    borderLeftWidth: 5,
    borderLeftColor: "transparent",
    backgroundColor: '#FF0020',
    borderTopRightRadius: 5
  },
  topLocationTagText: {
    fontSize: responsiveFontSize(1.3),
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
  },
  // Price Box Styling
  topLocationPriceContainer: {
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    marginTop: -10, // Space between image and price box
    width: responsiveWidth(27),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
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
  topLocationStartingText: {
    color: '#1E2023',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
    marginTop: responsiveHeight(1)
  },
  topLocationPriceText: {
    color: '#FF455C',
    fontFamily: 'Poppins-Bold',
    fontSize: responsiveFontSize(2),
  },
  newPackageTagCutRight: {
    position: "absolute",
    top: 0,
    right: -4,
    width: 5,
    height: 0,
    borderTopWidth: 5,
    borderTopColor: "#FF0020", // Adjust for different effects
    borderLeftWidth: 5,
    borderLeftColor: "transparent",
    backgroundColor: '#FF0020',
    borderTopRightRadius: 8
  },
  newPackageTagCutLeft: {
    position: "absolute",
    top: 0,
    left: -4,
    width: 5,
    height: 0,
    borderTopWidth: 5,
    borderTopColor: "#FF0020", // Adjust for different effects
    borderRightWidth: 5,
    borderRightColor: "transparent",
    backgroundColor: '#FF0020',
    borderTopLeftRadius: 8
  },
  dropdownHalf: {
    height: responsiveHeight(6.5),
    width: responsiveWidth(88),
    borderColor: '#DDD',
    borderWidth: 0.7,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: responsiveHeight(1)
  },
  placeholderStyle: {
    fontSize: responsiveFontSize(1.8),
    color: '#2F2F2F',
    fontFamily: 'Poppins-Regular'
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#2F2F2F'
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: '#2F2F2F'
  },
  slidercontainer: {
    alignItems: "center",
    marginTop: responsiveHeight(0),
    marginBottom: responsiveHeight(1),
    marginLeft: -10
  },
  valueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: responsiveWidth(90),
    marginTop: responsiveHeight(0),
  },
  valueText: {
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
    color: '#000'
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noLocationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  iosPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: responsiveHeight(35),
    justifyContent: 'center',
    width: '100%',
  },
  iosPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 10,
  },
  iosPickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  iosPickerButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
});

