import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Thankyou from '../../../assets/images/misc/Thankyou.svg';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import moment from 'moment-timezone';
import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';
import CustomHeader from '../../../components/CustomHeader'
import Svg, { Circle } from 'react-native-svg';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const PaymentSuccessScreen = ({ route }) => {
    const navigation = useNavigation();
    const [data, setData] = useState(JSON.stringify(route?.params?.message));
    const confettiRef = useRef(null);
    const numCircles = 20; // Number of scallops
    const radius = 50; // Main circle radius
    const scallopRadius = 6; // Each small scallop circle radius
    const centerX = 60; // Center X
    const centerY = 60; // Center Y

    const [screenWidth, setScreenWidth] = useState(0);

    // Calculate positions for scalloped edges
    const scallops = Array.from({ length: numCircles }).map((_, i) => {
        const angle = (i * (360 / numCircles)) * (Math.PI / 180); // Convert to radians
        return {
            cx: centerX + radius * Math.cos(angle),
            cy: centerY + radius * Math.sin(angle),
        };
    });

    useEffect(() => {
        // const detailsData = JSON.parse(route?.params?.detailsData);
        // setData(detailsData);
        console.log(route?.params?.bookingDetails, 'jkgkgkgkjgjkgjkjkgjkgkjgk');
        
        setTimeout(() => {
            confettiRef.current?.start();
        }, 100);
    }, []);

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

    return (
        <SafeAreaView style={styles.container} onLayout={(event) => setScreenWidth(event.nativeEvent.layout.width)}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            {/* <CustomHeader commingFrom={'Payment Successful'} onPress={() => navigation.goBack()} title={'Payment Successful'} /> */}
            {/* Confetti Animation */}
            <ConfettiCannon
                count={100} // Number of confetti pieces
                origin={{ x: screenWidth / 2, y: responsiveHeight(100) }} // Confetti start position
                explosionSpeed={300} // Speed of confetti
                fadeOut
                ref={confettiRef}
            />
            <Animatable.View animation="bounceIn" duration={1500} style={styles.confettiContainer}>
                {/* Confetti Animation */}

                <Svg width="120" height="120" viewBox="0 0 120 120">
                    {/* Main Circle */}
                    <Circle cx={centerX} cy={centerY} r={radius} fill="#ffdbdf" />

                    {/* Scallop Circles */}
                    {scallops.map((pos, index) => (
                        <Circle key={index} cx={pos.cx} cy={pos.cy} r={scallopRadius} fill="#ffdbdf" />
                    ))}
                </Svg>
                {/* <View style={styles.badge}>
                    <View style={styles.innerCircle1}>
                        <View style={styles.innerCircle2}>
                            <Icon name="check" size={40} color="#fff" />
                        </View>
                    </View>
                </View> */}
                <View style={styles.badge}>
                    <View style={styles.innerCircle1}>
                        <View style={styles.innerCircle2}>
                            <Icon name="check" size={40} color="#fff" />
                        </View>
                    </View>
                </View>
            </Animatable.View>

            {/* Text Message */}
            <Text style={styles.title}>Thank You!</Text>
            <Text style={styles.subtitle}>Time to pack your luggage! Your package has been booked successfully.</Text>

            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: responsiveHeight(8), marginBottom: responsiveHeight(4) }}>
                <Text style={styles.amountPaidText}>Amount Paid</Text>
                <Text style={styles.amountPaidValue}>₹ {route?.params?.bookingDetails[0]?.final_amount}</Text>
            </View>
            {/* <Text style={styles.returnText}>You will be redirected to the home page shortly or click here to return to home page</Text> */}
            <View style={styles.buttonSection}>
                {/* <View style={styles.buttonwrapper}>
                    <CustomButton label={"Booking Details"}
                    //onPress={() => handleSubmit()}
                    />
                </View> */}
                <View style={styles.buttonwrapper}>
                    <CustomButton label={"Go to Booking Details"}
                        onPress={() => navigation.navigate('MyBookingDetails', { bookingId: route?.params?.bookingDetails[0]})}
                    />
                </View>
            </View>

        </SafeAreaView>
    );
};

export default PaymentSuccessScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    confettiContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: responsiveHeight(20)
    },
    badge: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ff8e9c',
    },
    innerCircle1: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#ff8e9c',
    },
    innerCircle2: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF455C',
    },
    title: {
        fontSize: responsiveFontSize(2.5),
        fontFamily: 'Poppins-Bold',
        color: '#000000',
        marginTop: 20,
    },
    subtitle: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Poppins-Regular',
        color: '#000000',
        marginTop: 5,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    buttonSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 0,
        width: responsiveWidth(90)
    },
    buttonwrapper: {
        paddingHorizontal: 0,
        width: responsiveWidth(90),
        marginTop: responsiveHeight(2)
    },
    amountPaidText: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Poppins-Medium',
        color: '#8C8C8C',
    },
    amountPaidValue: {
        fontSize: responsiveFontSize(2.5),
        fontFamily: 'Poppins-SemiBold',
        color: '#FF455C',
    },
    returnText: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Regular',
        color: '#545F71',
        textAlign: 'center'
    }
});