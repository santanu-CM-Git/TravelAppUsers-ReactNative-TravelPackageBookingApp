import React, { useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
  StatusBar,
  Platform
} from 'react-native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_URL } from '@env'
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import { AuthContext } from '../../context/AuthContext';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
// import DeviceInfo from 'react-native-device-info';
import Loader from '../../utils/Loader';
import { CountryPicker } from "react-native-country-codes-picker";
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gtIconImg, orImg, patientLoginImg } from '../../utils/Images';
import Toast from 'react-native-toast-message';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

const LoginScreen = ({ }) => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [deviceId, setDeviceId] = useState('')
  const [mobileError, setMobileError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [toggleCheckBox, setToggleCheckBox] = useState(false)

  const { login, userToken } = useContext(AuthContext);

  const getFCMToken = async () => {
    try {
      // if (Platform.OS == 'android') {
      await messaging().registerDeviceForRemoteMessages();
      // }
      const token = await messaging().getToken();
      AsyncStorage.setItem('fcmToken', token)
      //console.log(token, 'fcm token');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    //getDeviceInfo()
    getFCMToken()
  }, [])

  // const getDeviceInfo = () => {
  //   DeviceInfo.getUniqueId().then((deviceUniqueId) => {
  //     console.log(deviceUniqueId)
  //     setDeviceId(deviceUniqueId)
  //   });
  // }

  const onChangeText = (text) => {
    const phoneRegex = /^\d{10}$/;
    setPhone(text)
    if (!phoneRegex.test(text)) {
      setMobileError('Please enter a 10-digit number.')
    } else {
      setMobileError('')
    }
  }

  const handleSubmit = () => {
    if (!toggleCheckBox) {
      Alert.alert('Required', 'Please accept the Terms & Conditions and Privacy Policy to continue.');
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phone) {
      setMobileError('Please enter mobile no.')
    } else if (!countryCode) {
      setMobileError('Please enter country code.')
    } else if (!phoneRegex.test(phone)) {
      setMobileError('Please enter a 10-digit number.')
    } else {
      setIsLoading(true)
      console.log(API_URL);

      AsyncStorage.getItem('fcmToken', (err, fcmToken) => {
        //console.log(fcmToken, 'firebase token')
        //console.log(deviceId, 'device id')
        const option = {
          "country_code": countryCode,
          "mobile": phone,
          //"firebase_token": fcmToken,
          //"deviceid": deviceId,
        }
        axios.post(`${API_URL}/otp-send`, option, {
          headers: {
            'Accept': 'application/json',
            //'Content-Type': 'multipart/form-data',
          },
        })
          .then(res => {
            console.log(res.data)
            if (res.data.response == true) {
              setIsLoading(false)
              // Toast.show({
              //   type: 'success',
              //   text1: 'Hello',
              //   text2: "OTP sent to your mobile no.",
              //   position: 'top',
              //   topOffset: Platform.OS == 'ios' ? 55 : 20
              // });
              //alert(res.data?.otp)
              // login(res.data.token)
              //navigation.navigate('Otp', { countrycode: countryCode, phone: phone, otp: res.data?.otp, token: res.data?.token, name: res.data?.data?.name })
              navigation.navigate('Otp', { countrycode: countryCode, phone: phone, otp: res.data?.otp, fcmToken: fcmToken })
            } else {
              //console.log('not okk')
              setIsLoading(false)
              Alert.alert('Oops..', res.data.message, [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
              ]);
            }
          })
          .catch(e => {
            setIsLoading(false)
            console.log(`user login error ${e}`)
            console.log(e.response)
            Alert.alert('Oops..', e.response?.data?.message, [
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
          });
      });
    }

  }

  const handleTruecaller = () => {

  }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} // or "light-content" depending on your image
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'android' ? responsiveHeight(3) : responsiveHeight(10)}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraHeight={Platform.OS === 'android' ? responsiveHeight(3) : 100}
      >
        <View style={styles.bannaerContainer}>
          <Image
            source={patientLoginImg}
            style={styles.bannerBg}
          />

          <Image
            source={gtIconImg}
            style={{ height: 60, width: 55, resizeMode: 'cover', position: 'absolute', top: 30, right: 20, borderRadius: 10 }}
          />
        </View>

        <View style={styles.wrapper}>
          <View style={{ marginBottom: responsiveHeight(2) }}>
            <Text style={styles.headerText}>Login or sign up</Text>
          </View>
          {mobileError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{mobileError}</Text> : <></>}
          <View style={styles.textinputview}>
            <View style={styles.countryModal}>
              <TouchableOpacity onPress={() => setShow(true)} style={styles.countryInputView}>
                <Text style={{ color: '#808080', fontSize: responsiveFontSize(2) }}>{countryCode}</Text>
              </TouchableOpacity>
              {Platform.OS === 'android' && (
                <CountryPicker
                  show={show}
                  initialState={''}
                  pickerButtonOnPress={(item) => {
                    setCountryCode(item.dial_code);
                    setShow(false);
                  }}
                  style={{
                    modal: {
                      height: responsiveHeight(60),
                    },
                    textInput: {
                      color: '#808080'
                    },
                    dialCode: {
                      color: '#808080'
                    },
                    countryName: {
                      color: '#808080'
                    }
                  }}
                />
              )}
            </View>
            <InputField
              label={'Mobile Number'}
              keyboardType="numeric"
              value={phone}
              inputType={'login'}
              onChangeText={(text) => onChangeText(text)}
              helperText={mobileError}
            />
          </View>

        </View>
        {Platform.OS === 'ios' && (
          <>
            <View style={styles.buttonwrapper}>
              <CustomButton label={"Send Verification Code"}
                onPress={() => handleSubmit()}
              //onPress={() => { navigation.navigate('Otp', { countrycode: +91, phone: '9098989898', otp: '123', fcmToken: 'fhrkwerh324234234' })}}
              />
            </View>
            <View style={styles.termsView}>
              <View style={styles.checkboxContainer}>
                <CheckBox
                  disabled={false}
                  value={toggleCheckBox}
                  onValueChange={(newValue) => setToggleCheckBox(newValue)}
                  tintColors={{ true: '#FF455C', false: '#444343' }}
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
              </View>
              <Text style={styles.termsText}>
                I accept{' '}
                <Text
                  style={styles.termsLinkText}
                  onPress={() => navigation.navigate('Termsofuse')}>
                  Terms & Condition
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.termsLinkText}
                  onPress={() => navigation.navigate('PrivacyPolicy')}>
                  Privacy Policy
                </Text>.
              </Text>
            </View>
          </>
        )}
      </KeyboardAwareScrollView>
      {Platform.OS === 'android' && (
        <>
        <View style={styles.buttonwrapper}>
          <CustomButton label={"Send Verification Code"}
            onPress={() => handleSubmit()}
          //onPress={() => { navigation.navigate('Otp', { countrycode: +91, phone: '9098989898', otp: '123', fcmToken: 'fhrkwerh324234234' })}}
          />
        </View>
        <View style={styles.termsView}>
          <View style={styles.checkboxContainer}>
            <CheckBox
              disabled={false}
              value={toggleCheckBox}
              onValueChange={(newValue) => setToggleCheckBox(newValue)}
              tintColors={{ true: '#FF455C', false: '#444343' }}
            />
          </View>
          <Text style={styles.termsText}>
            I accept{' '}
            <Text
              style={styles.termsLinkText}
              onPress={() => navigation.navigate('Termsofuse')}>
              Terms & Condition
            </Text>{' '}
            and{' '}
            <Text
              style={styles.termsLinkText}
              onPress={() => navigation.navigate('PrivacyPolicy')}>
              Privacy Policy
            </Text>.
          </Text>
        </View>
      </>
      )}




      {/* <Image
        source={orImg}
        style={styles.orImg}
      />
      <View style={[styles.buttonwrapper, { marginTop: 10 }]}>
        <CustomButton label={"Login With Truecaller"}
          onPress={() => handleTruecaller()}
          buttonColor='gray'
        //onPress={() => { navigation.push('Otp', { phoneno: phone }) }}
        />
      </View> */}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1,
    // Remove any fixed height constraints
  },
  wrapper: {
    paddingHorizontal: 20,
    marginTop: -responsiveHeight(2),
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    //height: responsiveHeight(50),
    paddingTop: responsiveHeight(5),
    //position:'absolute',
    bottom: 0
  },
  textinputview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //marginBottom: responsiveHeight(1)
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    marginTop: responsiveHeight(2), // Add top margin
  },
  countryModal: {

  },
  countryInputView: {
    height: responsiveHeight(6),
    width: responsiveWidth(15),
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    marginTop: -responsiveHeight(2)
  },
  bannaerContainer: {
    width: responsiveWidth(100),
    height: responsiveHeight(55),
    backgroundColor: '#fff',
  },
  bannerBg: {
    flex: 1,
    //position: 'absolute',
    //right: 0,
    // bottom: 20,
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  headerText: {
    color: '#2D2D2D',
    fontFamily: 'Poppins-Bold',
    fontSize: responsiveFontSize(2.5),
    marginBottom: responsiveHeight(1)
  },
  termsView: {
    marginBottom: responsiveHeight(5),
    paddingHorizontal: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  termsText: {
    color: '#746868',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.5),
    textAlign: 'center',
  },
  termsLinkText: {
    color: '#746868',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.5),
    textAlign: 'center',
    textDecorationLine: 'underline', // Optional: to make the link look more like a link
  },
  orImg: {
    height: responsiveHeight(4),
    width: responsiveWidth(25),
    resizeMode: 'contain',
    alignSelf: "center"
  },
  checkboxContainer: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    // Adjust the scale values to control the size
  },
});


export default LoginScreen;
