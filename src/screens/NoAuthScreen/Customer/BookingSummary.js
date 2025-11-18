import React, { useState, useMemo, useEffect, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, ActivityIndicator, useWindowDimensions, Switch, Alert, Platform, BackHandler } from 'react-native'
import CustomHeader from '../../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { logoIconImg, dateIcon, timeIcon, userPhoto, wallet, walletBlack, walletCredit } from '../../../utils/Images'
import { API_URL, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, BASE_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../../utils/Loader';
import moment from "moment"
import InputField from '../../../components/InputField';
import CustomButton from '../../../components/CustomButton';
import RazorpayCheckout from 'react-native-razorpay';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../../context/AuthContext';
import analytics from '@react-native-firebase/analytics';
import Icon from 'react-native-vector-icons/Feather';
import CheckBox from '@react-native-community/checkbox';
import { SafeAreaView } from 'react-native-safe-area-context';

const BookingSummary = ({ route }) => {
    const navigation = useNavigation();
    const { packageInfo, bookingDetails } = route.params;
    const { logout } = useContext(AuthContext);
    const [couponCode, setCouponCode] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);
    const [gstPercentage, setGstPercentage] = useState(0);
    const [bookingFees, setBookingFees] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isCouponLoading, setIsCouponLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [starCount, setStarCount] = useState(4);
    const [isEnabled, setIsEnabled] = useState(false);
    const [minTime, setMinTime] = useState(null);
    const [maxTime, setMaxTime] = useState(null);
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [couponDeduction, setCouponDeduction] = useState(0);
    const [couponId, setCouponId] = useState(null)
    const [walletDeduction, setWalletDeduction] = useState(0);
    const [toggleCheckBox, setToggleCheckBox] = useState(false)
    const [couponData, setCouponData] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [availableCoupons, setAvailableCoupons] = useState([]);

    const razorpayKeyId = RAZORPAY_KEY_ID;
    const razorpayKeySecret = RAZORPAY_KEY_SECRET;

    const convertTime = (time) => {
        return moment(time, 'HH:mm:ss').format('hh:mm A');
    };

    const findTimeBounds = (data) => {
        let minStartTime = data[0].slot_start_time;
        let maxEndTime = data[0].slot_end_time;

        data.forEach(slot => {
            if (slot.slot_start_time < minStartTime) {
                minStartTime = slot.slot_start_time;
            }
            if (slot.slot_end_time > maxEndTime) {
                maxEndTime = slot.slot_end_time;
            }
        });

        return { minStartTime, maxEndTime };
    };

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

    // Updated GST calculation logic based on client requirements
    const calculateTotalAmount = () => {
        const baseAmount = bookingDetails?.totalPrice || 0;

        // Step 1: Calculate coupon discount on base amount
        let couponDiscount = 0;
        if (appliedCoupon) {
            couponDiscount = (baseAmount * appliedCoupon.discount_unit) / 100;
        }

        // Step 2: Price after discount (PD)
        const priceAfterDiscount = baseAmount - couponDiscount;

        // Step 3: Calculate GST on package (18% of discounted price)
        const packageGST = (priceAfterDiscount * gstPercentage) / 100;

        // Step 4: Customer pays for package = Price after discount + GST on package
        const packageTotalForCustomer = priceAfterDiscount + packageGST;

        // Step 5: Calculate Platform Fee (booking fees % of discounted price)
        const platformFee = (priceAfterDiscount * bookingFees) / 100;

        // Step 6: Calculate GST on Platform Fee (18% of platform fee)
        const platformFeeGST = (platformFee * gstPercentage) / 100;

        // Step 7: Total amount customer pays
        //const finalAmount = packageTotalForCustomer + platformFee + platformFeeGST;
        const finalAmount = packageTotalForCustomer;

        // Step 8: Amount agency receives (Total - Platform Fee - Platform Fee GST)
        const agencyReceives = packageTotalForCustomer - platformFee - platformFeeGST;
        //const agencyReceives = finalAmount - platformFee - platformFeeGST;

        return {
            baseAmount,
            couponDiscount,
            priceAfterDiscount,
            packageGST,
            packageTotalForCustomer,
            platformFee,
            platformFeeGST,
            finalAmount,
            agencyReceives,
            // Legacy properties for backward compatibility
            taxAmount: packageGST + platformFeeGST, // Total GST
            bookingFeesAmount: platformFee + platformFeeGST // Platform fee + its GST
        };
    };

    const beforeHandlePayment = () => {
        setIsLoading(true)
        const calculation = calculateTotalAmount();
        console.log(calculation, 'calculationcalculationcalculation')
        // return
        const formData = new FormData();
        formData.append("agent_id", packageInfo?.agent_id);
        formData.append("sub_agent_id", packageInfo?.sub_agent_id ? packageInfo?.sub_agent_id : "");
        formData.append("booking_type", "App");
        formData.append("package_id", packageInfo?.id);
        formData.append("start_date", moment(bookingDetails?.fromDate).format('YYYY-MM-DD'));
        formData.append("end_date", moment(bookingDetails?.toDate).format('YYYY-MM-DD'));
        formData.append("adult", bookingDetails?.adults);
        formData.append("children", bookingDetails?.children);
        formData.append("amount", bookingDetails?.totalPrice);
        formData.append("coupon_code", appliedCoupon?.id ? appliedCoupon?.id : "");
        formData.append("coupon_discount", calculation.couponDiscount.toFixed(2));
        formData.append("tax", calculation.packageGST + calculation.platformFeeGST);
        formData.append("booking_fee", calculation.platformFee);
        formData.append("final_amount", calculation.finalAmount.toFixed(2));

        console.log(formData, 'formDataformDataformData')
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/customer/booking-check`, formData, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${usertoken}`,
                },
            })
                .then(res => {
                    console.log(res)
                    if (res.data.response == true) {
                        //setIsLoading(false)
                        handlePayment()
                    } else {
                        setIsLoading(false)
                        Alert.alert('Oops..', res?.data?.message || "Something went wrong", [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    }
                })
                .catch(e => {
                    setIsLoading(false)
                    console.log(`slot booking checking error ${e}`)
                    console.log(e)
                    Alert.alert('Oops..', e.response?.data?.message || "Something went wrong", [
                        { text: 'OK', onPress: () => e.response?.data?.message == 'Unauthorized' ? logout() : console.log('OK Pressed') },
                    ]);
                });
        });
    }

    const fetchProfileData = async () => {
        try {
            AsyncStorage.getItem('userToken', async (err, userToken) => {
                setIsLoading(true);
                const response = await axios.post(`${API_URL}/customer/profile-details`, {}, {
                    headers: {
                        "Authorization": `Bearer ${userToken}`,
                        "Content-Type": 'application/json'
                    },
                });

                const userData = response.data.data;
                setUserData(userData)
                setIsLoading(false);
            });
        } catch (error) {
            console.log('Error fetching profile:', error);
            setIsLoading(false);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch profile data',
                position: 'top',
                topOffset: Platform.OS == 'ios' ? 55 : 20
            });
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const formatPhoneForRazorpay = (countryCode, mobile) => {
        if (!countryCode || !mobile) return '';

        // Clean country code - remove '+' and non-numeric characters
        const cleanCountryCode = countryCode.replace(/\D/g, '');

        // Clean mobile number - remove all non-numeric characters
        const cleanMobile = mobile.replace(/\D/g, '');

        // If mobile already starts with country code, return mobile only
        if (cleanMobile.startsWith(cleanCountryCode)) {
            return cleanMobile;
        }

        // Combine country code and mobile
        return cleanCountryCode + cleanMobile;
    };

    const handlePayment = async () => {
        const calculation = calculateTotalAmount();
        const totalAmount = calculation.finalAmount.toFixed(2);
        console.log('asdgaskdgaksdgaks')
        console.log(totalAmount, 'totalAmounttotalAmounttotalAmount')
        console.log(packageInfo, 'packageInfopackageInfopackageInfo')
        console.log(bookingDetails, 'bookingDetailsbookingDetailsbookingDetails')
        console.log(userData, 'userDatauserDatauserData')
        console.log(userData?.mobile, 'mobile')

        try {
            // Step 1: Retrieve the user token from AsyncStorage
            AsyncStorage.getItem('userToken', async (err, userToken) => {
                console.log(userToken)
                if (err || !userToken) {
                    console.error('Error retrieving user token:', err);
                    navigation.navigate('PaymentFailed', { message: 'User authentication failed' });
                    return;
                }
                console.log((calculation.packageGST + calculation.platformFeeGST) * 100);
                console.log(calculation.platformFee * 100);
                console.log(packageInfo?.agent_id);
                console.log(totalAmount * 100);

                // Step 2: Create an order on the server
                const response = await axios.post(
                    `${API_URL}/customer/razorpay-order-create`,
                    {
                        "amount": totalAmount * 100, // Convert to smallest currency unit
                        "tax": (calculation.packageGST) * 100,
                        "booking_tax": (calculation.platformFeeGST) * 100,
                        "booking_charge": calculation.platformFee * 100,
                        "agent_id": packageInfo?.agent_id,
                        "currency": 'INR'
                    },
                    {
                        headers: {
                            Accept: 'application/json',
                            Authorization: `Bearer ${userToken}`, // Add token to headers
                        },
                    }
                );

                console.log(JSON.stringify(response.data.order.transfers[0].id), 'response from razorpay-order-create')

                const { id: order_id } = response.data.order; // Assuming the response includes { order_id: 'order_xyz' }

                console.log(order_id)
                if (order_id) {
                    setIsLoading(false)
                    // Step 3: Open Razorpay Checkout
                    const options = {
                        description: 'Group Tour',
                        image: `https://res.cloudinary.com/dzl5v6ndv/image/upload/v1749474430/gt_icon_JPG_1_1_b29bdc.png`,
                        currency: 'INR',
                        key: razorpayKeyId,
                        amount: totalAmount * 100, // Amount in smallest currency unit
                        name: bookingDetails?.description,
                        order_id: order_id, // Use the order ID from the server
                        prefill: {
                            contact: formatPhoneForRazorpay(userData?.country_code, userData?.mobile),
                            name: userData?.full_name,
                        },
                        theme: { color: '#FF455C' },
                    };

                    RazorpayCheckout.open(options)
                        .then((data) => {
                            // Payment successful
                            console.log("razorpay response data", data);
                            submitForm(data.razorpay_payment_id, order_id, data.razorpay_signature, response.data.order.transfers[0].id);
                        })
                        .catch((error) => {
                            // Payment failed
                            console.error('Payment failed:', error.description);
                            navigation.navigate('PaymentFailed', { message: error.description, order_id: order_id, amount: totalAmount });
                        });
                } else {
                    navigation.navigate('PaymentFailed', { message: 'Order creation failed' });
                }
            });
        } catch (error) {
            console.error('Error creating order:', error);
            navigation.navigate('PaymentFailed', { message: 'Failed to create order' });
        }
    };

    const submitForm = (transactionId, order_id, razorpay_signature, transfer_id) => {
        console.log(packageInfo, 'packageInfopackageInfopackageInfo')
        console.log(bookingDetails, 'bookingDetailsbookingDetailsbookingDetails')

        setIsLoading(true);
        const calculation = calculateTotalAmount();

        const formData = new FormData();
        formData.append("agent_id", packageInfo?.agent_id);
        formData.append("sub_agent_id", packageInfo?.sub_agent_id ? packageInfo?.sub_agent_id : "");
        formData.append("booking_type", "App");
        formData.append("package_id", packageInfo?.id);
        formData.append("start_date", moment(bookingDetails?.fromDate).format('YYYY-MM-DD'));
        formData.append("end_date", moment(bookingDetails?.toDate).format('YYYY-MM-DD'));
        formData.append("adult", bookingDetails?.adults);
        formData.append("children", bookingDetails?.children);
        formData.append("amount", bookingDetails?.totalPrice);
        formData.append("coupon_code", appliedCoupon?.id ? appliedCoupon?.id : "");
        formData.append("coupon_discount", calculation.couponDiscount.toFixed(2));
        formData.append("tax", calculation.packageGST);
        formData.append("booking_fee", calculation.platformFee);
        formData.append("booking_tax", calculation.platformFeeGST);
        formData.append("final_amount", calculation.finalAmount.toFixed(2));
        formData.append("agency_received", calculation.agencyReceives);
        formData.append("transaction_no", transactionId);
        formData.append("refund_condition", "");
        formData.append("refund_amount", "");
        formData.append("order_id", order_id);
        formData.append("signature", razorpay_signature);
        formData.append("trf_id", transfer_id);
        console.log(formData, 'formDataformDataformData')

        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/customer/booking`, formData, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${usertoken}`,
                },
            })
                .then(res => {
                    if (res.data.response) {
                        setIsLoading(false);
                        //alert("Booking Successfully")
                        console.log(res.data.data, 'sfsdfdsfsdfdsfdsfsdfsdf')
                        navigation.navigate('PaymentSuccessScreen', { bookingDetails: res.data.data })
                    } else {
                        setIsLoading(false);
                        Alert.alert('Oops..', res.data.message || "Something went wrong", [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    }
                })
                .catch(e => {
                    setIsLoading(false);
                    console.log(`booking submit from booking summary error ${e}`);
                    console.log(e.response);
                    Alert.alert('Oops..', e.response?.data?.message, [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                });
        });
    };

    const logPurchaseEventGoogle = async (amount, transactionId) => {
        try {
            await analytics().logEvent('purchase', {
                value: amount,
                currency: "INR", // e.g., 'USD'
                transaction_id: transactionId,
            });
            console.log('logPurchaseEventGoogle: Event logged successfully');
        } catch (error) {
            console.error('logPurchaseEventGoogle: Failed to log event', error);
        }
    };

    const changeCouponCode = (text) => {
        setCouponCode(text);
    };

    const fetchAvailableCoupons = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await axios.post(`${API_URL}/customer/coupon`, {}, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${userToken}`,
                },
            });
            let coupons = response.data.data;
            if (coupons && !Array.isArray(coupons)) {
                coupons = [coupons];
            }
            setAvailableCoupons(coupons);
        } catch (error) {
            console.error('Error fetching available coupons:', error);
        }
    };

    const callForCoupon = () => {
        if (!couponCode) {
            setCouponError('Please enter a coupon code');
            return;
        }
        console.log(availableCoupons, 'sdfdsf')

        if (!Array.isArray(availableCoupons)) {
            setCouponError('No available coupons');
            return;
        }
        const coupon = availableCoupons.find(c => c.coupon_code.toLowerCase() === couponCode.toLowerCase());

        if (!coupon) {
            setCouponError('Invalid coupon code');
            return;
        }

        // Check if coupon is valid
        if (coupon.status !== 'Active') {
            setCouponError('Coupon is not active');
            return;
        }

        // Check if coupon is within date range
        const currentDate = new Date();
        const startDate = new Date(coupon.sdate);
        const endDate = new Date(coupon.edate);

        if (currentDate < startDate || currentDate > endDate) {
            setCouponError('Coupon is not valid for current date');
            return;
        }

        // Check if coupon usage limit is reached
        if (coupon.applied <= coupon.available_for) {
            setCouponError('Coupon usage limit reached');
            return;
        }

        // Apply the coupon
        setAppliedCoupon(coupon);
        setCouponError('');
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    // Updated price summary render function
    const renderPriceSummary = () => {
        const calculation = calculateTotalAmount();

        return (
            <View style={styles.containerpricebreckdown}>
                {/* Base Package Details */}
                <View style={styles.row}>
                    <Text style={styles.label}>Adults ({bookingDetails?.adults})</Text>
                    <Text style={styles.value}>₹ {packageInfo?.discounted_price * bookingDetails?.adults}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Children ({bookingDetails?.children})</Text>
                    <Text style={styles.value}>₹ {packageInfo?.children_price * bookingDetails?.children}</Text>
                </View>

                <View style={styles.divider} />

                {/* Package Subtotal */}
                <View style={styles.row}>
                    <Text style={[styles.label, styles.bold]}>Package Subtotal</Text>
                    <Text style={[styles.value, styles.bold]}>₹ {calculation.baseAmount}</Text>
                </View>

                {/* Coupon Discount */}
                {calculation.couponDiscount > 0 && (
                    <>
                        <View style={styles.row}>
                            <Text style={styles.label}>Coupon Discount ({appliedCoupon?.discount_unit}%)</Text>
                            <Text style={styles.value}>- ₹ {calculation.couponDiscount.toFixed(2)}</Text>
                        </View>
                        <Text style={styles.subText}>Promo Code Applied "{appliedCoupon?.coupon_code}"</Text>
                    </>
                )}

                {/* Price After Discount */}
                <View style={styles.row}>
                    <Text style={[styles.label, styles.bold]}>Price After Discount</Text>
                    <Text style={[styles.value, styles.bold]}>₹ {calculation.priceAfterDiscount.toFixed(2)}</Text>
                </View>

                {/* GST on Package */}
                <View style={styles.row}>
                    <Text style={styles.label}>GST on Package ({gstPercentage}%)</Text>
                    <Text style={styles.value}>₹ {calculation.packageGST.toFixed(2)}</Text>
                </View>

                {/* Package Total */}
                <View style={styles.row}>
                    <Text style={[styles.label, styles.bold, styles.red]}>Package Total</Text>
                    <Text style={[styles.value, styles.bold, styles.red]}>₹ {calculation.packageTotalForCustomer.toFixed(2)}</Text>
                </View>

                {/* <View style={styles.divider} /> */}

                {/* Platform Fee */}
                {/* <View style={styles.row}>
                    <Text style={styles.label}>Platform Fee ({bookingFees}%)</Text>
                    <Text style={styles.value}>₹ {calculation.platformFee.toFixed(2)}</Text>
                </View> */}

                {/* GST on Platform Fee */}
                {/* <View style={styles.row}>
                    <Text style={styles.label}>GST on Platform Fee ({gstPercentage}%)</Text>
                    <Text style={styles.value}>₹ {calculation.platformFeeGST.toFixed(2)}</Text>
                </View> */}

                {/* <View style={styles.divider} /> */}

                {/* Grand Total */}
                {/* <View style={styles.row}>
                    <Text style={[styles.label, styles.bold, styles.red, styles.large]}>Grand Total</Text>
                    <Text style={[styles.value, styles.bold, styles.red, styles.large]}>₹ {calculation.finalAmount.toFixed(2)}</Text>
                </View> */}

                {/* Additional Info (Optional - for transparency)*/}
                {/* <Text style={[styles.subText, { marginTop: 10, fontStyle: 'italic' }]}>
                    Agency Receives: ₹ {calculation.agencyReceives.toFixed(2)}
                </Text>  */}
            </View>
        );
    };

    useEffect(() => {
        fetchSettings();
        fetchAvailableCoupons();
    }, []);

    const fetchSettings = async () => {
        try {
            //const userToken = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${API_URL}/setting`, {
                headers: {
                    Accept: 'application/json',
                    //Authorization: `Bearer ${userToken}`,
                },
            });

            if (response.data.response == true) {
                const settings = response.data.data[0];
                setGstPercentage(settings.tax);
                setBookingFees(settings.booking_fees);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const getCancellationTimeLabel = (condition) => {
        const days = parseInt(condition, 10);
        if (days === 0) return 'On the Day of Travel';
        if (days === 1) return '1 Day Before Travel';
        return `${days} Days Before Travel`;
    };

    useFocusEffect(
        useCallback(() => {

        }, [])
    );
    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
            <CustomHeader commingFrom={'Summary'} onPress={() => navigation.goBack()} title={'Summary'} />

            <ScrollView style={styles.wrapper}>
                <View style={styles.card}>
                    <Text style={styles.title}>{packageInfo?.name}</Text>
                    <Text style={styles.subtitle}>{packageInfo?.location}</Text>

                    <View style={styles.detailsRow}>
                        <Text style={styles.personText}>Person X {bookingDetails?.adults + bookingDetails?.children}</Text>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Text style={styles.price}>₹ {bookingDetails?.totalPrice}</Text>
                            <View style={styles.dateRow}>
                                <Icon name="calendar" size={14} color="#999" />
                                <Text style={styles.date}> {moment(bookingDetails?.fromDate).format('DD MMM YYYY')}</Text>
                            </View>
                        </View>
                    </View>

                    {/* <Text style={styles.cancellationText}>
                        Free Cancellation (48-Hours Notice)
                    </Text> */}
                </View>
                <View style={styles.card}>
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.couponText}>Enter promo code</Text>
                        <InputField
                            label={'Enter promo code'}
                            keyboardType="default"
                            value={couponCode}
                            inputType={'coupon'}
                            onChangeText={(text) => setCouponCode(text)}
                        />
                        {couponError ? (
                            <Text style={styles.errorText}>{couponError}</Text>
                        ) : null}
                    </View>
                    {!appliedCoupon ? (
                        <TouchableOpacity
                            style={styles.callCouponButton}
                            onPress={callForCoupon}
                            disabled={isCouponLoading}
                        >
                            {isCouponLoading ? (
                                <ActivityIndicator size="small" color="#417AA4" />
                            ) : (
                                <Text style={styles.callCouponText}>APPLY</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.couponAppliedContainer}>
                            <Text style={styles.couponAppliedText}>
                                Coupon Applied: {appliedCoupon.coupon_code} ({appliedCoupon.discount_unit}% off)
                            </Text>
                            <TouchableOpacity onPress={removeCoupon}>
                                <Text style={styles.removeCouponText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                <View style={{ marginHorizontal: 10, }}>
                    <Text style={styles.productText3}>Price Summary</Text>
                </View>

                {/* Use the new renderPriceSummary function */}
                {renderPriceSummary()}

                <View style={{ marginHorizontal: 10, }}>
                    <Text style={styles.productText3}>Cancellation Policy</Text>
                </View>
                <View style={[styles.cancelContainer, { marginBottom: responsiveHeight(5) }]}>
                    {/* Table Header */}
                    <View style={[styles.cancelRow, styles.cancelHeader]}>
                        <Text style={[styles.cancelText, styles.cancelBold]}>Time Of Cancellation</Text>
                        <Text style={[styles.cancelText, styles.cancelBold]}>Refund Percentage</Text>
                    </View>

                    {packageInfo?.refund.map((item, index) => {
                        const isNonRefundable = item.refund === "0";
                        return (
                            <View key={index} style={styles.cancelRow}>
                                <Text style={styles.cancelText}>{getCancellationTimeLabel(item.condition)}</Text>
                                <Text style={[styles.cancelText, isNonRefundable && styles.cancelGreyText]}>
                                    {isNonRefundable ? 'Non Refundable' : `${item.refund} %`}
                                </Text>
                            </View>
                        );
                    })}
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
                        I accept term and condition and privacy policy and cancellation policy.
                        <Text style={{fontFamily: 'Poppins-Medium',color: '#746868', fontSize: responsiveFontSize(1.5), textAlign: 'center', paddingHorizontal: 10, lineHeight: 18,}}>You are about to make a payment to {packageInfo?.agent?.name || 'the travel agency'}. Please ensure you have fully read the travel package details and the cancellation policy provided by the travel agency.</Text>
                       
                    </Text>
                </View>
            </ScrollView>
            {!packageInfo?.agent_bank_details ?
                <View style={styles.buttonwrapper}>
                    <Text style={styles.termsText}>Please contact the agent to complete the payment</Text>
                </View>
                :
                <View style={styles.buttonwrapper}>
                    <View style={styles.buttonwrapperSection1}>
                        <Text style={styles.buttonwrapperText2}>₹ {calculateTotalAmount().finalAmount.toFixed(2)}</Text>
                    </View>
                    <View style={{ marginTop: responsiveHeight(1) }}>

                        <CustomButton
                            label={isLoading ? "Processing..." : "Pay Now"}
                            onPress={beforeHandlePayment}
                            disabled={isLoading || !packageInfo?.agent_bank_details || !toggleCheckBox}
                            style={(!packageInfo?.agent_bank_details || isLoading || !toggleCheckBox) ? styles.disabledButton : null}
                        />
                    </View>
                </View>
            }
        </SafeAreaView>
    )
}

export default BookingSummary

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: responsiveWidth(2),
        marginBottom: responsiveHeight(10)
    },
    buttonwrapper: {
        paddingHorizontal: 25,
        bottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopColor: '#E3E3E3',
        borderTopWidth: 1,
        paddingTop: 5,
        position: 'absolute',
        width: responsiveWidth(100),
        backgroundColor: '#fff'
    },
    buttonwrapperSection1: { flexDirection: 'column', },
    buttonwrapperText1: { color: '#746868', fontSize: responsiveFontSize(1.7), fontFamily: 'Poppins-Medium', },
    buttonwrapperText2: { color: '#444343', fontSize: responsiveFontSize(2.5), fontFamily: 'Poppins-Bold', },
    total3Value: { width: responsiveWidth(89), height: responsiveHeight(15), backgroundColor: '#FFF', padding: 10, borderRadius: 15, elevation: 5, justifyContent: 'center', marginTop: responsiveHeight(2), alignSelf: 'center', marginBottom: 5 },
    couponText: { color: '#2D2D2D', fontFamily: 'Poppins-Bold', fontSize: responsiveFontSize(1.7), marginLeft: responsiveWidth(1) },
    callCouponButton: { position: 'absolute', right: 25, top: responsiveHeight(9) },
    callCouponText: { color: '#FF455C', fontFamily: 'Poppins-Bold', fontSize: responsiveFontSize(1.7), },
    callCouponText2: { position: 'absolute', right: 25, top: responsiveHeight(7), color: '#FF455C', fontFamily: 'Poppins-Bold', fontSize: responsiveFontSize(1.7), },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        margin: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Poppins-Medium',
        color: '#000',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginVertical: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    personText: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Regular',
        color: '#444',
    },
    price: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Poppins-Bold',
        color: '#FF3B5C',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    date: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Regular',
        color: '#999',
    },
    cancellationText: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-bold',
        color: '#28a745',
        fontWeight: 'bold',
        marginTop: 10,
    },
    productText3: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2.5),
        marginTop: responsiveHeight(1),
    },
    containerpricebreckdown: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        margin: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    label: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        color: '#000000',
    },
    value: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        color: '#868686',
    },
    bold: {
        fontWeight: 'bold',
    },
    red: {
        color: '#FF455C',
    },
    large: {
        fontSize: responsiveFontSize(2),
    },
    subText: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
        color: '#424242',
        marginBottom: 5,
        marginLeft: 10,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginVertical: 8,
    },
    cancelContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        margin: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    cancelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 7,
    },
    cancelHeader: {
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
    },
    cancelText: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.5),
        color: '#000000',
    },
    cancelBold: {
        fontWeight: 'bold',
    },
    cancelGreyText: {
        color: '#868686',
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(1.5),
    },
    termsView: {
        marginBottom: responsiveHeight(5),
        paddingHorizontal: 20,
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    termsText: {
        color: '#746868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
        textAlign: 'left',
    },
    checkboxContainer: {
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    },
    errorText: {
        color: '#FF0000',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    couponAppliedContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 10,
    },
    couponAppliedText: {
        color: '#28a745',
        fontSize: 14,
        fontWeight: 'bold',
    },
    removeCouponText: {
        color: '#FF0000',
        fontSize: 14,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
});