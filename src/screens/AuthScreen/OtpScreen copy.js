import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_URL } from '@env'
import axios from 'axios';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import { AuthContext } from '../../context/AuthContext';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Loader from '../../utils/Loader';
import Toast from 'react-native-toast-message';
// import OTPVerify from 'react-native-otp-verify';

const OtpScreen = ({ navigation, route }) => {
    const [otp, setOtp] = useState('');
    const [comingOTP, setComingOTP] = useState(route?.params?.otp)
    const [errors, setError] = useState(true)
    const [errorText, setErrorText] = useState('Please enter OTP')
    const [isLoading, setIsLoading] = useState(false)
    const [isResendDisabled, setIsResendDisabled] = useState(true);

    const { login, userToken } = useContext(AuthContext);

    const inputRef = useRef();
    const [timer, setTimer] = useState(60 * 1);
    useEffect(() => {
        // If timer is 0, return early
        if (timer === 0) {
            setIsResendDisabled(false);
            return;
        }

        // Create an interval that decrements the timer value every second
        const interval = setInterval(() => {
            setTimer((timer) => timer - 1);
        }, 1000);

        // Clear the interval if the component is unmounted or timer reaches 0
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        // Format the time to ensure it always shows two digits for minutes and seconds
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // useEffect(() => {
    //     // Start listening for OTP messages
    //     OTPVerify.getOtp()
    //       .then(promise => {
    //         // Start listening for OTP
    //         OTPVerify.addListener(message => {
    //         const otp = /(\d{4})/g.exec(message)[1];
    //           console.log('OTP received:', otp);
    //           setOtp(otp);
    //         });
    
    //         // Stop listening when component unmounts
    //         return () => OTPVerify.removeListener();
    //       })
    //       .catch(error => console.error('Error setting up OTP listener:', error));
    //   }, []);

    const onChangeCode = (code) => {
        setOtp(code)
        setError(false)

    }

    const goToNextPage = (code) => {
        setIsLoading(true)
        //console.log(`Code is ${code}, you are good to go!`)
        //navigation.navigate('PersonalInformation', { phoneno: 2454545435, usertoken: 'sdfwr32432423424' })
        // const option = {
        //     "phone": route?.params?.phoneno,
        //     "otp": code,
        //     "code": route?.params?.counterycode,
        //     "userId": route?.params?.userid,
        // }
        if (code == comingOTP) {
            setIsLoading(false)
            Toast.show({
                type: 'success',
                text1: 'Hello',
                text2: "The OTP has been successfully matched.",
                position: 'top',
                topOffset: Platform.OS == 'ios' ? 55 : 20
            });
            if(route?.params?.name){
                login(route?.params?.token)
            }else{
                navigation.navigate('PersonalInformation', { token: route?.params?.token })
            }
            
        } else {
            console.log('not correct')
            setIsLoading(false)
            Alert.alert('Oops..', "The OTP does not match. Please enter the correct OTP.", [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
            setOtp('')
        }
    }

    const resendOtp = () => {
        setIsLoading(true)
        const option = {
            "mobile": route?.params?.phone,
        }
        axios.post(`${API_URL}/patient/login`, option, {
            headers: {
                'Accept': 'application/json',
                //'Content-Type': 'multipart/form-data',
            },
        })
            .then(res => {
                console.log(res.data)
                if (res.data.response == true) {
                    setIsLoading(false)
                    Toast.show({
                        type: 'success',
                        text1: 'Hello',
                        text2: "OTP sent to your mobile no",
                        position: 'top',
                        topOffset: Platform.OS == 'ios' ? 55 : 20
                    });
                    setComingOTP(res.data.otp)
                    setTimer(60 * 1)
                    setIsResendDisabled(true);
                    setOtp('')
                } else {
                    console.log('not okk')
                    setIsLoading(false)
                    Alert.alert('Oops..', "Something went wrong", [
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
                console.log(`resend otp error ${e}`)
                console.log(e.response)
                Alert.alert('Oops..', e.response?.data?.message, [
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ]);
            });
    }

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ paddingHorizontal: 20, paddingVertical: 10, marginTop: responsiveHeight(5) }}>
                <MaterialIcons name="arrow-back-ios-new" size={25} color="#000" onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.wrapper}>
                <Text
                    style={styles.header}>
                    Verify your number
                </Text>
                <Text
                    style={styles.subheader}>
                    A 4 digit OTP has been sent to your phone number
                </Text>
                <Text
                    style={styles.subheadernum}>
                   {route?.params?.countrycode} {route?.params?.phone}
                </Text>
                {/* <Text
                    style={styles.subheader}>
                    or admin can share OTP over the call
                </Text> */}

                <View style={styles.textinputview}>
                    <OTPInputView
                        ref={inputRef}
                        style={styles.otpTextView}
                        pinCount={4}
                        code={otp} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                        onCodeChanged={code => { onChangeCode(code) }}
                        autoFocusOnLoad={false}
                        codeInputFieldStyle={styles.underlineStyleBase}
                        codeInputHighlightStyle={styles.underlineStyleHighLighted}
                        onCodeFilled={(code) => goToNextPage(code)}
                        keyboardType={'numeric'}
                        keyboardAppearance={'default'}
                    />
                </View>
                {errors &&
                    <Text style={styles.errorText}>{errorText}</Text>
                }
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.otpText}>Didn’t receive OTP?</Text>
                    <Text style={styles.timerText}>{formatTime(timer)}</Text>
                    <TouchableOpacity onPress={() => resendOtp()} disabled={isResendDisabled}>
                        <Text style={[styles.resendText, isResendDisabled && { color: '#808080' }]}>Resend OTP</Text>
                    </TouchableOpacity>
                    
                </View>

            </View>
            {/* <View style={styles.buttonwrapper}>
                <CustomButton label={"Verify OTP "}
                    onPress={() => navigation.navigate('PersonalInformation')}
                />
            </View> */}
        </SafeAreaView>
    );
};

export default OtpScreen;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        height: responsiveHeight(100)
    },
    wrapper: {
        paddingHorizontal: 25,
        height: responsiveHeight(80),
        marginTop: responsiveHeight(5)
    },
    header: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(3),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(3),
    },
    subheader: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '400',
        color: '#808080',
        marginBottom: responsiveHeight(0),
    },
    subheadernum: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '400',
        color: '#2F2F2F',
        marginBottom: responsiveHeight(0),
        lineHeight: 40
    },
    textinputview: {
        marginBottom: responsiveHeight(0),
    },
    buttonwrapper: {
        paddingHorizontal: 25,
        bottom: 15
    },
    otpTextView: {
        width: '100%',
        height: 180,
        borderRadius: 10,
    },
    underlineStyleBase: {
        width: responsiveWidth(15),
        height: responsiveHeight(8),
        borderRadius: 8,
        color: '#2F2F2F',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2)
    },

    underlineStyleHighLighted: {
        borderColor: "#2F2F2F",
        borderRadius: 8
    },
    errorText: {
        fontSize: responsiveFontSize(1.5),
        color: 'red',
        marginBottom: 20,
        marginTop: -25,
        alignSelf: 'center',
        fontFamily: 'Poppins-Medium'
    },
    timerText: {
        color: '#808080',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7)
    },
    otpText: {
        color: '#808080',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7)
    },
    resendText: {
        color: '#2D2D2D',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.7)
    }
});



