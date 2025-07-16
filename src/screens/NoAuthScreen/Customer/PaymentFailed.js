import React, { useState, useEffect,useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, StatusBar, BackHandler } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Thankyou from '../../../assets/images/misc/Thankyou.svg';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../../components/CustomButton';
import CustomHeader from '../../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import moment from 'moment-timezone';
import Icon from "react-native-vector-icons/Entypo";
import { failedImg } from '../../../utils/Images';
import { TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const PaymentFailed = ({ route }) => {
    const navigation = useNavigation();
    const [data, setData] = useState(JSON.stringify(route?.params?.message));
    const { order_id, amount } = route?.params;

    useEffect(() => {
        // const detailsData = JSON.parse(route?.params?.detailsData);
        // setData(detailsData);
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
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Unsuccessful Tour Booking'} onPress={() => navigation.goBack()} title={'Unsuccessful Tour Booking'} />
            {/* <View style={styles.thankYouImageWrapper}>
                <Image
                    source={require('../../assets/images/payment_fail_icon.png')}
                    style={styles.filterIcon}
                />
                
            </View>
            <View style={styles.thankYouTextWrapper}>
                <Text style={styles.thankYouText}>Payment Status Awaited</Text>
                <Text style={styles.appreciationText}>Payment Failed, please try again.</Text>
            </View>
            <CustomButton label={"Back to Home"}
                onPress={() => navigation.navigate('Home')}
            /> */}
            <View style={{ padding: 16, }}>
                <Text style={styles.unsuccessfullbookingText}>Sorry, your booking was unsuccessful because we did not receive the payment.</Text>
                <Text style={styles.unsuccessfullbookingText}>Booking ID is <Text style={styles.unsuccessfullbookingValue}>{order_id}</Text></Text>
            </View>

            <View style={styles.cardcontainer}>

                {/* Booking Failed Header */}
                <View style={styles.header}>
                    <Image
                        source={failedImg}
                        style={[styles.failedIcon, { marginRight: 5 }]}
                    />
                    <Text style={styles.headerText}>Booking Failed</Text>
                </View>
                <View
                    style={{
                        borderBottomColor: '#686868',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        marginVertical: 5
                    }}
                />
                {/* Booking Amount */}
                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Booking Amount</Text>
                    <Text style={styles.amountValue}>₹ {amount}</Text>
                </View>
                {/* <Text style={styles.amountSubText}>In oikaxs</Text> */}
                <View
                    style={{
                        borderBottomColor: '#686868',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        marginVertical: 5
                    }}
                />
                {/* Timeline */}
                <View style={styles.timeline}>
                    {/* Step 1: Booking Failed */}
                    <View style={styles.timelineItem}>
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircleRed}>
                                <Text style={styles.stepNumber}>1</Text>
                            </View>
                            <View style={styles.verticalLine} />
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Booking Failed</Text>
                            <Text style={styles.stepTime}>{moment().format('DD MMM, hh:mm A')}</Text>
                        </View>
                    </View>

                    {/* Step 2: Checking Payment Status */}
                    <View style={styles.timelineItem}>
                        <View style={styles.iconCircleGray}>
                            <Text style={styles.stepNumber}>2</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Checking Payment Status</Text>
                            <Text style={styles.stepTime}>Expected in 2-3 days</Text>

                            {/* Message Box */}
                            <View style={styles.messageBox}>
                                <Text style={styles.messageText}>
                                    We are checking the payment status with your bank. A refund will
                                    be initiated in 2-3 days if the amount has already been
                                    deducted. Rest assured, your money is safe.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.retrycontainer}>
                <Text style={styles.questionText}>
                    Tell us, if the booking amount was deducted?
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.retryText}>retry payment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.noButton} onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.noText}>No</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default PaymentFailed;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        //padding: 20,

    },
    thankYouImageWrapper: {
        flex: 0.4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thankYouTextWrapper: {
        paddingHorizontal: 20,
        marginBottom: responsiveHeight(2),
        marginTop: responsiveHeight(2),
    },
    thankYouText: {
        color: '#444343',
        alignSelf: 'center',
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2.5),
        textAlign: 'center',
        marginBottom: 10,
    },
    appreciationText: {
        color: '#746868',
        alignSelf: 'center',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(2),
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        height: responsiveHeight(7),
        backgroundColor: '#DEDEDE',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        alignItems: 'center',
    },
    headerText: {
        color: '#7D7D7D',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        textAlign: 'center',
        marginLeft: responsiveWidth(2),
    },
    filterIcon: {
        height: 80,
        width: 80,
        resizeMode: 'contain'
    },
    cardcontainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        margin: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },

    amountContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: responsiveHeight(3)
    },
    amountLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    amountValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FF455C",
    },
    amountSubText: {
        fontSize: 14,
        color: "#777",
        marginBottom: 16,
    },
    timeline: {
        marginTop: 10,
    },
    timelineItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    iconCircleRed: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#FF455C",
        justifyContent: "center",
        alignItems: "center",
    },
    iconCircleGray: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
    },
    stepNumber: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    stepContent: {
        marginLeft: 12,
        flex: 1,
    },
    stepTitle: {
        color: '#1B2234',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.7),
    },
    stepTime: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),
        marginBottom: 8,
    },
    messageBox: {
        backgroundColor: "#FFFAE6",
        padding: 10,
        borderRadius: 8,
    },
    messageText: {
        color: '#9B6E00',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    unsuccessfullbookingText: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),
    },
    unsuccessfullbookingValue: {
        color: '#686868',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    failedIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    iconContainer: {
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    verticalLine: {
        position: "absolute",
        top: responsiveHeight(3.5),  // Position below the first circle
        left: "50%",
        width: 2,
        height: 40, // Adjust this to control spacing
        backgroundColor: "#FF455C",
    },
    retrycontainer: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        alignItems: "center",
        margin: 16,
    },
    questionText: {
        color: '#1B2234',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        marginBottom: 12,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    retryButton: {
        flex: 1,
        backgroundColor: "#e53935",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginRight: 8,
    },
    retryText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    noButton: {
        flex: 1,
        borderWidth: 2,
        borderColor: "#28a745",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    noText: {
        color: '#00B900',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
});