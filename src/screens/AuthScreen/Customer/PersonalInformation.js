import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  PermissionsAndroid,
  ActivityIndicator
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DocumentPicker from 'react-native-document-picker';
import InputField from '../../../components/InputField';
import CustomButton from '../../../components/CustomButton';
import { AuthContext } from '../../../context/AuthContext';
import Loader from '../../../utils/Loader';
import axios from 'axios';
import { API_URL, GOOGLE_MAP_KEY } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MultiSelect from 'react-native-multiple-select';
import Entypo from 'react-native-vector-icons/Entypo';
import RNDateTimePicker from '@react-native-community/datetimepicker'
import moment from "moment"
import Toast from 'react-native-toast-message';
import { plus, userPhoto } from '../../../utils/Images';
import Svg, { Circle, Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const PersonalInformation = ({ navigation, route }) => {
  const concatNo = route?.params?.countrycode + '-' + route?.params?.phoneno;

  const [firstname, setFirstname] = useState('');
  const [firstNameError, setFirstNameError] = useState('')
  const [lastname, setLastname] = useState('');
  const [lastnameError, setLastnameError] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isPicUploadLoading, setIsPicUploadLoading] = useState(false);
  const [pickedDocument, setPickedDocument] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);

  const MIN_DATE = new Date(1930, 0, 1)
  const MAX_DATE = new Date()
  const [date, setDate] = useState('DD - MM  - YYYY')
  const [selectedDOB, setSelectedDOB] = useState(MAX_DATE)
  const [dobError, setdobError] = useState('');
  const [open, setOpen] = useState(false)


  // Qualification dropdown
  const [selectedItems, setSelectedItems] = useState([]);
  const multiSelectRef = useRef(null);
  const onSelectedItemsChange = selectedItems => {
    setSelectedItems(selectedItems);
  };

  // Type dropdown
  const [selectedItemsType, setSelectedItemsType] = useState([]);
  const multiSelectRefType = useRef(null);
  const onSelectedItemsChangeType = selectedItems => {
    setSelectedItemsType(selectedItems);
  };

  // Language dropdown
  const [selectedItemsLanguage, setSelectedItemsLanguage] = useState([]);
  const multiSelectRefLanguage = useRef(null);
  const onSelectedItemsChangeLanguage = selectedItems => {
    setSelectedItemsLanguage(selectedItems);
  };

  // experience dropdown
  const [yearvalue, setYearValue] = useState(null);
  const [isYearFocus, setYearIsFocus] = useState(false);


  const [monthvalue, setMonthValue] = useState(null);
  const [isMonthFocus, setMonthIsFocus] = useState(false);

  const pickDocument = async () => {
    try {
      setIsPicUploadLoading(true);
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        allowMultiSelection: false,
      });
      if (res && res.length > 0) {
        const pickedImage = res[0];
        setPickedDocument({
          uri: pickedImage.uri,
          type: pickedImage.type,
          name: pickedImage.name,
        });
      }
      setIsPicUploadLoading(false);
    } catch (err) {
      setIsPicUploadLoading(false);
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        console.error('Error picking image', err);
        handleAlert && handleAlert('Oops..', 'An error occurred while picking the image');
      }
    }
  };


  const changeFirstname = (text) => {
    if (text.length <= 30) {
      setFirstname(text)
      if (text) {
        setFirstNameError('')
      } else {
        setFirstNameError('Please enter First name.')
      }
    } else {
      setFirstNameError('First name must be 30 characters or less.')
    }
  }

  const changeLastname = (text) => {
    if (text.length <= 30) {
      setLastname(text)
      if (text) {
        setLastnameError('')
      } else {
        setLastnameError('Please enter Last name.')
      }
    } else {
      setLastnameError('Last name must be 30 characters or less.')
    }
  }

  const requestLocationPermission = async () => {
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
      } else {
        Alert.alert('Permission Denied', 'Location permission is required');
      }
    } else {
      const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (status === RESULTS.GRANTED) {
        getCurrentLocation();
      } else if (status === RESULTS.DENIED) {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (result === RESULTS.GRANTED) {
          getCurrentLocation();
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
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;  
        const placeName = await getAddressFromCoords(latitude, longitude);
        setLatitude(latitude);
        setLongitude(longitude);
        console.log('You are at:', placeName);
      },
      error => {
        console.log('Location Error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      const apiKey = GOOGLE_MAP_KEY; // Replace with your key
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      const json = await response.json();
      if (json.results.length > 0) {
        const place = json.results[0].formatted_address;
        console.log('Place name:', place);
        return place;
      } else {
        console.log('No results found');
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, [])



  const submitForm = () => {
    if (!firstname) {
      setFirstNameError('Please enter First name.');
    } else {
      setFirstNameError('');
    }

    if (!lastname) {
      setLastnameError('Please enter Last name.');
    } else {
      setLastnameError('');
    }

    if (firstname && lastname) {
      setIsLoading(true)
      const formData = new FormData();
      if (pickedDocument) {
        formData.append("profile_photo", {
          uri: pickedDocument.uri,
          type: pickedDocument.type || 'image/jpeg',
          name: pickedDocument.name || 'photo.jpg',
        });
      } else {
        formData.append("profile_photo", "");
      }
      formData.append("first_name", firstname);
      formData.append("last_name", lastname);
      formData.append("address", "kolkata");
      formData.append("lat", latitude);
      formData.append("long", longitude);
      console.log(route?.params?.token)
      console.log(`${API_URL}/customer/profile-update`);
      console.log(formData)

      axios.post(`${API_URL}/customer/profile-update`, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          "Authorization": 'Bearer ' + route?.params?.token,
        },
      })
        .then(res => {
          //console.log(res.data)
          if (res.data.response == true) {
            setIsLoading(false)
            Toast.show({
              type: 'success',
              text1: '',
              text2: "Profile data updated successfully.",
              position: 'top',
              topOffset: Platform.OS == 'ios' ? 55 : 20
            });
            login(route?.params?.token)
          } else {
            //console.log('not okk')
            setIsLoading(false)
            Alert.alert('Oops..', "Something went wrong.", [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
          }
        })
        .catch(e => {
          setIsLoading(false)
          console.log(`user update error ${e}`)
          console.log(e.response.data?.response.records)
          Alert.alert('Oops..', "Something went wrong", [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ]);
        });
    } else {
      // Optionally handle case where some fields are still invalid
    }
  }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  const handleAndroidChange = (event, selectedDate) => {
    if (event.type === 'set') { // User clicked OK
      const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
      setSelectedDOB(selectedDate);
      setDate(formattedDate);
      setdobError('')
    }
    setOpen(false); // Close the picker
  };

  const handleIOSChange = (event, selectedDate) => {
    if (selectedDate) {
      const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
      setSelectedDOB(selectedDate);
      setDate(formattedDate);
      setdobError('')
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 25, flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
          <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>Profile</Text>
        </View>
        <View style={styles.wrapper}>
          <View style={styles.mainView}>
            {/* SVG for Circular Ripple with Bottom Fade */}
            <Svg height="250" width="250" style={styles.svg}>
              <Defs>
                {/* Gradient Mask to Fade Bottom */}
                <LinearGradient id="fadeGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="white" stopOpacity="1" />
                  <Stop offset="80%" stopColor="white" stopOpacity="0.3" />
                  <Stop offset="100%" stopColor="white" stopOpacity="0" />
                </LinearGradient>

                {/* Masking the Circles */}
                <Mask id="circleMask">
                  <Rect x="0" y="0" width="250" height="160" fill="url(#fadeGradient)" />
                </Mask>
              </Defs>

              {/* Outer Circles with Mask */}
              <Circle cx="125" cy="125" r="60" stroke="#FF7788" strokeWidth="2" fill="none" mask="url(#circleMask)" />
              <Circle cx="125" cy="125" r="50" stroke="#FF99AA" strokeWidth="2" fill="none" mask="url(#circleMask)" />
            </Svg>
            <View style={styles.imageContainer}>
              {isPicUploadLoading ? (
                <ActivityIndicator size="small" color="#417AA4" style={styles.loader} />
              ) : (
                pickedDocument == null ? (
                  imageFile != null ? (
                    <Image source={{ uri: imageFile }} style={styles.imageStyle} />
                  ) : (
                    <Image source={userPhoto} style={styles.imageStyle} />
                  )
                ) : (
                  <Image source={{ uri: pickedDocument.uri }} style={styles.imageStyle} />
                )
              )}
            </View>
            <TouchableOpacity style={styles.plusIcon} onPress={pickDocument}>
              <Image source={plus} style={styles.iconStyle} />
            </TouchableOpacity>
          </View>
          <View style={styles.textinputview}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>First name</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{firstNameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'First name'}
                keyboardType=" "
                value={firstname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeFirstname(text)}
                maxLength={30}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Last name</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {lastnameError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{lastnameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Last name'}
                keyboardType=" "
                value={lastname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeLastname(text)}
                maxLength={30}
              />
            </View>

          </View>

        </View>


      </KeyboardAwareScrollView>
      <View style={styles.buttonwrapper}>

        <CustomButton label={"Submit"}
          //onPress={() => { login() }}
          onPress={() => { submitForm() }}
        />
      </View>
    </SafeAreaView >
  );
};

export default PersonalInformation;

const styles = StyleSheet.create({

  container: {
    //justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 23,
    //height: responsiveHeight(78)
    marginBottom: responsiveHeight(2)
  },
  header1: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(3),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  header: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  requiredheader: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(1.5),
    color: '#E1293B',
    marginBottom: responsiveHeight(1),
    marginLeft: responsiveWidth(1)
  },
  subheader: {
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '400',
    color: '#808080',
    marginBottom: responsiveHeight(1),
  },
  photoheader: {
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F'
  },
  imageView: {
    marginTop: responsiveHeight(2)
  },
  imageStyle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10
  },
  plusIcon: {
    position: 'absolute',
    bottom: 10,
    left: 50
  },
  textinputview: {
    marginBottom: responsiveHeight(15),
    marginTop: responsiveHeight(5)
  },
  inputView: {
    paddingVertical: 1
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    width: responsiveWidth(100),
  },
  searchInput: {
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    //borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5
  },
  dropdownMenu: {
    backgroundColor: '#FFF'
  },
  dropdownMenuSubsection: {
    borderBottomWidth: 0,

  },
  mainWrapper: {
    flex: 1,
    marginTop: responsiveHeight(1)

  },
  dropdownHalf: {
    height: responsiveHeight(7.2),
    width: responsiveWidth(89),
    borderColor: '#DDD',
    borderWidth: 0.7,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: responsiveHeight(4)
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
  dayname: {
    color: '#716E6E',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '500'
  },
  calenderInput: {
    height: responsiveHeight(7),
    width: responsiveWidth(88),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: responsiveHeight(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  termsView: {
    marginBottom: responsiveHeight(3),
    paddingHorizontal: 10,
    //alignSelf: 'flex-start',
  },
  termsText: {
    color: '#746868',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.5),
    //textAlign: 'center',
  },
  termsLinkText: {
    color: '#746868',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.5),
    textAlign: 'center',
    textDecorationLine: 'underline', // Optional: to make the link look more like a link
  },
  doneButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#EEF8FF',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(5)
  },
  doneText: {
    color: '#000',
    fontWeight: 'bold',
  },
  mainView: {
    alignSelf: 'center',
    marginTop: responsiveHeight(5),
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageContainer: {
    height: 90,
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  loader: {
    position: 'absolute',
  },
  iconStyle: { height: 25, width: 25, resizeMode: 'contain' },
  svg: {
    position: 'absolute',
    bottom: -responsiveHeight(8)
  },
});
