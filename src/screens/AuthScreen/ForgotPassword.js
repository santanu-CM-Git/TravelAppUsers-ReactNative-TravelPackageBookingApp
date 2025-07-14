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
    StatusBar
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
import ForgotPass from '../..//assets/images/misc/forgotPass.svg';

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

const ForgotPassword = ({ navigation }) => {
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [deviceId, setDeviceId] = useState('')
    const [mobileError, setMobileError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState('+233');

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
    //     DeviceInfo.getUniqueId().then((deviceUniqueId) => {
    //         console.log(deviceUniqueId)
    //         setDeviceId(deviceUniqueId)
    //     });
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

    const onChangeEmail = (text) => {
        setEmail(text)
    }

    const handleSubmit = () => {
        login()
        // const phoneRegex = /^\d{10}$/;
        // if (!phone) {
        //   setMobileError('Please enter Mobile no')
        // } else if (!phoneRegex.test(phone)) {
        //   setMobileError('Please enter a 10-digit number.')
        // } else {
        //   setIsLoading(true)
        //   AsyncStorage.getItem('fcmToken', (err, fcmToken) => {
        //     const option = {
        //       "code": countryCode,
        //       "phone": phone,
        //       "deviceid": deviceId,
        //       "email": email,
        //       "deviceToken": fcmToken
        //     }

        //     console.log(option)
        //     axios.post(`${API_URL}/api/driver/registration`, option)
        //       .then(res => {
        //         console.log(JSON.stringify(res.data))
        //         if (res.data.response.status.code === 200) {
        //           setIsLoading(false)
        //           navigation.push('Otp', { counterycode: countryCode, phoneno: phone, userid: res.data?.response.records.userData.id })
        //         } else {
        //           setIsLoading(false)
        //           Alert.alert('Oops..', "Something went wrong", [
        //             {
        //               text: 'Cancel',
        //               onPress: () => console.log('Cancel Pressed'),
        //               style: 'cancel',
        //             },
        //             { text: 'OK', onPress: () => console.log('OK Pressed') },
        //           ]);
        //         }
        //       })
        //       .catch(e => {
        //         setIsLoading(false)
        //         console.log(`user register error ${e}`)
        //         Alert.alert('Oops..', e.response.data?.response.records.message, [
        //           {
        //             text: 'Cancel',
        //             onPress: () => console.log('Cancel Pressed'),
        //             style: 'cancel',
        //           },
        //           { text: 'OK', onPress: () => console.log('OK Pressed') },
        //         ]);
        //       });
        //   });
        // }
    }

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            <KeyboardAwareScrollView>
                <View style={{ paddingHorizontal: 20, paddingVertical: 25 }}>
                    <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
                </View>
                <View style={styles.wrapper}>
                    <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center',marginBottom: responsiveHeight(3) }}>
                        <ForgotPass
                            width={300}
                            height={200}
                        //style={{transform: [{rotate: '-15deg'}]}}
                        />
                    </View>
                    {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={styles.header}>
              Enter your mobile number
            </Text>
            <Text style={{ color: 'red', marginBottom: responsiveHeight(2), fontFamily: 'Poppins-SemiBold', }}> *(Required)</Text>
          </View> */}
                    {/* <View style={styles.textinputview}>
           
            <View style={styles.countryModal}>
              <TouchableOpacity
                onPress={() => setShow(true)}
                style={styles.countryInputView}
              >
                <Text style={{
                  color: '#808080',
                  fontSize: responsiveFontSize(2),
                }}>
                  {countryCode}
                </Text>
              </TouchableOpacity>
              <CountryPicker
                show={show}
                initialState={'+233'}
                pickerButtonOnPress={(item) => {
                  setCountryCode(item.dial_code);
                  setShow(false);
                }}
                style={{
                  modal: {
                    height: responsiveHeight(60),
                  },
                }}
              />
            </View>
            <InputField
              label={'Mobile Number'}
              keyboardType="numeric"
              value={phone}
              onChangeText={(text) => onChangeText(text)}
              helperText={mobileError}
            />
          </View> */}
                    <View style={{ marginBottom: responsiveHeight(1) }}>
                        <Text style={{ color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), marginBottom: responsiveHeight(1) }}>Forgot Password</Text>
                        <Text style={{ color: '#746868', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>Enter your email address so we can send you a link to your email address<Text style={{ color: '#444343', fontFamily: 'Poppins-Medium', fontSize: responsiveFontSize(1.5) }}> Create Account</Text></Text>
                    </View>
                    <Text
                        style={styles.header}>
                        Email Id or Mobile Number
                    </Text>
                    <View style={styles.textinputview}>
                        <InputField
                            label={'Email Id or Mobile Number'}
                            keyboardType="default"
                            inputType={'others'}
                            value={email}
                            onChangeText={(text) => onChangeEmail(text)}
                        //helperText={mobileError}
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>

            <View style={styles.buttonwrapper}>
                <CustomButton label={"Submit"}
                    //onPress={() => handleSubmit()}
                onPress={() => { navigation.push('Otp') }}
                />
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        flex: 1
    },
    wrapper: {
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        //height: responsiveHeight(50),
        paddingTop: responsiveHeight(5),
        //position:'absolute',
        bottom: 0
    },
    header: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(2),
    },
    subheader: {
        fontFamily: 'Outfit-Medium',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '400',
        color: '#808080',
        marginBottom: responsiveHeight(3),
    },
    textinputview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        //marginBottom: responsiveHeight(1)
    },
    buttonwrapper: {
        paddingHorizontal: 20,
    },
    countryInputView: {
        height: responsiveHeight(7),
        width: responsiveWidth(15),
        borderColor: '#808080',
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bannaerContainer: {
        width: responsiveWidth(100),
        height: responsiveHeight(40),
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
    textWrap: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    bannerText: {
        fontSize: responsiveFontSize(2),
        color: '#FFFFFF',
        fontWeight: '300',
        fontFamily: 'Outfit-Medium',
        position: 'relative',
        zIndex: 1,
        width: width * 0.8,
        marginBottom: 10,
        paddingLeft: 20,
    },

    bannerSubText: {
        fontSize: responsiveFontSize(3),
        color: '#FFFFFF',
        fontWeight: '700',
        fontFamily: 'Outfit-Medium',
        position: 'relative',
        zIndex: 1,
        width: width * 0.8,
        marginBottom: 30,
        paddingLeft: 20,
    },
});


export default ForgotPassword;
