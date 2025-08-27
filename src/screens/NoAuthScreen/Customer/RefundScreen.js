import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Thankyou from '../../../assets/images/misc/Thankyou.svg';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../../components/CustomButton';
import CustomHeader from '../../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import moment from 'moment-timezone';
import Icon from "react-native-vector-icons/Entypo";
import { arrowRightImg, cancelSuccessImg, failedImg } from '../../../utils/Images';
import { TouchableOpacity } from 'react-native';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Loader from '../../../utils/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Modal from "react-native-modal";
import axios from 'axios';
import { API_URL } from '@env'

const RefundScreen = ({ route }) => {
    const navigation = useNavigation();
    const [data, setData] = useState(route?.params?.data);
    const [bookingData, setBookingData] = useState(route?.params?.bookingData);
    const [appendView, setAppendView] = useState(false)
    const [appendView2, setAppendView2] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isFilterModalVisible3, setFilterModalVisible3] = useState(false);


    useEffect(() => {
        // const detailsData = JSON.parse(route?.params?.detailsData);
        // setData(detailsData);
    }, []);

    const toggleView = () => {
        setAppendView(!appendView)
    }
    const toggleView2 = () => {
        setAppendView2(!appendView2)
    }
    const toggleFilterModal3 = () => {
        console.log('hjffhjghjghjkghj')
        setFilterModalVisible3(!isFilterModalVisible3);
    };
    const submitCancellation = async () => {
        //navigation.navigate('RefundScreen')
        setIsLoading(true);
        try {
            console.log(bookingData.id, 'bookingData.id')
            console.log(data.refund_percentage, 'data.refund_condition')
            console.log(data.refund_amount, 'data.refund_amount')
            const refund_condition = data.refund_percentage;
            const refund_amount = data.refund_amount;
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.post(
                `${API_URL}/customer/refund`,
                {
                    booking_id: bookingData.id,
                    refund_condition: refund_condition,
                    refund_amount: refund_amount
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log("cancelation response:", response.data);

            if (response.data.response == true) {
                toggleFilterModal3()
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message || 'Failed to fetch cancelation'
                });
            }
        } catch (error) {
            console.error('Error fetching cancelation:', error);
            console.error('Error response:', error.response?.data);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to fetch cancelation'
            });
        } finally {
            setIsLoading(false);
        }
    }

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
    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Booking is Cancelled'} onPress={() => navigation.goBack()} title={'Booking is Cancelled'} />
            <ScrollView>
                <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 0, paddingHorizontal: 15, marginBottom: 5, justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        source={cancelSuccessImg}
                        style={styles.cancelTourIcon}
                    />
                    <Text style={styles.cancelText}>Your tour cancellation was successful</Text>
                    <Text style={styles.cancelText2}>Your tour cancellation is approved and successful.</Text>
                </View>
                {/* <View style={{ padding: 16, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.unsuccessfullbookingText}>Refund of ₹{data?.refund_amount} processed</Text>
                    <Text style={styles.unsuccessfullbookingValue}>You cancelled all traveler(s)</Text>
                </View> */}

                <View style={styles.cardcontainer}>
                    {/* Booking Amount */}
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Refundable Amount</Text>
                        <Text style={styles.amountValue}>₹{data?.refund_amount.toFixed(2)}</Text>
                    </View>
                    <View
                        style={{
                            borderBottomColor: '#E0E0E0',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            marginVertical: 5
                        }}
                    />
                    {/* Timeline */}
                    <View style={styles.timeline}>
                        {/* Step 1: Booking Failed */}
                        <View style={styles.timelineItem}>
                            <View style={styles.iconContainer}>
                                <View style={[styles.iconCircleRed, { backgroundColor: "#FF455C", }]}>
                                    <Text style={styles.stepNumber}>✔</Text>
                                </View>
                                <View style={styles.verticalLine} />
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Booking cancelled</Text>
                                <Text style={styles.stepTime}>{moment().format('DD-MM-YYYY hh:mm A')}</Text>
                            </View>
                        </View>
                        {/* Step 2: Checking Payment Status */}
                        <View style={styles.timelineItem}>
                            <View style={styles.iconContainer}>
                                <View style={[styles.iconCircleRed, { backgroundColor: "#FF455C", }]}>
                                    <Text style={styles.stepNumber}>✔</Text>
                                </View>
                                <View style={styles.verticalLine} />
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Refund Processed : ₹{data?.refund_amount.toFixed(2)}</Text>
                                <Text style={styles.stepTime}>{moment().format('DD-MM-YYYY hh:mm A')}</Text>
                            </View>
                        </View>
                        {/* Step 3: Checking Payment Status */}
                        <View style={styles.timelineItem}>
                            <View style={styles.iconContainer}>
                                <View style={[styles.iconCircleRed, { backgroundColor: "#A6A7AC", }]}>
                                    <Text style={styles.stepNumber}>✔</Text>
                                </View>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Refund credited in account</Text>
                                <Text style={styles.stepTime}>Expected in 2-7 days</Text>
                                {/* Message Box */}
                                <View style={styles.messageBox}>
                                    <Text style={styles.messageText}>
                                        Refund of ₹{data?.refund_amount.toFixed(2)} has been processed to your bank account.
                                        It takes 2-7 working days for refund to reflect in bank account.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                    <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                        <CustomButton label={"Proceed to Home"}
                            //onPress={() => navigation.navigate('Home')}
                            onPress={() =>
                                navigation.navigate('HOME', {
                                  screen: 'Home',
                                })
                              }
                        />
                    </View>
                </View>
            </ScrollView>

        </SafeAreaView>
    );
};

export default RefundScreen;

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
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
    },
    unsuccessfullbookingValue: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
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
    arrowIcon: {
        height: 25,
        width: 25,
        resizeMode: 'contain',
    },
    menuText: {
        flex: 1,
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Regular',
        color: '#333',
    },
    cancelTourIcon: {
        height: 110,
        width: 110,
        resizeMode: 'contain',
        marginTop: responsiveHeight(2)
    },
    cancelText: {
        fontSize: responsiveFontSize(1.9),
        color: '#1B2234',
        fontFamily: 'Poppins-SemiBold',
        marginTop: responsiveHeight(2)
    },
    cancelText2: {
        fontSize: responsiveFontSize(1.7),
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        //marginTop: responsiveHeight(5)
    },

});