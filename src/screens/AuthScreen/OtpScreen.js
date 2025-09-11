import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    StatusBar,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
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
import { useNavigation } from '@react-navigation/native';
// import OTPVerify from 'react-native-otp-verify';

const OtpScreen = ({ route }) => {
    const navigation = useNavigation();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [comingOTP, setComingOTP] = useState(route?.params?.otp)
    const [errors, setError] = useState(true)
    const [errorText, setErrorText] = useState('Please enter OTP.')
    const [isLoading, setIsLoading] = useState(false)
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];

    const { login, userToken } = useContext(AuthContext);

    const [timer, setTimer] = useState(60 * 1);
    
    // Auto-focus first input when component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRefs[0].current) {
                inputRefs[0].current.focus();
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, []);
    
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

    const onChangeCode = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        setError(false);
        
        // Auto-focus next input if current input is filled
        if (text && index < 3) {
            inputRefs[index + 1].current.focus();
        }
        
        // Check if all inputs are filled
        if (newOtp.every(digit => digit !== '')) {
            const otpString = newOtp.join('');
            goToNextPage(otpString);
        }
    }

    const goToNextPage = (code) => {
        setIsLoading(true)
        //console.log(comingOTP,'comingOTPcomingOTP');
        
        if (code == comingOTP) {
            const option = {
                "country_code": route?.params?.countrycode, 
                "mobile": route?.params?.phone,
                "fcm": route?.params?.fcmToken,
                //"deviceid": deviceId,
            }
            //console.log(option);

            axios.post(`${API_URL}/customer/login`, option, {
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
                        //     type: 'success',
                        //     text1: 'Hello',
                        //     text2: "OTP is matched successfully.",
                        //     position: 'top',
                        //     topOffset: Platform.OS == 'ios' ? 55 : 20
                        // });
                        if (res.data?.data?.first_name) {
                            login(res.data?.token)
                        } else {
                            navigation.navigate('PersonalInformation', { token: res.data?.token })
                        }
                    } else {
                        console.log('not okk')
                        setIsLoading(false)
                        Alert.alert('Oops..', "Something went wrong.", [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    }
                })
                .catch(e => {
                    setIsLoading(false)
                    console.log(`user login error ${e}`)
                    console.log(e.response)
                    Alert.alert('Oops..', e.response?.data?.message, [
                        {
                            text: 'Cancel',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel',
                        },
                        { text: 'OK', onPress: () => navigation.goBack() },
                    ]);
                });

        } else {
            console.log('not correct')
            setIsLoading(false)

            Alert.alert('Oops..', "The OTP does not match. Please enter the correct OTP.", [
                { text: 'OK', onPress: () => {
                    setOtp(['', '', '', '']);
                    // Reset focus to first input field
                    if (inputRefs[0].current) {
                        inputRefs[0].current.focus();
                    }
                }},
            ]);

        }
    }

    const resendOtp = () => {
        setIsLoading(true)
        const option = {
            "country_code": route?.params?.countrycode,
            "mobile": route?.params?.phone,
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
                    Toast.show({
                        type: 'success',
                        text1: '',
                        text2: "OTP sent to your mobile no.",
                        position: 'top',
                        topOffset: Platform.OS == 'ios' ? 55 : 20
                    });
                    //alert(res.data?.otp)
                    setComingOTP(res.data?.otp)
                    setTimer(60 * 1)
                    setIsResendDisabled(true);
                    setOtp(['', '', '', ''])
                    // Reset focus to first input field
                    if (inputRefs[0].current) {
                        inputRefs[0].current.focus();
                    }
                } else {
                    console.log('not okk')
                    setIsLoading(false)
                    Alert.alert('Oops..', "Something went wrong.", [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                }
            })
            .catch(e => {
                setIsLoading(false)
                console.log(`resend otp error ${e}`)
                console.log(e.response)
                Alert.alert('Oops..', e.response?.data?.message, [
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
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            
            <View style={{ paddingHorizontal: 20, paddingVertical: 10, marginTop: responsiveHeight(5) }}>
                <MaterialIcons name="arrow-back-ios-new" size={25} color="#000" onPress={() => navigation.goBack()} />
            </View>
            
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                <Text
                    style={styles.header}>
                    Verification code
                </Text>
                <Text
                    style={styles.subheader}>
                    We have sent a code to {route?.params?.countrycode} {route?.params?.phone}
                </Text>
                {/* <Text
                    style={styles.subheader}>
                    or admin can share OTP over the call
                </Text> */}

                <View style={styles.textinputview}>
                    <View style={styles.otpContainer}>
                        {[0, 1, 2, 3].map((index) => (
                            <TextInput
                                key={index}
                                ref={inputRefs[index]}
                                style={[
                                    styles.otpInput, 
                                    otp[index] ? styles.otpInputFilled : null,
                                    errors && !otp[index] ? styles.otpInputError : null
                                ]}
                                value={otp[index]}
                                onChangeText={(text) => onChangeCode(text, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                textAlign="center"
                                onKeyPress={({ nativeEvent }) => {
                                    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                                        inputRefs[index - 1].current.focus();
                                    }
                                }}
                            />
                        ))}
                    </View>
                </View>
                {errors &&
                    <Text style={styles.errorText}>{errorText}</Text>
                }
                <View style={styles.bottomSection}>
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
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default OtpScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingTop: responsiveHeight(10),
        paddingBottom: 20,
    },
    wrapper: {
        paddingHorizontal: 25,
        marginTop: 0
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
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginTop: responsiveHeight(3),
    },
    otpInput: {
        width: responsiveWidth(16),
        height: responsiveHeight(8),
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: responsiveFontSize(3),
        fontFamily: 'Poppins-Medium',
        color: '#2F2F2F',
        backgroundColor: '#F8F8F8',
    },
    otpInputFilled: {
        borderColor: '#2F2F2F',
        backgroundColor: '#FFFFFF',
    },
    otpInputError: {
        borderColor: '#FF0000',
        borderWidth: 2,
    },
    errorText: {
        fontSize: responsiveFontSize(1.8),
        color: '#FF0000',
        marginBottom: responsiveHeight(2),
        marginTop: responsiveHeight(1.5),
        alignSelf: 'center',
        fontFamily: 'Poppins-Medium'
    },
    bottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: responsiveHeight(3),
        paddingHorizontal: 5,
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



