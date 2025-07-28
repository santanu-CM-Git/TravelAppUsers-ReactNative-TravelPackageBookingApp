import React, { useContext, useMemo, useState, useEffect, memo, useCallback, useRef } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    RefreshControl,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    StyleSheet,
    Alert,
    Dimensions,
    Pressable,
    BackHandler,
    Platform,
    TextInput,
    StatusBar,
    ImageBackground,
    KeyboardAwareScrollView,
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
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, filterImg, productImg, travelImg, likefillImg, mappinImg, starImg, arrowBackImg, shareImg, calendarImg, CheckImg, addnewImg, mybookingMenuImg, transactionMenuImg, arrowRightImg, cancelTourImg, timeImg } from '../../../utils/Images';
import Loader from '../../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../../components/CustomHeader';
import InputField from '../../../components/InputField';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import StarRating from 'react-native-star-rating-widget';
import SwitchSelector from "react-native-switch-selector";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/Entypo';
import RadioGroup from 'react-native-radio-buttons-group';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Toast from 'react-native-toast-message';
import { CountryPicker } from "react-native-country-codes-picker";

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function MyBookingDetails({ route }) {
    const navigation = useNavigation();
    const { bookingId: bookingData } = route.params;
    const carouselRef = useRef(null);
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { logout } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false)
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [isFilterModalVisible2, setFilterModalVisible2] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundData, setRefundData] = useState(null);

    const [firstname, setFirstname] = useState('');
    const [firstNameError, setFirstNameError] = useState('')

    const [phoneno, setPhoneno] = useState('');
    const [phoneError, setphoneError] = useState('')

    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState('+91');

    const [contacts, setContacts] = useState([]);

    const fetchCoTravelers = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.post(
                `${API_URL}/customer/co-traveller-list`,
                {
                    booking_id: bookingData.id
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log("Co-traveler list response:", response.data);

            if (response.data.response === true) {
                setContacts(response.data.data || []);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message || 'Failed to fetch co-travelers'
                });
            }
        } catch (error) {
            console.error('Error fetching co-travelers:', error);
            console.error('Error response:', error.response?.data);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to fetch co-travelers'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log(bookingData, 'boobking details response')
        fetchCoTravelers();
    }, []);

    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const toggleFilterModal2 = () => {
        setFilterModalVisible2(!isFilterModalVisible2);
    };

    const deleteCoTraveler = async (id) => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.post(
                `${API_URL}/customer/co-traveller-delete`,
                { id },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log("Delete response:", response.data);

            if (response.data.response === true) {
                // Fetch updated co-traveler list
                await fetchCoTravelers();

                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Co-traveler deleted successfully'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message || 'Failed to delete co-traveler'
                });
            }
        } catch (error) {
            console.error('Error deleting co-traveler:', error);
            console.error('Error response:', error.response?.data);

            let errorMessage = 'Failed to delete co-traveler';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const ContactItem = ({ name, country_code, phone, image, onRemove }) => {
        return (
            <View style={styles.contactContainer}>
                {/* <Image source={{ uri: image }} style={styles.contactAvatar} /> */}
                <Text style={styles.contactName}>{name}</Text>
                <Text style={styles.contactPhone}>{country_code} {phone}</Text>
                <TouchableOpacity onPress={onRemove} style={styles.contactCloseButton}>
                    <Text style={styles.contactCloseText}>×</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const changeFirstname = (text) => {
        setFirstname(text)
        if (text) {
            setFirstNameError('')
        } else {
            setFirstNameError('Please enter name.')
        }
    }

    const changePhoneno = (text) => {
        setPhoneno(text)
        if (text) {
            setphoneError('')
        } else {
            setphoneError('Please enter phone no.')
        }
    }

    const submitForFilter = async () => {
        if (!phoneno) {
            setphoneError('Please enter phone no');
            return;
        }
        if (!firstname) {
            setFirstNameError('Please enter name');
            return;
        }

        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const option = {
                booking_id: bookingData.id,
                name: firstname,
                country_code: countryCode,
                phone_no: phoneno
            }
            console.log("Request Payload:", option);
            console.log("API URL:", `${API_URL}/customer/co-traveller-add`);
            console.log("Token:", token);

            const response = await axios.post(
                `${API_URL}/customer/co-traveller-add`,
                option,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log("API Response:", response.data);

            if (response.data.response === true) {
                // Reset form
                setFirstname('');
                setPhoneno('');
                setFilterModalVisible(false);

                // Fetch updated co-traveler list
                await fetchCoTravelers();

                // Show success message
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Co-traveler added successfully'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message
                });
                setFilterModalVisible(false);
            }
        } catch (error) {
            console.error('Error adding co-traveler:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            let errorMessage = 'Failed to add co-traveler';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const submitCancellation = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.post(
                `${API_URL}/customer/refund-amount-get`,
                { booking_id: bookingData.id },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.data.response === true) {
                console.log(response.data, 'refund ammount response')
                setRefundData(response.data);
                setShowRefundModal(true);
                setFilterModalVisible2(false);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message || 'Failed to fetch cancelation'
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to fetch cancelation'
            });
        } finally {
            setIsLoading(false);
        }
    }

    const openInvoiceUrl = (url) => {
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    console.log("Don't know how to open URI: " + url);
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    const handleFinalCancellation = async () => {
        setIsLoading(true);
        try {
            const refund_condition = refundData.refund_percentage;
            const refund_amount = refundData.refund_amount;
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
            if (response.data.response === true) {
                setShowRefundModal(false);
                navigation.navigate('RefundScreen', { data: refundData, bookingData: bookingData, showModal: true });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message || 'Failed to process cancellation'
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to process cancellation'
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
        <SafeAreaView style={styles.Container}>
            {/* <CustomHeader commingFrom={'Top location'} onPressProfile={() => navigation.navigate('Profile')} title={'Top location'} /> */}
            <StatusBar translucent backgroundColor="transparent" />
            <ScrollView>
                <ImageBackground
                    source={{ uri: bookingData?.package?.cover_photo_url }}
                    style={styles.background}
                    imageStyle={styles.imageStyle}
                >
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: responsiveWidth(83.5) }}>
                            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                                <Image
                                    source={arrowBackImg}
                                    style={styles.filterIcon}
                                />
                            </TouchableOpacity>
                            <View style={styles.titleOverlay}>
                                <Text style={styles.titleM}>{bookingData?.package?.name}</Text>
                            </View>
                        </View>
                        {/* <TouchableOpacity style={styles.iconButton}>
                            <Image
                                source={shareImg}
                                style={styles.filterIcon}
                            />
                        </TouchableOpacity> */}
                    </View>

                    {/* Bottom Like Button */}
                    {/* <TouchableOpacity style={styles.likeButton}>
                        <Image
                            source={likefillImg}
                            style={styles.likeIcon}
                        />
                    </TouchableOpacity> */}
                </ImageBackground>

                <View style={{ margin: 5, paddingHorizontal: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.productText3}>{bookingData?.agent?.name}</Text>
                        <Text style={styles.priceText22}>₹{bookingData?.final_amount}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={mappinImg}
                            style={styles.pinImg}
                        />
                        <Text style={styles.addressText}>{bookingData?.package?.location}</Text>
                    </View>
                    {/* <Text style={styles.travelerText}>{bookingData?.customer?.full_name}</Text> */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.packageAvlTextMain}>{moment(bookingData?.start_date).format('DD MMMM YYYY')}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                source={timeImg}
                                style={styles.pinImg}
                            />
                            <Text style={styles.addressText}>
                                {(() => {
                                    const start = moment(bookingData?.start_date);
                                    const end = moment(bookingData?.end_date);
                                    const days = end.diff(start, 'days') + 1;
                                    const nights = days > 0 ? days - 1 : 0;
                                    return `${days} Days ${nights} Nights`;
                                })()}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: "center" }}>
                        <Text style={styles.packageAvlTextMain}>
                            Total Booked Slots : {Number(bookingData?.adult) + Number(bookingData?.children)}
                        </Text>
                    </View>
                    <View
                        style={{
                            borderBottomColor: '#686868',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            marginVertical: 7
                        }}
                    />
                    <Text style={styles.productText3}>Payment Details</Text>
                    <View style={styles.paymentcontainer}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Traveler Name :</Text>
                            <Text style={styles.value}>{bookingData?.customer?.full_name}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Transaction id :</Text>
                            <Text style={styles.value}>{bookingData?.transaction_no}</Text>
                        </View>

                        <View style={styles.amountRow}>
                            <Text style={styles.amountLabel}>Amount Paid :</Text>
                            <Text style={styles.amountValue}>₹{bookingData?.final_amount}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: responsiveHeight(1) }}>
                        <Text style={styles.productText3}>Co Traveler</Text>
                        <TouchableOpacity onPress={() => toggleFilterModal()}>
                            <Image
                                source={addnewImg}
                                style={styles.addnewIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.contactListContainer}>
                        {contacts.length > 0 ? (
                            contacts.map((contact) => (
                                <ContactItem
                                    key={contact.id}
                                    name={contact.name}
                                    country_code={contact.country_code}
                                    phone={contact.phone_no}
                                    onRemove={() => deleteCoTraveler(contact.id)}
                                />
                            ))
                        ) : (
                            <Text style={styles.noContactsText}>No co-travelers added yet</Text>
                        )}
                    </View>
                    <View style={styles.invoiceContainer}>
                        <TouchableOpacity style={styles.invoiceItem} onPress={() => navigation.navigate('Menu', { screen: 'PackageDetailsScreen', params: { packageId: bookingData.package.id }, key: Math.random().toString() })}>
                            <Text style={styles.invoiceText}>View Detail</Text>
                            <Image
                                source={arrowRightImg}
                                style={styles.arrowIcon}
                            />
                        </TouchableOpacity>
                        <View style={styles.invoiceDivider} />
                        <TouchableOpacity style={styles.invoiceItem} onPress={() => openInvoiceUrl(bookingData?.invoice_url)}>
                            <Text style={styles.invoiceText}>Download Invoice</Text>
                            <Image
                                source={arrowRightImg}
                                style={styles.arrowIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttoncontainer}>
                        <TouchableOpacity style={styles.talkToAgentButton} onPress={() => toggleFilterModal2()}>
                            <Text style={styles.talkToAgentText}>Cancel Package</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            {/* add new cotraveler modal */}
            <Modal
                isVisible={isFilterModalVisible}
                // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
                <View style={{ height: '55%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <View style={{ padding: 0 }}>
                        <View style={{ paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Add New Co Traveler</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                <Icon name="cross" size={20} color="#000000" onPress={toggleFilterModal} />
                            </View>
                        </View>
                    </View>
                    <ScrollView style={{ marginBottom: responsiveHeight(0) }}>
                        <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 0, paddingHorizontal: 15, marginBottom: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.textinputheader}>Phone No</Text>
                                <Text style={styles.requiredheader}>*</Text>
                            </View>
                            {/* {phoneError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{phoneError}</Text> : <></>}
                            <View style={styles.inputView}>
                                <InputField
                                    label={'Enter your Phone number'}
                                    keyboardType=" "
                                    value={phoneno}
                                    //helperText={'Please enter lastname'}
                                    inputType={'others'}
                                    onChangeText={(text) => changePhoneno(text)}
                                />
                            </View> */}
                            {phoneError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{phoneError}</Text> : <></>}
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
                                    label={'Enter your Phone number'}
                                    keyboardType="numeric"
                                    value={phoneno}
                                    inputType={'login'}
                                    onChangeText={(text) => changePhoneno(text)}
                                />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.textinputheader}>Name</Text>
                                <Text style={styles.requiredheader}>*</Text>
                            </View>
                            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{firstNameError}</Text> : <></>}
                            <View style={styles.inputView}>
                                <InputField
                                    label={'Enter your Name'}
                                    keyboardType=" "
                                    value={firstname}
                                    //helperText={'Please enter lastname'}
                                    inputType={'others'}
                                    onChangeText={(text) => changeFirstname(text)}
                                />
                            </View>
                        </View>
                        <View style={{ bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                            <CustomButton label={"Save"}
                                onPress={() => submitForFilter()}
                            />
                        </View>
                    </View>
                    </ScrollView>
                    
                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>
            {/* add new cotraveler modal */}
            <Modal
                isVisible={isFilterModalVisible2}
                style={{
                    margin: 0,
                    justifyContent: 'flex-end',
                }}>
                <View style={{ height: '55%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <View style={{ padding: 0 }}>
                        <View style={{ paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Cancel Tour</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                <Icon name="cross" size={20} color="#000000" onPress={toggleFilterModal2} />
                            </View>
                        </View>
                    </View>
                    <ScrollView style={{ marginBottom: responsiveHeight(0) }}>
                        <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 0, paddingHorizontal: 15, marginBottom: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                source={cancelTourImg}
                                style={styles.cancelTourIcon}
                            />
                            <Text style={styles.cancelText}>Are you sure you want to cancel this tour ?</Text>
                        </View>
                    </ScrollView>
                    <View style={{ bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                            <CustomButton label={"Cancel Tour"}
                                onPress={submitCancellation}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            {/* RefundScreen-style modal, only after API call */}
            <Modal
                isVisible={showRefundModal}
                style={{
                    margin: 0,
                    justifyContent: 'flex-end',
                }}>
                <View style={{ height: '40%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                <View style={{ padding: 0 }}>
                        <View style={{ paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(0), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Cancel Tour</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                <Icon name="cross" size={20} color="#000000" onPress={() => setShowRefundModal(false)} />
                            </View>
                        </View>
                    </View>
                    <ScrollView>
                        <View style={{ padding: 16, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.unsuccessfullbookingText}>Refund of ₹{refundData?.refund_amount} processed</Text>
                            <Text style={styles.unsuccessfullbookingValue}>You are going to cancel all traveler(s)</Text>
                        </View>
                        <View style={styles.cardcontainer}>
                            {/* Booking Amount */}
                            <View style={styles.amountContainer}>
                                <Text style={styles.amountLabel}>Refundable Amount</Text>
                                <Text style={styles.amountValue}>₹{refundData?.refund_amount}</Text>
                            </View>
                            <View
                                style={{
                                    borderBottomColor: '#E0E0E0',
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                    marginVertical: 5
                                }}
                            />
                            
                        </View>
                    </ScrollView>
                    <View style={{ bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                            <CustomButton label={"Confirm cancellation"}
                                onPress={handleFinalCancellation}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        //paddingTop: responsiveHeight(1),
    },
    background: {
        width: '100%',
        height: 300,  // Adjust height as needed
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        marginTop: -responsiveHeight(0.5)
    },
    imageStyle: {
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    header: {
        position: 'absolute',
        top: 35,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleM: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2.5),
        color: '#FFFFFF',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    likeButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    likeIcon: {
        height: 22,
        width: 22,
        resizeMode: 'contain'
    },
    filterIcon: {
        height: 32,
        width: 32,
        resizeMode: 'contain'
    },
    productText3: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2.5),
        marginTop: responsiveHeight(1),
    },
    pinImg: {
        height: 12,
        width: 12,
        resizeMode: 'contain',
        marginRight: 5
    },
    addressText: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
    },
    packageAvlTextMain: {
        color: '#2A2A2A',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.4),
    },
    rateingView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    staricon: {
        height: 15,
        width: 15,
        resizeMode: 'contain'
    },
    ratingText: {
        fontSize: responsiveFontSize(1.5),
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 5
    },
    travelerText: {
        color: '#FF455C',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.6),
    },
    priceText22: {
        color: '#FF455C',
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2.5),
    },
    /* tab section */
    tabView: {
        //paddingHorizontal: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        //justifyContent: 'space-around',
        marginVertical: responsiveHeight(2),
        // width: responsiveWidth(92)
    },
    tab: {
        // paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderColor: '#FF455C',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: responsiveHeight(5),
        // width: responsiveWidth(28),
        marginRight: responsiveWidth(2)
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
    contentContainer: {
        flex: 1,
        //paddingHorizontal: 10,
        paddingVertical: 10,
    },
    /* tab section */
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
    totalValue4: {
        width: responsiveWidth(45),
        height: responsiveHeight(35),
        //alignItems: 'center',
        backgroundColor: '#fff',
        //justifyContent: 'center',
        padding: 5,
        borderRadius: 15,
        elevation: 5,
        margin: 2,
        marginBottom: responsiveHeight(2),
        marginRight: 5
    },
    productImg4: {
        height: responsiveHeight(16),
        width: responsiveFontSize(21),
        resizeMode: 'cover',
        borderRadius: 15,
        alignSelf: 'center'
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
    userInfo: {
        flex: 1,
        marginLeft: 10,
    },
    name: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(1.6),
        color: '#000000'
    },
    date: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
        color: '#000000'
    },
    rating: {
        flexDirection: 'row',
    },
    buttoncontainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    talkToAgentButton: {
        borderWidth: 2,
        borderColor: '#FF3B5C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: responsiveWidth(92),
        justifyContent: 'center',
        alignItems: 'center'
    },
    talkToAgentText: {
        color: '#FF3B5C',
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    paymentcontainer: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
        marginVertical: responsiveHeight(1)
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    label: {
        color: "#8C8C8C",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    value: {
        color: "#1B2234",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    amountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    amountLabel: {
        color: "#8C8C8C",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
    },
    amountValue: {
        color: "#FF455C",
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
    },
    addnewIcon: {
        height: responsiveHeight(4),
        width: responsiveWidth(25),
        resizeMode: 'contain'
    },
    contactListContainer: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    contactContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    contactAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    contactName: {
        flex: 1,
        color: "#FF455C",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    contactPhone: {
        color: "#1B2234",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        marginRight: 10,
    },
    contactCloseButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eee",
    },
    contactCloseText: {
        fontSize: 18,
        color: "#333",
    },
    invoiceContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        marginVertical: responsiveHeight(1)
    },
    invoiceItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
    invoiceText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    invoiceDivider: {
        height: 1,
        backgroundColor: "#ddd",
        marginHorizontal: 5,
    },
    arrowIcon: {
        height: 25,
        width: 25,
        resizeMode: 'contain',
    },
    textinputheader: {
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
    inputView: {
        alignSelf: 'center'
    },
    cancelTourIcon: {
        height: 90,
        width: 90,
        resizeMode: 'contain',
        marginTop: responsiveHeight(5)
    },
    cancelText: {
        fontSize: responsiveFontSize(2),
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        marginTop: responsiveHeight(5)
    },
    noContactsText: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
        textAlign: 'center',
        paddingVertical: 20
    },
    textinputview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        //marginBottom: responsiveHeight(1)
    },
    countryModal: {

    },
    countryInputView: {
        height: responsiveHeight(6),
        width: responsiveWidth(17),
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
        marginTop: -responsiveHeight(2)
    },
    titleOverlay: {
        backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent black
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginLeft: responsiveWidth(2),
    },
    unsuccessfullbookingText: {
        fontSize: responsiveFontSize(2),
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        marginTop: responsiveHeight(1)
    },
    unsuccessfullbookingValue: {
        fontSize: responsiveFontSize(2),
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        marginTop: responsiveHeight(1)
    },
    cardcontainer: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    amountContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    timeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircleRed: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FF455C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumber: {
        fontSize: responsiveFontSize(1.5),
        color: '#FFFFFF',
        fontFamily: 'Poppins-Bold',
    },
    verticalLine: {
        width: 1,
        height: 40,
        backgroundColor: '#E0E0E0',
    },
    stepContent: {
        marginLeft: 10,
    },
    stepTitle: {
        fontSize: responsiveFontSize(1.7),
        color: '#333',
        fontFamily: 'Poppins-SemiBold',
    },
    stepTime: {
        fontSize: responsiveFontSize(1.5),
        color: '#686868',
        fontFamily: 'Poppins-Regular',
    },
    messageBox: {
        backgroundColor: '#F0F0F0',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    messageText: {
        fontSize: responsiveFontSize(1.5),
        color: '#686868',
        fontFamily: 'Poppins-Regular',
    },
});